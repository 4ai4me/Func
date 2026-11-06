import type { Lesson5State } from './mathLogic';
import { compareRat, isRatNumber, parseRat, type RatCompare } from './ratExpr';

/**
 * Func 6차시 · 유리식과 유리함수의 정의역 — 문항 자료와 채점 (순수 로직, 단위 테스트 대상)
 * ------------------------------------------------------------------
 * 학생 화면: src/components/Lesson6View.tsx
 * 저장 칸: func_lessons/l5 (형식 Lesson5State — 예전 절대부등식 항목은 보존만, 새 항목을 추가)
 * 단계 완료·루브릭 판정: mathLogic.ts evaluateLevel6Completion / evaluateRubricL6
 */

export interface L6Feedback {
  ok: boolean;
  message: string;
  type: 'good' | 'warn';
}

const warn = (message: string): L6Feedback => ({ ok: false, message, type: 'warn' });
const good = (message: string): L6Feedback => ({ ok: true, message, type: 'good' });

/** 6차시 이유 칸 최소 글자 수 — 채점과 학생 화면 글자 수 표시가 함께 쓴다 */
export const L6_MIN_REASON = 8;
/** 6차시 성찰 칸 최소 글자 수 (완료 조건: 성찰 1) */
export const L6_MIN_REFLECTION = 10;
const hasReason = (v?: string) => (v || '').trim().length >= L6_MIN_REASON;

// ─────────────────────────────────────────────
// 1단계 생각 열기 · 전력과 저항, 유기의 구리 비율
// ─────────────────────────────────────────────
/** 전압 V = 12 V로 고정 → 소비 전력 P = V²/R = 144/R */
export const L6_VOLTAGE = 12;
export const l6Power = (r: number): number => (L6_VOLTAGE * L6_VOLTAGE) / r;
/** 구리 x kg + 주석 3 kg 합금에서 구리의 비율 */
export const L6_COPPER_ANSWER = 'x/(x+3)';

export function validateL6Open(p: Lesson5State): L6Feedback {
  if (!isRatNumber(p.openP4, l6Power(4))) {
    return warn('① 위의 그래프에서 저항을 R = 4 Ω에 맞추거나, P = V²/R = 12²/4를 계산해 보세요.');
  }
  if (!isRatNumber(p.openP8, l6Power(8))) {
    return warn('② R = 8 Ω일 때 P = 12²/8을 계산해 보세요. 저항이 2배가 되면 전력은 어떻게 되나요?');
  }
  if (p.openTrend !== 'down') {
    return warn('③ 슬라이더를 오른쪽으로 움직여 저항 R을 크게 해 보세요. 그래프의 점은 올라가나요, 내려가나요?');
  }
  const copper = compareRat(p.openCopper, L6_COPPER_ANSWER);
  if (copper === 'unreadable') {
    return warn('④ 구리의 비율을 x에 대한 식으로 써 주세요. 분모가 여러 항이면 괄호로 묶어요. (예: x/(x+3))');
  }
  if (copper !== 'equal') {
    return warn('④ (구리의 비율) = (구리의 무게) ÷ (합금 전체의 무게)입니다. 합금 전체의 무게는 x + 3 (kg)이에요.');
  }
  if (p.openCopperKind !== 'notPoly') {
    return warn('⑤ x/(x+3)은 분모 x + 3에 문자 x가 들어 있습니다. 다항식은 분모에 문자가 없는 식이에요. 다시 골라 보세요.');
  }
  return good(
    '[생각 열기 완료] P = 144/R, 구리의 비율 x/(x + 3)처럼 분모에 문자가 포함된 분수 꼴의 식이 오늘 배울 유리식입니다. 저항이 2배가 되면 전력은 1/2배가 되네요.'
  );
}

// ─────────────────────────────────────────────
// 2단계 [문제 1] 다항식이 아닌 유리식 찾기
// ─────────────────────────────────────────────
/** 교과서 문제 1의 다섯 식 (raw: 계산용, label: 안내 문구용) */
export const L6_P1_EXPRS = [
  { raw: '2/(x+5)', label: '2/(x + 5)', isPoly: false },
  { raw: '(x-2)/3', label: '(x − 2)/3', isPoly: true },
  { raw: '1/4-1/x', label: '1/4 − 1/x', isPoly: false },
  { raw: '(2x-1)/(x^2+x)', label: '(2x − 1)/(x² + x)', isPoly: false },
  { raw: 'x^2+1/2', label: 'x² + 1/2', isPoly: true },
] as const;
export const L6_P1_ANSWER: readonly number[] = L6_P1_EXPRS.flatMap((e, i) => (e.isPoly ? [] : [i]));

