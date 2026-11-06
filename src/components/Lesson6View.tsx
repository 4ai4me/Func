import React, { useId, useState } from 'react';
import type { Lesson5State } from '../utils/mathLogic';
import {
  type L6Feedback,
  L6_P1_EXPRS,
  L6_EXAMPLE_FN,
  L6_MIN_REASON,
  L6_MIN_REFLECTION,
  L6_VOLTAGE,
  l6Power,
  validateL6Open,
  validateL6Prob1,
  validateL6Ex1,
  validateL6Prob2,
  validateL6Prob3,
} from '../utils/lesson6Logic';
import { parseRat, evalRat, stripParen, type RatNode } from '../utils/ratExpr';
import { MathText } from './MathText';
import { ScratchPadButton, ScratchPadWindow, PadStroke } from './ScratchPad';
import { HelpSourcePicker } from './HelpSourcePicker';
import { CharCountBadge, getCharCountBorderClass } from './CharCountBadge';
import { CheckCircle2, AlertTriangle, Lightbulb, ArrowRight, ArrowLeft, RotateCcw, BookOpen, Eye, EyeOff, Zap, Lock } from 'lucide-react';

/**
 * Func 6차시 · 유리식과 유리함수의 정의역 (학생 화면, 2026-11-06 — 예전 절대부등식1 화면을 대체)
 * 문항 자료·채점: src/utils/lesson6Logic.ts / 식 읽기: src/utils/ratExpr.ts
 * 단계 완료: mathLogic.ts evaluateLevel6Completion / 저장 칸: func_lessons/l5 (Lesson5State에 항목 추가만)
 */

interface Lesson6ViewProps {
  state: Lesson5State;
  step: number;
  onStepChange: (step: number) => void;
  onUpdate: (updater: (prev: Lesson5State) => Lesson5State) => void;
  onGoToLesson7: () => void;
  onRequestConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

type Section = 'open' | 'p1' | 'calc' | 'domain' | 'reflect';
export const LESSON6_SECTIONS: Section[] = ['open', 'p1', 'calc', 'domain', 'reflect'];

// ── 교과서 그림 경로 (4차시와 같은 방식: GitHub Pages에서는 ./public/… 경로) ──
const textbookSrc = (fileName: string): string => {
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')) {
    return `./public/assets/aistudio/${fileName}`;
  }
  return `/assets/aistudio/${fileName}`;
};
const onTextbookError = (e: React.SyntheticEvent<HTMLImageElement, Event>, fileName: string) => {
  const img = e.currentTarget;
  if (!img.dataset.fallbackStep) {
    img.dataset.fallbackStep = '1';
    img.src = `./public/assets/aistudio/${fileName}`;
  } else if (img.dataset.fallbackStep === '1') {
    img.dataset.fallbackStep = '2';
    img.src = `./assets/aistudio/${fileName}`;
  }
};

const THEME = {
  teal: {
    badge: 'bg-teal-600',
    label: 'text-teal-700',
    btn: 'bg-teal-600 hover:bg-teal-700',
    picked: 'border-teal-600 bg-teal-50 text-teal-950 ring-1 ring-teal-600',
    focus: 'focus:border-teal-500',
  },
  emerald: {
    badge: 'bg-emerald-600',
    label: 'text-emerald-700',
    btn: 'bg-emerald-600 hover:bg-emerald-700',
    picked: 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600',
    focus: 'focus:border-emerald-500',
  },
  sky: {
    badge: 'bg-sky-600',
    label: 'text-sky-700',
    btn: 'bg-sky-600 hover:bg-sky-700',
    picked: 'border-sky-600 bg-sky-50 text-sky-950 ring-1 ring-sky-600',
    focus: 'focus:border-sky-500',
  },
  violet: {
    badge: 'bg-violet-600',
    label: 'text-violet-700',
    btn: 'bg-violet-600 hover:bg-violet-700',
    picked: 'border-violet-600 bg-violet-50 text-violet-950 ring-1 ring-violet-600',
    focus: 'focus:border-violet-500',
  },
} as const;
type ThemeKey = keyof typeof THEME;

/** 입력 항목 → 그 항목이 속한 [정답 확인] 표시. 답을 고치면 확인 표시를 해제합니다. */
const FIELD_FLAG: Partial<Record<keyof Lesson5State, keyof Lesson5State>> = {
  openP4: 'openVerified',
  openP8: 'openVerified',
  openTrend: 'openVerified',
  openCopper: 'openVerified',
  openCopperKind: 'openVerified',
  p1Picks: 'p1Verified',
  p1Reason: 'p1Verified',
  ex1_1: 'ex1Verified',
  ex1_2: 'ex1Verified',
  p2_1: 'p2Verified',
  p2_2: 'p2Verified',
  p2Reason: 'p2Verified',
  p3_1: 'p3Verified',
  p3_2: 'p3Verified',
  p3Reason: 'p3Verified',
};

type FeedbackKey = 'open' | 'p1' | 'ex1' | 'p2' | 'p3';

/** 6차시 초기화 항목 — 예전 절대부등식 항목(examples·prob1ProofText·reflection1 등)은 건드리지 않음 */
export const LESSON6_RESET: Partial<Lesson5State> = {
  openP4: '',
  openP8: '',
  openTrend: '',
  openCopper: '',
  openCopperKind: '',
  openVerified: false,
  p1Picks: [],
  p1Reason: '',
  p1Verified: false,
  ex1_1: '',
  ex1_2: '',
  ex1Verified: false,
  p2_1: '',
  p2_2: '',
  p2Reason: '',
  p2Verified: false,
  p3_1: '',
  p3_2: '',
  p3Reason: '',
  p3Verified: false,
  ratReflection1: '',
  ratReflection2: '',
  ratHelpSource: '',
};

// ─────────────────────────────────────────────
// 분수 모양 수식
// ─────────────────────────────────────────────
function Frac({ n, d }: { n: React.ReactNode; d: React.ReactNode }) {
  return (
    <span className="inline-flex flex-col items-center align-middle mx-0.5 leading-tight" role="math">
      <span className="px-1 pb-0.5">{n}</span>
      <span className="px-1 pt-0.5 border-t-[1.5px] border-current w-full text-center">{d}</span>
    </span>
  );
}

