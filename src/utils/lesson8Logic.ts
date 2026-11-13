import type { Lesson7State } from './mathLogic';
import { isRatNumber, parseRatNumber } from './ratExpr';
import { compareIrr, hasRootInDenominator, hasVarRoot, parseIrr } from './irrExpr';

/**
 * Func 8·9차시 · 무리식과 무리함수 — 문항 자료와 채점 (2026-11-13 두 차시로 나눔: 8차시 = 문제 1~5, 9차시 = 문제 6·7) (순수 로직, 단위 테스트 대상)
 * ------------------------------------------------------------------
 * 학생 화면: src/components/Lesson8View.tsx / 그래프: src/components/IrrationalGraph.tsx
 * 저장 칸: func_lessons/l7 (형식 Lesson7State — 예전 절대부등식3 항목은 보존만, 새 항목을 추가)
 * 단계 완료·루브릭 판정: mathLogic.ts evaluateLevel8/9Completion / evaluateRubricL8/9
 */

export interface L8Feedback {
  ok: boolean;
  message: string;
  type: 'good' | 'warn';
}

const warn = (message: string): L8Feedback => ({ ok: false, message, type: 'warn' });
const good = (message: string): L8Feedback => ({ ok: true, message, type: 'good' });

/** 8차시 이유 칸 최소 글자 수 — 채점과 학생 화면 글자 수 표시가 함께 쓴다 */
export const L8_MIN_REASON = 8;
/** 8차시 성찰 칸 최소 글자 수 (완료 조건: 성찰 1) */
export const L8_MIN_REFLECTION = 10;
const hasReason = (v?: string) => (v || '').trim().length >= L8_MIN_REASON;

// ─────────────────────────────────────────────
// 부등식 답 (정의역·치역·x의 값의 범위) — "x ≥ 3/2"처럼 한 글자열로 저장
// 학생 화면은 부등호 버튼 + 숫자 칸으로 입력하므로 읽기 쉽고, 교사 화면에도 그대로 보인다.
// ─────────────────────────────────────────────
export type IneqOp = '≥' | '>' | '≤' | '<';
export const INEQ_OPS: readonly IneqOp[] = ['≥', '>', '≤', '<'];

export function parseIneq(raw: string | undefined | null): { v: string; op: IneqOp | ''; num: string } {
  const m = /^\s*([xy])\s*(≥|>|≤|<|□)?\s*(.*)$/.exec(raw || '');
  if (!m) return { v: '', op: '', num: '' };
  const op = (m[2] && m[2] !== '□' ? m[2] : '') as IneqOp | '';
  return { v: m[1], op, num: (m[3] || '').trim() };
}

/** 부등호와 숫자 → 저장 글자 (둘 다 비면 '') */
export function composeIneq(v: 'x' | 'y', op: IneqOp | '', num: string): string {
  const n = num.trim();
  if (!op && !n) return '';
  return `${v} ${op || '□'} ${n}`.trimEnd();
}

type IneqCheck = 'ok' | 'empty' | 'noOp' | 'value' | 'direction' | 'equality';

/** 부등식 답 확인: 값·방향·등호를 나누어 알려 준다 */
export function checkIneq(raw: string | undefined, op: IneqOp, value: number): IneqCheck {
  const a = parseIneq(raw);
  if (!a.op && !a.num) return 'empty';
  if (!a.op) return 'noOp';
  if (!isRatNumber(a.num, value)) return 'value';
  const dirOf = (o: IneqOp) => (o === '≥' || o === '>' ? 'up' : 'down');
  if (dirOf(a.op) !== dirOf(op)) return 'direction';
  if (a.op !== op) return 'equality';
  return 'ok';
}

const ineqText = (v: 'x' | 'y', op: IneqOp, value: number) => `${v} ${op} ${numText(value)}`;

/** 숫자 글자 (분수는 a/b, 음수는 −) */
export function numText(n: number): string {
  const sign = n < 0 ? '−' : '';
  const m = Math.abs(n);
  if (Number.isInteger(m)) return `${sign}${m}`;
  for (let d = 2; d <= 12; d++) {
    const num = m * d;
    if (Math.abs(num - Math.round(num)) < 1e-9) return `${sign}${Math.round(num)}/${d}`;
  }
  return `${sign}${m}`;
}

// ─────────────────────────────────────────────
// 무리함수 y = s·√(a(x − p)) + q
// ─────────────────────────────────────────────
export interface IrrFn {
  /** 근호 앞의 부호 (y = −√… 이면 −1) */
  s: 1 | -1;
  a: number;
  p: number;
  q: number;
}

