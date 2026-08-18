---
id: ANL-0000                     # 생성 시 즉시 부여, 단조증가, 재사용 금지
type: analysis
subtype: teardown                # teardown | matrix | tradeoff | spike
title: ""
status: draft                    # draft(WIP 기본) | active | stale | archived — 완성해서 informed_decisions 채운 뒤 active 로 올린다
domain: saju-domain       # saju-domain | calendar-core | frontend-arch | components-ui | tooling-dx | meta
owner: ""                        # 담당자 1인
created: YYYY-MM-DD
updated: YYYY-MM-DD
last_verified: YYYY-MM-DD         # 마지막으로 사람이 "여전히 유효함" 확인한 날 (updated와 별개)
review_interval: 180d             # 90d | 180d | 365d (도구·시장 지형은 잘 낡음 → 짧게)
subjects: []                      # 비교 대상 (teardown/matrix). 예: [대상A, 대상B, 대상C]
sources: []                       # 근거: [[sources/...]]  (matrix는 셀마다 1개 권장)
informed_decisions: []            # 이 분석이 이끈 결정: [[pages/decisions/...]]  ← active면 필수
---

<!--
분석은 "살아있는 문서"다 — 갱신 대상(불변 아님).
단, 반드시 추천으로 끝나고 그 추천이 결정을 가리켜야 한다(informed_decisions). 아니면 shelfware.
20페이지 벤치마크를 결정 문서에 인라인하지 말 것 — 여기 두고 결정이 링크한다.
subtype에 맞는 본문 뼈대를 아래에서 골라 쓴다.
-->

## 요약
<!-- 결론 한 문단. 무엇을 조사했고, 그래서 무엇을 하기로/하지 말기로 했나. -->

<!-- ── subtype: tradeoff | spike ──────────────
## 질문 / 가설
## 검토한 선택지
## 방법            (재현 가능하게: 셋업·측정)
## 결과
## 트레이드오프
## 추천 → [[pages/decisions/...]]
──────────────────────────────────────────── -->

<!-- ── subtype: teardown (레퍼런스 1곳 심층) ────
## 포지셔닝
## 아키텍처 노트
## 강점 / 약점
## 갭              (의도적 선택 vs 미충족 니즈)
## 우리가 빌려올 것
## 이끈 결정 → [[pages/decisions/...]]
──────────────────────────────────────────── -->

<!-- ── subtype: matrix (여러 대상 점수화 비교) ──
## 비교 축         (예: 기능 커버리지·성능·유지보수·생태계·AX 친화)
## 점수표          (셀마다 0~3 + 근거 + 출처)
   0 없음 · 1 있으나 부실/숨김 · 2 업계 표준 · 3 동급 최고
## 시장 공백 관찰
## 결론            (무엇을 채택하고 / 안 할 것인가) → [[pages/decisions/...]]
──────────────────────────────────────────── -->
