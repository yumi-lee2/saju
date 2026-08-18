---
id: DEC-0000                     # 생성 시 즉시 부여, 단조증가, 재사용 금지
type: decision
title: ""                        # 문제→해결 어투 (예: "빌드 도구로 X 채택")
status: proposed                 # proposed → accepted → superseded | deprecated | rejected
domain: saju-domain       # saju-domain | calendar-core | frontend-arch | components-ui | tooling-dx | meta
owner: ""                        # 담당자 1인 (팀 X)
created: YYYY-MM-DD
updated: YYYY-MM-DD
y_statement: ""                  # 한 줄 요약 (에이전트 triage용)
sources: []                      # 근거: [[sources/...]]
supersedes: []                   # 이 결정이 대체하는 옛 결정: [[pages/decisions/...]]
superseded_by: []                # 나를 대체한 새 결정 (대체될 때 옛 문서에 추가)
impl_pr: ""                      # 구현 PR / 커밋 (결정 → 코드 다리)
---

<!--
★ 불변 규칙: status=accepted 되는 순간 본문 동결.
   accepted 이후 허용되는 변경은 딱 이것뿐:
     (1) status  (2) superseded_by  (3) updated 날짜
     (4) 오타·깨진 링크 수정  (5) 아래 "## 회고" append
   내용이 바뀌면 새 문서로 대체(supersede)한다. 수정하지 않는다.
-->

## 맥락
<!-- 왜 이 결정이 필요한가. 사실과 제약을 가치중립적으로 서술. -->

## 결정
<!-- "우리는 ~한다" 현재형. -->

## 결과
<!-- 좋아지는 것 / 나빠지는 것 (positive / negative / neutral). -->

## 링크
<!-- 관련 분석 [[pages/analysis/...]], 근거 [[sources/...]], 구현 PR 등. -->

<!-- ─────────────────────────────────────────────
     큰 결정만: 아래 섹션 추가 (작은 결정은 생략)
─────────────────────────────────────────────
## 검토한 선택지
## 장단점
## 검증 방법
   이 결정을 실제로 따르는지 어떻게 확인하나 (lint 규칙 / 테스트 / 리뷰)
-->

<!-- ─────────────────────────────────────────────
     배포 후 (선택): append 전용.
     확정(accepted)된 문서라도 이 "## 회고" 추가는 허용.
     기존 문장 수정 없이, 아래로 덧붙이기만 한다.
─────────────────────────────────────────────
## 회고
- (YYYY-MM-DD) 실제 적용 결과 / 배운 점
-->