export function irrValue(f: IrrFn, x: number): number {
  const inside = f.a * (x - f.p);
  if (inside < -1e-12) return NaN;
  return f.s * Math.sqrt(Math.max(0, inside)) + f.q;
}

/** 근호 안 글자 (예: a=5, p=−2 → "5(x + 2)", a=−1, p=5 → "−(x − 5)", a=2, p=0 → "2x") */
export function radicandText(a: number, p: number): string {
  const aText = a === 1 ? '' : a === -1 ? '−' : numText(a);
  if (p === 0) return `${aText}x`;
  const inner = `x ${p > 0 ? '−' : '+'} ${numText(Math.abs(p))}`;
  return a === 1 ? inner : `${aText}(${inner})`;
}

/** 식 글자 (예: "y = −√(5(x + 2)) − 1") — MathText로 근호 모양 표시 */
export function irrLabel(f: IrrFn): string {
  const rad = radicandText(f.a, f.p);
  const root = /^[0-9]+$|^x$/.test(rad) ? `√${rad}` : `√(${rad})`;
  const qPart = f.q === 0 ? '' : ` ${f.q > 0 ? '+' : '−'} ${numText(Math.abs(f.q))}`;
  return `y = ${f.s < 0 ? '−' : ''}${root}${qPart}`;
}

export const irrDomain = (f: IrrFn) => ({ op: (f.a > 0 ? '≥' : '≤') as IneqOp, value: f.p });
export const irrRange = (f: IrrFn) => ({ op: (f.s > 0 ? '≥' : '≤') as IneqOp, value: f.q });
export const irrDomainText = (f: IrrFn) => `{x | ${ineqText('x', irrDomain(f).op, f.p)}}`;
export const irrRangeText = (f: IrrFn) => `{y | ${ineqText('y', irrRange(f).op, f.q)}}`;

// ─────────────────────────────────────────────
// 1단계 [생각 열기] 태풍의 풍속 6.3√(1013 − x)
// ─────────────────────────────────────────────
export const L8_OPEN_EXPR_OPTIONS = [
  ['a', '6.3√(1013 − x)'],
  ['b', '6.3√1013 − x'],
  ['c', '√(6.3(1013 − x))'],
  ['d', '6.3(1013 − x)'],
] as const;
export type L8OpenExpr = '' | (typeof L8_OPEN_EXPR_OPTIONS)[number][0];
/** 풍속 (m/s) */
export const typhoonSpeed = (pressure: number) => (pressure > 1013 ? NaN : 6.3 * Math.sqrt(1013 - pressure));
/** ② 중심 기압 949 hPa일 때 → 6.3 × √64 = 50.4 */
export const L8_OPEN_PRESSURE = 949;

export function validateL8Open(p: Lesson7State): L8Feedback {
  if (p.opExpr !== 'a') {
    return warn('① (중심 기압) 자리에 x를 넣어 보세요. 근호는 1013 − x 전체에 씌워져 있고, 6.3은 근호 밖에서 곱해집니다.');
  }
  const v = parseRatNumber(p.opSpeed);
  if (v === null || Math.abs(v - typhoonSpeed(L8_OPEN_PRESSURE)) > 1e-6) {
    return warn('② x = 949를 대입하면 1013 − 949 = 64이고, √64 = 8입니다. 6.3 × 8은?');
  }
  const c = checkIneq(p.opRange, '≤', 1013);
  if (c === 'empty' || c === 'noOp') return warn('③ 부등호를 고르고 숫자를 써서 x의 값의 범위를 나타내 보세요.');
  if (c === 'value') return warn('③ 근호 안의 식 1013 − x가 0 이상이어야 합니다. 이 부등식을 x에 대하여 풀어 보세요.');
  if (c === 'direction') return warn('③ 1013 − x ≥ 0을 풀면 x가 1013보다 큰 쪽일까요, 작은 쪽일까요? x = 1020을 넣어 보세요.');
  if (c === 'equality') return warn('③ x = 1013이면 √0 = 0이고, 0은 실수입니다. 등호를 포함해야 해요.');
  if (!hasReason(p.opReason)) return warn('③ 그렇게 생각한 이유를 8자 이상으로 써 주세요. (예: 근호 안이 음수이면 …)');
  return good('[생각 열기 완료] 풍속은 6.3√(1013 − x) m/s이고, x = 949이면 50.4 m/s입니다. 근호 안이 0 이상이어야 하므로 x ≤ 1013입니다.');
}