export function validateL6Prob1(p: Lesson5State): L6Feedback {
  const picks = new Set(p.p1Picks || []);
  if (picks.size === 0) {
    return warn('다섯 식 가운데 다항식이 아닌 유리식을 모두 눌러 고르세요.');
  }
  const wrongPoly = L6_P1_EXPRS.findIndex((e, i) => e.isPoly && picks.has(i));
  if (wrongPoly >= 0) {
    const e = L6_P1_EXPRS[wrongPoly];
    return warn(
      wrongPoly === 1
        ? `${e.label}는 분모가 상수 3이므로 (1/3)x − 2/3로 쓸 수 있는 다항식입니다. 분모에 문자가 있는지 살펴보세요.`
        : `${e.label}의 1/2은 계수(상수)일 뿐, 분모에 문자가 없으므로 다항식입니다.`
    );
  }
  const missing = L6_P1_ANSWER.filter((i) => !picks.has(i));
  if (missing.length > 0) {
    return warn(`아직 고르지 않은 '다항식이 아닌 유리식'이 ${missing.length}개 있습니다. 분모에 문자 x가 들어 있는 식을 모두 찾아보세요.`);
  }
  if (!hasReason(p.p1Reason)) {
    return warn('나머지 두 식이 다항식인 이유를 8자 이상으로 서술해 주세요.');
  }
  return good(
    '[문제 1] 정확합니다! 2/(x + 5), 1/4 − 1/x, (2x − 1)/(x² + x)는 분모에 문자가 있어 다항식이 아닌 유리식이고, (x − 2)/3와 x² + 1/2은 다항식입니다.'
  );
}

// ─────────────────────────────────────────────
// 3단계 유리식의 계산 — 예제 1을 문제로, [문제 2]
// ─────────────────────────────────────────────
/** 계산 문제(question: 문제 식을 계산용으로 괄호까지 적은 것 — 테스트에서 정답과 값이 같은지 확인): 정답 식과, 약분하면 사라지는 인수의 근(약분이 덜 된 식을 알아보는 데 씀) */
export const L6_CALC = {
  ex1_1: { question: '2/x + 1/(x-1)', answer: '(3x-2)/(x(x-1))', answerLabel: '(3x − 2)/(x(x − 1))', cancelXs: [] },
  ex1_2: { question: '((x-1)/(x^2+x))/((x^2-1)/x)', answer: '1/(x+1)^2', answerLabel: '1/(x + 1)²', cancelXs: [0, 1] },
  p2_1: { question: '3x/(x^2-1) - 2/(x+1)', answer: '(x+2)/((x+1)(x-1))', answerLabel: '(x + 2)/((x + 1)(x − 1))', cancelXs: [] },
  p2_2: { question: '((x+2)/(x^2+3x))*((x+3)/(x^2-4))', answer: '1/(x(x-2))', answerLabel: '1/(x(x − 2))', cancelXs: [-3, -2] },
} as const;
export type L6CalcKey = keyof typeof L6_CALC;

export function checkL6Calc(key: L6CalcKey, raw: string | undefined): RatCompare {
  const item = L6_CALC[key];
  return compareRat(raw, item.answer, item.cancelXs);
}

const CALC_HINT: Record<L6CalcKey, string> = {
  ex1_1: '(1) 분모 x와 x − 1의 곱 x(x − 1)로 통분한 뒤 분자끼리 더해 보세요: 2(x − 1)/(x(x − 1)) + x/(x(x − 1))',
  ex1_2: '(2) 나눗셈은 나누는 식의 분자와 분모를 바꾸어 곱합니다. x² + x = x(x + 1), x² − 1 = (x + 1)(x − 1)로 인수분해한 뒤 약분해 보세요.',
  p2_1: '(1) x² − 1 = (x + 1)(x − 1)이므로 (x + 1)(x − 1)로 통분합니다: {3x − 2(x − 1)}/((x + 1)(x − 1))',
  p2_2: '(2) x² + 3x = x(x + 3), x² − 4 = (x + 2)(x − 2)로 인수분해한 뒤 분자와 분모의 공통인수를 약분해 보세요.',
};

function calcFeedback(key: L6CalcKey, raw: string | undefined, label: string): L6Feedback | null {
  const res = checkL6Calc(key, raw);
  if (res === 'equal') return null;
  if (res === 'unreadable') {
    return warn(`${label} 식을 읽을 수 없어요. 분자·분모가 여러 항이면 괄호로 묶어 써 주세요. (예: (3x-2)/(x(x-1)), 1/(x+1)^2)`);
  }
  if (res === 'notSimplified') {
    return warn(`${label} 값은 맞지만 약분이 덜 되었어요. 분자와 분모의 공통인수를 약분해 가장 간단한 식으로 나타내 보세요.`);
  }
  return warn(CALC_HINT[key]);
}

