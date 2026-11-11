import React from 'react';
import { Expr, Frac } from './RatMath';

/**
 * 6차시 2단계 핵심 개념: '안쪽 집합 ⊂ 바깥 집합' 세 쌍을 같은 모양의 벤다이어그램으로 나란히 보여 줍니다.
 *   정수 ⊂ 유리수 · 다항식 ⊂ 유리식 · 다항함수 ⊂ 유리함수
 * 예시는 [문제 1]의 다섯 식(L6_P1_EXPRS)과 겹치지 않게 골랐습니다(답이 드러나지 않도록).
 * 식은 Expr(ratExpr 읽기)로 분수 모양으로 그립니다. 'y = ' 는 글자로 붙입니다.
 */

export interface VennExample {
  /** Expr로 그릴 식 (예: '1/x') */
  raw: string;
  /** 앞에 붙일 글자 (예: 'y = ') */
  prefix?: string;
}

export interface NestedSetPair {
  id: string;
  outer: string;
  inner: string;
  /** 바깥 집합에만 있는 원소 예시 (안쪽 집합이 아닌 것) */
  outerOnly: readonly VennExample[];
  /** 안쪽 집합 원소 예시 */
  innerExamples: readonly VennExample[];
  /** 바깥 집합의 뜻 */
  outerDef: React.ReactNode;
  /** 안쪽 집합이 되는 조건 */
  innerRule: React.ReactNode;
  theme: 'sky' | 'emerald' | 'violet';
}

export const RATIONAL_SET_PAIRS: readonly NestedSetPair[] = [
  {
    id: 'number',
    outer: '유리수',
    inner: '정수',
    outerOnly: [{ raw: '1/2' }, { prefix: '−', raw: '3/4' }, { raw: '7/3' }],
    innerExamples: [{ raw: '-2' }, { raw: '0' }, { raw: '3' }],
    outerDef: (
      <>
        정수 <i>m</i>, <i>n</i> (<i>n</i> ≠ 0)으로 <Frac n={<i>m</i>} d={<i>n</i>} /> 꼴
      </>
    ),
    innerRule: (
      <>
        분모 <i>n</i>이 1이면 정수
      </>
    ),
    theme: 'sky',
  },
  {
    id: 'expr',
    outer: '유리식',
    inner: '다항식',
    outerOnly: [{ raw: '1/x' }, { raw: '(4x+2)/(x-3)' }],
    innerExamples: [{ raw: '3x+1' }, { raw: '(x^2-1)/2' }, { raw: '5' }],
    outerDef: (
      <>
        다항식 <i>A</i>, <i>B</i> (<i>B</i> ≠ 0)로 <Frac n={<i>A</i>} d={<i>B</i>} /> 꼴
      </>
    ),
    innerRule: (
      <>
        분모 <i>B</i>가 0이 아닌 상수이면 다항식
      </>
    ),
    theme: 'emerald',
  },
  {
    id: 'function',
    outer: '유리함수',
    inner: '다항함수',
    outerOnly: [
      { prefix: 'y = ', raw: '1/x' },
      { prefix: 'y = ', raw: '(x+1)/(x-2)' },
    ],
    innerExamples: [
      { prefix: 'y = ', raw: '2x+1' },
      { prefix: 'y = ', raw: 'x^2-3' },
    ],
    outerDef: (
      <>
        <i>y</i> = <i>f</i>(<i>x</i>)에서 <i>f</i>(<i>x</i>)가 유리식
      </>
    ),
    innerRule: (
      <>
        <i>f</i>(<i>x</i>)가 다항식이면 다항함수
      </>
    ),
    theme: 'violet',
  },
];

const THEME = {
  sky: {
    outer: 'border-sky-500 bg-sky-50/80',
    outerLabel: 'text-sky-800',
    inner: 'border-sky-700 bg-white',
    innerLabel: 'text-sky-900',
    chip: 'bg-white border-sky-200',
    innerChip: 'bg-sky-50 border-sky-200',
  },
  emerald: {
    outer: 'border-emerald-500 bg-emerald-50/80',
    outerLabel: 'text-emerald-800',
    inner: 'border-emerald-700 bg-white',
    innerLabel: 'text-emerald-900',
    chip: 'bg-white border-emerald-200',
    innerChip: 'bg-emerald-50 border-emerald-200',
  },
  violet: {
    outer: 'border-violet-500 bg-violet-50/80',
    outerLabel: 'text-violet-800',
    inner: 'border-violet-700 bg-white',
    innerLabel: 'text-violet-900',
    chip: 'bg-white border-violet-200',
    innerChip: 'bg-violet-50 border-violet-200',
  },
} as const;

/** 예시 식을 구분하는 글자 (앞 글자 + 식) */
export const exampleKey = (ex: VennExample) => `${ex.prefix ?? ''}${ex.raw}`;

const Chip: React.FC<{ ex: VennExample; className: string }> = ({ ex, className }) => (
  <span
    data-venn-example={exampleKey(ex)}
    className={`inline-flex items-center rounded-lg border px-1.5 py-0.5 text-[13px] font-semibold text-slate-800 whitespace-nowrap ${className}`}
  >
    {ex.prefix && <span className="mr-0.5">{ex.prefix}</span>}
    <Expr raw={ex.raw} />
  </span>
);

/** 한 쌍(바깥 집합 ⊃ 안쪽 집합)의 벤다이어그램 */
export const NestedSetVenn: React.FC<{ pair: NestedSetPair }> = ({ pair }) => {
  const t = THEME[pair.theme];
  return (
    <figure
      data-venn={pair.id}
      className="flex flex-col items-center gap-2"
      aria-label={`${pair.outer}의 벤다이어그램 안에 ${pair.inner}의 벤다이어그램이 들어 있음: ${pair.inner}은(는) 모두 ${pair.outer}입니다.`}
    >
      {/* 바깥 집합 (타원) */}
      <div className={`w-full max-w-[300px] rounded-[50%] border-2 ${t.outer} px-6 pt-5 pb-7 flex flex-col items-center gap-2`}>
        <span className={`text-sm font-extrabold ${t.outerLabel}`}>{pair.outer}</span>
        <div className="flex flex-wrap justify-center gap-1.5">
          {pair.outerOnly.map((ex) => (
            <Chip key={exampleKey(ex)} ex={ex} className={t.chip} />
          ))}
        </div>
        {/* 안쪽 집합 (타원) */}
        <div className={`w-[82%] rounded-[50%] border-2 ${t.inner} px-4 pt-3 pb-4 flex flex-col items-center gap-1.5`}>
          <span className={`text-sm font-extrabold ${t.innerLabel}`}>{pair.inner}</span>
          <div className="flex flex-wrap justify-center gap-1.5">
            {pair.innerExamples.map((ex) => (
              <Chip key={exampleKey(ex)} ex={ex} className={t.innerChip} />
            ))}
          </div>
        </div>
      </div>
      <figcaption className="text-center text-[12px] sm:text-xs text-slate-700 leading-relaxed space-y-0.5">
        <div className="font-extrabold text-slate-900">
          {pair.inner} ⊂ {pair.outer}
        </div>
        <div>{pair.outerDef}</div>
        <div>→ {pair.innerRule}</div>
      </figcaption>
    </figure>
  );
};

/** 세 쌍을 나란히 (좁은 화면에서는 위아래로) */
export const RationalSetVenn: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-5" role="group" aria-label="정수와 유리수, 다항식과 유리식, 다항함수와 유리함수의 포함 관계">
    {RATIONAL_SET_PAIRS.map((p) => (
      <NestedSetVenn key={p.id} pair={p} />
    ))}
  </div>
);