// ─────────────────────────────────────────────
// 2단계 [문제 1] 무리식의 값이 실수가 되는 x의 값의 범위
// ─────────────────────────────────────────────
export const L8_P1 = [
  { label: '√(2x − 3) + 1', op: '≥' as IneqOp, value: 3 / 2, key: 'p1a' as const },
  { label: 'x/√(4 − x)', op: '<' as IneqOp, value: 4, key: 'p1b' as const },
];

function ineqWarn(tag: string, c: IneqCheck, hints: { value: string; direction: string; equality: string }): L8Feedback | null {
  if (c === 'ok') return null;
  if (c === 'empty' || c === 'noOp') return warn(`${tag} 부등호를 고르고 숫자를 써 주세요.`);
  if (c === 'value') return warn(`${tag} ${hints.value}`);
  if (c === 'direction') return warn(`${tag} ${hints.direction}`);
  return warn(`${tag} ${hints.equality}`);
}

export function validateL8Prob1(p: Lesson7State): L8Feedback {
  const f1 = ineqWarn('(1)', checkIneq(p.p1a, '≥', 3 / 2), {
    value: '근호 안의 식 2x − 3이 0 이상이어야 합니다: 2x − 3 ≥ 0을 풀어 보세요. 분수는 3/2처럼 씁니다.',
    direction: '2x − 3 ≥ 0에서 2x ≥ 3입니다. 부등호 방향을 확인해 보세요.',
    equality: 'x = 3/2이면 √0 + 1 = 1로 실수입니다. 등호를 포함해야 해요.',
  });
  if (f1) return f1;
  const f2 = ineqWarn('(2)', checkIneq(p.p1b, '<', 4), {
    value: '근호 안의 식 4 − x를 보세요. 분모에 있으므로 0보다 커야 합니다: 4 − x > 0',
    direction: '4 − x > 0에서 x를 이항하면 4 > x입니다. 부등호 방향을 확인해 보세요.',
    equality: 'x = 4이면 분모가 √0 = 0이 되어 계산할 수 없습니다. 등호를 빼야 해요. ([보기] ② 참고)',
  });
  if (f2) return f2;
  return good('[문제 1] 정확합니다! (1) 2x − 3 ≥ 0에서 x ≥ 3/2 (2) 분모이므로 4 − x > 0에서 x < 4입니다.');
}

// ─────────────────────────────────────────────
// 3단계 무리식의 계산 — 예제 1, [문제 2]
// ─────────────────────────────────────────────
export interface L8CalcItem {
  /** 문제 식 (MathText 표시용) */
  label: string;
  /** 정답 식 (계산용 글자) */
  answer: string;
  /** 정답 식 (표시용) */
  answerLabel: string;
  /** 'noRoot' = 근호가 없어질 때까지 / 'rationalize' = 분모를 유리화 */
  kind: 'noRoot' | 'rationalize';
  hint: string;
}

export const L8_EX1: readonly L8CalcItem[] = [
  {
    label: '(√(x + 1) + 2)(√(x + 1) − 2)',
    answer: 'x-3',
    answerLabel: 'x − 3',
    kind: 'noRoot',
    hint: '(A + B)(A − B) = A² − B²에서 A = √(x + 1), B = 2이고, (√(x + 1))² = x + 1입니다.',
  },
  {
    label: '1/(√(x + 2) + √x)',
    answer: '(sqrt(x+2)-sqrt(x))/2',
    answerLabel: '(√(x + 2) − √x)/2',
    kind: 'rationalize',
    hint: '분모와 분자에 √(x + 2) − √x를 곱하면 분모가 (x + 2) − x = 2가 됩니다.',
  },
];

export const L8_P2: readonly L8CalcItem[] = [
  {
    label: '(√(x + 3) + √x)(√(x + 3) − √x)',
    answer: '3',
    answerLabel: '3',
    kind: 'noRoot',
    hint: '(√(x + 3))² − (√x)² = (x + 3) − x',
  },
  {
    label: '2/(√(x + 1) − √(x − 1))',
    answer: 'sqrt(x+1)+sqrt(x-1)',
    answerLabel: '√(x + 1) + √(x − 1)',
    kind: 'rationalize',
    hint: '분모와 분자에 √(x + 1) + √(x − 1)을 곱하면 분모는 (x + 1) − (x − 1) = 2입니다.',
  },
];