const V = () => <i className="font-serif">x</i>;

/** 계산 나무를 분수 모양으로 그립니다 */
function RatView({ node }: { node: RatNode }): React.ReactElement {
  switch (node.k) {
    case 'num':
      return <>{Number.isInteger(node.v) ? node.v : Number(node.v.toFixed(6))}</>;
    case 'var':
      return <V />;
    case 'add':
    case 'sub':
      return (
        <>
          <RatView node={node.a} />
          <span className="mx-1">{node.k === 'add' ? '+' : '−'}</span>
          <RatView node={node.b} />
        </>
      );
    case 'mul':
      return (
        <>
          <RatView node={node.a} />
          {!node.implicit && <span className="mx-1">×</span>}
          <RatView node={node.b} />
        </>
      );
    case 'div':
      return <Frac n={<RatView node={stripParen(node.a)} />} d={<RatView node={stripParen(node.b)} />} />;
    case 'neg':
      return (
        <>
          −<RatView node={node.a} />
        </>
      );
    case 'pow':
      return (
        <>
          <RatView node={node.a} />
          <sup className="text-[0.7em]">{node.n}</sup>
        </>
      );
    case 'paren':
      return (
        <>
          (<RatView node={node.a} />)
        </>
      );
  }
}

/** 문항 식(계산용 글자)을 분수 모양으로 */
function Expr({ raw, className = '' }: { raw: string; className?: string }) {
  const node = parseRat(raw);
  if (!node) return <span className={className}>{raw}</span>;
  return (
    <span className={`inline-flex items-center flex-wrap ${className}`}>
      <RatView node={node} />
    </span>
  );
}

// ─────────────────────────────────────────────
// 작은 화면 조각 (4차시와 같은 모양)
// ─────────────────────────────────────────────
function FeedbackBanner({ fb }: { fb: L6Feedback | null | undefined }) {
  if (!fb) return null;
  return (
    <div
      role="status"
      className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-xs sm:text-sm font-semibold ${
        fb.type === 'good' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-900'
      }`}
    >
      {fb.type === 'good' ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
      ) : (
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
      )}
      <span>
        <MathText text={fb.message} />
      </span>
    </div>
  );
}

function HintToggle({ open, onClick, label = '💡 힌트 보기' }: { open: boolean; onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors shrink-0"
    >
      <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
      <span>{open ? '힌트 닫기' : label}</span>
    </button>
  );
}

function HintBox({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-950 space-y-1.5">{children}</div>;
}

function DoneBadge({ show }: { show?: boolean }) {
  if (!show) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
      확인 완료
    </span>
  );
}

function ActivityHeader({
  theme,
  kicker,
  title,
  done,
  extra,
}: {
  theme: ThemeKey;
  kicker: string;
  title: React.ReactNode;
  done?: boolean;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 pb-3">
      <div>
        <span className={`text-xs font-extrabold ${THEME[theme].label}`}>{kicker}</span>
        <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">{title}</h4>
      </div>
      <div className="flex items-center gap-2">
        <DoneBadge show={done} />
        {extra}
      </div>
    </div>
  );
}

function TextbookImage({ file, alt, maxH = 'max-h-[260px]' }: { file: string; alt: string; maxH?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 flex justify-center">
      <img
        src={textbookSrc(file)}
        onError={(e) => onTextbookError(e, file)}
        alt={alt}
        className={`${maxH} w-auto max-w-full object-contain rounded-lg`}
      />
    </div>
  );
}

function ChoiceButtons<T extends string>({
  theme,
  value,
  options,
  onPick,
  cols = 'sm:grid-cols-2',
}: {
  theme: ThemeKey;
  value: T | '' | undefined;
  options: readonly (readonly [T, string])[];
  onPick: (v: T) => void;
  cols?: string;
}) {
  return (
    <div className={`grid grid-cols-1 ${cols} gap-2.5`}>
      {options.map(([val, label]) => (
        <button
          key={val}
          type="button"
          aria-pressed={value === val}
          onClick={() => onPick(val)}
          className={`rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm font-bold text-left transition-all ${
            value === val ? THEME[theme].picked : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

const inputClass = (theme: ThemeKey) =>
  `w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none ${THEME[theme].focus}`;

/** 유리식 입력칸 + 읽은 식을 분수 모양으로 보여 주는 미리보기 */
function RatInput({
  id,
  theme,
  label,
  prefix,
  value,
  onChange,
}: {
  id: string;
  theme: ThemeKey;
  label?: React.ReactNode;
  prefix?: React.ReactNode;
  value?: string;
  onChange: (v: string) => void;
}) {
  const node = (value || '').trim() ? parseRat(value) : null;
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      {label && (
        <label htmlFor={id} className="block text-xs font-bold text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        {prefix && <span className="text-sm font-extrabold text-slate-700 shrink-0">{prefix}</span>}
        <input
          id={id}
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass(theme)} mono`}
        />
      </div>
      {(value || '').trim() && (
        <div className={`mt-2 text-[11px] font-semibold ${node ? 'text-slate-500' : 'text-rose-600'}`}>
          {node ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span>읽은 식:</span>
              <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-sm text-slate-900">
                <RatView node={node} />
              </span>
            </div>
          ) : (
            '식을 읽을 수 없어요. x에 대한 식으로 쓰고, 분자·분모가 여러 항이면 괄호로 묶어 주세요. (예: (3x-2)/(x(x-1)))'
          )}
        </div>
      )}
    </div>
  );
}

function NumInput({
  id,
  theme,
  label,
  value,
  onChange,
  prefix,
  suffix,
}: {
  id: string;
  theme: ThemeKey;
  label: React.ReactNode;
  value?: string;
  onChange: (v: string) => void;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <label htmlFor={id} className="block text-xs font-bold text-slate-700 mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-2">
        {prefix && <span className="text-sm font-bold text-slate-700 shrink-0">{prefix}</span>}
        <input
          id={id}
          type="text"
          inputMode="text"
          autoComplete="off"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass(theme)} min-w-0`}
        />
        {suffix && <span className="text-sm font-bold text-slate-600 shrink-0">{suffix}</span>}
      </div>
    </div>
  );
}

function ReasonInput({
  id,
  theme,
  label,
  value,
  onChange,
  min,
}: {
  id: string;
  theme: ThemeKey;
  label: React.ReactNode;
  value?: string;
  onChange: (v: string) => void;
  min: number;
}) {
  const count = (value || '').trim().length;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 flex-wrap justify-between">
        <label htmlFor={id} className="block text-xs sm:text-sm font-bold text-slate-900">
          {label}
        </label>
        <CharCountBadge current={count} min={min} />
      </div>
      <textarea
        id={id}
        rows={2}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border bg-white p-3 text-xs sm:text-sm text-slate-900 focus:outline-none ${THEME[theme].focus} ${getCharCountBorderClass(count, min)}`}
      />
    </div>
  );
}

function VerifyButton({ theme, onClick, children }: { theme: ThemeKey; onClick: () => void; children: React.ReactNode }) {
  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex min-h-[42px] items-center gap-2 rounded-xl ${THEME[theme].btn} px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white transition-colors shadow-xs`}
      >
        <CheckCircle2 className="h-4 w-4" />
        <span>{children}</span>
      </button>
    </div>
  );
}

