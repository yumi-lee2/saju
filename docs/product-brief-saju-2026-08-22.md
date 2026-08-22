---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: []
date: 2026-08-22
author: Soobinlee
---

# Product Brief: saju

## Executive Summary

saju는 "절대적인 존재"가 "너는 지금 이 웹소설에 빙의했다"고 선언하며 사용자의 사주 정보를 웹소설 캐릭터로 풀어 보여주는 공유형 웹 서비스입니다. 친구들이 각자 사주를 등록하면 서로의 궁합을 순위로 볼 수 있고, 결과지에는 잘 맞든 안 맞든 구체적이고 재미있게 실천할 수 있는 코칭이 함께 담깁니다. 여기에 "3개월간 바쁠 예정" 같은 가볍고 유쾌한 예언도 곁들여, 한 번 보고 끝나는 게 아니라 단톡방에서 계속 공유되는 서비스를 지향합니다.

*saju is a shareable web app where an "absolute being" declares "you have been possessed into this web novel," turning a user's Korean fortune-telling (saju) profile into a web-novel character reveal. Friends register their own saju, get ranked by compatibility, and receive a result sheet that pairs every match — good or bad — with concrete, funny, actionable coaching, plus a playful short-term "prediction" (e.g., "busy for the next 3 months"). Built to be shared in group chats, not just viewed once and forgotten.*

---

## Core Vision

### Problem Statement

도령앱 같은 바이럴 사주 서비스는 한 번 해보고 나면 다시 찾지 않게 됩니다. 사용자가 재방문하지 않고, 첫 공유 이후 친구를 더 초대하지도 않습니다.

*Viral saju apps (e.g., doryeong.app) get tried once and then dropped. Users don't come back, and they don't keep inviting friends after the first round.*

### Problem Impact

돌아올 이유, 다시 공유할 이유가 없으면 참여는 루프가 아니라 한 번의 스파이크로 끝납니다. 친구 그룹 안에서 "새로 들어온 사람이랑도 비교해보자"는 지속적인 습관이 만들어지지 않아, 바이럴 잠재력이 첫 공유 이후 사그라듭니다.

*Without a reason to return or re-share, engagement is a single spike instead of a loop. Friend groups don't build an ongoing "let's compare everyone" habit, so the app's viral potential dies after the first share.*

### Why Existing Solutions Fall Short

- 사주 결과가 대체로 막연하고 뻔해서, 신뢰도 안 가고 기억에도 안 남습니다.
- 궁합은 보통 단발성 yes/no나 점수로만 표시되고, 그 이후 이어지는 가치가 없습니다.
- 궁합이 안 좋으면 기존 앱들은 "안 맞다"고만 말하고 끝냅니다 — 그다음에 할 수 있는 것도, 같이 웃을 거리도 없습니다.

*Saju results tend to feel vague and generic, which undercuts trust and makes the reading forgettable. Compatibility is typically shown as a flat, one-off yes/no or score, with no follow-up value. When a match isn't good, existing apps just say so and stop there — no path forward, nothing to act on or laugh about together.*

### Proposed Solution

"절대적 존재"가 내레이터가 되어 "너는 지금 이 웹소설에 빙의했다"고 선언하며 각자의 사주 결과를 전달합니다. 개인 캐릭터는 생년월일시로 정해지는 일주(육십갑자)를 그대로 활용해 **60가지 캐릭터**로 나뉘고, 각 캐릭터는 오행(목·화·토·금·수) 속성을 바탕으로 로맨스 판타지 웹소설풍 아카타입 — 예: 목 속성 "남쪽 해안도시 귀하게 자란 막내 아들" / "푸르른 숲이 울창한 엘프" — 으로 표현되며, 성별에 따라 다른 버전(예: "냉혈한 북부대공" / "냉혈한 북부대공비")으로 갈립니다. 캐릭터 이미지는 AI로 사전 생성해 정적 에셋으로 준비하고, 사주 계산 결과(일주+성별)에 매핑해서 보여줍니다.

