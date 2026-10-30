import type { Lesson4State } from './mathLogic';
import { isLinearEqual, isNumberAnswer, parseLinear } from './linearExpr';

/**
 * Func 4차시 · 역함수 탐구 — 문항 자료와 채점 (순수 로직, 단위 테스트 대상)
 * ------------------------------------------------------------------
 * 학생 화면: src/components/Lesson4View.tsx
 * 단계 완료·루브릭 판정: mathLogic.ts evaluateLevel4Completion / evaluateRubricL4
 */

export interface L4Feedback {
  ok: boolean;
  message: string;
  type: 'good' | 'warn';
}

const warn = (message: string): L4Feedback => ({ ok: false, message, type: 'warn' });
const good = (message: string): L4Feedback => ({ ok: true, message, type: 'good' });

const MIN_REASON = 8;
const hasReason = (v?: string) => (v || '').trim().length >= MIN_REASON;

// ─────────────────────────────────────────────
// 1단계 생각 열기 · 온실가스와 화학식
// ─────────────────────────────────────────────
export const L4_GASES = ['메테인', '이산화 탄소', '아산화 질소'] as const;
/** 화학식 (저장 키) — 화면에는 L4_FORMULA_LABEL로 아래 첨자를 붙여 표시 */
export const L4_FORMULAS = ['N2O', 'CH4', 'CO2'] as const;
export const L4_FORMULA_LABEL: Record<string, string> = { N2O: 'N₂O', CH4: 'CH₄', CO2: 'CO₂' };
/** f : X(온실가스) → Y(화학식) */
export const L4_GAS_TO_FORMULA: Record<string, string> = {
  메테인: 'CH4',
  '이산화 탄소': 'CO2',
  '아산화 질소': 'N2O',
};
/** 정답: 화살표를 뒤집은 대응 Y → X */
export const L4_FORMULA_TO_GAS: Record<string, string> = Object.fromEntries(
  Object.entries(L4_GAS_TO_FORMULA).map(([gas, formula]) => [formula, gas])
);

export function validateL4Open(p: Lesson4State): L4Feedback {
  const map = p.openReverseMap || {};
  for (const formula of L4_FORMULAS) {
    if (!map[formula]) {
      return warn(
        `화살표를 뒤집은 대응에서 ${L4_FORMULA_LABEL[formula]}에 대응하는 온실가스를 아직 고르지 않았습니다. Y의 세 원소를 모두 X의 원소에 연결해 보세요.`
      );
    }
    if (map[formula] !== L4_FORMULA_TO_GAS[formula]) {
      return warn(
        `${L4_FORMULA_LABEL[formula]}을(를) 화학식으로 갖는 온실가스는 무엇인가요? 원래 그림에서 ${L4_FORMULA_LABEL[formula]}(으)로 들어오는 화살표가 어디에서 출발하는지 확인해 보세요.`
      );
    }
  }
  if (p.openReverseIsFunc !== 'yes') {
    return warn(
      'Y의 원소 N₂O, CH₄, CO₂에 X의 원소가 각각 하나씩, 빠짐없이 대응하고 있습니다. 함수의 뜻(정의역의 각 원소에 공역의 원소가 오직 하나씩 대응)에 맞는지 다시 판단해 보세요.'
    );
  }
  if (p.openConditionChoice !== 'bijection') {
    if (p.openConditionChoice === 'oneToOne') {
      return warn(
        '일대일함수이지만 치역과 공역이 다르면 Y에 화살표를 받지 못한 원소가 생깁니다. 뒤집으면 그 원소에 대응하는 X의 원소가 없어 함수가 되지 않아요. 어떤 조건이 더 필요할까요?'
      );
    }
    return warn(
      '두 원소가 같은 값에 대응하는 함수(예: 상수함수)를 뒤집으면 Y의 한 원소에 X의 원소가 두 개 이상 대응하여 함수가 되지 않습니다. 아래 [역함수가 없는 경우]를 눌러 비교해 보세요.'
    );
  }
  if (p.openDomainRangeSame !== 'yes') {
    return warn(
      '[생각 톡톡] 역함수 f⁻¹ : Y → X는 f의 화살표를 뒤집은 것이므로 f⁻¹의 치역은 원래 f의 정의역 X 전체입니다.'
    );
  }
  if (!hasReason(p.openReason)) {
    return warn('화살표를 뒤집은 대응이 함수가 되는 이유를 8자 이상으로 서술해 주세요.');
  }
  return good(
    '[생각 열기 완료] 정확합니다! f가 일대일대응이므로 화살표를 뒤집은 대응 Y → X도 함수가 됩니다. 이 함수를 f의 역함수라 하고 f⁻¹ : Y → X로 나타냅니다.'
  );
}

