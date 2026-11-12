import React, { useState } from 'react';
import { addHintOpen } from '../utils/hintLog';
import type { Lesson6State } from '../utils/mathLogic';
import {
  type L7Feedback,
  type Quadrants,
  type RationalFn,
  type L7Transform,
  L7_MIN_REASON,
  L7_MIN_REFLECTION,
  L7_P4,
  L7_P4_QUAD_KEYS,
  L7_P4_VAL_KEYS,
  L7_P5,
  L7_EX2,
  L7_P6,
  L7_GRAPH_SETS,
  rationalLabel,
  validateL7Together,
  validateL7Prob4,
  validateL7Think,
  validateL7Prob5,
  validateL7Ex2,
  validateL7Prob6,
} from '../utils/lesson7Logic';
import { MathText } from './MathText';
import { Frac, Expr } from './RatMath';
import { RationalGraph, RationalGraphReveal, RAT_COLORS, type RationalPanel } from './RationalGraph';
import { GraphLegend } from './LinearGraph';
import { ScratchPadButton, ScratchPadWindow, PadStroke } from './ScratchPad';
import { HelpSourcePicker } from './HelpSourcePicker';
import { CharCountBadge, getCharCountBorderClass } from './CharCountBadge';
import { CheckCircle2, AlertTriangle, Lightbulb, ArrowRight, ArrowLeft, RotateCcw, BookOpen, Eye, EyeOff, Lock, Spline } from 'lucide-react';

/**
 * Func 7차시 · 유리함수 y = k/x와 y = k/(x − p) + q의 그래프 (학생 화면, 2026-11-06 — 예전 절대부등식2 화면을 대체)
 * 문항 자료·채점: src/utils/lesson7Logic.ts / 그래프: src/components/RationalGraph.tsx
 * 단계 완료: mathLogic.ts evaluateLevel7Completion / 저장 칸: func_lessons/l6 (Lesson6State에 항목 추가만)
 */