친구들이 각자 사주를 등록하면, 참여한 모든 사람과의 궁합을 순위로 볼 수 있습니다. 이때 궁합은 단순 점수가 아니라 **"들불: 활활 타오르는 열정의 사이"**처럼 이름이 붙은 궁합 유형으로 소개되고, 그 유형에 맞는 구체적인 코칭이 따라옵니다 — 그래서 "안 맞다"는 결과도 막다른 길이 아니라 같이 웃고 공유할 거리가 됩니다. 결과지에는 짧고 유쾌한 예언도 함께 담겨, 다시 들여다볼 이유를 만듭니다.

*An "absolute being" narrator declares "you have been possessed into this web novel," delivering each user's saju profile through that framing. Each person's individual character is determined by their day pillar (일주) from the traditional 60 stem-branch cycle (육십갑자) — 60 characters total, grouped by the five elements (wood/fire/earth/metal/water) and styled as web-novel romance-fantasy archetypes (e.g., a Wood-element character as "the nobly raised youngest son of a southern coastal city" or "an elf from a lush green forest"), with distinct male/female versions (e.g., "The Cold-Blooded Duke of the North" / "The Cold-Blooded Duchess of the North"). Character art is AI-generated ahead of time and served as static assets, mapped by day-pillar + gender at result time — no runtime image generation needed.*

*Friends register their own saju and see a compatibility ranking against everyone else who's joined. Instead of a bare score, each match is introduced as a named compatibility type (e.g., "Wildfire: a relationship of blazing passion"), paired with specific coaching for that type so a "bad" match becomes something to laugh about and share rather than a dead end. Each result sheet also includes a short, playful prediction to give people a reason to check back.*

### Key Differentiators

- **육십갑자 기반 60개 캐릭터** — 명리학 체계를 그대로 재사용해 임의 설계 없이 신뢰도 있는 캐릭터 다양성 확보.
- **로판/웹소설풍 아카타입 + 성별 버전 분기** — 타겟 사용자(10~30대)에게 익숙한 서사 문법으로 몰입도와 공유욕 극대화.
- **AI 사전 생성 + 정적 서빙** — 런타임 이미지 생성 비용·레이턴시 없이, 1주일 스코프 안에서 고품질 비주얼 확보.
- **여러 명을 한 번에 비교하는 순위 방식** — 1:1이 아니라 "더 초대해서 순위 확인" 루프.
- **이름이 붙은 궁합 유형** (예: 들불) — 점수 대신 MBTI 궁합처럼 캐릭터화된 설명.
- **모든 결과에 대한 실천 가능한 코칭** — 안 맞는 궁합도 공유하고 싶은 콘텐츠로.
- **짧고 유쾌한 예언** — 매일 푸시 없이도 재방문 유도.

*- **60 characters based on the traditional 60 stem-branch cycle (육십갑자)** — reuses an existing saju system for credible variety instead of an arbitrary taxonomy.*
*- **Web-novel romance-fantasy archetypes with gendered versions** — taps a narrative style the target audience (10s–30s) already loves, maximizing immersion and shareability.*
*- **AI-generated art, pre-rendered and served statically** — no runtime generation cost or latency, keeping the whole feature deliverable within a one-week scope.*
*- **Ranking across multiple friends**, not just 1:1 compatibility.*
*- **Named compatibility types** (e.g., "Wildfire") instead of a bare score.*
*- **Actionable coaching for every outcome**, including mismatches.*
*- **Bite-sized playful predictions** bundled into the result sheet.*

## Target Users

### Primary Users

**20대 후반 지현씨 (2030 SNS 사용자, 사주/타로/MBSI 콘텐츠에 관심 많음)**

