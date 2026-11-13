import React, { useLayoutEffect, useRef, useState } from 'react';
import { addHintOpen } from '../utils/hintLog';
import type { Lesson7State } from '../utils/mathLogic';
import {
  type L8Feedback,
  type IneqOp,
  type IrrFn,
  type SignChoice,
  type Quadrant,
  type Symmetry,
  type L8Transform,
  type L8CalcItem,
  INEQ_OPS,
  L8_MIN_REASON,
  L8_MIN_REFLECTION,
  L8_OPEN_EXPR_OPTIONS,
  L8_OPEN_PRESSURE,
  L8_EX1,
  L8_P2,
  L8_READING,
  L8_P4,
  L8_P4_QUAD_KEYS,
  L8_P4_SYM_KEYS,
  L8_P5,
  L8_P5_DOMAIN_KEYS,
  L8_P5_RANGE_KEYS,
  L8_P6,
  L8_P6_KEYS,
  L8_EX2,
  L8_P7,
  composeIneq,
  parseIneq,
  typhoonSpeed,
  irrLabel,
  irrDomainText,
  irrRangeText,
  numText,
  validateL8Open,
  validateL8Prob1,
  validateL8Ex1,
  validateL8Prob2,
  validateL8Prob3,
  validateL8Sqrt,
  validateL8Prob4,
  validateL8Prob5,
  validateL8Prob6,
  validateL8Ex2,
  validateL8Prob7,
} from '../utils/lesson8Logic';
import { parseIrr } from '../utils/irrExpr';
import { MathText } from './MathText';
import { IrrView, IrrExpr, Root } from './IrrMath';
import { IrrationalGraph, IrrGraphReveal, IrrLegend, IRR_COLORS, type IrrPanel, type IrrCurve } from './IrrationalGraph';
import { ScratchPadButton, ScratchPadWindow, PadStroke } from './ScratchPad';
import { HelpSourcePicker } from './HelpSourcePicker';
import { CharCountBadge, getCharCountBorderClass } from './CharCountBadge';
import { CheckCircle2, AlertTriangle, Lightbulb, ArrowRight, ArrowLeft, RotateCcw, BookOpen, Eye, EyeOff, Lock, Wind, Sigma } from 'lucide-react';

/**
 * Func 8·9차시 · 무리식과 무리함수 (학생 화면, 2026-11-13 — 예전 절대부등식3 화면을 대체, 같은 날 두 차시로 나눔)
 * - part 1 = 8차시: 생각 열기 · 문제 1 · 무리식의 계산 · 무리함수와 정의역 · y = √ax의 그래프 · 성찰
 * - part 2 = 9차시(Lesson9View): 평행이동 · y = √(ax+b)+c · 성찰
 * 문항 자료·채점: src/utils/lesson8Logic.ts / 식 읽기: src/utils/irrExpr.ts / 그래프: src/components/IrrationalGraph.tsx
 * 단계 완료: mathLogic.ts evaluateLevel8Completion·evaluateLevel9Completion / 저장 칸: func_lessons/l7 (두 차시가 함께 씀, Lesson7State에 항목 추가만)
 */

export interface Lesson8ViewProps {
  state: Lesson7State;
  step: number;
  onStepChange: (step: number) => void;
  onUpdate: (updater: (prev: Lesson7State) => Lesson7State) => void;
  onRequestConfirm: (title: string, message: string, onConfirm: () => void) => void;
  /** 8차시 → 9차시 이동 (part 1 성찰 끝) */
  onGoToLesson9?: () => void;
  /** 1 = 8차시, 2 = 9차시 */
  part?: 1 | 2;
}

type Section = 'open' | 'p1' | 'calc' | 'domain' | 'graph' | 'reflect8' | 'shift' | 'transform' | 'reflect';
/** 8차시 단계 (STAGE_TITLES[8]과 같은 순서) */
export const LESSON8_SECTIONS: Section[] = ['open', 'p1', 'calc', 'domain', 'graph', 'reflect8'];
/** 9차시 단계 (STAGE_TITLES[9]와 같은 순서) */
export const LESSON9_SECTIONS: Section[] = ['shift', 'transform', 'reflect'];

// ── 교과서 그림 경로 (7차시와 같은 방식: GitHub Pages에서는 ./public/… 경로) ──
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
    label: 'text-rose-600',
    btn: 'bg-rose-600 hover:bg-rose-700',
    picked: 'border-rose-600 bg-rose-50 text-rose-950 ring-1 ring-rose-600',
    focus: 'focus:border-rose-500',
  },
  teal: {
    label: 'text-teal-700',
    btn: 'bg-teal-600 hover:bg-teal-700',
    picked: 'border-teal-600 bg-teal-50 text-teal-950 ring-1 ring-teal-600',
    focus: 'focus:border-teal-500',
  },
  emerald: {
    label: 'text-emerald-700',
    btn: 'bg-emerald-600 hover:bg-emerald-700',
    picked: 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600',
    focus: 'focus:border-emerald-500',
  },
  sky: {
    label: 'text-sky-700',
    btn: 'bg-sky-600 hover:bg-sky-700',
    picked: 'border-sky-600 bg-sky-50 text-sky-950 ring-1 ring-sky-600',
    focus: 'focus:border-sky-500',
  },
  violet: {
    label: 'text-violet-700',
    btn: 'bg-violet-600 hover:bg-violet-700',
    picked: 'border-violet-600 bg-violet-50 text-violet-950 ring-1 ring-violet-600',
    focus: 'focus:border-violet-500',
  },
} as const;
type ThemeKey = keyof typeof THEME;

/** 입력 항목 → 그 항목이 속한 [정답 확인] 표시. 답을 고치면 확인 표시를 해제합니다. */
const FIELD_FLAG: Partial<Record<keyof Lesson7State, keyof Lesson7State>> = {
  opExpr: 'openVerified',
  opSpeed: 'openVerified',
  opRange: 'openVerified',
  opReason: 'openVerified',
  p1a: 'p1Verified',
  p1b: 'p1Verified',
  ex1a: 'ex1Verified',
  ex1b: 'ex1Verified',
  p2a: 'p2Verified',
  p2b: 'p2Verified',
  p2Reason: 'p2Verified',
  p3a: 'p3Verified',
  p3b: 'p3Verified',
  sqDomain: 'sqVerified',
  sqRange: 'sqVerified',
  sqTrend: 'sqVerified',
  p4q1: 'p4Verified',
  p4q2: 'p4Verified',
  p4q3: 'p4Verified',
  p4s1: 'p4Verified',
  p4s2: 'p4Verified',
  p4s3: 'p4Verified',
  p5d1: 'p5Verified',
  p5d2: 'p5Verified',
  p5d3: 'p5Verified',
  p5d4: 'p5Verified',
  p5r1: 'p5Verified',
  p5r2: 'p5Verified',
  p5r3: 'p5Verified',
  p5r4: 'p5Verified',
  p6_1p: 'p6Verified',
  p6_1q: 'p6Verified',
  p6_1d: 'p6Verified',
  p6_1r: 'p6Verified',
  p6_2p: 'p6Verified',
  p6_2q: 'p6Verified',
  p6_2d: 'p6Verified',
  p6_2r: 'p6Verified',
  ex2s: 'ex2Verified',
  ex2a: 'ex2Verified',
  ex2p: 'ex2Verified',
  ex2q: 'ex2Verified',
  ex2d: 'ex2Verified',
  ex2r: 'ex2Verified',
  p7_1s: 'p7Verified',
  p7_1a: 'p7Verified',
  p7_1p: 'p7Verified',
  p7_1q: 'p7Verified',
  p7_1d: 'p7Verified',
  p7_1r: 'p7Verified',
  p7_2s: 'p7Verified',
  p7_2a: 'p7Verified',
  p7_2p: 'p7Verified',
  p7_2q: 'p7Verified',
  p7_2d: 'p7Verified',
  p7_2r: 'p7Verified',
  p7Reason: 'p7Verified',
};

type FeedbackKey = 'open' | 'p1' | 'ex1' | 'p2' | 'p3' | 'sq' | 'p4' | 'p5' | 'p6' | 'ex2' | 'p7';
type GraphKey = 'p4' | 'p5' | 'p6' | 'ex2' | 'p7';
type PadKey = 'ex1' | 'p2' | 'ex2' | 'p7';

/** 8차시 초기화 항목 — 9차시 답과 예전 절대부등식3 항목(examples·prob1ProofText·reflection1 등)은 건드리지 않음 */
export const LESSON8_RESET: Partial<Lesson7State> = {
  opExpr: '',
  opSpeed: '',
  opRange: '',
  opReason: '',
  openVerified: false,
  p1a: '',
  p1b: '',
  p1Verified: false,
  ex1a: '',
  ex1b: '',
  ex1Verified: false,
  p2a: '',
  p2b: '',
  p2Reason: '',
  p2Verified: false,
  p3a: '',
  p3b: '',
  p3Verified: false,
  sqDomain: '',
  sqRange: '',
  sqTrend: '',
  sqVerified: false,
  p4q1: '',
  p4q2: '',
  p4q3: '',
  p4s1: '',
  p4s2: '',
  p4s3: '',
  p4Verified: false,
  p5d1: '',
  p5d2: '',
  p5d3: '',
  p5d4: '',
  p5r1: '',
  p5r2: '',
  p5r3: '',
  p5r4: '',
  p5Verified: false,
  ieReflection1: '',
  ieReflection2: '',
  ieHelpSource: '',
};

/** 9차시 초기화 항목 — 8차시 답과 예전 항목은 건드리지 않음 */
export const LESSON9_RESET: Partial<Lesson7State> = {
  p6_1p: '',
  p6_1q: '',
  p6_1d: '',
  p6_1r: '',
  p6_2p: '',
  p6_2q: '',
  p6_2d: '',
  p6_2r: '',
  p6Verified: false,
  ex2s: '',
  ex2a: '',
  ex2p: '',
  ex2q: '',
  ex2d: '',
  ex2r: '',
  ex2Verified: false,
  p7_1s: '',
  p7_1a: '',
  p7_1p: '',
  p7_1q: '',
  p7_1d: '',
  p7_1r: '',
  p7_2s: '',
  p7_2a: '',
  p7_2p: '',
  p7_2q: '',
  p7_2d: '',
  p7_2r: '',
  p7Reason: '',
  p7Verified: false,
  irReflection1: '',
  irReflection2: '',
  irHelpSource: '',
};

// ─────────────────────────────────────────────
// 작은 화면 조각 (7차시와 같은 모양)
// ─────────────────────────────────────────────
function FeedbackBanner({ fb }: { fb: L8Feedback | null | undefined }) {
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
      <div className="flex items-center gap-2 flex-wrap">
        <DoneBadge show={done} />
        {extra}
      </div>
    </div>
  );
}