interface Lesson7ViewProps {
  state: Lesson6State;
  step: number;
  onStepChange: (step: number) => void;
  onUpdate: (updater: (prev: Lesson6State) => Lesson6State) => void;
  onGoToLesson8: () => void;
  onRequestConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

type Section = 'together' | 'p4' | 'shift' | 'transform' | 'reflect';
export const LESSON7_SECTIONS: Section[] = ['together', 'p4', 'shift', 'transform', 'reflect'];

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
  rose: {
    badge: 'bg-rose-600',
    label: 'text-rose-600',
    btn: 'bg-rose-600 hover:bg-rose-700',
    picked: 'border-rose-600 bg-rose-50 text-rose-950 ring-1 ring-rose-600',
    focus: 'focus:border-rose-500',
  },
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
const FIELD_FLAG: Partial<Record<keyof Lesson6State, keyof Lesson6State>> = {
  tgPosQuad: 'tgVerified',
  tgNegQuad: 'tgVerified',
  tgAbsTrend: 'tgVerified',
  tgReason: 'tgVerified',
  p4q1: 'p4Verified',
  p4q2: 'p4Verified',
  p4q3: 'p4Verified',
  p4q4: 'p4Verified',
  p4v1: 'p4Verified',
  p4v2: 'p4Verified',
  p4v3: 'p4Verified',
  p4v4: 'p4Verified',
  thinkSymX: 'thinkVerified',
  thinkSymY: 'thinkVerified',
  p5_1x: 'p5Verified',
  p5_1y: 'p5Verified',
  p5_2x: 'p5Verified',
  p5_2y: 'p5Verified',
  ex2k: 'ex2Verified',
  ex2p: 'ex2Verified',
  ex2q: 'ex2Verified',
  ex2ax: 'ex2Verified',
  ex2ay: 'ex2Verified',
  p6_1k: 'p6Verified',
  p6_1p: 'p6Verified',
  p6_1q: 'p6Verified',
  p6_1ax: 'p6Verified',
  p6_1ay: 'p6Verified',
  p6_2k: 'p6Verified',
  p6_2p: 'p6Verified',
  p6_2q: 'p6Verified',
  p6_2ax: 'p6Verified',
  p6_2ay: 'p6Verified',
  p6Reason: 'p6Verified',
};

type FeedbackKey = 'together' | 'p4' | 'think' | 'p5' | 'ex2' | 'p6';
type GraphKey = 'p4' | 'p5' | 'ex2' | 'p6';

/** 7차시 초기화 항목 — 예전 절대부등식2 항목(examples·prob1ProofText·reflection1 등)은 건드리지 않음 */
export const LESSON7_RESET: Partial<Lesson6State> = {
  tgPosQuad: '',
  tgNegQuad: '',
  tgAbsTrend: '',
  tgReason: '',
  tgVerified: false,
  p4q1: '',
  p4q2: '',
  p4q3: '',
  p4q4: '',
  p4v1: '',
  p4v2: '',
  p4v3: '',
  p4v4: '',
  p4Verified: false,
  thinkSymX: '',
  thinkSymY: '',
  thinkVerified: false,
  p5_1x: '',
  p5_1y: '',
  p5_2x: '',
  p5_2y: '',
  p5Verified: false,
  ex2k: '',
  ex2p: '',
  ex2q: '',
  ex2ax: '',
  ex2ay: '',
  ex2Verified: false,
  p6_1k: '',
  p6_1p: '',
  p6_1q: '',
  p6_1ax: '',
  p6_1ay: '',
  p6_2k: '',
  p6_2p: '',
  p6_2q: '',
  p6_2ax: '',
  p6_2ay: '',
  p6Reason: '',
  p6Verified: false,
  rgReflection1: '',
  rgReflection2: '',
  rgHelpSource: '',
};

// ─────────────────────────────────────────────
// 작은 화면 조각 (4차시와 같은 모양)
// ─────────────────────────────────────────────
function FeedbackBanner({ fb }: { fb: L7Feedback | null | undefined }) {
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
            nextDark ? 'bg-slate-900 hover:bg-slate-800' : 'bg-rose-600 hover:bg-rose-700'
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


/** 작은 숫자 칸 (분수 틀 안, 점근선 칸) */
function SmallInput({
  id,
  label,
  value,
  onChange,
  width = 'w-16',
}: {
  id: string;
  label: string;
  value?: string;
  onChange: (v: string) => void;
  width?: string;
}) {
  return (
    <input
      id={id}
      aria-label={label}
      type="text"
      inputMode="text"
      autoComplete="off"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className={`${width} rounded-md border border-slate-300 bg-white px-1.5 py-1 text-center text-sm font-bold text-slate-900 focus:outline-none focus:border-violet-500`}
    />
  );
}

/** y = □/(x − □) + □ 와 점근선 x = □, y = □ 입력 틀 */
function TransformInput({
  idPrefix,
  values,
  onChange,
}: {
  idPrefix: string;
  values: { k?: string; p?: string; q?: string; ax?: string; ay?: string };
  onChange: (part: 'k' | 'p' | 'q' | 'ax' | 'ay', v: string) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-3">
      <div className="flex items-center gap-1.5 flex-wrap text-sm font-bold text-slate-800">
        <span>
          <i>y</i> =
        </span>
        <Frac
          n={<SmallInput id={`${idPrefix}-k`} label="k (분자)" value={values.k} onChange={(v) => onChange('k', v)} />}
          d={
            <span className="inline-flex items-center gap-1 py-0.5">
              <i>x</i> − <SmallInput id={`${idPrefix}-p`} label="p (x − p의 p)" value={values.p} onChange={(v) => onChange('p', v)} />
            </span>
          }
        />
        <span>+</span>
        <SmallInput id={`${idPrefix}-q`} label="q" value={values.q} onChange={(v) => onChange('q', v)} />
      </div>
      <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm font-bold text-slate-700">
        <span>점근선:</span>
        <span className="inline-flex items-center gap-1">
          <i>x</i> = <SmallInput id={`${idPrefix}-ax`} label="세로 점근선 x" value={values.ax} onChange={(v) => onChange('ax', v)} />
        </span>
        <span className="inline-flex items-center gap-1">
          , <i>y</i> = <SmallInput id={`${idPrefix}-ay`} label="가로 점근선 y" value={values.ay} onChange={(v) => onChange('ay', v)} />
        </span>
      </div>
    </div>
  );
}

/** 점근선 x = □, y = □ 입력 */
function AsymptoteInput({
  idPrefix,
  title,
  x,
  y,
  onX,
  onY,
}: {
  idPrefix: string;
  title: React.ReactNode;
  x?: string;
  y?: string;
  onX: (v: string) => void;
  onY: (v: string) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2">
      <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">{title}</div>
      <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm font-bold text-slate-700">
        <span>점근선:</span>
        <span className="inline-flex items-center gap-1">
          <i>x</i> = <SmallInput id={`${idPrefix}-x`} label="세로 점근선 x" value={x} onChange={onX} />
        </span>
        <span className="inline-flex items-center gap-1">
          , <i>y</i> = <SmallInput id={`${idPrefix}-y`} label="가로 점근선 y" value={y} onChange={onY} />
        </span>
      </div>
    </div>
  );
}

/** k의 값을 분수로 (예: 0.25 → "1/4") */
const kText = (k: number) => {
  if (Number.isInteger(k)) return String(k).replace('-', '−');
  const r = Math.round(k * 4);
  if (Math.abs(k * 4 - r) < 1e-9) return `${r < 0 ? '−' : ''}${Math.abs(r)}/4`;
  return String(k).replace('-', '−');
};

/** 함수 하나 → 그래프 묶음 (y = k/x는 회색 점선, 주어진 함수는 빨강 + 점근선) */
function shiftedPanel(key: string, title: string | undefined, label: string, fn: RationalFn): RationalPanel {
  const shifted = fn.p !== 0 || fn.q !== 0;
  return {
    key,
    title,
    curves: [
      ...(shifted ? [{ fn: { k: fn.k, p: 0, q: 0 }, color: RAT_COLORS.base, dashed: true, width: 1.8 }] : []),
      { fn, color: RAT_COLORS.main, asymptotes: true },
    ],
    points: shifted ? [{ x: fn.p, y: fn.q, color: RAT_COLORS.asym, label: `(${kText(fn.p)}, ${kText(fn.q)})` }] : [],
    legend: [
      ...(shifted ? [{ color: RAT_COLORS.base, label: `y = ${kText(fn.k)}/x`, dashed: true }] : []),
      { color: RAT_COLORS.main, label },
      ...(shifted ? [{ color: RAT_COLORS.asym, label: `점근선 x = ${kText(fn.p)}, y = ${kText(fn.q)}`, dashed: true }] : []),
    ],
    ariaLabel: `${label}의 그래프${shifted ? `, 점근선 x = ${fn.p}, y = ${fn.q}` : ''}`,
  };
}

const SLIDER_VALUES = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

// ─────────────────────────────────────────────
// 7차시 화면
// ─────────────────────────────────────────────
export const Lesson7View: React.FC<Lesson7ViewProps> = ({ state, step, onStepChange, onUpdate, onGoToLesson8, onRequestConfirm }) => {
  const section: Section = LESSON7_SECTIONS[step] ?? LESSON7_SECTIONS[0];
  const [hints, setHints] = useState<Record<string, boolean>>({});
  const toggleHint = (k: string) => {
    // 힌트를 '열 때'만 횟수 기록 (hintLog.ts, 교사 화면 '힌트 사용 현황')
    if (!hints[k]) onUpdate((prev) => addHintOpen(prev, k));
    setHints((prev) => ({ ...prev, [k]: !prev[k] }));
  };
  const [feedback, setFeedback] = useState<Partial<Record<FeedbackKey, L7Feedback | null>>>({});
  const [graphOpen, setGraphOpen] = useState<Partial<Record<GraphKey, boolean>>>({});
  const toggleGraph = (k: GraphKey) => setGraphOpen((prev) => ({ ...prev, [k]: !prev[k] }));
  // 1단계 k 슬라이더, 3단계 k·p·q 슬라이더 (화면에만 — 저장하지 않음)
  const [kVal, setKVal] = useState(1);
  const [sk, setSk] = useState(1);
  const [sp, setSp] = useState(2);
  const [sq, setSq] = useState(1);
  const [showEx2Img, setShowEx2Img] = useState(false);
  const [showSummaryImg, setShowSummaryImg] = useState(false);
  const [pads, setPads] = useState<Partial<Record<'ex2' | 'p6', PadStroke[]>>>({});
  const [openPad, setOpenPad] = useState<'ex2' | 'p6' | null>(null);
  const padButton = (id: 'ex2' | 'p6') => (
    <ScratchPadButton onClick={() => setOpenPad((cur) => (cur === id ? null : id))} used={Boolean(pads[id]?.length)} active={openPad === id} />
  );

  const setField = <K extends keyof Lesson6State>(key: K, value: Lesson6State[K]) => {
    const flag = FIELD_FLAG[key];
    onUpdate((prev) => ({ ...prev, [key]: value, ...(flag ? { [flag]: false } : {}) }));
  };

  const verify = (key: FeedbackKey, flag: keyof Lesson6State, validator: (p: Lesson6State) => L7Feedback) => {
    const res = validator(state);
    setFeedback((prev) => ({ ...prev, [key]: res }));
    if (res.ok) onUpdate((prev) => ({ ...prev, [flag]: true }));
  };

  const goSection = (sec: Section) => {
    setOpenPad(null);
    onStepChange(Math.max(0, LESSON7_SECTIONS.indexOf(sec)));
  };

  const handleReset = () => {
    onRequestConfirm('7차시 탐구 기록 초기화', '7차시(유리함수의 그래프)에 입력한 모든 답안과 확인 상태를 초기화할까요?', () => {
      onUpdate((prev) => ({ ...prev, ...LESSON7_RESET }));
      setFeedback({});
      setGraphOpen({});
    });
  };

  const graphReveal = (k: GraphKey, unlocked: boolean | undefined, panels: RationalPanel[], caption?: React.ReactNode) => (
    <RationalGraphReveal unlocked={Boolean(unlocked)} open={Boolean(graphOpen[k])} onToggle={() => toggleGraph(k)} panels={panels} caption={caption} />
  );

  const transformPanels = (items: typeof L7_GRAPH_SETS.ex2) =>
    items.map((g, i) => shiftedPanel(`${i}`, g.title, g.label, g.fn));

  const transformFields = (t: L7Transform, keys: { k: keyof Lesson6State; p: keyof Lesson6State; q: keyof Lesson6State; ax: keyof Lesson6State; ay: keyof Lesson6State }) => ({
    values: {
      k: state[keys.k] as string | undefined,
      p: state[keys.p] as string | undefined,
      q: state[keys.q] as string | undefined,
      ax: state[keys.ax] as string | undefined,
      ay: state[keys.ay] as string | undefined,
    },
    onChange: (part: 'k' | 'p' | 'q' | 'ax' | 'ay', v: string) => setField(keys[part], v as never),
    label: t.label,
  });

  const shiftFn: RationalFn = { k: sk, p: sp, q: sq };

  return (
    <div className="space-y-7">
      {/* 상단 차시 표시 */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200/80 bg-rose-50/60 px-4 py-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-rose-950 flex-wrap">
          <Spline className="h-4 w-4 text-rose-600 shrink-0" />
          <span>07차시 · 유리함수의 그래프:</span>
          <span className="font-semibold text-rose-800">
            <MathText text="y = k/x" />의 그래프와 평행이동, 점근선 찾기
          </span>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
          <span>7차시 초기화</span>
        </button>
      </div>

      {/* =====================================================================
          1단계: [함께하기] y = k/x의 그래프와 k
      ===================================================================== */}
      {section === 'together' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <ActivityHeader
              theme="rose"
              kicker="탐구 활동 01 · 교과서 [함께하기]"
              title={
                <span className="inline-flex items-center gap-1 flex-wrap">
                  k의 값에 따라 <i>y</i> = <Frac n={<i>k</i>} d={<i>x</i>} />의 그래프 그려 보기
                </span>
              }
              done={state.tgVerified}
            />
            <TextbookImage
              file="image_l7_together.png"
              alt="함께하기 - 알지오매스를 이용하여 함수 y = k/x의 그래프를 k의 값에 따라 그려 보자. k의 부호에 따른 사분면, k의 절댓값에 따른 모양 변화"
              maxH="max-h-[340px]"
            />
            <p className="text-xs text-slate-600">💻 알지오매스 대신 아래 그래프에서 슬라이더로 k의 값을 바꿔 보세요. (k ≠ 0)</p>
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] gap-4 items-start">
              <div className="rounded-xl border border-slate-200 bg-white p-2 space-y-2">
                <RationalGraph
                  curves={[
                    { fn: { k: 1, p: 0, q: 0 }, color: RAT_COLORS.base, dashed: true, width: 1.6 },
                    ...(kVal !== 0 ? [{ fn: { k: kVal, p: 0, q: 0 }, color: RAT_COLORS.main }] : []),
                  ]}
                  points={kVal !== 0 ? [{ x: 1, y: kVal, color: '#ea580c', label: `(1, ${kText(kVal)})` }] : []}
                  range={6}
                  ariaLabel={`y = ${kText(kVal)}/x의 그래프와 비교용 y = 1/x`}
                />
                <GraphLegend
                  items={[
                    { color: RAT_COLORS.base, label: 'y = 1/x (비교)', dashed: true },
                    { color: RAT_COLORS.main, label: `y = ${kText(kVal)}/x` },
                  ]}
                />
              </div>
              <div className="space-y-3">
                <label htmlFor="l7-k" className="block text-sm font-bold text-slate-800">
                  <i>k</i> = <span className="text-rose-600">{kText(kVal)}</span>
                </label>
                <input
                  id="l7-k"
                  type="range"
                  min={-5}
                  max={5}
                  step={0.5}
                  value={kVal}
                  onChange={(e) => setKVal(Number(e.target.value))}
                  className="w-full accent-rose-600"
                />
                <div className="flex flex-wrap gap-1.5">
                  {[-4, -1, -0.5, 0.5, 1, 4].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setKVal(k)}
                      className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${kVal === k ? 'border-rose-600 bg-rose-50 text-rose-900' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                    >
                      k = {kText(k)}
                    </button>
                  ))}
                </div>
                <div role="status" className={`rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold ${kVal === 0 ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'bg-rose-50 text-rose-950 border border-rose-200'}`}>
                  {kVal === 0
                    ? 'k = 0이면 y = 0이 되어 유리함수가 아니에요. k ≠ 0으로 움직여 보세요.'
                    : `x = 1일 때 y = ${kText(kVal)} → 점 (1, ${kText(kVal)})는 제${kVal > 0 ? 1 : 4}사분면에 있어요.`}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs sm:text-sm font-bold text-slate-900">① k &gt; 0일 때 그래프가 있는 사분면은?</div>
              <ChoiceButtons
                theme="rose"
                value={state.tgPosQuad}
                options={[
                  ['13', '제1사분면과 제3사분면'],
                  ['24', '제2사분면과 제4사분면'],
                ] as const}
                onPick={(v) => setField('tgPosQuad', v)}
              />
            </div>
            <div className="space-y-2">
              <div className="text-xs sm:text-sm font-bold text-slate-900">① k &lt; 0일 때 그래프가 있는 사분면은?</div>
              <ChoiceButtons
                theme="rose"
                value={state.tgNegQuad}
                options={[
                  ['13', '제1사분면과 제3사분면'],
                  ['24', '제2사분면과 제4사분면'],
                ] as const}
                onPick={(v) => setField('tgNegQuad', v)}
              />
            </div>
            <div className="space-y-2">
              <div className="text-xs sm:text-sm font-bold text-slate-900">② |k|가 커짐에 따라 그래프의 모양은 어떻게 변하나요?</div>
              <ChoiceButtons
                theme="rose"
                value={state.tgAbsTrend}
                cols="sm:grid-cols-3"
                options={[
                  ['far', '원점에서 멀어진다'],
                  ['near', '원점에 가까워진다'],
                  ['same', '변하지 않는다'],
                ] as const}
                onPick={(v) => setField('tgAbsTrend', v)}
              />
            </div>
            <div className="flex justify-end">
              <HintToggle open={!!hints.tg} onClick={() => toggleHint('tg')} />
            </div>
            {hints.tg && (
              <HintBox>
                <div>• x &gt; 0일 때 y = k/x의 부호는 k의 부호와 같습니다.</div>
                <div>• k = 1과 k = 4에서 x = 1일 때의 점 (1, 1)과 (1, 4)를 비교해 보세요.</div>
              </HintBox>
            )}
            <ReasonInput
              id="l7-tg-reason"
              theme="rose"
              label="② 그렇게 생각한 이유를 써 보세요."
              value={state.tgReason}
              onChange={(v) => setField('tgReason', v)}
              min={L7_MIN_REASON}
            />
            <FeedbackBanner fb={feedback.together} />
            <VerifyButton theme="rose" onClick={() => verify('together', 'tgVerified', validateL7Together)}>
              [함께하기] 정답 확인하기
            </VerifyButton>
          </div>

          {state.tgVerified ? (
            <div className="rounded-2xl border-2 border-rose-500/70 bg-gradient-to-br from-rose-50/80 via-white to-sky-50/50 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-rose-900">
                <BookOpen className="h-4 w-4 text-rose-600 shrink-0" />
                <span>
                  핵심 개념 · 유리함수 <MathText text="y = k/x (k ≠ 0)" />의 그래프
                </span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-800 leading-relaxed list-disc pl-5">
                <li>
                  정의역은 <MathText text="{x | x ≠ 0인 실수}" />, 치역은 <MathText text="{y | y ≠ 0인 실수}" />입니다.
                </li>
                <li>
                  <strong>k &gt; 0</strong>이면 제1사분면과 제3사분면, <strong>k &lt; 0</strong>이면 제2사분면과 제4사분면에 있습니다.
                </li>
                <li>
                  <strong>원점에 대하여 대칭</strong>이고, |k|가 커질수록 원점에서 멀어집니다.
                </li>
                <li>
                  그래프가 한없이 가까워지는 직선을 <strong className="text-rose-800">점근선</strong>이라 합니다. <MathText text="y = k/x" />의 점근선은{' '}
                  <strong>x축과 y축</strong>입니다.
                </li>
              </ul>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
              <Lock className="h-4 w-4" />
              <span>[함께하기] 정답을 확인하면 핵심 개념(y = k/x의 그래프와 점근선)이 열립니다.</span>
            </div>
          )}

          <NavRow onNext={() => goSection('p4')} nextLabel="다음 단계: 문제 4 · y = k/x 그리기" />
        </div>
      )}

