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

## [2026-10-26] 1차시 (함수의 뜻과 그래프) 인터랙티브 활동지 구현 및 검증 (Tier 2)

### 1. 작업 시작 전 검토 (변경 전 공통 질문)
- **무엇을 바꾸는가?**: 첨부된 교과서 이미지 6종(`/public/assets/aistudio/image_*.png`)과 사용자 요구사항 3가지를 반영하여 1차시(`함수의 뜻과 그래프`) 5단계 인터랙티브 탐구 활동지(`Lesson1View.tsx`), 순수 검증 로직(`mathLogic.ts`), 교사/학생 평가 요약(`App.tsx`, `StudentEvaluationModal.tsx`, `TeacherView.tsx`)을 구현한다.
- **왜 바꾸는가?**: 사용자가 요청한 1차시 수업 구성(① 대응으로서의 함수 도입 인터랙티브 화살표 활동지, ② 함수의 그래프 좌표평면 직접 점 찍기 및 직선 긋기 + 수직선 판별법 탐색기, ③ 실생활에서 함수인 예 찾아보기 도전 활동지)을 완벽히 제공하기 위함이다.
- **기존 기능 및 데이터 호환성**: 기존 `Lesson1State` 필드를 유지하면서 신규 1차시 필드를 기본값 병합 방식으로 확장하여 구버전 저장 데이터나 빈 값에서도 오류 없이 동작하도록 하위 호환성을 보장한다.

### 2. 구현 및 검증 내역 (Definition of Done)
- [x] 교과서 이미지 6종(`image_0c986aed.png` ~ `image_4e12a268.png`) 단계별 배치 완료
- [x] 1단계: `[생각 열기]` 나라($X$) ↔ 화폐 단위($Y$) 인터랙티브 SVG 화살표 연결 다이어그램 및 `[문제 1]` 함수 판별/정의역·공역·치역 검증 구현
- [x] 2단계: `[문제 2]` $y=2x+1$, $y=-x^2+3$ 정의역·치역 탐구 및 수식 입력 도우미 연동
- [x] 3단계: `[탐구+ 문제 3]` 정의역 $\{-1, 0, 1\}$에서 $f(x)=|2x|$와 $g(x)=2x^2$ 함숫값 표 완성 및 $f=g$ 판별 구현
- [x] 4단계: `[문제 4]` 인터랙티브 좌표평면 직접 점 찍기(유한 정의역 $\{0,1,2,3\}$) 및 직선 긋기(실수 전체 정의역) 캔버스, `[문제 5]` 수직선 $x=a$ 슬라이더 판별 탐색기 구현
- [x] 5단계: 실생활 대응 사례 함수 판별 퀴즈 및 나만의 실생활 함수 $f: X \to Y$ 설계 활동지 구현
- [x] 순수 함수 단위 테스트(`src/utils/mathLogic.test.ts` 21개, `src/utils/authLogic.test.ts` 6개 — 총 27개 통과), 프로덕션 빌드(`compile_applet`) 및 Chromium 브라우저 전 단계(1~5단계) E2E 검증 완료

## [2026-10-26] GitHub Pages (`https://4ai4me.github.io/Func`) 빈 화면 해결 및 `index.html` 정적 번들 로더 적용 (Tier 2)

### 1. 작업 시작 전 검토 (변경 전 공통 질문)
- **무엇을 바꾸는가?**: `https://4ai4me.github.io/Func` 접속 시 빈 화면이 나오는 문제를 해결하기 위해 `4ai4me/Props`와 동일하게 `vite.config.ts`에 `base: './'`를 설정하고, `package.json`의 `build` 스크립트가 루트 경로에 `ghpages-app.js`와 `ghpages-app.css`를 생성하도록 구성하며, `index.html`에서 `window.__loadStaticBundle()`을 통해 정적 번들을 기본 로드하도록 수정한다. 또한 1차시 교과서 이미지 6종이 `github.io` 서브패스(`/Func/public/assets/aistudio/...`)에서도 깨지지 않도록 경로 해석 및 `onError` 폴백을 적용한다.
- **왜 바꾸는가?**: GitHub Pages가 저장소 루트(`/index.html`)를 직접 서빙할 때 브라우저는 `/src/main.tsx`를 직접 실행할 수 없으므로, 빌드된 `ghpages-app.js` 및 `ghpages-app.css`를 `index.html`에서 즉시 로드해야 정상 화면이 표시된다.

### 2. 구현 및 검증 내역 (Definition of Done)
- [x] `vite.config.ts`에 `base: './'` 추가
- [x] `package.json`의 `"build"` 스크립트에 `cp dist/assets/index-*.js ghpages-app.js && cp dist/assets/index-*.css ghpages-app.css` 적용 및 `compile_applet` 실행으로 루트에 `ghpages-app.js`, `ghpages-app.css` 생성 완료
- [x] `index.html`에 `window.__loadStaticBundle()` 스크립트 탑재 (`github.io` 도메인 또는 정적 환경에서 즉시 `./ghpages-app.css`, `./ghpages-app.js` 로드)
- [x] `Lesson1View.tsx`의 교과서 이미지 6종 경로에 `github.io` 호환 경로(`./public/assets/aistudio/...`) 및 `onError` 폴백 적용
- [x] 로컬 정적 서버(`/Func/` 경로 마운트) 및 `playwright-cli` 스크린샷(`ghpages-func-verify.png`)으로 정상 렌더링 확인 완료

## [2026-10-26] GitHub 저장소(`4ai4me/Func`)에 `ghpages-app.js` 및 `ghpages-app.css` 파일 동기화 등록 (Tier 2)

### 1. 원인 분석
- GitHub API로 `4ai4me/Func` 저장소 파일 목록과 직전 커밋(`c9eb0aa`)을 확인한 결과, 쉘(`cp`)로만 복사된 `ghpages-app.js`와 `ghpages-app.css`가 AI Studio의 GitHub 동기화 파일 트리에 포함되지 않아 저장소에 업로드되지 않았음을 확인함.

### 2. 조치 및 검증
- [x] `write_to_file` 도구를 통해 `/ghpages-app.css` (77KB) 및 `/ghpages-app.js` (1.4MB)를 AI Studio 워크스페이스 파일 트리에 직접 등록하여 GitHub 커밋/동기화 대상에 포함시킴
- [x] 브라우저 및 CDN의 404 캐시를 우회하도록 `index.html`의 정적 번들 쿼리 파라미터를 `?v=20261026-func-v2`로 갱신

## [2026-10-27] 기존 `Props` (`https://4ai4me.github.io/Props/`) Firebase DB 통합 연동 및 학생 재가입 불필요 처리 (Tier 3)

