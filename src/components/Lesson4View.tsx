import React, { useState } from 'react';
import type { Lesson4State } from '../utils/mathLogic';
import {
  L4Feedback,
  L4_GASES,
  L4_FORMULAS,
  L4_FORMULA_LABEL,
  L4_GAS_TO_FORMULA,
  L4_P1_X,
  L4_P1_Y,
  L4_P1_GIVEN,
  L4_P4_FUNCS,
  validateL4Open,
  validateL4Prob1,
  validateL4Ex1,
  validateL4Prob2,
  validateL4Prob5,
  validateL4Together,
  validateL4Prob3,
  validateL4Prob4,
  validateL4Tool,
} from '../utils/lesson4Logic';
import { parseLinear, formatLinear, fractionText } from '../utils/linearExpr';
import { MathText } from './MathText';
import { MappingVennDiagram } from './MappingVennDiagram';
import { LinearGraph, GraphLegend } from './LinearGraph';
import { ScratchPadButton, ScratchPadWindow, PadStroke } from './ScratchPad';
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  BookOpen,
  Eye,
  EyeOff,
  Repeat,
  FlipHorizontal2,
} from 'lucide-react';

/**
 * Func 4차시 · 역함수 탐구 (학생 화면)
 * 문항 자료·채점: src/utils/lesson4Logic.ts / 단계 완료: mathLogic.ts evaluateLevel4Completion
 */

export interface Lesson4ViewProps {
  state: Lesson4State;
  step: number;
  onStepChange: (nextStep: number) => void;
  onUpdate: (updater: (prev: Lesson4State) => Lesson4State) => void;
  onGoToLesson5?: () => void;
  onRequestConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

// ── 교과서 그림 경로 (1·2차시와 같은 방식: GitHub Pages에서는 ./public/… 경로) ──
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

// ── 단계별 색 (Tailwind는 완성된 클래스 이름만 인식하므로 글자 그대로 적음) ──
const THEME = {
  indigo: {
    badge: 'bg-indigo-600',
    label: 'text-indigo-600',
    btn: 'bg-indigo-600 hover:bg-indigo-700',
    picked: 'border-indigo-600 bg-indigo-50 text-indigo-950 ring-1 ring-indigo-600',
    focus: 'focus:border-indigo-500',
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
  orange: {
    badge: 'bg-orange-600',
    label: 'text-orange-600',
    btn: 'bg-orange-600 hover:bg-orange-700',
    picked: 'border-orange-600 bg-orange-50 text-orange-950 ring-1 ring-orange-600',
    focus: 'focus:border-orange-600',
  },
} as const;
type ThemeKey = keyof typeof THEME;

/** 입력 항목 → 그 항목이 속한 [정답 확인] 표시. 답을 고치면 확인 표시를 해제합니다. */
const FIELD_FLAG: Partial<Record<keyof Lesson4State, keyof Lesson4State>> = {
  openReverseMap: 'openVerified',
  openReverseIsFunc: 'openVerified',
  openConditionChoice: 'openVerified',
  openDomainRangeSame: 'openVerified',
  openReason: 'openVerified',
  p1_f3: 'p1Verified',
  p1_1: 'p1Verified',
  p1_2: 'p1Verified',
  p1_3: 'p1Verified',
  p1_4: 'p1Verified',
  p1Reason: 'p1Verified',
  ex1_solveX: 'ex1Verified',
  ex1_ans: 'ex1Verified',
  p2_1: 'p2Verified',
  p2_2: 'p2Verified',
  p2Reason: 'p2Verified',
  p5_inv: 'p5Verified',
  p5_celsius: 'p5Verified',
  tg_gf: 'togetherVerified',
  tg_gfInv: 'togetherVerified',
  tg_fInv: 'togetherVerified',
  tg_gInv: 'togetherVerified',
  tg_inner: 'togetherVerified',
  tg_result: 'togetherVerified',
  tg_relation: 'togetherVerified',
  p3_ans: 'p3Verified',
  p3Reason: 'p3Verified',
  p4_1_inv: 'p4Verified',
  p4_2_inv: 'p4Verified',
  toolAlwaysOverlap: 'toolVerified',
  toolParallelA: 'toolVerified',
  toolSameA: 'toolVerified',
};

type FeedbackKey = 'open' | 'p1' | 'ex1' | 'p2' | 'p5' | 'together' | 'p3' | 'p4' | 'tool';

// ─────────────────────────────────────────────
// 작은 화면 조각
// ─────────────────────────────────────────────
function FeedbackBanner({ fb }: { fb: L4Feedback | null | undefined }) {
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
  return <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-950 space-y-1">{children}</div>;
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
  /** 오른쪽에 함께 둘 버튼 (예: 연습장) */
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

function TextbookCard({
  theme,
  badge,
  title,
  file,
  alt,
  children,
  maxH = 'max-h-[300px]',
}: {
  theme: ThemeKey;
  badge: string;
  title: React.ReactNode;
  file?: string;
  alt?: string;
  children?: React.ReactNode;
  maxH?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className={`rounded-lg ${THEME[theme].badge} px-2.5 py-1 text-xs font-extrabold text-white`}>{badge}</span>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900">{title}</h3>
        </div>
        <span className="text-xs font-semibold text-slate-500">교과서 본문 탐구</span>
      </div>
      {file && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 flex justify-center">
          <img
            src={textbookSrc(file)}
            onError={(e) => onTextbookError(e, file)}
            alt={alt || ''}
            className={`${maxH} w-auto max-w-full object-contain rounded-lg`}
          />
        </div>
      )}
      {children}
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
          <MathText text={label} />
        </button>
      ))}
    </div>
  );
}

const inputClass = (theme: ThemeKey) =>
  `w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none ${THEME[theme].focus}`;