export function validateL6Ex1(p: Lesson5State): L6Feedback {
  return (
    calcFeedback('ex1_1', p.ex1_1, '(1)') ||
    calcFeedback('ex1_2', p.ex1_2, '(2)') ||
    good('[예제 1] 정확합니다! (1) (3x − 2)/(x(x − 1)), (2) 1/(x + 1)²입니다. 유리식의 계산은 분수의 계산과 같은 방법으로 해요.')
  );
}

export function validateL6Prob2(p: Lesson5State): L6Feedback {
  const fb = calcFeedback('p2_1', p.p2_1, '(1)') || calcFeedback('p2_2', p.p2_2, '(2)');
  if (fb) return fb;
  if (!hasReason(p.p2Reason)) {
    return warn('계산할 때 먼저 한 일(인수분해, 통분, 약분 등)을 8자 이상으로 정리해 주세요.');
  }
  return good('[문제 2] 완벽합니다! (1) (x + 2)/((x + 1)(x − 1)) = (x + 2)/(x² − 1), (2) 1/(x(x − 2))입니다.');
}

// ─────────────────────────────────────────────
// 4단계 유리함수와 정의역 — [보기], [문제 3]
// ─────────────────────────────────────────────
/** [보기] y = (x − 1)/(x + 2) */
export const L6_EXAMPLE_FN = { raw: '(x-1)/(x+2)', excluded: -2 } as const;
/** [문제 3] (1) y = (4x + 3)/(x − 5), (2) y = (2 − x)/(3x + 1) */
export const L6_P3 = [
  { raw: '(4x+3)/(x-5)', excluded: 5 },
  { raw: '(2-x)/(3x+1)', excluded: -1 / 3 },
] as const;

export function validateL6Prob3(p: Lesson5State): L6Feedback {
  if (!isRatNumber(p.p3_1, L6_P3[0].excluded)) {
    return warn('(1) 분모 x − 5가 0이 되는 x의 값을 찾아보세요. 그 값만 정의역에서 빠집니다.');
  }
  if (!isRatNumber(p.p3_2, L6_P3[1].excluded)) {
    return warn('(2) 분모 3x + 1 = 0을 풀어 보세요. 답이 분수이면 -1/3처럼 씁니다.');
  }
  if (!hasReason(p.p3Reason)) {
    return warn('정의역을 구한 방법을 8자 이상으로 서술해 주세요.');
  }
  return good('[문제 3] 정확합니다! (1) {x | x ≠ 5인 실수}, (2) {x | x ≠ −1/3인 실수}입니다. 분모를 0으로 하는 x의 값만 빠져요.');
}

// ─────────────────────────────────────────────
// 교사 화면·인쇄용 요약
// ─────────────────────────────────────────────
const v = (s?: string) => (s && s.trim() ? s.trim() : '-');

/** 6차시 답안 요약 (입력이 없으면 빈 문자열) */
export function summarizeL6(p: Lesson5State | undefined | null): string {
  if (!p) return '';
  const picks = p.p1Picks || [];
  const lines = [
    p.openP4 || p.openCopper
      ? `[생각 열기] R=4 → P=${v(p.openP4)}, R=8 → P=${v(p.openP8)} / 구리 비율 ${v(p.openCopper)}`
      : '',
    picks.length || p.p1Reason
      ? `[문제 1] 고른 식: ${picks.length ? picks.map((i) => L6_P1_EXPRS[i]?.label ?? '?').join(', ') : '-'} / ${v(p.p1Reason)}`
      : '',
    p.ex1_1 || p.ex1_2 || p.p2_1 || p.p2_2
      ? `[유리식의 계산] 예제 (1) ${v(p.ex1_1)} (2) ${v(p.ex1_2)} / 문제 2 (1) ${v(p.p2_1)} (2) ${v(p.p2_2)} / ${v(p.p2Reason)}`
      : '',
    p.p3_1 || p.p3_2 ? `[문제 3] (1) x ≠ ${v(p.p3_1)} (2) x ≠ ${v(p.p3_2)} / ${v(p.p3Reason)}` : '',
  ];
  return lines.filter(Boolean).join('\n');
}

/** 테스트용: 문항 자료의 식이 모두 읽히는지 */
export function l6ExpressionsReadable(): boolean {
  const all = [
    L6_COPPER_ANSWER,
    L6_EXAMPLE_FN.raw,
    ...L6_P3.map((e) => e.raw),
    ...L6_P1_EXPRS.map((e) => e.raw),
    ...Object.values(L6_CALC).flatMap((c) => [c.answer]),
  ];
  return all.every((s) => parseRat(s) !== null);
}