X(트위터)를 즐겨 하며, 타임라인에서 "내 사주 기반 웹소설 캐릭터 알려준대!" 같은 바이럴 게시물을 보고 유입됩니다. 평소 MBTI·타로 짤을 즐겨 보고 익명으로 공유하는 문화에 익숙합니다. 생년월일시를 입력해 자신의 캐릭터 결과를 확인하고, 마음에 들면 스크린샷을 떠서 X에 익명으로 공유합니다. 이걸로 목적은 달성 — 매번 재방문할 필요는 없는 단발성 경험이어도 괜찮고, 이후 관심이 이어지면 심화 정보(유료)를 구매할 수도 있습니다.

*A woman in her late 20s who's active on X (Twitter). She discovers the service through a viral post on her timeline ("Find out your web-novel character based on your saju!"). She's used to MBTI/tarot content and anonymous sharing culture. She enters her birth date/time, gets her character result, and — if she likes it — screenshots and shares it anonymously on X. That single moment is enough; she doesn't need to return regularly, though she may later pay for deeper content if she stays interested.*

**초대받아 유입되는 사람 (친구의 공유를 보고 궁금해서 클릭)**

같은 페르소나가 다른 진입 경로로 들어오는 경우입니다. 친구가 공유한 캐릭터 결과나 궁합 순위를 보고 궁금해서 클릭 → 자기도 사주를 입력해 캐릭터를 확인 → 자신만의 궁합 순위를 만들기 시작합니다. 별도 세그먼트라기보다, 같은 타겟이 바이럴 루프를 통해 유입되는 자연스러운 경로입니다.

*The same persona entering through a different channel: curious after seeing a friend's shared result or compatibility ranking, they click in, enter their own saju to see their character, and start building their own compatibility ranking. Not a separate segment — this is the natural viral-loop entry point for the same target user.*

### Secondary Users

N/A — 초대 유입 사용자는 별도 세그먼트가 아니라 Primary User의 바이럴 루프 진입 경로로 위에서 함께 다룸.

*N/A — the invite-driven entry point is not a distinct segment; it's the viral-loop path for the same primary user, covered above.*

### User Journey

- **Discovery:** X 타임라인에서 친구의 공유 게시물이나 바이럴 포스트를 통해 서비스를 알게 됨.
- **Onboarding:** 생년월일시 입력 → 별도 가입 절차 없이 바로 자신의 사주 캐릭터 결과 확인 (진입 장벽 최소화).
- **Core Usage:** 자신의 캐릭터를 확인한 뒤, 친구를 초대해 궁합 순위를 만들거나, 초대받아 들어와 자기 사주도 입력하고 순위에 합류.
- **Success Moment:** 캐릭터 결과(비주얼+캐릭터 설명)가 마음에 들어 스크린샷을 떠서 X에 익명으로 공유하는 순간.
- **Long-term:** 반복 방문을 강제하는 앱이 아님 — 단발성 바이럴 경험으로 충분하며, 이후 관심이 이어지면 유료 심화 정보로 자연스럽게 전환.

*- **Discovery:** Sees a friend's shared post or a viral post on the X timeline.*
*- **Onboarding:** Enters birth date/time — no signup wall — and immediately sees their character result.*
*- **Core Usage:** After seeing their own character, invites friends to build a compatibility ranking, or joins one via invite by entering their own saju.*
*- **Success Moment:** Likes the character result (visual + description) enough to screenshot and share anonymously on X.*
*- **Long-term:** Not built around forced repeat visits — a single viral moment is sufficient, with a natural path to paid deeper content if interest continues.*

## Success Metrics

사용자가 성공했다고 느끼는 순간은 자신의 캐릭터 결과를 확인하고 공유하는 것이며, 그 공유를 본 다른 사람이 궁금해서 들어와 자기 사주를 입력하고 다시 공유하는 루프가 핵심입니다. 이 루프가 실제로 바이럴을 타는지가 사용자 성공과 비즈니스 성공을 동시에 나타내는 지표입니다.

*Success is when a user views and shares their character result, and that share pulls in someone new who registers their own saju and shares again. Whether this loop actually goes viral is the key indicator of both user and business success.*

### Business Objectives