// ─────────────────────────────────────────────
// 2단계 [문제 1] 그림 완성과 역함수의 함숫값
// ─────────────────────────────────────────────
export const L4_P1_X = ['1', '2', '3', '4'] as const;
export const L4_P1_Y = ['1', '3', '5', '7'] as const;
/** 교과서 그림에 이미 그려진 화살표 (3은 비어 있음) */
export const L4_P1_GIVEN: Record<string, string> = { '1': '3', '2': '5', '4': '1' };
export const L4_P1_F3 = '7';

export function validateL4Prob1(p: Lesson4State): L4Feedback {
  if (!p.p1_f3) {
    return warn('먼저 그림을 완성해 보세요. 화살표가 없는 X의 원소 3을 누른 뒤, Y에서 대응시킬 원소를 누릅니다.');
  }
  if (p.p1_f3 !== L4_P1_F3) {
    return warn(
      `3을 ${p.p1_f3}에 연결하면 Y의 ${p.p1_f3}에 화살표가 두 개 들어오고, Y의 7은 화살표를 받지 못합니다. 역함수가 존재하려면 f가 일대일대응이어야 해요.`
    );
  }
  if (!isNumberAnswer(p.p1_1, 3)) {
    return warn('(1) f⁻¹(7) = a이면 f(a) = 7입니다. 그림에서 7로 들어오는 화살표가 출발한 X의 원소를 찾아보세요.');
  }
  if (!isNumberAnswer(p.p1_2, 4)) {
    return warn('(2) (f⁻¹ ∘ f)(4) = f⁻¹(f(4)) = f⁻¹(1)입니다. 성질 ③ (f⁻¹ ∘ f)(x) = x를 떠올려 보세요.');
  }
  if (!isNumberAnswer(p.p1_3, 3)) {
    return warn('(3) (f ∘ f⁻¹)(3) = f(f⁻¹(3))입니다. f⁻¹(3) = 1이므로 f(1)을 구해 보세요.');
  }
  if (!isNumberAnswer(p.p1_4, 5)) {
    return warn('(4) 성질 ④에 의해 (f⁻¹)⁻¹ = f이므로 (f⁻¹)⁻¹(2) = f(2)입니다.');
  }
  if (!hasReason(p.p1Reason)) {
    return warn('네 값을 구한 과정(어떤 성질을 이용했는지)을 8자 이상으로 정리해 주세요.');
  }
  return good(
    '[문제 1] 완벽합니다! f(3) = 7로 그림을 완성하면 (1) f⁻¹(7) = 3, (2) (f⁻¹ ∘ f)(4) = 4, (3) (f ∘ f⁻¹)(3) = 3, (4) (f⁻¹)⁻¹(2) = f(2) = 5입니다.'
  );
}

// ─────────────────────────────────────────────
// 3단계 역함수 구하기
// ─────────────────────────────────────────────
/** 예제 1 변형: y = 3x + 4 */
export function validateL4Ex1(p: Lesson4State): L4Feedback {
  if (!isLinearEqual(p.ex1_solveX, 1 / 3, -4 / 3, 'y')) {
    const hint = parseLinear(p.ex1_solveX, 'x') ? ' (x에 대하여 풀었으므로 아직 문자는 y로 남아 있어야 해요.)' : '';
    return warn(
      `① y = 3x + 4를 x에 대하여 풀어 x = (y에 대한 식)으로 나타내 보세요. 양변에서 4를 빼고 3으로 나눕니다.${hint}`
    );
  }
  if (!isLinearEqual(p.ex1_ans, 1 / 3, -4 / 3, 'x')) {
    return warn('② ①에서 구한 식의 x와 y를 서로 바꾸어 y = (x에 대한 식)으로 나타내 보세요.');
  }
  return good('[예제 1] 정확합니다! x = (1/3)y − 4/3에서 x와 y를 바꾸면 역함수는 y = (1/3)x − 4/3입니다.');
}

/** [문제 2] (1) y = −3x + 1, (2) y = (1/4)x + 2 */
export function validateL4Prob2(p: Lesson4State): L4Feedback {
  if (!isLinearEqual(p.p2_1, -1 / 3, 1 / 3)) {
    return warn('(1) y = −3x + 1을 x에 대하여 풀면 x = −(1/3)y + 1/3입니다. x와 y를 바꾸어 보세요.');
  }
  if (!isLinearEqual(p.p2_2, 4, -8)) {
    return warn('(2) y = (1/4)x + 2를 x에 대하여 풀면 x = 4(y − 2) = 4y − 8입니다. x와 y를 바꾸어 보세요.');
  }
  if (!hasReason(p.p2Reason)) {
    return warn('역함수를 구한 순서(x에 대하여 풀기 → x와 y 바꾸기)를 8자 이상으로 서술해 주세요.');
  }
  return good('[문제 2] 완벽합니다! (1) y = −(1/3)x + 1/3, (2) y = 4x − 8입니다.');
}

