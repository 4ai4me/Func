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
- 성찰 단계에는 `HelpSourcePicker`(도움 받은 정도 선택)를 넣고, 교사 [전체 답안 보기]용 `answerLabels.ts`에 `HELP_SOURCE_FIELD`를 추가합니다.