1주일 내 MVP 출시 후, **누적 사용자 10만 명**을 비즈니스 목표로 삼습니다. 심화 정보 유료 판매는 이번 MVP 범위에는 포함하지 않고, 이후 단계의 목표로 남겨둡니다.

*After launching the MVP within one week, the business goal is **100,000 cumulative users**. Paid deep-dive content is out of scope for this MVP and is deferred to a later phase.*

### Key Performance Indicators

- **바이럴 루프 완주율**: 결과를 본 사람 중 공유(캡처/링크) 행동으로 이어지는 비율
- **초대 전환율(K-factor)**: 공유를 본 사람 중 실제로 들어와 자기 사주를 입력하는 비율
- **누적 가입자 수**: 10만 명 도달까지의 추이 (일별/주별 신규 유입 추적)

*- **Share-through rate**: % of users who view their result and take a sharing action (screenshot/link).*
*- **Invite conversion (K-factor)**: % of people who see a shared result and go on to register their own saju.*
*- **Cumulative users**: tracking progress toward the 100,000-user goal (daily/weekly new signups).*

## MVP Scope

### Core Features

1. **생년월일시 입력** — 로그인 없이 익명으로 입력.
2. **사주 계산 + 캐릭터 매칭** — 일주(육십갑자) 기반 60개 캐릭터 중 매칭, 오행(목·화·토·금·수) 속성과 웹소설 아카타입, 성별 버전 반영.
3. **결과 화면** — "절대적 존재"가 "너는 지금 이 웹소설에 빙의했다"고 선언하며 캐릭터 비주얼(AI 사전 생성)과 짧고 유쾌한 예언을 함께 보여줌.
4. **공유 기능** — 캡처/링크 공유 유도, X(트위터) 공유에 최적화.
5. **친구 초대 & 궁합 순위** — 초대받은 사람이 자기 사주 입력 → 참여자 전체와의 궁합을 이름 붙은 유형(예: 들불)과 코칭으로 순위 확인.

*1. **Birth date/time input** — anonymous, no login required.*
*2. **Saju calculation + character matching** — maps to one of 60 characters based on the day pillar (육십갑자), reflecting the five elements and web-novel archetype, with gendered versions.*
*3. **Result screen** — an "absolute being" narrator declares "you have been possessed into this web novel," paired with AI-pre-generated character art and a short, playful prediction.*
*4. **Sharing** — encourages screenshot/link sharing, optimized for X (Twitter).*
*5. **Friend invite & compatibility ranking** — invited friends enter their own saju and see a ranking against all participants, with named compatibility types (e.g., "Wildfire") and coaching.*

### Out of Scope for MVP

- 회원가입/로그인 시스템
- 결과 히스토리 저장, 마이페이지
- 유료 결제 시스템 (심화 정보 판매는 이후 단계)
- 네이티브 앱 (웹만 지원)
- 실시간 알림/푸시

*- Signup/login system*
*- Result history storage, my-page*
*- Payment system (paid deep-dive content is a later phase)*
*- Native app (web only)*
*- Real-time notifications/push*

### MVP Success Criteria

1주일 내 안정적으로 배포되고, 공유율과 초대 전환율(K-factor)이 실제로 측정 가능한 수준으로 나타나며 바이럴 루프가 관찰되는 것이 MVP 성공의 기준입니다. 이 신호가 확인되면 10만 유저 목표를 향한 트랙션 근거로 삼습니다.

*Success means the MVP ships reliably within one week, the share-through rate and invite conversion (K-factor) are measurable, and the viral loop is observably working. This signal becomes the evidence for pursuing the 100,000-user goal.*

### Future Vision

바이럴 루프가 검증되면, 다음 단계로 **유료 심화 사주(프리미엄 리딩)** 를 도입해 수익화 레이어를 추가합니다.

*Once the viral loop is validated, the next phase introduces **paid deep-dive saju readings (premium content)** as a monetization layer.*

<!-- Content will be appended sequentially through collaborative workflow steps -->
