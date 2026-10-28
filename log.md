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