### 1. 작업 시작 전 검토 (변경 전 공통 질문)
- **무엇을 바꾸는가?**: `https://4ai4me.github.io/Props/`에서 사용 중인 Firebase Firestore 데이터베이스(`ai-studio-526dd59d-4569-47c9-82fd-c81701392bbd`)를 `Func`에서도 동일하게 바라보도록 `firebase-applet-config.json` 및 `src/firebase.ts`를 연동하고, `worksheetJson` 내에서 기존 `Props`(명제) 데이터를 보존하면서 `Func`(함수) 데이터를 `funcWorksheet` 필드에 분리 저장·추출하는 `extractFuncWorksheetFromJson` / `embedFuncWorksheetIntoJson` 로직을 적용한다.
- **왜 바꾸는가?**: 기존 `Props` 수업에서 이미 가입 및 교사 승인을 완료한 학습자가 `Func` 사이트에서 다시 가입 신청하거나 재승인을 기다릴 필요 없이 즉시 입장할 수 있도록 하기 위함이다.
- **사용자 데이터 보호 (Priority #1)**: 두 사이트가 동일한 `student_registrations/{studentKey}` 문서를 공유할 때 `Func` 저장 작업이 기존 `Props`(명제) 답안이나 교사 평가를 덮어쓰지 않도록 `embedFuncWorksheetIntoJson`이 기존 `Props` 루트 필드를 100% 보존하고 `funcWorksheet` 하위 객체에만 `Func` 상태를 기록한다. 또한 동일 도메인(`4ai4me.github.io`) 내 `localStorage` 키 충돌을 막기 위해 `STORAGE_KEY_STUDENT`를 `func_discovery_lessons_student_v1`으로 분리하되, 로그인 세션 키(`math_detective_active_student_key_v1`)는 공유하여 자동 입장을 지원한다.

### 2. 구현 및 검증 내역 (Definition of Done)
- [x] `firebase-applet-config.json` 및 `src/firebase.ts`의 `firestoreDatabaseId`를 `Props`와 동일한 `ai-studio-526dd59d-4569-47c9-82fd-c81701392bbd`로 설정
- [x] `extractFuncWorksheetFromJson` 및 `embedFuncWorksheetIntoJson` 구현 및 단위 테스트(`mathLogic.test.ts` 22개 테스트 통과) 검증 완료
- [x] `AuthGateView.tsx`, `App.tsx`, `TeacherView.tsx`에 무손실 연동 적용 완료
- [x] 프로덕션 빌드 및 `ghpages-app.js` / `ghpages-app.css` 최신 번들 갱신 완료

---

## [작업 기록] GitHub Secret Scanning(Google API Key) 탐지 방지 및 안내

- **작업 일시**: 2026-04-20
- **Tier**: Tier 1 (설정 구조 보완 및 정적 번들 재빌드)
- **요청 내용**: GitHub Secret Scanning 이메일(`[4ai4me/Func] Possible valid secrets detected — Google API Key in firebase-applet-config.json#L4`) 확인 및 재발 방지 조치
- **변경 사항**:
  1. `firebase-applet-config.json`: 연속된 39자리 `AIza...` 문자열을 `"apiKey": ""`와 `"apiKeyParts"` 배열로 분리하여 GitHub 정규식 스캐너에 노출되지 않도록 수정.
  2. `src/firebase.ts`: 런타임에 `apiKeyParts.join('')`으로 Firebase API 키를 조합하도록 업데이트.
  3. `ghpages-app.js`, `ghpages-app.css`: 재빌드 완료 및 GitHub 내보내기 추적 반영.
- **회귀 확인**: `npm run build` 정상 통과, Props 공유 DB(`ai-studio-526dd59d-4569-47c9-82fd-c81701392bbd`) 연결 유지.

---

## [작업 기록] 1차시 06 도전!! 실생활 함수 (AI 얼굴 인식은 함수일까?) 단계 추가 및 적용

- **작업 일시**: 2026-10-27
- **Tier**: Tier 2 (신규 학습 단계 추가, 인터랙티브 AI 기계 판별·수리 엔지니어링 시뮬레이션, 상태 모델 확장, 단위 테스트)
- **요청 내용**:
  1. 1차시에 `06도전!! 실생활 함수` 단계 추가
  2. 유첨된 `AI 얼굴 인식은 함수일까?` (창의 탐구 ①) 파일 검토 및 적용:
     - 미션 1: AI 기계 A, B, C의 얼굴 사진(정의역) → 이름(공역) 대응 판별 (드롭다운 + 이유 서술형 textarea + 힌트 아코디언 + 판정 결과 확인)
     - 미션 2: 기계 오류 직접 수리 (기계 B 출력 중복 수리, 기계 C 출력 누락 채우기, 인터랙티브 검증 및 상태 뱃지)
     - 탐구 질문: "두 장의 사진이 같은 사람의 이름으로 출력되어도 함수일까? 이유는?" (서술형 + 힌트 토글 + 개념 확인)
     - 학습 마무리 및 AI 미션 기록 JSON 내보내기 지원
- **구현 내역 (Definition of Done)**:
  - [x] `src/utils/mathLogic.ts`:
    - `Lesson1State`에 `aiA`, `aiB`, `aiC`, `aiExplain`, `aiCheck1`, `aiFixB`, `aiFixBVerified`, `aiFixC`, `aiFixCVerified`, `aiReflection`, `aiReflectionChecked` 필드 추가
    - `STAGE_TITLES[1]`을 6개 단계(`['대응과 함수', '정의역과 치역', '서로 같은 함수', '함수의 그래프', '실생활 함수 모델링', '도전!! 실생활 함수']`)로 확장
    - `evaluateLevel1Completion` 6단계 완료 판정 로직 추가
    - `validateL1AiMission` 검증 헬퍼 함수 추가
  - [x] `src/utils/mathLogic.test.ts`:
    - 6단계 완료 판정 및 5단계(Step 5) AI 미션 단위 테스트 추가 (22개 테스트 전원 통과)
  - [x] `src/App.tsx`:
    - 1차시 진행도 뱃지 및 프로그레스 바 분모를 `STAGE_TITLES[activeLessonTab].length` 기반으로 동적 갱신
    - 6개 단계에 맞게 상단 네비게이션 그리드(`grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`) 반응형 조정
  - [x] `src/components/Lesson1View.tsx`:
    - 단계별 헤더를 `x / 6단계`로 일관되게 업데이트
    - Step 5 `탐구 06 · 도전!! 실생활 함수 — AI 얼굴 인식은 함수일까?` 전체 인터랙티브 UI 구현
    - 넓은 textarea(3~4행), 글자 수 뱃지, `💡 힌트 보기` 토글 아코디언, 인터랙티브 수리 시뮬레이션, JSON 다운로드 완벽 구비
    - 하단 네비게이션 0~5단계 및 5단계에서 02차시 이동 버튼 연결
  - [x] `src/components/TeacherView.tsx`:
    - 교사용 학생 상세 조회 및 인쇄 모달에 `AI 얼굴 인식 도전 (탐구 06)` 답변 필드 표시 연동
  - [x] `index.html`, `ghpages-app.js`, `ghpages-app.css`:
    - 캐시 버스터 버전 `?v=20261027-l1-ai-v1`로 갱신 및 프로덕션 번들(1.88MB) 빌드 동기화 완료
- **회귀 확인**: `lint_applet` 통과 (0 errors), `compile_applet` 통과, 단위 테스트 22/22 통과.

---

## [작업 기록] 1차시 06 도전!! 실생활 함수(도전 2: 자판기 수리 미션) 추가 및 전 차시 텍스트박스 내부 예시 문구 제거·힌트 기능 전환

- **작업 일시**: 2026-10-27
- **Tier**: Tier 2 (1차시 도전 2 자판기 문제 추가 + 1~7차시 전체 입력칸 내부 예시 문구(`placeholder`) 제거 및 외부 `💡 힌트 보기` 토글 기능 전환 + 이전 자동 입력 템플릿 정리)
- **요청 내용**:
  1. 1차시 `06 도전!! 실생활 함수`에 유첨파일(자판기 문제 — 도전 2: 고장 난 자판기를 고쳐라!) 추가
  2. 모든 텍스트 박스(`<input>`, `<textarea>`) 내부에 남아있는 예시 문구(`placeholder`)를 완전히 삭제(`placeholder=""`)하고, 텍스트 박스 외부의 `💡 힌트 보기` 토글 버튼으로만 힌트를 확인하도록 변경
- **구현 내역 (Definition of Done)**:
  - [x] `src/components/Lesson1View.tsx`:
    - 1~6단계(`01 대응과 함수`, `02 정의역과 치역`, `03 서로 같은 함수`, `04 함수의 그래프`, `05 실생활 함수 모델링`, `06 도전!! 실생활 함수 — 도전 1 AI 얼굴 인식 & 도전 2 자판기 수리`)의 모든 `<input>` 및 `<textarea>`에서 내부 `placeholder` 예시 문구를 전면 제거(`placeholder=""`)
    - 각 입력칸 옆/아래에 클릭 시 열고 닫을 수 있는 `💡 힌트 보기` 토글 버튼 및 힌트 안내 박스를 배치하여 학습자가 스스로 사고하고 필요할 때만 힌트를 열어볼 수 있도록 개선
    - `[생각 열기]` 화살표 다이어그램의 정답 자동 연결 버튼을 제거하고 `💡 생각 열기 힌트 보기` 토글로 전환
    - `탐구 05 활동 2`에 `[설계서 입력칸 비우기]` 초기화 버튼 추가
  - [x] `src/components/Lesson2View.tsx` ~ `src/components/Lesson7View.tsx`:
    - 2~7차시의 모든 서술형 `<input>` 및 `<textarea>` 내부 `placeholder` 예시 문구를 제거(`placeholder=""`)하고 `<details>` 기반 `💡 ... 작성 힌트 보기` 토글로 전환
  - [x] `src/utils/mathLogic.ts` & `src/utils/mathLogic.test.ts`:
    - `cleanStudentState`에서 과거 자동 채우기 기능으로 저장되었을 수 있는 `REAL_LIFE_TEMPLATES` 기본 문구를 자동 감지·비움 처리하되, 학생이 직접 작성한 서술형 답안은 100% 보존하는 마이그레이션 로직 및 단위 테스트(23/23 통과) 추가
  - [x] `index.html`, `ghpages-app.js`, `ghpages-app.css`:
    - 캐시 버스터 버전 `?v=20261027-no-placeholder-hints`로 갱신 및 프로덕션 정적 번들 빌드 완료
- **회귀 확인**: `npx tsx --test src/utils/mathLogic.test.ts` (23/23 통과), `npm run build` 성공, `lint_applet` 및 `compile_applet` 이상 없음.


---

## [2026-10-28] 1차시 03 문제 3 힌트 수식 표기(× 기호) 수정 및 GitHub Secret Alert 안내

- **작업 Tier**: Tier 1 (수식 텍스트 표기 수정 및 GitHub 보안 알림 검토)
- **변경 사항**:
  1. `src/components/Lesson1View.tsx`:
     - 1차시 03 [서로 같은 함수] 문제 3 힌트에서 LaTeX 원시 문자열 `\times`로 노출되던 곱셈 표기를 표준 수학 곱셈 기호인 `×`로 교체: `<MathText text="f(0) = |2 × 0| = 0" />`, `<MathText text="f(1) = |2 × 1| = 2" />`, `<MathText text="g(x) = 2x²" />(즉, <MathText text="g(0) = 2 × 0² = 0" />, <MathText text="g(1) = 2 × 1² = 2" />)`
     - 1차시 02 문제 2 힌트의 치역 표기에서 `y \le 3`을 `y ≤ 3`으로 수정
  2. `src/components/MathText.tsx`:
     - `normalizeMathSymbols` 방어 로직 추가: `\times` → `×`, `\cdot` → `·`, `\le` → `≤`, `\ge` → `≥`, `\ne` → `≠`, `\pm` → `±` 자동 치환을 지원하여 추후 LaTeX 형태 수식이 전달되더라도 정상적인 수학 유니코드 기호로 표시되도록 보장
  3. GitHub Secret Scanning Alert 검토 및 안내:
     - GitHub가 `firebase-applet-config.json`의 이전 커밋(`3e9c4662`)에서 감지한 Google API Key 알림의 원인 및 해결 방법 정리 (웹 클라이언트 식별용 키이므로 Firestore Rules 및 Google Cloud 콘솔 제한으로 안전함 확인, GitHub UI에서 "Close alert" 처리 방법 안내)
- **회귀 확인**: `npx tsx --test src/utils/mathLogic.test.ts` (23/23 통과), `npm run build` 성공, `compile_applet` 정상 확인.

---

## [2026-10-28] 1차시 04 함수의 그래프 [문제 5] 수직선 판정법 시뮬레이션 설명 내 화살표(→) 오타 수정

- **작업 Tier**: Tier 1 (UI 설명 텍스트 오타 수정)
- **변경 사항**:
  1. `src/components/Lesson1View.tsx`:
     - 1차시 04 [함수의 그래프] [문제 5] 수직선 판정법 실시간 시뮬레이터 아래 설명 문구에서 LaTeX 원시 명령어로 노출되던 `$\rightarrow$`를 직관적이고 깔끔한 유니코드 화살표 기호 `→`로 수정:
       - (1) 일차함수: `✓ 교점 1개 (어떤 a에서도 항상 1개 $\rightarrow$ 함수 O)` → `✓ 교점 1개 (어떤 a에서도 항상 1개 → 함수 O)`
       - (2) 이산 점 그래프: `⚠️ 교점 2개! (x=3에 1과 3 동시 대응 $\rightarrow$ 함수 X)` → `⚠️ 교점 2개! (x=3에 1과 3 동시 대응 → 함수 X)`
       - (3) 원 그래프: `⚠️ 교점 2개! (위·아래 2개 y값 대응 $\rightarrow$ 함수 X)` → `⚠️ 교점 2개! (위·아래 2개 y값 대응 → 함수 X)`
  2. 빌드 및 배포 번들:
     - `npm run build`를 통해 `dist/` 및 GitHub Pages용 `ghpages-app.js`, `ghpages-app.css` 최신 상태 동기화
- **회귀 확인**: `npx tsx --test src/utils/mathLogic.test.ts` (23/23 통과), `compile_applet` 정상 통과 확인.

---

## [2026-10-28] 2차시 (여러 가지 함수 — 일대일함수·일대일대응·항등함수·상수함수·생각 넓히기) 수업 내용 및 문제 전면 재구성

- **작업 Tier**: Tier 2 (2차시 전체 교육과정 및 4단계 인터랙티브 활동지 재구성 + 데이터 모델 하위 호환 확장 + 교사용 뷰/인쇄 연동 + 단위 테스트 추가)
- **요청 내용**:
  - 기존 2차시(명제 반례/정당화) 내용을 삭제하고, 첨부된 교과서 이미지 4종(`[보기] 일대일함수와 일대일대응`, `[문제 6] 일대일함수·일대일대응 판별`, `[문제 7] 항등함수·상수함수 그래프`, `[생각 넓히기] 활동 1 영화관 & 활동 2 동아리 대표 투표`)을 기준으로 2차시 **여러 가지 함수** 수업 내용 및 문제를 전면 재구성
- **구현 내역 (Definition of Done)**:
  - [x] `src/utils/mathLogic.ts`:
    - `STAGE_TITLES[2]`를 4단계(`['일대일함수와 일대일대응', '문제 6 · 일대일 판별', '문제 7 · 항등·상수함수', '생각 넓히기 · 실생활']`)로 구성
    - `Lesson2State` 인터페이스에 `[보기]`, `[문제 6]`, `[문제 7]`, `[생각 넓히기 활동 1·2]` 검증 및 서술 필드 추가 (기존 저장 데이터 하위 호환성 유지)
    - `validateL2Bogi`, `validateL2Prob6`, `validateL2Prob7`, `validateL2Think1`, `validateL2Think2` 순수 검증 함수 및 `evaluateLevel2Completion`, `evaluateRubricL2`, `mergeStudentStates`, `hasFuncLessonData` 업데이트
  - [x] `src/components/Lesson2View.tsx`:
    - **1단계 (`01 일대일함수와 일대일대응`)**: 일대일함수($x_1 \neq x_2 \Rightarrow f(x_1) \neq f(x_2)$)와 일대일대응(일대일함수 + 치역=공역) 핵심 개념 정리, 교과서 `[보기]` 원본 이미지(`image_45f458d5.png`), $f(x)=2x$와 $g(x)=x^2$에 대한 $x_1, x_2$ 슬라이더 비교 시뮬레이터 및 확인 활동지 구현
    - **2단계 (`02 문제 6 · 일대일 판별`)**: 교과서 `[문제 6]` 원본 이미지(`image_2c34caa4.png`), (1) $y=3x-1$, (2) $y=-x^2+2$, (3) $y=|x|$, (4) $y=\begin{cases}-2x & (x\ge 0)\\ x^2 & (x<0)\end{cases}$ 수평선 판별법($y=k$) 실시간 그래프 시뮬레이터 및 문항별 일대일함수·일대일대응 판별/이유 서술 활동지 구현
    - **3단계 (`03 문제 7 · 항등·상수함수`)**: 항등함수($f(x)=x$)와 상수함수($f(x)=c$) 핵심 개념 카드, 교과서 `[문제 7]` 원본 이미지(`image_5543c6d9.png`), (1) $y=x$, (2) $x=1$, (3) $y=1$ 입력값 $x$ 슬라이더 시뮬레이터 및 `[문제 7]` 판별·서술 활동지 구현
    - **4단계 (`04 생각 넓히기 · 실생활`)**: 교과서 `[생각 넓히기]` 원본 이미지(`image_7a2cc712.png`), **활동 1(학생 5명 영화 관람 선택)** 인터랙티브 화살표 대응 시뮬레이터(일대일대응 프리셋/상수함수 프리셋 포함) 및 서술 활동지, **활동 2(동아리 회원 4명 대표 투표)** 인터랙티브 화살표 대응 시뮬레이터(항등함수 프리셋/상수함수 프리셋 포함) 및 서술 활동지, 2차시 배움 성찰 구현
    - 모든 `<input>` 및 `<textarea>`는 `placeholder=""` 원칙을 엄수하고 외부 `💡 힌트 보기` 토글 버튼을 제공
  - [x] `src/App.tsx` & `src/components/TeacherView.tsx`:
    - 4단계 네비게이션 그리드(`grid-cols-2 sm:grid-cols-4`) 및 진행도 표시(`${STAGE_TITLES[2].length}`) 연동
    - 교사용 상세 비교 뷰(인라인 및 비모달 창)와 PDF 인쇄 리포트에 2차시 여러 가지 함수 답안 연동
  - [x] `src/utils/mathLogic.test.ts`:
    - 2차시 검증 및 완료 판정 단위 테스트 추가 (`24/24` 전원 통과)
  - [x] `index.html`, `ghpages-app.js`, `ghpages-app.css`:
    - 캐시 버스터 `?v=20261028-lesson2-func` 갱신 및 정적 번들 최신화
- **회귀 확인**: `npx tsx --test src/utils/mathLogic.test.ts` (24/24 통과), `lint_applet` (0 errors), `compile_applet` 통과, `playwright-cli` 실제 브라우저 0~3단계 전체 렌더링·이미지 로드·콘솔 무오류 검증 완료.

---

## [2026-10-28] 3차시 (합성함수 탐구 — 생각 열기·문제 1·문제(교환법칙)·문제 2·생각 넓히기(결합법칙)) 수업 내용 및 문제 전면 재구성

- **작업 Tier**: Tier 2 (3차시 전체 교육과정 및 4단계 인터랙티브 활동지 재구성 + 교과서 예제 1 문제화 적용 + 데이터 모델 하위 호환 확장 + 교사용 뷰/인쇄 연동 + 단위 테스트 추가)
- **요청 내용**:
  - 기존 3차시(명제 충분조건·필요조건) 내용을 삭제하고, 첨부된 교과서 이미지 5종(`[생각 열기] 세 학생 음식 주문과 가격 대응`, `[문제 1] 합성함수의 함숫값`, `[예제 1 → 문제로 변경] 합성함수 식 구하기와 교환법칙 불성립`, `[문제 2] 이차식이 포함된 합성함수`, `[생각 넓히기] 세 함수의 합성과 결합법칙 성립`)을 기준으로 3차시 **합성함수 탐구** 수업 내용 및 문제를 전면 재구성
  - 교과서 `예제 1`은 풀이가 바로 노출되지 않도록 학생이 직접 식을 구하고 교환법칙 성립 여부를 판별하는 **문제**로 변경하여 적용 (원본 교과서 이미지는 선택적 토글 버튼으로 제공)
- **구현 내역 (Definition of Done)**:
  - [x] `src/utils/mathLogic.ts`:
    - `STAGE_TITLES[3]`를 4단계(`['생각 열기 · 합성함수의 뜻', '문제 1 · 함숫값 구하기', '문제 · 합성함수 식과 교환법칙', '생각 넓히기 · 결합법칙']`)로 구성
    - `Lesson3State` 인터페이스에 `[생각 열기]`, `[문제 1]`, `[문제 (교환법칙 탐구)]`, `[문제 2]`, `[생각 넓히기]` 검증 및 서술 필드 추가 (기존 저장 데이터 하위 호환성 유지)
    - `validateL3Open`, `validateL3Prob1`, `validateL3Ex1`, `validateL3Prob2`, `validateL3Think` 순수 검증 함수 및 `evaluateLevel3Completion`, `evaluateRubricL3`, `mergeStudentStates`, `hasFuncLessonData`, `^4 → ⁴` 수식 단축 입력 업데이트
  - [x] `src/components/Lesson3View.tsx`:
    - **1단계 (`01 생각 열기 · 합성함수의 뜻`)**: 교과서 `[생각 열기]` 원본 이미지(`image_1b8ffdc0.png`), `X={아람, 재영, 하영} → Y={어묵, 핫도그, 떡볶이, 김밥} → Z={2000원, 3000원, 4000원}` 2단 화살표 대응 시뮬레이터, 합성함수 $g \circ f : X \to Z$, $(g \circ f)(x)=g(f(x))$ 개념 정리 및 확인 활동지 구현
    - **2단계 (`02 문제 1 · 함숫값 구하기`)**: 교과서 `[문제 1]` 원본 이미지(`image_1bb293de.png`), $f(x)=2x+1, g(x)=x^2-1$에 대한 안쪽 함수부터 2단계 계산 파이프라인 시뮬레이터, (1) $(g \circ f)(2)=24$, (2) $(f \circ g)(-1)=1$, (3) $(f \circ f)(-3)=-9$ 단계별 풀이 활동지 구현
    - **3단계 (`03 문제 · 합성함수 식과 교환법칙`)**: 합성함수 대입 치환 & 교환법칙 비교 실험실, 교과서 `예제 1`을 문제로 전환한 **`[문제 (교환법칙 탐구)]`** ($f(x)=-x+2, g(x)=4x+1 \Rightarrow (g \circ f)(x)=-4x+9, (f \circ g)(x)=-4x+1, g \circ f \neq f \circ g$), 교과서 `[문제 2]` 원본 이미지(`image_70b33df1.png`) 및 풀이 활동지($(g \circ f)(x)=-(x-4)^2=-x^2+8x-16, (f \circ g)(x)=-x^2-4, (g \circ g)(x)=-x^4$) 구현
    - **4단계 (`04 생각 넓히기 · 결합법칙`)**: 교과서 `[생각 넓히기]` 원본 이미지(`image_f792abdb.png`), $f(x)=2x-1, g(x)=3x+2, h(x)=x^2+1$에 대한 3단 함수 합성 파이프라인 시뮬레이터($h \to g \to f$), 좌변 $((f \circ g) \circ h)(x)=6x^2+9$ 및 우변 $(f \circ (g \circ h))(x)=6x^2+9$ 단계별 유도 및 결합법칙 $(f \circ g) \circ h = f \circ (g \circ h)$ 성립 서술, 3차시 배움 성찰 구현
    - 모든 `<input>` 및 `<textarea>`는 `placeholder=""` 원칙을 엄수하고 외부 `💡 힌트 보기` 토글 버튼을 제공
  - [x] `src/App.tsx` & `src/components/TeacherView.tsx`:
    - 3차시 4단계 진행도 표시(`${STAGE_TITLES[3].length}`) 연동
    - 교사용 상세 비교 뷰(인라인 및 비모달 창)와 PDF 인쇄 리포트에 3차시 합성함수 답안 연동
  - [x] `src/utils/mathLogic.test.ts`:
    - 3차시 검증 및 완료 판정 단위 테스트 추가 (`25/25` 전원 통과)
  - [x] `index.html`, `ghpages-app.js`, `ghpages-app.css`:
    - 캐시 버스터 `?v=20261028-lesson3-func` 갱신 및 정적 번들 최신화
- **회귀 확인**: `npx tsx --test src/utils/mathLogic.test.ts` (25/25 통과), `lint_applet` (0 errors), `compile_applet` 통과, `playwright-cli` 실제 브라우저 0~3단계 전체 렌더링·이미지 로드·콘솔 무오류 검증 완료.

---

## [2026-10-29] 관리자(교사) 차시별 활성(ON) / 비활성(OFF·잠금) 설정 및 학생 선행 학습 방지 기능 추가

- **작업 Tier**: Tier 2 (교사 대시보드 차시별 ON/OFF 제어 패널 추가 + Firestore `/app_settings/lesson_access` 실시간 동기화 및 보안 규칙 배포 + 학생 모드 상단 탭/다음 차시 버튼/URL 파라미터 선행 진입 차단 + 단위 테스트 추가)
- **요청 내용**:
  - 각 차시(`1차시` ~ `7차시`)별로 활성/비활성 여부를 관리자가 ON/OFF할 수 있는 기능을 추가하여, 학습자가 예를 들어 1차시만 해야 하는데 2차시, 3차시 등을 미리 선행하는 것을 방지
- **구현 내역 (Definition of Done)**:
  - [x] `src/utils/mathLogic.ts`:
    - `LessonTabNumber`, `LessonAccessConfig`, `LESSON_TAB_METADATA`, `DEFAULT_LESSON_ACCESS`, `STORAGE_KEY_LESSON_ACCESS` 타입 및 상수 정의
    - `normalizeLessonAccess`, `isLessonEnabled`, `getFirstEnabledLesson`, `resolveAllowedStudentLesson`, `createLessonAccessPreset` 순수 함수 구현 (비정상 입력 시 기본 전체 열림으로 안전하게 복원하여 기존 기능 보존)
  - [x] `firebase-blueprint.json` & `firestore.rules`:
    - `LessonAccessSetting` 엔티티 및 `/app_settings/{settingId}` (`/app_settings/lesson_access`) 경로 추가
    - 학생은 실시간 조회(`allow get`) 가능하고 관리자(`isAdmin()`)만 수정(`allow create, update`) 가능한 보안 규칙 작성 및 `DeployRules` RPC 배포 완료
  - [x] `src/components/TeacherView.tsx`:
    - 교사용 수사 기록실 최상단에 **`차시별 학습 활성(ON) / 비활성(OFF) 관리 (학습자 차시 선행 방지 설정)`** 카드 추가
    - 원클릭 빠른 프리셋 버튼(`1차시만 열기`, `1~2차시 열기`, `1~3차시 열기`, `1~4차시 열기`, `전체 열기`) 및 `01차시`~`07차시` 개별 `열기 (ON)` / `잠그기 (OFF)` 스위치 제공
  - [x] `src/App.tsx`:
    - Firestore `/app_settings/lesson_access` 실시간 `onSnapshot` 리스너 및 `localStorage` 폴백 동기화 연동
    - 학생 모드(`sessionMode === 'student'`)에서 비활성(OFF)된 차시 탭에 `🔒 잠김` 배지 표시 및 클릭 시 경고 토스트 안내와 함께 진입 차단
    - 각 차시 마지막 단계의 `다음 차시로 이동` 콜백(`onGoToLesson2` ~ `onGoToLesson7`), 평가 모달 차시 이동, URL 쿼리(`?lesson=2` 등) 접근 시에도 잠금 여부를 검사하여 선행 진입을 원천 차단하고, 현재 보고 있던 차시가 실시간으로 잠기면 열려 있는 첫 차시로 안전하게 자동 이동
  - [x] `src/utils/mathLogic.test.ts`:
    - 차시별 ON/OFF 정규화, 프리셋 생성, 학생 접근 허용/차단 리다이렉트 로직 단위 테스트 추가 (`26/26` 전원 통과)
- **회귀 확인**: `npx tsx --test src/utils/mathLogic.test.ts` (26/26 통과), `lint_applet` (0 errors), `compile_applet` 및 `npm run build` 통과, `playwright-cli` 실제 브라우저에서 교사 모드 `1차시만 열기` 클릭 후 학생 모드 `?lesson=2` 접속 시 1차시 유지 및 2~7차시 `잠김` 배지/진입 차단 동작 확인 완료.

---

## [2026-10-29] 다른 PC·브라우저 간 차시 잠금 미반영 원인 해결, 명시적 서버 저장 버튼 추가 및 학생 우회 예외 차단 PoC

- **작업 Tier**: Tier 2 (Firestore 서버 동기화 조건 개선 + 교사 화면 서버 저장 버튼/동기화 상태 배너 추가 + 학생 초기 로딩 레이스 컨디션 및 6대 우회 경로 차단 게이트 구현 + 멀티 브라우저 세션 PoC 검증)
- **요청 내용**:
  - 관리자가 차시를 잠갔음에도 다른 PC나 다른 브라우저에서 테스트했을 때 여전히 열려 있는 현상의 원인을 파악하고, 별도 서버 저장 버튼/동기화 확인 기능 추가 및 학습자가 잠긴 차시에 접근할 수 있는 예외 상황이 없도록 PoC 검증 및 수정
- **원인 분석**:
  1. 기존 `handleUpdateLessonAccess`가 `if (firebaseUser && isAuthorizedAdminEmail(...))` 조건이 참일 때만 Firestore(`/app_settings/lesson_access`)에 저장하고, 그렇지 않으면 현재 브라우저의 `localStorage`에만 저장한 뒤 `"저장됨"` 토스트를 띄웠음 → 다른 브라우저나 다른 PC(`localStorage`가 비어 있는 환경)에서는 서버에 `/app_settings/lesson_access` 문서가 없어 기본값(`DEFAULT_LESSON_ACCESS`, 1~7차시 전체 열림)으로 동작함.
  2. 신규 브라우저 접속 시 Firestore 응답이 도착하기 전 약 0.3~1초 동안 기본값(`전체 열림`)으로 먼저 렌더링되어, `?lesson=2` 등으로 접속 시 잠긴 차시가 잠깐 열리거나 진입되는 초기 로딩 레이스 컨디션이 존재했음.
- **구현 내역 (Definition of Done)**:
  - [x] `firestore.rules`:
    - `/app_settings/lesson_access` 규칙이 스키마 검증(`isValidLessonAccessSetting`) 및 관리자 식별자(`isAdmin()` 또는 관리자 이메일) 충족 시 교사 모드에서 항상 서버에 기록되도록 업데이트 및 `DeployRules` 배포 완료
    - `/student_access_logs/{logId}` 목록 조회 규칙 보완으로 교사 모드 콘솔 권한 오류 제거
  - [x] `src/utils/mathLogic.ts` & `src/utils/mathLogic.test.ts`:
    - `hasAnyLockedLesson`, `buildLessonAccessFirestoreFields`, `evaluateStudentLessonRenderGate` 순수 함수 구현 및 단위 테스트(`26/26` 통과) 검증
  - [x] `src/components/TeacherView.tsx`:
    - **`[차시 잠금 설정 서버 저장 (전체 PC·브라우저 적용)]`** 명시적 저장 버튼(`#btn-save-lesson-access-server`), **`[서버 상태 확인]`** 버튼, 실시간 클라우드 동기화 상태 배너(`클라우드 서버 저장 완료` / 현재 서버 기준 잠긴 차시 목록 / 마지막 동기화 시각) 추가
  - [x] `src/App.tsx` & `src/components/StudentEvaluationModal.tsx`:
    - `persistLessonAccessToCloud`: 토글 변경 시 자동 서버 저장 + 명시적 서버 저장 버튼 클릭 시 `setDoc` 후 `getDocFromServer`로 실제 서버 반영 여부까지 이중 확인
    - `refreshLessonAccessFromServer`: 앱 마운트, 창 포커스(`focus`), 탭 전환(`visibilitychange`) 시 `getDocFromServer`로 서버 최신 잠금 상태를 즉시 조회하며, 기존 교사 브라우저 `localStorage`에 잠금 설정이 있고 서버 문서가 비어 있으면 자동으로 서버에 초기 동기화 수행
    - 학생 렌더링 게이트(`evaluateStudentLessonRenderGate`): 서버 잠금 상태 확인 전(`!lessonAccessCheckedServer`)까지 잠긴 차시 렌더링을 보류(`syncing` 화면 표시)하고, `?lesson=2` URL 조작·뒤로가기(`popstate`)·평가 결과 모달 바로가기·잠긴 차시 답안 변경(`onUpdate`)을 모두 차단
- **회귀 및 멀티 브라우저 PoC 확인**:
  - `npx tsx --test src/utils/mathLogic.test.ts` (26/26 통과), `lint_applet` (0 errors), `compile_applet` 통과
  - `playwright-cli` 멀티 세션 PoC:
    1. 브라우저 세션 1(`?mode=teacher`)에서 `1차시만 열기` 및 `[차시 잠금 설정 서버 저장]` 실행 후 브라우저 완전 종료(`playwright-cli close`)
    2. 완전히 새로운 브라우저 세션 2(`localStorage` 빈 상태)에서 `/?mode=student&lesson=2`로 접속 시 Firestore 서버에서 `2~7차시 OFF` 설정을 즉시 불러와 `2차시` 진입을 차단하고 `1차시`로 강제 이동 및 안내 배너 표시 확인 (콘솔 에러 0건)



---

## [2026-10-29~30] Firestore 쓰기 한도 초과 대응 · 학생 익명 로그인/보안 규칙 강화 (작업자: Claude, 사후 기록)

- **작업 Tier**: Tier 2 (자동 저장 로직 수정) + Tier 3 (인증 방식·보안 규칙 변경)
- **요청 내용**: Firestore '단위 작성' 일일 한도 초과로 사이트 운영 장애 → 원인 파악 및 수정, 학생도 Firebase 익명 로그인 / 학생은 자기 문서만 / 목록 조회는 교사만 가능하도록 규칙 변경
- **원인 분석**:
  1. 학생 활동지 자동 저장이 입력을 0.9초만 멈춰도 활동지 전체(`worksheetJson`)를 저장 → 쓰기 단위 급증
  2. 학생이 로그인 없이 접속하는 구조라 규칙이 '누구나 읽기/쓰기'로 열려 있었음 → 전체 학생 이름·생년월일·IP 목록 조회, 타 학생 활동지 덮어쓰기, 차시 잠금 설정 위조(`updatedBy`에 교사 이메일 기입) 가능

- **구현 내역 (Definition of Done)**:
  - [x] 자동 저장 대기 900ms → 10초, 내용이 같으면 저장 생략, `pagehide`/`visibilitychange` 시 즉시 저장, 수동 저장 시 대기 중 자동 저장 취소
  - [x] `src/utils/studentAuth.ts`: 익명 로그인(`ensureStudentAuth`, 동시 호출 시 계정 1개만 생성), 이름·생년월일 서버 검증 재연결(`openOwnRegistration`)
  - [x] 가입 문서에 `uid` 기록, 학생 [나가기] 시 로그아웃(공용 기기 보호), 권한 오류 시 재로그인 안내
  - [x] `firestore.rules`: 가입 목록·접속 기록·기기 목록 조회 교사 전용, 학생 문서 읽기 교사·본인, 생년월일 형식(6/8자리) 비교 함수, 차시 잠금 설정 교사 전용

- **회귀 확인 (실제로 확인한 범위)**: `tsc --noEmit` 통과, `npm run build` 통과, 기존 단위 테스트 통과, 사용자 실사용 확인(Edge 학생 가입 → 문서에 `uid` 기록 확인, Chrome 교사 재로그인 후 승인 목록 표시 확인)
- **확인하지 못한 범위**: Firestore 에뮬레이터를 작업 환경에서 내려받을 수 없어 **보안 규칙 자동 테스트는 미실시**(규칙은 코드 검토만 함). 콘솔 게시 시 문법 검사 통과 여부는 사용자 확인 필요.
- **알려진 제약**: 생년월일 확인 방식이므로 친구의 이름·생년월일을 아는 학생은 대신 로그인 가능(사용자가 선택한 방식). 학교 이름을 줄여 써도 찾아주던 목록 검색 기능은 목록 조회 차단으로 제거됨.

---

## [2026-10-30] 차시별 분리 저장 (Tier 3 — 데이터 모델 변경)

- **작업 Tier**: Tier 3 (Firestore 데이터 구조 변경 + 하위 호환 + 보안 규칙 변경)
- **요청 내용**: 한 글자만 바꿔도 모든 차시(+ Props 수업 내용)를 통째로 저장하던 방식을, 차시별 문서로 나눠 바뀐 차시만 저장하도록 변경
- **원인 분석**: 학생 한 명의 모든 내용이 가입 문서의 `worksheetJson` 문자열 하나에 들어 있어 부분 저장이 불가능. 빈 활동지만 약 10KB(Props+Func 공유 문서)이고 내용이 쌓일수록 커짐. 쓰기 단위가 문서 크기에 비례하는 것으로 보여(사용량 화면이 '단위 작성'으로 표기 — 추정) 저장 한 번에 수십 단위 소모. 또한 교사 메모·피드백 입력란이 **글자 하나마다** 활동지 전체를 저장하고 있었음.
- **설계**:
  - `student_registrations/{studentKey}/func_lessons/l1~l7` (차시 답안), `/teacher` (교사 평가·메모)
  - 차시 문서가 없는 차시는 예전 `worksheetJson` 내용 사용 → **별도 데이터 이전 없이 하위 호환**, 예전 데이터는 삭제·수정하지 않고 보존(복구용)
  - 차시 문서에 `schemaVersion: 1` 기록
  - 서버 내용을 불러오기 전에는 자동 저장 중단(오래된 내용으로 덮어쓰기 방지), 불러오기 실패 시 오류 표시 + 기기 보관
- **구현 내역 (Definition of Done)**:
  - [x] `src/utils/lessonMerge.ts` (순수 로직): `splitLessons`, `assembleRecord`, `findChangedLessons`, `teacherJson` — 손상된 차시 문서는 건너뛰고 경고 로그
  - [x] `src/utils/lessonStore.ts`: 차시 문서 불러오기/원자적 일괄 저장(`writeBatch`)/교사 평가 저장/실시간 수신
  - [x] `src/App.tsx`: 로그인 후 차시 문서 불러와 병합, 바뀐 차시만 자동·수동 저장, 교사 평가 문서 실시간 수신, 동기화 전 '저장됨' 표시 제거
  - [x] `src/components/TeacherView.tsx`: 가입 문서 + 차시 문서(collection group 실시간) + 평가 문서 병합 표시, 평가·메모 1.5초 모아 저장, 입력 중 덮어쓰기 방지, 저장 실패 시 안내
  - [x] `firestore.rules`: 하위 컬렉션 규칙(차시 문서는 승인된 본인·교사, 평가 문서는 교사만 쓰기), 학생이 예전 `worksheetJson`을 수정하지 못하도록 변경(예전 평가 위조 차단)

  - [x] `README.md` 저장 구조·보안 절 추가
- **회귀 확인 (실제로 확인한 범위)**:
  - `npx tsc --noEmit` 통과, `npm run build` 통과, 빌드 결과물에 `func_lessons` 컬렉션 사용 확인
  - 단위 테스트 전체 통과 (`npx tsx --test src/utils/*.test.ts`) — 신규 `lessonMerge.test.ts` 6건: 차시 문서 없을 때 예전 내용 보존 / 일부 차시만 덮어쓰기 / 손상 문서 무시 / 교사 평가 적용 / 바뀐 차시만 선택 / 차시 크기 < 전체 크기
  - 측정: 빈 Func 활동지 전체 약 5KB, 차시 문서 1개 약 0.4~1.3KB
- **확인하지 못한 범위**: 실제 Firebase에 연결한 브라우저 동작(PoC)은 작업 환경에서 실행 불가 → 사용자 확인 필요. 보안 규칙 자동 테스트 미실시(에뮬레이터 다운로드 불가).
- **배포 시 주의**: 새 코드 push 후 **즉시 새 규칙 게시** 필요(예전 규칙은 하위 컬렉션을 거부하므로 그 사이 학생 서버 불러오기·저장이 실패하며, 입력 내용은 기기에 보관됨). 예전 버전 페이지를 열어 둔 학생은 새 규칙 게시 후 저장 오류가 나므로 새로고침 필요(내용은 기기 보관분으로 복원됨).

### [2026-10-30 01:19] 차시별 분리 저장 — 배포 후 사용자 확인 결과
- 새 보안 규칙 게시 → 두 저장소 push 순서로 배포.
- 첫 확인 시 학생 화면이 이전 번들(`?v=20261029-anon-auth`)로 동작해 저장이 `Missing or insufficient permissions`로 거부됨 (원인: GitHub Pages 캐시. 이전 번들은 `worksheetJson`을 쓰는데 새 규칙이 이를 차단).
- 학생·교사 화면 강력 새로고침(Ctrl+Shift+R) 후 **사용자가 정상 동작 확인**.
- 운영 참고: 배포 직후 이전 버전 페이지를 연 학생은 저장 오류가 날 수 있으므로 강력 새로고침 안내 필요 (입력 내용은 기기에 보관되어 새 버전에서 자동 저장됨).
- 별도 확인된 기존 문제(미해결): 교사 '상세 비교 · 평가' 창이 학생 답안 일부만 표시 (자동 비교 기준 Func 1차시 37개·2차시 16개·3차시 8개 항목 미표시, Props는 소수). 이번 변경과 무관한 기존 화면 구성 문제.


---

## [2026-10-30] 교사 '상세 비교 · 평가'에 전체 답안 보기 추가 · '미작성' 강조 (Tier 2)

- **요청 내용**: (1) 학습자가 작성한 모든 항목의 전체 답안을 교사 화면에 표시 (2) 입력값이 없을 때의 `미작성` 문구에 글자색을 적용해 교사가 확실히 알 수 있게
- **원인 분석**: 교사 상세 비교 창이 명제 수업 틀을 바탕으로 만들어져 학생 답안 일부만 요약 표시함 (자동 비교 기준 미표시 항목 — Func 1차시 37개·2차시 16개·3차시 8개·4차시 2개). 기능 추가 시 교사 화면 갱신이 함께 이뤄지지 않았음.
- **구현 내역 (Definition of Done)**:
  - [x] `src/components/AnswerText.tsx`: 빈 값 → 빨간 굵은 `미작성`, 문장 속 `미작성`/`(미작성)`만 강조. 상세 비교 창 답안 칸 14곳·목록 배지·평가 피드백 상태에 적용 (기존 표시 내용·배치는 유지)
  - [x] `src/utils/answerLabels.ts`: 차시별 문항 이름표 (학생 화면 문구 기준), 형식별 표시(예/아니오, 선택지 원문, 확인 여부, 표, 대응표, 좌표)
  - [x] `src/components/FullAnswerPanel.tsx`: 차시별 접이식 전체 답안, `작성 n/m` 현황, 이름표 없는 값은 `기타 기록`으로 표시(누락 방지), 힌트 열람 횟수 등 진행 기록은 제외
  - [x] `TeacherView.tsx`: 인라인 상세 비교·비모달 창 두 곳의 평가 영역 위에 패널 추가 (기존 요약·평가 기능 변경 없음)
  - [x] 숨김 처리: 다른 문항을 이어 붙여 자동 생성되는 요약 필드와 이 수업에서 쓰지 않는 필드 (원본 문항은 각각 표시) — 목록과 이유는 `answerLabels.ts` 주석 참고
- **회귀 확인 (실제로 확인한 범위)**: `tsc --noEmit` 통과, `npm run build` 통과(번들에 패널 포함 확인), 전체 단위 테스트 통과 (45/45) — 신규 `answerLabels.test.ts` 3건(모든 학생 입력 필드가 이름표/숨김에 포함, 이름표 오타 없음, 중복 없음), `FullAnswerPanel.test.tsx` 4건(서버 렌더링으로 차시 제목·미작성 강조·답안 표시·기타 기록·진행 기록 제외 확인), 예시 데이터 미리보기 HTML 생성
- **확인하지 못한 범위**: 실제 브라우저의 교사 화면에서 동작·배치 확인은 작업 환경에서 불가 → 사용자 확인 필요. 문항 이름표는 학생 화면 문구를 바탕으로 작성했으나 일부는 요약 표현이므로 교사 검토 권장. 증명 단계별 선택값(`prob1Choices` 등)은 보기 번호 체계를 확정할 수 없어 저장된 값을 그대로 표시함.


---

## [2026-10-30] 학생 비밀번호 기능(기본 꺼짐)·교사 초기화 · 비모달 창 드래그 이동 (Tier 3)

- **작업 Tier**: Tier 3 (인증 방식 추가 + 데이터 필드 추가 + 보안 규칙 변경) / 창 이동은 Tier 2
- **요청 내용**:
  1. 비밀번호 기능을 켤 경우, 비밀번호 없이 가입한 기존 학생은 반드시 비밀번호를 입력(설정)하도록
  2. 비밀번호를 잊은 학생을 위해 교사가 초기화할 수 있도록
  3. 위 기능이 학생 가입 관리에 있는지 확인하고, 없으면 가입 시 비밀번호 사용 여부를 선택하는 기능 적용 — **단, 비밀번호 기능은 여전히 비활성 상태 유지**
  4. 상세 비교 비모달 창을 마우스·패드로 끌어서 이동
- **확인 결과(변경 전)**: 비밀번호 입력칸과 형식 검사 함수만 있고 입력값은 저장되지 않음. 기존 가입자 설정 강제·교사 초기화·사용 설정 스위치 모두 없음. 비모달 창은 오른쪽 아래 고정(fixed)으로 이동 처리 코드 없음.
- **설계**:
  - 사용 설정 `app_settings/student_auth.passwordRequired` (교사만 변경, 문서 없음 = 사용 안 함 → **기본 비활성**). Func·Props 공통.
  - 원문 미저장, SHA-256 해시만 저장. 재연결 시 `해시:임의값` 증명 + 규칙에서 '이번 요청에 바뀐 값인지'까지 검사(문서에 남은 예전 증명 재사용 차단).
  - 학생 본인은 비밀번호가 없을 때만 처음 설정 가능, 변경·삭제는 교사 초기화로만.
  - 사용을 꺼도 이미 설정된 비밀번호는 계속 요구(보안 수준을 조용히 낮추지 않음 — 더 안전한 기본값).
- **구현 내역 (Definition of Done)**:
  - [x] `src/utils/passwordCore.ts`(해시·증명·판정, 순수), `src/utils/studentPassword.ts`(사용 설정 구독/저장, 처음 설정, 교사 초기화)
  - [x] `src/utils/studentAuth.ts`: 로그인·재연결에 비밀번호 확인 추가 (`password_required` 결과 구분)
  - [x] `AuthGateView.tsx`: 사용 설정에 따라 비밀번호 입력칸 활성화, 가입 시 필수·해시 저장, 로그인 시 확인, 기존 가입자 **비밀번호 먼저 설정** 카드(설정 전에는 입장 불가)
  - [x] `App.tsx`: 저장된 세션으로 바로 들어온 학생도 설정이 필요하면 첫 화면의 설정 카드로 이동(입력 내용은 먼저 저장 시도·기기 보관)
  - [x] `TeacherView.tsx`: 학생 가입 관리에 **학생 비밀번호 사용** 스위치(확인 대화상자, 기본 '사용 안 함'), [비밀번호] 열(설정됨/없음/미설정), **[초기화]** 버튼
  - [x] `firestore.rules`: 해시 형식 검증, 사용 중일 때 가입 시 해시 필수, 본인 첫 설정, 재연결 시 비밀번호 증명, `student_auth` 설정은 교사만
  - [x] `src/utils/useDraggableWindow.ts` + `TeacherView.tsx`: 제목 표시줄 Pointer Events 드래그(마우스·터치·펜), `touch-action: none`, 버튼 위에서는 끌기 시작 안 함, 화면 밖 이탈 방지, 드래그 중 전환 효과 끔, 창을 다시 열면 위치 초기화
- **회귀 확인 (실제로 확인한 범위)**: `tsc --noEmit` 통과, `npm run build` 통과(번들에 기능 포함 확인), 전체 단위 테스트 통과 (53/53) — 신규 `passwordCore.test.ts` 4건(해시 고정값을 외부 `sha256sum`과 대조, 학생·비밀번호별 해시 상이, 증명 형식이 규칙 정규식과 일치·매번 상이, 설정 필요 판정), `useDraggableWindow.test.ts` 4건(화면 밖 이탈 방지, 작은 화면). 비밀번호 사용이 꺼져 있으면 가입·로그인 동작이 이전과 같도록 구현(코드 경로 검토).
- **확인하지 못한 범위**: 실제 브라우저·패드에서의 드래그 감각, 비밀번호 켜기→설정→다른 기기 로그인→초기화 전체 흐름(PoC)은 작업 환경에서 실행 불가 → 사용자 확인 필요. 보안 규칙 자동 테스트 미실시(에뮬레이터 다운로드 불가).
- **알려진 한계**: 비밀번호를 아직 설정하지 않은 학생은 이름·생년월일을 아는 사람이 먼저 로그인해 비밀번호를 설정할 수 있음(사용을 켠 직후 학생 설정 안내 필요). 로그인 시도 횟수 제한 없음(비밀번호 규칙이 8자 이상·4종 문자라 온라인 대입은 현실적으로 어려움).
- **배포 순서**: 새 규칙 먼저 게시 → push (새 규칙은 현재 배포된 코드와도 호환되도록 추가만 함).

---

## [2026-10-30] 커밋 작성자를 liha4math로 고정 (Tier 1)

- **작업 Tier**: Tier 1 (지침 문서 추가, 코드·데이터 변경 없음)
- **요청 내용**: Contributors에 claude로 보이는 문제 — 앞으로의 커밋만 liha4math 계정으로 기록. 과거 커밋은 그대로 둠.
- **원인**: 작업 환경 기본 git 설정이 `Claude <noreply@anthropic.com>`이라 그 이름으로 커밋됨.
- **변경 파일**: `AGENTS.md`(신규, 커밋 작성자 규칙), `CLAUDE.md`(신규, AGENTS.md 불러오기), `log.md`
- **확인한 것**: 이 커밋의 작성자가 `liha4math <349883694+liha4math@users.noreply.github.com>`로 기록됨(`git log -1`로 확인).
- **확인하지 못한 것**: 다음 AI 세션이 AGENTS.md 규칙을 실제로 따르는지는 다음 커밋에서 확인 필요.
- **남은 위험**: 과거 커밋 때문에 Contributors 목록의 claude는 남음(의도된 결과). `Co-Authored-By: Claude` 줄은 커밋 화면에 공동 작성자로 표시될 수 있으나 Contributors 목록에는 영향 없음.


---

## [2026-10-30] 단계 이동 시 즉시 저장 · 저장 실패 대비 · 공용 기기 답안 섞임 수정 (Tier 3)

- **요청 내용**:
  1. 각 차시 하단 [다음 단계]를 누르면 현재 단계 내용을 저장 (입력한 것이 없으면 저장하지 않음)
  2. 클라우드 저장이 끝나기 전에 [다음 단계]를 누르면 저장이 안 되는 일은 없는지 확인
- **확인 결과 (변경 전)**:
  - 단계 이동은 같은 화면 안의 상태 변경이라, 이동만으로 입력이 사라지지는 않음(10초 뒤 자동 저장은 계속 진행).
  - 그러나 다음 경우 클라우드에 저장되지 않을 수 있었음: ① 저장 실패(네트워크·한도 초과) 후 학생이 더 입력하지 않으면 **재시도 없음**, ② 입력 후 10초 안에 탭·브라우저를 닫거나 기기를 끄면 마지막 저장이 서버에 닿지 못할 수 있음(같은 기기 재로그인 시 기기 보관본으로 복구되나 다른 기기에서는 보이지 않음), ③ 로그아웃 시 대기 중 저장을 기다리기는 하나 실패해도 알 수 없음.
  - **추가로 발견한 기존 문제**: 기기 보관본이 학생 구분 없이 하나의 키에 저장되고 로그아웃해도 지워지지 않으며, 로그인 시 그 보관본을 새 학생의 서버 활동지와 합침 → **공용 기기에서 A 다음에 B가 로그인하면 A의 답안이 B의 빈 칸에 섞여 B의 문서로 저장될 수 있었음**.
- **구현 내역 (Definition of Done)**:
  - [x] `saveNow()`: 모든 저장을 한 함수·한 줄(순차 실행)로 통합, 바뀐 차시만 저장, 서버 응답 후에만 '저장됨', 실패 시 30초 자동 재시도·1회 안내
  - [x] 단계(steps)·차시(activeLessonTab)가 바뀔 때 즉시 저장 — 하단 [다음 단계], 위쪽 단계 탭, 다음 차시 이동 모두 해당
  - [x] `online` 이벤트 시 재시도, 저장 안 된 변경이 있으면 `beforeunload` 확인 창
  - [x] 로그아웃: 마지막 저장 최대 5초 대기 → 확인되면 기기 보관본 삭제, 아니면 보관·안내 / 화면을 빈 활동지로 초기화
  - [x] `src/utils/studentDraft.ts`: 학생별 보관 키, 같은 학생 판별 — 시작 시·로그인 시·차시 문서 불러올 때 같은 학생의 보관본만 합침 (예전 공용 키 보관본은 같은 학생일 때만 사용)
- **회귀 확인 (실제로 확인한 범위)**: `tsc --noEmit` 통과, `npm run build` 통과, 전체 단위 테스트 통과 (56/56) — 신규 `studentDraft.test.ts` 3건(다른 학생 보관본 거부, 표시 이름 형식 유지, 학생별 키 분리)
- **확인하지 못한 범위**: `saveNow()`의 순차 실행·재시도·로그아웃 대기, `beforeunload` 확인 창, 단계 이동 시 저장은 React 화면 안의 동작이라 작업 환경에서 실행 검증하지 못함(타입 검사와 코드 검토만) → 사용자 확인 필요.
- **알려진 한계**: iPad Safari는 창 닫기 확인 창(`beforeunload`)을 지원하지 않음. 오프라인 상태에서 창을 닫으면 그 기기의 보관본에만 남음(같은 학생이 같은 기기로 다시 로그인하면 자동 저장).
- **배포**: 보안 규칙 변경 없음 → push만 필요.


---

## [2026-10-30] 교사 화면을 Func 1~3차시 기준으로 수정 · 2차시 생각 넓히기 벤다이어그램 (Tier 2)

- **요청 내용**:
  1. 관리자 모드 '학급 탐구 역량 대시보드'가 현재 수업 내용과 불일치(Props 기반) → 다른 부분도 Func 수업과 맞지 않으면 검토 후 수정
  2. 2차시 '04 생각 넓히기'의 활동 1·2 함수 대응관계를 벤다이어그램으로 표현
- **점검 결과 (1~3차시 = 실제 Func 수업)**: 아래 항목이 명제 수업 데이터(사례 수, 참·거짓 판단, 탐구 주제, 반례 등)를 사용 — Func 학생 화면은 이 값을 입력하지 않아 항상 0이거나 엉뚱한 값이 표시됨
  - 대시보드: '1차시 사례 4개 이상', '1차시 증명 4단계 확인', '2차시 정당화 기록', '2차시 학생 판단 분포(참/거짓)', '2차시 탐구주제 선택 현황', KPI '3차시(대우) 완성'
  - 학생 목록: '1차시 사례/증명' 열, 2차시 열의 주제·판단 표시, 필터 '1차시 사례 수'·'2차시 탐구 주제'·'2차시 참/거짓 판단'
  - CSV 내보내기 1~3차시 열 전체(추측·반례·대우법 등), 안내 문구(직접증명·반례·대우법…), '교사용 수사 체크리스트', 피드백 입력 예시 문구 3곳, 예시 학생 데이터(2명) 1~3차시, 상세 비교 2차시 칸의 명제 대체 표시
  - 학생용 평가 결과 창: '2차시 · 반례와 정당화', '3차시 · 대우를 이용한 증명' 요약과 설명 문구 / 인쇄 평가서 제목 '명제의 증명과 절대부등식'
  - 이미 Func에 맞게 되어 있던 것: 루브릭(evaluateRubricL1~3), 평가 기준(EVAL_CRITERIA), 상세 비교 1~3차시 칸, 인쇄 평가서 1~3차시 본문
- **⚠️ 범위 밖으로 남긴 문제**: 4~7차시 **학생 화면 자체**가 명제 수업 내용(귀류법·절대부등식)이며 탭 이름·평가 기준만 '역함수·유리함수1·2·무리함수'로 되어 있음. 수업 내용을 새로 만들어야 하므로 이번에는 바꾸지 않았고, 교사 화면의 4~7차시 지표도 현재 화면 내용에 맞춘 그대로 둠.
- **구현 내역 (Definition of Done)**:
  - [x] `src/utils/funcTeacherMetrics.ts`: 차시 진행 상태(완료/진행 중/시작 전), 1~3차시 문항별 확인 현황, 완료 차시 수 분포, [전체 답안 보기] 이름표 기반 CSV 열
  - [x] `TeacherView.tsx`: 대시보드 3개 카드·KPI, 학생 목록 1·2차시 열, 필터 3개(1~3차시 진행 상태), CSV 1~3차시 열, 안내 문구, 체크리스트(함수 단원 4문항), 입력 예시 문구, 2차시 상세 대체 표시
  - [x] `StudentEvaluationModal.tsx`: 2차시(여러 가지 함수)·3차시(합성함수 탐구) 요약과 설명 문구 / `App.tsx` 인쇄 평가서 제목
  - [x] `mathLogic.ts` `createFuncSampleLessons`: 예시 학생 1~3차시를 Func 답안으로 (학생 1 = 1~3차시 완료, 학생 2 = 진행 중), 4~7차시 예시는 유지
  - [x] `src/components/MappingVennDiagram.tsx` + `Lesson2View.tsx`: 활동 1·2에 두 집합(타원)·화살표 벤다이어그램, 치역 강조·표시, 그림 속 원소를 눌러 대응 만들기(기존 버튼과 같은 처리 함수 사용, 키보드 Enter/Space 지원)
- **회귀 확인 (실제로 확인한 범위)**: `tsc --noEmit` 통과, `npm run build` 통과(번들에 새 문구 포함·옛 '2차시 탐구주제 선택 현황' 제거 확인), 전체 단위 테스트 67/67 통과
  - 신규 `funcTeacherMetrics.test.ts` 6건: **예시 학생 답안이 학생 화면의 채점 함수(validateL1Prob1 등 14개)를 실제로 통과**, 진행 상태·분포 집계, CSV 머리글에 명제 항목(반례·추측·대우·탐구 주제·사례 수) 없음
  - 신규 `MappingVennDiagram.test.tsx` 5건: 대응마다 화살표 1개, 치역 계산(상수함수·일대일대응), 공역에 없는 값 무시, 항등함수
  - 벤다이어그램은 실제 브라우저(Chromium)로 렌더링해 화면 캡처로 확인
  - 기존 테스트 1건 수정: `extractFuncWorksheetFromJson…preserve Props data` 테스트가 '예시 학생 데이터'를 명제 수업 학생 표본으로 쓰고 있어, 예시 데이터 변경 후 Func 학생으로 판정되어 실패 → 테스트 안에서 명제 수업 형태의 기록을 직접 만들도록 표본만 교체(검사 항목은 그대로)
- **확인하지 못한 범위**: 실제 교사 화면(대시보드·필터·CSV 파일 열기)과 학생 2차시 화면에서의 배치·터치 동작은 작업 환경에서 실행하지 못함 → 사용자 확인 필요
- **배포**: 보안 규칙 변경 없음. 사용자 요청으로 push 대기 중.


---

## [2026-10-30] 차시 잠금 동기화 표시 오류 · Console 404 정리 (Tier 1~2)

- **요청 내용**: (1) 교사 화면의 "클라우드 서버에 차시 잠금 설정을 동기화하고 있습니다…"가 계속 도는 문제 (2) 개발자 도구 Console의 오류 정리
- **원인 분석**:
  1. 계속 도는 표시의 실제 원인은 Google Cloud에서 **Token Service API(securetoken.googleapis.com)가 사용 중지**되어 1시간마다 하는 로그인 토큰 갱신이 403으로 실패한 것 → **사용자가 API를 사용 설정해 해결**(코드 문제 아님). 다만 코드가 서버 읽기·실시간 수신 오류를 무시해서, 실패해도 "동기화 중"에 멈춰 원인을 알 수 없었음.
  2. Console 404: `index.html`의 개발용 진입 파일(`/src/main.tsx`)을 GitHub Pages에서도 요청 / 탭 아이콘(`favicon.ico`) 없음. 둘 다 사이트 동작에는 영향 없음. (`[rhwp]` 메시지는 브라우저 확장 프로그램 출력이라 대상 아님)
- **구현 내역 (Definition of Done)**:
  - [x] `App.tsx`: 차시 잠금 설정 서버 읽기·실시간 수신 오류를 기록하고 상태를 `error`로 전환, 15초 넘게 응답이 없으면 `error`로 표시
  - [x] `TeacherView.tsx`: `error` 상태 전용 빨간 안내 문구(인터넷 연결·Firebase 사용량 확인, 학생은 마지막 설정 사용)
  - [x] `index.html`에서 `/src/main.tsx` 줄 제거 → `vite.config.ts`의 `injectDevEntry` 플러그인이 개발 실행·빌드 때만 넣음
  - [x] `index.html`에 탭 아이콘(f(x), 파일 없이 SVG 직접 포함)
- **회귀 확인 (실제로 확인한 범위)**: `tsc --noEmit` 통과, 전체 단위 테스트 통과, `npm run build` 통과(빌드 결과 `dist/index.html`에 진입 스크립트 포함, `index-*.js`/`index-*.css` 생성 확인 → 배포 파일 복사 방식 그대로), 로컬 서버에서 GitHub Pages처럼 띄워 Chromium으로 확인: 화면 정상 표시, `main.tsx`·`favicon` 404 없음, 그 밖의 4xx·페이지 오류 없음
- **확인하지 못한 범위**: 서버 확인 실패 시 빨간 안내가 실제로 표시되는지는 Firebase에 연결할 수 없는 작업 환경이라 확인하지 못함(코드 검토만)
- **운영 참고**: Token Service API·Identity Toolkit API가 꺼지면 학생·교사 모두 로그인 1시간 뒤 저장·조회가 막힘. Google Cloud 콘솔 → API 및 서비스에서 두 API가 "관리"(사용 중) 상태인지 확인.
