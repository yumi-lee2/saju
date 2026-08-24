---
type: guide
title: "결정 백로그 (open decisions)"
status: active
owner: 이유미/FE파트/NE
created: 2026-08-18
updated: 2026-08-19
---

# 결정 백로그

아직 안 정한(또는 곧 정할) **결정** 목록. 정해지면 `templates/decision.md`로 `DEC-000X` 승격 후 이 표에서 제거한다.
(항목은 아직 결정이 아니므로 DEC 번호를 부여하지 않는다.)

분석(`analysis`)의 `informed_decisions`는 아직 결정 전이면 이 백로그 `[[pages/decisions/open-decisions]]`를 가리켜도 된다.

| 주제 | 질문 | domain | 근거 분석 |
|---|---|---|---|
| 사주 계산 범위 | 일주(日柱)만 쓸 것인가, 사주팔자 4기둥 전부인가? | saju-domain | [[pages/concepts/ilju-fusion-character]] |
| 역법 계산 조달 | 계산 로직을 직접 구현할 것인가, 외부 API로 조달할 것인가? | calendar-core | [[pages/concepts/ilju-fusion-character]] |
| 입력 범위 | 태어난 시간을 입력받을 것인가? (일주만 쓰면 불필요) | components-ui | [[pages/concepts/ilju-fusion-character]] |

<!--
형식 예시 (연구가 시작되면 채운다):
| 주제A | 질문? | saju-domain | |
-->
