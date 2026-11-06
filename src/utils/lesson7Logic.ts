import type { Lesson6State } from './mathLogic';
import { isRatNumber } from './ratExpr';

/**
 * Func 7차시 · 유리함수 y = k/x와 y = k/(x − p) + q의 그래프 — 문항 자료와 채점 (순수 로직, 단위 테스트 대상)
 * ------------------------------------------------------------------
 * 학생 화면: src/components/Lesson7View.tsx / 그래프: src/components/RationalGraph.tsx
 * 저장 칸: func_lessons/l6 (형식 Lesson6State — 예전 절대부등식2 항목은 보존만, 새 항목을 추가)
 * 단계 완료·루브릭 판정: mathLogic.ts evaluateLevel7Completion / evaluateRubricL7
 */

export interface L7Feedback {
  ok: boolean;
  message: string;
  type: 'good' | 'warn';
}

const warn = (message: string): L7Feedback => ({ ok: false, message, type: 'warn' });
const good = (message: string): L7Feedback => ({ ok: true, message, type: 'good' });

/** 7차시 이유 칸 최소 글자 수 — 채점과 학생 화면 글자 수 표시가 함께 쓴다 */
export const L7_MIN_REASON = 8;
/** 7차시 성찰 칸 최소 글자 수 (완료 조건: 성찰 1) */
export const L7_MIN_REFLECTION = 10;
const hasReason = (v?: string) => (v || '').trim().length >= L7_MIN_REASON;

/** 지나는 사분면 */
export type Quadrants = '' | '13' | '24';
export const QUADRANT_LABEL: Record<Exclude<Quadrants, ''>, string> = { '13': '제1사분면과 제3사분면', '24': '제2사분면과 제4사분면' };

/** y = k/(x − p) + q */
export interface RationalFn {
  k: number;
  p: number;
  q: number;
}
export const rationalValue = (f: RationalFn, x: number): number => {
  const d = x - f.p;
  if (Math.abs(d) < 1e-12) return NaN;
  return f.k / d + f.q;
};

const fmt = (n: number) => {
  if (Number.isInteger(n)) return n < 0 ? `−${-n}` : String(n);
  for (let d = 2; d <= 12; d++) {
    const num = n * d;
    if (Math.abs(num - Math.round(num)) < 1e-9) return `${n < 0 ? '−' : ''}${Math.abs(Math.round(num))}/${d}`;
  }
  return String(n);
};

/** 식 글자 (예: k=−3, p=−1, q=2 → "y = −3/(x + 1) + 2") */
export function rationalLabel(f: RationalFn): string {
  const kPart = f.k < 0 ? `−${fmt(-f.k)}` : fmt(f.k);
  const den = f.p === 0 ? 'x' : `(x ${f.p > 0 ? '−' : '+'} ${fmt(Math.abs(f.p))})`;
  const qPart = f.q === 0 ? '' : ` ${f.q > 0 ? '+' : '−'} ${fmt(Math.abs(f.q))}`;
  return `y = ${kPart}/${den}${qPart}`;
}

// ─────────────────────────────────────────────
// 1단계 [함께하기] y = k/x의 그래프와 k
// ─────────────────────────────────────────────
export function validateL7Together(p: Lesson6State): L7Feedback {
  if (p.tgPosQuad !== '13') {
    return warn('① 슬라이더를 k > 0(예: k = 1, 2)으로 두고 그래프가 어느 사분면에 있는지 보세요. x > 0이면 y = k/x도 양수예요.');
  }
  if (p.tgNegQuad !== '24') {
    return warn('① k < 0(예: k = −1)일 때 x > 0이면 y = k/x는 음수입니다. 그래프가 지나는 사분면을 다시 확인해 보세요.');
  }
  if (p.tgAbsTrend !== 'far') {
    return warn('② k = 1과 k = 4를 비교해 보세요. 같은 x에서 |y|가 커지므로 그래프는 원점에서 어떻게 되나요?');
  }
  if (!hasReason(p.tgReason)) {
    return warn('② 그렇게 생각한 이유를 8자 이상으로 서술해 주세요. (예: x = 1일 때의 점 (1, k)를 비교)');
  }
  return good(
    '[함께하기 완료] k > 0이면 제1·3사분면, k < 0이면 제2·4사분면에 그래프가 있고, |k|가 커질수록 그래프는 원점에서 멀어집니다.'
  );
}

