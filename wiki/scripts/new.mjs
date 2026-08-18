#!/usr/bin/env node
// 새 위키 페이지 생성 헬퍼.
//   사용법: node scripts/new.mjs <type> <slug> [title]
//   type: decision | analysis | principle | concept | guide | note | source
//   source 는 slug 를 `<category>/<slug>` 로 (예: frameworks/storybook-10-docs)
//   note 는 파일명이 날짜 prefix 로 생성된다 (YYYY-MM-DD-<slug>.md)
//
// 템플릿을 복사하고 다음 ID 자동 부여 + created/updated(/last_verified)=오늘
// + owner=`git config user.name` 을 stamp 한다. (owner 는 계산값이 아니라 저장값 —
//  생성 시 한 번 찍고, 이후엔 재배정 가능. git author 히스토리와는 별개.)

import { readdir, readFile, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { parseFrontmatter } from "./build-index.mjs";

const WIKI_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const TYPES = {
  decision: { dir: "pages/decisions", template: "templates/decision.md", prefix: "DEC" },
  analysis: { dir: "pages/analysis", template: "templates/analysis.md", prefix: "ANL" },
  principle: { dir: "pages/principles", template: "templates/principle.md", prefix: null },
  concept: { dir: "pages/concepts", template: "templates/concept.md", prefix: null },
  guide: { dir: "pages/guides", template: "templates/guide.md", prefix: null },
  note: { dir: "pages/notes", template: "templates/note.md", prefix: null, datePrefix: true },
  source: { dir: "sources", template: "templates/reference.md", prefix: null, categorized: true },
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function gitName() {
  try {
    return execFileSync("git", ["config", "user.name"], {
      cwd: WIKI_ROOT,
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return "";
  }
}

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function nextId(dirAbs, prefix) {
  let max = 0;
  let files = [];
  try {
    files = await readdir(dirAbs);
  } catch {}
  const re = new RegExp(`^${prefix}-(\\d+)$`);
  for (const f of files) {
    if (!f.endsWith(".md")) continue;
    const { data } = parseFrontmatter(await readFile(join(dirAbs, f), "utf8"));
    const m = re.exec(data.id || "");
    if (m) max = Math.max(max, Number(m[1]));
  }
  return String(max + 1).padStart(4, "0");
}

// frontmatter 의 한 필드 라인을 값으로 교체 (없으면 그대로)
function setField(content, key, value) {
  const re = new RegExp(`^(${key}:).*$`, "m");
  return content.replace(re, (_, g1) => `${g1} ${value}`);
}

async function main() {
  const [type, rawSlug, ...titleParts] = process.argv.slice(2);
  const title = titleParts.join(" ");
  const spec = TYPES[type];
  if (!spec || !rawSlug) {
    console.error("사용법: node scripts/new.mjs <decision|analysis|principle|concept|guide|note|source> <slug> [title]");
    console.error("       source 는 slug 를 <category>/<slug> 형식으로 (예: frameworks/storybook-10-docs)");
    process.exit(1);
  }

  let slug = rawSlug;
  let dirRel = spec.dir;
  let category = null;
  if (spec.categorized) {
    const cut = rawSlug.indexOf("/");
    if (cut <= 0 || cut === rawSlug.length - 1) {
      console.error(`✗ source 는 slug 를 <category>/<slug> 형식으로 지정하세요 (예: frameworks/${rawSlug})`);
      process.exit(1);
    }
    category = rawSlug.slice(0, cut);
    slug = rawSlug.slice(cut + 1);
    dirRel = join(spec.dir, category);
    if (!(await exists(join(WIKI_ROOT, dirRel)))) {
      console.error(`✗ 없는 category 폴더: sources/${category}/ — 먼저 만들거나 기존 폴더를 쓰세요.`);
      process.exit(1);
    }
  }

  const tpl = await readFile(join(WIKI_ROOT, spec.template), "utf8");
  const dirAbs = join(WIKI_ROOT, dirRel);
  const d = today();
  const owner = gitName();

  let id = null;
  let filename;
  if (spec.prefix) {
    const num = await nextId(dirAbs, spec.prefix);
    id = `${spec.prefix}-${num}`;
    filename = `${spec.prefix.toLowerCase()}-${num}-${slug}.md`;
  } else if (spec.datePrefix) {
    filename = `${d}-${slug}.md`;
  } else {
    filename = `${slug}.md`;
  }

  let content = tpl;
  if (id) content = setField(content, "id", id);
  content = setField(content, "created", d);
  content = setField(content, "updated", d);
  content = setField(content, "last_verified", d); // analysis 에만 존재
  if (category) content = setField(content, "category", category);
  if (owner) content = setField(content, "owner", owner);
  if (title) content = setField(content, "title", JSON.stringify(title)); // 따옴표 포함 제목도 안전하게

  const outAbs = join(dirAbs, filename);
  if (await exists(outAbs)) {
    console.error(`✗ 이미 존재: ${dirRel}/${filename}`);
    process.exit(1);
  }
  await writeFile(outAbs, content);
  console.log(`✓ 생성: ${dirRel}/${filename}${id ? `  (${id})` : ""}  owner=${owner || "(git 이름 없음)"}`);
  console.log("  → title/본문을 채우고, 필요 없는 <!-- 안내 주석 --> 은 지우세요.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