/** [문제 5] 섭씨 x℃ → 화씨 y℉ : y = (9/5)x + 32 */
export function validateL4Prob5(p: Lesson4State): L4Feedback {
  if (!isLinearEqual(p.p5_inv, 5 / 9, -160 / 9)) {
    return warn(
      '(1) y = (9/5)x + 32를 x에 대하여 풀면 x = (5/9)(y − 32)입니다. x와 y를 바꾸어 역함수를 써 보세요. (전개하지 않은 (5/9)(x − 32) 꼴도 됩니다)'
    );
  }
  if (!isNumberAnswer(p.p5_celsius, 35)) {
    return warn('(2) 역함수에 x = 95를 대입해 보세요: (5/9) × (95 − 32) = (5/9) × 63');
  }
  return good(
    '[문제 5] 정확합니다! 역함수 y = (5/9)(x − 32)는 화씨온도를 섭씨온도로 바꾸는 함수이고, 95℉ = (5/9) × 63 = 35℃입니다.'
  );
}

// ─────────────────────────────────────────────
// 4단계 [함께하기] (g∘f)⁻¹ = f⁻¹∘g⁻¹ — f(x) = x − 1, g(x) = 2x + 4
// ─────────────────────────────────────────────
export function validateL4Together(p: Lesson4State): L4Feedback {
  if (!isLinearEqual(p.tg_gf, 2, 2)) {
    return warn('(i) (g ∘ f)(x) = g(x − 1) = 2(x − 1) + 4를 전개해 정리해 보세요.');
  }
  if (!isLinearEqual(p.tg_gfInv, 1 / 2, -1)) {
    return warn('(i) y = 2x + 2의 역함수를 구해 보세요. (x에 대하여 풀고 x와 y 바꾸기)');
  }
  if (!isLinearEqual(p.tg_fInv, 1, 1)) {
    return warn('(ii) f(x) = x − 1의 역함수 f⁻¹(x)를 구해 보세요.');
  }
  if (!isLinearEqual(p.tg_gInv, 1 / 2, -2)) {
    return warn('(ii) g(x) = 2x + 4의 역함수 g⁻¹(x)를 구해 보세요.');
  }
  if (!isLinearEqual(p.tg_inner, 1 / 2, -2)) {
    return warn('(ii) f⁻¹(g⁻¹(x))의 괄호 안에는 g⁻¹(x)의 식이 그대로 들어갑니다.');
  }
  if (!isLinearEqual(p.tg_result, 1 / 2, -1)) {
    return warn('(ii) f⁻¹(x) = x + 1이므로 f⁻¹((1/2)x − 2) = ((1/2)x − 2) + 1을 정리해 보세요.');
  }
  if (p.tg_relation !== 'eq') {
    return warn('(i)과 (ii)에서 구한 두 식을 비교해 보세요. 모든 x에 대하여 값이 같나요?');
  }
  return good(
    '[함께하기 완료] (g ∘ f)⁻¹(x) = (1/2)x − 1, (f⁻¹ ∘ g⁻¹)(x) = (1/2)x − 1로 같습니다. 일반적으로 (g ∘ f)⁻¹ = f⁻¹ ∘ g⁻¹ — 순서가 바뀌는 것에 주의하세요!'
  );
}

/** [문제 3] (g∘f)(x) = 2x − 5일 때 (f⁻¹∘g⁻¹)(3) */
export function validateL4Prob3(p: Lesson4State): L4Feedback {
  if (!isNumberAnswer(p.p3_ans, 4)) {
    return warn(
      '(f⁻¹ ∘ g⁻¹)(3) = (g ∘ f)⁻¹(3)입니다. (g ∘ f)⁻¹(3) = k라 하면 (g ∘ f)(k) = 3, 즉 2k − 5 = 3을 풀어 보세요.'
    );
  }
  if (!hasReason(p.p3Reason)) {
    return warn('어떤 성질을 이용해 값을 구했는지 8자 이상으로 서술해 주세요.');
  }
  return good('[문제 3] 정확합니다! (f⁻¹ ∘ g⁻¹)(3) = (g ∘ f)⁻¹(3) = k에서 2k − 5 = 3이므로 k = 4입니다.');
}

// ─────────────────────────────────────────────
// 5단계 그래프와 y = x 대칭
// ─────────────────────────────────────────────
/** [문제 4] (1) y = 5x − 2, (2) y = −(1/3)x + 3 */
export const L4_P4_FUNCS = [
  { label: 'y = 5x − 2', a: 5, b: -2, invA: 1 / 5, invB: 2 / 5 },
  { label: 'y = −(1/3)x + 3', a: -1 / 3, b: 3, invA: -3, invB: 9 },
] as const;