// ─────────────────────────────────────────────
// 2단계 [문제 4] y = k/x의 그래프 그리기
// ─────────────────────────────────────────────
export const L7_P4 = [
  { label: 'y = 3/x', raw: '3/x', k: 3 },
  { label: 'y = −3/x', raw: '-3/x', k: -3 },
  { label: 'y = 1/(4x)', raw: '1/(4x)', k: 1 / 4 },
  { label: 'y = −1/(4x)', raw: '-1/(4x)', k: -1 / 4 },
] as const;
export const L7_P4_QUAD_KEYS = ['p4q1', 'p4q2', 'p4q3', 'p4q4'] as const;
export const L7_P4_VAL_KEYS = ['p4v1', 'p4v2', 'p4v3', 'p4v4'] as const;

export function validateL7Prob4(p: Lesson6State): L7Feedback {
  for (let i = 0; i < L7_P4.length; i++) {
    const fn = L7_P4[i];
    const quad = p[L7_P4_QUAD_KEYS[i]];
    const want: Quadrants = fn.k > 0 ? '13' : '24';
    if (quad !== want) {
      return warn(`(${i + 1}) ${fn.label}에서 k ${fn.k > 0 ? '> 0' : '< 0'}입니다. 그래프가 지나는 사분면을 골라 보세요.`);
    }
    if (!isRatNumber(p[L7_P4_VAL_KEYS[i]], fn.k)) {
      return warn(`(${i + 1}) ${fn.label}에 x = 1을 대입해 보세요.${i >= 2 ? ' 분수는 1/4처럼 씁니다.' : ''}`);
    }
  }
  return good(
    '[문제 4] 정확합니다! (1) y = 3/x와 (3) y = 1/(4x)는 제1·3사분면, (2)·(4)는 제2·4사분면에 있습니다. |k|가 작은 (3)·(4)는 (1)·(2)보다 원점에 가까워요.'
  );
}

// ─────────────────────────────────────────────
// 3단계 평행이동 — 생각 톡톡, [문제 5]
// ─────────────────────────────────────────────
/** [생각 톡톡] y = k/(x − p) + q의 그래프는 점 (p, q)에 대하여 대칭 */
export function validateL7Think(p: Lesson6State): L7Feedback {
  if ((p.thinkSymX || '').trim().toLowerCase() !== 'p' || (p.thinkSymY || '').trim().toLowerCase() !== 'q') {
    return warn(
      'y = k/x의 그래프는 원점 (0, 0)에 대하여 대칭입니다. 이 그래프를 x축 방향으로 p만큼, y축 방향으로 q만큼 옮기면 원점은 어디로 옮겨질까요? (문자 p, q로 쓰세요)'
    );
  }
  return good('[생각 톡톡] 맞아요! 원점이 점 (p, q)로 옮겨지므로, 그래프는 두 점근선의 교점 (p, q)에 대하여 대칭입니다.');
}

/** [문제 5] (1) y = 2/(x − 1) − 5, (2) y = −6/(x + 3) − 2 */
export const L7_P5: readonly RationalFn[] = [
  { k: 2, p: 1, q: -5 },
  { k: -6, p: -3, q: -2 },
];

