#!/usr/bin/env node
// saju 지식 위키 — frontmatter 로부터 카탈로그 3종을 자동 생성한다.
//   - index.md            : pages/ 를 type별로
//   - decisions-index.md  : 결정을 status별로 (현행 vs 역사)
//   - llms.txt            : 에이전트 진입점 (llms.txt 관습)
// 이 파일들을 직접 편집하지 말 것 — `node scripts/build-index.mjs` 로 재생성한다.
//
// Flags:
//   --check   생성 결과가 기존 파일과 다르면 exit 1 (CI drift 검사용)
//
// description 우선순위: frontmatter description → y_statement → H1 다음 첫 문단

import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WIKI_ROOT = join(__dirname, "..");
const PAGES_DIR = join(WIKI_ROOT, "pages");
const SOURCES_DIR = join(WIKI_ROOT, "sources");
const INDEX_PATH = join(WIKI_ROOT, "index.md");
const DECISIONS_INDEX_PATH = join(WIKI_ROOT, "decisions-index.md");
const LLMS_PATH = join(WIKI_ROOT, "llms.txt");

const TYPE_ORDER = ["decision", "analysis", "principle", "concept", "guide", "note"];
const TYPE_HEADINGS = {
  decision: "Decisions",
  analysis: "Analysis",
  principle: "Principles",
  concept: "Concepts",
  guide: "Guides",
  note: "Notes",
};
const DECISION_STATUS_ORDER = ["accepted", "proposed", "superseded", "deprecated", "rejected"];
const DEC_STATUS_HEADING = {
  accepted: "Accepted (현행)",
  proposed: "Proposed (논의 중)",
  superseded: "Superseded (대체됨)",
  deprecated: "Deprecated (폐기)",
  rejected: "Rejected (기각)",
};

const DESC_MAX_LEN = 80;
const AUTOGEN_MARKER =
  "<!-- 이 파일은 scripts/build-index.mjs 가 자동 생성합니다. 직접 편집하지 마세요. -->";

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

function stripQuotes(s) {
  return s.replace(/^['"]|['"]$/g, "");
}

function stripInlineComment(v) {
  const q = v[0];
  if (q === "'" || q === '"') {
    // 따옴표 값: 닫는 따옴표까지가 값, 그 뒤(주석 포함)는 버린다
    const close = v.indexOf(q, 1);
    return close >= 0 ? v.slice(0, close + 1) : v;
  }
  const c = v.indexOf(" #");
  return c >= 0 ? v.slice(0, c).trim() : v;
}

function parseInlineArray(v) {
  const inner = v.slice(1, -1).trim();
  if (!inner) return [];
  return inner
    .split(",")
    .map((s) => stripQuotes(s.trim()))
    .filter(Boolean);
}

export function parseFrontmatter(content) {
  if (!content.startsWith("---\n")) return { data: {}, body: content };
  const end = content.indexOf("\n---", 4);
  if (end === -1) return { data: {}, body: content };
  const raw = content.slice(4, end);
  const body = content.slice(end + 4).replace(/^\r?\n/, "");

  const data = {};
  let listTarget = null;
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) {
      const [, key, rawValue] = kv;
      const value = rawValue.trim();
      if (value === "") {
        data[key] = [];
        listTarget = data[key];
      } else {
        const bare = stripInlineComment(value);
        if (bare.startsWith("[") && bare.endsWith("]")) {
          data[key] = parseInlineArray(bare);
        } else {
          data[key] = stripQuotes(bare);
        }
        listTarget = null;
      }
    } else if (listTarget && /^\s*-\s+/.test(line)) {
      listTarget.push(stripQuotes(line.replace(/^\s*-\s+/, "").trim()));
    }
  }
  return { data, body };
}

function firstParagraph(body) {
  body = body.replace(/<!--[\s\S]*?-->/g, ""); // HTML 주석 블록 제외 (설명 오염 방지)
  const chunks = [];
  let collecting = false;
  for (const line of body.split("\n")) {
    if (/^#/.test(line)) {
      if (collecting) break;
      continue;
    }
    if (/^<!--/.test(line.trim())) continue;
    if (!line.trim()) {
      if (collecting) break;
      continue;
    }
    chunks.push(line.trim());
    collecting = true;
  }
  return chunks.join(" ");
}

function truncate(s, max = DESC_MAX_LEN) {
  if (!s) return "";
  return s.length <= max ? s : s.slice(0, max - 1).trimEnd() + "…";
}

async function collectDocs() {
  const files = [...(await walk(PAGES_DIR)), ...(await walk(SOURCES_DIR))].sort();
  const docs = [];
  const warnings = [];
  for (const file of files) {
    const rel = relative(WIKI_ROOT, file).split("\\").join("/");
    const { data, body } = parseFrontmatter(await readFile(file, "utf8"));
    if (!data.type) {
      warnings.push(`missing frontmatter.type: ${rel}`);
      continue;
    }
    const description = data.description
      ? stripQuotes(data.description)
      : data.y_statement
        ? stripQuotes(data.y_statement)
        : truncate(firstParagraph(body));
    docs.push({
      rel,
      wikilink: rel.replace(/\.md$/, ""),
      type: data.type,
      status: data.status || "",
      id: data.id || "",
      title: data.title || "",
      description,
      updated: data.updated || data.created || "",
      isSource: file.startsWith(SOURCES_DIR),
    });
  }
  return { docs, warnings };
}