function checkCalc(item: L8CalcItem, raw: string | undefined, tag: string): L8Feedback | null {
  if (!(raw || '').trim()) return warn(`${tag} 간단히 한 식을 써 주세요.`);
  const node = parseIrr(raw);
  if (!node) return warn(`${tag} 식을 읽을 수 없어요. 근호는 √ 버튼이나 sqrt( )로, 분수는 /로 씁니다. 입력칸 아래 미리보기를 확인해 보세요.`);
  const cmp = compareIrr(raw, item.answer);
  if (cmp !== 'equal') return warn(`${tag} 값이 달라요. ${item.hint}`);
  if (item.kind === 'noRoot' && hasVarRoot(node)) {
    return warn(`${tag} 값은 맞지만 근호가 남아 있어요. (√A)² = A를 이용해 근호가 없는 식으로 간단히 해 보세요.`);
  }
  if (item.kind === 'rationalize' && hasRootInDenominator(node)) {
    return warn(`${tag} 값은 맞지만 분모에 근호가 남아 있어요. 분모를 유리화해 보세요.`);
  }
  return null;
}

export function validateL8Ex1(p: Lesson7State): L8Feedback {
  const fb = checkCalc(L8_EX1[0], p.ex1a, '(1)') || checkCalc(L8_EX1[1], p.ex1b, '(2)');
  if (fb) return fb;
  return good('[예제 1] 정확합니다! (1) x − 3 (2) (√(x + 2) − √x)/2 — 분모의 유리화는 무리수의 계산과 같은 방법이에요.');
}

export function validateL8Prob2(p: Lesson7State): L8Feedback {
  const fb = checkCalc(L8_P2[0], p.p2a, '(1)') || checkCalc(L8_P2[1], p.p2b, '(2)');
  if (fb) return fb;
  if (!hasReason(p.p2Reason)) return warn('(2)에서 분모를 유리화한 방법을 8자 이상으로 써 주세요.');
  return good('[문제 2] 정확합니다! (1) 3 (2) √(x + 1) + √(x − 1)입니다.');
}

// ─────────────────────────────────────────────
// 4단계 [문제 3] 무리함수의 정의역
// ─────────────────────────────────────────────
export const L8_P3 = [
  { label: 'y = −√(x + 4)', op: '≥' as IneqOp, value: -4 },
  { label: 'y = √(5 − 2x) − 1', op: '≤' as IneqOp, value: 5 / 2 },
];

export function validateL8Prob3(p: Lesson7State): L8Feedback {
  const f1 = ineqWarn('(1)', checkIneq(p.p3a, '≥', -4), {
    value: '근호 앞의 −는 정의역과 상관없어요. 근호 안의 식 x + 4 ≥ 0을 풀어 보세요.',
    direction: 'x + 4 ≥ 0에서 x ≥ −4입니다. 부등호 방향을 확인해 보세요.',
    equality: 'x = −4이면 y = −√0 = 0으로 값이 있어요. 등호를 포함해야 해요.',
  });
  if (f1) return f1;
  const f2 = ineqWarn('(2)', checkIneq(p.p3b, '≤', 5 / 2), {
    value: '근호 안의 식 5 − 2x ≥ 0을 풀어 보세요. 분수는 5/2처럼 씁니다.',
    direction: '5 − 2x ≥ 0에서 5 ≥ 2x입니다. x가 5/2보다 큰 쪽일까요, 작은 쪽일까요?',
    equality: 'x = 5/2이면 √0 − 1 = −1로 값이 있어요. 등호를 포함해야 해요.',
  });
  if (f2) return f2;
  return good('[문제 3] 정확합니다! (1) {x | x ≥ −4} (2) {x | x ≤ 5/2}입니다.');
}

/** [읽기 자료] 실생활 속의 무리함수 — 화면에서 값만 계산 (저장·채점 없음) */
export const L8_READING = [
  { key: 'hose', title: '소방 호스', k: 928, xLabel: '물의 압력', xUnit: 'hPa', yLabel: '물의 속력', yUnit: 'm/s', min: 0, max: 2000, step: 50, init: 500 },
  { key: 'tsunami', title: '지진 해일', k: 9.8, xLabel: '수심', xUnit: 'm', yLabel: '지진 해일의 속력', yUnit: 'm/s', min: 0, max: 5000, step: 100, init: 1000 },
  { key: 'body', title: '인체의 겉넓이 (키 120 cm)', k: 0.03, xLabel: '몸무게', xUnit: 'kg', yLabel: '겉넓이', yUnit: 'm²', min: 0, max: 60, step: 1, init: 25 },
] as const;