export function validateL7Prob5(p: Lesson6State): L7Feedback {
  const pairs = [
    [p.p5_1x, p.p5_1y],
    [p.p5_2x, p.p5_2y],
  ];
  for (let i = 0; i < L7_P5.length; i++) {
    const f = L7_P5[i];
    if (!isRatNumber(pairs[i][0], f.p)) {
      return warn(`(${i + 1}) ${rationalLabel(f)}에서 분모가 0이 되는 x의 값이 세로 점근선입니다. x − p 꼴로 보면 p는?`);
    }
    if (!isRatNumber(pairs[i][1], f.q)) {
      return warn(`(${i + 1}) 그래프를 y축 방향으로 얼마만큼 평행이동했는지 보세요. 그 값이 가로 점근선 y = q입니다.`);
    }
  }
  return good('[문제 5] 정확합니다! 점근선은 (1) x = 1, y = −5 (2) x = −3, y = −2입니다.');
}

// ─────────────────────────────────────────────
// 4단계 y = (ax + b)/(cx + d) 변형 — 예제 2, [문제 6]
// ─────────────────────────────────────────────
export interface L7Transform {
  /** 문제 식 (계산용) */
  raw: string;
  label: string;
  fn: RationalFn;
  /** 변형 힌트 */
  hint: string;
}

export const L7_EX2: L7Transform = {
  raw: '(2x-1)/(x+1)',
  label: 'y = (2x − 1)/(x + 1)',
  fn: { k: -3, p: -1, q: 2 },
  hint: '분자를 분모 x + 1로 나타내 보세요: 2x − 1 = 2(x + 1) − 3',
};
export const L7_P6: readonly L7Transform[] = [
  { raw: '2x/(x-3)', label: 'y = 2x/(x − 3)', fn: { k: 6, p: 3, q: 2 }, hint: '2x = 2(x − 3) + 6' },
  { raw: '(-3x+1)/(x-1)', label: 'y = (−3x + 1)/(x − 1)', fn: { k: -2, p: 1, q: -3 }, hint: '−3x + 1 = −3(x − 1) − 2' },
];

interface TransformAnswer {
  k?: string;
  p?: string;
  q?: string;
  ax?: string;
  ay?: string;
}

function checkTransform(t: L7Transform, a: TransformAnswer, tag: string): L7Feedback | null {
  const { k, p, q } = t.fn;
  if (!isRatNumber(a.k, k) || !isRatNumber(a.p, p) || !isRatNumber(a.q, q)) {
    return warn(
      `${tag} ${t.label}을 y = k/(x − p) + q 꼴로 바꿔 보세요. ${t.hint}이므로 분자를 분모로 나누면 됩니다. (x + 1 = x − (−1)처럼 p의 부호에 주의)`
    );
  }
  if (!isRatNumber(a.ax, p) || !isRatNumber(a.ay, q)) {
    return warn(`${tag} 점근선은 두 직선 x = p, y = q입니다. 위에서 구한 p, q를 이용해 보세요.`);
  }
  return null;
}

export function validateL7Ex2(p: Lesson6State): L7Feedback {
  return (
    checkTransform(L7_EX2, { k: p.ex2k, p: p.ex2p, q: p.ex2q, ax: p.ex2ax, ay: p.ex2ay }, '') ||
    good('[예제 2] 정확합니다! y = −3/(x + 1) + 2이므로 y = −3/x의 그래프를 x축 방향으로 −1만큼, y축 방향으로 2만큼 평행이동한 것이고, 점근선은 x = −1, y = 2입니다.')
  );
}

export function validateL7Prob6(p: Lesson6State): L7Feedback {
  const fb =
    checkTransform(L7_P6[0], { k: p.p6_1k, p: p.p6_1p, q: p.p6_1q, ax: p.p6_1ax, ay: p.p6_1ay }, '(1)') ||
    checkTransform(L7_P6[1], { k: p.p6_2k, p: p.p6_2p, q: p.p6_2q, ax: p.p6_2ax, ay: p.p6_2ay }, '(2)');
  if (fb) return fb;
  if (!hasReason(p.p6Reason)) {
    return warn('y = (ax + b)/(cx + d)를 y = k/(x − p) + q 꼴로 바꾸는 방법을 8자 이상으로 정리해 주세요.');
  }
  return good('[문제 6] 완벽합니다! (1) y = 6/(x − 3) + 2, 점근선 x = 3, y = 2 (2) y = −2/(x − 1) − 3, 점근선 x = 1, y = −3입니다.');
}

