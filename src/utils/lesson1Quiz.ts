/**
 * 1차시 [탐구 05] 활동 1 · 실생활 대응이 함수인지 판별하기 — 문항과 정답.
 * 학생 화면(Lesson1View)과 교사 화면 문항 상태(questionStatus)가 함께 쓴다.
 */
export const REAL_LIFE_QUIZ_ITEMS = [
  {
    id: 'q1',
    title: '사례 A · 편의점 상품 바코드(X) → 그 상품 1개의 판매 가격(Y)',
    desc: '편의점에 진열된 각 상품(바코드)마다 포스기에 등록된 판매 가격 1개를 대응시키는 경우',
    answer: 'yes' as const,
    explanation: '모든 상품에는 정해진 판매 가격이 오직 하나씩 대응하므로 함수입니다.',
  },
  {
    id: 'q2',
    title: '사례 B · 혈액형 {A, B, O, AB}(X) → 우리 반 학생 이름(Y)',
    desc: '각 혈액형에 그 혈액형을 가진 우리 반 학생을 대응시키는 경우 (한 반에 25명)',
    answer: 'no' as const,
    explanation: '하나의 혈액형(예: A형)에 여러 명의 학생이 대응하므로 함수가 아닙니다.',
  },
  {
    id: 'q3',
    title: '사례 C · 우리 반 학생의 학번(X) → 그 학생의 태어난 달(1월~12월)(Y)',
    desc: '각 학생의 학번에 그 학생이 태어난 달을 대응시키는 경우',
    answer: 'yes' as const,
    explanation: '모든 학생은 태어난 달이 반드시 존재하고 오직 하나뿐이므로 함수입니다.',
  },
];

/** 세 사례를 모두 맞게 판별했는지 (Lesson1View의 [판별 확인] 버튼과 같은 기준) */
export function validateL1RealLifeQuiz(quiz?: Record<string, string>): { ok: boolean; message: string } {
  const q = quiz || {};
  for (const item of REAL_LIFE_QUIZ_ITEMS) {
    if (q[item.id] !== item.answer) {
      return { ok: false, message: `[${item.title.split('·')[0].trim()}]의 판별 결과를 다시 확인해 보세요.` };
    }
  }
  return { ok: true, message: '세 사례를 모두 맞게 판별했습니다.' };
}
