---
type: guide
title: "saju는 어떻게 결정하는가"
status: active
owner: 이유미/FE파트/NE
created: 2026-08-18
updated: 2026-08-18
---

# saju는 어떻게 결정하는가

## 언제 결정 문서를 남기나
**미래의 나(또는 에이전트)가 "왜 이렇게 했지?"를 물을 만한 갈림길**이면 남긴다. 갈림길이 아니었으면 결정이 아니다 — 결정까지는 아닌 작은 배움·실험 메모는 note 로 남긴다(`node scripts/new.mjs note <slug> "제목"`, 결정 연결 의무 없음).

## 절차
1. `node scripts/new.mjs decision <slug> "제목"` 으로 생성 — ID·날짜·owner 자동 stamp (수동 복사보다 권장). **`id`는 생성 즉시 부여**(`DEC-####`, 단조증가, 재사용 금지 — 형식·중복은 lint 가 검사).
2. `status: proposed` 로 초안 작성 — 이 단계에선 자유롭게 수정. 리뷰어가 있으면 PR로 올려 논의하고, 1인 레포면 스스로 검토한다.
3. 확정되면 `status: accepted`. **이 순간부터 본문 동결.**
4. 근거를 링크: 오래 참조할 원본은 `node scripts/new.mjs source <category>/<slug> "제목"` 으로 sources/ 에 캡처, 가벼운 근거는 본문 링크 섹션에 생 URL. 관련 있으면 분석 `[[pages/analysis/...]]`, 그리고 `impl_pr`.
5. 커밋 전 게이트: 레포 루트에서 `npm run wiki:check` (lint + 인덱스 drift 검사).

## 확정된 결정을 바꾸려면 (수정 아님, 대체)
1. 새 결정 문서 생성 + `supersedes: [[옛 결정]]`
2. 옛 문서: `status: superseded` + `superseded_by: [[새 결정]]` (양방향)
3. 옛 문서 본문은 그대로. 대체된 결정도 역사로 보존.

## accepted 이후 허용되는 변경 (그 외 금지)
- `status`, `superseded_by`, `updated`/`last_verified` 날짜
- 오타·깨진 링크 수정
- `## 회고` 섹션 append (배포 후 결과)

## 경량 vs 큰 결정
- 경량(기본): 맥락 / 결정 / 결과 / 링크
- 큰 결정: + 검토한 선택지 / 장단점 / 검증 방법