      {/* =====================================================================
          2단계: [문제 4] y = k/x의 그래프
      ===================================================================== */}
      {section === 'p4' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <ActivityHeader theme="emerald" kicker="탐구 활동 02 · 교과서" title="[문제 4] 다음 함수의 그래프를 그리시오." done={state.p4Verified} />
            <TextbookImage file="image_l7_prob4.png" alt="문제 4 - (1) y = 3/x (2) y = -3/x (3) y = 1/(4x) (4) y = -1/(4x)의 그래프를 그리시오." maxH="max-h-[180px]" />
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-slate-900">그래프를 그리기 전에 지나는 사분면과 x = 1일 때의 점을 찾아보세요.</span>
              <HintToggle open={!!hints.p4} onClick={() => toggleHint('p4')} />
            </div>
            {hints.p4 && (
              <HintBox>
                <div>• k의 부호로 사분면을 정합니다. (3) y = 1/(4x)는 k = 1/4인 y = k/x예요.</div>
                <div>• x = 1을 대입한 값을 쓰세요. 분수는 1/4처럼 씁니다.</div>
              </HintBox>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {L7_P4.map((f, i) => (
                <div key={f.raw} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2.5">
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    ({i + 1}) <i>y</i> = <Expr raw={f.raw} />
                  </div>
                  <ChoiceButtons
                    theme="emerald"
                    value={state[L7_P4_QUAD_KEYS[i]]}
                    options={[
                      ['13', '제1·3사분면'],
                      ['24', '제2·4사분면'],
                    ] as const}
                    onPick={(v) => setField(L7_P4_QUAD_KEYS[i], v as Quadrants)}
                    cols="grid-cols-2"
                  />
                  <label htmlFor={`l7-p4-v${i + 1}`} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <span className="shrink-0">
                      x = 1일 때 <i>y</i> =
                    </span>
                    <input
                      id={`l7-p4-v${i + 1}`}
                      type="text"
                      autoComplete="off"
                      value={state[L7_P4_VAL_KEYS[i]] || ''}
                      onChange={(e) => setField(L7_P4_VAL_KEYS[i], e.target.value)}
                      className={`${inputClass('emerald')} min-w-0`}
                    />
                  </label>
                </div>
              ))}
            </div>
            <FeedbackBanner fb={feedback.p4} />
            <VerifyButton theme="emerald" onClick={() => verify('p4', 'p4Verified', validateL7Prob4)}>
              [문제 4] 정답 확인하기
            </VerifyButton>
            {graphReveal(
              'p4',
              state.p4Verified,
              [
                {
                  key: 'p4-13',
                  title: '(1)과 (3) · k > 0',
                  curves: [
                    { fn: L7_GRAPH_SETS.p4[0].fn, color: RAT_COLORS.main },
                    { fn: L7_GRAPH_SETS.p4[2].fn, color: RAT_COLORS.alt },
                  ],
                  points: [
                    { x: 1, y: 3, color: RAT_COLORS.main },
                    { x: 1, y: 0.25, color: RAT_COLORS.alt },
                  ],
                  legend: [
                    { color: RAT_COLORS.main, label: '(1) y = 3/x' },
                    { color: RAT_COLORS.alt, label: '(3) y = 1/(4x)' },
                  ],
                  ariaLabel: 'y = 3/x와 y = 1/(4x)의 그래프',
                },
                {
                  key: 'p4-24',
                  title: '(2)와 (4) · k < 0',
                  curves: [
                    { fn: L7_GRAPH_SETS.p4[1].fn, color: RAT_COLORS.main },
                    { fn: L7_GRAPH_SETS.p4[3].fn, color: RAT_COLORS.alt },
                  ],
                  points: [
                    { x: 1, y: -3, color: RAT_COLORS.main },
                    { x: 1, y: -0.25, color: RAT_COLORS.alt },
                  ],
                  legend: [
                    { color: RAT_COLORS.main, label: '(2) y = −3/x' },
                    { color: RAT_COLORS.alt, label: '(4) y = −1/(4x)' },
                  ],
                  ariaLabel: 'y = -3/x와 y = -1/(4x)의 그래프',
                },
              ],
              '|k|가 작은 (3)·(4)의 그래프가 원점에 더 가까이 있는지 확인해 보세요.'
            )}
          </div>

          {/* 2단계 마무리 정리 — 문제 4의 사분면 답이 드러나므로 정답 확인 뒤에 열림 (2026-11-09) */}
          {state.p4Verified ? (
            <div data-summary="p4" className="rounded-2xl border-2 border-emerald-600/70 bg-gradient-to-br from-emerald-50/80 via-white to-sky-50/50 p-5 space-y-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-emerald-900">
                <BookOpen className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="inline-flex items-center gap-1 flex-wrap">
                  정리 · 유리함수 <i>y</i> = <Frac n={<i>k</i>} d={<i>x</i>} /> (<i>k</i> ≠ 0)의 그래프
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-slate-800">
                {(
                  [
                    ['정의역', <MathText key="d" text="{x | x ≠ 0인 실수}" />, '분모 x가 0이 되면 안 되므로 x = 0만 빠집니다.'],
                    ['치역', <MathText key="r" text="{y | y ≠ 0인 실수}" />, 'k ≠ 0이므로 k/x는 0이 될 수 없습니다.'],
                    ['점근선', <>x축(y = 0)과 y축(x = 0)</>, '그래프가 한없이 가까워지지만 만나지 않는 직선입니다.'],
                    ['대칭', <>원점에 대하여 대칭</>, '점 (a, b)가 그래프 위에 있으면 점 (−a, −b)도 그래프 위에 있습니다.'],
                    ['k의 부호', <>k &gt; 0 → 제1·3사분면, k &lt; 0 → 제2·4사분면</>, 'x > 0일 때 y의 부호가 k의 부호와 같습니다.'],
                    ['|k|의 크기', <>|k|가 클수록 원점에서 멀어짐</>, '점 (1, k)를 비교해 보세요.'],
                  ] as const
                ).map(([title, body, note]) => (
                  <div key={title} className="rounded-xl border border-emerald-200 bg-white px-3.5 py-2.5 space-y-0.5">
                    <div className="text-[11px] font-extrabold text-emerald-700">{title}</div>
                    <div className="font-bold text-slate-900">{body}</div>
                    <div className="text-[11px] text-slate-500">{note}</div>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full min-w-[420px] border-collapse text-xs sm:text-sm">
                  <caption className="text-left px-3 pt-2.5 pb-1 text-[11px] font-extrabold text-slate-600">[문제 4]의 네 함수 한눈에 보기</caption>
                  <thead>
                    <tr className="bg-slate-50 text-slate-600">
                      {['함수', 'k', '사분면', '지나는 점', '정의역·치역', '점근선'].map((h) => (
                        <th key={h} className="border-t border-slate-200 px-2.5 py-1.5 text-left font-bold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {L7_P4.map((f, i) => (
                      <tr key={f.raw} className="border-t border-slate-100">
                        <td className="px-2.5 py-1.5 font-bold text-slate-900 whitespace-nowrap">
                          ({i + 1}) <i>y</i> = <Expr raw={f.raw} />
                        </td>
                        <td className="px-2.5 py-1.5 mono">{kText(f.k)}</td>
                        <td className="px-2.5 py-1.5 whitespace-nowrap">제{f.k > 0 ? '1·3' : '2·4'}사분면</td>
                        <td className="px-2.5 py-1.5 mono whitespace-nowrap">(1, {kText(f.k)})</td>
                        <td className="px-2.5 py-1.5 whitespace-nowrap">x ≠ 0, y ≠ 0</td>
                        <td className="px-2.5 py-1.5 whitespace-nowrap">x축, y축</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600">
                💡 네 함수 모두 정의역·치역·점근선은 같고, <strong>k의 부호</strong>에 따라 사분면이, <strong>|k|</strong>에 따라 원점과의 거리가 달라집니다. 다음 단계에서는 이 그래프를
                평행이동해 봅니다.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
              <Lock className="h-4 w-4" />
              <span>[문제 4] 정답을 확인하면 y = k/x 그래프의 정리(정의역·치역·점근선)가 열립니다.</span>
            </div>
          )}

          <NavRow onPrev={() => goSection('together')} onNext={() => goSection('shift')} nextLabel="다음 단계: 평행이동 · 문제 5" />
        </div>
      )}

      {/* =====================================================================
          3단계: y = k/(x − p) + q — 평행이동, [보기], 생각 톡톡, [문제 5]
      ===================================================================== */}
      {section === 'shift' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <ActivityHeader
              theme="violet"
              kicker="탐구 활동 03-A · 평행이동 실험실"
              title={
                <span className="inline-flex items-center gap-1 flex-wrap">
                  <i>y</i> = <Frac n={<i>k</i>} d={<><i>x</i> − <i>p</i></>} /> + <i>q</i>의 그래프
                </span>
              }
            />
            <TextbookImage file="image_l7_shift.png" alt="y = k/(x-p) + q에서 p는 x축의 방향으로 p만큼, q는 y축의 방향으로 q만큼 평행이동" maxH="max-h-[200px]" />
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] gap-4 items-start">
              <div className="rounded-xl border border-slate-200 bg-white p-2 space-y-2">
                <RationalGraph
                  curves={[
                    { fn: { k: sk, p: 0, q: 0 }, color: RAT_COLORS.base, dashed: true, width: 1.8 },
                    { fn: shiftFn, color: RAT_COLORS.main, asymptotes: true },
                  ]}
                  points={[
                    { x: 0, y: 0, color: RAT_COLORS.base },
                    { x: sp, y: sq, color: RAT_COLORS.asym, label: `(${sp}, ${sq})` },
                  ]}
                  range={7}
                  ariaLabel={`y = ${sk}/x와 ${rationalLabel(shiftFn)}의 그래프, 점근선 x = ${sp}, y = ${sq}`}
                />
                <GraphLegend
                  items={[
                    { color: RAT_COLORS.base, label: `y = ${kText(sk)}/x`, dashed: true },
                    { color: RAT_COLORS.main, label: rationalLabel(shiftFn) },
                    { color: RAT_COLORS.asym, label: '점근선', dashed: true },
                  ]}
                />
              </div>
              <div className="space-y-3">
                {(
                  [
                    ['k', sk, setSk, [-4, -3, -2, -1, 1, 2, 3, 4]],
                    ['p', sp, setSp, SLIDER_VALUES],
                    ['q', sq, setSq, SLIDER_VALUES],
                  ] as const
                ).map(([name, val, set, options]) => (
                  <div key={name} className="space-y-1">
                    <label htmlFor={`l7-s${name}`} className="block text-sm font-bold text-slate-800">
                      <i>{name}</i> = <span className="text-rose-600">{val}</span>
                      <span className="ml-2 text-[11px] font-semibold text-slate-500">
                        {name === 'p' ? 'x축 방향 평행이동' : name === 'q' ? 'y축 방향 평행이동' : '(k ≠ 0)'}
                      </span>
                    </label>
                    <input
                      id={`l7-s${name}`}
                      type="range"
                      min={0}
                      max={options.length - 1}
                      step={1}
                      value={options.indexOf(val as never)}
                      onChange={(e) => set(options[Number(e.target.value)])}
                      className="w-full accent-violet-600"
                    />
                  </div>
                ))}
                <div role="status" className="rounded-xl border border-violet-200 bg-violet-50 px-3.5 py-2.5 text-xs sm:text-sm text-violet-950 space-y-1 font-semibold">
                  <div>
                    <MathText text={rationalLabel(shiftFn)} />
                  </div>
                  <div>
                    정의역 {'{'}x | x ≠ {sp}인 실수{'}'}, 치역 {'{'}y | y ≠ {sq}인 실수{'}'}
                  </div>
                  <div>
                    점근선 x = {sp}, y = {sq} · 원점 → 점 ({sp}, {sq})
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 정리 카드 */}
          <div className="rounded-2xl border-2 border-violet-600/70 bg-gradient-to-br from-violet-50/80 via-white to-sky-50/50 p-5 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-violet-900">
                <BookOpen className="h-4 w-4 text-violet-600 shrink-0" />
                <span>
                  정리 · 유리함수 <MathText text="y = k/(x − p) + q (k ≠ 0)" />의 그래프
                </span>
              </div>
              <ToggleButton
                on={showSummaryImg}
                onClick={() => setShowSummaryImg((v) => !v)}
                onLabel="교과서 그림 닫기"
                offLabel="교과서 그림 보기"
              />
            </div>
            <ol className="space-y-1.5 text-xs sm:text-sm text-slate-800 leading-relaxed list-decimal pl-5">
              <li>
                <MathText text="y = k/x" />의 그래프를 <strong>x축의 방향으로 p만큼, y축의 방향으로 q만큼</strong> 평행이동한 것이다.
              </li>
              <li>
                정의역은 <MathText text="{x | x ≠ p인 실수}" />이고, 치역은 <MathText text="{y | y ≠ q인 실수}" />이다.
              </li>
              <li>
                점근선은 두 직선 <strong>x = p와 y = q</strong>이다.
              </li>
            </ol>
            {showSummaryImg && (
              <TextbookImage
                file="image_l7_summary.png"
                alt="k>0, k<0일 때 y = k/x와 y = k/(x-p)+q의 그래프 비교와 정리"
                maxH="max-h-[460px]"
              />
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <ActivityHeader theme="violet" kicker="교과서 [보기]" title="y = 1/(x − 2) + 1의 그래프" />
            <TextbookImage
              file="image_l7_bogi.png"
              alt="보기 - y = 1/(x-2) + 1의 그래프는 y = 1/x의 그래프를 x축 방향으로 2만큼, y축 방향으로 1만큼 평행이동. 정의역 x ≠ 2, 치역 y ≠ 1, 점근선 x = 2와 y = 1"
              maxH="max-h-[260px]"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <ActivityHeader theme="sky" kicker="탐구 활동 03-B · 생각 톡톡" title="이 그래프는 어느 점에 대하여 대칭일까?" done={state.thinkVerified} />
            <TextbookImage file="image_l7_think.png" alt="생각 톡톡 - 함수 y = k/(x-p) + q의 그래프는 어느 점에 대하여 대칭일까?" maxH="max-h-[160px]" />
            <p className="text-xs text-slate-600">위 실험실에서 회색 점(원점)과 진한 점이 어떻게 옮겨지는지 보세요. 답은 문자 p, q로 씁니다.</p>
            <div className="flex items-center gap-1.5 flex-wrap text-sm font-bold text-slate-800">
              <span>점 (</span>
              <SmallInput id="l7-think-x" label="대칭인 점의 x좌표" value={state.thinkSymX} onChange={(v) => setField('thinkSymX', v)} width="w-14" />
              <span>,</span>
              <SmallInput id="l7-think-y" label="대칭인 점의 y좌표" value={state.thinkSymY} onChange={(v) => setField('thinkSymY', v)} width="w-14" />
              <span>)에 대하여 대칭</span>
            </div>
            <FeedbackBanner fb={feedback.think} />
            <VerifyButton theme="sky" onClick={() => verify('think', 'thinkVerified', validateL7Think)}>
              [생각 톡톡] 정답 확인하기
            </VerifyButton>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <ActivityHeader theme="violet" kicker="탐구 활동 03-C · 교과서" title="[문제 5] 다음 함수의 그래프를 그리고, 점근선을 구하시오." done={state.p5Verified} />
            <TextbookImage file="image_l7_prob5.png" alt="문제 5 - (1) y = 2/(x-1) - 5 (2) y = -6/(x+3) - 2의 그래프를 그리고 점근선을 구하시오." maxH="max-h-[150px]" />
            <div className="flex justify-end">
              <HintToggle open={!!hints.p5} onClick={() => toggleHint('p5')} />
            </div>
            {hints.p5 && (
              <HintBox>
                <div>• y = k/(x − p) + q 꼴에서 점근선은 x = p, y = q입니다.</div>
                <div>• (2) x + 3 = x − (−3)이므로 p = −3이에요.</div>
              </HintBox>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AsymptoteInput
                idPrefix="l7-p5-1"
                title={
                  <>
                    (1) <i>y</i> = <Expr raw="2/(x-1)" /> − 5
                  </>
                }
                x={state.p5_1x}
                y={state.p5_1y}
                onX={(v) => setField('p5_1x', v)}
                onY={(v) => setField('p5_1y', v)}
              />
              <AsymptoteInput
                idPrefix="l7-p5-2"
                title={
                  <>
                    (2) <i>y</i> = −<Expr raw="6/(x+3)" /> − 2
                  </>
                }
                x={state.p5_2x}
                y={state.p5_2y}
                onX={(v) => setField('p5_2x', v)}
                onY={(v) => setField('p5_2y', v)}
              />
            </div>
            <FeedbackBanner fb={feedback.p5} />
            <VerifyButton theme="violet" onClick={() => verify('p5', 'p5Verified', validateL7Prob5)}>
              [문제 5] 정답 확인하기
            </VerifyButton>
            {graphReveal(
              'p5',
              state.p5Verified,
              L7_P5.map((fn, i) => shiftedPanel(`p5-${i}`, `(${i + 1})`, rationalLabel(fn), fn)),
              '회색 점선 y = k/x를 평행이동하면 빨간 그래프가 되는지, 두 점근선의 교점에 대하여 대칭인지 확인해 보세요.'
            )}
          </div>

          <NavRow onPrev={() => goSection('p4')} onNext={() => goSection('transform')} nextLabel="다음 단계: y = (ax+b)/(cx+d) 변형" />
        </div>
      )}

      {/* =====================================================================
          4단계: y = (ax + b)/(cx + d) → y = k/(x − p) + q — 예제 2, [문제 6]
      ===================================================================== */}
      {section === 'transform' && (
        <div className="space-y-6">
          <div className="rounded-2xl border-2 border-sky-600/70 bg-gradient-to-br from-sky-50/80 via-white to-violet-50/50 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-sky-900">
              <BookOpen className="h-4 w-4 text-sky-600 shrink-0" />
              <span>
                유리함수 <MathText text="y = (ax + b)/(cx + d)" />의 그래프
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
              유리함수 <MathText text="y = (ax + b)/(cx + d) (ad − bc ≠ 0, c ≠ 0)" />의 그래프는{' '}
              <MathText text="y = k/(x − p) + q (k ≠ 0)" />의 꼴로 변형하여 그릴 수 있습니다. 분자를 <strong>(분모) × (몫) + (나머지)</strong>로 나타내 보세요.
            </p>
            <p className="text-[11px] sm:text-xs text-slate-500">
              ✏️ 입력 방법: 틀의 빈칸에 숫자를 씁니다. x + 1은 x − (−1)이므로 p 칸에 <span className="mono">-1</span>을 써요. 분수는 <span className="mono">1/2</span>처럼 씁니다.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <ActivityHeader
              theme="sky"
              kicker="탐구 활동 04-A · 교과서 예제 2를 문제로"
              title={
                <span className="inline-flex items-center gap-1 flex-wrap">
                  함수 <i>y</i> = <Expr raw={L7_EX2.raw} />의 그래프를 그리고, 점근선을 구하시오.
                </span>
              }
              done={state.ex2Verified}
              extra={
                <>
                  <ToggleButton on={showEx2Img} onClick={() => setShowEx2Img((v) => !v)} onLabel="교과서 풀이 닫기" offLabel="교과서 풀이 보기" />
                  {padButton('ex2')}
                </>
              }
            />
            {showEx2Img && (
              <TextbookImage
                file="image_l7_ex2.png"
                alt="교과서 예제 2 풀이 - y = (2x-1)/(x+1) = -3/(x+1) + 2이므로 y = -3/x의 그래프를 x축 방향으로 -1만큼, y축 방향으로 2만큼 평행이동, 점근선 x = -1, y = 2"
                maxH="max-h-[380px]"
              />
            )}
            <div className="flex justify-end">
              <HintToggle open={!!hints.ex2} onClick={() => toggleHint('ex2')} />
            </div>
            {hints.ex2 && (
              <HintBox>
                <div>• {L7_EX2.hint}</div>
                <div>• 그러면 (2x − 1)/(x + 1) = 2(x + 1)/(x + 1) − 3/(x + 1) = −3/(x + 1) + 2</div>
              </HintBox>
            )}
            <TransformInput idPrefix="l7-ex2" {...transformFields(L7_EX2, { k: 'ex2k', p: 'ex2p', q: 'ex2q', ax: 'ex2ax', ay: 'ex2ay' })} />
            <FeedbackBanner fb={feedback.ex2} />
            <VerifyButton theme="sky" onClick={() => verify('ex2', 'ex2Verified', validateL7Ex2)}>
              [예제 2] 정답 확인하기
            </VerifyButton>
            {graphReveal('ex2', state.ex2Verified, transformPanels(L7_GRAPH_SETS.ex2))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <ActivityHeader theme="sky" kicker="탐구 활동 04-B · 교과서" title="[문제 6] 다음 함수의 그래프를 그리고, 점근선을 구하시오." done={state.p6Verified} extra={padButton('p6')} />
            <TextbookImage file="image_l7_prob6.png" alt="문제 6 - (1) y = 2x/(x-3) (2) y = (-3x+1)/(x-1)의 그래프를 그리고 점근선을 구하시오." maxH="max-h-[150px]" />
            <div className="flex justify-end">
              <HintToggle open={!!hints.p6} onClick={() => toggleHint('p6')} />
            </div>
            {hints.p6 && (
              <HintBox>
                {L7_P6.map((t, i) => (
                  <div key={t.raw}>
                    • ({i + 1}) {t.hint}
                  </div>
                ))}
              </HintBox>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {L7_P6.map((t, i) => (
                <div key={t.raw} className="space-y-2">
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                    ({i + 1}) <i>y</i> = <Expr raw={t.raw} />
                  </div>
                  <TransformInput
                    idPrefix={`l7-p6-${i + 1}`}
                    {...transformFields(
                      t,
                      i === 0
                        ? { k: 'p6_1k', p: 'p6_1p', q: 'p6_1q', ax: 'p6_1ax', ay: 'p6_1ay' }
                        : { k: 'p6_2k', p: 'p6_2p', q: 'p6_2q', ax: 'p6_2ax', ay: 'p6_2ay' }
                    )}
                  />
                </div>
              ))}
            </div>
            <ReasonInput
              id="l7-p6-reason"
              theme="sky"
              label="y = (ax + b)/(cx + d)를 y = k/(x − p) + q 꼴로 바꾸는 방법을 정리해 보세요."
              value={state.p6Reason}
              onChange={(v) => setField('p6Reason', v)}
              min={L7_MIN_REASON}
            />
            <FeedbackBanner fb={feedback.p6} />
            <VerifyButton theme="sky" onClick={() => verify('p6', 'p6Verified', validateL7Prob6)}>
              [문제 6] 정답 확인하기
            </VerifyButton>
            {graphReveal('p6', state.p6Verified, transformPanels(L7_GRAPH_SETS.p6))}
          </div>

          <NavRow onPrev={() => goSection('shift')} onNext={() => goSection('reflect')} nextLabel="다음 단계: 성찰" />
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
                <span className="text-xs font-extrabold text-rose-600">7차시 마무리 성찰</span>
                <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">유리함수의 그래프와 점근선 정리하기</h4>
              </div>
              <HintToggle open={!!hints.reflection} onClick={() => toggleHint('reflection')} label="💡 성찰 힌트 보기" />
            </div>
            {hints.reflection && (
              <HintBox>
                <div>
                  • <strong>성찰 1 예시</strong>: “y = k/(x − p) + q의 그래프는 y = k/x의 그래프를 x축 방향으로 p, y축 방향으로 q만큼 평행이동한 것이고, 점근선은 x = p, y = q이다.”
                </div>
                <div>
                  • <strong>성찰 2 예시</strong>: “분수식의 분자를 분모로 나누면 y = (ax + b)/(cx + d)도 평행이동한 그래프라는 것을 알았다.”
                </div>
              </HintBox>
            )}
            <HelpSourcePicker idPrefix="l7" value={state.rgHelpSource} onChange={(v) => onUpdate((prev) => ({ ...prev, rgHelpSource: v }))} />
            <ReasonInput
              id="l7-reflection1"
              theme="rose"
              label="1. y = k/(x − p) + q의 그래프를 그리는 방법과 점근선을 정리해 보세요."
              value={state.rgReflection1}
              onChange={(v) => onUpdate((prev) => ({ ...prev, rgReflection1: v }))}
              min={L7_MIN_REFLECTION}
            />
            <ReasonInput
              id="l7-reflection2"
              theme="rose"
              label="2. 오늘 새롭게 알게 된 점이나 어려웠던 점을 적어 보세요."
              value={state.rgReflection2}
              onChange={(v) => onUpdate((prev) => ({ ...prev, rgReflection2: v }))}
              min={L7_MIN_REFLECTION}
            />
            <div className="pt-3 border-t border-slate-100">
              <NavRow onPrev={() => goSection('transform')} onNext={onGoToLesson8} nextLabel="다음 차시: 08차시로 이동" nextDark />
            </div>
          </div>
        </div>
      )}

      {/* 문제별 연습장 (변형 단계에서만) */}
      {openPad && section === 'transform' && (
        <ScratchPadWindow
          key={openPad}
          title={openPad === 'ex2' ? '[예제 2] y = (2x − 1)/(x + 1) 변형' : '[문제 6] 변형과 점근선'}
          strokes={pads[openPad] || []}
          onChange={(next) => setPads((prev) => ({ ...prev, [openPad]: next }))}
          onClose={() => setOpenPad(null)}
          onRequestConfirm={onRequestConfirm}
          fileName={`7차시_연습장_${openPad}`}
        />
      )}
    </div>
  );
};
