#!/usr/bin/env node
// saju 지식 위키 — 기계적 lint.
//
// 에러 (exit 1):
//   - 타입별 필수 frontmatter 누락 / 알 수 없는 type
//   - 잘못된 status enum (결정 enum vs 지식 enum 혼용)
//   - ID 형식 위반(DEC-####/ANL-####)·템플릿 placeholder(-0000)·중복 ID
//   - domain 이 wiki/CLAUDE.md 의 domain enum 에 없음
//   - source 의 category 가 실제 상위 폴더명과 불일치
//   - 깨진 [[wikilink]] (본문 + frontmatter 링크 필드)
//   - 결정으로 안 이어진 분석: status=active 인데 informed_decisions 없음
//   - 불변성 위반: HEAD 에서 accepted 였던 결정의 본문(순수 append 제외) 또는
//     허용 외 frontmatter(status/superseded_by/updated/last_verified 외)가 변경됨
//     → 오타/링크/회고 수정 승인 시 --allow-edit=<slug> 로 해당 문서만 예외
//   - index/decisions-index/llms.txt drift (build-index 결과와 불일치)
//   - 고아 결정(accepted 인데 sources 없음) — 아래 심각도 설정이 error 일 때
//
// 경고 (exit 0):
//   - 고아 결정 — 심각도 설정이 warn 일 때
//   - 고아 페이지(들어오는 링크 없음, guide/note/canonical 제외)
//   - stale: last_verified + review_interval 만료, 또는 active analysis/concept 의 updated>90일
//   - 결정에 y_statement 없음
//
// Flags:
//   --report              GFM 리포트를 stdout 으로 (에러 있으면 여전히 exit 1)
//   --allow-edit          모든 accepted 결정의 동결 검사 건너뜀
//   --allow-edit=<slug>   해당 문서만 건너뜀 (반복 지정 가능, 권장)

import { readdir, readFile } from "node:fs/promises";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { parseFrontmatter, generateOutputs } from "./build-index.mjs";

const WIKI_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PAGES_DIR = join(WIKI_ROOT, "pages");
const SOURCES_DIR = join(WIKI_ROOT, "sources");

// accepted 결정에 sources 가 없을 때의 심각도. 스캐폴드 시 결정: 팀 레포 "error" / 1인 레포 "warn"
const ORPHAN_DECISION_SEVERITY = "warn";

const KNOWLEDGE_TYPES = ["analysis", "principle", "concept", "guide", "note"];
const REQUIRED_BY_TYPE = {
  decision: ["id", "type", "title", "status", "domain", "owner", "created"],
  analysis: ["id", "type", "subtype", "title", "status", "domain", "owner", "created"],
  principle: ["type", "title", "status", "owner", "created"],
  concept: ["type", "title", "status", "created"],
  guide: ["type", "title", "status", "created"],
  note: ["type", "title", "created"], // 가장 가벼운 타입 — 부담 없이 쌓는 용도
};
const SOURCE_REQUIRED = ["title", "type", "category", "url", "author", "created"];
const DECISION_STATUS = ["proposed", "accepted", "superseded", "deprecated", "rejected"];
const KNOWLEDGE_STATUS = ["draft", "active", "stale", "archived"];
const SOURCE_STATUS = ["active", "superseded"];
const LINK_FIELDS = ["sources", "supersedes", "superseded_by", "informed_decisions", "related"];
const OPEN_DECISIONS_SLUG = "pages/decisions/open-decisions"; // 분석 informed_decisions 가 가리켜도 되는 백로그
const ID_RULES = { decision: { re: /^DEC-\d{4}$/, placeholder: "DEC-0000" }, analysis: { re: /^ANL-\d{4}$/, placeholder: "ANL-0000" } };
// accepted 이후에도 바꿀 수 있는 frontmatter 필드 (그 외 변경 = 불변성 위반)
const MUTABLE_DECISION_FIELDS = new Set(["status", "superseded_by", "updated", "last_verified"]);
const STALE_DAYS = 90;
const STALE_FALLBACK_TYPES = ["analysis", "concept"]; // guide/principle/note 는 updated 기반 stale 제외
const WIKILINK_RE = /\[\[([^\]]+)\]\]/g;