// ─────────────────────────────────────────────
// 5단계 y = √ax, y = −√ax의 그래프 — 함께 탐구, [문제 4], [문제 5]
// ─────────────────────────────────────────────
export type SignChoice = '' | 'ge' | 'le' | 'all';
export type AxisTrend = '' | 'far' | 'near' | 'same';

export function validateL8Sqrt(p: Lesson7State): L8Feedback {
  if (p.sqDomain !== 'ge') return warn('① 근호 안의 x가 0 이상이어야 √x가 실수입니다. 정의역을 다시 골라 보세요.');
  if (p.sqRange !== 'ge') return warn('① √x는 0 이상의 값만 나옵니다. 역함수 y = x² (x ≥ 0)의 정의역이 y = √x의 치역이에요.');
  if (p.sqTrend !== 'far') return warn('② a = 1과 a = 3을 비교해 보세요. x = 1일 때 점 (1, √a)는 a가 커지면 어디로 가나요?');
  return good('[함께 탐구 완료] y = √x의 정의역은 {x | x ≥ 0}, 치역은 {y | y ≥ 0}이고, |a|가 커질수록 y = √ax의 그래프는 x축에서 멀어집니다.');
}

export type Quadrant = '' | '1' | '2' | '3' | '4';
export type Symmetry = '' | 'x' | 'y' | 'o';
export const SYMMETRY_LABEL: Record<Exclude<Symmetry, ''>, string> = { x: 'x축', y: 'y축', o: '원점' };

export const L8_P4 = [
  { label: 'y = −√x', fn: { s: -1, a: 1, p: 0, q: 0 } as IrrFn, quad: '4' as Quadrant, sym: 'x' as Symmetry },
  { label: 'y = √(−x)', fn: { s: 1, a: -1, p: 0, q: 0 } as IrrFn, quad: '2' as Quadrant, sym: 'y' as Symmetry },
  { label: 'y = −√(−x)', fn: { s: -1, a: -1, p: 0, q: 0 } as IrrFn, quad: '3' as Quadrant, sym: 'o' as Symmetry },
];
export const L8_P4_QUAD_KEYS = ['p4q1', 'p4q2', 'p4q3'] as const;
export const L8_P4_SYM_KEYS = ['p4s1', 'p4s2', 'p4s3'] as const;

export function validateL8Prob4(p: Lesson7State): L8Feedback {
  for (let i = 0; i < L8_P4.length; i++) {
    const it = L8_P4[i];
    if (p[L8_P4_SYM_KEYS[i]] !== it.sym) {
      return warn(
        `(${i + 1}) ${it.label}: y 대신 −y를 쓰면 x축 대칭, x 대신 −x를 쓰면 y축 대칭, 둘 다 바꾸면 원점 대칭입니다. 어느 것을 바꾸었나요?`
      );
    }
    if (p[L8_P4_QUAD_KEYS[i]] !== it.quad) {
      return warn(`(${i + 1}) ${it.label}: y = √x의 그래프(제1사분면)를 ${SYMMETRY_LABEL[it.sym as 'x' | 'y' | 'o']}에 대하여 대칭이동하면 어느 사분면으로 가나요?`);
    }
  }
  return good('[문제 4] 정확합니다! (1) x축 대칭 → 제4사분면 (2) y축 대칭 → 제2사분면 (3) 원점 대칭 → 제3사분면입니다.');
}

export const L8_P5: readonly { label: string; fn: IrrFn }[] = [
  { label: 'y = √(5x)', fn: { s: 1, a: 5, p: 0, q: 0 } },
  { label: 'y = √(−4x)', fn: { s: 1, a: -4, p: 0, q: 0 } },
  { label: 'y = −√(2x)', fn: { s: -1, a: 2, p: 0, q: 0 } },
  { label: 'y = −√(−3x)', fn: { s: -1, a: -3, p: 0, q: 0 } },
];
export const L8_P5_DOMAIN_KEYS = ['p5d1', 'p5d2', 'p5d3', 'p5d4'] as const;
export const L8_P5_RANGE_KEYS = ['p5r1', 'p5r2', 'p5r3', 'p5r4'] as const;