function buildIndex(docs) {
  const pages = docs.filter((d) => !d.isSource && TYPE_ORDER.includes(d.type));
  const groups = Object.fromEntries(TYPE_ORDER.map((t) => [t, []]));
  let latest = "0000-00-00";
  for (const p of pages) {
    groups[p.type].push(p);
    if (p.updated && p.updated > latest) latest = p.updated;
  }
  const lines = ["# saju 지식 위키 — 카탈로그", "", AUTOGEN_MARKER];
  for (const type of TYPE_ORDER) {
    const items = groups[type];
    if (!items.length) continue;
    lines.push("", `## ${TYPE_HEADINGS[type]}`, "");
    items.sort((a, b) => a.wikilink.localeCompare(b.wikilink));
    for (const item of items) {
      lines.push(`- [[${item.wikilink}]]${item.description ? ` — ${item.description}` : ""}`);
    }
  }
  lines.push("", `> 마지막 갱신: ${latest} | 총 페이지: ${pages.length}`, "");
  return lines.join("\n");
}

function buildDecisionsIndex(docs) {
  const decisions = docs.filter((d) => d.type === "decision");
  const lines = ["# 결정 인덱스 (status별)", "", AUTOGEN_MARKER];
  for (const st of DECISION_STATUS_ORDER) {
    const items = decisions.filter((d) => d.status === st).sort((a, b) => a.id.localeCompare(b.id));
    if (!items.length) continue;
    lines.push("", `## ${DEC_STATUS_HEADING[st]}`, "");
    for (const d of items) {
      lines.push(`- **${d.id}** [[${d.wikilink}]]${d.description ? ` — ${d.description}` : ""}`);
    }
  }
  if (!decisions.length) {
    lines.push("", "_(아직 결정 없음 — 후보는 백로그 `pages/decisions/open-decisions.md` 에 모은다)_");
  }
  lines.push("", `> 총 결정: ${decisions.length}`, "");
  return lines.join("\n");
}

function llmsLink(d) {
  const label = d.title || d.wikilink;
  return `- [${label}](${d.rel})${d.description ? `: ${d.description}` : ""}`;
}

function buildLlmsTxt(docs) {
  const bySlug = (a, b) => a.wikilink.localeCompare(b.wikilink);
  const byId = (a, b) => a.id.localeCompare(b.id);
  const L = [
    "# saju 지식 위키",
    "",
    "> saju(사주 기반 서비스)의 '왜/근거/분석' 레이어. 결정은 ID(DEC-####)로 인용하라.",
  ];

  const isLive = (d) => !["stale", "archived"].includes(d.status); // stale/archived 는 Optional 로만

  const liveDec = docs
    .filter((d) => d.type === "decision" && ["accepted", "proposed"].includes(d.status))
    .sort(byId);
  L.push("", "## Decisions", "");
  if (liveDec.length) {
    for (const d of liveDec) L.push(`- [${d.id} ${d.title}](${d.rel})${d.description ? `: ${d.description}` : ""}`);
  } else {
    L.push("- (아직 결정 없음 — 후보 백로그: pages/decisions/open-decisions.md)");
  }

  const sections = [
    ["Analysis", "analysis"],
    ["Principles", "principle"],
    ["Concepts", "concept"],
    ["Guides", "guide"],
    ["Notes", "note"],
  ];
  for (const [heading, type] of sections) {
    const items = docs.filter((d) => !d.isSource && d.type === type && isLive(d)).sort(bySlug);
    if (!items.length) continue;
    L.push("", `## ${heading}`, "");
    for (const d of items) L.push(llmsLink(d));
  }

  // Optional: 참고 원본 + 대체/폐기/기각 결정 + stale/archived — 좁은 컨텍스트면 건너뛰어도 됨
  const optional = [
    ...docs.filter((d) => d.isSource).sort(bySlug),
    ...docs
      .filter((d) => d.type === "decision" && ["superseded", "deprecated", "rejected"].includes(d.status))
      .sort(byId),
    ...docs.filter((d) => !d.isSource && ["stale", "archived"].includes(d.status)).sort(bySlug),
  ];
  if (optional.length) {
    L.push("", "## Optional", "");
    for (const d of optional) L.push(llmsLink(d));
  }

  return L.join("\n") + "\n";
}

// lint 등 외부에서 재사용할 수 있게 export — 생성물 3종을 (쓰지 않고) 계산만 한다
export async function generateOutputs() {
  const { docs, warnings } = await collectDocs();
  return {
    docs,
    warnings,
    outputs: [
      { path: INDEX_PATH, content: buildIndex(docs) },
      { path: DECISIONS_INDEX_PATH, content: buildDecisionsIndex(docs) },
      { path: LLMS_PATH, content: buildLlmsTxt(docs) },
    ],
  };
}

async function main() {
  const check = process.argv.includes("--check");
  const { docs, warnings, outputs } = await generateOutputs();
  for (const w of warnings) console.warn(`[warn] ${w}`);

  if (check) {
    let drift = false;
    for (const o of outputs) {
      let existing = "";
      try {
        existing = await readFile(o.path, "utf8");
      } catch {}
      if (existing.trim() !== o.content.trim()) {
        console.error(`✗ ${relative(WIKI_ROOT, o.path)} 가 최신이 아닙니다.`);
        drift = true;
      }
    }
    if (drift) {
      console.error("`node scripts/build-index.mjs` 실행 후 커밋하세요.");
      process.exit(1);
    }
    console.log("✓ 생성물 3종 모두 동기화됨.");
    return;
  }

  for (const o of outputs) await writeFile(o.path, o.content);
  console.log(
    `✓ 생성: index.md · decisions-index.md · llms.txt (페이지 ${docs.filter((d) => !d.isSource).length}, 소스 ${docs.filter((d) => d.isSource).length})`,
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
