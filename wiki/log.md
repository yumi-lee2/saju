# 작업 로그

## 2026-08-18

- SETUP: saju 지식 위키 스캐폴드 생성 (project-decision-wiki 스킬)
  - 목적: saju(사주 기반 서비스)의 '왜/근거/분석' 레이어. 결정은 ID(DEC-####)로 인용하라.
  - 스키마: `CLAUDE.md` (2-레이어, 결정 불변 규칙, domain enum 프로젝트 맞춤)
  - 양식: decision·analysis·principle·concept·guide·note·reference 7종
  - 가이드: [[pages/guides/how-we-decide]], [[pages/guides/agents]]
  - 스텁: [[pages/glossary]], [[pages/decisions/open-decisions]](백로그), log.md
  - 루트 포인터: `../CLAUDE.md`
  - 스크립트: scripts/build-index.mjs · new.mjs · wiki-lint.mjs (index·decisions-index·llms.txt 생성 + lint 게이트, `npm run wiki:check`)
  - TODO(나중): 첫 why-chain(분석·결정) 착수, 용어집 채우기