export function validateL8Prob5(p: Lesson7State): L8Feedback {
  for (let i = 0; i < L8_P5.length; i++) {
    const { label, fn } = L8_P5[i];
    const wantD: SignChoice = fn.a > 0 ? 'ge' : 'le';
    const wantR: SignChoice = fn.s > 0 ? 'ge' : 'le';
    if (p[L8_P5_DOMAIN_KEYS[i]] !== wantD) {
      return warn(`(${i + 1}) ${label}: 근호 안의 식 ${fn.a > 0 ? '' : '−'}${Math.abs(fn.a)}x가 0 이상이 되는 x의 범위를 생각해 보세요.`);
    }
    if (p[L8_P5_RANGE_KEYS[i]] !== wantR) {
      return warn(`(${i + 1}) ${label}: 근호의 값은 0 이상이에요. 근호 앞에 −가 ${fn.s > 0 ? '없으면' : '있으면'} y의 값은?`);
    }
  }
  return good('[문제 5] 정확합니다! 정의역은 a의 부호로(a > 0이면 x ≥ 0, a < 0이면 x ≤ 0), 치역은 근호 앞의 부호로 정해집니다.');
}

// ─────────────────────────────────────────────
// 6단계 평행이동 — [문제 6] y = √(a(x − p)) + q
// ─────────────────────────────────────────────
export const L8_P6: readonly { label: string; base: string; fn: IrrFn }[] = [
  { label: 'y = √(−(x − 5)) + 1', base: 'y = √(−x)', fn: { s: 1, a: -1, p: 5, q: 1 } },
  { label: 'y = −√(5(x + 2)) − 1', base: 'y = −√(5x)', fn: { s: -1, a: 5, p: -2, q: -1 } },
];
export const L8_P6_KEYS = [
  { p: 'p6_1p', q: 'p6_1q', d: 'p6_1d', r: 'p6_1r' },
  { p: 'p6_2p', q: 'p6_2q', d: 'p6_2d', r: 'p6_2r' },
] as const;

function checkDomainRange(f: IrrFn, d: string | undefined, r: string | undefined, tag: string): L8Feedback | null {
  const dom = irrDomain(f);
  const fd = ineqWarn(`${tag} 정의역:`, checkIneq(d, dom.op, dom.value), {
    value: `근호 안의 식 ${radicandText(f.a, f.p)}이(가) 0 이상이 되는 x의 범위를 구해 보세요. 그래프의 시작점의 x좌표와 같아요.`,
    direction: `a ${f.a > 0 ? '> 0' : '< 0'}이므로 그래프는 시작점에서 ${f.a > 0 ? '오른쪽' : '왼쪽'}으로 뻗어요. 부등호 방향을 확인해 보세요.`,
    equality: `x = ${numText(f.p)}이면 근호 안이 0이 되어 값이 있어요. 등호를 포함해야 해요.`,
  });
  if (fd) return fd;
  const rng = irrRange(f);
  const fr = ineqWarn(`${tag} 치역:`, checkIneq(r, rng.op, rng.value), {
    value: '근호 부분은 0 이상(또는 앞에 −가 있으면 0 이하)이고, 여기에 q를 더합니다. 그래프의 시작점의 y좌표를 보세요.',
    direction: `근호 앞에 −가 ${f.s > 0 ? '없으므로 그래프는 시작점에서 위로' : '있으므로 그래프는 시작점에서 아래로'} 뻗어요. 부등호 방향을 확인해 보세요.`,
    equality: `시작점에서 y = ${numText(f.q)}이므로 등호를 포함해야 해요.`,
  });
  return fr;
}

export function validateL8Prob6(p: Lesson7State): L8Feedback {
  for (let i = 0; i < L8_P6.length; i++) {
    const { fn, base } = L8_P6[i];
    const k = L8_P6_KEYS[i];
    if (!isRatNumber(p[k.p], fn.p)) {
      return warn(
        `(${i + 1}) √(a(x − p)) 꼴에서 x축 방향으로 p만큼 평행이동합니다.${fn.p < 0 ? ` x + ${numText(-fn.p)} = x − (${numText(fn.p)})이므로 p의 부호에 주의하세요.` : ''}`
      );
    }
    if (!isRatNumber(p[k.q], fn.q)) return warn(`(${i + 1}) ${base}의 그래프를 y축 방향으로 얼마만큼 옮겼는지 식 끝의 수 q를 보세요.`);
    const fb = checkDomainRange(fn, p[k.d], p[k.r], `(${i + 1})`);
    if (fb) return fb;
  }
  return good(
    `[문제 6] 정확합니다! (1) 정의역 ${irrDomainText(L8_P6[0].fn)}, 치역 ${irrRangeText(L8_P6[0].fn)} (2) 정의역 ${irrDomainText(L8_P6[1].fn)}, 치역 ${irrRangeText(L8_P6[1].fn)}`
  );
}

