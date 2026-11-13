# AGENTS.md

AI 코딩 도구(Claude, Codex, Gemini 등)가 이 저장소에서 작업할 때 따르는 규칙입니다.

## 커밋 작성자

이 저장소의 모든 커밋은 아래 작성자로 기록합니다.

- 이름: `liha4math`
- 이메일: `349883694+liha4math@users.noreply.github.com`

작업 환경의 기본 git 설정(예: `Claude <noreply@anthropic.com>`)을 그대로 쓰지 않습니다.
첫 커밋 전에 저장소 폴더에서 아래 명령을 실행하고, 결과를 확인한 뒤 커밋합니다.

```bash
git config user.name "liha4math"
git config user.email "349883694+liha4math@users.noreply.github.com"
git config user.name && git config user.email   # 위 두 값이 나오는지 확인
```

- 과거 커밋의 작성자는 바꾸지 않습니다(기록 재작성·force push 금지).
- 개인 Gmail 주소를 커밋에 적지 않습니다. 위 GitHub 비공개 주소만 씁니다.

## 학생 화면 공통 규칙

- **서술 칸(textarea)에는 반드시 글자 수 표시를 붙입니다.** `CharCountBadge`(+ 테두리 색 `getCharCountBorderClass`)를 쓰고, 최소 글자 수는 채점 함수가 쓰는 상수와 같은 값을 씁니다(예: `L3_MIN_REASON`, `lesson4Logic`의 `MIN_REASON`). 4차시처럼 공용 입력칸(`ReasonInput`)을 쓰면 `min`을 넘깁니다.
  - `src/components/CharCountCoverage.test.tsx`가 모든 `Lesson{N}View.tsx`의 각 단계를 그려서 빠진 칸을 찾아냅니다. 새 차시를 만들거나 바꾸면 이 테스트를 꼭 실행합니다.
- **힌트 버튼은 열 때 `addHintOpen`으로 횟수를 기록**하고(`src/utils/hintLog.ts`), 새 힌트는 `src/utils/hintCatalog.ts`에 이름·위치를 추가합니다. `hintCatalog.test.ts`가 화면 코드의 `toggleHint('이름')`과 대조합니다.
- 성찰 단계에는 `HelpSourcePicker`(도움 받은 정도 선택)를 넣고, 교사 [전체 답안 보기]용 `answerLabels.ts`에 `HELP_SOURCE_FIELD`를 추가합니다.

## 차시 번호와 저장 칸 (2026-11-05~)

- 화면의 차시 번호(1~9)와 학생 기록 저장 칸(Firestore `func_lessons/l1~l7`)은 다릅니다. **4·5차시는 같은 칸 `l4`**, 6·7차시는 `l5`·`l6`, **8·9차시는 같은 칸 `l7`**(2026-11-13~)입니다. 표는 `src/utils/mathLogic.ts`의 `LESSON_STORAGE_KEY` 한 곳에만 둡니다.
- 저장 칸 이름(`l1`~`l7`)과 형식(`Lesson5State` 등)은 기존 학생 기록과 보안 규칙의 계약이므로 바꾸지 않습니다. 차시를 다시 나누거나 합칠 때도 기록을 옮기지 말고 표시 쪽에서 매핑합니다(옮기려면 Tier 3로 따로 계획).
- 교사 화면의 답안 묶음은 `answerLabels.ts`의 `ANSWER_LESSON_KEYS`(`l4b` = 5차시, `l7b` = 9차시)를 쓰고, 학생 기록은 `answerStorageKey`로 꺼냅니다. 같은 칸을 쓰는 두 차시는 항목·힌트 이름이 겹치지 않게 하고, 서로 상대 차시 항목을 `hidden`에 넣습니다.
- 차시 잠금은 Func 전용 `app_settings/func_lesson_access`(l1~l8 필수, l9는 2026-11-13 추가된 선택 칸 — 없으면 8차시 값을 따름)만 씁니다. Props와 함께 쓰는 `app_settings/lesson_access`에는 쓰지 않습니다.
- 반별 차시 잠금(2026-11-09~)은 `app_settings/func_lesson_access_classes`에 둡니다. 학생 화면의 잠금 판단은 반드시 `effectiveLessonAccess`(반 설정 → 없으면 전체 설정)로 하고, 전체 설정 `lessonAccess`를 직접 쓰지 않습니다.
