---
type: guide
title: "에이전트 진입점 (AI가 이 위키를 읽는 법)"
status: active
owner: 이유미/FE파트/NE
created: 2026-08-18
updated: 2026-08-18
---

# 에이전트 진입점

이 위키는 `saju`의 **WHY·HOW 레이어**다 — 결정·근거·분석. 구현 코드(API·사용법)는 여기 없다 — **레포 코드/PR**에 있다.

## 충돌 시 권위 순서
1. `status: accepted` 결정 (현행 공식 결정)
2. `status: active` 분석·원칙
3. `status: proposed` 결정 (아직 논의 중), `draft` 지식
- `superseded`/`deprecated`/`rejected` 는 **역사**다. 현행으로 인용하지 말 것.

## 인용 방법
- 결정은 **ID로 인용**: `DEC-0007`. 슬러그·title이 바뀌어도 ID는 불변 앵커.
- "saju가 왜 X를 하나?" → `llms.txt`/`decisions-index.md` 에서 찾아 해당 결정 페이지 1장을 읽어 답한다. 위키가 커져도 전체 스캔 대신 인덱스를 탄다.

## 어디에 뭐가 있나
- 결정: `pages/decisions/` (status별 목록은 `decisions-index.md`) · 결정 후보 백로그: `pages/decisions/open-decisions.md`
- 분석: `pages/analysis/` · 참고 원본: `sources/` (불변) · 원칙: `pages/principles/`
- 작은 배움·TIL: `pages/notes/` (결정 연결 의무 없는 가장 가벼운 타입)
- 용어: `pages/glossary.md` (동의어는 여기 정답으로 통일)
- 전체 카탈로그: `index.md` · 에이전트용 요약: `llms.txt`

## 경계
- 구현 세부(코드/타입)가 필요하면 → 결정 페이지의 `impl_pr` 링크를 따라 레포 코드/PR로 가라. 위키 본문에서 API를 지어내지 말 것.