// ─────────────────────────────────────────────
// 7단계 y = √(ax + b) + c → y = √(a(x − p)) + q — 예제 2, [문제 7]
// ─────────────────────────────────────────────
export interface L8Transform {
  label: string;
  fn: IrrFn;
  /** 근호 안을 a로 묶는 힌트 */
  hint: string;
}
export const L8_EX2: L8Transform = { label: 'y = √(2x + 8) + 2', fn: { s: 1, a: 2, p: -4, q: 2 }, hint: '2x + 8 = 2(x + 4) = 2(x − (−4))' };
export const L8_P7: readonly L8Transform[] = [
  { label: 'y = √(−3x + 3) − 2', fn: { s: 1, a: -3, p: 1, q: -2 }, hint: '−3x + 3 = −3(x − 1)' },
  { label: 'y = −√(−x + 4) + 5', fn: { s: -1, a: -1, p: 4, q: 5 }, hint: '−x + 4 = −(x − 4)' },
];

export interface TransformAnswer {
  s?: '' | '+' | '-';
  a?: string;
  p?: string;
  q?: string;
  d?: string;
  r?: string;
}

function checkTransform(t: L8Transform, ans: TransformAnswer, tag: string): L8Feedback | null {
  const { fn } = t;
  if ((ans.s || '+') !== (fn.s > 0 ? '+' : '-')) return warn(`${tag} 근호 앞의 부호를 확인해 보세요.`);
  if (!isRatNumber(ans.a, fn.a)) return warn(`${tag} 근호 안의 식을 x의 계수 a로 묶어 보세요: ${t.hint}`);
  if (!isRatNumber(ans.p, fn.p)) {
    if (isRatNumber(ans.p, -fn.p)) return warn(`${tag} a(x − p) 꼴에서 p의 부호를 확인하세요: ${t.hint}`);
    return warn(`${tag} ${t.hint}이므로 p는?`);
  }
  if (!isRatNumber(ans.q, fn.q)) return warn(`${tag} 근호 밖에 더해진 수가 q입니다.`);
  return checkDomainRange(fn, ans.d, ans.r, tag);
}

export function validateL8Ex2(p: Lesson7State): L8Feedback {
  return (
    checkTransform(L8_EX2, { s: p.ex2s, a: p.ex2a, p: p.ex2p, q: p.ex2q, d: p.ex2d, r: p.ex2r }, '') ||
    good('[예제 2] 정확합니다! y = √(2(x + 4)) + 2이므로 y = √(2x)의 그래프를 x축 방향으로 −4만큼, y축 방향으로 2만큼 평행이동한 것이고, 정의역 {x | x ≥ −4}, 치역 {y | y ≥ 2}입니다.')
  );
}

export function validateL8Prob7(p: Lesson7State): L8Feedback {
  const fb =
    checkTransform(L8_P7[0], { s: p.p7_1s, a: p.p7_1a, p: p.p7_1p, q: p.p7_1q, d: p.p7_1d, r: p.p7_1r }, '(1)') ||
    checkTransform(L8_P7[1], { s: p.p7_2s, a: p.p7_2a, p: p.p7_2p, q: p.p7_2q, d: p.p7_2d, r: p.p7_2r }, '(2)');
  if (fb) return fb;
  if (!hasReason(p.p7Reason)) return warn('y = √(ax + b) + c의 그래프를 그리는 방법을 8자 이상으로 정리해 주세요.');
  return good(
    `[문제 7] 완벽합니다! (1) ${irrLabel(L8_P7[0].fn)}, 정의역 ${irrDomainText(L8_P7[0].fn)}, 치역 ${irrRangeText(L8_P7[0].fn)} (2) ${irrLabel(L8_P7[1].fn)}, 정의역 ${irrDomainText(L8_P7[1].fn)}, 치역 ${irrRangeText(L8_P7[1].fn)}`
  );
}

// ─────────────────────────────────────────────
// 교사 화면·인쇄용 요약
// ─────────────────────────────────────────────
const v = (s?: string) => (s && s.trim() ? s.trim() : '-');
const choiceText: Record<string, string> = { ge: '≥ 0', le: '≤ 0', all: '모든 실수' };
const sym = (s?: string) => (s && s in SYMMETRY_LABEL ? SYMMETRY_LABEL[s as 'x' | 'y' | 'o'] : '-');