export function validateL4Prob4(p: Lesson4State): L4Feedback {
  if (!isLinearEqual(p.p4_1_inv, L4_P4_FUNCS[0].invA, L4_P4_FUNCS[0].invB)) {
    return warn('(1) y = 5x − 2의 역함수를 구해 보세요. 그래프에서 두 직선이 y = x에 대하여 대칭인지 확인할 수 있어요.');
  }
  if (!isLinearEqual(p.p4_2_inv, L4_P4_FUNCS[1].invA, L4_P4_FUNCS[1].invB)) {
    return warn('(2) y = −(1/3)x + 3을 x에 대하여 풀면 x = −3(y − 3)입니다. x와 y를 바꾸어 보세요.');
  }
  return good(
    '[문제 4] 정확합니다! (1) y = (1/5)x + 2/5, (2) y = −3x + 9이며, 각각 원래 함수의 그래프와 직선 y = x에 대하여 대칭입니다.'
  );
}

/** 공학 도구 탐구: f(x) = ax + 1과 그 역함수 */
export function validateL4Tool(p: Lesson4State): L4Feedback {
  if (p.toolAlwaysOverlap !== 'yes') {
    return warn('확인 1: 슬라이더를 여러 값으로 움직여 보세요. 역함수의 그래프와 ‘y = x에 대해 대칭이동한 그래프’는 a가 바뀌어도 언제나 겹쳐지나요?');
  }
  if (!isNumberAnswer(p.toolParallelA, 1)) {
    return warn('확인 2: 두 직선이 평행하려면 기울기가 같아야 합니다. f의 기울기는 a, 역함수의 기울기는 1/a예요. (일치하는 경우는 평행에서 제외)');
  }
  if (!isNumberAnswer(p.toolSameA, -1)) {
    return warn('확인 3: a = 1/a를 만족하는 a 중에서 두 그래프가 완전히 겹치는 값을 찾아보세요.');
  }
  return good(
    '[공학 도구 확인 완료] a의 값과 관계없이 역함수의 그래프는 y = x에 대한 대칭이동과 겹칩니다. a = 1이면 y = x + 1과 y = x − 1로 평행하고, a = −1이면 두 그래프가 y = −x + 1로 일치합니다.'
  );
}

// ─────────────────────────────────────────────
// 교사 화면·인쇄용 요약
// ─────────────────────────────────────────────
const v = (s?: string) => (s && s.trim() ? s.trim() : '-');

/** 4차시 답안을 교사 화면용 두 묶음(1~2단계 / 3~5단계)으로 요약 (입력이 없으면 빈 문자열) */
export function summarizeL4(p: Lesson4State | undefined | null): { part1: string; part2: string } {
  if (!p) return { part1: '', part2: '' };
  const map = p.openReverseMap || {};
  const p1Lines = [
    Object.keys(map).length || p.openReason
      ? `[생각 열기] ${L4_FORMULAS.map((f) => `${L4_FORMULA_LABEL[f]}→${map[f] || '-'}`).join(', ')} / 함수인가: ${
          p.openReverseIsFunc === 'yes' ? 'O' : p.openReverseIsFunc === 'no' ? 'X' : '-'
        } / ${v(p.openReason)}`
      : '',
    p.p1_f3 || p.p1Reason
      ? `[문제 1] f(3)=${v(p.p1_f3)}, f⁻¹(7)=${v(p.p1_1)}, (f⁻¹∘f)(4)=${v(p.p1_2)}, (f∘f⁻¹)(3)=${v(p.p1_3)}, (f⁻¹)⁻¹(2)=${v(p.p1_4)} / ${v(p.p1Reason)}`
      : '',
  ];
  const p2Lines = [
    p.ex1_ans || p.p2_1 || p.p2Reason
      ? `[역함수 구하기] 예제 y=3x+4 → ${v(p.ex1_ans)} / 문제 2 (1) ${v(p.p2_1)} (2) ${v(p.p2_2)} / ${v(p.p2Reason)}`
      : '',
    p.p5_inv || p.p5_celsius ? `[문제 5] 역함수 ${v(p.p5_inv)}, 95℉ = ${v(p.p5_celsius)}℃` : '',
    p.tg_gf || p.p3_ans
      ? `[함께하기] (g∘f)⁻¹(x)=${v(p.tg_gfInv)}, (f⁻¹∘g⁻¹)(x)=${v(p.tg_result)} / [문제 3] ${v(p.p3_ans)} / ${v(p.p3Reason)}`
      : '',
    p.p4_1_inv || p.toolParallelA
      ? `[문제 4] (1) ${v(p.p4_1_inv)} (2) ${v(p.p4_2_inv)} / [공학 도구] 평행 a=${v(p.toolParallelA)}, 일치 a=${v(p.toolSameA)}`
      : '',
  ];
  return {
    part1: p1Lines.filter(Boolean).join('\n'),
    part2: p2Lines.filter(Boolean).join('\n'),
  };
}