function TextbookImage({ file, alt, maxH = 'max-h-[260px]' }: { file: string; alt: string; maxH?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 flex justify-center">
      <img src={textbookSrc(file)} onError={(e) => onTextbookError(e, file)} alt={alt} className={`${maxH} w-auto max-w-full object-contain rounded-lg`} />
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
    <div className={`grid grid-cols-1 ${cols} gap-2`}>
      {options.map(([val, label]) => (
        <button
          key={val}
          type="button"
          aria-pressed={value === val}
          onClick={() => onPick(val)}
          className={`rounded-xl border px-3 py-2 text-xs sm:text-sm font-bold text-left transition-all ${
            value === val ? THEME[theme].picked : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <MathText text={label} />
        </button>
      ))}
    </div>
  );
}

const inputClass = (theme: ThemeKey) =>
  `w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none ${THEME[theme].focus}`;

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

function NavRow({ onPrev, onNext, nextLabel }: { onPrev?: () => void; onNext?: () => void; nextLabel?: string }) {
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
          className="inline-flex min-h-[42px] items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white transition-colors shadow-xs bg-rose-600 hover:bg-rose-700"
        >
          <span>
            <MathText text={nextLabel || '다음 단계'} />
          </span>
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

function LockedNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
      <Lock className="h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

/** 작은 숫자 칸 */
function SmallInput({ id, label, value, onChange, width = 'w-16' }: { id: string; label: string; value?: string; onChange: (v: string) => void; width?: string }) {
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

/**
 * 부등식 입력: 문자(x 또는 y) + 부등호 버튼 4개 + 숫자 칸 → "x ≥ 3/2" 한 글자열로 저장
 * (패드에서 ≥ 기호를 직접 치기 어려워 버튼으로 고르게 함)
 */
function IneqInput({
  id,
  v,
  value,
  onChange,
  label,
}: {
  id: string;
  v: 'x' | 'y';
  value?: string;
  onChange: (next: string) => void;
  label?: React.ReactNode;
}) {
  const cur = parseIneq(value);
  const op = cur.op;
  const num = cur.num;
  return (
    <div className="space-y-1">
      {label && <div className="text-xs font-bold text-slate-700">{label}</div>}
      <div className="flex items-center gap-1.5 flex-wrap" data-ineq={id}>
        <i className="font-serif text-base font-bold text-slate-900 w-3 text-center">{v}</i>
        <div className="inline-flex rounded-lg border border-slate-300 bg-white overflow-hidden" role="group" aria-label={`${v}의 부등호 고르기`}>
          {INEQ_OPS.map((o) => (
            <button
              key={o}
              type="button"
              aria-pressed={op === o}
              aria-label={`부등호 ${o}`}
              onClick={() => onChange(composeIneq(v, op === o ? '' : o, num))}
              className={`min-w-[34px] px-2 py-1 text-sm font-extrabold border-r last:border-r-0 border-slate-200 transition-colors ${
                op === o ? 'bg-violet-600 text-white' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {o}
            </button>
          ))}
        </div>
        <input
          id={id}
          aria-label={`${v}의 경계 값`}
          type="text"
          inputMode="text"
          autoComplete="off"
          value={num}
          onChange={(e) => onChange(composeIneq(v, op, e.target.value))}
          className="w-20 rounded-md border border-slate-300 bg-white px-1.5 py-1 text-center text-sm font-bold text-slate-900 focus:outline-none focus:border-violet-500"
        />
      </div>
    </div>
  );
}

/** 식 입력 (√ 넣기 버튼 + 근호·분수 모양 미리보기) */
function ExprInput({
  id,
  theme,
  label,
  value,
  onChange,
}: {
  id: string;
  theme: ThemeKey;
  label: React.ReactNode;
  value?: string;
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  // 버튼으로 넣은 뒤 커서를 괄호 안에 두기 (값이 화면에 반영된 직후)
  const caretRef = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (caretRef.current !== null && ref.current) {
      ref.current.setSelectionRange(caretRef.current, caretRef.current);
      caretRef.current = null;
    }
  });
  const insert = (text: string, caretBack = 0) => {
    const el = ref.current;
    const cur = value || '';
    const start = el?.selectionStart ?? cur.length;
    const end = el?.selectionEnd ?? cur.length;
    caretRef.current = start + text.length - caretBack;
    el?.focus();
    onChange(cur.slice(0, start) + text + cur.slice(end));
  };
  const node = (value || '').trim() ? parseIrr(value) : null;
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2">
      <label htmlFor={id} className="block text-sm font-bold text-slate-900">
        {label}
      </label>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-bold text-slate-700 shrink-0">=</span>
        <input
          id={id}
          ref={ref}
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass(theme)} min-w-0 mono`}
        />
        <button
          type="button"
          // 누를 때 입력칸 포커스가 빠지지 않게 (키보드·커서 유지)
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => insert('√()', 1)}
          aria-label="근호 넣기"
          className="shrink-0 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-extrabold text-slate-800 hover:bg-slate-100"
        >
          √( )
        </button>
      </div>
      <div className="min-h-[28px] text-sm text-slate-800 flex items-center gap-2 flex-wrap" aria-live="polite">
        <span className="text-[11px] font-bold text-slate-500 shrink-0">미리보기</span>
        {!(value || '').trim() ? (
          <span className="text-[11px] text-slate-400">식을 입력하면 모양이 보여요</span>
        ) : node ? (
          <span className="inline-flex items-center flex-wrap font-semibold" data-preview={id}>
            <IrrView node={node} />
          </span>
        ) : (
          <span className="text-[11px] font-bold text-amber-700">아직 읽을 수 없는 식이에요 (괄호 짝, 기호 확인)</span>
        )}
      </div>
    </div>
  );
}

/** y = (±)√( □ (x − □) ) + □ 틀과 정의역·치역 입력 */
function TransformInput({
  idPrefix,
  values,
  onChange,
}: {
  idPrefix: string;
  values: { s?: string; a?: string; p?: string; q?: string; d?: string; r?: string };
  onChange: (part: 's' | 'a' | 'p' | 'q' | 'd' | 'r', v: string) => void;
}) {
  const neg = values.s === '-';
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-3">
      <div className="flex items-center gap-1.5 flex-wrap text-sm font-bold text-slate-800">
        <span>
          <i>y</i> =
        </span>
        <span className="inline-flex rounded-lg border border-slate-300 bg-white overflow-hidden" role="group" aria-label="근호 앞의 부호">
          {(
            [
              ['+', '없음'],
              ['-', '−'],
            ] as const
          ).map(([val, text]) => {
            const on = val === '-' ? neg : !neg;
            return (
              <button
                key={val}
                type="button"
                aria-pressed={on}
                aria-label={val === '-' ? '근호 앞에 − 붙이기' : '근호 앞 부호 없음'}
                onClick={() => onChange('s', val)}
                className={`px-2 py-1 text-xs font-extrabold border-r last:border-r-0 border-slate-200 ${on ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                {text}
              </button>
            );
          })}
        </span>
        <Root>
          <span className="inline-flex items-center gap-1 py-0.5">
            <SmallInput id={`${idPrefix}-a`} label="a (x의 계수)" value={values.a} onChange={(v) => onChange('a', v)} width="w-12" />
            <span>(</span>
            <i>x</i> − <SmallInput id={`${idPrefix}-p`} label="p (x − p의 p)" value={values.p} onChange={(v) => onChange('p', v)} width="w-12" />
            <span>)</span>
          </span>
        </Root>
        <span>+</span>
        <SmallInput id={`${idPrefix}-q`} label="q" value={values.q} onChange={(v) => onChange('q', v)} width="w-12" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <IneqInput id={`${idPrefix}-d`} v="x" value={values.d} onChange={(v) => onChange('d', v)} label="정의역 {x | ______ }" />
        <IneqInput id={`${idPrefix}-r`} v="y" value={values.r} onChange={(v) => onChange('r', v)} label="치역 {y | ______ }" />
      </div>
    </div>
  );
}

const A_VALUES = [-3, -2, -1, -0.5, 0.5, 1, 2, 3];
const SHIFT_A = [-3, -2, -1, 1, 2, 3];
const SHIFT_PQ = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

/** 함수 하나 → 그래프 묶음 (y = ±√ax는 회색 점선, 주어진 함수는 빨강 + 시작점) */
function irrPanel(key: string, title: string | undefined, fn: IrrFn, label?: string, range = 7): IrrPanel {
  const shifted = fn.p !== 0 || fn.q !== 0;
  const base: IrrFn = { s: fn.s, a: fn.a, p: 0, q: 0 };
  return {
    key,
    title,
    range,
    curves: [...(shifted ? [{ fn: base, color: IRR_COLORS.base, dashed: true, width: 1.8 }] : []), { fn, color: IRR_COLORS.main, start: true }],
    legend: [
      ...(shifted ? [{ color: IRR_COLORS.base, label: irrLabel(base), dashed: true }] : []),
      { color: IRR_COLORS.main, label: label ?? irrLabel(fn) },
    ],
    note: (
      <MathText text={`시작점 (${numText(fn.p)}, ${numText(fn.q)}) · 정의역 ${irrDomainText(fn)} · 치역 ${irrRangeText(fn)}`} />
    ),
    ariaLabel: `${label ?? irrLabel(fn)}의 그래프, 시작점 (${fn.p}, ${fn.q})`,
  };
}

const aText = (a: number) => (Number.isInteger(a) ? numText(a) : numText(a));