// ─────────────────────────────────────────────
// 문제별 [그래프로 확인하기] (정답 확인을 통과해야 켜짐)
// ─────────────────────────────────────────────
export interface L7GraphItem {
  title?: string;
  label: string;
  fn: RationalFn;
}
export const L7_GRAPH_SETS: Record<'p4' | 'p5' | 'ex2' | 'p6', L7GraphItem[]> = {
  p4: L7_P4.map((f, i) => ({ title: `(${i + 1})`, label: f.label, fn: { k: f.k, p: 0, q: 0 } })),
  p5: L7_P5.map((fn, i) => ({ title: `(${i + 1})`, label: rationalLabel(fn), fn })),
  ex2: [{ label: `${L7_EX2.label} = ${rationalLabel(L7_EX2.fn).slice(4)}`, fn: L7_EX2.fn }],
  p6: L7_P6.map((t, i) => ({ title: `(${i + 1})`, label: `${t.label} = ${rationalLabel(t.fn).slice(4)}`, fn: t.fn })),
};

// ─────────────────────────────────────────────
// 교사 화면·인쇄용 요약
// ─────────────────────────────────────────────
const v = (s?: string) => (s && s.trim() ? s.trim() : '-');
const quad = (q?: Quadrants) => (q ? `${q[0]}·${q[1]}사분면` : '-');

/** 7차시 답안 요약 (입력이 없으면 빈 문자열) */
export function summarizeL7(p: Lesson6State | undefined | null): string {
  if (!p) return '';
  const lines = [
    p.tgPosQuad || p.tgNegQuad || p.tgReason
      ? `[함께하기] k>0: ${quad(p.tgPosQuad)}, k<0: ${quad(p.tgNegQuad)}, |k|↑: ${
          p.tgAbsTrend === 'far' ? '원점에서 멀어짐' : p.tgAbsTrend === 'near' ? '원점에 가까워짐' : p.tgAbsTrend === 'same' ? '변화 없음' : '-'
        } / ${v(p.tgReason)}`
      : '',
    L7_P4_QUAD_KEYS.some((k) => p[k]) || L7_P4_VAL_KEYS.some((k) => (p[k] || '').trim())
      ? `[문제 4] ${L7_P4.map((f, i) => `(${i + 1}) ${quad(p[L7_P4_QUAD_KEYS[i]])}, x=1→${v(p[L7_P4_VAL_KEYS[i]])}`).join(' / ')}`
      : '',
    p.thinkSymX || p.thinkSymY || p.p5_1x || p.p5_2x
      ? `[생각 톡톡] 대칭인 점 (${v(p.thinkSymX)}, ${v(p.thinkSymY)}) / [문제 5] (1) x=${v(p.p5_1x)}, y=${v(p.p5_1y)} (2) x=${v(p.p5_2x)}, y=${v(p.p5_2y)}`
      : '',
    p.ex2k || p.p6_1k || p.p6_2k || p.p6Reason
      ? `[변형] 예제 2: k=${v(p.ex2k)}, p=${v(p.ex2p)}, q=${v(p.ex2q)} (점근선 x=${v(p.ex2ax)}, y=${v(p.ex2ay)}) / 문제 6 (1) k=${v(p.p6_1k)}, p=${v(p.p6_1p)}, q=${v(p.p6_1q)} (2) k=${v(p.p6_2k)}, p=${v(p.p6_2p)}, q=${v(p.p6_2q)} / ${v(p.p6Reason)}`
      : '',
  ];
  return lines.filter(Boolean).join('\n');
}
