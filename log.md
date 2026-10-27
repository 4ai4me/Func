# 작업 로그 (log.md)

## [2026-10-26] 고등학교 공통수학2 함수 수업 탐구 플랫폼 기본 틀 구축 (Tier 3)

### 1. 작업 시작 전 검토 (변경 전 공통 질문)
- **무엇을 바꾸는가?**: `https://4ai4me.github.io/Props/` 레퍼런스와 동일한 구조의 고등학교 수학(공통수학2 — 함수와 그래프) 수업용 웹 플랫폼 기본 틀(학생 가입 신청·승인제, 기기 MAC 주소 해시 식별, 교사용 수사 기록실, 실시간 클라우드 동기화, 함수/수식 입력기, 루브릭 평가 및 PDF/CSV 연동)을 구축한다.
- **왜 바꾸는가?**: 사용자의 요청("고등학교 수학 교육 과정 중 함수 수업에 관련된 사이트를 만들려고함. https://4ai4me.github.io/Props/ 방식과 동일하게 진행하려고 하거든? 어떤 내용으로 진행할지는 따로 알려줄게. 기본 틀만 진행해줘.")에 따라 추후 차시별 함수 수업 콘텐츠를 즉시 탑재할 수 있는 검증된 기본 틀을 먼저 완성한다.
- **사용자 데이터 및 보안 영향**: Firebase Firestore(`student_registrations`, `device_locks`, `student_access_logs`) 프로비저닝 및 Zero-Trust 보안 규칙(`firestore.rules`)을 적용하여 학생 학적 정보와 답안 데이터를 안전하게 보호한다.

### 2. 구현 및 검증 내역 (Definition of Done)
- [x] Firebase 프로비저닝 완료 및 `firebase-applet-config.json` 연동
- [x] `firestore.rules` 및 `firebase-blueprint.json` 구성, ESLint 보안 규칙 검증 및 배포
- [x] 상단 3-Zone 네비게이션 바(`이하연 수학 교실 · Math Detective Lab / 공통수학2 · 함수와 그래프`), 히어로 배너(`대응일까, 함수일까?`), 학생/교사 모드 전환 게이트웨이(`AuthGateView`) 구현
- [x] 함수 전용 수학 기호(`f(x)`, `g(x)`, `(g∘f)(x)`, `f⁻¹(x)`, `∘`, `↦`, `→`)를 수식 입력 도우미(`MathSymbolInputBar`)에 추가
- [x] 단위 테스트(`authLogic.test.ts`, `mathLogic.test.ts`), 빌드 검증(`compile_applet`), 브라우저 렌더링 검증(`playwright-cli`) 수행