// ─────────────────────────────────────────────
// 8차시 화면
// ─────────────────────────────────────────────
export const Lesson8View: React.FC<Lesson8ViewProps> = ({ state, step, onStepChange, onUpdate, onRequestConfirm, onGoToLesson9, part = 1 }) => {
  const sections = part === 1 ? LESSON8_SECTIONS : LESSON9_SECTIONS;
  const lessonNo = part === 1 ? 8 : 9;
  const section: Section = sections[step] ?? sections[0];
  const [hints, setHints] = useState<Record<string, boolean>>({});
  const toggleHint = (k: string) => {
    // 힌트를 '열 때'만 횟수 기록 (hintLog.ts, 교사 화면 '힌트 사용 현황')
    if (!hints[k]) onUpdate((prev) => addHintOpen(prev, k));
    setHints((prev) => ({ ...prev, [k]: !prev[k] }));
  };
  const [feedback, setFeedback] = useState<Partial<Record<FeedbackKey, L8Feedback | null>>>({});
  const [graphOpen, setGraphOpen] = useState<Partial<Record<GraphKey, boolean>>>({});
  const toggleGraph = (k: GraphKey) => setGraphOpen((prev) => ({ ...prev, [k]: !prev[k] }));
  // 화면에만 있는 실험 값 (저장하지 않음)
  const [pressure, setPressure] = useState(980);
  const [readingKey, setReadingKey] = useState<(typeof L8_READING)[number]['key']>('tsunami');
  const [readingX, setReadingX] = useState<Record<string, number>>(() => Object.fromEntries(L8_READING.map((r) => [r.key, r.init])));
  const [invStep, setInvStep] = useState(3);
  const [aVal, setAVal] = useState(1);
  const [aNeg, setANeg] = useState(false);
  const [ss, setSs] = useState<1 | -1>(1);
  const [sa, setSa] = useState(1);
  const [sp, setSp] = useState(2);
  const [sq, setSq] = useState(1);
  const [imgs, setImgs] = useState<Record<string, boolean>>({});
  const toggleImg = (k: string) => setImgs((prev) => ({ ...prev, [k]: !prev[k] }));
  const [pads, setPads] = useState<Partial<Record<PadKey, PadStroke[]>>>({});
  const [openPad, setOpenPad] = useState<PadKey | null>(null);
  const padButton = (id: PadKey) => (
    <ScratchPadButton onClick={() => setOpenPad((cur) => (cur === id ? null : id))} used={Boolean(pads[id]?.length)} active={openPad === id} />
  );

  const setField = <K extends keyof Lesson7State>(key: K, value: Lesson7State[K]) => {
    const flag = FIELD_FLAG[key];
    onUpdate((prev) => ({ ...prev, [key]: value, ...(flag ? { [flag]: false } : {}) }));
  };

  const verify = (key: FeedbackKey, flag: keyof Lesson7State, validator: (p: Lesson7State) => L8Feedback) => {
    const res = validator(state);
    setFeedback((prev) => ({ ...prev, [key]: res }));
    if (res.ok) onUpdate((prev) => ({ ...prev, [flag]: true }));
  };

  const goSection = (sec: Section) => {
    setOpenPad(null);
    onStepChange(Math.max(0, sections.indexOf(sec)));
  };

  const handleReset = () => {
    onRequestConfirm(
      `${lessonNo}차시 탐구 기록 초기화`,
      `${lessonNo}차시(${part === 1 ? '무리식과 무리함수' : '무리함수의 그래프와 평행이동'})에 입력한 모든 답안과 확인 상태를 초기화할까요? (${part === 1 ? 9 : 8}차시 답은 그대로 둡니다)`,
      () => {
      onUpdate((prev) => ({ ...prev, ...(part === 1 ? LESSON8_RESET : LESSON9_RESET) }));
      setFeedback({});
      setGraphOpen({});
      }
    );
  };

  const graphReveal = (k: GraphKey, unlocked: boolean | undefined, panels: IrrPanel[], caption?: React.ReactNode) => (
    <IrrGraphReveal unlocked={Boolean(unlocked)} open={Boolean(graphOpen[k])} onToggle={() => toggleGraph(k)} panels={panels} caption={caption} />
  );

  type TKeys = { s: keyof Lesson7State; a: keyof Lesson7State; p: keyof Lesson7State; q: keyof Lesson7State; d: keyof Lesson7State; r: keyof Lesson7State };
  const transformFields = (keys: TKeys) => ({
    values: {
      s: state[keys.s] as string | undefined,
      a: state[keys.a] as string | undefined,
      p: state[keys.p] as string | undefined,
      q: state[keys.q] as string | undefined,
      d: state[keys.d] as string | undefined,
      r: state[keys.r] as string | undefined,
    },
    onChange: (part: 's' | 'a' | 'p' | 'q' | 'd' | 'r', v: string) => setField(keys[part], v as never),
  });

  const calcInputs = (items: readonly L8CalcItem[], keys: readonly ('ex1a' | 'ex1b' | 'p2a' | 'p2b')[], prefix: string, theme: ThemeKey) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {items.map((it, i) => (
        <ExprInput
          key={it.label}
          id={`${prefix}-${i + 1}`}
          theme={theme}
          label={
            <span className="inline-flex items-center gap-1.5 flex-wrap">
              ({i + 1}) <IrrExpr raw={it.label.replace(/\s+/g, '')} />
            </span>
          }
          value={state[keys[i]]}
          onChange={(v) => setField(keys[i], v)}
        />
      ))}
    </div>
  );

  const speed = typhoonSpeed(pressure);
  const reading = L8_READING.find((r) => r.key === readingKey) ?? L8_READING[0];
  const readingVal = Math.sqrt(reading.k * (readingX[reading.key] ?? reading.init));
  const aFn: IrrFn = { s: 1, a: aNeg ? -Math.abs(aVal) : Math.abs(aVal), p: 0, q: 0 };
  const shiftFn: IrrFn = { s: ss, a: sa, p: sp, q: sq };
  const shiftBase: IrrFn = { s: ss, a: sa, p: 0, q: 0 };

  return (
    <div className="space-y-7">
      {/* 상단 차시 표시 */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200/80 bg-rose-50/60 px-4 py-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-rose-950 flex-wrap">
          <Sigma className="h-4 w-4 text-rose-600 shrink-0" />
          {part === 1 ? (
            <>
              <span>08차시 · 무리식과 무리함수:</span>
              <span className="font-semibold text-rose-800">
                무리식의 계산, 정의역과 <MathText text="y = √(ax)" />의 그래프
              </span>
            </>
          ) : (
            <>
              <span>09차시 · 무리함수의 그래프:</span>
              <span className="font-semibold text-rose-800">
                평행이동과 <MathText text="y = √(ax + b) + c" />의 그래프
              </span>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
          <span>{lessonNo}차시 초기화</span>
        </button>
      </div>

      {/* =====================================================================
          1단계: [생각 열기] 태풍의 풍속
      ===================================================================== */}
      {section === 'open' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <ActivityHeader theme="rose" kicker="탐구 활동 01 · 교과서 [생각 열기]" title="태풍의 풍속을 x에 대한 식으로 나타내 보자" done={state.openVerified} />
            <TextbookImage
              file="image_l8_open.png"
              alt="생각 열기 - 북태평양 서남부에서 발생하는 태풍의 풍속은 중심 기압에 대하여 6.3√(1013 − (중심 기압)) m/s와 같이 나타낼 수 있다. 중심 기압이 x hPa일 때 태풍의 풍속을 x에 대한 식으로 나타내 보자."
              maxH="max-h-[220px]"
            />
            <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-sky-900">
                <Wind className="h-4 w-4 text-sky-600" />
                <span>중심 기압을 바꾸어 보세요</span>
              </div>
              <label htmlFor="l8-pressure" className="block text-sm font-bold text-slate-800">
                중심 기압 = <span className="text-rose-600">{pressure}</span> hPa
              </label>
              <input
                id="l8-pressure"
                type="range"
                min={900}
                max={1020}
                step={1}
                value={pressure}
                onChange={(e) => setPressure(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
              <div className="flex flex-wrap gap-1.5">
                {[920, 949, 980, 1000, 1013, 1020].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setPressure(v)}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${pressure === v ? 'border-sky-600 bg-sky-100 text-sky-900' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                  >
                    {v} hPa
                  </button>
                ))}
              </div>
              <div
                role="status"
                className={`rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold ${
                  Number.isFinite(speed) ? 'bg-white text-slate-900 border border-sky-200' : 'bg-amber-50 text-amber-900 border border-amber-200'
                }`}
              >
                {Number.isFinite(speed) ? (
                  <span>
                    근호 안: 1013 − {pressure} = {1013 - pressure} → 풍속 <MathText text={`6.3√${1013 - pressure}`} /> ≈{' '}
                    <span className="text-rose-600">{speed.toFixed(1)}</span> m/s
                  </span>
                ) : (
                  <span>
                    근호 안: 1013 − {pressure} = {1013 - pressure} (음수) → <MathText text={`√(${1013 - pressure})`} />은 실수가 아니에요. 풍속을 계산할 수 없어요.
                  </span>
                )}
              </div>
              {Number.isFinite(speed) && (
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden" aria-hidden="true">
                  <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-rose-500" style={{ width: `${Math.min(100, (speed / 70) * 100)}%` }} />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-xs sm:text-sm font-bold text-slate-900">① 중심 기압이 x hPa일 때, 태풍의 풍속을 나타낸 식은?</div>
              <ChoiceButtons theme="rose" value={state.opExpr} options={L8_OPEN_EXPR_OPTIONS} onPick={(v) => setField('opExpr', v)} />
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <label htmlFor="l8-op-speed" className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                ② 중심 기압이 {L8_OPEN_PRESSURE} hPa일 때 태풍의 풍속은?
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="l8-op-speed"
                  type="text"
                  autoComplete="off"
                  value={state.opSpeed || ''}
                  onChange={(e) => setField('opSpeed', e.target.value)}
                  className={`${inputClass('rose')} min-w-0 max-w-[160px]`}
                />
                <span className="text-sm font-bold text-slate-600">m/s</span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2">
              <IneqInput
                id="l8-op-range"
                v="x"
                value={state.opRange}
                onChange={(v) => setField('opRange', v)}
                label={<span className="text-xs sm:text-sm text-slate-900">③ 이 식의 값이 실수가 되려면 x의 값의 범위는? (위 실험에서 1013보다 큰 값을 넣어 보세요)</span>}
              />
            </div>
            <div className="flex justify-end">
              <HintToggle open={!!hints.open} onClick={() => toggleHint('open')} />
            </div>
            {hints.open && (
              <HintBox>
                <div>• (중심 기압) 자리에 x를 넣습니다. 6.3은 근호 밖에서 곱해져요.</div>
                <div>
                  • <MathText text="√64 = 8" />이므로 6.3 × 8을 계산해 보세요.
                </div>
                <div>• 음수의 제곱근은 실수가 아닙니다. 근호 안 1013 − x가 0 이상이어야 해요.</div>
              </HintBox>
            )}
            <ReasonInput id="l8-op-reason" theme="rose" label="③ 그렇게 생각한 이유를 써 보세요." value={state.opReason} onChange={(v) => setField('opReason', v)} min={L8_MIN_REASON} />
            <FeedbackBanner fb={feedback.open} />
            <VerifyButton theme="rose" onClick={() => verify('open', 'openVerified', validateL8Open)}>
              [생각 열기] 정답 확인하기
            </VerifyButton>
          </div>

          {state.openVerified ? (
            <div className="rounded-2xl border-2 border-rose-500/70 bg-gradient-to-br from-rose-50/80 via-white to-sky-50/50 p-5 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-rose-900">
                  <BookOpen className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>핵심 개념 · 무리식</span>
                </div>
                <ToggleButton on={!!imgs.def} onClick={() => toggleImg('def')} onLabel="교과서 그림 닫기" offLabel="교과서 그림 보기" />
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-800 leading-relaxed list-disc pl-5">
                <li>
                  근호 안에 문자가 포함되어 있는 식 중에서 유리식으로 나타낼 수 없는 식을 <strong className="text-rose-800">무리식</strong>이라고 합니다. 예:{' '}
                  <MathText text="√(2x),  x + √(x − 1),  √(3 − x²)" />
                </li>
                <li>
                  무리식의 값이 실수가 되려면 <strong>(근호 안에 있는 식의 값) ≥ 0</strong>이어야 하므로, 무리식은 이 범위에서만 생각합니다.
                </li>
                <li>
                  분모에 무리식이 있으면 분모가 0이 될 수 없으므로 <strong>(근호 안) &gt; 0</strong>이어야 합니다.
                </li>
                <li>
                  근호 안이 완전제곱식이면 유리식으로 나타낼 수 있으므로 무리식이 아닙니다. 예: <MathText text="√((x + 1)²) = |x + 1|" />
                </li>
              </ul>
              {imgs.def && (
                <div className="space-y-2">
                  <TextbookImage file="image_l8_def.png" alt="무리식의 뜻과 (근호 안에 있는 식의 값) ≥ 0" maxH="max-h-[300px]" />
                  <TextbookImage file="image_l8_note_square.png" alt="근호 안에 있는 식이 완전제곱식이면 유리식으로 나타낼 수 있으므로 무리식이 아니다." maxH="max-h-[160px]" />
                </div>
              )}
              <TextbookImage
                file="image_l8_bogi1.png"
                alt="보기 - ① √(x+2) − 1의 값이 실수가 되려면 x + 2 ≥ 0, 즉 x ≥ −2 ② 3/√(x−1)의 값이 실수가 되려면 분모가 0이 아니어야 하므로 x − 1 > 0, 즉 x > 1"
                maxH="max-h-[220px]"
              />
            </div>
          ) : (
            <LockedNote>[생각 열기] 정답을 확인하면 핵심 개념(무리식의 뜻과 근호 안의 조건)이 열립니다.</LockedNote>
          )}

          <NavRow onNext={() => goSection('p1')} nextLabel="다음 단계: 문제 1 · 무리식의 값" />
        </div>
      )}

      {/* =====================================================================
          2단계: [문제 1] 무리식의 값이 실수가 되는 x의 범위
      ===================================================================== */}
      {section === 'p1' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <ActivityHeader theme="emerald" kicker="탐구 활동 02 · 교과서" title="[문제 1] 무리식의 값이 실수가 되도록 하는 x의 값의 범위를 구하시오." done={state.p1Verified} />
            <TextbookImage file="image_l8_prob1.png" alt="문제 1 - (1) √(2x − 3) + 1 (2) x/√(4 − x)의 값이 실수가 되도록 하는 x의 값의 범위를 구하시오." maxH="max-h-[130px]" />
            <p className="text-[11px] sm:text-xs text-slate-500">
              ✏️ 입력 방법: 부등호 버튼을 하나 고르고, 오른쪽 칸에 숫자를 씁니다. 분수는 <span className="mono">3/2</span>, 음수는 <span className="mono">-4</span>처럼 써요.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  (1) <MathText text="√(2x − 3) + 1" />
                </div>
                <IneqInput id="l8-p1-1" v="x" value={state.p1a} onChange={(v) => setField('p1a', v)} />
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2">
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  (2) <IrrExpr raw="x/√(4-x)" />
                </div>
                <IneqInput id="l8-p1-2" v="x" value={state.p1b} onChange={(v) => setField('p1b', v)} />
              </div>
            </div>
            <div className="flex justify-end">
              <HintToggle open={!!hints.p1} onClick={() => toggleHint('p1')} />
            </div>
            {hints.p1 && (
              <HintBox>
                <div>• (1) 근호 안의 식이 0 이상: 2x − 3 ≥ 0</div>
                <div>• (2) 근호가 분모에 있으면 0이 되면 안 돼요: 4 − x &gt; 0 (교과서 [보기] ②와 같은 경우)</div>
              </HintBox>
            )}
            <FeedbackBanner fb={feedback.p1} />
            <VerifyButton theme="emerald" onClick={() => verify('p1', 'p1Verified', validateL8Prob1)}>
              [문제 1] 정답 확인하기
            </VerifyButton>
          </div>
          <NavRow onPrev={() => goSection('open')} onNext={() => goSection('calc')} nextLabel="다음 단계: 무리식의 계산" />
        </div>
      )}

      {/* =====================================================================
          3단계: 무리식의 계산 — 예제 1, [문제 2]
      ===================================================================== */}
      {section === 'calc' && (
        <div className="space-y-6">
          <div className="rounded-2xl border-2 border-sky-600/70 bg-gradient-to-br from-sky-50/80 via-white to-violet-50/50 p-5 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-sky-900">
                <BookOpen className="h-4 w-4 text-sky-600 shrink-0" />
                <span>무리식의 계산 · 제곱근의 성질</span>
              </div>
              <ToggleButton on={!!imgs.roots} onClick={() => toggleImg('roots')} onLabel="교과서 그림 닫기" offLabel="교과서 그림 보기" />
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
              무리식의 계산은 무리수의 계산과 같은 방법으로 합니다. 특히 분모가 무리식이면 <strong>분모를 유리화</strong>하여 간단히 할 수 있어요.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-800">
              {[
                ['(1)', '√(a²) = |a|,  (√a)² = a'],
                ['(2) a > 0, b > 0일 때', '√a√b = √(ab),  √(a²b) = a√b'],
                ['', '√a/√b = √(a/b),  √(a/b²) = √a/b'],
                ['분모의 유리화', '(A + B)(A − B) = A² − B²'],
              ].map(([t, body], i) => (
                <div key={i} className="rounded-xl border border-sky-200 bg-white px-3 py-2">
                  {t && <div className="text-[11px] font-extrabold text-sky-700">{t}</div>}
                  <div className="font-bold">
                    <MathText text={body} />
                  </div>
                </div>
              ))}
            </div>
            {imgs.roots && <TextbookImage file="image_l8_note_roots.png" alt="무리식을 계산할 때는 제곱근의 성질을 이용한다. 분모에 근호가 있으면 (A+B)(A−B)=A²−B²을 이용하여 분모를 유리화한다." maxH="max-h-[380px]" />}
            <p className="text-[11px] sm:text-xs text-slate-500">
              ✏️ 입력 방법: <strong>√( )</strong> 버튼을 누르면 근호가 들어가요(또는 <span className="mono">sqrt(x+1)</span>). 분수는 <span className="mono">(식)/2</span>처럼 괄호로 묶어
              씁니다. 칸 아래 미리보기로 모양을 확인하세요.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <ActivityHeader
              theme="sky"
              kicker="탐구 활동 03-A · 교과서 예제 1을 문제로"
              title="다음 식을 간단히 하시오."
              done={state.ex1Verified}
              extra={
                <>
                  <ToggleButton on={!!imgs.ex1} onClick={() => toggleImg('ex1')} onLabel="교과서 풀이 닫기" offLabel="교과서 풀이 보기" />
                  {padButton('ex1')}
                </>
              }
            />
            {imgs.ex1 && (
              <TextbookImage
                file="image_l8_ex1.png"
                alt="교과서 예제 1 풀이 - (1) (√(x+1)+2)(√(x+1)−2) = x − 3 (2) 1/(√(x+2)+√x) = (√(x+2)−√x)/2"
                maxH="max-h-[420px]"
              />
            )}
            {calcInputs(L8_EX1, ['ex1a', 'ex1b'], 'l8-ex1', 'sky')}
            <div className="flex justify-end">
              <HintToggle open={!!hints.ex1} onClick={() => toggleHint('ex1')} />
            </div>
            {hints.ex1 && (
              <HintBox>
                {L8_EX1.map((it, i) => (
                  <div key={it.label}>
                    • ({i + 1}) <MathText text={it.hint} />
                  </div>
                ))}
              </HintBox>
            )}
            <FeedbackBanner fb={feedback.ex1} />
            <VerifyButton theme="sky" onClick={() => verify('ex1', 'ex1Verified', validateL8Ex1)}>
              [예제 1] 정답 확인하기
            </VerifyButton>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <ActivityHeader theme="sky" kicker="탐구 활동 03-B · 교과서" title="[문제 2] 다음 식을 간단히 하시오." done={state.p2Verified} extra={padButton('p2')} />
            <TextbookImage file="image_l8_prob2.png" alt="문제 2 - (1) (√(x+3)+√x)(√(x+3)−√x) (2) 2/(√(x+1)−√(x−1))을 간단히 하시오." maxH="max-h-[130px]" />
            {calcInputs(L8_P2, ['p2a', 'p2b'], 'l8-p2', 'sky')}
            <ReasonInput id="l8-p2-reason" theme="sky" label="(2)에서 분모를 유리화한 방법을 써 보세요." value={state.p2Reason} onChange={(v) => setField('p2Reason', v)} min={L8_MIN_REASON} />
            <div className="flex justify-end">
              <HintToggle open={!!hints.p2} onClick={() => toggleHint('p2')} />
            </div>
            {hints.p2 && (
              <HintBox>
                {L8_P2.map((it, i) => (
                  <div key={it.label}>
                    • ({i + 1}) <MathText text={it.hint} />
                  </div>
                ))}
              </HintBox>
            )}
            <FeedbackBanner fb={feedback.p2} />
            <VerifyButton theme="sky" onClick={() => verify('p2', 'p2Verified', validateL8Prob2)}>
              [문제 2] 정답 확인하기
            </VerifyButton>
          </div>

          <NavRow onPrev={() => goSection('p1')} onNext={() => goSection('domain')} nextLabel="다음 단계: 무리함수와 정의역" />
        </div>
      )}

      {/* =====================================================================
          4단계: 무리함수와 정의역 — [보기], [문제 3], [읽기 자료]
      ===================================================================== */}
      {section === 'domain' && (
        <div className="space-y-6">
          <div className="rounded-2xl border-2 border-emerald-600/70 bg-gradient-to-br from-emerald-50/80 via-white to-sky-50/50 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-emerald-900">
              <BookOpen className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>핵심 개념 · 무리함수</span>
            </div>
            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-800 leading-relaxed list-disc pl-5">
              <li>
                함수 <MathText text="y = f(x)" />에서 <MathText text="f(x)" />가 x에 대한 무리식일 때, 이 함수를 <strong className="text-emerald-800">무리함수</strong>라고 합니다. 예:{' '}
                <MathText text="y = √(x + 3),  y = √(−x + 2) + 1" />
              </li>
              <li>
                정의역이 주어져 있지 않으면 <strong>근호 안에 있는 식의 값이 0 이상</strong>이 되도록 하는 실수 전체의 집합을 정의역으로 합니다.
              </li>
            </ul>
            <TextbookImage file="image_l8_bogi2.png" alt="보기 - 무리함수 y = √(−x+2) + 1의 정의역은 {x | −x + 2 ≥ 0}, 즉 {x | x ≤ 2}" maxH="max-h-[80px]" />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <ActivityHeader theme="emerald" kicker="탐구 활동 04 · 교과서" title="[문제 3] 다음 함수의 정의역을 구하시오." done={state.p3Verified} />
            <TextbookImage file="image_l8_prob3.png" alt="문제 3 - (1) y = −√(x+4) (2) y = √(5−2x) − 1의 정의역을 구하시오." maxH="max-h-[110px]" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  ['(1)', 'y = −√(x + 4)', 'p3a'],
                  ['(2)', 'y = √(5 − 2x) − 1', 'p3b'],
                ] as const
              ).map(([tag, label, key]) => (
                <div key={key} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2">
                  <div className="text-sm font-bold text-slate-900">
                    {tag} <MathText text={label} />
                  </div>
                  <IneqInput id={`l8-${key}`} v="x" value={state[key]} onChange={(v) => setField(key, v)} label="정의역 {x | ______ }" />
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <HintToggle open={!!hints.p3} onClick={() => toggleHint('p3')} />
            </div>
            {hints.p3 && (
              <HintBox>
                <div>• 근호 앞의 −나 근호 밖에서 더한 수는 정의역과 상관없어요. 근호 안만 보세요.</div>
                <div>• (2) 5 − 2x ≥ 0 → −2x ≥ −5 → 양변을 −2로 나누면 부등호 방향이 바뀌어요.</div>
              </HintBox>
            )}
            <FeedbackBanner fb={feedback.p3} />
            <VerifyButton theme="emerald" onClick={() => verify('p3', 'p3Verified', validateL8Prob3)}>
              [문제 3] 정답 확인하기
            </VerifyButton>
          </div>

          <div className="rounded-2xl border border-lime-300 bg-lime-50/40 p-5 sm:p-6 space-y-4">
            <ActivityHeader
              theme="teal"
              kicker="교과서 [읽기 자료]"
              title="실생활 속의 무리함수 계산기"
              extra={<ToggleButton on={!!imgs.reading} onClick={() => toggleImg('reading')} onLabel="읽기 자료 닫기" offLabel="읽기 자료 보기" />}
            />
            {imgs.reading && (
              <TextbookImage
                file="image_l8_reading.png"
                alt="읽기 자료 - 소방 호스 물의 속력 √(928x) m/s, 지진 해일의 속력 √(9.8x) m/s, 키 120 cm 소아의 겉넓이 √(0.03x) m²"
                maxH="max-h-[420px]"
              />
            )}
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="읽기 자료 고르기">
              {L8_READING.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  role="tab"
                  aria-selected={readingKey === r.key}
                  onClick={() => setReadingKey(r.key)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${readingKey === r.key ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                  {r.title}
                </button>
              ))}
            </div>
            <div className="rounded-xl border border-teal-200 bg-white p-4 space-y-2.5">
              <div className="text-sm font-bold text-slate-900">
                {reading.yLabel} = <MathText text={`√(${reading.k}x)`} /> {reading.yUnit}{' '}
                <span className="text-[11px] font-semibold text-slate-500">
                  (x = {reading.xLabel}, {reading.xUnit})
                </span>
              </div>
              <label htmlFor="l8-reading-x" className="block text-xs font-bold text-slate-700">
                {reading.xLabel} x = <span className="text-teal-700">{readingX[reading.key]}</span> {reading.xUnit}
              </label>
              <input
                id="l8-reading-x"
                type="range"
                min={reading.min}
                max={reading.max}
                step={reading.step}
                value={readingX[reading.key] ?? reading.init}
                onChange={(e) => setReadingX((prev) => ({ ...prev, [reading.key]: Number(e.target.value) }))}
                className="w-full accent-teal-600"
              />
              <div role="status" className="rounded-lg bg-teal-50 border border-teal-200 px-3 py-2 text-xs sm:text-sm font-bold text-teal-950">
                <MathText text={`√(${reading.k} × ${readingX[reading.key]})`} /> ≈ {readingVal.toFixed(readingVal < 10 ? 2 : 1)} {reading.yUnit}
              </div>
              <p className="text-[11px] text-slate-500">💡 x가 음수일 수 없는 양(압력·수심·몸무게)이라 정의역도 자연스럽게 x ≥ 0이 돼요.</p>
            </div>
          </div>

          <NavRow onPrev={() => goSection('calc')} onNext={() => goSection('graph')} nextLabel="다음 단계: y = √ax의 그래프" />
        </div>
      )}

      {/* =====================================================================
          5단계: y = √ax, y = −√ax의 그래프 — 함께 탐구, [문제 4], [문제 5]
      ===================================================================== */}
      {section === 'graph' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <ActivityHeader
              theme="violet"
              kicker="탐구 활동 05-A · 함께 탐구"
              title={
                <span>
                  역함수를 이용하여 <MathText text="y = √x" />의 그래프 그리기
                </span>
              }
              done={state.sqVerified}
              extra={<ToggleButton on={!!imgs.inv} onClick={() => toggleImg('inv')} onLabel="교과서 그림 닫기" offLabel="교과서 그림 보기" />}
            />
            {imgs.inv && (
              <TextbookImage
                file="image_l8_sqrt_inverse.png"
                alt="y = √x는 정의역이 {x | x ≥ 0}이고 치역이 {y | y ≥ 0}인 일대일함수이므로 역함수 y = x² (x ≥ 0)를 구할 수 있고, 두 그래프는 직선 y = x에 대하여 대칭이다."
                maxH="max-h-[320px]"
              />
            )}
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] gap-4 items-start">
              <div className="rounded-xl border border-slate-200 bg-white p-2 space-y-2">
                <IrrationalGraph
                  range={4}
                  curves={[
                    { f: (x) => x * x, domain: [0, 3], color: '#475569', width: 2 },
                    ...(invStep >= 2 ? [{ f: (x: number) => x, color: '#a3a3a3', dashed: true, width: 1.6 } as IrrCurve] : []),
                    ...(invStep >= 3 ? [{ fn: { s: 1, a: 1, p: 0, q: 0 } as IrrFn, color: IRR_COLORS.main }] : []),
                  ]}
                  points={invStep >= 3 ? [{ x: 1, y: 1, color: '#7c3aed', label: '(1, 1)' }] : []}
                  ariaLabel="y = x² (x ≥ 0)와 직선 y = x, y = √x의 그래프"
                />
                <IrrLegend
                  items={[
                    { color: '#475569', label: 'y = x² (x ≥ 0)' },
                    ...(invStep >= 2 ? [{ color: '#a3a3a3', label: 'y = x', dashed: true }] : []),
                    ...(invStep >= 3 ? [{ color: IRR_COLORS.main, label: 'y = √x' }] : []),
                  ]}
                />
              </div>
              <div className="space-y-2">
                {(
                  [
                    [1, '① y = x² (x ≥ 0) 그리기', 'y = √x에서 x에 대하여 풀면 x = y² (y ≥ 0), x와 y를 바꾸면 y = x² (x ≥ 0)'],
                    [2, '② 직선 y = x 긋기', '함수와 역함수의 그래프는 y = x에 대하여 대칭'],
                    [3, '③ y = x에 대하여 접기 → y = √x', '정의역 {x | x ≥ 0}, 치역 {y | y ≥ 0}'],
                  ] as const
                ).map(([n, title, note]) => (
                  <button
                    key={n}
                    type="button"
                    aria-pressed={invStep === n}
                    onClick={() => setInvStep(n)}
                    className={`w-full rounded-xl border px-3 py-2 text-left transition-all ${invStep === n ? THEME.violet.picked : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                  >
                    <div className="text-xs sm:text-sm font-extrabold">
                      <MathText text={title} />
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      <MathText text={note} />
                    </div>
                  </button>
                ))}
                <p className="text-[11px] text-slate-500">
                  💡 <MathText text="y = √x" />의 치역 {'{y | y ≥ 0}'}을 공역으로 정하면 일대일대응이 되어 역함수를 가져요.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] gap-4 items-start border-t border-slate-100 pt-4">
              <div className="rounded-xl border border-slate-200 bg-white p-2 space-y-2">
                <IrrationalGraph
                  range={4}
                  curves={[
                    { fn: { s: 1, a: aNeg ? -1 : 1, p: 0, q: 0 }, color: IRR_COLORS.base, dashed: true, width: 1.6 },
                    { fn: aFn, color: IRR_COLORS.main },
                  ]}
                  points={[{ x: aNeg ? -1 : 1, y: Math.sqrt(Math.abs(aVal)), color: '#ea580c', label: `(${aNeg ? '−1' : '1'}, √${aText(Math.abs(aVal))})` }]}
                  ariaLabel={`${irrLabel(aFn)}의 그래프와 비교용 그래프`}
                />
                <IrrLegend
                  items={[
                    { color: IRR_COLORS.base, label: aNeg ? 'y = √(−x) (비교)' : 'y = √x (비교)', dashed: true },
                    { color: IRR_COLORS.main, label: irrLabel(aFn) },
                  ]}
                />
              </div>
              <div className="space-y-3">
                <div className="text-sm font-bold text-slate-800">
                  <MathText text="y = √(ax)" />에서 a를 바꾸어 보세요. a = <span className="text-rose-600">{aText(aFn.a)}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {A_VALUES.map((a) => {
                    const on = aFn.a === a;
                    return (
                      <button
                        key={a}
                        type="button"
                        aria-pressed={on}
                        onClick={() => {
                          setANeg(a < 0);
                          setAVal(Math.abs(a));
                        }}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${on ? 'border-violet-600 bg-violet-50 text-violet-900' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                      >
                        a = {aText(a)}
                      </button>
                    );
                  })}
                </div>
                <div role="status" className="rounded-xl border border-violet-200 bg-violet-50 px-3.5 py-2.5 text-xs sm:text-sm text-violet-950 space-y-1 font-semibold">
                  <div>
                    정의역 {aFn.a > 0 ? '{x | x ≥ 0}' : '{x | x ≤ 0}'}, 치역 {'{y | y ≥ 0}'}
                  </div>
                  <div>
                    지나는 점 ({aNeg ? '−1' : '1'}, <MathText text={`√${aText(Math.abs(aVal))}`} />)
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div className="space-y-2">
                <div className="text-xs sm:text-sm font-bold text-slate-900">
                  ① <MathText text="y = √x" />의 정의역은?
                </div>
                <ChoiceButtons
                  theme="violet"
                  value={state.sqDomain}
                  cols="sm:grid-cols-3"
                  options={[
                    ['ge', '{x | x ≥ 0}'],
                    ['le', '{x | x ≤ 0}'],
                    ['all', '실수 전체'],
                  ] as const}
                  onPick={(v) => setField('sqDomain', v)}
                />
              </div>
              <div className="space-y-2">
                <div className="text-xs sm:text-sm font-bold text-slate-900">
                  ① <MathText text="y = √x" />의 치역은?
                </div>
                <ChoiceButtons
                  theme="violet"
                  value={state.sqRange}
                  cols="sm:grid-cols-3"
                  options={[
                    ['ge', '{y | y ≥ 0}'],
                    ['le', '{y | y ≤ 0}'],
                    ['all', '실수 전체'],
                  ] as const}
                  onPick={(v) => setField('sqRange', v)}
                />
              </div>
              <div className="space-y-2">
                <div className="text-xs sm:text-sm font-bold text-slate-900">
                  ② |a|가 커질수록 <MathText text="y = √(ax)" />의 그래프는?
                </div>
                <ChoiceButtons
                  theme="violet"
                  value={state.sqTrend}
                  cols="sm:grid-cols-3"
                  options={[
                    ['far', 'x축에서 멀어진다'],
                    ['near', 'x축에 가까워진다'],
                    ['same', '변하지 않는다'],
                  ] as const}
                  onPick={(v) => setField('sqTrend', v)}
                />
              </div>
              <div className="flex justify-end">
                <HintToggle open={!!hints.sq} onClick={() => toggleHint('sq')} />
              </div>
              {hints.sq && (
                <HintBox>
                  <div>• 역함수 y = x² (x ≥ 0)의 정의역과 치역을 서로 바꾸면 y = √x의 치역과 정의역이 돼요.</div>
                  <div>
                    • a = 1, 2, 3일 때 지나는 점 (1, √1), (1, √2), (1, √3)의 높이를 비교해 보세요.
                  </div>
                </HintBox>
              )}
              <FeedbackBanner fb={feedback.sq} />
              <VerifyButton theme="violet" onClick={() => verify('sq', 'sqVerified', validateL8Sqrt)}>
                [함께 탐구] 정답 확인하기
              </VerifyButton>
            </div>
          </div>

          {state.sqVerified ? (
            <div className="rounded-2xl border-2 border-violet-600/70 bg-gradient-to-br from-violet-50/80 via-white to-sky-50/50 p-5 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-violet-900">
                  <BookOpen className="h-4 w-4 text-violet-600 shrink-0" />
                  <span>
                    정리 · 무리함수 <MathText text="y = √(ax) (a ≠ 0)" />의 그래프
                  </span>
                </div>
                <ToggleButton on={!!imgs.ax} onClick={() => toggleImg('ax')} onLabel="교과서 그림 닫기" offLabel="교과서 그림 보기" />
              </div>
              <ol className="space-y-1.5 text-xs sm:text-sm text-slate-800 leading-relaxed list-decimal pl-5">
                <li>
                  <strong>a &gt; 0</strong>일 때 정의역은 {'{x | x ≥ 0}'}, <strong>a &lt; 0</strong>일 때 정의역은 {'{x | x ≤ 0}'}이고, 치역은 {'{y | y ≥ 0}'}이다.
                </li>
                <li>
                  함수 <MathText text="y = x²/a (x ≥ 0)" />의 그래프와 직선 y = x에 대하여 대칭이다.
                </li>
                <li>|a|가 커질수록 그래프는 x축으로부터 멀어진다.</li>
              </ol>
              {imgs.ax && (
                <div className="space-y-2">
                  <TextbookImage file="image_l8_sqrt_ax.png" alt="a > 0, a < 0일 때 y = √ax의 그래프" maxH="max-h-[260px]" />
                  <TextbookImage file="image_l8_sqrt_family.png" alt="a = ±1, ±2, ±3일 때 y = √ax의 그래프" maxH="max-h-[240px]" />
                  <TextbookImage file="image_l8_summary1.png" alt="정리 - 무리함수 y = √ax (a ≠ 0)의 그래프" maxH="max-h-[200px]" />
                </div>
              )}
            </div>
          ) : (
            <LockedNote>[함께 탐구] 정답을 확인하면 y = √ax 그래프의 정리가 열립니다.</LockedNote>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <ActivityHeader
              theme="emerald"
              kicker="탐구 활동 05-B · 교과서"
              title={
                <span>
                  [문제 4] <MathText text="y = √x" />의 그래프를 대칭이동하여 그리기
                </span>
              }
              done={state.p4Verified}
            />
            <TextbookImage file="image_l8_prob4.png" alt="문제 4 - 함수 y = √x의 그래프를 대칭이동하여 (1) y = −√x (2) y = √(−x) (3) y = −√(−x)의 그래프를 그리시오." maxH="max-h-[220px]" />
            <p className="text-xs text-slate-600">그래프를 그리기 전에 어느 축(점)에 대하여 대칭이동하는지와 그래프가 있는 사분면을 골라 보세요.</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {L8_P4.map((it, i) => (
                <div key={it.label} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2.5">
                  <div className="text-sm font-bold text-slate-900">
                    ({i + 1}) <MathText text={it.label} />
                  </div>
                  <div className="text-[11px] font-bold text-slate-600">y = √x를 무엇에 대하여 대칭이동?</div>
                  <ChoiceButtons
                    theme="emerald"
                    value={state[L8_P4_SYM_KEYS[i]]}
                    cols="grid-cols-3"
                    options={[
                      ['x', 'x축'],
                      ['y', 'y축'],
                      ['o', '원점'],
                    ] as const}
                    onPick={(v) => setField(L8_P4_SYM_KEYS[i], v as Symmetry)}
                  />
                  <div className="text-[11px] font-bold text-slate-600">그래프가 있는 사분면</div>
                  <ChoiceButtons
                    theme="emerald"
                    value={state[L8_P4_QUAD_KEYS[i]]}
                    cols="grid-cols-4"
                    options={[
                      ['1', '제1'],
                      ['2', '제2'],
                      ['3', '제3'],
                      ['4', '제4'],
                    ] as const}
                    onPick={(v) => setField(L8_P4_QUAD_KEYS[i], v as Quadrant)}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <HintToggle open={!!hints.p4} onClick={() => toggleHint('p4')} />
            </div>
            {hints.p4 && (
              <HintBox>
                <div>• y = f(x)의 그래프와 y = −f(x)의 그래프는 x축에 대하여 대칭이에요.</div>
                <div>• x 대신 −x를 넣으면 y축 대칭, x와 y 둘 다 부호를 바꾸면 원점 대칭이에요.</div>
              </HintBox>
            )}
            <FeedbackBanner fb={feedback.p4} />
            <VerifyButton theme="emerald" onClick={() => verify('p4', 'p4Verified', validateL8Prob4)}>
              [문제 4] 정답 확인하기
            </VerifyButton>
            {graphReveal(
              'p4',
              state.p4Verified,
              [
                {
                  key: 'p4-all',
                  title: '(1)·(2)·(3)과 y = √x',
                  range: 5,
                  curves: [
                    { fn: { s: 1, a: 1, p: 0, q: 0 }, color: IRR_COLORS.base, dashed: true, width: 1.8 },
                    { fn: L8_P4[0].fn, color: IRR_COLORS.main },
                    { fn: L8_P4[1].fn, color: IRR_COLORS.alt },
                    { fn: L8_P4[2].fn, color: IRR_COLORS.third },
                  ],
                  legend: [
                    { color: IRR_COLORS.base, label: 'y = √x', dashed: true },
                    { color: IRR_COLORS.main, label: '(1) y = −√x' },
                    { color: IRR_COLORS.alt, label: '(2) y = √(−x)' },
                    { color: IRR_COLORS.third, label: '(3) y = −√(−x)' },
                  ],
                  ariaLabel: 'y = √x, y = −√x, y = √(−x), y = −√(−x)의 그래프',
                },
              ],
              '네 그래프가 x축, y축, 원점에 대하여 서로 대칭인지 확인해 보세요.'
            )}
          </div>

          {state.p4Verified ? (
            <div className="rounded-2xl border-2 border-emerald-600/70 bg-gradient-to-br from-emerald-50/80 via-white to-sky-50/50 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-emerald-900">
                <BookOpen className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  <MathText text="y = −√(ax) (a ≠ 0)" />의 그래프
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                함수 <MathText text="y = −√(ax)" />의 그래프는 <MathText text="y = √(ax)" />의 그래프와 <strong>x축에 대하여 대칭</strong>입니다. 정의역은 a의 부호로 정해지고(a &gt; 0이면 x ≥ 0, a &lt; 0이면 x ≤
                0), 치역은 {'{y | y ≤ 0}'}이에요.
              </p>
              <TextbookImage file="image_l8_neg.png" alt="함수 y = −√ax의 그래프는 y = √ax의 그래프와 x축에 대하여 대칭이므로 a의 부호에 따라 그림과 같다." maxH="max-h-[260px]" />
            </div>
          ) : (
            <LockedNote>[문제 4] 정답을 확인하면 y = −√ax의 그래프 설명이 열립니다.</LockedNote>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <ActivityHeader theme="violet" kicker="탐구 활동 05-C · 교과서" title="[문제 5] 다음 함수의 그래프를 그리고, 정의역과 치역을 구하시오." done={state.p5Verified} />
            <TextbookImage file="image_l8_prob5.png" alt="문제 5 - (1) y = √5x (2) y = √(−4x) (3) y = −√2x (4) y = −√(−3x)의 그래프를 그리고 정의역과 치역을 구하시오." maxH="max-h-[120px]" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {L8_P5.map((it, i) => (
                <div key={it.label} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2">
                  <div className="text-sm font-bold text-slate-900">
                    ({i + 1}) <MathText text={it.label} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-slate-600">정의역</div>
                      <ChoiceButtons
                        theme="violet"
                        value={state[L8_P5_DOMAIN_KEYS[i]]}
                        cols="grid-cols-1"
                        options={[
                          ['ge', '{x | x ≥ 0}'],
                          ['le', '{x | x ≤ 0}'],
                        ] as const}
                        onPick={(v) => setField(L8_P5_DOMAIN_KEYS[i], v as SignChoice)}
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-slate-600">치역</div>
                      <ChoiceButtons
                        theme="violet"
                        value={state[L8_P5_RANGE_KEYS[i]]}
                        cols="grid-cols-1"
                        options={[
                          ['ge', '{y | y ≥ 0}'],
                          ['le', '{y | y ≤ 0}'],
                        ] as const}
                        onPick={(v) => setField(L8_P5_RANGE_KEYS[i], v as SignChoice)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <HintToggle open={!!hints.p5} onClick={() => toggleHint('p5')} />
            </div>
            {hints.p5 && (
              <HintBox>
                <div>• 정의역: 근호 안의 x의 계수 a가 양수면 x ≥ 0, 음수면 x ≤ 0</div>
                <div>• 치역: 근호 앞에 −가 없으면 y ≥ 0, 있으면 y ≤ 0</div>
              </HintBox>
            )}
            <FeedbackBanner fb={feedback.p5} />
            <VerifyButton theme="violet" onClick={() => verify('p5', 'p5Verified', validateL8Prob5)}>
              [문제 5] 정답 확인하기
            </VerifyButton>
            {graphReveal(
              'p5',
              state.p5Verified,
              L8_P5.map((it, i) => irrPanel(`p5-${i}`, `(${i + 1})`, it.fn, it.label, 5)),
              '정의역은 a의 부호에 따라, 치역은 근호 앞의 부호에 따라 정해지는지 확인해 보세요.'
            )}
          </div>

          <NavRow onPrev={() => goSection('domain')} onNext={() => goSection('reflect8')} nextLabel="다음 단계: 성찰" />
        </div>
      )}

      {/* =====================================================================
          8차시 6단계: 성찰 (2026-11-13 두 차시로 나누며 추가)
      ===================================================================== */}
      {section === 'reflect8' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-extrabold text-rose-600">8차시 마무리 성찰</span>
                <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">무리식과 무리함수 정리하기</h4>
              </div>
              <HintToggle open={!!hints.reflection} onClick={() => toggleHint('reflection')} label="💡 성찰 힌트 보기" />
            </div>
            {hints.reflection && (
              <HintBox>
                <div>
                  • <strong>성찰 1 예시</strong>: “무리식의 값이 실수가 되려면 근호 안이 0 이상이어야 하고, 분모에 있으면 0보다 커야 한다. 무리함수의 정의역은 이 조건으로 구한다.”
                </div>
                <div>
                  • <strong>성찰 2 예시</strong>: “y = √x의 그래프가 y = x²(x ≥ 0)의 그래프와 y = x에 대하여 대칭이라는 것을 알았다.”
                </div>
              </HintBox>
            )}
            <HelpSourcePicker idPrefix="l8" value={state.ieHelpSource} onChange={(v) => onUpdate((prev) => ({ ...prev, ieHelpSource: v }))} />
            <ReasonInput
              id="l8-reflection1"
              theme="rose"
              label="1. 무리식의 값이 실수가 되는 조건과 무리함수의 정의역을 구하는 방법을 정리해 보세요."
              value={state.ieReflection1}
              onChange={(v) => onUpdate((prev) => ({ ...prev, ieReflection1: v }))}
              min={L8_MIN_REFLECTION}
            />
            <ReasonInput
              id="l8-reflection2"
              theme="rose"
              label="2. 오늘 새롭게 알게 된 점이나 어려웠던 점을 적어 보세요."
              value={state.ieReflection2}
              onChange={(v) => onUpdate((prev) => ({ ...prev, ieReflection2: v }))}
              min={L8_MIN_REFLECTION}
            />
            <div className="pt-3 border-t border-slate-100">
              <NavRow onPrev={() => goSection('graph')} onNext={onGoToLesson9} nextLabel="다음 차시: 09차시로 이동" />
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          6단계: y = √(a(x − p)) + q — 평행이동 실험실, 정리, [보기], [문제 6]
      ===================================================================== */}
      {section === 'shift' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <ActivityHeader
              theme="violet"
              kicker="탐구 활동 06-A · 평행이동 실험실"
              title={
                <span>
                  <MathText text="y = √(a(x − p)) + q" />의 그래프
                </span>
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] gap-4 items-start">
              <div className="rounded-xl border border-slate-200 bg-white p-2 space-y-2">
                <IrrationalGraph
                  range={7}
                  curves={[
                    { fn: shiftBase, color: IRR_COLORS.base, dashed: true, width: 1.8 },
                    { fn: shiftFn, color: IRR_COLORS.main, start: true },
                  ]}
                  points={[{ x: 0, y: 0, color: IRR_COLORS.base }]}
                  ariaLabel={`${irrLabel(shiftBase)}와 ${irrLabel(shiftFn)}의 그래프, 시작점 (${sp}, ${sq})`}
                />
                <IrrLegend
                  items={[
                    { color: IRR_COLORS.base, label: irrLabel(shiftBase), dashed: true },
                    { color: IRR_COLORS.main, label: irrLabel(shiftFn) },
                  ]}
                />
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="text-sm font-bold text-slate-800">근호 앞의 부호</div>
                  <div className="flex gap-1.5">
                    {(
                      [
                        [1, '+ (없음)'],
                        [-1, '−'],
                      ] as const
                    ).map(([v, t]) => (
                      <button
                        key={v}
                        type="button"
                        aria-pressed={ss === v}
                        onClick={() => setSs(v)}
                        className={`rounded-lg border px-3 py-1 text-xs font-bold ${ss === v ? 'border-violet-600 bg-violet-50 text-violet-900' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                {(
                  [
                    ['a', sa, setSa, SHIFT_A, '(a ≠ 0)'],
                    ['p', sp, setSp, SHIFT_PQ, 'x축 방향 평행이동'],
                    ['q', sq, setSq, SHIFT_PQ, 'y축 방향 평행이동'],
                  ] as const
                ).map(([name, val, set, options, note]) => (
                  <div key={name} className="space-y-1">
                    <label htmlFor={`l8-s${name}`} className="block text-sm font-bold text-slate-800">
                      <i>{name}</i> = <span className="text-rose-600">{val}</span>
                      <span className="ml-2 text-[11px] font-semibold text-slate-500">{note}</span>
                    </label>
                    <input
                      id={`l8-s${name}`}
                      type="range"
                      min={0}
                      max={options.length - 1}
                      step={1}
                      value={(options as readonly number[]).indexOf(val)}
                      onChange={(e) => set((options as readonly number[])[Number(e.target.value)])}
                      className="w-full accent-violet-600"
                    />
                  </div>
                ))}
                <div role="status" className="rounded-xl border border-violet-200 bg-violet-50 px-3.5 py-2.5 text-xs sm:text-sm text-violet-950 space-y-1 font-semibold">
                  <div>
                    <MathText text={irrLabel(shiftFn)} />
                  </div>
                  <div>
                    정의역 {irrDomainText(shiftFn)}, 치역 {irrRangeText(shiftFn)}
                  </div>
                  <div>
                    시작점: 원점 → 점 ({sp}, {sq})
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-violet-600/70 bg-gradient-to-br from-violet-50/80 via-white to-sky-50/50 p-5 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-violet-900">
                <BookOpen className="h-4 w-4 text-violet-600 shrink-0" />
                <span>
                  정리 · 무리함수 <MathText text="y = √(a(x − p)) + q (a ≠ 0)" />의 그래프
                </span>
              </div>
              <ToggleButton on={!!imgs.shift} onClick={() => toggleImg('shift')} onLabel="교과서 그림 닫기" offLabel="교과서 그림 보기" />
            </div>
            <ol className="space-y-1.5 text-xs sm:text-sm text-slate-800 leading-relaxed list-decimal pl-5">
              <li>
                <MathText text="y = √(ax)" />의 그래프를 <strong>x축의 방향으로 p만큼, y축의 방향으로 q만큼</strong> 평행이동한 것이다.
              </li>
              <li>
                <strong>a &gt; 0</strong>일 때 정의역은 {'{x | x ≥ p}'}, <strong>a &lt; 0</strong>일 때 정의역은 {'{x | x ≤ p}'}이고, 치역은 {'{y | y ≥ q}'}이다.
              </li>
              <li>
                근호 앞에 −가 있는 <MathText text="y = −√(a(x − p)) + q" />의 치역은 {'{y | y ≤ q}'}이다.
              </li>
            </ol>
            {imgs.shift && (
              <div className="space-y-2">
                <TextbookImage file="image_l8_shift.png" alt="y = √(a(x−p)) + q의 그래프는 y = √ax의 그래프를 x축 방향으로 p만큼, y축 방향으로 q만큼 평행이동한 것" maxH="max-h-[420px]" />
                <TextbookImage file="image_l8_summary2.png" alt="정리 - 무리함수 y = √(a(x−p)) + q (a ≠ 0)의 그래프" maxH="max-h-[200px]" />
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <ActivityHeader theme="violet" kicker="교과서 [보기]" title={<MathText text="y = √(2(x − 1)) + 3의 그래프" />} />
            <TextbookImage
              file="image_l8_bogi3.png"
              alt="보기 - y = √(2(x−1)) + 3의 그래프는 y = √2x의 그래프를 x축 방향으로 1만큼, y축 방향으로 3만큼 평행이동한 것이고, 정의역은 {x | x ≥ 1}, 치역은 {y | y ≥ 3}"
              maxH="max-h-[240px]"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <ActivityHeader theme="violet" kicker="탐구 활동 06-B · 교과서" title="[문제 6] 다음 함수의 그래프를 그리고, 정의역과 치역을 구하시오." done={state.p6Verified} />
            <TextbookImage file="image_l8_prob6.png" alt="문제 6 - (1) y = √(−(x−5)) + 1 (2) y = −√(5(x+2)) − 1의 그래프를 그리고 정의역과 치역을 구하시오." maxH="max-h-[110px]" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {L8_P6.map((it, i) => {
                const k = L8_P6_KEYS[i];
                return (
                  <div key={it.label} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-3">
                    <div className="text-sm font-bold text-slate-900">
                      ({i + 1}) <MathText text={it.label} />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap text-xs sm:text-sm font-bold text-slate-700">
                      <MathText text={it.base} />의 그래프를 x축 방향으로
                      <SmallInput id={`l8-p6-${i + 1}-p`} label="x축 방향 평행이동" value={state[k.p]} onChange={(v) => setField(k.p, v)} width="w-14" />
                      만큼, y축 방향으로
                      <SmallInput id={`l8-p6-${i + 1}-q`} label="y축 방향 평행이동" value={state[k.q]} onChange={(v) => setField(k.q, v)} width="w-14" />
                      만큼 평행이동
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <IneqInput id={`l8-p6-${i + 1}-d`} v="x" value={state[k.d]} onChange={(v) => setField(k.d, v)} label="정의역 {x | ______ }" />
                      <IneqInput id={`l8-p6-${i + 1}-r`} v="y" value={state[k.r]} onChange={(v) => setField(k.r, v)} label="치역 {y | ______ }" />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end">
              <HintToggle open={!!hints.p6} onClick={() => toggleHint('p6')} />
            </div>
            {hints.p6 && (
              <HintBox>
                <div>• (2) x + 2 = x − (−2)이므로 x축 방향으로 −2만큼 평행이동한 것이에요.</div>
                <div>• 정의역·치역은 시작점 (p, q)에서 그래프가 어느 쪽(오른쪽/왼쪽, 위/아래)으로 뻗는지 보면 됩니다.</div>
              </HintBox>
            )}
            <FeedbackBanner fb={feedback.p6} />
            <VerifyButton theme="violet" onClick={() => verify('p6', 'p6Verified', validateL8Prob6)}>
              [문제 6] 정답 확인하기
            </VerifyButton>
            {graphReveal(
              'p6',
              state.p6Verified,
              L8_P6.map((it, i) => irrPanel(`p6-${i}`, `(${i + 1})`, it.fn, it.label)),
              '회색 점선을 평행이동하면 빨간 그래프가 되는지, 시작점이 (p, q)인지 확인해 보세요.'
            )}
          </div>

          <NavRow onNext={() => goSection('transform')} nextLabel="다음 단계: y = √(ax+b)+c · 문제 7" />
        </div>
      )}

      {/* =====================================================================
          7단계: y = √(ax + b) + c → y = √(a(x − p)) + q — 예제 2, [문제 7]
      ===================================================================== */}
      {section === 'transform' && (
        <div className="space-y-6">
          <div className="rounded-2xl border-2 border-sky-600/70 bg-gradient-to-br from-sky-50/80 via-white to-violet-50/50 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-sky-900">
              <BookOpen className="h-4 w-4 text-sky-600 shrink-0" />
              <span>
                무리함수 <MathText text="y = √(ax + b) + c" />의 그래프
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
              <MathText text="y = √(ax + b) + c (a ≠ 0)" />의 그래프는 근호 안을 x의 계수 a로 묶어 <MathText text="y = √(a(x − p)) + q" />의 꼴로 변형하여 그릴 수 있습니다.{' '}
              <MathText text="√(ax + b) = √(a(x + b/a))" />
            </p>
            <p className="text-[11px] sm:text-xs text-slate-500">
              ✏️ 입력 방법: 근호 앞에 −가 있으면 [−]를 고르고, 틀의 빈칸에 a, p, q를 숫자로 씁니다. x + 4는 x − (−4)이므로 p 칸에 <span className="mono">-4</span>를 써요.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <ActivityHeader
              theme="sky"
              kicker="탐구 활동 07-A · 교과서 예제 2를 문제로"
              title={
                <span>
                  무리함수 <MathText text={L8_EX2.label} />의 그래프를 그리고, 정의역과 치역을 구하시오.
                </span>
              }
              done={state.ex2Verified}
              extra={
                <>
                  <ToggleButton on={!!imgs.ex2} onClick={() => toggleImg('ex2')} onLabel="교과서 풀이 닫기" offLabel="교과서 풀이 보기" />
                  {padButton('ex2')}
                </>
              }
            />
            {imgs.ex2 && (
              <TextbookImage
                file="image_l8_ex2.png"
                alt="교과서 예제 2 풀이 - y = √(2x+8) + 2 = √(2(x+4)) + 2이므로 y = √2x의 그래프를 x축 방향으로 −4만큼, y축 방향으로 2만큼 평행이동, 정의역 {x | x ≥ −4}, 치역 {y | y ≥ 2}"
                maxH="max-h-[420px]"
              />
            )}
            <TransformInput idPrefix="l8-ex2" {...transformFields({ s: 'ex2s', a: 'ex2a', p: 'ex2p', q: 'ex2q', d: 'ex2d', r: 'ex2r' })} />
            <div className="flex justify-end">
              <HintToggle open={!!hints.ex2} onClick={() => toggleHint('ex2')} />
            </div>
            {hints.ex2 && (
              <HintBox>
                <div>• {L8_EX2.hint}</div>
                <div>• 그러면 y = √(2(x + 4)) + 2: a = 2, p = −4, q = 2</div>
              </HintBox>
            )}
            <FeedbackBanner fb={feedback.ex2} />
            <VerifyButton theme="sky" onClick={() => verify('ex2', 'ex2Verified', validateL8Ex2)}>
              [예제 2] 정답 확인하기
            </VerifyButton>
            {graphReveal('ex2', state.ex2Verified, [irrPanel('ex2', undefined, L8_EX2.fn, `${L8_EX2.label} = ${irrLabel(L8_EX2.fn).slice(4)}`)])}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <ActivityHeader theme="sky" kicker="탐구 활동 07-B · 교과서" title="[문제 7] 다음 함수의 그래프를 그리고, 정의역과 치역을 구하시오." done={state.p7Verified} extra={padButton('p7')} />
            <TextbookImage file="image_l8_prob7.png" alt="문제 7 - (1) y = √(−3x+3) − 2 (2) y = −√(−x+4) + 5의 그래프를 그리고 정의역과 치역을 구하시오." maxH="max-h-[110px]" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {L8_P7.map((t: L8Transform, i) => (
                <div key={t.label} className="space-y-2">
                  <div className="text-sm font-bold text-slate-900">
                    ({i + 1}) <MathText text={t.label} />
                  </div>
                  <TransformInput
                    idPrefix={`l8-p7-${i + 1}`}
                    {...transformFields(
                      i === 0
                        ? { s: 'p7_1s', a: 'p7_1a', p: 'p7_1p', q: 'p7_1q', d: 'p7_1d', r: 'p7_1r' }
                        : { s: 'p7_2s', a: 'p7_2a', p: 'p7_2p', q: 'p7_2q', d: 'p7_2d', r: 'p7_2r' }
                    )}
                  />
                </div>
              ))}
            </div>
            <ReasonInput
              id="l8-p7-reason"
              theme="sky"
              label="y = √(ax + b) + c의 그래프를 그리는 방법을 정리해 보세요."
              value={state.p7Reason}
              onChange={(v) => setField('p7Reason', v)}
              min={L8_MIN_REASON}
            />
            <div className="flex justify-end">
              <HintToggle open={!!hints.p7} onClick={() => toggleHint('p7')} />
            </div>
            {hints.p7 && (
              <HintBox>
                {L8_P7.map((t, i) => (
                  <div key={t.label}>
                    • ({i + 1}) {t.hint}
                  </div>
                ))}
              </HintBox>
            )}
            <FeedbackBanner fb={feedback.p7} />
            <VerifyButton theme="sky" onClick={() => verify('p7', 'p7Verified', validateL8Prob7)}>
              [문제 7] 정답 확인하기
            </VerifyButton>
            {graphReveal(
              'p7',
              state.p7Verified,
              L8_P7.map((t, i) => irrPanel(`p7-${i}`, `(${i + 1})`, t.fn, `${t.label} = ${irrLabel(t.fn).slice(4)}`))
            )}
          </div>

          <NavRow onPrev={() => goSection('shift')} onNext={() => goSection('reflect')} nextLabel="다음 단계: 성찰" />
        </div>
      )}

      {/* =====================================================================
          9차시 3단계: 성찰
      ===================================================================== */}
      {section === 'reflect' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-extrabold text-rose-600">9차시 마무리 성찰</span>
                <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">무리함수의 그래프 정리하기</h4>
              </div>
              <HintToggle open={!!hints.reflection9} onClick={() => toggleHint('reflection9')} label="💡 성찰 힌트 보기" />
            </div>
            {hints.reflection9 && (
              <HintBox>
                <div>
                  • <strong>성찰 1 예시</strong>: “y = √(a(x − p)) + q의 그래프는 y = √ax의 그래프를 x축 방향으로 p, y축 방향으로 q만큼 평행이동한 것이고, 정의역은 a의 부호, 치역은
                  근호 앞의 부호로 정해진다.”
                </div>
                <div>
                  • <strong>성찰 2 예시</strong>: “근호 안을 a로 묶으면 y = √(ax + b) + c도 평행이동한 그래프라는 것을 알았다.”
                </div>
              </HintBox>
            )}
            <HelpSourcePicker idPrefix="l9" value={state.irHelpSource} onChange={(v) => onUpdate((prev) => ({ ...prev, irHelpSource: v }))} />
            <ReasonInput
              id="l9-reflection1"
              theme="rose"
              label="1. y = √(a(x − p)) + q의 그래프를 그리는 방법과 정의역·치역을 정리해 보세요."
              value={state.irReflection1}
              onChange={(v) => onUpdate((prev) => ({ ...prev, irReflection1: v }))}
              min={L8_MIN_REFLECTION}
            />
            <ReasonInput
              id="l9-reflection2"
              theme="rose"
              label="2. 오늘 새롭게 알게 된 점이나 어려웠던 점을 적어 보세요."
              value={state.irReflection2}
              onChange={(v) => onUpdate((prev) => ({ ...prev, irReflection2: v }))}
              min={L8_MIN_REFLECTION}
            />
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs sm:text-sm font-bold text-emerald-900">
                🎉 함수 단원 1~9차시 탐구를 모두 마쳤어요. 성찰을 쓰면 9차시가 완료됩니다.
              </p>
              <NavRow onPrev={() => goSection('transform')} />
            </div>
          </div>
        </div>
      )}

      {/* 문제별 연습장 (계산·변형 단계에서만) */}
      {openPad && (section === 'calc' || section === 'transform') && (
        <ScratchPadWindow
          key={openPad}
          title={
            openPad === 'ex1'
              ? '[예제 1] 무리식 간단히 하기'
              : openPad === 'p2'
              ? '[문제 2] 무리식 간단히 하기'
              : openPad === 'ex2'
              ? '[예제 2] y = √(2x + 8) + 2 변형'
              : '[문제 7] 변형과 정의역·치역'
          }
          strokes={pads[openPad] || []}
          onChange={(next) => setPads((prev) => ({ ...prev, [openPad]: next }))}
          onClose={() => setOpenPad(null)}
          onRequestConfirm={onRequestConfirm}
          fileName={`8차시_연습장_${openPad}`}
        />
      )}
    </div>
  );
};