function NavRow({ onPrev, onNext, nextLabel, nextDark }: { onPrev?: () => void; onNext?: () => void; nextLabel: string; nextDark?: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
      {onPrev ? (
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>이전 단계</span>
        </button>
      ) : (
        <span />
      )}
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          className={`inline-flex min-h-[42px] items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white transition-colors shadow-xs ${
            nextDark ? 'bg-slate-900 hover:bg-slate-800' : 'bg-teal-600 hover:bg-teal-700'
          }`}
        >
          <span>{nextLabel}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function ToggleButton({ on, onClick, onLabel, offLabel }: { on: boolean; onClick: () => void; onLabel: string; offLabel: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={on}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
    >
      {on ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      <span>{on ? onLabel : offLabel}</span>
    </button>
  );
}

// ─────────────────────────────────────────────
// 함수 그래프 (전력 그래프, [보기] 유리함수)
// ─────────────────────────────────────────────
interface FnPlotProps {
  fn: (x: number) => number;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  xTick: number;
  yTick: number;
  point?: { x: number; y: number } | null;
  /** 세로 점선 (분모가 0이 되는 x) */
  asymptoteX?: number;
  xLabel: string;
  yLabel: string;
  ariaLabel: string;
}

const PLOT_W = 520;
const PLOT_H = 300;
const PL = 44;
const PR = 14;
const PT = 12;
const PB = 34;

function FnPlot({ fn, xMin, xMax, yMin, yMax, xTick, yTick, point, asymptoteX, xLabel, yLabel, ariaLabel }: FnPlotProps) {
  const clipId = `l6-clip-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const sx = (x: number) => PL + ((x - xMin) / (xMax - xMin)) * (PLOT_W - PL - PR);
  const sy = (y: number) => PT + ((yMax - y) / (yMax - yMin)) * (PLOT_H - PT - PB);
  const xTicks: number[] = [];
  for (let t = Math.ceil(xMin / xTick) * xTick; t <= xMax + 1e-9; t += xTick) xTicks.push(Number(t.toFixed(6)));
  const yTicks: number[] = [];
  for (let t = Math.ceil(yMin / yTick) * yTick; t <= yMax + 1e-9; t += yTick) yTicks.push(Number(t.toFixed(6)));

  // 분모가 0인 곳에서 선이 이어지지 않도록 조각으로 나눔
  const segments: string[] = [];
  let cur: string[] = [];
  const N = 400;
  for (let i = 0; i <= N; i++) {
    const x = xMin + ((xMax - xMin) * i) / N;
    const y = fn(x);
    const nearAsym = asymptoteX !== undefined && Math.abs(x - asymptoteX) < (xMax - xMin) / N;
    if (!Number.isFinite(y) || nearAsym || y > yMax + (yMax - yMin) || y < yMin - (yMax - yMin)) {
      if (cur.length > 1) segments.push(cur.join(' '));
      cur = [];
      continue;
    }
    cur.push(`${cur.length === 0 ? 'M' : 'L'}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`);
  }
  if (cur.length > 1) segments.push(cur.join(' '));

  const axisX = yMin <= 0 && yMax >= 0 ? sy(0) : null;
  const axisY = xMin <= 0 && xMax >= 0 ? sx(0) : null;

  return (
    <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} className="w-full max-w-[560px] mx-auto block select-none" role="img" aria-label={ariaLabel}>
      <defs>
        <clipPath id={clipId}>
          <rect x={PL} y={PT} width={PLOT_W - PL - PR} height={PLOT_H - PT - PB} />
        </clipPath>
      </defs>
      <rect x={PL} y={PT} width={PLOT_W - PL - PR} height={PLOT_H - PT - PB} fill="#ffffff" stroke="#e2e8f0" />
      {xTicks.map((t) => (
        <g key={`x${t}`}>
          <line x1={sx(t)} x2={sx(t)} y1={PT} y2={PLOT_H - PB} stroke="#eef2f7" />
          <text x={sx(t)} y={PLOT_H - PB + 15} textAnchor="middle" fontSize="11" fill="#64748b">
            {t}
          </text>
        </g>
      ))}
      {yTicks.map((t) => (
        <g key={`y${t}`}>
          <line x1={PL} x2={PLOT_W - PR} y1={sy(t)} y2={sy(t)} stroke="#eef2f7" />
          <text x={PL - 6} y={sy(t) + 4} textAnchor="end" fontSize="11" fill="#64748b">
            {t}
          </text>
        </g>
      ))}
      {axisX !== null && <line x1={PL} x2={PLOT_W - PR} y1={axisX} y2={axisX} stroke="#94a3b8" strokeWidth={1.2} />}
      {axisY !== null && <line x1={axisY} x2={axisY} y1={PT} y2={PLOT_H - PB} stroke="#94a3b8" strokeWidth={1.2} />}
      {asymptoteX !== undefined && (
        <line x1={sx(asymptoteX)} x2={sx(asymptoteX)} y1={PT} y2={PLOT_H - PB} stroke="#e11d48" strokeWidth={1.4} strokeDasharray="5 4" />
      )}
      <g clipPath={`url(#${clipId})`}>
        {segments.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#2563eb" strokeWidth={2.4} strokeLinejoin="round" />
        ))}
        {point && Number.isFinite(point.y) && (
          <circle cx={sx(point.x)} cy={sy(point.y)} r={7} fill="#ea580c" stroke="#ffffff" strokeWidth={2} />
        )}
      </g>
      <text x={(PL + PLOT_W - PR) / 2} y={PLOT_H - 4} textAnchor="middle" fontSize="12" fill="#475569" fontWeight="700">
        {xLabel}
      </text>
      <text x={12} y={(PT + PLOT_H - PB) / 2} textAnchor="middle" fontSize="12" fill="#475569" fontWeight="700" transform={`rotate(-90 12 ${(PT + PLOT_H - PB) / 2})`}>
        {yLabel}
      </text>
    </svg>
  );
}

/** 연습장 (창 제목) */
const PAD_TITLES = {
  ex1: '[예제 1] 유리식의 계산',
  p2: '[문제 2] 유리식의 계산',
} as const;
type PadId = keyof typeof PAD_TITLES;

const exampleFn = parseRat(L6_EXAMPLE_FN.raw);
const exampleValue = (x: number) => (exampleFn ? evalRat(exampleFn, x) : NaN);

const roundText = (v: number) => {
  const r = Math.round(v * 100) / 100;
  return String(r).replace('-', '−');
};

// ─────────────────────────────────────────────
// 6차시 화면
// ─────────────────────────────────────────────
export const Lesson6View: React.FC<Lesson6ViewProps> = ({ state, step, onStepChange, onUpdate, onGoToLesson7, onRequestConfirm }) => {
  const section: Section = LESSON6_SECTIONS[step] ?? LESSON6_SECTIONS[0];
  const [hints, setHints] = useState<Record<string, boolean>>({});
  const toggleHint = (k: string) => setHints((prev) => ({ ...prev, [k]: !prev[k] }));
  const [feedback, setFeedback] = useState<Partial<Record<FeedbackKey, L6Feedback | null>>>({});
  const [resistance, setResistance] = useState(4);
  const [exX, setExX] = useState(1);
  const [showEx1Img, setShowEx1Img] = useState(false);
  const [pads, setPads] = useState<Partial<Record<PadId, PadStroke[]>>>({});
  const [openPad, setOpenPad] = useState<PadId | null>(null);
  const padButton = (id: PadId) => (
    <ScratchPadButton onClick={() => setOpenPad((cur) => (cur === id ? null : id))} used={Boolean(pads[id]?.length)} active={openPad === id} />
  );

  /** 답 입력: 해당 문항의 [정답 확인] 표시를 해제합니다 */
  const setField = <K extends keyof Lesson5State>(key: K, value: Lesson5State[K]) => {
    const flag = FIELD_FLAG[key];
    onUpdate((prev) => ({ ...prev, [key]: value, ...(flag ? { [flag]: false } : {}) }));
  };

  const verify = (key: FeedbackKey, flag: keyof Lesson5State, validator: (p: Lesson5State) => L6Feedback) => {
    const res = validator(state);
    setFeedback((prev) => ({ ...prev, [key]: res }));
    if (res.ok) onUpdate((prev) => ({ ...prev, [flag]: true }));
  };

  const goSection = (sec: Section) => {
    setOpenPad(null);
    onStepChange(Math.max(0, LESSON6_SECTIONS.indexOf(sec)));
  };

  const handleReset = () => {
    onRequestConfirm('6차시 탐구 기록 초기화', '6차시(유리식과 유리함수의 정의역)에 입력한 모든 답안과 확인 상태를 초기화할까요?', () => {
      onUpdate((prev) => ({ ...prev, ...LESSON6_RESET }));
      setFeedback({});
    });
  };

  const picks = state.p1Picks || [];
  const togglePick = (i: number) => {
    const next = picks.includes(i) ? picks.filter((n) => n !== i) : [...picks, i].sort((a, b) => a - b);
    setField('p1Picks', next);
  };

  const power = l6Power(resistance);
  const exY = exampleValue(exX);

  return (
    <div className="space-y-7">
      {/* 상단 차시 표시 */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal-200/80 bg-teal-50/60 px-4 py-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-teal-950 flex-wrap">
          <Zap className="h-4 w-4 text-teal-600 shrink-0" />
          <span>06차시 · 유리식과 유리함수의 정의역:</span>
          <span className="font-semibold text-teal-800">분모에 문자가 있는 식을 계산하고, 그 식으로 만든 함수의 정의역 구하기</span>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
          <span>6차시 초기화</span>
        </button>
      </div>

      {/* =====================================================================
          1단계: 생각 열기 · 전력과 저항, 유기의 구리 비율
      ===================================================================== */}
      {section === 'open' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <ActivityHeader
              theme="teal"
              kicker="생각 열기 A · 단원 도입"
              title="저항이 클수록 전력은 작아진다 — 전력과 저항의 관계"
            />
            <p className="text-xs sm:text-sm text-slate-700">
              전기 제품은 전류의 흐름을 방해하는 <strong>저항</strong>이 클수록 전력이 작아집니다. 전압 <i>V</i>가 일정할 때 소비 전력{' '}
              <i>P</i>와 저항 <i>R</i> 사이에는 다음 관계가 있습니다. 슬라이더로 저항을 바꿔 보세요.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                <div className="text-[11px] font-bold text-slate-500">식</div>
                <div className="mt-1 text-lg font-extrabold text-slate-900 flex items-center gap-1">
                  <i>P</i> = <Frac n={<><i>V</i><sup className="text-[0.7em]">2</sup></>} d={<i>R</i>} />
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                <div className="text-[11px] font-bold text-slate-500">
                  소비 전력 <i>P</i> (<i>R</i> = {resistance} Ω)
                </div>
                <div className="mt-1 text-lg font-extrabold text-orange-600">{power.toFixed(1)} W</div>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                <div className="text-[11px] font-bold text-slate-500">그래프 모양</div>
                <div className="mt-1 text-lg font-extrabold text-slate-900">반비례 (쌍곡선)</div>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-2 sm:p-3">
              <FnPlot
                fn={l6Power}
                xMin={0}
                xMax={20}
                yMin={0}
                yMax={160}
                xTick={2}
                yTick={20}
                point={{ x: resistance, y: power }}
                xLabel="저항 R (Ω)"
                yLabel="전력 P (W)"
                ariaLabel={`전력 P = 144/R 그래프, 현재 저항 ${resistance} 옴에서 전력 ${power.toFixed(1)} 와트`}
              />
              <div className="mt-2 px-1 space-y-1.5">
                <label htmlFor="l6-resistance" className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>
                    저항 <i>R</i> = <span className="text-orange-600">{resistance} Ω</span>
                  </span>
                  <span className="text-slate-500">
                    전압 <i>V</i> = {L6_VOLTAGE} V로 고정
                  </span>
                </label>
                <input
                  id="l6-resistance"
                  type="range"
                  min={1}
                  max={20}
                  step={0.5}
                  value={resistance}
                  onChange={(e) => setResistance(Number(e.target.value))}
                  className="w-full accent-orange-600"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NumInput
                id="l6-open-p4"
                theme="teal"
                label={<>① 저항 <i>R</i> = 4 Ω일 때 소비 전력 <i>P</i></>}
                prefix={<i>P</i>}
                value={state.openP4}
                onChange={(v) => setField('openP4', v)}
                suffix="W"
              />
              <NumInput
                id="l6-open-p8"
                theme="teal"
                label={<>② 저항을 2배로 하여 <i>R</i> = 8 Ω일 때 소비 전력 <i>P</i></>}
                prefix={<i>P</i>}
                value={state.openP8}
                onChange={(v) => setField('openP8', v)}
                suffix="W"
              />
            </div>
            <div className="space-y-2">
              <div className="text-xs sm:text-sm font-bold text-slate-900">③ 저항 R이 커지면 소비 전력 P는 어떻게 되나요?</div>
              <ChoiceButtons
                theme="teal"
                value={state.openTrend}
                cols="sm:grid-cols-3"
                options={[
                  ['down', '작아진다'],
                  ['up', '커진다'],
                  ['same', '변하지 않는다'],
                ] as const}
                onPick={(v) => setField('openTrend', v)}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <ActivityHeader theme="teal" kicker="생각 열기 B · 교과서" title="유기 합금에서 구리의 비율을 식으로" done={state.openVerified} />
            <TextbookImage
              file="image_l6_open.png"
              alt="학습 목표와 생각 열기 - 우리나라의 전통 유기는 구리와 주석을 섞은 합금으로 만든 놋그릇이다. 구리 x kg에 주석 3 kg을 섞은 합금에서 구리의 비율을 x에 대한 식으로 나타내 보자."
              maxH="max-h-[340px]"
            />
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-slate-900">구리 x kg에 주석 3 kg을 섞은 합금에서 구리의 비율을 구해 보세요.</span>
              <HintToggle open={!!hints.open} onClick={() => toggleHint('open')} />
            </div>
            {hints.open && (
              <HintBox>
                <div>• (구리의 비율) = (구리의 무게) ÷ (합금 전체의 무게)</div>
                <div>• 합금 전체의 무게는 구리와 주석의 무게를 더한 것입니다.</div>
                <div>• 다항식은 분모에 문자가 없는 식입니다. 예를 들어 (x − 2)/3 = (1/3)x − 2/3은 다항식이에요.</div>
              </HintBox>
            )}
            <RatInput
              id="l6-open-copper"
              theme="teal"
              label="④ 구리의 비율을 x에 대한 식으로 나타내면"
              prefix="(구리의 비율) ="
              value={state.openCopper}
              onChange={(v) => setField('openCopper', v)}
            />
            <p className="text-[11px] sm:text-xs text-slate-500">
              ✏️ 입력 방법: 분수는 <span className="mono">/</span>로, 분모가 여러 항이면 괄호로 묶어{' '}
              <span className="mono">x/(x+3)</span>처럼 씁니다. 입력칸 아래에 읽은 식이 분수 모양으로 보이니 확인하세요.
            </p>
            <div className="space-y-2">
              <div className="text-xs sm:text-sm font-bold text-slate-900">⑤ ④에서 구한 식은 다항식인가요?</div>
              <ChoiceButtons
                theme="teal"
                value={state.openCopperKind}
                options={[
                  ['poly', '다항식이다'],
                  ['notPoly', '다항식이 아니다'],
                ] as const}
                onPick={(v) => setField('openCopperKind', v)}
              />
            </div>
            <FeedbackBanner fb={feedback.open} />
            <VerifyButton theme="teal" onClick={() => verify('open', 'openVerified', validateL6Open)}>
              [생각 열기] 정답 확인하기
            </VerifyButton>
          </div>

          {/* 핵심 개념: 유리식 — 생각 열기 ⑤의 답이 드러나므로 정답 확인 뒤에 보여 줌 */}
          {state.openVerified ? (
            <div className="rounded-2xl border-2 border-teal-600/70 bg-gradient-to-br from-teal-50/80 via-white to-sky-50/50 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-teal-900">
                <BookOpen className="h-4 w-4 text-teal-600 shrink-0" />
                <span>핵심 개념 · 유리식</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                두 다항식 <i>A</i>, <i>B</i> (<i>B</i> ≠ 0)에 대하여 <Frac n={<i>A</i>} d={<i>B</i>} /> 꼴로 나타내어지는 식을{' '}
                <strong className="text-teal-800">유리식</strong>이라 합니다.
              </p>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                특히 <i>B</i>가 0이 아닌 상수이면 <Frac n={<i>A</i>} d={<i>B</i>} />는 다항식이므로,{' '}
                <strong className="text-teal-800">다항식도 유리식</strong>입니다.
              </p>
              <TextbookImage
                file="image_l6_bogi1.png"
                alt="보기 - 1/x, (4x+2)/(x-3), (x²-1)/2은 모두 유리식이고, 이 중에서 (x²-1)/2은 다항식이다."
                maxH="max-h-[80px]"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
              <Lock className="h-4 w-4" />
              <span>[생각 열기] 정답을 확인하면 핵심 개념(유리식의 뜻)이 열립니다.</span>
            </div>
          )}

          <NavRow onNext={() => goSection('p1')} nextLabel="다음 단계: 문제 1 · 유리식과 다항식" />
        </div>
      )}

      {/* =====================================================================
          2단계: [문제 1] 다항식이 아닌 유리식 찾기
      ===================================================================== */}
      {section === 'p1' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <ActivityHeader theme="emerald" kicker="탐구 활동 02 · 교과서" title="[문제 1] 다항식이 아닌 유리식을 모두 찾으시오." done={state.p1Verified} />
            <TextbookImage file="image_l6_prob1.png" alt="문제 1 - 다음에서 다항식이 아닌 유리식을 모두 찾으시오. 2/(x+5), (x-2)/3, 1/4 - 1/x, (2x-1)/(x²+x), x² + 1/2" maxH="max-h-[180px]" />
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-slate-900">다항식이 아닌 유리식을 모두 눌러 고르세요. (다시 누르면 선택이 풀려요)</span>
              <HintToggle open={!!hints.p1} onClick={() => toggleHint('p1')} />
            </div>
            {hints.p1 && (
              <HintBox>
                <div>• 분모에 문자 x가 있으면 다항식이 아닌 유리식입니다.</div>
                <div>
                  • 분모가 0이 아닌 상수이면 다항식입니다. 예: <Expr raw="(x+1)/2" /> = <Expr raw="1/2" />x + <Expr raw="1/2" />
                </div>
              </HintBox>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5" role="group" aria-label="문제 1의 다섯 식">
              {L6_P1_EXPRS.map((e, i) => {
                const on = picks.includes(i);
                return (
                  <button
                    key={e.raw}
                    type="button"
                    aria-pressed={on}
                    aria-label={`${e.label} ${on ? '선택됨' : ''}`}
                    onClick={() => togglePick(i)}
                    className={`min-h-[72px] rounded-xl border-2 px-2 py-2 text-base font-bold flex items-center justify-center transition-all ${
                      on ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600' : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <Expr raw={e.raw} className="justify-center" />
                  </button>
                );
              })}
            </div>
            <ReasonInput
              id="l6-p1-reason"
              theme="emerald"
              label="고르지 않은 식이 다항식인 이유를 써 보세요."
              value={state.p1Reason}
              onChange={(v) => setField('p1Reason', v)}
              min={L6_MIN_REASON}
            />
            <FeedbackBanner fb={feedback.p1} />
            <VerifyButton theme="emerald" onClick={() => verify('p1', 'p1Verified', validateL6Prob1)}>
              [문제 1] 정답 확인하기
            </VerifyButton>
          </div>
          <NavRow onPrev={() => goSection('open')} onNext={() => goSection('calc')} nextLabel="다음 단계: 유리식의 계산" />
        </div>
      )}

      {/* =====================================================================
          3단계: 유리식의 계산 — 예제 1을 문제로, [문제 2]
      ===================================================================== */}
      {section === 'calc' && (
        <div className="space-y-6">
          <div className="rounded-2xl border-2 border-sky-600/70 bg-gradient-to-br from-sky-50/80 via-white to-teal-50/50 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-sky-900">
              <BookOpen className="h-4 w-4 text-sky-600 shrink-0" />
              <span>유리식의 계산 — 분수의 계산과 같은 방법</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-800">
              <div className="rounded-xl border border-sky-200 bg-white px-3.5 py-3 space-y-1">
                <div className="font-extrabold text-sky-800">덧셈·뺄셈</div>
                <div>분모를 인수분해한 뒤 <strong>통분</strong>하여 분자끼리 더하거나 뺍니다.</div>
              </div>
              <div className="rounded-xl border border-sky-200 bg-white px-3.5 py-3 space-y-1">
                <div className="font-extrabold text-sky-800">곱셈·나눗셈</div>
                <div>
                  분자는 분자끼리, 분모는 분모끼리 곱하고 <strong>약분</strong>합니다. 나눗셈은 나누는 식의 분자와 분모를 바꾸어 곱합니다.
                </div>
              </div>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500">
              ✏️ 입력 방법: 분수는 <span className="mono">/</span>, 거듭제곱은 <span className="mono">^</span>(예: <span className="mono">x^2</span>)로 씁니다.
              분자·분모가 여러 항이면 괄호로 묶어 <span className="mono">(3x-2)/(x(x-1))</span>처럼 쓰세요. 답은 더 이상 약분되지 않는 식으로 씁니다
              (분모는 전개해도, 인수분해한 채로 두어도 됩니다).
            </p>
          </div>

          {/* 예제 1 → 문제 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <ActivityHeader
              theme="sky"
              kicker="탐구 활동 03-A · 교과서 예제 1을 문제로"
              title="다음 식을 계산하시오."
              done={state.ex1Verified}
              extra={
                <>
                  <ToggleButton on={showEx1Img} onClick={() => setShowEx1Img((v) => !v)} onLabel="교과서 풀이 닫기" offLabel="교과서 풀이 보기" />
                  {padButton('ex1')}
                </>
              }
            />
            {showEx1Img && (
              <TextbookImage
                file="image_l6_ex1.png"
                alt="교과서 예제 1 풀이 - (1) 2/x + 1/(x-1)을 통분하여 (3x-2)/(x(x-1)), (2) 나눗셈을 곱셈으로 바꾸고 인수분해·약분하여 1/(x+1)²"
                maxH="max-h-[360px]"
              />
            )}
            <div className="flex justify-end">
              <HintToggle open={!!hints.ex1} onClick={() => toggleHint('ex1')} />
            </div>
            {hints.ex1 && (
              <HintBox>
                <div>
                  • (1) 두 분모 x, x − 1의 곱으로 통분: <Expr raw="2(x-1)/(x(x-1))" /> + <Expr raw="x/(x(x-1))" />
                </div>
                <div>
                  • (2) <Expr raw="(x-1)/(x^2+x)" /> × <Expr raw="x/(x^2-1)" />, x² + x = x(x + 1), x² − 1 = (x + 1)(x − 1)
                </div>
              </HintBox>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                  (1) <Expr raw="2/x+1/(x-1)" />
                </div>
                <RatInput id="l6-ex1-1" theme="sky" prefix="=" value={state.ex1_1} onChange={(v) => setField('ex1_1', v)} />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                  (2) <Expr raw="(x-1)/(x^2+x)" /> ÷ <Expr raw="(x^2-1)/x" />
                </div>
                <RatInput id="l6-ex1-2" theme="sky" prefix="=" value={state.ex1_2} onChange={(v) => setField('ex1_2', v)} />
              </div>
            </div>
            <FeedbackBanner fb={feedback.ex1} />
            <VerifyButton theme="sky" onClick={() => verify('ex1', 'ex1Verified', validateL6Ex1)}>
              [예제 1] 정답 확인하기
            </VerifyButton>
          </div>

          {/* 문제 2 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <ActivityHeader theme="sky" kicker="탐구 활동 03-B · 교과서" title="[문제 2] 다음 식을 계산하시오." done={state.p2Verified} extra={padButton('p2')} />
            <TextbookImage file="image_l6_prob2.png" alt="문제 2 - (1) 3x/(x²-1) - 2/(x+1), (2) (x+2)/(x²+3x) × (x+3)/(x²-4)" maxH="max-h-[150px]" />
            <div className="flex justify-end">
              <HintToggle open={!!hints.p2} onClick={() => toggleHint('p2')} />
            </div>
            {hints.p2 && (
              <HintBox>
                <div>• (1) x² − 1 = (x + 1)(x − 1)이므로 (x + 1)(x − 1)로 통분합니다. 뺄 때 분자 전체에 괄호를 쳐 부호에 주의!</div>
                <div>• (2) x² + 3x = x(x + 3), x² − 4 = (x + 2)(x − 2)로 인수분해한 뒤 공통인수를 약분합니다.</div>
              </HintBox>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                  (1) <Expr raw="3x/(x^2-1)-2/(x+1)" />
                </div>
                <RatInput id="l6-p2-1" theme="sky" prefix="=" value={state.p2_1} onChange={(v) => setField('p2_1', v)} />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                  (2) <Expr raw="(x+2)/(x^2+3x)" /> × <Expr raw="(x+3)/(x^2-4)" />
                </div>
                <RatInput id="l6-p2-2" theme="sky" prefix="=" value={state.p2_2} onChange={(v) => setField('p2_2', v)} />
              </div>
            </div>
            <ReasonInput
              id="l6-p2-reason"
              theme="sky"
              label="계산할 때 가장 먼저 한 일(인수분해·통분·약분 등)과 주의한 점을 정리해 보세요."
              value={state.p2Reason}
              onChange={(v) => setField('p2Reason', v)}
              min={L6_MIN_REASON}
            />
            <FeedbackBanner fb={feedback.p2} />
            <VerifyButton theme="sky" onClick={() => verify('p2', 'p2Verified', validateL6Prob2)}>
              [문제 2] 정답 확인하기
            </VerifyButton>
          </div>

          <NavRow onPrev={() => goSection('p1')} onNext={() => goSection('domain')} nextLabel="다음 단계: 유리함수와 정의역" />
        </div>
      )}

      {/* =====================================================================
          4단계: 유리함수와 정의역 — [보기], [문제 3]
      ===================================================================== */}
      {section === 'domain' && (
        <div className="space-y-6">
          <div className="rounded-2xl border-2 border-violet-600/70 bg-gradient-to-br from-violet-50/80 via-white to-sky-50/50 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-violet-900">
              <BookOpen className="h-4 w-4 text-violet-600 shrink-0" />
              <span>핵심 개념 · 유리함수</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
              함수 <i>y</i> = <i>f</i>(<i>x</i>)에서 <i>f</i>(<i>x</i>)가 <i>x</i>에 대한 유리식일 때, 이 함수를 <strong className="text-violet-800">유리함수</strong>라
              합니다. 특히 <i>f</i>(<i>x</i>)가 <i>x</i>에 대한 다항식이면 <strong className="text-violet-800">다항함수</strong>라 합니다.
            </p>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
              다항함수가 아닌 유리함수에서 정의역이 주어지지 않으면,{' '}
              <strong className="text-violet-800">분모를 0으로 하지 않는 실수 전체의 집합</strong>을 정의역으로 합니다.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <ActivityHeader
              theme="violet"
              kicker="탐구 활동 04-A · 교과서 [보기]"
              title={
                <span className="inline-flex items-center gap-1.5 flex-wrap">
                  유리함수 <i>y</i> = <Expr raw={L6_EXAMPLE_FN.raw} />에 여러 <i>x</i> 값을 넣어 보기
                </span>
              }
            />
            <TextbookImage file="image_l6_bogi2.png" alt="보기 - 유리함수 y = (x-1)/(x+2)의 정의역은 {x | x ≠ -2인 실수}" maxH="max-h-[70px]" />
            <div className="rounded-xl border border-slate-200 bg-white p-2 sm:p-3 space-y-3">
              <FnPlot
                fn={exampleValue}
                xMin={-8}
                xMax={6}
                yMin={-6}
                yMax={8}
                xTick={2}
                yTick={2}
                point={Number.isFinite(exY) ? { x: exX, y: exY } : null}
                asymptoteX={L6_EXAMPLE_FN.excluded}
                xLabel="x"
                yLabel="y"
                ariaLabel={`유리함수 y = (x−1)/(x+2)의 그래프, x = −2에 빨간 점선. 현재 x = ${exX}`}
              />
              <div className="px-1 space-y-1.5">
                <label htmlFor="l6-ex-x" className="block text-xs font-bold text-slate-700">
                  <i>x</i> = <span className="text-orange-600">{roundText(exX)}</span> (슬라이더를 움직여 보세요)
                </label>
                <input
                  id="l6-ex-x"
                  type="range"
                  min={-8}
                  max={6}
                  step={0.5}
                  value={exX}
                  onChange={(e) => setExX(Number(e.target.value))}
                  className="w-full accent-violet-600"
                />
              </div>
              <div
                role="status"
                className={`rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 flex-wrap ${
                  Number.isFinite(exY) ? 'bg-violet-50 text-violet-950 border border-violet-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  분모 <i>x</i> + 2 = {roundText(exX + 2)}
                </span>
                <span>→</span>
                {Number.isFinite(exY) ? (
                  <span>
                    <i>y</i> = {roundText(exX - 1)} ÷ {roundText(exX + 2)} = <span className="text-orange-600">{roundText(exY)}</span>
                  </span>
                ) : (
                  <span>분모가 0이 되어 y의 값을 계산할 수 없어요! (빨간 점선)</span>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <ActivityHeader theme="violet" kicker="탐구 활동 04-B · 교과서" title="[문제 3] 다음 함수의 정의역을 구하시오." done={state.p3Verified} />
            <TextbookImage file="image_l6_prob3.png" alt="문제 3 - (1) y = (4x+3)/(x-5), (2) y = (2-x)/(3x+1)의 정의역을 구하시오." maxH="max-h-[150px]" />
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-slate-900">정의역에서 빠지는 x의 값을 빈칸에 쓰세요. (분수는 -1/3처럼)</span>
              <HintToggle open={!!hints.p3} onClick={() => toggleHint('p3')} />
            </div>
            {hints.p3 && (
              <HintBox>
                <div>• (분모) = 0을 만족하는 x의 값을 구하면, 그 값만 정의역에서 빠집니다.</div>
                <div>• (2) 3x + 1 = 0 → x = ?</div>
              </HintBox>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NumInput
                id="l6-p3-1"
                theme="violet"
                label={
                  <span className="inline-flex items-center gap-1 flex-wrap">
                    (1) <i>y</i> = <Expr raw="(4x+3)/(x-5)" />의 정의역
                  </span>
                }
                prefix={<>{'{'}<i>x</i> | <i>x</i> ≠</>}
                suffix={<>인 실수{'}'}</>}
                value={state.p3_1}
                onChange={(v) => setField('p3_1', v)}
              />
              <NumInput
                id="l6-p3-2"
                theme="violet"
                label={
                  <span className="inline-flex items-center gap-1 flex-wrap">
                    (2) <i>y</i> = <Expr raw="(2-x)/(3x+1)" />의 정의역
                  </span>
                }
                prefix={<>{'{'}<i>x</i> | <i>x</i> ≠</>}
                suffix={<>인 실수{'}'}</>}
                value={state.p3_2}
                onChange={(v) => setField('p3_2', v)}
              />
            </div>
            <ReasonInput
              id="l6-p3-reason"
              theme="violet"
              label="유리함수의 정의역을 어떻게 구했는지 설명해 보세요."
              value={state.p3Reason}
              onChange={(v) => setField('p3Reason', v)}
              min={L6_MIN_REASON}
            />
            <FeedbackBanner fb={feedback.p3} />
            <VerifyButton theme="violet" onClick={() => verify('p3', 'p3Verified', validateL6Prob3)}>
              [문제 3] 정답 확인하기
            </VerifyButton>
          </div>

          <NavRow onPrev={() => goSection('calc')} onNext={() => goSection('reflect')} nextLabel="다음 단계: 성찰" />
        </div>
      )}

      {/* =====================================================================
          5단계: 성찰
      ===================================================================== */}
      {section === 'reflect' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-extrabold text-teal-700">6차시 마무리 성찰</span>
                <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">유리식의 계산과 유리함수의 정의역 정리하기</h4>
              </div>
              <HintToggle open={!!hints.reflection} onClick={() => toggleHint('reflection')} label="💡 성찰 힌트 보기" />
            </div>
            {hints.reflection && (
              <HintBox>
                <div>
                  • <strong>성찰 1 예시</strong>: “유리식의 덧셈과 뺄셈은 분수처럼 통분하고, 곱셈과 나눗셈은 인수분해한 뒤 약분한다.”
                </div>
                <div>
                  • <strong>성찰 2 예시</strong>: “유리함수의 정의역은 분모가 0이 되는 x의 값을 뺀 실수 전체이다. 그 x에서는 함숫값을 계산할 수 없기 때문이다.”
                </div>
              </HintBox>
            )}
            <HelpSourcePicker idPrefix="l6" value={state.ratHelpSource} onChange={(v) => onUpdate((prev) => ({ ...prev, ratHelpSource: v }))} />
            <ReasonInput
              id="l6-reflection1"
              theme="teal"
              label="1. 유리식을 계산하는 방법을 분수의 계산과 비교하여 정리해 보세요."
              value={state.ratReflection1}
              onChange={(v) => onUpdate((prev) => ({ ...prev, ratReflection1: v }))}
              min={L6_MIN_REFLECTION}
            />
            <ReasonInput
              id="l6-reflection2"
              theme="teal"
              label="2. 유리함수의 정의역을 구하는 방법이나 오늘 새롭게 알게 된 점을 적어 보세요."
              value={state.ratReflection2}
              onChange={(v) => onUpdate((prev) => ({ ...prev, ratReflection2: v }))}
              min={L6_MIN_REFLECTION}
            />
            <div className="pt-3 border-t border-slate-100">
              <NavRow onPrev={() => goSection('domain')} onNext={onGoToLesson7} nextLabel="다음 차시: 07차시로 이동" nextDark />
            </div>
          </div>
        </div>
      )}

      {/* 문제별 연습장 (유리식의 계산 단계에서만) */}
      {openPad && section === 'calc' && (
        <ScratchPadWindow
          key={openPad}
          title={PAD_TITLES[openPad]}
          strokes={pads[openPad] || []}
          onChange={(next) => setPads((prev) => ({ ...prev, [openPad]: next }))}
          onClose={() => setOpenPad(null)}
          onRequestConfirm={onRequestConfirm}
          fileName={`6차시_연습장_${openPad}`}
        />
      )}
    </div>
  );
};