const NOW = new Date();

async function walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(full);
  }
  return files;
}

function daysBetween(isoDate) {
  const d = new Date(isoDate + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((NOW - d) / 86400000);
}

function parseInterval(s) {
  const m = /^(\d+)d$/.exec((s || "").trim());
  return m ? Number(m[1]) : null;
}

function stripCode(body) {
  return body
    .replace(/<!--[\s\S]*?-->/g, "") // HTML 주석 안의 예시 링크는 무시
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`\n]*`/g, "");
}

function linksIn(text) {
  const out = [];
  for (const m of stripCode(text).matchAll(WIKILINK_RE)) {
    const head = m[1].split(/\\?\|/)[0];
    const target = head.split("#")[0].replace(/\\+$/, "").trim();
    if (target) out.push(target);
  }
  return out;
}

// 본문 + frontmatter 링크 필드에서 [[wikilink]] 대상 수집
function allLinks(doc) {
  const out = linksIn(doc.body);
  for (const f of LINK_FIELDS) {
    const v = doc.data[f];
    if (Array.isArray(v)) for (const item of v) out.push(...linksIn(String(item)));
  }
  return out;
}

// wiki/CLAUDE.md 의 "### 도메인(domain) enum" 표에서 유효 domain 집합을 읽는다.
// 표를 찾지 못하면 null (= 검사 생략).
async function loadDomainEnum() {
  try {
    const text = await readFile(join(WIKI_ROOT, "CLAUDE.md"), "utf8");
    const sec = text.split(/^###\s*도메인\(domain\) enum\s*$/m)[1];
    if (!sec) return null;
    const table = sec.split(/^#{2,3}\s/m)[0];
    const domains = [...table.matchAll(/^\|\s*`([a-z0-9-]+)`/gm)].map((m) => m[1]);
    return domains.length ? new Set(domains) : null;
  } catch {
    return null;
  }
}

let TOPLEVEL = null;
try {
  TOPLEVEL = execFileSync("git", ["rev-parse", "--show-toplevel"], {
    cwd: WIKI_ROOT,
    stdio: ["ignore", "pipe", "ignore"],
  })
    .toString()
    .trim();
} catch {
  TOPLEVEL = null;
}

function committedDoc(absPath) {
  if (!TOPLEVEL) return null;
  const gitRel = relative(TOPLEVEL, absPath).split("\\").join("/");
  try {
    const content = execFileSync("git", ["show", `HEAD:${gitRel}`], {
      cwd: TOPLEVEL,
      stdio: ["ignore", "pipe", "ignore"],
    }).toString();
    return parseFrontmatter(content);
  } catch {
    return null; // HEAD 없음(커밋 전) 또는 신규 파일 → 검사 대상 아님
  }
}

async function collect() {
  const all = [...(await walk(PAGES_DIR)), ...(await walk(SOURCES_DIR))];
  const docs = [];
  for (const path of all) {
    const rel = relative(WIKI_ROOT, path).split("\\").join("/");
    const content = await readFile(path, "utf8");
    const { data, body } = parseFrontmatter(content);
    docs.push({
      path,
      rel,
      data,
      body,
      isPage: path.startsWith(PAGES_DIR),
      isSource: path.startsWith(SOURCES_DIR),
      slug: rel.replace(/\.md$/, ""),
    });
  }
  return docs;
}

function isEmpty(v) {
  return v === undefined || v === "" || (Array.isArray(v) && v.length === 0);
}

// HEAD 에서 accepted 였던 결정의 동결 위반을 찾는다. 위반 사유 배열을 반환.
function immutableViolations(doc) {
  const old = committedDoc(doc.path);
  if (!old || old.data.status !== "accepted") return []; // 커밋 전이거나, HEAD 에선 아직 미확정 → 자유
  const reasons = [];
  const a = old.body.trim();
  const b = doc.body.trim();
  if (a !== b && !b.startsWith(a)) reasons.push("본문 변경(순수 append 아님)");
  const keys = new Set([...Object.keys(old.data), ...Object.keys(doc.data)]);
  const changed = [...keys].filter(
    (k) => !MUTABLE_DECISION_FIELDS.has(k) && JSON.stringify(old.data[k]) !== JSON.stringify(doc.data[k]),
  );
  if (changed.length) reasons.push(`frontmatter 변경: ${changed.join(", ")}`);
  return reasons;
}

async function lint({ allowEditAll, allowEditSlugs }) {
  const docs = await collect();
  const domainEnum = await loadDomainEnum();
  const errors = {
    frontmatter: [],
    status: [],
    badId: [],
    dupId: [],
    badDomain: [],
    badCategory: [],
    brokenLinks: [],
    orphanDecision: [],
    danglingAnalysis: [],
    badInformedTarget: [],
    immutable: [],
    indexDrift: [],
  };
  const warnings = { orphanDecision: [], orphans: [], stale: [], missingYStatement: [] };

  const slugSet = new Set(docs.map((d) => d.slug));
  const slugToType = new Map(docs.map((d) => [d.slug, d.data.type]));
  const inbound = new Map(docs.map((d) => [d.slug, 0]));
  const idOwners = new Map(); // id → [rel, ...]

  for (const doc of docs) {
    const { data } = doc;
    const type = data.type;

    // 필수 frontmatter
    const required = doc.isSource ? SOURCE_REQUIRED : REQUIRED_BY_TYPE[type] || null;
    if (doc.isPage && !required) {
      errors.frontmatter.push({ rel: doc.rel, missing: [`unknown type "${type || "(없음)"}"`] });
    } else {
      const missing = required.filter((k) => !(k in data));
      if (missing.length) errors.frontmatter.push({ rel: doc.rel, missing });
    }

    // status enum
    if (data.status) {
      const ok = doc.isSource
        ? SOURCE_STATUS.includes(data.status)
        : type === "decision"
          ? DECISION_STATUS.includes(data.status)
          : KNOWLEDGE_TYPES.includes(type)
            ? KNOWLEDGE_STATUS.includes(data.status)
            : true;
      if (!ok) errors.status.push({ rel: doc.rel, status: data.status, type });
    }

    // ID 형식·placeholder·중복 (인용 앵커의 무결성)
    if (doc.isPage && ID_RULES[type] && data.id) {
      const { re, placeholder } = ID_RULES[type];
      if (!re.test(data.id)) {
        errors.badId.push({ rel: doc.rel, id: data.id, hint: `${placeholder.slice(0, 4)}#### 형식이어야 함` });
      } else if (data.id === placeholder) {
        errors.badId.push({ rel: doc.rel, id: data.id, hint: "템플릿 placeholder — 실제 번호를 부여할 것 (new.mjs 권장)" });
      } else {
        if (!idOwners.has(data.id)) idOwners.set(data.id, []);
        idOwners.get(data.id).push(doc.rel);
      }
    }

    // domain enum (wiki/CLAUDE.md 표 기준; 표를 못 읽으면 생략)
    if (domainEnum && doc.isPage && data.domain && !domainEnum.has(data.domain)) {
      errors.badDomain.push({ rel: doc.rel, domain: data.domain });
    }

    // source: category ↔ 상위 폴더명 일치
    if (doc.isSource && data.category) {
      const folder = basename(dirname(doc.path));
      if (folder !== data.category && folder !== "sources") {
        errors.badCategory.push({ rel: doc.rel, category: data.category, folder });
      }
    }

    // 결정 전용 규칙
    if (doc.isPage && type === "decision") {
      if (data.status === "accepted" && isEmpty(data.sources)) {
        (ORPHAN_DECISION_SEVERITY === "warn" ? warnings : errors).orphanDecision.push({ rel: doc.rel });
      }
      if (isEmpty(data.y_statement)) warnings.missingYStatement.push(doc.rel);
      const skipFreeze = allowEditAll || allowEditSlugs.has(doc.slug) || allowEditSlugs.has(doc.rel);
      if (!skipFreeze) {
        for (const reason of immutableViolations(doc)) errors.immutable.push({ rel: doc.rel, reason });
      }
    }

    // 분석 전용 규칙: active 분석의 informed_decisions 는 (a) 비어있지 않고 (b) 결정 또는 open-decisions(백로그) 를 가리켜야 함
    if (doc.isPage && type === "analysis" && data.status === "active") {
      if (isEmpty(data.informed_decisions)) {
        errors.danglingAnalysis.push({ rel: doc.rel });
      } else {
        const targets = (Array.isArray(data.informed_decisions) ? data.informed_decisions : []).flatMap((v) =>
          linksIn(String(v)),
        );
        for (const t of targets) {
          if (!slugSet.has(t)) continue; // 없는 링크는 brokenLinks 가 잡음
          if (t === OPEN_DECISIONS_SLUG) continue; // 백로그 허용
          if (slugToType.get(t) !== "decision") errors.badInformedTarget.push({ rel: doc.rel, target: t });
        }
      }
    }

    // stale — 명시적 last_verified+review_interval 은 모든 지식 타입, updated 폴백은 analysis/concept 만
    if (doc.isPage && KNOWLEDGE_TYPES.includes(type)) {
      if (data.last_verified && data.review_interval) {
        const days = daysBetween(data.last_verified);
        const iv = parseInterval(data.review_interval);
        if (days != null && iv != null && days > iv) {
          warnings.stale.push({ rel: doc.rel, since: data.last_verified, days });
        }
      } else if (STALE_FALLBACK_TYPES.includes(type) && data.status === "active" && data.updated) {
        const days = daysBetween(data.updated);
        if (days != null && days > STALE_DAYS) {
          warnings.stale.push({ rel: doc.rel, since: data.updated, days });
        }
      }
    }

    // 링크(본문 + frontmatter)
    for (const target of allLinks(doc)) {
      if (slugSet.has(target)) {
        if (target !== doc.slug) inbound.set(target, inbound.get(target) + 1);
      } else {
        errors.brokenLinks.push({ rel: doc.rel, target });
      }
    }
  }

  // 중복 ID
  for (const [id, rels] of idOwners) {
    if (rels.length > 1) errors.dupId.push({ id, rels });
  }

  // 고아 페이지(guide/note/canonical 은 제외 — 진입점이거나 링크 의무가 없는 타입)
  for (const doc of docs) {
    if (!doc.isPage) continue;
    if (["guide", "note"].includes(doc.data.type) || doc.data.canonical === "true") continue;
    if (inbound.get(doc.slug) === 0) warnings.orphans.push(doc.rel);
  }

  // index/llms.txt drift — build-index 계산 결과와 디스크 비교
  const { outputs } = await generateOutputs();
  for (const o of outputs) {
    let existing = "";
    try {
      existing = await readFile(o.path, "utf8");
    } catch {}
    if (existing.trim() !== o.content.trim()) {
      errors.indexDrift.push({ rel: relative(WIKI_ROOT, o.path).split("\\").join("/") });
    }
  }

  return { errors, warnings, totalDocs: docs.length };
}

function countErrors(e) {
  return Object.values(e).reduce((n, arr) => n + arr.length, 0);
}
function countWarnings(w) {
  return Object.values(w).reduce((n, arr) => n + arr.length, 0);
}

function formatReport({ errors, warnings, totalDocs }) {
  const now = NOW.toISOString().slice(0, 10);
  const ec = countErrors(errors);
  const wc = countWarnings(warnings);
  const L = [`# Wiki Lint Report — ${now}`, "", `- 총 문서: ${totalDocs}`, `- 에러: ${ec}`, `- 경고: ${wc}`, ""];

  if (ec === 0 && wc === 0) {
    L.push("✅ 발견된 문제 없음.");
    return L.join("\n") + "\n";
  }

  const sec = (title, rows) => {
    if (rows.length) L.push(`### ${title}`, "", ...rows, "");
  };

  if (ec > 0) {
    L.push(`## ❌ Errors (${ec})`, "");
    sec("필수 frontmatter 누락", errors.frontmatter.map((x) => `- \`${x.rel}\`: ${x.missing.join(", ")} 누락`));
    sec("잘못된 status", errors.status.map((x) => `- \`${x.rel}\`: status="${x.status}" (type=${x.type})`));
    sec("잘못된 ID", errors.badId.map((x) => `- \`${x.rel}\`: id="${x.id}" — ${x.hint}`));
    sec("중복 ID", errors.dupId.map((x) => `- \`${x.id}\`: ${x.rels.map((r) => `\`${r}\``).join(", ")}`));
    sec("domain enum 위반 (wiki/CLAUDE.md 표 참고)", errors.badDomain.map((x) => `- \`${x.rel}\`: domain="${x.domain}"`));
    sec("source category ↔ 폴더 불일치", errors.badCategory.map((x) => `- \`${x.rel}\`: category="${x.category}" ≠ 폴더 "${x.folder}"`));
    sec("깨진 wikilink", errors.brokenLinks.map((x) => `- \`${x.rel}\` → \`[[${x.target}]]\` (파일 없음)`));
    sec("고아 결정 (accepted 인데 sources 없음)", errors.orphanDecision.map((x) => `- \`${x.rel}\``));
    sec("결정으로 안 이어진 분석 (active 인데 informed_decisions 없음)", errors.danglingAnalysis.map((x) => `- \`${x.rel}\``));
    sec("informed_decisions 잘못된 대상 (결정/open-decisions 아님)", errors.badInformedTarget.map((x) => `- \`${x.rel}\` → \`[[${x.target}]]\``));
    sec("불변성 위반 (HEAD 에서 accepted 였던 결정)", errors.immutable.map((x) => `- \`${x.rel}\` — ${x.reason}. 내용 변경이면 대체(supersede), 오타/회고면 --allow-edit=<slug>`));
    sec("index drift (생성물이 최신 아님)", errors.indexDrift.map((x) => `- \`${x.rel}\` — \`node scripts/build-index.mjs\` 로 재생성 후 커밋`));
  }

  if (wc > 0) {
    L.push(`## ⚠️ Warnings (${wc})`, "");
    sec("고아 결정 (accepted 인데 sources 없음 — 생 URL이라도 링크 섹션에 남길 것)", warnings.orphanDecision.map((x) => `- \`${x.rel}\``));
    sec("고아 페이지 (들어오는 링크 없음)", warnings.orphans.map((r) => `- \`${r}\``));
    sec("Stale 페이지", warnings.stale.map((x) => `- \`${x.rel}\` — ${x.since} (${x.days}일 전)`));
    sec("결정에 y_statement 없음 (권장)", warnings.missingYStatement.map((r) => `- \`${r}\``));
  }

  return L.join("\n").trimEnd() + "\n";
}

async function main() {
  const args = process.argv.slice(2);
  const asReport = args.includes("--report");
  const allowEditAll = args.includes("--allow-edit");
  const allowEditSlugs = new Set(
    args
      .filter((a) => a.startsWith("--allow-edit="))
      .map((a) => a.slice("--allow-edit=".length).replace(/\.md$/, "")),
  );
  const result = await lint({ allowEditAll, allowEditSlugs });
  const ec = countErrors(result.errors);
  const wc = countWarnings(result.warnings);

  if (asReport) {
    process.stdout.write(formatReport(result));
  } else {
    console.log(`✓ Lint 완료 — ${result.totalDocs} 문서, 에러 ${ec}, 경고 ${wc}`);
    if (ec + wc > 0) console.log("\n" + formatReport(result));
  }
  if (ec > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