/** 8·9차시 답안 요약 줄 (단계 순서 7줄 — 입력이 없는 줄은 '') — 앞 5줄 = 8차시, 뒤 2줄 = 9차시 (L8_SUMMARY_SPLIT) */
export function summarizeL8Lines(p: Lesson7State | undefined | null): string[] {
  if (!p) return [];
  const openExpr = L8_OPEN_EXPR_OPTIONS.find(([k]) => k === p.opExpr)?.[1];
  const lines = [
    p.opExpr || p.opSpeed || p.opRange || p.opReason
      ? `[생각 열기] 식: ${openExpr ?? '-'}, 949 hPa → ${v(p.opSpeed)} m/s, 범위: ${v(p.opRange)} / ${v(p.opReason)}`
      : '',
    p.p1a || p.p1b ? `[문제 1] (1) ${v(p.p1a)} (2) ${v(p.p1b)}` : '',
    p.ex1a || p.ex1b || p.p2a || p.p2b || p.p2Reason
      ? `[무리식의 계산] 예제 1 (1) ${v(p.ex1a)} (2) ${v(p.ex1b)} / 문제 2 (1) ${v(p.p2a)} (2) ${v(p.p2b)} / ${v(p.p2Reason)}`
      : '',
    p.p3a || p.p3b ? `[문제 3] (1) ${v(p.p3a)} (2) ${v(p.p3b)}` : '',
    p.sqDomain || p.sqRange || p.sqTrend || L8_P4_QUAD_KEYS.some((k) => p[k]) || L8_P5_DOMAIN_KEYS.some((k) => p[k])
      ? `[y = √ax] 정의역 x ${choiceText[p.sqDomain || ''] ?? '-'}, 치역 y ${choiceText[p.sqRange || ''] ?? '-'}, |a|↑: ${
          p.sqTrend === 'far' ? 'x축에서 멀어짐' : p.sqTrend === 'near' ? 'x축에 가까워짐' : p.sqTrend === 'same' ? '변화 없음' : '-'
        } / 문제 4 ${L8_P4.map((_, i) => `(${i + 1}) ${sym(p[L8_P4_SYM_KEYS[i]])} 대칭·제${p[L8_P4_QUAD_KEYS[i]] || '-'}사분면`).join(' ')} / 문제 5 ${L8_P5.map(
          (_, i) => `(${i + 1}) x ${choiceText[p[L8_P5_DOMAIN_KEYS[i]] || ''] ?? '-'}, y ${choiceText[p[L8_P5_RANGE_KEYS[i]] || ''] ?? '-'}`
        ).join(' ')}`
      : '',
    L8_P6_KEYS.some((k) => p[k.p] || p[k.d])
      ? `[문제 6] ${L8_P6_KEYS.map((k, i) => `(${i + 1}) p=${v(p[k.p])}, q=${v(p[k.q])}, 정의역 ${v(p[k.d])}, 치역 ${v(p[k.r])}`).join(' / ')}`
      : '',
    p.ex2a || p.p7_1a || p.p7_2a || p.p7Reason
      ? `[변형] 예제 2: ${p.ex2s === '-' ? '−' : ''}√(${v(p.ex2a)}(x − ${v(p.ex2p)})) + ${v(p.ex2q)}, ${v(p.ex2d)}, ${v(p.ex2r)} / 문제 7 (1) ${
          p.p7_1s === '-' ? '−' : ''
        }√(${v(p.p7_1a)}(x − ${v(p.p7_1p)})) + ${v(p.p7_1q)}, ${v(p.p7_1d)}, ${v(p.p7_1r)} (2) ${p.p7_2s === '-' ? '−' : ''}√(${v(p.p7_2a)}(x − ${v(p.p7_2p)})) + ${v(
          p.p7_2q
        )}, ${v(p.p7_2d)}, ${v(p.p7_2r)} / ${v(p.p7Reason)}`
      : '',
  ];
  return lines;
}

/** 요약 줄 중 8차시 몫 (앞 5줄: 생각 열기·문제 1·계산·문제 3·y = √ax) */
export const L8_SUMMARY_SPLIT = 5;

/** 8차시 답안 요약 (입력이 없으면 빈 문자열) */
export function summarizeL8(p: Lesson7State | undefined | null): string {
  return summarizeL8Lines(p).slice(0, L8_SUMMARY_SPLIT).filter(Boolean).join('\n');
}

/** 9차시 답안 요약 (평행이동·변형 — 입력이 없으면 빈 문자열) */
export function summarizeL9(p: Lesson7State | undefined | null): string {
  return summarizeL8Lines(p).slice(L8_SUMMARY_SPLIT).filter(Boolean).join('\n');
}