/** 식 입력칸 + 입력한 식을 어떻게 읽었는지 보여 주는 미리보기 */
function ExprInput({
  id,
  theme,
  label,
  prefix,
  value,
  onChange,
  variable = 'x',
}: {
  id: string;
  theme: ThemeKey;
  label?: React.ReactNode;
  prefix?: string;
  value?: string;
  onChange: (v: string) => void;
  variable?: 'x' | 'y';
}) {
  const parsed = (value || '').trim() ? parseLinear(value, variable) : null;
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      {label && (
        <label htmlFor={id} className="block text-xs font-bold text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        {prefix && (
          <span className="text-sm font-extrabold text-slate-700 shrink-0 mono">
            <MathText text={prefix} />
          </span>
        )}
        <input
          id={id}
          type="text"
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass(theme)}
        />
      </div>
      {(value || '').trim() && (
        <div className={`mt-1.5 text-[11px] font-semibold ${parsed ? 'text-slate-500' : 'text-rose-600'}`}>
          {parsed ? (
            <>
              읽은 식: <span className="mono text-slate-700">{formatLinear(parsed, variable)}</span>
            </>
          ) : (
            `식을 읽을 수 없어요. ${variable}에 대한 일차식으로 써 주세요. (예: 1/3${variable} - 4/3, (${variable}-4)/3)`
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
  suffix,
}: {
  id: string;
  theme: ThemeKey;
  label: React.ReactNode;
  value?: string;
  onChange: (v: string) => void;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <label htmlFor={id} className="block text-xs font-bold text-slate-700 mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass(theme)}
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
}: {
  id: string;
  theme: ThemeKey;
  /** 없으면 바깥에 있는 <label htmlFor={id}>를 사용 */
  label?: React.ReactNode;
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs sm:text-sm font-bold text-slate-900">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={2}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border border-slate-300 bg-white p-3 text-xs sm:text-sm text-slate-900 focus:outline-none ${THEME[theme].focus}`}
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

function NavRow({
  onPrev,
  onNext,
  nextLabel,
  nextDark,
}: {
  onPrev?: () => void;
  onNext?: () => void;
  nextLabel: string;
  nextDark?: boolean;
}) {
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
            nextDark ? 'bg-slate-900 hover:bg-slate-800' : 'bg-indigo-600 hover:bg-indigo-700'
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

const linearLabel = (a: number, b: number) => `y = ${formatLinear({ a, b })}`;

/** 3·4단계 문제별 연습장 (창 제목) */
const PAD_TITLES = {
  ex1: '[예제 1] y = 3x + 4의 역함수',
  p2: '[문제 2] 역함수 구하기',
  p5: '[문제 5] 섭씨·화씨',
  together: '[함께하기] (g∘f)⁻¹와 f⁻¹∘g⁻¹',
  p3: '[문제 3] (f⁻¹∘g⁻¹)(3)',
} as const;
type PadId = keyof typeof PAD_TITLES;
/** 연습장이 속한 단계 (다른 단계로 가면 창을 숨김) */
const PAD_STEP: Record<PadId, number> = { ex1: 2, p2: 2, p5: 2, together: 3, p3: 3 };

/** 1단계 비교용: 일대일대응이 아닌 함수 h : A → B와 그 화살표를 뒤집은 대응 */
const NO_INV_A = ['1', '2', '3'] as const;
const NO_INV_B = ['a', 'b', 'c'] as const;
const NO_INV_MAP: Record<string, string> = { '1': 'a', '2': 'a', '3': 'b' };
const NO_INV_REVERSED: [string, string][] = Object.entries(NO_INV_MAP).map(([x, y]) => [y, x]);

// ─────────────────────────────────────────────
// 4차시 화면
// ─────────────────────────────────────────────
export const Lesson4View: React.FC<Lesson4ViewProps> = ({
  state,
  step,
  onStepChange,
  onUpdate,
  onGoToLesson5,
  onRequestConfirm,
}) => {
  const [hints, setHints] = useState<Record<string, boolean>>({});
  const toggleHint = (k: string) => setHints((prev) => ({ ...prev, [k]: !prev[k] }));
  const [feedback, setFeedback] = useState<Partial<Record<FeedbackKey, L4Feedback | null>>>({});

  // 1단계: 화살표 방향, 뒤집은 대응에서 고르는 중인 화학식, 역함수가 없는 예
  const [noInvReversed, setNoInvReversed] = useState(false);
  const [pickFormula, setPickFormula] = useState<string>(L4_FORMULAS[0]);
  const [showNoInverse, setShowNoInverse] = useState(false);
  // 2단계: 완성한 그림을 역함수로 보기, 이미 그려진 화살표를 누른 경우 안내
  const [showP1Inverse, setShowP1Inverse] = useState(false);
  const [p1Notice, setP1Notice] = useState('');
  // 3단계: 교과서 원본 그림, 섭씨 변환기
  const [showEx1Img, setShowEx1Img] = useState(false);
  const [celsius, setCelsius] = useState(25);
  // 4단계: 함수 기계 입력값
  const [machineX, setMachineX] = useState(3);
  // 5단계: 점 이동, 공학 도구 슬라이더
  const [pointT, setPointT] = useState(3);
  const [sliderA, setSliderA] = useState(2);
  const [showReflect, setShowReflect] = useState(true);
  const [showToolImg, setShowToolImg] = useState(false);
  // 3·4단계 연습장: 문제별 그림(화면 안에서만 보관 — 저장 데이터에 넣지 않음)과 열려 있는 연습장
  const [pads, setPads] = useState<Partial<Record<PadId, PadStroke[]>>>({});
  const [openPad, setOpenPad] = useState<PadId | null>(null);
  const padButton = (id: PadId) => (
    <ScratchPadButton
      onClick={() => setOpenPad((cur) => (cur === id ? null : id))}
      used={Boolean(pads[id]?.length)}
      active={openPad === id}
    />
  );

  /** 답 입력: 해당 문항의 [정답 확인] 표시를 해제합니다 */
  const setField = <K extends keyof Lesson4State>(key: K, value: Lesson4State[K]) => {
    const flag = FIELD_FLAG[key];
    onUpdate((prev) => ({ ...prev, [key]: value, ...(flag ? { [flag]: false } : {}) }));
  };

  const verify = (key: FeedbackKey, flag: keyof Lesson4State, validator: (p: Lesson4State) => L4Feedback) => {
    const res = validator(state);
    setFeedback((prev) => ({ ...prev, [key]: res }));
    if (res.ok) onUpdate((prev) => ({ ...prev, [flag]: true }));
  };

  const goStep = (n: number) => onStepChange(n);

  const handleReset = () => {
    onRequestConfirm(
      '4차시 탐구 기록 초기화',
      '4차시(역함수 탐구)에 입력한 모든 답안과 확인 상태를 초기화할까요?',
      () => {
        onUpdate((prev) => ({
          ...prev,
          openReverseMap: {},
          openReverseIsFunc: '',
          openConditionChoice: '',
          openDomainRangeSame: '',
          openReason: '',
          openVerified: false,
          p1_f3: '',
          p1_1: '',
          p1_2: '',
          p1_3: '',
          p1_4: '',
          p1Reason: '',
          p1Verified: false,
          ex1_solveX: '',
          ex1_ans: '',
          ex1Verified: false,
          p2_1: '',
          p2_2: '',
          p2Reason: '',
          p2Verified: false,
          p5_inv: '',
          p5_celsius: '',
          p5Verified: false,
          tg_gf: '',
          tg_gfInv: '',
          tg_fInv: '',
          tg_gInv: '',
          tg_inner: '',
          tg_result: '',
          tg_relation: '',
          togetherVerified: false,
          p3_ans: '',
          p3Reason: '',
          p3Verified: false,
          p4_1_inv: '',
          p4_2_inv: '',
          p4Verified: false,
          toolAlwaysOverlap: '',
          toolParallelA: '',
          toolSameA: '',
          toolVerified: false,
          reflection1: '',
          reflection2: '',
          // 예전 귀류법 항목(fractionExamples·prob1ProofText 등)은 이 화면에서 쓰지 않으므로 건드리지 않음
        }));
        setFeedback({});
      }
    );
  };

  // ── 1단계 계산 ──
  const reverseMap = state.openReverseMap || {};
  const reverseDiagramMap: Record<string, string> = Object.fromEntries(
    Object.entries(reverseMap).map(([formula, gas]) => [L4_FORMULA_LABEL[formula] || formula, gas])
  );
  const forwardDiagramMap: Record<string, string> = Object.fromEntries(
    Object.entries(L4_GAS_TO_FORMULA).map(([gas, formula]) => [gas, L4_FORMULA_LABEL[formula]])
  );
  const assignReverse = (formula: string, gas: string) => {
    setField('openReverseMap', { ...reverseMap, [formula]: gas });
    const idx = L4_FORMULAS.indexOf(formula as (typeof L4_FORMULAS)[number]);
    const next = L4_FORMULAS[(idx + 1) % L4_FORMULAS.length];
    setPickFormula(next);
  };

  // ── 2단계 계산 ──
  const p1Map: Record<string, string> = { ...L4_P1_GIVEN, ...(state.p1_f3 ? { '3': state.p1_f3 } : {}) };
  const p1Targets = Object.values(p1Map);
  const p1IsBijection = p1Targets.length === 4 && new Set(p1Targets).size === 4;
  const p1InverseMap: Record<string, string> = Object.fromEntries(Object.entries(p1Map).map(([x, y]) => [y, x]));

  // ── 5단계 계산 ──
  const P = { x: pointT, y: 2 * pointT - 2 };
  const sliderInv = sliderA !== 0 ? { a: 1 / sliderA, b: -1 / sliderA } : null;

  return (
    <div className="space-y-7">
      {/* 상단 차시 표시 */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200/80 bg-indigo-50/60 px-4 py-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-indigo-950 flex-wrap">
          <Repeat className="h-4 w-4 text-indigo-600 shrink-0" />
          <span>04차시 · 역함수 탐구:</span>
          <span className="font-semibold text-indigo-800">
            대응을 거꾸로 되돌리는 역함수 <MathText text="f⁻¹" />와 직선 <MathText text="y = x" /> 대칭
          </span>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
          <span>4차시 초기화</span>
        </button>
      </div>

      {/* =====================================================================
          STEP 0: 생각 열기 · 역함수의 뜻
      ===================================================================== */}
      {step === 0 && (
        <div className="space-y-6">
          <TextbookCard
            theme="indigo"
            badge="생각 열기"
            title="온실가스와 화학식의 대응, 화살표를 거꾸로 뒤집으면?"
            file="image_l4_open.png"
            alt="역함수 생각 열기 - 온실가스(메테인, 이산화 탄소, 아산화 질소)의 집합 X와 화학식(N2O, CH4, CO2)의 집합 Y 사이의 대응 그림"
          >
            <div className="rounded-2xl border border-indigo-200/90 bg-indigo-50/40 p-4 sm:p-5 space-y-4">
              <div>
                <div className="text-xs font-extrabold text-indigo-700 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <span>벤다이어그램으로 보는 대응 f : X → Y</span>
                </div>
                <p className="mt-0.5 text-xs text-slate-600">
                  서로 다른 온실가스는 서로 다른 화학식에 대응하고, 화살표를 받지 못한 화학식이 없습니다. 아래 [탐구 활동 01]에서 화살표를 거꾸로
                  이어 보세요.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
                <MappingVennDiagram
                  domainLabel="X (온실가스)"
                  codomainLabel="Y (화학식)"
                  domain={L4_GASES}
                  codomain={L4_FORMULAS.map((f) => L4_FORMULA_LABEL[f])}
                  mapping={forwardDiagramMap}
                  functionLabel="f"
                  ariaLabel={`원래 대응 f: ${L4_GASES.map((g) => `${g}→${forwardDiagramMap[g]}`).join(', ')}`}
                />
              </div>

              <div className="flex justify-end">
                <ToggleButton
                  on={showNoInverse}
                  onClick={() => setShowNoInverse((v) => !v)}
                  onLabel="비교 닫기"
                  offLabel="역함수가 없는 경우와 비교"
                />
              </div>

              {showNoInverse && (
                <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 sm:p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs font-extrabold text-rose-800">비교: 일대일대응이 아닌 함수 h : A → B</div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        aria-pressed={!noInvReversed}
                        onClick={() => setNoInvReversed(false)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                          !noInvReversed ? 'bg-rose-600 text-white shadow-2xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-rose-50'
                        }`}
                      >
                        원래 대응 h : A → B
                      </button>
                      <button
                        type="button"
                        aria-pressed={noInvReversed}
                        onClick={() => setNoInvReversed(true)}
                        className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                          noInvReversed ? 'bg-rose-600 text-white shadow-2xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-rose-50'
                        }`}
                      >
                        <FlipHorizontal2 className="h-3.5 w-3.5" />
                        화살표 뒤집기 : B → A
                      </button>
                    </div>
                  </div>
                  <div className="rounded-xl border border-rose-100 bg-white p-2 sm:p-3">
                    {!noInvReversed ? (
                      <MappingVennDiagram
                        domainLabel="A"
                        codomainLabel="B"
                        domain={NO_INV_A}
                        codomain={NO_INV_B}
                        mapping={NO_INV_MAP}
                        functionLabel="h"
                        ariaLabel="일대일대응이 아닌 함수 h: 1→a, 2→a, 3→b, c는 대응 없음"
                      />
                    ) : (
                      <MappingVennDiagram
                        domainLabel="B"
                        codomainLabel="A"
                        domain={NO_INV_B}
                        codomain={NO_INV_A}
                        mapping={{}}
                        pairs={NO_INV_REVERSED}
                        problemDomain={['a', 'c']}
                        ariaLabel="화살표를 뒤집은 대응: a→1, a→2, b→3, c는 대응 없음 — 함수가 아님"
                      />
                    )}
                  </div>
                  {!noInvReversed ? (
                    <p className="text-xs text-rose-900 leading-relaxed">
                      h는 A의 각 원소에 B의 원소가 하나씩 대응하므로 함수입니다. 하지만 1과 2가 같은 a에 대응하고, c는 화살표를 받지 못했어요.
                      [화살표 뒤집기]를 눌러 보세요.
                    </p>
                  ) : (
                    <p className="text-xs text-rose-900 leading-relaxed">
                      뒤집으면 B의 원소 <strong>a에는 1과 2가 동시에</strong> 대응하고, <strong>c에는 대응하는 원소가 없습니다</strong>(빨간색).
                      따라서 B → A 대응은 함수가 아니므로 h의 역함수는 존재하지 않습니다.
                    </p>
                  )}
                </div>
              )}
            </div>
          </TextbookCard>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <ActivityHeader
              theme="indigo"
              kicker="탐구 활동 01"
              title="[생각 열기] 화살표를 뒤집은 대응이 함수가 되는지 판단하기"
              done={state.openVerified}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="text-xs sm:text-sm font-bold text-slate-900">
                  1. 화살표의 방향을 반대로 바꾼 대응 <MathText text="Y → X" />를 벤다이어그램에 완성해 보세요.
                </div>
                <HintToggle open={!!hints.openMap} onClick={() => toggleHint('openMap')} />
              </div>
              {hints.openMap && (
                <HintBox>
                  위 그림에서 화학식으로 <strong>들어오는</strong> 화살표가 어느 온실가스에서 <strong>출발</strong>하는지 보세요. 뒤집으면 그
                  온실가스가 화학식의 짝이 됩니다.
                </HintBox>
              )}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-3 sm:p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-700">
                  <span>
                    ① 왼쪽(Y)에서 화학식을 누르고 → ② 오른쪽(X)에서 짝이 되는 온실가스를 누르세요.{' '}
                    <span className="text-indigo-700">
                      지금 고르는 화학식: <MathText text={L4_FORMULA_LABEL[pickFormula]} />
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setField('openReverseMap', {});
                      setPickFormula(L4_FORMULAS[0]);
                    }}
                    disabled={!Object.keys(reverseMap).length}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> 다시 연결하기
                  </button>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-2 sm:p-3">
                  <MappingVennDiagram
                    domainLabel="Y (화학식)"
                    codomainLabel="X (온실가스)"
                    domain={L4_FORMULAS.map((f) => L4_FORMULA_LABEL[f])}
                    codomain={L4_GASES}
                    mapping={reverseDiagramMap}
                    selectedDomain={L4_FORMULA_LABEL[pickFormula]}
                    onSelectDomain={(label) => {
                      const key = L4_FORMULAS.find((f) => L4_FORMULA_LABEL[f] === label);
                      if (key) setPickFormula(key);
                    }}
                    onPickCodomain={(gas) => assignReverse(pickFormula, gas)}
                    ariaLabel={`뒤집은 대응 Y → X: ${L4_FORMULAS.map((f) => `${L4_FORMULA_LABEL[f]}→${reverseMap[f] || '미선택'}`).join(', ')}`}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                2. 화살표를 뒤집은 대응 <MathText text="Y → X" />는 집합 <MathText text="Y" />에서 집합 <MathText text="X" />로의 함수가 되나요?
              </div>
              <ChoiceButtons
                theme="indigo"
                value={state.openReverseIsFunc}
                options={[
                  ['yes', '함수가 된다'],
                  ['no', '함수가 되지 않는다'],
                ] as const}
                onPick={(v) => setField('openReverseIsFunc', v)}
              />
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="text-xs sm:text-sm font-bold text-slate-900">
                  3. 함수 <MathText text="f : X → Y" />의 화살표를 뒤집은 대응이 함수가 되려면 <MathText text="f" />는 어떤 함수여야 할까요?
                </div>
                <HintToggle open={!!hints.openCond} onClick={() => toggleHint('openCond')} />
              </div>
              {hints.openCond && (
                <HintBox>
                  위의 [역함수가 없는 경우와 비교]를 열어 보세요. 뒤집었을 때 ① Y의 한 원소에 X의 원소가 두 개 이상 대응하거나, ② Y에 대응이
                  없는 원소가 남으면 함수가 아닙니다. 2차시에 배운 함수 중 두 문제가 모두 생기지 않는 함수는?
                </HintBox>
              )}
              <ChoiceButtons
                theme="indigo"
                cols="sm:grid-cols-3"
                value={state.openConditionChoice}
                options={[
                  ['bijection', 'f가 일대일대응이어야 한다'],
                  ['oneToOne', 'f가 일대일함수이기만 하면 된다'],
                  ['anyFunction', 'f가 함수이기만 하면 된다'],
                ] as const}
                onPick={(v) => setField('openConditionChoice', v)}
              />
            </div>

            <div className="space-y-2.5">
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                <span className="mr-1 rounded-md bg-rose-100 px-1.5 py-0.5 text-[11px] font-extrabold text-rose-700">생각 톡톡</span>
                함수 <MathText text="f" />의 정의역과 역함수 <MathText text="f⁻¹" />의 치역은 같을까요?
              </div>
              <ChoiceButtons
                theme="indigo"
                value={state.openDomainRangeSame}
                options={[
                  ['yes', '같다'],
                  ['no', '다르다'],
                ] as const}
                onPick={(v) => setField('openDomainRangeSame', v)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label htmlFor="l4-open-reason" className="text-xs sm:text-sm font-bold text-slate-900">
                  4. 화살표를 뒤집은 대응이 함수가 되는(또는 되지 않는) 이유를 자신의 말로 서술해 보세요.
                </label>
                <HintToggle open={!!hints.openReason} onClick={() => toggleHint('openReason')} />
              </div>
              {hints.openReason && (
                <HintBox>💡 작성 예시: “Y의 각 화학식에 X의 온실가스가 하나씩, 빠짐없이 대응하므로 Y에서 X로의 함수가 된다.”</HintBox>
              )}
              <ReasonInput id="l4-open-reason" theme="indigo" value={state.openReason} onChange={(v) => setField('openReason', v)} />
            </div>

            <FeedbackBanner fb={feedback.open} />
            <VerifyButton theme="indigo" onClick={() => verify('open', 'openVerified', validateL4Open)}>
              [생각 열기] 정답 확인하기
            </VerifyButton>
          </div>

          {/* 핵심 개념 정리 */}
          <div className="rounded-2xl border-2 border-indigo-600/80 bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/60 p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-indigo-900">
              <BookOpen className="h-4 w-4 text-indigo-600 shrink-0" />
              <span>핵심 개념 정리 — 역함수와 그 성질</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              함수 <MathText text="f : X → Y" />가 <strong>일대일대응</strong>이면 <MathText text="Y" />의 각 원소 <MathText text="y" />에 대하여{' '}
              <MathText text="f(x) = y" />인 <MathText text="X" />의 원소 <MathText text="x" />가 오직 하나 존재합니다. 이때{' '}
              <MathText text="Y" />의 각 원소 <MathText text="y" />에 <MathText text="f(x) = y" />인 <MathText text="x" />를 대응시키는 함수를{' '}
              <MathText text="f" />의 <strong>역함수</strong>라 하고, 기호로 <MathText text="f⁻¹ : Y → X" />와 같이 나타냅니다.
            </p>
            <div className="rounded-xl border border-indigo-200 bg-white p-4 space-y-2 text-xs sm:text-sm text-slate-800">
              <div className="font-extrabold text-indigo-900">
                함수 <MathText text="f : X → Y" />가 일대일대응일 때
              </div>
              <ol className="space-y-1.5 list-none">
                <li>
                  ① <MathText text="f" />의 역함수 <MathText text="f⁻¹ : Y → X" />가 존재한다.
                </li>
                <li>
                  ② <MathText text="y = f(x) ⟺ x = f⁻¹(y)" />
                </li>
                <li>
                  ③ <MathText text="(f⁻¹ ∘ f)(x) = x (x ∈ X)" />, <MathText text="(f ∘ f⁻¹)(y) = y (y ∈ Y)" />
                </li>
                <li>
                  ④ <MathText text="(f⁻¹)⁻¹(x) = f(x) (x ∈ X)" />
                </li>
              </ol>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-rose-500 px-2 py-0.5 text-[11px] font-extrabold text-white">보기</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800">
                  아래 그림의 함수 <MathText text="f" />는 일대일대응이므로 역함수 <MathText text="f⁻¹" />가 존재한다.
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                <MappingVennDiagram
                  domainLabel="X"
                  codomainLabel="Y"
                  domain={['1', '2', '3', '4']}
                  codomain={['3', '4', '5', '6']}
                  mapping={{ '1': '6', '2': '3', '3': '4', '4': '5' }}
                  functionLabel="f"
                  ariaLabel="보기의 함수 f: 1→6, 2→3, 3→4, 4→5"
                />
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-800">
                  <li>
                    ① <MathText text="f(1) = 6" />이므로 <MathText text="f⁻¹(6) = 1" />
                  </li>
                  <li>
                    ② <MathText text="(f⁻¹ ∘ f)(2) = 2" />, <MathText text="(f ∘ f⁻¹)(5) = 5" />
                  </li>
                  <li>
                    ③ <MathText text="(f⁻¹)⁻¹(3) = f(3) = 4" />
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <NavRow onNext={() => goStep(1)} nextLabel="다음 단계: 문제 1 · 역함수의 함숫값" />
        </div>
      )}

      {/* =====================================================================
          STEP 1: 문제 1 · 역함수의 함숫값
      ===================================================================== */}
      {step === 1 && (
        <div className="space-y-6">
          <TextbookCard
            theme="emerald"
            badge="문제 1"
            title="역함수가 존재하도록 그림을 완성하고 함숫값 구하기"
            file="image_l4_prob1.png"
            alt="문제 1 - X = {1, 2, 3, 4}, Y = {1, 3, 5, 7}인 함수 f의 대응 그림 (1→3, 2→5, 4→1이 그려져 있고 3의 화살표가 비어 있음)"
            maxH="max-h-[200px]"
          >
            <div className="rounded-2xl border border-emerald-200/90 bg-emerald-50/40 p-4 sm:p-5 space-y-3">
              <div className="text-xs font-extrabold text-emerald-800 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span>그림 완성하기 — X의 원소 3에서 출발하는 화살표를 이어 보세요</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
                {!(showP1Inverse && p1IsBijection) && (
                <MappingVennDiagram
                  domainLabel="X"
                  codomainLabel="Y"
                  domain={L4_P1_X}
                  codomain={L4_P1_Y}
                  mapping={p1Map}
                  functionLabel="f"
                  selectedDomain="3"
                  onSelectDomain={(x) =>
                    setP1Notice(x === '3' ? '' : `${x}의 화살표는 교과서 그림에 이미 그려져 있어요. 비어 있는 3의 화살표만 정하면 됩니다.`)
                  }
                  onPickCodomain={(y) => {
                    setP1Notice('');
                    setShowP1Inverse(false);
                    setField('p1_f3', y);
                  }}
                  ariaLabel={`문제 1 함수 f: ${L4_P1_X.map((x) => `${x}→${p1Map[x] || '미정'}`).join(', ')}`}
                />
                )}
                {showP1Inverse && p1IsBijection && (
                  <div>
                    <div className="mb-1 text-center text-xs font-extrabold text-emerald-800">
                      역함수 <MathText text="f⁻¹ : Y → X" /> (화살표를 뒤집은 그림)
                    </div>
                    <MappingVennDiagram
                      domainLabel="Y"
                      codomainLabel="X"
                      domain={L4_P1_Y}
                      codomain={L4_P1_X}
                      mapping={p1InverseMap}
                      functionLabel="f⁻¹"
                      ariaLabel={`역함수 f⁻¹: ${L4_P1_Y.map((y) => `${y}→${p1InverseMap[y]}`).join(', ')}`}
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-700 mr-1">3 →</span>
                {L4_P1_Y.map((y) => (
                  <button
                    key={y}
                    type="button"
                    aria-pressed={state.p1_f3 === y}
                    onClick={() => {
                      setP1Notice('');
                      setShowP1Inverse(false);
                      setField('p1_f3', y);
                    }}
                    className={`min-w-[40px] rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                      state.p1_f3 === y ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-emerald-50'
                    }`}
                  >
                    {y}
                  </button>
                ))}
                {p1IsBijection && (
                  <span className="ml-auto">
                    <ToggleButton
                      on={showP1Inverse}
                      onClick={() => setShowP1Inverse((v) => !v)}
                      onLabel="원래 그림으로"
                      offLabel="역함수 그림으로 보기"
                    />
                  </span>
                )}
              </div>
              {p1Notice && <p className="text-xs font-semibold text-slate-600">{p1Notice}</p>}
              {state.p1_f3 && (
                <p className={`text-xs font-bold ${p1IsBijection ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {p1IsBijection
                    ? '✔ 이제 f는 일대일대응입니다. 역함수 f⁻¹가 존재해요.'
                    : '✖ Y에 화살표가 두 개 들어오는 원소와, 화살표를 받지 못한 원소가 있습니다. 이대로는 역함수가 존재하지 않아요.'}
                </p>
              )}
            </div>
          </TextbookCard>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <ActivityHeader theme="emerald" kicker="탐구 활동 02" title="[문제 1] 역함수의 함숫값 구하기" done={state.p1Verified} />
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-slate-900">위에서 완성한 그림을 보고 다음 값을 구하세요.</span>
              <HintToggle open={!!hints.p1} onClick={() => toggleHint('p1')} />
            </div>
            {hints.p1 && (
              <HintBox>
                <div>
                  • <MathText text="f⁻¹(b) = a ⟺ f(a) = b" /> — Y의 원소 b로 들어오는 화살표의 출발점을 찾습니다.
                </div>
                <div>
                  • 성질 ③: <MathText text="(f⁻¹ ∘ f)(x) = x" />, <MathText text="(f ∘ f⁻¹)(y) = y" /> / 성질 ④:{' '}
                  <MathText text="(f⁻¹)⁻¹ = f" />
                </div>
              </HintBox>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NumInput id="l4-p1-1" theme="emerald" label={<>(1) <MathText text="f⁻¹(7)" /></>} value={state.p1_1} onChange={(v) => setField('p1_1', v)} />
              <NumInput id="l4-p1-2" theme="emerald" label={<>(2) <MathText text="(f⁻¹ ∘ f)(4)" /></>} value={state.p1_2} onChange={(v) => setField('p1_2', v)} />
              <NumInput id="l4-p1-3" theme="emerald" label={<>(3) <MathText text="(f ∘ f⁻¹)(3)" /></>} value={state.p1_3} onChange={(v) => setField('p1_3', v)} />
              <NumInput id="l4-p1-4" theme="emerald" label={<>(4) <MathText text="(f⁻¹)⁻¹(2)" /></>} value={state.p1_4} onChange={(v) => setField('p1_4', v)} />
            </div>
            <ReasonInput
              id="l4-p1-reason"
              theme="emerald"
              label="네 값을 구한 과정을 정리해 보세요. (어떤 성질을 이용했나요?)"
              value={state.p1Reason}
              onChange={(v) => setField('p1Reason', v)}
            />
            <FeedbackBanner fb={feedback.p1} />
            <VerifyButton theme="emerald" onClick={() => verify('p1', 'p1Verified', validateL4Prob1)}>
              [문제 1] 정답 확인하기
            </VerifyButton>
          </div>

          <NavRow onPrev={() => goStep(0)} onNext={() => goStep(2)} nextLabel="다음 단계: 역함수 구하기" />
        </div>
      )}

      {/* =====================================================================
          STEP 2: 역함수 구하기 — 예제 1 변형, 문제 2, 문제 5
      ===================================================================== */}
      {step === 2 && (
        <div className="space-y-6">
          {/* 역함수 구하는 순서 */}
          <div className="rounded-2xl border-2 border-sky-600/70 bg-gradient-to-br from-sky-50/80 via-white to-indigo-50/50 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-sky-900">
              <BookOpen className="h-4 w-4 text-sky-600 shrink-0" />
              <span>역함수 구하는 순서</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700">
              일대일대응인 함수 <MathText text="y = f(x)" />의 역함수 <MathText text="y = f⁻¹(x)" />는 다음과 같이 구할 수 있습니다.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm font-bold">
              <span className="rounded-lg border border-sky-200 bg-white px-3 py-1.5 mono">
                <MathText text="y = f(x)" />
              </span>
              <span className="flex flex-col items-center text-[11px] text-sky-700">
                <ArrowRight className="h-4 w-4" />
                <span>
                  <MathText text="x" />에 대하여 푼다
                </span>
              </span>
              <span className="rounded-lg border border-sky-200 bg-white px-3 py-1.5 mono">
                <MathText text="x = f⁻¹(y)" />
              </span>
              <span className="flex flex-col items-center text-[11px] text-sky-700">
                <ArrowRight className="h-4 w-4" />
                <span>
                  <MathText text="x" />와 <MathText text="y" />를 바꾼다
                </span>
              </span>
              <span className="rounded-lg border border-sky-300 bg-sky-600 px-3 py-1.5 mono text-white">
                <MathText text="y = f⁻¹(x)" />
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500">
              ✏️ 입력 방법: 분수는 <span className="mono">1/3x</span> 또는 <span className="mono">x/3</span>, 괄호는{' '}
              <span className="mono">(x-4)/3</span>처럼 씁니다. 입력칸 아래에 읽은 식이 보이니 확인하세요.
            </p>
          </div>

          {/* 예제 1 → 문제 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-extrabold text-sky-700">탐구 활동 03-A · 교과서 예제 1을 문제로</span>
                <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                  함수 <MathText text="y = 3x + 4" />의 역함수를 구하시오.
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <DoneBadge show={state.ex1Verified} />
                <ToggleButton on={showEx1Img} onClick={() => setShowEx1Img((v) => !v)} onLabel="교과서 풀이 닫기" offLabel="교과서 풀이 보기" />
                {padButton('ex1')}
              </div>
            </div>
            {showEx1Img && (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 flex justify-center">
                <img
                  src={textbookSrc('image_l4_ex1.png')}
                  onError={(e) => onTextbookError(e, 'image_l4_ex1.png')}
                  alt="교과서 예제 1 - 함수 y = 3x + 4의 역함수를 구하는 두 가지 풀이"
                  className="max-h-[260px] w-auto max-w-full object-contain rounded-lg"
                />
              </div>
            )}
            <p className="text-xs text-slate-600">
              ✔ 주어진 함수는 일차함수(기울기 3 ≠ 0)이므로 일대일대응입니다. 따라서 역함수가 존재합니다.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ExprInput
                id="l4-ex1-x"
                theme="sky"
                variable="y"
                label={<>① <MathText text="y = 3x + 4" />를 <MathText text="x" />에 대하여 풀면</>}
                prefix="x ="
                value={state.ex1_solveX}
                onChange={(v) => setField('ex1_solveX', v)}
              />
              <ExprInput
                id="l4-ex1-ans"
                theme="sky"
                label={<>② <MathText text="x" />와 <MathText text="y" />를 서로 바꾸면 구하는 역함수는</>}
                prefix="y ="
                value={state.ex1_ans}
                onChange={(v) => setField('ex1_ans', v)}
              />
            </div>
            <div className="rounded-xl bg-sky-50/70 border border-sky-200 px-3.5 py-2.5 text-xs text-sky-950">
              💡 순서를 바꾸어 <strong>먼저 x와 y를 바꾼 뒤(x = 3y + 4) y에 대하여 풀어도</strong> 같은 역함수를 얻습니다. (교과서 풀이 2)
            </div>
            <FeedbackBanner fb={feedback.ex1} />
            <VerifyButton theme="sky" onClick={() => verify('ex1', 'ex1Verified', validateL4Ex1)}>
              [예제 1] 정답 확인하기
            </VerifyButton>
          </div>

          {/* 문제 2 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <ActivityHeader
              theme="sky"
              kicker="탐구 활동 03-B"
              title="[문제 2] 다음 함수의 역함수를 구하시오."
              done={state.p2Verified}
              extra={padButton('p2')}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ExprInput
                id="l4-p2-1"
                theme="sky"
                label={<>(1) <MathText text="y = −3x + 1" />의 역함수</>}
                prefix="y ="
                value={state.p2_1}
                onChange={(v) => setField('p2_1', v)}
              />
              <ExprInput
                id="l4-p2-2"
                theme="sky"
                label={<>(2) <MathText text="y = (1/4)x + 2" />의 역함수</>}
                prefix="y ="
                value={state.p2_2}
                onChange={(v) => setField('p2_2', v)}
              />
            </div>
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex-1 min-w-[240px]">
                <ReasonInput
                  id="l4-p2-reason"
                  theme="sky"
                  label="(1) 또는 (2)의 역함수를 구한 과정을 단계별로 써 보세요."
                  value={state.p2Reason}
                  onChange={(v) => setField('p2Reason', v)}
                />
              </div>
              <HintToggle open={!!hints.p2} onClick={() => toggleHint('p2')} />
            </div>
            {hints.p2 && (
              <HintBox>
                <div>
                  (1) <MathText text="y = −3x + 1" /> → <MathText text="3x = 1 − y" /> → <MathText text="x = −(1/3)y + 1/3" /> → x와 y 바꾸기
                </div>
                <div>
                  (2) <MathText text="y = (1/4)x + 2" /> → <MathText text="(1/4)x = y − 2" /> → <MathText text="x = 4y − 8" /> → x와 y 바꾸기
                </div>
              </HintBox>
            )}
            <FeedbackBanner fb={feedback.p2} />
            <VerifyButton theme="sky" onClick={() => verify('p2', 'p2Verified', validateL4Prob2)}>
              [문제 2] 정답 확인하기
            </VerifyButton>
          </div>

          {/* 문제 5 섭씨·화씨 */}
          <TextbookCard
            theme="sky"
            badge="과학+ 문제 5"
            title="섭씨온도와 화씨온도 — 역함수로 거꾸로 바꾸기"
            file="image_l4_prob5.png"
            alt="문제 5 - 섭씨온도 x℃를 화씨온도 y℉로 바꾸는 함수 y = (9/5)x + 32"
            maxH="max-h-[220px]"
          >
            <div className="rounded-2xl border border-sky-200/90 bg-sky-50/40 p-4 space-y-2">
              <div className="text-xs font-extrabold text-sky-800 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-sky-600" />
                <span>온도 변환기 — 섭씨를 움직여 보세요</span>
              </div>
              <input
                type="range"
                min={-20}
                max={100}
                step={5}
                value={celsius}
                onChange={(e) => setCelsius(Number(e.target.value))}
                aria-label="섭씨온도"
                className="w-full accent-sky-600"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm font-bold">
                <div className="rounded-lg border border-sky-200 bg-white px-3 py-2">
                  <MathText text="f" /> : {celsius}℃ → {fractionText((9 / 5) * celsius + 32)}℉
                </div>
                <div className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-rose-800">
                  <MathText text="f⁻¹" /> : {fractionText((9 / 5) * celsius + 32)}℉ → {celsius}℃
                </div>
              </div>
              <p className="text-[11px] text-slate-500">함수 f가 섭씨를 화씨로 바꾼다면, 역함수 f⁻¹는 화씨를 다시 섭씨로 되돌립니다.</p>
            </div>
          </TextbookCard>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <ActivityHeader
              theme="sky"
              kicker="탐구 활동 03-C"
              title="[문제 5] 화씨온도를 섭씨온도로"
              done={state.p5Verified}
              extra={padButton('p5')}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ExprInput
                id="l4-p5-inv"
                theme="sky"
                label={<>(1) <MathText text="y = (9/5)x + 32" />의 역함수</>}
                prefix="y ="
                value={state.p5_inv}
                onChange={(v) => setField('p5_inv', v)}
              />
              <NumInput
                id="l4-p5-c"
                theme="sky"
                label="(2) 화씨온도 95℉는 섭씨온도로 몇 ℃인가요?"
                suffix="℃"
                value={state.p5_celsius}
                onChange={(v) => setField('p5_celsius', v)}
              />
            </div>
            <FeedbackBanner fb={feedback.p5} />
            <VerifyButton theme="sky" onClick={() => verify('p5', 'p5Verified', validateL4Prob5)}>
              [문제 5] 정답 확인하기
            </VerifyButton>
          </div>

          <NavRow onPrev={() => goStep(1)} onNext={() => goStep(3)} nextLabel="다음 단계: 함께하기 · (g∘f)⁻¹" />
        </div>
      )}

      {/* =====================================================================
          STEP 3: 함께하기 · (g∘f)⁻¹ = f⁻¹∘g⁻¹, 문제 3
      ===================================================================== */}
      {step === 3 && (
        <div className="space-y-6">
          <TextbookCard
            theme="violet"
            badge="함께하기"
            title={<>두 함수 <MathText text="f(x) = x − 1" />, <MathText text="g(x) = 2x + 4" />로 <MathText text="(g ∘ f)⁻¹" />와 <MathText text="f⁻¹ ∘ g⁻¹" /> 비교하기</>}
            file="image_l4_together.png"
            alt="함께하기 - (g∘f)⁻¹와 f⁻¹∘g⁻¹를 비교하는 빈칸 채우기"
            maxH="max-h-[280px]"
          >
            {/* 함수 기계: 가고 되돌아오기 */}
            <div className="rounded-2xl border border-violet-200/90 bg-violet-50/40 p-4 sm:p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-extrabold text-violet-800 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-violet-600" />
                  <span>함수 기계 — 갔다가 되돌아오기</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-600">x =</span>
                  {[-2, -1, 0, 1, 2, 3].map((n) => (
                    <button
                      key={n}
                      type="button"
                      aria-pressed={machineX === n}
                      onClick={() => setMachineX(n)}
                      className={`min-w-[34px] rounded-lg border px-2 py-1 text-xs font-bold ${
                        machineX === n ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-violet-50'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              {(() => {
                const fx = machineX - 1;
                const gfx = 2 * fx + 4;
                const box = 'rounded-lg border bg-white px-2.5 py-1.5 font-extrabold mono';
                return (
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="w-16 text-[11px] font-bold text-slate-500">갈 때</span>
                      <span className={`${box} border-slate-300`}>{machineX}</span>
                      <span className="text-blue-700 font-bold">—f→</span>
                      <span className={`${box} border-blue-300 text-blue-800`}>{fx}</span>
                      <span className="text-amber-700 font-bold">—g→</span>
                      <span className={`${box} border-amber-300 text-amber-800`}>{gfx}</span>
                      <span className="text-[11px] text-slate-500">
                        = <MathText text="(g ∘ f)" />({machineX})
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="w-16 text-[11px] font-bold text-slate-500">되돌릴 때</span>
                      <span className={`${box} border-amber-300 text-amber-800`}>{gfx}</span>
                      <span className="text-amber-700 font-bold">
                        —<MathText text="g⁻¹" />→
                      </span>
                      <span className={`${box} border-blue-300 text-blue-800`}>{fx}</span>
                      <span className="text-blue-700 font-bold">
                        —<MathText text="f⁻¹" />→
                      </span>
                      <span className={`${box} border-slate-300`}>{machineX}</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-violet-900">
                      🧦 양말을 신고 신발을 신었다면, 벗을 때는 <strong>신발을 먼저</strong> 벗어야 하지요. 나중에 한 <MathText text="g" />를 먼저 되돌립니다.
                    </p>
                  </div>
                );
              })()}
            </div>
          </TextbookCard>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <ActivityHeader
              theme="violet"
              kicker="탐구 활동 04"
              title="[함께하기] □ 안에 알맞은 것 써넣기"
              done={state.togetherVerified}
              extra={padButton('together')}
            />
            <div className="space-y-3">
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                (i) <MathText text="(g ∘ f)(x) = g(f(x)) = g(x − 1)" />을 정리하면
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ExprInput id="l4-tg-gf" theme="violet" prefix="(g∘f)(x) =" value={state.tg_gf} onChange={(v) => setField('tg_gf', v)} />
                <ExprInput id="l4-tg-gfinv" theme="violet" prefix="(g∘f)⁻¹(x) =" value={state.tg_gfInv} onChange={(v) => setField('tg_gfInv', v)} />
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 pt-1">(ii) 두 함수의 역함수를 각각 구하면</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ExprInput id="l4-tg-finv" theme="violet" prefix="f⁻¹(x) =" value={state.tg_fInv} onChange={(v) => setField('tg_fInv', v)} />
                <ExprInput id="l4-tg-ginv" theme="violet" prefix="g⁻¹(x) =" value={state.tg_gInv} onChange={(v) => setField('tg_gInv', v)} />
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 pt-1">
                이므로 <MathText text="(f⁻¹ ∘ g⁻¹)(x) = f⁻¹(g⁻¹(x))" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ExprInput id="l4-tg-inner" theme="violet" prefix="= f⁻¹(" value={state.tg_inner} onChange={(v) => setField('tg_inner', v)} />
                <ExprInput id="l4-tg-result" theme="violet" prefix=") =" value={state.tg_result} onChange={(v) => setField('tg_result', v)} />
              </div>
              <div className="space-y-2 pt-1">
                <div className="text-xs sm:text-sm font-bold text-slate-900">
                  (i)과 (ii)에서 <MathText text="(g ∘ f)⁻¹" /> □ <MathText text="f⁻¹ ∘ g⁻¹" />
                </div>
                <ChoiceButtons
                  theme="violet"
                  value={state.tg_relation}
                  options={[
                    ['eq', '=  (같다)'],
                    ['neq', '≠  (다르다)'],
                  ] as const}
                  onPick={(v) => setField('tg_relation', v)}
                />
              </div>
            </div>
            <FeedbackBanner fb={feedback.together} />
            <VerifyButton theme="violet" onClick={() => verify('together', 'togetherVerified', validateL4Together)}>
              [함께하기] 정답 확인하기
            </VerifyButton>

            <div className="rounded-xl border-2 border-violet-500/70 bg-violet-50/60 p-4 text-center space-y-1">
              <div className="text-xs font-bold text-slate-600">일반적으로 두 함수 f와 g의 역함수가 존재할 때</div>
              <div className="text-base sm:text-lg font-extrabold text-violet-900 mono">
                <MathText text="(g ∘ f)⁻¹ = f⁻¹ ∘ g⁻¹" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <ActivityHeader
              theme="violet"
              kicker="탐구 활동 04-B"
              title={<>[문제 3] <MathText text="(g ∘ f)(x) = 2x − 5" />일 때, <MathText text="(f⁻¹ ∘ g⁻¹)(3)" />의 값을 구하시오.</>}
              done={state.p3Verified}
              extra={padButton('p3')}
            />
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="w-full sm:w-64">
                <NumInput id="l4-p3" theme="violet" label={<MathText text="(f⁻¹ ∘ g⁻¹)(3) =" />} value={state.p3_ans} onChange={(v) => setField('p3_ans', v)} />
              </div>
              <HintToggle open={!!hints.p3} onClick={() => toggleHint('p3')} />
            </div>
            {hints.p3 && (
              <HintBox>
                <MathText text="(f⁻¹ ∘ g⁻¹)(3) = (g ∘ f)⁻¹(3)" />이고, <MathText text="(g ∘ f)⁻¹(3) = k" />이면 성질 ②에 의해{' '}
                <MathText text="(g ∘ f)(k) = 3" />입니다. f와 g를 몰라도 구할 수 있어요!
              </HintBox>
            )}
            <ReasonInput
              id="l4-p3-reason"
              theme="violet"
              label="값을 구한 과정과 이용한 성질을 써 보세요."
              value={state.p3Reason}
              onChange={(v) => setField('p3Reason', v)}
            />
            <FeedbackBanner fb={feedback.p3} />
            <VerifyButton theme="violet" onClick={() => verify('p3', 'p3Verified', validateL4Prob3)}>
              [문제 3] 정답 확인하기
            </VerifyButton>
          </div>

          <NavRow onPrev={() => goStep(2)} onNext={() => goStep(4)} nextLabel="다음 단계: 그래프와 y = x 대칭" />
        </div>
      )}

      {/* =====================================================================
          STEP 4: 함수와 그 역함수의 그래프 — y = x 대칭, 문제 4, 공학 도구, 성찰
      ===================================================================== */}
      {step === 4 && (
        <div className="space-y-6">
          <TextbookCard
            theme="orange"
            badge="그래프"
            title={<>점 <MathText text="(a, b)" />와 점 <MathText text="(b, a)" />는 직선 <MathText text="y = x" />에 대하여 대칭</>}
            file="image_l4_graph.png"
            alt="함수 y = f(x)의 그래프 위의 점 (a, b)와 역함수 그래프 위의 점 (b, a)가 직선 y = x에 대하여 대칭임을 보여 주는 그림"
            maxH="max-h-[220px]"
          >
            <div className="rounded-2xl border border-orange-200/90 bg-orange-50/40 p-4 sm:p-5 space-y-3">
              <div className="text-xs font-extrabold text-orange-800 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-orange-600" />
                <span>
                  [보기] <MathText text="y = 2x − 2" />와 역함수 <MathText text="y = (1/2)x + 1" /> — 점을 움직여 보세요
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="rounded-xl border border-slate-200 bg-white p-2">
                  <LinearGraph
                    lines={[
                      { a: 1, b: 0, color: '#94a3b8', width: 1.6, label: 'y=x' },
                      { a: 2, b: -2, color: '#2563eb', label: 'f' },
                      { a: 1 / 2, b: 1, color: '#e11d48', label: 'f-inverse' },
                    ]}
                    points={[
                      { ...P, color: '#2563eb', label: `(${fractionText(P.x)}, ${fractionText(P.y)})` },
                      { x: P.y, y: P.x, color: '#e11d48', label: `(${fractionText(P.y)}, ${fractionText(P.x)})` },
                    ]}
                    links={[{ from: { ...P, color: '' }, to: { x: P.y, y: P.x, color: '' } }]}
                    ariaLabel={`y = 2x − 2 위의 점 (${P.x}, ${P.y})와 역함수 위의 점 (${P.y}, ${P.x})`}
                  />
                </div>
                <div className="space-y-3">
                  <GraphLegend
                    items={[
                      { color: '#2563eb', label: 'y = 2x − 2' },
                      { color: '#e11d48', label: 'y = (1/2)x + 1' },
                      { color: '#94a3b8', label: 'y = x' },
                    ]}
                  />
                  <label className="block text-xs font-bold text-slate-700">
                    점의 x좌표 a = {fractionText(pointT)}
                    <input
                      type="range"
                      min={-1}
                      max={4}
                      step={0.5}
                      value={pointT}
                      onChange={(e) => setPointT(Number(e.target.value))}
                      className="mt-1 w-full accent-orange-600"
                    />
                  </label>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    <MathText text="b = f(a) ⟺ a = f⁻¹(b)" />이므로 점 <strong className="text-blue-700">({fractionText(P.x)}, {fractionText(P.y)})</strong>가{' '}
                    <MathText text="y = f(x)" /> 위에 있으면 점 <strong className="text-rose-700">({fractionText(P.y)}, {fractionText(P.x)})</strong>는{' '}
                    <MathText text="y = f⁻¹(x)" /> 위에 있습니다. 두 점을 잇는 점선은 직선 <MathText text="y = x" />와 수직으로 만나요.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border-2 border-orange-500/70 bg-orange-50/60 p-4 text-center text-xs sm:text-sm font-bold text-slate-800">
              함수와 그 역함수의 그래프 사이의 관계 — 함수 <MathText text="y = f(x)" />의 그래프와 그 역함수 <MathText text="y = f⁻¹(x)" />의 그래프는{' '}
              <span className="text-orange-800">직선 <MathText text="y = x" />에 대하여 대칭</span>이다.
            </div>
          </TextbookCard>

          {/* 문제 4 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <ActivityHeader theme="orange" kicker="탐구 활동 05-A" title="[문제 4] 다음 함수와 그 역함수의 그래프를 그리시오." done={state.p4Verified} />
            <p className="text-xs text-slate-600">역함수의 식을 입력하면 그래프가 빨간 점선으로 그려집니다. 원래 그래프와 직선 y = x에 대하여 대칭인지 확인해 보세요.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {L4_P4_FUNCS.map((fn, i) => {
                const key = i === 0 ? 'p4_1_inv' : 'p4_2_inv';
                const val = state[key];
                const parsed = (val || '').trim() ? parseLinear(val) : null;
                return (
                  <div key={fn.label} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2">
                    <ExprInput
                      id={`l4-p4-${i + 1}`}
                      theme="orange"
                      label={<>({i + 1}) <MathText text={fn.label} />의 역함수</>}
                      prefix="y ="
                      value={val}
                      onChange={(v) => setField(key, v)}
                    />
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <LinearGraph
                        lines={[
                          { a: 1, b: 0, color: '#94a3b8', width: 1.6 },
                          { a: fn.a, b: fn.b, color: '#2563eb' },
                          ...(parsed ? [{ a: parsed.a, b: parsed.b, color: '#e11d48', dashed: true }] : []),
                        ]}
                        range={10}
                        ariaLabel={`${fn.label}의 그래프${parsed ? `와 입력한 역함수 y = ${formatLinear(parsed)}의 그래프` : ''}`}
                      />
                    </div>
                    <GraphLegend
                      items={[
                        { color: '#2563eb', label: fn.label },
                        { color: '#e11d48', label: parsed ? `y = ${formatLinear(parsed)}` : '입력한 역함수', dashed: true },
                        { color: '#94a3b8', label: 'y = x' },
                      ]}
                    />
                  </div>
                );
              })}
            </div>
            <FeedbackBanner fb={feedback.p4} />
            <VerifyButton theme="orange" onClick={() => verify('p4', 'p4Verified', validateL4Prob4)}>
              [문제 4] 정답 확인하기
            </VerifyButton>
          </div>

          {/* 공학 도구 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-extrabold text-orange-600">탐구 활동 05-B · 공학 도구</span>
                <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">함수와 그 역함수의 그래프 탐구하기</h4>
              </div>
              <div className="flex items-center gap-2">
                <DoneBadge show={state.toolVerified} />
                <ToggleButton on={showToolImg} onClick={() => setShowToolImg((v) => !v)} onLabel="교과서 닫기" offLabel="교과서 활동 보기" />
              </div>
            </div>
            {showToolImg && (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 flex justify-center">
                <img
                  src={textbookSrc('image_l4_tool.png')}
                  onError={(e) => onTextbookError(e, 'image_l4_tool.png')}
                  alt="교과서 공학 도구 활동 - 공학 프로그램에서 f(x)=ax+1과 역함수의 그래프를 슬라이더로 비교하는 화면"
                  className="max-h-[480px] w-auto max-w-full object-contain rounded-lg"
                />
              </div>
            )}
            <p className="text-xs text-slate-600">
              교과서의 공학 프로그램 대신 아래 슬라이더로 같은 탐구를 할 수 있습니다. <MathText text="f(x) = ax + 1" />과 그 역함수{' '}
              <MathText text="g(x)" />, 그리고 <MathText text="y = f(x)" />의 그래프를 직선 <MathText text="y = x" />에 대하여 대칭이동한 그래프를 비교해 보세요.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="rounded-xl border border-slate-200 bg-white p-2">
                <LinearGraph
                  lines={[
                    { a: 1, b: 0, color: '#94a3b8', width: 1.6 },
                    { a: sliderA, b: 1, color: '#059669', label: 'f' },
                    ...(sliderInv ? [{ a: sliderInv.a, b: sliderInv.b, color: '#2563eb', width: 5, label: 'g' }] : []),
                    ...(sliderInv && showReflect ? [{ a: sliderInv.a, b: sliderInv.b, color: '#e11d48', dashed: true, label: 'reflect' }] : []),
                  ]}
                  ariaLabel={`f(x) = ${fractionText(sliderA)}x + 1${sliderInv ? `, 역함수 g(x) = ${formatLinear(sliderInv)}` : ', 역함수 없음'}`}
                />
              </div>
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  a = {fractionText(sliderA)}
                  <input
                    type="range"
                    min={-4}
                    max={4}
                    step={0.5}
                    value={sliderA}
                    onChange={(e) => setSliderA(Number(e.target.value))}
                    className="mt-1 w-full accent-orange-600"
                  />
                </label>
                <div className="space-y-1 text-xs sm:text-sm font-bold">
                  <div className="text-emerald-700">
                    <MathText text={`f(x) = ${formatLinear({ a: sliderA, b: 1 })}`} />
                  </div>
                  <div className="text-blue-700">
                    {sliderInv ? (
                      <MathText text={`g(x) = f⁻¹(x) = ${formatLinear(sliderInv)}`} />
                    ) : (
                      <span className="text-rose-700">a = 0이면 f(x) = 1(상수함수)이므로 일대일대응이 아니어서 역함수가 없습니다.</span>
                    )}
                  </div>
                </div>
                <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700">
                  <input type="checkbox" checked={showReflect} onChange={(e) => setShowReflect(e.target.checked)} className="accent-rose-600" />
                  <span>④ y = f(x)를 직선 y = x에 대하여 대칭이동한 그래프 (빨간 점선)</span>
                </label>
                <GraphLegend
                  items={[
                    { color: '#059669', label: 'y = f(x)' },
                    { color: '#2563eb', label: 'y = g(x) (역함수)' },
                    { color: '#e11d48', label: '대칭이동한 그래프', dashed: true },
                    { color: '#94a3b8', label: 'y = x' },
                  ]}
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                <span className="mr-1 rounded-md bg-orange-100 px-1.5 py-0.5 text-[11px] font-extrabold text-orange-700">확인 1</span>
                슬라이더를 움직여 a의 값이 변하더라도 y = g(x)의 그래프와 ④의 그래프가 항상 겹쳐지나요?
              </div>
              <ChoiceButtons
                theme="orange"
                value={state.toolAlwaysOverlap}
                options={[
                  ['yes', '항상 겹쳐진다'],
                  ['no', 'a의 값에 따라 겹쳐지지 않을 때도 있다'],
                ] as const}
                onPick={(v) => setField('toolAlwaysOverlap', v)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <NumInput
                id="l4-tool-parallel"
                theme="orange"
                label={<><span className="mr-1 rounded-md bg-orange-100 px-1.5 py-0.5 text-[11px] font-extrabold text-orange-700">확인 2</span>y = f(x)와 y = g(x)의 그래프가 평행할 때 a의 값</>}
                value={state.toolParallelA}
                onChange={(v) => setField('toolParallelA', v)}
              />
              <NumInput
                id="l4-tool-same"
                theme="orange"
                label={<><span className="mr-1 rounded-md bg-orange-100 px-1.5 py-0.5 text-[11px] font-extrabold text-orange-700">확인 3</span>y = f(x)와 y = g(x)의 그래프가 일치할 때 a의 값</>}
                value={state.toolSameA}
                onChange={(v) => setField('toolSameA', v)}
              />
            </div>
            <FeedbackBanner fb={feedback.tool} />
            <VerifyButton theme="orange" onClick={() => verify('tool', 'toolVerified', validateL4Tool)}>
              [공학 도구] 정답 확인하기
            </VerifyButton>
          </div>

          {/* 4차시 성찰 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-extrabold text-indigo-600">4차시 마무리 성찰</span>
                <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">역함수의 존재 조건과 그래프의 대칭성 정리하기</h4>
              </div>
              <HintToggle open={!!hints.reflection} onClick={() => toggleHint('reflection')} label="💡 성찰 힌트 보기" />
            </div>
            {hints.reflection && (
              <HintBox>
                <div>
                  • <strong>성찰 1 예시</strong>: “역함수는 대응을 거꾸로 뒤집은 함수이므로, 뒤집어도 함수가 되려면 원래 함수가 일대일대응이어야 한다.”
                </div>
                <div>
                  • <strong>성찰 2 예시</strong>: “(a, b)가 f의 그래프 위에 있으면 (b, a)는 f⁻¹의 그래프 위에 있어서 두 그래프가 y = x에 대하여 대칭이다.”
                </div>
              </HintBox>
            )}
            <ReasonInput
              id="l4-reflection1"
              theme="indigo"
              label="1. 역함수가 존재하기 위한 조건과 그 이유를 정리해 보세요."
              value={state.reflection1}
              onChange={(v) => onUpdate((prev) => ({ ...prev, reflection1: v }))}
            />
            <ReasonInput
              id="l4-reflection2"
              theme="indigo"
              label={<>2. 함수와 역함수의 그래프가 직선 <MathText text="y = x" />에 대하여 대칭인 이유나 오늘 새롭게 알게 된 점을 적어 보세요.</>}
              value={state.reflection2}
              onChange={(v) => onUpdate((prev) => ({ ...prev, reflection2: v }))}
            />
            <div className="pt-3 border-t border-slate-100">
              <NavRow
                onPrev={() => goStep(3)}
                onNext={onGoToLesson5}
                nextLabel="다음 차시: 05차시 유리함수1로 이동"
                nextDark
              />
            </div>
          </div>
        </div>
      )}

      {/* 문제별 연습장 (3·4단계에서만) */}
      {openPad && PAD_STEP[openPad] === step && (
        <ScratchPadWindow
          key={openPad}
          title={PAD_TITLES[openPad]}
          strokes={pads[openPad] || []}
          onChange={(next) => setPads((prev) => ({ ...prev, [openPad]: next }))}
          onClose={() => setOpenPad(null)}
          onRequestConfirm={onRequestConfirm}
          fileName={`4차시_연습장_${openPad}`}
        />
      )}
    </div>
  );
};
