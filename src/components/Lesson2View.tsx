import React, { useState } from 'react';
import {
  Lesson2State,
  TopicId,
  evaluateLevel2Completion,
  validateL2Bogi,
  validateL2Prob6,
  validateL2Prob7,
  validateL2Think1,
  validateL2Think2,
} from '../utils/mathLogic';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Lightbulb,
  Sparkles,
  TrendingUp,
  Film,
  Vote,
} from 'lucide-react';
import { CharCountBadge, getCharCountBorderClass } from './CharCountBadge';
import { MathText } from './MathText';

interface Lesson2ViewProps {
  state: Lesson2State;
  step: number;
  onStepChange: (nextStep: number) => void;
  onUpdate: (updater: (prev: Lesson2State) => Lesson2State) => void;
  onChangeTopic?: (nextTopic: TopicId) => void;
  onGoToLesson3?: () => void;
  onRequestConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

const getTextbookImageSrc = (fileName: string): string => {
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')) {
    return `./public/assets/aistudio/${fileName}`;
  }
  return `/assets/aistudio/${fileName}`;
};

const handleTextbookImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fileName: string
) => {
  const img = e.currentTarget;
  if (!img.dataset.fallbackStep) {
    img.dataset.fallbackStep = '1';
    img.src = `./public/assets/aistudio/${fileName}`;
  } else if (img.dataset.fallbackStep === '1') {
    img.dataset.fallbackStep = '2';
    img.src = `./assets/aistudio/${fileName}`;
  }
};

const MOVIE_STUDENTS = ['학생 1', '학생 2', '학생 3', '학생 4', '학생 5'] as const;
const MOVIE_LIST = ['영화 A', '영화 B', '영화 C', '영화 D', '영화 E'] as const;
const CLUB_MEMBERS = ['회원 A', '회원 B', '회원 C', '회원 D'] as const;

export const Lesson2View: React.FC<Lesson2ViewProps> = ({
  state,
  step,
  onStepChange,
  onUpdate,
  onGoToLesson3,
}) => {
  const [feedback, setFeedback] = useState<Record<string, { text: string; type: 'good' | 'warn' }>>({});
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});

  // Step 0: [보기] f(x)=2x & g(x)=x² 두 원소 x1, x2 비교 시뮬레이터 상태
  const [bogiX1, setBogiX1] = useState<number>(-1);
  const [bogiX2, setBogiX2] = useState<number>(1);

  // Step 1: [문제 6] 수평선 판정법 y = k 슬라이더 상태
  const [horizLineK, setHorizLineK] = useState<number>(1);

  // Step 2: [문제 7] 항등함수·상수함수 x = a 대입 시뮬레이터 상태
  const [prob7TestX, setProb7TestX] = useState<number>(1.5);

  // Step 3: [생각 넓히기] 활동 1 & 활동 2 화살표 선택 상태
  const [selectedStudentForMovie, setSelectedStudentForMovie] = useState<string>('학생 1');
  const [selectedVoter, setSelectedVoter] = useState<string>('회원 A');

  const completion = evaluateLevel2Completion(state);

  const showNotice = (id: string, text: string, type: 'good' | 'warn') => {
    setFeedback((prev) => ({ ...prev, [id]: { text, type } }));
  };

  const toggleHint = (id: string) => {
    setShowHints((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // --- Step 0 Verification ([보기] 일대일함수와 일대일대응) ---
  const handleVerifyBogi = () => {
    const res = validateL2Bogi(state);
    if (res.ok) {
      onUpdate((prev) => ({
        ...prev,
        bogiVerified: true,
        guess: `[보기 탐구] ① f(x)=2x: 일대일함수 O, 일대일대응 O (치역=공역) / ② g(x)=x²: 일대일함수 X (${prev.bogi2Reason})`,
      }));
    }
    showNotice('bogi', res.message, res.type);
  };

  // --- Step 1 Verification ([문제 6] 일대일함수와 일대일대응 판별) ---
  const handleVerifyProb6 = () => {
    const res = validateL2Prob6(state);
    if (res.ok) {
      onUpdate((prev) => ({
        ...prev,
        prob6Verified: true,
        decision: 'true',
        decisionChecked: true,
        proofText: `[문제 6] 일대일함수 및 일대일대응: (1) y=3x-1, (4) 구간함수 / 일대일대응 이유: ${prev.prob6BijectiveReason} / (2),(3) 아닌 이유: ${prev.prob6NonOneToOneReason}`,
      }));
    }
    showNotice('prob6', res.message, res.type);
  };

  // --- Step 2 Verification ([문제 7] 항등함수와 상수함수) ---
  const handleVerifyProb7 = () => {
    const res = validateL2Prob7(state);
    if (res.ok) {
      onUpdate((prev) => ({
        ...prev,
        prob7Verified: true,
        counterReason: `[문제 7] 항등함수: (${prev.prob7IdentityChoice})번, 상수함수: (${prev.prob7ConstantChoice})번 / (2)번 x=1이 함수가 아닌 이유: ${prev.prob7Graph2Reason}`,
      }));
    }
    showNotice('prob7', res.message, res.type);
  };

  // --- Step 3 Verification ([생각 넓히기] 활동 1 & 활동 2) ---
  const handleVerifyThink1 = () => {
    const res = validateL2Think1(state);
    if (res.ok) {
      onUpdate((prev) => ({
        ...prev,
        think1Verified: true,
        share: `[활동 1 영화관] 일대일대응: ${prev.think1BijectiveCase} / 상수함수: ${prev.think1ConstantCase}`,
      }));
    }
    showNotice('think1', res.message, res.type);
  };

  const handleVerifyThink2 = () => {
    const res = validateL2Think2(state);
    if (res.ok) {
      onUpdate((prev) => ({
        ...prev,
        think2Verified: true,
        nextQuestion: `[활동 2 동아리 투표] 항등함수: ${prev.think2IdentityCase} / 상수함수: ${prev.think2ConstantCase}`,
      }));
    }
    showNotice('think2', res.message, res.type);
  };

  // --- Step 0 SVG Renderers ([보기] ① f(x)=2x vs ② g(x)=x²) ---
  const renderBogiGraph1 = () => {
    const size = 240;
    const center = 120;
    const xUnit = 26;
    const yUnit = 18;
    const toX = (x: number) => center + x * xUnit;
    const toY = (y: number) => center - y * yUnit;

    const y1 = 2 * bogiX1;
    const y2 = 2 * bogiX2;

    return (
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[260px] h-auto rounded-xl border border-blue-200 bg-white shadow-xs select-none mx-auto"
        role="img"
        aria-label="보기 1번 함수 f(x) = 2x 그래프 시뮬레이션"
      >
        {[-3, -2, -1, 1, 2, 3].map((t) => (
          <React.Fragment key={t}>
            <line x1={toX(t)} y1={10} x2={toX(t)} y2={size - 10} stroke="#f1f5f9" strokeWidth={1} />
            <line x1={10} y1={toY(t * 2)} x2={size - 10} y2={toY(t * 2)} stroke="#f1f5f9" strokeWidth={1} />
          </React.Fragment>
        ))}
        {/* Y-axis range highlight: all real numbers */}
        <line x1={center} y1={12} x2={center} y2={size - 12} stroke="#93c5fd" strokeWidth={5} strokeOpacity={0.5} />

        {/* Axes */}
        <line x1={10} y1={center} x2={size - 10} y2={center} stroke="#334155" strokeWidth={1.5} />
        <line x1={center} y1={size - 10} x2={center} y2={10} stroke="#334155" strokeWidth={1.5} />
        <text x={size - 16} y={center + 13} className="fill-slate-700 text-[10px] font-bold italic">x</text>
        <text x={center + 6} y={18} className="fill-slate-700 text-[10px] font-bold italic">y</text>
        <text x={center - 10} y={center + 12} className="fill-slate-500 text-[9px] font-semibold">O</text>

        {/* Line y = 2x */}
        <line
          x1={toX(-3)}
          y1={toY(-6)}
          x2={toX(3)}
          y2={toY(6)}
          stroke="#2563eb"
          strokeWidth={2.5}
        />
        <text x={toX(1.8)} y={toY(5.2)} className="fill-blue-700 text-[10px] font-extrabold mono">
          y = f(x) = 2x
        </text>

        {/* Point x1 */}
        <line x1={toX(bogiX1)} y1={center} x2={toX(bogiX1)} y2={toY(y1)} stroke="#0284c7" strokeDasharray="3 2" strokeWidth={1.2} />
        <line x1={center} y1={toY(y1)} x2={toX(bogiX1)} y2={toY(y1)} stroke="#0284c7" strokeDasharray="3 2" strokeWidth={1.2} />
        <circle cx={toX(bogiX1)} cy={toY(y1)} r={4.5} fill="#0284c7" stroke="#ffffff" strokeWidth={1.5} />
        <text x={toX(bogiX1)} y={center + 12} textAnchor="middle" className="fill-sky-800 text-[9px] font-extrabold mono">
          x₁={bogiX1}
        </text>

        {/* Point x2 */}
        <line x1={toX(bogiX2)} y1={center} x2={toX(bogiX2)} y2={toY(y2)} stroke="#4f46e5" strokeDasharray="3 2" strokeWidth={1.2} />
        <line x1={center} y1={toY(y2)} x2={toX(bogiX2)} y2={toY(y2)} stroke="#4f46e5" strokeDasharray="3 2" strokeWidth={1.2} />
        <circle cx={toX(bogiX2)} cy={toY(y2)} r={4.5} fill="#4f46e5" stroke="#ffffff" strokeWidth={1.5} />
        <text x={toX(bogiX2)} y={center - 5} textAnchor="middle" className="fill-indigo-800 text-[9px] font-extrabold mono">
          x₂={bogiX2}
        </text>
      </svg>
    );
  };

  const renderBogiGraph2 = () => {
    const size = 240;
    const centerX = 120;
    const centerY = 175;
    const xUnit = 30;
    const yUnit = 24;
    const toX = (x: number) => centerX + x * xUnit;
    const toY = (y: number) => centerY - y * yUnit;

    const y1 = bogiX1 * bogiX1;
    const y2 = bogiX2 * bogiX2;
    const isSameY = bogiX1 !== bogiX2 && Math.abs(y1 - y2) < 1e-6;

    const pathD = Array.from({ length: 53 }, (_, i) => {
      const x = -2.6 + i * 0.1;
      const y = x * x;
      return `${i === 0 ? 'M' : 'L'} ${toX(x)} ${toY(y)}`;
    }).join(' ');

    return (
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[260px] h-auto rounded-xl border border-rose-200 bg-white shadow-xs select-none mx-auto"
        role="img"
        aria-label="보기 2번 함수 g(x) = x² 그래프 시뮬레이션"
      >
        {[-3, -2, -1, 1, 2, 3].map((t) => (
          <line key={`gx-${t}`} x1={toX(t)} y1={10} x2={toX(t)} y2={size - 10} stroke="#f1f5f9" strokeWidth={1} />
        ))}
        {[1, 2, 3, 4, 5, 6].map((t) => (
          <line key={`gy-${t}`} x1={10} y1={toY(t)} x2={size - 10} y2={toY(t)} stroke="#f1f5f9" strokeWidth={1} />
        ))}

        {/* Axes */}
        <line x1={10} y1={centerY} x2={size - 10} y2={centerY} stroke="#334155" strokeWidth={1.5} />
        <line x1={centerX} y1={size - 10} x2={centerX} y2={10} stroke="#334155" strokeWidth={1.5} />
        <text x={size - 16} y={centerY + 13} className="fill-slate-700 text-[10px] font-bold italic">x</text>
        <text x={centerX + 6} y={18} className="fill-slate-700 text-[10px] font-bold italic">y</text>
        <text x={centerX - 10} y={centerY + 12} className="fill-slate-500 text-[9px] font-semibold">O</text>

        {/* Parabola y = x² */}
        <path d={pathD} fill="none" stroke="#e11d48" strokeWidth={2.5} />
        <text x={toX(1.5)} y={toY(5.6)} className="fill-rose-700 text-[10px] font-extrabold mono">
          y = g(x) = x²
        </text>

        {/* Point x1 */}
        <line x1={toX(bogiX1)} y1={centerY} x2={toX(bogiX1)} y2={toY(y1)} stroke="#e11d48" strokeDasharray="3 2" strokeWidth={1.2} />
        <line x1={centerX} y1={toY(y1)} x2={toX(bogiX1)} y2={toY(y1)} stroke="#e11d48" strokeDasharray="3 2" strokeWidth={1.2} />
        <circle cx={toX(bogiX1)} cy={toY(y1)} r={4.5} fill="#e11d48" stroke="#ffffff" strokeWidth={1.5} />
        <text x={toX(bogiX1)} y={centerY + 13} textAnchor="middle" className="fill-rose-800 text-[9px] font-extrabold mono">
          {bogiX1}
        </text>

        {/* Point x2 */}
        <line x1={toX(bogiX2)} y1={centerY} x2={toX(bogiX2)} y2={toY(y2)} stroke="#e11d48" strokeDasharray="3 2" strokeWidth={1.2} />
        <line x1={centerX} y1={toY(y2)} x2={toX(bogiX2)} y2={toY(y2)} stroke="#e11d48" strokeDasharray="3 2" strokeWidth={1.2} />
        <circle cx={toX(bogiX2)} cy={toY(y2)} r={4.5} fill="#e11d48" stroke="#ffffff" strokeWidth={1.5} />
        <text x={toX(bogiX2)} y={centerY + 13} textAnchor="middle" className="fill-rose-800 text-[9px] font-extrabold mono">
          {bogiX2}
        </text>

        {isSameY && (
          <g>
            <circle cx={centerX} cy={toY(y1)} r={4} fill="#e11d48" />
            <text x={centerX + 5} y={toY(y1) - 4} className="fill-rose-700 text-[9px] font-extrabold mono">
              y={y1} (같음!)
            </text>
          </g>
        )}
      </svg>
    );
  };

  // --- Step 1 SVG Renderers ([문제 6] (1)~(4) 수평선 판정법 y = k 시뮬레이터) ---
  const handleGraphClickK = (
    e: React.MouseEvent<SVGSVGElement>,
    centerY: number,
    yUnit: number,
    size: number
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const scale = rect.height / size;
    const rawK = (centerY * scale - clickY) / (yUnit * scale);
    const clampedK = Math.max(-3, Math.min(4, Number(rawK.toFixed(1))));
    setHorizLineK(clampedK);
  };

  // (1) y = 3x - 1
  const renderProb6Sim1 = (k: number) => {
    const size = 220;
    const center = 115;
    const unit = 24;
    const toX = (x: number) => center + x * unit;
    const toY = (y: number) => center - y * unit;

    const xInt = (k + 1) / 3;

    return (
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[230px] h-auto rounded-xl border border-slate-200 bg-white shadow-xs select-none cursor-ns-resize mx-auto"
        onClick={(e) => handleGraphClickK(e, center, unit, size)}
        role="img"
        aria-label="문제 6-(1) y = 3x - 1 그래프 시뮬레이션"
      >
        {[-3, -2, -1, 1, 2, 3].map((t) => (
          <React.Fragment key={t}>
            <line x1={toX(t)} y1={10} x2={toX(t)} y2={size - 10} stroke="#f1f5f9" strokeWidth={1} />
            <line x1={10} y1={toY(t)} x2={size - 10} y2={toY(t)} stroke="#f1f5f9" strokeWidth={1} />
          </React.Fragment>
        ))}
        {/* Range highlight on Y-axis: all real numbers */}
        <line x1={center} y1={10} x2={center} y2={size - 10} stroke="#86efac" strokeWidth={5} strokeOpacity={0.65} />

        <line x1={10} y1={center} x2={size - 10} y2={center} stroke="#475569" strokeWidth={1.5} />
        <line x1={center} y1={size - 10} x2={center} y2={10} stroke="#475569" strokeWidth={1.5} />
        <text x={size - 15} y={center + 12} className="fill-slate-700 text-[10px] font-bold italic">x</text>
        <text x={center + 5} y={16} className="fill-slate-700 text-[10px] font-bold italic">y</text>
        <text x={center - 9} y={center + 11} className="fill-slate-500 text-[9px] font-semibold">O</text>

        {/* Line y = 3x - 1 */}
        <line
          x1={toX(-1.2)}
          y1={toY(3 * -1.2 - 1)}
          x2={toX(1.8)}
          y2={toY(3 * 1.8 - 1)}
          stroke="#2563eb"
          strokeWidth={2.5}
        />
        <circle cx={toX(0)} cy={toY(-1)} r={3} fill="#1d4ed8" />
        <text x={toX(0) + 4} y={toY(-1) + 10} className="fill-slate-700 text-[8px] font-bold mono">(0,-1)</text>

        {/* Horizontal line y = k */}
        <line
          x1={10}
          y1={toY(k)}
          x2={size - 10}
          y2={toY(k)}
          stroke="#059669"
          strokeWidth={2}
          strokeDasharray="4 2"
        />
        <text x={14} y={toY(k) - 4} className="fill-emerald-800 text-[9px] font-extrabold mono">
          y = {k.toFixed(1)}
        </text>

        {/* Intersection point */}
        <circle cx={toX(xInt)} cy={toY(k)} r={5.5} fill="#10b981" stroke="#ffffff" strokeWidth={2} />
      </svg>
    );
  };

  // (2) y = -x² + 2
  const renderProb6Sim2 = (k: number) => {
    const size = 220;
    const centerX = 110;
    const centerY = 105;
    const unit = 24;
    const toX = (x: number) => centerX + x * unit;
    const toY = (y: number) => centerY - y * unit;

    const pathD = Array.from({ length: 49 }, (_, i) => {
      const x = -2.4 + i * 0.1;
      const y = -(x * x) + 2;
      return `${i === 0 ? 'M' : 'L'} ${toX(x)} ${toY(y)}`;
    }).join(' ');

    const diff = 2 - k;
    const intersections =
      Math.abs(diff) < 1e-6
        ? [0]
        : diff > 0
        ? [-Math.sqrt(diff), Math.sqrt(diff)]
        : [];

    return (
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[230px] h-auto rounded-xl border border-slate-200 bg-white shadow-xs select-none cursor-ns-resize mx-auto"
        onClick={(e) => handleGraphClickK(e, centerY, unit, size)}
        role="img"
        aria-label="문제 6-(2) y = -x² + 2 그래프 시뮬레이션"
      >
        {[-3, -2, -1, 1, 2, 3].map((t) => (
          <React.Fragment key={t}>
            <line x1={toX(t)} y1={10} x2={toX(t)} y2={size - 10} stroke="#f1f5f9" strokeWidth={1} />
            <line x1={10} y1={toY(t)} x2={size - 10} y2={toY(t)} stroke="#f1f5f9" strokeWidth={1} />
          </React.Fragment>
        ))}
        {/* Range highlight on Y-axis: y <= 2 */}
        <line x1={centerX} y1={toY(2)} x2={centerX} y2={size - 10} stroke="#fca5a5" strokeWidth={5} strokeOpacity={0.65} />

        <line x1={10} y1={centerY} x2={size - 10} y2={centerY} stroke="#475569" strokeWidth={1.5} />
        <line x1={centerX} y1={size - 10} x2={centerX} y2={10} stroke="#475569" strokeWidth={1.5} />
        <text x={size - 15} y={centerY + 12} className="fill-slate-700 text-[10px] font-bold italic">x</text>
        <text x={centerX + 5} y={16} className="fill-slate-700 text-[10px] font-bold italic">y</text>
        <text x={centerX - 9} y={centerY + 11} className="fill-slate-500 text-[9px] font-semibold">O</text>

        <path d={pathD} fill="none" stroke="#6366f1" strokeWidth={2.5} />
        <circle cx={toX(0)} cy={toY(2)} r={3} fill="#4f46e5" />
        <text x={toX(0) + 4} y={toY(2) - 4} className="fill-indigo-900 text-[8px] font-bold mono">꼭짓점(0,2)</text>

        {/* Horizontal line y = k */}
        <line
          x1={10}
          y1={toY(k)}
          x2={size - 10}
          y2={toY(k)}
          stroke="#e11d48"
          strokeWidth={2}
          strokeDasharray="4 2"
        />
        <text x={14} y={toY(k) - 4} className="fill-rose-800 text-[9px] font-extrabold mono">
          y = {k.toFixed(1)}
        </text>

        {intersections.map((ix, idx) => (
          <circle
            key={idx}
            cx={toX(ix)}
            cy={toY(k)}
            r={5.5}
            fill="#e11d48"
            stroke="#ffffff"
            strokeWidth={2}
          />
        ))}
      </svg>
    );
  };

  // (3) y = |x|
  const renderProb6Sim3 = (k: number) => {
    const size = 220;
    const centerX = 110;
    const centerY = 135;
    const unit = 24;
    const toX = (x: number) => centerX + x * unit;
    const toY = (y: number) => centerY - y * unit;

    const intersections =
      Math.abs(k) < 1e-6 ? [0] : k > 0 ? [-k, k] : [];

    return (
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[230px] h-auto rounded-xl border border-slate-200 bg-white shadow-xs select-none cursor-ns-resize mx-auto"
        onClick={(e) => handleGraphClickK(e, centerY, unit, size)}
        role="img"
        aria-label="문제 6-(3) y = |x| 그래프 시뮬레이션"
      >
        {[-3, -2, -1, 1, 2, 3].map((t) => (
          <React.Fragment key={t}>
            <line x1={toX(t)} y1={10} x2={toX(t)} y2={size - 10} stroke="#f1f5f9" strokeWidth={1} />
            <line x1={10} y1={toY(t)} x2={size - 10} y2={toY(t)} stroke="#f1f5f9" strokeWidth={1} />
          </React.Fragment>
        ))}
        {/* Range highlight on Y-axis: y >= 0 */}
        <line x1={centerX} y1={10} x2={centerX} y2={centerY} stroke="#fca5a5" strokeWidth={5} strokeOpacity={0.65} />

        <line x1={10} y1={centerY} x2={size - 10} y2={centerY} stroke="#475569" strokeWidth={1.5} />
        <line x1={centerX} y1={size - 10} x2={centerX} y2={10} stroke="#475569" strokeWidth={1.5} />
        <text x={size - 15} y={centerY + 12} className="fill-slate-700 text-[10px] font-bold italic">x</text>
        <text x={centerX + 5} y={16} className="fill-slate-700 text-[10px] font-bold italic">y</text>
        <text x={centerX - 9} y={centerY + 11} className="fill-slate-500 text-[9px] font-semibold">O</text>

        {/* V-shape y = |x| */}
        <polyline
          points={`${toX(-3.8)},${toY(3.8)} ${toX(0)},${toY(0)} ${toX(3.8)},${toY(3.8)}`}
          fill="none"
          stroke="#d97706"
          strokeWidth={2.5}
        />

        {/* Horizontal line y = k */}
        <line
          x1={10}
          y1={toY(k)}
          x2={size - 10}
          y2={toY(k)}
          stroke="#e11d48"
          strokeWidth={2}
          strokeDasharray="4 2"
        />
        <text x={14} y={toY(k) - 4} className="fill-rose-800 text-[9px] font-extrabold mono">
          y = {k.toFixed(1)}
        </text>

        {intersections.map((ix, idx) => (
          <circle
            key={idx}
            cx={toX(ix)}
            cy={toY(k)}
            r={5.5}
            fill="#e11d48"
            stroke="#ffffff"
            strokeWidth={2}
          />
        ))}
      </svg>
    );
  };

  // (4) y = -2x (x >= 0), x² (x < 0)
  const renderProb6Sim4 = (k: number) => {
    const size = 220;
    const center = 115;
    const unit = 24;
    const toX = (x: number) => center + x * unit;
    const toY = (y: number) => center - y * unit;

    // Left curve for x < 0: y = x²
    const leftCurveD = Array.from({ length: 23 }, (_, i) => {
      const x = -2.2 + i * 0.1;
      const y = x * x;
      return `${i === 0 ? 'M' : 'L'} ${toX(x)} ${toY(y)}`;
    }).join(' ');

    // Intersection with y = k:
    // If k > 0: x = -sqrt(k) (< 0)
    // If k <= 0: x = -k / 2 (>= 0)
    const xInt = k > 0 ? -Math.sqrt(k) : -k / 2;

    return (
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[230px] h-auto rounded-xl border border-slate-200 bg-white shadow-xs select-none cursor-ns-resize mx-auto"
        onClick={(e) => handleGraphClickK(e, center, unit, size)}
        role="img"
        aria-label="문제 6-(4) 구간함수 그래프 시뮬레이션"
      >
        {[-3, -2, -1, 1, 2, 3].map((t) => (
          <React.Fragment key={t}>
            <line x1={toX(t)} y1={10} x2={toX(t)} y2={size - 10} stroke="#f1f5f9" strokeWidth={1} />
            <line x1={10} y1={toY(t)} x2={size - 10} y2={toY(t)} stroke="#f1f5f9" strokeWidth={1} />
          </React.Fragment>
        ))}
        {/* Range highlight on Y-axis: all real numbers */}
        <line x1={center} y1={10} x2={center} y2={size - 10} stroke="#86efac" strokeWidth={5} strokeOpacity={0.65} />

        <line x1={10} y1={center} x2={size - 10} y2={center} stroke="#475569" strokeWidth={1.5} />
        <line x1={center} y1={size - 10} x2={center} y2={10} stroke="#475569" strokeWidth={1.5} />
        <text x={size - 15} y={center + 12} className="fill-slate-700 text-[10px] font-bold italic">x</text>
        <text x={center + 5} y={16} className="fill-slate-700 text-[10px] font-bold italic">y</text>
        <text x={center - 9} y={center + 11} className="fill-slate-500 text-[9px] font-semibold">O</text>

        {/* x < 0: y = x² */}
        <path d={leftCurveD} fill="none" stroke="#0d9488" strokeWidth={2.5} />
        {/* x >= 0: y = -2x */}
        <line
          x1={toX(0)}
          y1={toY(0)}
          x2={toX(2.1)}
          y2={toY(-4.2)}
          stroke="#2563eb"
          strokeWidth={2.5}
        />
        <circle cx={toX(0)} cy={toY(0)} r={3.5} fill="#2563eb" />

        {/* Horizontal line y = k */}
        <line
          x1={10}
          y1={toY(k)}
          x2={size - 10}
          y2={toY(k)}
          stroke="#059669"
          strokeWidth={2}
          strokeDasharray="4 2"
        />
        <text x={14} y={toY(k) - 4} className="fill-emerald-800 text-[9px] font-extrabold mono">
          y = {k.toFixed(1)}
        </text>

        <circle cx={toX(xInt)} cy={toY(k)} r={5.5} fill="#10b981" stroke="#ffffff" strokeWidth={2} />
      </svg>
    );
  };

  // --- Step 2 SVG Renderers ([문제 7] (1) y=x, (2) x=1, (3) y=1) ---
  const renderProb7Graphs = (a: number) => {
    const size = 200;
    const center = 100;
    const unit = 26;
    const toX = (x: number) => center + x * unit;
    const toY = (y: number) => center - y * unit;

    return (
      <div className="grid gap-4 md:grid-cols-3">
        {/* (1) y = x */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col items-center space-y-2">
          <div className="w-full flex items-center justify-between text-xs font-extrabold text-slate-900">
            <span>(1) 직선 y = x</span>
            <span className="rounded-md px-2 py-0.5 bg-blue-100 text-blue-800 text-[11px]">
              f({a}) = {a} (항등함수)
            </span>
          </div>
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="w-full max-w-[200px] h-auto rounded-lg border border-slate-100 bg-white"
            role="img"
            aria-label="문제 7-(1) 항등함수 y = x 그래프"
          >
            <line x1={10} y1={center} x2={size - 10} y2={center} stroke="#334155" strokeWidth={1.5} />
            <line x1={center} y1={size - 10} x2={center} y2={10} stroke="#334155" strokeWidth={1.5} />
            <text x={size - 14} y={center + 12} className="fill-slate-700 text-[10px] font-bold italic">x</text>
            <text x={center + 5} y={16} className="fill-slate-700 text-[10px] font-bold italic">y</text>
            <text x={center - 10} y={center + 12} className="fill-slate-500 text-[9px] font-semibold">O</text>

            {/* Reference point (1, 1) */}
            <line x1={toX(1)} y1={center} x2={toX(1)} y2={toY(1)} stroke="#94a3b8" strokeDasharray="2 2" strokeWidth={1} />
            <line x1={center} y1={toY(1)} x2={toX(1)} y2={toY(1)} stroke="#94a3b8" strokeDasharray="2 2" strokeWidth={1} />
            <text x={toX(1)} y={center + 12} textAnchor="middle" className="fill-slate-600 text-[9px] mono">1</text>
            <text x={center - 6} y={toY(1) + 3} textAnchor="end" className="fill-slate-600 text-[9px] mono">1</text>

            {/* Line y = x */}
            <line x1={toX(-3)} y1={toY(-3)} x2={toX(3)} y2={toY(3)} stroke="#2563eb" strokeWidth={2.5} />

            {/* Active point (a, a) */}
            <line x1={toX(a)} y1={center} x2={toX(a)} y2={toY(a)} stroke="#2563eb" strokeDasharray="3 2" strokeWidth={1.2} />
            <line x1={center} y1={toY(a)} x2={toX(a)} y2={toY(a)} stroke="#2563eb" strokeDasharray="3 2" strokeWidth={1.2} />
            <circle cx={toX(a)} cy={toY(a)} r={5} fill="#2563eb" stroke="#ffffff" strokeWidth={2} />
            <text x={toX(a) + 6} y={toY(a) - 6} className="fill-blue-900 text-[9px] font-extrabold mono">
              ({a}, {a})
            </text>
          </svg>
          <p className="text-[11px] text-slate-600 text-center">
            모든 <span className="mono font-bold">x</span>가 자기 자신 <span className="mono font-bold">f(x) = x</span>에 대응합니다.
          </p>
        </div>

        {/* (2) x = 1 */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col items-center space-y-2">
          <div className="w-full flex items-center justify-between text-xs font-extrabold text-slate-900">
            <span>(2) 직선 x = 1</span>
            <span className="rounded-md px-2 py-0.5 bg-rose-100 text-rose-800 text-[11px]">
              {Math.abs(a - 1) < 0.05 ? 'y값 무수히 많음!' : '대응하는 y 없음!'}
            </span>
          </div>
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="w-full max-w-[200px] h-auto rounded-lg border border-slate-100 bg-white"
            role="img"
            aria-label="문제 7-(2) 수직선 x = 1 그래프"
          >
            <line x1={10} y1={center} x2={size - 10} y2={center} stroke="#334155" strokeWidth={1.5} />
            <line x1={center} y1={size - 10} x2={center} y2={10} stroke="#334155" strokeWidth={1.5} />
            <text x={size - 14} y={center + 12} className="fill-slate-700 text-[10px] font-bold italic">x</text>
            <text x={center + 5} y={16} className="fill-slate-700 text-[10px] font-bold italic">y</text>
            <text x={center - 10} y={center + 12} className="fill-slate-500 text-[9px] font-semibold">O</text>

            {/* Vertical Line x = 1 */}
            <line x1={toX(1)} y1={12} x2={toX(1)} y2={size - 12} stroke="#e11d48" strokeWidth={2.5} />
            <text x={toX(1) + 5} y={center + 12} className="fill-slate-700 text-[9px] font-bold mono">1</text>

            {/* Active vertical line at x = a */}
            <line x1={toX(a)} y1={12} x2={toX(a)} y2={size - 12} stroke="#64748b" strokeDasharray="3 2" strokeWidth={1.5} />
            {Math.abs(a - 1) < 0.05 &&
              [-2, -1, 0, 1, 2].map((yk) => (
                <circle key={yk} cx={toX(1)} cy={toY(yk)} r={4} fill="#e11d48" stroke="#ffffff" strokeWidth={1.5} />
              ))}
          </svg>
          <p className="text-[11px] text-rose-700 font-semibold text-center">
            <span className="mono font-bold">x = 1</span>에서 무수히 많은 점이 대응하므로 <strong>함수가 아닙니다!</strong>
          </p>
        </div>

        {/* (3) y = 1 */}
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-col items-center space-y-2">
          <div className="w-full flex items-center justify-between text-xs font-extrabold text-slate-900">
            <span>(3) 직선 y = 1</span>
            <span className="rounded-md px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px]">
              f({a}) = 1 (상수함수)
            </span>
          </div>
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="w-full max-w-[200px] h-auto rounded-lg border border-slate-100 bg-white"
            role="img"
            aria-label="문제 7-(3) 상수함수 y = 1 그래프"
          >
            <line x1={10} y1={center} x2={size - 10} y2={center} stroke="#334155" strokeWidth={1.5} />
            <line x1={center} y1={size - 10} x2={center} y2={10} stroke="#334155" strokeWidth={1.5} />
            <text x={size - 14} y={center + 12} className="fill-slate-700 text-[10px] font-bold italic">x</text>
            <text x={center + 5} y={16} className="fill-slate-700 text-[10px] font-bold italic">y</text>
            <text x={center - 10} y={center + 12} className="fill-slate-500 text-[9px] font-semibold">O</text>

            {/* Horizontal Line y = 1 */}
            <line x1={12} y1={toY(1)} x2={size - 12} y2={toY(1)} stroke="#059669" strokeWidth={2.5} />
            <text x={center - 6} y={toY(1) - 4} textAnchor="end" className="fill-slate-700 text-[9px] font-bold mono">1</text>

            {/* Active point (a, 1) */}
            <line x1={toX(a)} y1={center} x2={toX(a)} y2={toY(1)} stroke="#059669" strokeDasharray="3 2" strokeWidth={1.2} />
            <circle cx={toX(a)} cy={toY(1)} r={5} fill="#059669" stroke="#ffffff" strokeWidth={2} />
            <text x={toX(a)} y={toY(1) - 8} textAnchor="middle" className="fill-emerald-900 text-[9px] font-extrabold mono">
              ({a}, 1)
            </text>
          </svg>
          <p className="text-[11px] text-slate-600 text-center">
            모든 <span className="mono font-bold">x</span>가 단 하나의 상수 <span className="mono font-bold">1</span>에 대응합니다.
          </p>
        </div>
      </div>
    );
  };

  // --- Step 3 Helpers ([생각 넓히기] 활동 1 & 활동 2 시뮬레이션) ---
  const think1Map = state.think1Map || {};
  const think2Map = state.think2Map || {};

  const assignMovieToStudent = (studentName: string, movieName: string) => {
    onUpdate((prev) => ({
      ...prev,
      think1Map: { ...(prev.think1Map || {}), [studentName]: movieName },
    }));
    const idx = MOVIE_STUDENTS.indexOf(studentName as any);
    if (idx >= 0 && idx < MOVIE_STUDENTS.length - 1) {
      setSelectedStudentForMovie(MOVIE_STUDENTS[idx + 1]);
    }
  };

  const assignVoteToMember = (voter: string, target: string) => {
    onUpdate((prev) => ({
      ...prev,
      think2Map: { ...(prev.think2Map || {}), [voter]: target },
    }));
    const idx = CLUB_MEMBERS.indexOf(voter as any);
    if (idx >= 0 && idx < CLUB_MEMBERS.length - 1) {
      setSelectedVoter(CLUB_MEMBERS[idx + 1]);
    }
  };

  const getMovieMapClassification = () => {
    const chosen = MOVIE_STUDENTS.map((s) => think1Map[s]).filter(Boolean);
    if (chosen.length < 5) {
      return {
        label: `현재 ${chosen.length}/5명 선택됨 (5명 모두 영화를 선택해 보세요)`,
        tone: 'slate' as const,
      };
    }
    const uniqueMovies = new Set(chosen);
    if (uniqueMovies.size === 5) {
      return {
        label: '✨ 현재 대응: 일대일대응! (5명이 서로 다른 영화 5편을 빠짐없이 1편씩 선택함)',
        tone: 'emerald' as const,
      };
    }
    if (uniqueMovies.size === 1) {
      return {
        label: `✨ 현재 대응: 상수함수! (5명 모두가 '${chosen[0]}' 1편만 선택함)`,
        tone: 'blue' as const,
      };
    }
    return {
      label: `현재 대응: 일반 함수 (선택된 영화 ${uniqueMovies.size}편 — 중복 선택이 있어 일대일대응이 아님)`,
      tone: 'amber' as const,
    };
  };

  const getVoteMapClassification = () => {
    const chosen = CLUB_MEMBERS.map((m) => think2Map[m]).filter(Boolean);
    if (chosen.length < 4) {
      return {
        label: `현재 ${chosen.length}/4명 투표함 (4명 모두 투표 대상을 연결해 보세요)`,
        tone: 'slate' as const,
      };
    }
    const isIdentity = CLUB_MEMBERS.every((m) => think2Map[m] === m);
    if (isIdentity) {
      return {
        label: '✨ 현재 대응: 항등함수! (회원 4명 모두가 자기 자신에게 투표함, f(x) = x)',
        tone: 'emerald' as const,
      };
    }
    const uniqueTargets = new Set(chosen);
    if (uniqueTargets.size === 1) {
      return {
        label: `✨ 현재 대응: 상수함수! (회원 4명 모두가 '${chosen[0]}' 1명에게만 투표함)`,
        tone: 'blue' as const,
      };
    }
    if (uniqueTargets.size === 4) {
      return {
        label: '현재 대응: 일대일대응 (서로 다른 회원에게 1표씩 나뉘었으나 자기 자신이 아닌 투표 포함)',
        tone: 'amber' as const,
      };
    }
    return {
      label: '현재 대응: 일반 함수 (항등함수도 상수함수도 아닌 대응)',
      tone: 'amber' as const,
    };
  };

  return (
    <div className="space-y-6">
      {/* =====================================================================
          STEP 0: 일대일함수와 일대일대응 ([보기] 탐구)
         ===================================================================== */}
      {step === 0 && (
        <div className="space-y-6">
          <div>
            <div className="text-xs font-bold text-blue-600">
              02차시 · 여러 가지 함수 · 1 / 4단계
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              탐구 01 · 일대일함수와 일대일대응은 어떻게 다를까?
            </h2>
            <p className="mt-1 text-sm sm:text-base text-slate-600">
              정의역의 서로 다른 두 원소에 서로 다른 함숫값이 대응하는 <strong>일대일함수</strong>와, 여기에 <strong>치역과 공역이 같다</strong>는 조건이 더해진 <strong>일대일대응</strong>을 비교해 봅시다.
            </p>
          </div>

          {/* 핵심 개념 요약 카드 */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 sm:p-5 space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-extrabold text-white">
                개념 1 · 일대일함수
              </div>
              <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                함수 <span className="mono text-blue-700">f: X → Y</span>에서 정의역 <span className="mono">X</span>의 두 원소{' '}
                <span className="mono">x₁, x₂</span>에 대하여
              </p>
              <div className="rounded-xl border border-blue-200 bg-white px-3.5 py-2.5 text-center font-extrabold mono text-sm sm:text-base text-blue-900">
                x₁ ≠ x₂ 이면 f(x₁) ≠ f(x₂)
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                가 성립할 때, 이 함수 <span className="mono font-bold">f</span>를 <strong>일대일함수</strong>라고 합니다.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5 space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-extrabold text-white">
                개념 2 · 일대일대응
              </div>
              <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                함수 <span className="mono text-emerald-700">f: X → Y</span>가 다음 두 조건을 모두 만족시킬 때:
              </p>
              <div className="rounded-xl border border-emerald-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-bold text-emerald-950 space-y-1">
                <div>① 일대일함수이다. (<span className="mono">x₁ ≠ x₂ ⇒ f(x₁) ≠ f(x₂)</span>)</div>
                <div>② <strong>치역과 공역이 서로 같다.</strong></div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                이 함수 <span className="mono font-bold">f</span>를 <strong>일대일대응</strong>이라고 합니다. (모든 일대일대응은 일대일함수입니다.)
              </p>
            </div>
          </div>

          {/* 교과서 [보기] 이미지 */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 space-y-3">
            <div className="text-xs font-bold text-slate-500">교과서 본문 · [보기] 일대일함수와 일대일대응 판별</div>
            <img
              src={getTextbookImageSrc('image_45f458d5.png')}
              onError={(e) => handleTextbookImageError(e, 'image_45f458d5.png')}
              alt="교과서 보기: ① f(x)=2x 일대일대응, ② g(x)=x² 일대일함수가 아님"
              className="w-full max-w-2xl mx-auto h-auto rounded-lg"
            />
          </div>

          {/* [보기] 인터랙티브 시뮬레이션: 두 원소 x1, x2 대입 비교기 */}
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-700">
                  <Sparkles className="h-4 w-4" />
                  <span>인터랙티브 그래프 실험실</span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                  [보기] 두 원소 <span className="mono text-blue-700">x₁, x₂</span>를 직접 바꾸며 함숫값 비교하기
                </h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'x₁ = -1, x₂ = 1 (대칭 반례)', x1: -1, x2: 1 },
                  { label: 'x₁ = 1, x₂ = 2', x1: 1, x2: 2 },
                  { label: 'x₁ = -2, x₂ = 2', x1: -2, x2: 2 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setBogiX1(preset.x1);
                      setBogiX2(preset.x2);
                    }}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-bold border transition-colors ${
                      bogiX1 === preset.x1 && bogiX2 === preset.x2
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 bg-white rounded-xl p-3.5 border border-indigo-100">
              <div>
                <label htmlFor="bogi-x1-slider" className="block text-xs font-bold text-sky-800 mb-1">
                  첫 번째 원소 <span className="mono">x₁ = {bogiX1}</span>
                </label>
                <input
                  id="bogi-x1-slider"
                  type="range"
                  min={-2.5}
                  max={2.5}
                  step={0.5}
                  value={bogiX1}
                  onChange={(e) => setBogiX1(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>
              <div>
                <label htmlFor="bogi-x2-slider" className="block text-xs font-bold text-indigo-800 mb-1">
                  두 번째 원소 <span className="mono">x₂ = {bogiX2}</span>
                </label>
                <input
                  id="bogi-x2-slider"
                  type="range"
                  min={-2.5}
                  max={2.5}
                  step={0.5}
                  value={bogiX2}
                  onChange={(e) => setBogiX2(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-blue-200 bg-white p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-slate-900">① 함수 f(x) = 2x</span>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800">
                    일대일대응 O
                  </span>
                </div>
                {renderBogiGraph1()}
                <div className="rounded-lg bg-blue-50/70 p-2.5 text-xs text-slate-800 mono font-semibold text-center">
                  f({bogiX1}) = {2 * bogiX1}, f({bogiX2}) = {2 * bogiX2}{' '}
                  {bogiX1 !== bogiX2 ? '→ 서로 다름 (f(x₁) ≠ f(x₂))' : '(두 x값이 같음)'}
                </div>
              </div>

              <div className="rounded-xl border border-rose-200 bg-white p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-slate-900">② 함수 g(x) = x²</span>
                  <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-extrabold text-rose-800">
                    일대일함수 X
                  </span>
                </div>
                {renderBogiGraph2()}
                <div className="rounded-lg bg-rose-50/70 p-2.5 text-xs text-slate-800 mono font-semibold text-center">
                  g({bogiX1}) = {Number((bogiX1 * bogiX1).toFixed(2))}, g({bogiX2}) ={' '}
                  {Number((bogiX2 * bogiX2).toFixed(2))}{' '}
                  {bogiX1 !== bogiX2 && Math.abs(bogiX1 * bogiX1 - bogiX2 * bogiX2) < 1e-6
                    ? '→ ⚠️ x₁ ≠ x₂인데 함숫값이 같음!'
                    : ''}
                </div>
              </div>
            </div>
          </div>

          {/* [보기] 확인 학습 입력 영역 */}
          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                [보기] 일대일함수와 일대일대응 개념 확인
              </h3>
              {state.bogiVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  1단계 확인 완료
                </span>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <div className="text-sm font-bold text-slate-900">
                  1. [보기 ①] 함수 <span className="mono text-blue-700">f(x) = 2x</span>의 판별
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700">(1) 일대일함수인가요?</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { val: 'yes', label: '일대일함수이다' },
                      { val: 'no', label: '일대일함수가 아니다' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() =>
                          onUpdate((prev) => ({
                            ...prev,
                            bogi1IsOneToOne: opt.val as 'yes' | 'no',
                            bogiVerified: false,
                          }))
                        }
                        className={`rounded-lg border py-2 px-3 text-xs sm:text-sm font-bold transition-colors ${
                          state.bogi1IsOneToOne === opt.val
                            ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-600'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700">(2) 일대일대응인가요?</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { val: 'yes', label: '일대일대응이다' },
                      { val: 'no', label: '일대일대응이 아니다' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() =>
                          onUpdate((prev) => ({
                            ...prev,
                            bogi1IsBijective: opt.val as 'yes' | 'no',
                            bogiVerified: false,
                          }))
                        }
                        className={`rounded-lg border py-2 px-3 text-xs sm:text-sm font-bold transition-colors ${
                          state.bogi1IsBijective === opt.val
                            ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-600'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <div className="text-sm font-bold text-slate-900">
                  2. 일대일함수가 <strong>일대일대응</strong>이 되기 위해 추가로 만족해야 하는 조건은?
                </div>
                <div className="space-y-2">
                  {[
                    { val: 'range_eq_codomain', label: '치역과 공역이 서로 같다.' },
                    { val: 'domain_eq_range', label: '정의역과 치역이 항상 서로 같다.' },
                    { val: 'always_positive', label: '모든 함숫값이 양수여야 한다.' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() =>
                        onUpdate((prev) => ({
                          ...prev,
                          bogiConditionChoice: opt.val as Lesson2State['bogiConditionChoice'],
                          bogiVerified: false,
                        }))
                      }
                      className={`w-full text-left rounded-lg border py-2.5 px-3.5 text-xs sm:text-sm font-bold transition-colors ${
                        state.bogiConditionChoice === opt.val
                          ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-600'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              <div className="text-sm font-bold text-slate-900">
                3. [보기 ②] 함수 <span className="mono text-rose-700">g(x) = x²</span>의 판별 및 이유 서술
              </div>
              <div className="grid grid-cols-2 gap-2 max-w-md">
                {[
                  { val: 'yes', label: '일대일함수이다' },
                  { val: 'no', label: '일대일함수가 아니다' },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() =>
                      onUpdate((prev) => ({
                        ...prev,
                        bogi2IsOneToOne: opt.val as 'yes' | 'no',
                        bogiVerified: false,
                      }))
                    }
                    className={`rounded-lg border py-2 px-3 text-xs sm:text-sm font-bold transition-colors ${
                      state.bogi2IsOneToOne === opt.val
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-600'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                  <label htmlFor="bogi2Reason" className="text-xs sm:text-sm font-bold text-slate-800">
                    함수 <span className="mono">g(x) = x²</span>이 일대일함수가 아닌 이유를 구체적인 두 원소를 들어 서술하시오. (8자 이상)
                  </label>
                  <CharCountBadge current={(state.bogi2Reason || '').trim().length} min={8} />
                </div>
                <textarea
                  id="bogi2Reason"
                  rows={3}
                  value={state.bogi2Reason || ''}
                  onChange={(e) =>
                    onUpdate((prev) => ({
                      ...prev,
                      bogi2Reason: e.target.value,
                      bogiVerified: false,
                    }))
                  }
                  placeholder=""
                  className={`w-full rounded-xl border bg-slate-50/50 focus:bg-white p-3.5 text-sm sm:text-base text-slate-900 transition-colors ${getCharCountBorderClass(
                    (state.bogi2Reason || '').trim().length,
                    8
                  )}`}
                />
                <div className="mt-1.5">
                  <button
                    type="button"
                    onClick={() => toggleHint('bogi2_hint')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800"
                  >
                    <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                    {showHints.bogi2_hint ? '힌트 접기' : '💡 [보기 ②] 서술 힌트 보기'}
                  </button>
                  {showHints.bogi2_hint && (
                    <div className="mt-1.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 leading-relaxed">
                      <strong>작성 힌트:</strong> 정의역의 서로 다른 두 원소(예: <span className="mono font-bold">-1</span>과 <span className="mono font-bold">1</span>)는 서로 다르지만(<span className="mono font-bold">-1 ≠ 1</span>), 제곱한 함숫값은 <span className="mono font-bold">g(-1) = g(1) = 1</span>로 같아진다는 점을 문장으로 서술해 보세요.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleVerifyBogi}
                className="min-h-[44px] rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
              >
                [보기] 개념 확인하기
              </button>
              {completion[0] && (
                <button
                  type="button"
                  onClick={() => onStepChange(1)}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
                >
                  <span>다음 단계 [문제 6]으로 이동</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>

            {feedback.bogi && (
              <div
                role="status"
                className={`flex items-start gap-2 rounded-xl p-3.5 text-xs sm:text-sm font-medium ${
                  feedback.bogi.type === 'good'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                }`}
              >
                {feedback.bogi.type === 'good' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <span>{feedback.bogi.text}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 1: [문제 6] 일대일함수와 일대일대응 판별
         ===================================================================== */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <div className="text-xs font-bold text-blue-600">
              02차시 · 여러 가지 함수 · 2 / 4단계
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              탐구 02 · [문제 6] 일대일함수를 찾고 일대일대응인지 확인하기
            </h2>
            <p className="mt-1 text-sm sm:text-base text-slate-600">
              각 함수의 그래프에 <span className="mono font-bold text-emerald-700">x축에 평행한 수평선 y = k</span>를 그어 교점의 개수와 치역의 범위를 비교해 봅시다.
            </p>
          </div>

          {/* 교과서 [문제 6] 이미지 */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 space-y-2">
            <div className="text-xs font-bold text-slate-500">교과서 본문 · [문제 6]</div>
            <img
              src={getTextbookImageSrc('image_2c34caa4.png')}
              onError={(e) => handleTextbookImageError(e, 'image_2c34caa4.png')}
              alt="문제 6: 다음에서 일대일함수를 모두 찾고, 일대일대응인지 확인하시오. (1) y=3x-1, (2) y=-x²+2, (3) y=|x|, (4) 구간함수"
              className="w-full max-w-2xl mx-auto h-auto rounded-lg"
            />
          </div>

          {/* [문제 6] (1)~(4) 수평선 판정법 그래프 시뮬레이션 */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700">
                  <TrendingUp className="h-4 w-4" />
                  <span>수평선 판정법 (Horizontal Line Test) 실시간 시뮬레이터</span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                  수평선 <span className="mono text-emerald-700">y = k</span>를 움직여 (1)~(4) 그래프와의 교점 개수를 관찰하세요
                </h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[3, 2, 1, 0, -2].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setHorizLineK(val)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-bold border mono transition-colors ${
                      Math.abs(horizLineK - val) < 0.05
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    k = {val}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-white p-3.5 flex flex-col sm:flex-row items-center gap-4">
              <label htmlFor="prob6-k-slider" className="text-xs sm:text-sm font-extrabold text-slate-800 shrink-0 mono">
                수평선 높이 y = k = {horizLineK.toFixed(1)}
              </label>
              <input
                id="prob6-k-slider"
                type="range"
                min={-3}
                max={3.5}
                step={0.5}
                value={horizLineK}
                onChange={(e) => setHorizLineK(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Sim (1) */}
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-extrabold text-slate-900 mono mb-1">(1) y = 3x - 1</div>
                  {renderProb6Sim1(horizLineK)}
                </div>
                <div className="rounded-lg bg-emerald-50 p-2 text-[11px] font-bold text-emerald-900 text-center">
                  ✓ 어떤 k에서도 교점 1개 · 치역=실수 전체 → 일대일대응 O
                </div>
              </div>

              {/* Sim (2) */}
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-extrabold text-slate-900 mono mb-1">(2) y = -x² + 2</div>
                  {renderProb6Sim2(horizLineK)}
                </div>
                <div className="rounded-lg bg-rose-50 p-2 text-[11px] font-bold text-rose-900 text-center">
                  {horizLineK < 2
                    ? '⚠️ 교점 2개! (서로 다른 두 x에 같은 y 대응 → 일대일 X)'
                    : horizLineK === 2
                    ? '꼭짓점 (0, 2)에서 교점 1개'
                    : '⚠️ 교점 0개! (y > 2인 함숫값 없음 · 치역 ≠ 공역)'}
                </div>
              </div>

              {/* Sim (3) */}
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-extrabold text-slate-900 mono mb-1">(3) y = |x|</div>
                  {renderProb6Sim3(horizLineK)}
                </div>
                <div className="rounded-lg bg-rose-50 p-2 text-[11px] font-bold text-rose-900 text-center">
                  {horizLineK > 0
                    ? `⚠️ 교점 2개! (x = -${horizLineK}, ${horizLineK}에서 y = ${horizLineK} → 일대일 X)`
                    : horizLineK === 0
                    ? '원점 (0, 0)에서 교점 1개'
                    : '⚠️ 교점 0개! (음수인 함숫값 없음 · 치역 y ≥ 0)'}
                </div>
              </div>

              {/* Sim (4) */}
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-extrabold text-slate-900 mono mb-1">
                    (4) y = -2x (x≥0), x² (x&lt;0)
                  </div>
                  {renderProb6Sim4(horizLineK)}
                </div>
                <div className="rounded-lg bg-emerald-50 p-2 text-[11px] font-bold text-emerald-900 text-center">
                  ✓ x&lt;0에서 y&gt;0, x≥0에서 y≤0으로 교점 항상 1개 → 일대일대응 O
                </div>
              </div>
            </div>
          </div>

          {/* [문제 6] 문항별 판별 & 서술 워크시트 */}
          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                [문제 6] (1)~(4) 일대일함수 및 일대일대응 판별
              </h3>
              {state.prob6Verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  문제 6 확인 완료
                </span>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {(
                [
                  {
                    num: 1,
                    title: '(1) y = 3x - 1',
                    oneKey: 'prob6_1OneToOne' as const,
                    bijKey: 'prob6_1Bijective' as const,
                  },
                  {
                    num: 2,
                    title: '(2) y = -x² + 2',
                    oneKey: 'prob6_2OneToOne' as const,
                    bijKey: 'prob6_2Bijective' as const,
                  },
                  {
                    num: 3,
                    title: '(3) y = |x|',
                    oneKey: 'prob6_3OneToOne' as const,
                    bijKey: 'prob6_3Bijective' as const,
                  },
                  {
                    num: 4,
                    title: '(4) y = -2x (x ≥ 0), y = x² (x < 0)',
                    oneKey: 'prob6_4OneToOne' as const,
                    bijKey: 'prob6_4Bijective' as const,
                  },
                ] as const
              ).map((item) => (
                <div key={item.num} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                  <div className="text-sm font-extrabold text-slate-900 mono">{item.title}</div>
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-slate-700">① 일대일함수 여부</div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { val: 'yes', label: '일대일함수 O' },
                        { val: 'no', label: '일대일함수 X' },
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() =>
                            onUpdate((prev) => ({
                              ...prev,
                              [item.oneKey]: opt.val as 'yes' | 'no',
                              prob6Verified: false,
                            }))
                          }
                          className={`rounded-lg border py-2 px-3 text-xs font-bold transition-colors ${
                            state[item.oneKey] === opt.val
                              ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-600'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-slate-700">② 일대일대응 여부</div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { val: 'yes', label: '일대일대응 O' },
                        { val: 'no', label: '일대일대응 X' },
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() =>
                            onUpdate((prev) => ({
                              ...prev,
                              [item.bijKey]: opt.val as 'yes' | 'no',
                              prob6Verified: false,
                            }))
                          }
                          className={`rounded-lg border py-2 px-3 text-xs font-bold transition-colors ${
                            state[item.bijKey] === opt.val
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 서술형 문항 2개 */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <label htmlFor="prob6NonOneToOneReason" className="text-xs sm:text-sm font-bold text-slate-800">
                    (2)번과 (3)번이 일대일함수가 아닌 이유를 서술하시오. (8자 이상)
                  </label>
                  <CharCountBadge current={(state.prob6NonOneToOneReason || '').trim().length} min={8} />
                </div>
                <textarea
                  id="prob6NonOneToOneReason"
                  rows={3}
                  value={state.prob6NonOneToOneReason || ''}
                  onChange={(e) =>
                    onUpdate((prev) => ({
                      ...prev,
                      prob6NonOneToOneReason: e.target.value,
                      prob6Verified: false,
                    }))
                  }
                  placeholder=""
                  className={`w-full rounded-xl border bg-slate-50/50 focus:bg-white p-3.5 text-sm sm:text-base text-slate-900 transition-colors ${getCharCountBorderClass(
                    (state.prob6NonOneToOneReason || '').trim().length,
                    8
                  )}`}
                />
                <button
                  type="button"
                  onClick={() => toggleHint('prob6_non_hint')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  {showHints.prob6_non_hint ? '힌트 접기' : '💡 (2), (3)번 반례 힌트 보기'}
                </button>
                {showHints.prob6_non_hint && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900 leading-relaxed">
                    <strong>작성 힌트:</strong> (2) <span className="mono font-bold">y = -x² + 2</span>와 (3) <span className="mono font-bold">y = |x|</span> 모두 <span className="mono font-bold">x = -1</span>과 <span className="mono font-bold">x = 1</span>일 때 <span className="mono font-bold">-1 ≠ 1</span>이지만 함숫값이 <span className="mono font-bold">y = 1</span>로 같으므로 일대일함수가 아님을 적어 보세요.
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <label htmlFor="prob6BijectiveReason" className="text-xs sm:text-sm font-bold text-slate-800">
                    (1)번과 (4)번이 일대일함수이면서 일대일대응인 이유를 서술하시오. (8자 이상)
                  </label>
                  <CharCountBadge current={(state.prob6BijectiveReason || '').trim().length} min={8} />
                </div>
                <textarea
                  id="prob6BijectiveReason"
                  rows={3}
                  value={state.prob6BijectiveReason || ''}
                  onChange={(e) =>
                    onUpdate((prev) => ({
                      ...prev,
                      prob6BijectiveReason: e.target.value,
                      prob6Verified: false,
                    }))
                  }
                  placeholder=""
                  className={`w-full rounded-xl border bg-slate-50/50 focus:bg-white p-3.5 text-sm sm:text-base text-slate-900 transition-colors ${getCharCountBorderClass(
                    (state.prob6BijectiveReason || '').trim().length,
                    8
                  )}`}
                />
                <button
                  type="button"
                  onClick={() => toggleHint('prob6_bij_hint')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  {showHints.prob6_bij_hint ? '힌트 접기' : '💡 (1), (4)번 치역·공역 힌트 보기'}
                </button>
                {showHints.prob6_bij_hint && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900 leading-relaxed">
                    <strong>작성 힌트:</strong> (1)과 (4)는 <span className="mono font-bold">x₁ ≠ x₂</span>이면 <span className="mono font-bold">f(x₁) ≠ f(x₂)</span>인 일대일함수이고, <strong>치역과 공역이 모두 실수 전체의 집합으로 서로 같기 때문</strong>에 일대일대응임을 적어 보세요.
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleVerifyProb6}
                className="min-h-[44px] rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
              >
                [문제 6] 정답 확인하기
              </button>
              {completion[1] && (
                <button
                  type="button"
                  onClick={() => onStepChange(2)}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
                >
                  <span>다음 단계 [문제 7]로 이동</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>

            {feedback.prob6 && (
              <div
                role="status"
                className={`flex items-start gap-2 rounded-xl p-3.5 text-xs sm:text-sm font-medium ${
                  feedback.prob6.type === 'good'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                }`}
              >
                {feedback.prob6.type === 'good' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <span>{feedback.prob6.text}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 2: [문제 7] 항등함수와 상수함수의 그래프
         ===================================================================== */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <div className="text-xs font-bold text-blue-600">
              02차시 · 여러 가지 함수 · 3 / 4단계
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              탐구 03 · 항등함수와 상수함수의 그래프는 어떤 모양일까?
            </h2>
            <p className="mt-1 text-sm sm:text-base text-slate-600">
              정의역의 각 원소 <span className="mono font-bold">x</span>에 자기 자신 <span className="mono font-bold">x</span>가 대응하는 <strong>항등함수</strong>와, 단 하나의 상수 <span className="mono font-bold">c</span>만 대응하는 <strong>상수함수</strong>를 탐구해 봅시다.
            </p>
          </div>

          {/* 항등함수 & 상수함수 개념 카드 */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 sm:p-5 space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-extrabold text-white">
                개념 3 · 항등함수 (Identity Function)
              </div>
              <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                정의역과 공역이 같은 함수 <span className="mono text-blue-700">f: X → X</span>에서 정의역 <span className="mono">X</span>의 모든 원소 <span className="mono">x</span>에 대하여
              </p>
              <div className="rounded-xl border border-blue-200 bg-white px-3.5 py-2 text-center font-extrabold mono text-base text-blue-900">
                f(x) = x
              </div>
              <p className="text-xs text-slate-600">
                일 때, 함수 <span className="mono font-bold">f</span>를 집합 <span className="mono font-bold">X</span>에서의 <strong>항등함수</strong>라고 합니다. (항등함수는 일대일대응입니다.)
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5 space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-extrabold text-white">
                개념 4 · 상수함수 (Constant Function)
              </div>
              <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                함수 <span className="mono text-emerald-700">f: X → Y</span>에서 정의역 <span className="mono">X</span>의 모든 원소 <span className="mono">x</span>에 대하여 공역 <span className="mono">Y</span>의 단 하나의 원소 <span className="mono">c</span>에 대응할 때, 즉
              </p>
              <div className="rounded-xl border border-emerald-200 bg-white px-3.5 py-2 text-center font-extrabold mono text-base text-emerald-900">
                f(x) = c &nbsp;(c는 상수)
              </div>
              <p className="text-xs text-slate-600">
                일 때, 함수 <span className="mono font-bold">f</span>를 <strong>상수함수</strong>라고 합니다. (상수함수의 치역은 원소가 1개인 집합 <span className="mono">{'{c}'}</span>입니다.)
              </p>
            </div>
          </div>

          {/* 교과서 [문제 7] 이미지 */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 space-y-2">
            <div className="text-xs font-bold text-slate-500">교과서 본문 · [문제 7]</div>
            <img
              src={getTextbookImageSrc('image_5543c6d9.png')}
              onError={(e) => handleTextbookImageError(e, 'image_5543c6d9.png')}
              alt="문제 7: 다음에서 항등함수의 그래프와 상수함수의 그래프를 찾으시오. (1) y=x, (2) x=1, (3) y=1"
              className="w-full max-w-2xl mx-auto h-auto rounded-lg"
            />
          </div>

          {/* [문제 7] 인터랙티브 시뮬레이션 */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  [문제 7] (1), (2), (3) 그래프에 <span className="mono text-blue-700">x</span>값을 대입하여 비교하기
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  슬라이더를 움직여 <span className="mono font-bold">x</span>가 변할 때 각 그래프의 대응점 <span className="mono font-bold">(x, y)</span>가 어떻게 변하는지 확인하세요.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[-2, -1, 0, 1, 2].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setProb7TestX(val)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-bold border mono transition-colors ${
                      Math.abs(prob7TestX - val) < 0.05
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    x = {val}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-blue-200 bg-white p-3.5 flex flex-col sm:flex-row items-center gap-4">
              <label htmlFor="prob7-x-slider" className="text-xs sm:text-sm font-extrabold text-slate-800 shrink-0 mono">
                대입할 원소 x = {prob7TestX.toFixed(1)}
              </label>
              <input
                id="prob7-x-slider"
                type="range"
                min={-2.5}
                max={2.5}
                step={0.5}
                value={prob7TestX}
                onChange={(e) => setProb7TestX(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            {renderProb7Graphs(prob7TestX)}
          </div>

          {/* [문제 7] 판별 및 서술 영역 */}
          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                [문제 7] 항등함수의 그래프와 상수함수의 그래프 찾기
              </h3>
              {state.prob7Verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  문제 7 확인 완료
                </span>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
                <div className="text-sm font-bold text-slate-900">
                  1. <strong>항등함수</strong>의 그래프를 고르시오.
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['1', '2', '3'] as const).map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() =>
                        onUpdate((prev) => ({
                          ...prev,
                          prob7IdentityChoice: num,
                          prob7Verified: false,
                        }))
                      }
                      className={`rounded-xl border py-2.5 text-sm font-extrabold transition-colors ${
                        state.prob7IdentityChoice === num
                          ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-600'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      ({num})번
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
                <div className="text-sm font-bold text-slate-900">
                  2. <strong>상수함수</strong>의 그래프를 고르시오.
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['1', '2', '3'] as const).map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() =>
                        onUpdate((prev) => ({
                          ...prev,
                          prob7ConstantChoice: num,
                          prob7Verified: false,
                        }))
                      }
                      className={`rounded-xl border py-2.5 text-sm font-extrabold transition-colors ${
                        state.prob7ConstantChoice === num
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      ({num})번
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label htmlFor="prob7Graph2Reason" className="text-xs sm:text-sm font-bold text-slate-800">
                  3. (2)번 그래프(<span className="mono">x = 1</span>)가 상수함수의 그래프가 아닌 이유(함수가 아닌 이유)를 서술하시오. (8자 이상)
                </label>
                <CharCountBadge current={(state.prob7Graph2Reason || '').trim().length} min={8} />
              </div>
              <textarea
                id="prob7Graph2Reason"
                rows={3}
                value={state.prob7Graph2Reason || ''}
                onChange={(e) =>
                  onUpdate((prev) => ({
                    ...prev,
                    prob7Graph2Reason: e.target.value,
                    prob7Verified: false,
                  }))
                }
                placeholder=""
                className={`w-full rounded-xl border bg-slate-50/50 focus:bg-white p-3.5 text-sm sm:text-base text-slate-900 transition-colors ${getCharCountBorderClass(
                  (state.prob7Graph2Reason || '').trim().length,
                  8
                )}`}
              />
              <button
                type="button"
                onClick={() => toggleHint('prob7_hint')}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800"
              >
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                {showHints.prob7_hint ? '힌트 접기' : '💡 [문제 7] (2)번 그래프 힌트 보기'}
              </button>
              {showHints.prob7_hint && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 leading-relaxed">
                  <strong>작성 힌트:</strong> (2)번 직선 <span className="mono font-bold">x = 1</span>은 <span className="mono font-bold">x = 1</span> 하나에 무수히 많은 <span className="mono font-bold">y</span>값이 대응하고, <span className="mono font-bold">x ≠ 1</span>인 실수에는 대응하는 함숫값이 없으므로 아예 함수의 그래프가 아니라는 점을 적어 보세요.
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleVerifyProb7}
                className="min-h-[44px] rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
              >
                [문제 7] 정답 확인하기
              </button>
              {completion[2] && (
                <button
                  type="button"
                  onClick={() => onStepChange(3)}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
                >
                  <span>다음 단계 [생각 넓히기]로 이동</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>

            {feedback.prob7 && (
              <div
                role="status"
                className={`flex items-start gap-2 rounded-xl p-3.5 text-xs sm:text-sm font-medium ${
                  feedback.prob7.type === 'good'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                }`}
              >
                {feedback.prob7.type === 'good' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <span>{feedback.prob7.text}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 3: [생각 넓히기] 실생활 상황에서 여러 가지 함수가 되는 경우
         ===================================================================== */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <div className="text-xs font-bold text-blue-600">
              02차시 · 여러 가지 함수 · 4 / 4단계
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              탐구 04 · [생각 넓히기] 실생활에서 여러 가지 함수가 되는 경우
            </h2>
            <p className="mt-1 text-sm sm:text-base text-slate-600">
              영화 관람 선택(활동 1)과 동아리 대표 투표(활동 2) 상황에서 일대일대응, 상수함수, 항등함수가 되는 조건을 직접 실험하고 서술해 봅시다.
            </p>
          </div>

          {/* 교과서 [생각 넓히기] 이미지 */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 space-y-2">
            <div className="text-xs font-bold text-slate-500">교과서 본문 · [생각 넓히기] (의사소통 · 연결)</div>
            <img
              src={getTextbookImageSrc('image_7a2cc712.png')}
              onError={(e) => handleTextbookImageError(e, 'image_7a2cc712.png')}
              alt="생각 넓히기: 활동 1 영화관 학생 5명 대응, 활동 2 동아리 회원 4명 대표 투표 대응"
              className="w-full max-w-2xl mx-auto h-auto rounded-lg"
            />
          </div>

          {/* ================= 활동 1: 영화관 학생 5명과 영화 선택 ================= */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-2.5 py-1 text-xs font-extrabold text-white">
                  <Film className="h-3.5 w-3.5" />
                  활동 1
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  학생 5명이 선택한 영화 1편의 대응 (일대일대응 vs 상수함수)
                </h3>
              </div>
              {state.think1Verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  활동 1 완료
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white rounded-xl p-3.5 border border-amber-200/80">
              학생 5명이 영화관에서 영화를 관람하려고 한다. 각 학생에 그 학생이 선택한 영화 1편을 대응시킬 때, 이 대응이 <strong>일대일대응</strong>이 되는 경우와 <strong>상수함수</strong>가 되는 경우를 말해 보자.
            </p>

            {/* 활동 1 인터랙티브 대응 시뮬레이터 */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="text-xs sm:text-sm font-bold text-slate-800">
                  🎯 화살표 대응 실험기: 왼쪽 학생을 선택한 뒤 오른쪽 영화를 클릭해 연결해 보세요
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdate((prev) => ({
                        ...prev,
                        think1Map: {
                          '학생 1': '영화 A',
                          '학생 2': '영화 B',
                          '학생 3': '영화 C',
                          '학생 4': '영화 D',
                          '학생 5': '영화 E',
                        },
                      }))
                    }
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
                  >
                    시뮬레이션: 일대일대응 구조 보기
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdate((prev) => ({
                        ...prev,
                        think1Map: {
                          '학생 1': '영화 A',
                          '학생 2': '영화 A',
                          '학생 3': '영화 A',
                          '학생 4': '영화 A',
                          '학생 5': '영화 A',
                        },
                      }))
                    }
                    className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800 hover:bg-blue-100"
                  >
                    시뮬레이션: 상수함수 구조 보기
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdate((prev) => ({ ...prev, think1Map: {} }))}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    <RotateCcw className="h-3 w-3" />
                    초기화
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-500">정의역 X (학생 5명)</div>
                  <div className="flex flex-wrap gap-1.5">
                    {MOVIE_STUDENTS.map((sName) => {
                      const active = selectedStudentForMovie === sName;
                      const mapped = think1Map[sName];
                      return (
                        <button
                          key={sName}
                          type="button"
                          onClick={() => setSelectedStudentForMovie(sName)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                            active
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : mapped
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {sName} {mapped ? `→ ${mapped}` : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-500">
                    공역 Y (상영 중인 영화 5편 — 클릭하여 <strong className="text-blue-700">{selectedStudentForMovie}</strong>에 대응)
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {MOVIE_LIST.map((mName) => (
                      <button
                        key={mName}
                        type="button"
                        onClick={() => assignMovieToStudent(selectedStudentForMovie, mName)}
                        className="rounded-lg border border-indigo-200 bg-indigo-50/70 px-3 py-1.5 text-xs font-bold text-indigo-900 hover:bg-indigo-100 transition-colors"
                      >
                        {mName} 선택
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {(() => {
                const status = getMovieMapClassification();
                const badgeClass =
                  status.tone === 'emerald'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : status.tone === 'blue'
                    ? 'bg-blue-50 text-blue-900 border-blue-200'
                    : status.tone === 'amber'
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200';
                return (
                  <div className={`rounded-lg border px-3 py-2 text-xs font-bold ${badgeClass}`}>
                    {status.label}
                  </div>
                );
              })()}
            </div>

            {/* 활동 1 서술 입력칸 */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <label htmlFor="think1BijectiveCase" className="text-xs sm:text-sm font-bold text-slate-800">
                    (1) 이 대응이 <strong>일대일대응</strong>이 되는 경우를 서술하시오. (8자 이상)
                  </label>
                  <CharCountBadge current={(state.think1BijectiveCase || '').trim().length} min={8} />
                </div>
                <textarea
                  id="think1BijectiveCase"
                  rows={3}
                  value={state.think1BijectiveCase || ''}
                  onChange={(e) =>
                    onUpdate((prev) => ({
                      ...prev,
                      think1BijectiveCase: e.target.value,
                      think1Verified: false,
                    }))
                  }
                  placeholder=""
                  className={`w-full rounded-xl border bg-slate-50/50 focus:bg-white p-3.5 text-sm sm:text-base text-slate-900 transition-colors ${getCharCountBorderClass(
                    (state.think1BijectiveCase || '').trim().length,
                    8
                  )}`}
                />
                <button
                  type="button"
                  onClick={() => toggleHint('think1_bij_hint')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  {showHints.think1_bij_hint ? '힌트 접기' : '💡 활동 1-(1) 일대일대응 힌트 보기'}
                </button>
                {showHints.think1_bij_hint && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900 leading-relaxed">
                    <strong>작성 힌트:</strong> 상영 중인 영화가 5편일 때, 학생 5명이 겹치지 않게 <strong>모두 서로 다른 영화를 1편씩 선택</strong>하여 5편의 영화가 모두 선택되는 경우를 서술해 보세요.
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <label htmlFor="think1ConstantCase" className="text-xs sm:text-sm font-bold text-slate-800">
                    (2) 이 대응이 <strong>상수함수</strong>가 되는 경우를 서술하시오. (8자 이상)
                  </label>
                  <CharCountBadge current={(state.think1ConstantCase || '').trim().length} min={8} />
                </div>
                <textarea
                  id="think1ConstantCase"
                  rows={3}
                  value={state.think1ConstantCase || ''}
                  onChange={(e) =>
                    onUpdate((prev) => ({
                      ...prev,
                      think1ConstantCase: e.target.value,
                      think1Verified: false,
                    }))
                  }
                  placeholder=""
                  className={`w-full rounded-xl border bg-slate-50/50 focus:bg-white p-3.5 text-sm sm:text-base text-slate-900 transition-colors ${getCharCountBorderClass(
                    (state.think1ConstantCase || '').trim().length,
                    8
                  )}`}
                />
                <button
                  type="button"
                  onClick={() => toggleHint('think1_const_hint')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  {showHints.think1_const_hint ? '힌트 접기' : '💡 활동 1-(2) 상수함수 힌트 보기'}
                </button>
                {showHints.think1_const_hint && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900 leading-relaxed">
                    <strong>작성 힌트:</strong> 상수함수는 정의역의 모든 원소가 단 하나의 원소에만 대응하는 함수입니다. 학생 5명이 <strong>모두 똑같은 영화 1편만 선택</strong>하는 경우를 서술해 보세요.
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleVerifyThink1}
              className="min-h-[42px] rounded-xl bg-amber-600 px-5 py-2 text-sm font-bold text-white hover:bg-amber-700"
            >
              활동 1 서술 확인하기
            </button>

            {feedback.think1 && (
              <div
                role="status"
                className={`flex items-start gap-2 rounded-xl p-3.5 text-xs sm:text-sm font-medium ${
                  feedback.think1.type === 'good'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                }`}
              >
                {feedback.think1.type === 'good' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <span>{feedback.think1.text}</span>
              </div>
            )}
          </div>

          {/* ================= 활동 2: 동아리 회원 4명 대표 투표 ================= */}
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-extrabold text-white">
                  <Vote className="h-3.5 w-3.5" />
                  활동 2
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  동아리 회원 4명의 대표 투표 대응 (항등함수 vs 상수함수)
                </h3>
              </div>
              {state.think2Verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  활동 2 완료
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white rounded-xl p-3.5 border border-indigo-200/80">
              동아리 회원 4명 중에서 대표 1명을 뽑는 투표를 하려고 한다. 각 회원에 그 회원이 투표한 회원 1명을 대응시킬 때, 이 대응이 <strong>항등함수</strong>가 되는 경우와 <strong>상수함수</strong>가 되는 경우를 말해 보자.
            </p>

            {/* 활동 2 인터랙티브 투표 시뮬레이터 */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="text-xs sm:text-sm font-bold text-slate-800">
                  🗳️ 동아리 투표 실험기: 투표할 회원을 선택한 뒤 누구에게 투표할지 클릭해 보세요
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdate((prev) => ({
                        ...prev,
                        think2Map: {
                          '회원 A': '회원 A',
                          '회원 B': '회원 B',
                          '회원 C': '회원 C',
                          '회원 D': '회원 D',
                        },
                      }))
                    }
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
                  >
                    시뮬레이션: 항등함수 투표 보기
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdate((prev) => ({
                        ...prev,
                        think2Map: {
                          '회원 A': '회원 A',
                          '회원 B': '회원 A',
                          '회원 C': '회원 A',
                          '회원 D': '회원 A',
                        },
                      }))
                    }
                    className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800 hover:bg-blue-100"
                  >
                    시뮬레이션: 상수함수 투표 보기
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdate((prev) => ({ ...prev, think2Map: {} }))}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    <RotateCcw className="h-3 w-3" />
                    초기화
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-500">투표하는 회원 X (회원 A~D)</div>
                  <div className="flex flex-wrap gap-1.5">
                    {CLUB_MEMBERS.map((mName) => {
                      const active = selectedVoter === mName;
                      const mapped = think2Map[mName];
                      return (
                        <button
                          key={mName}
                          type="button"
                          onClick={() => setSelectedVoter(mName)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                            active
                              ? 'border-indigo-600 bg-indigo-600 text-white'
                              : mapped
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {mName} {mapped ? `→ ${mapped}` : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-500">
                    투표받는 후보 X (클릭하여 <strong className="text-indigo-700">{selectedVoter}</strong>의 투표 대상 지정)
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {CLUB_MEMBERS.map((targetName) => (
                      <button
                        key={targetName}
                        type="button"
                        onClick={() => assignVoteToMember(selectedVoter, targetName)}
                        className="rounded-lg border border-blue-200 bg-blue-50/70 px-3 py-1.5 text-xs font-bold text-blue-900 hover:bg-blue-100 transition-colors"
                      >
                        {targetName}에게 투표
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {(() => {
                const status = getVoteMapClassification();
                const badgeClass =
                  status.tone === 'emerald'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : status.tone === 'blue'
                    ? 'bg-blue-50 text-blue-900 border-blue-200'
                    : status.tone === 'amber'
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200';
                return (
                  <div className={`rounded-lg border px-3 py-2 text-xs font-bold ${badgeClass}`}>
                    {status.label}
                  </div>
                );
              })()}
            </div>

            {/* 활동 2 서술 입력칸 */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <label htmlFor="think2IdentityCase" className="text-xs sm:text-sm font-bold text-slate-800">
                    (1) 이 대응이 <strong>항등함수</strong>가 되는 경우를 서술하시오. (8자 이상)
                  </label>
                  <CharCountBadge current={(state.think2IdentityCase || '').trim().length} min={8} />
                </div>
                <textarea
                  id="think2IdentityCase"
                  rows={3}
                  value={state.think2IdentityCase || ''}
                  onChange={(e) =>
                    onUpdate((prev) => ({
                      ...prev,
                      think2IdentityCase: e.target.value,
                      think2Verified: false,
                    }))
                  }
                  placeholder=""
                  className={`w-full rounded-xl border bg-slate-50/50 focus:bg-white p-3.5 text-sm sm:text-base text-slate-900 transition-colors ${getCharCountBorderClass(
                    (state.think2IdentityCase || '').trim().length,
                    8
                  )}`}
                />
                <button
                  type="button"
                  onClick={() => toggleHint('think2_id_hint')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  {showHints.think2_id_hint ? '힌트 접기' : '💡 활동 2-(1) 항등함수 힌트 보기'}
                </button>
                {showHints.think2_id_hint && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900 leading-relaxed">
                    <strong>작성 힌트:</strong> 항등함수는 모든 원소 <span className="mono font-bold">x</span>가 자기 자신 <span className="mono font-bold">f(x) = x</span>에 대응하는 함수입니다. 동아리 회원 4명이 <strong>모두 자기 자신에게 투표하는 경우</strong>를 서술해 보세요.
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <label htmlFor="think2ConstantCase" className="text-xs sm:text-sm font-bold text-slate-800">
                    (2) 이 대응이 <strong>상수함수</strong>가 되는 경우를 서술하시오. (8자 이상)
                  </label>
                  <CharCountBadge current={(state.think2ConstantCase || '').trim().length} min={8} />
                </div>
                <textarea
                  id="think2ConstantCase"
                  rows={3}
                  value={state.think2ConstantCase || ''}
                  onChange={(e) =>
                    onUpdate((prev) => ({
                      ...prev,
                      think2ConstantCase: e.target.value,
                      think2Verified: false,
                    }))
                  }
                  placeholder=""
                  className={`w-full rounded-xl border bg-slate-50/50 focus:bg-white p-3.5 text-sm sm:text-base text-slate-900 transition-colors ${getCharCountBorderClass(
                    (state.think2ConstantCase || '').trim().length,
                    8
                  )}`}
                />
                <button
                  type="button"
                  onClick={() => toggleHint('think2_const_hint')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  {showHints.think2_const_hint ? '힌트 접기' : '💡 활동 2-(2) 상수함수 힌트 보기'}
                </button>
                {showHints.think2_const_hint && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900 leading-relaxed">
                    <strong>작성 힌트:</strong> 동아리 회원 4명이 <strong>모두 특정한 같은 회원 1명에게만 투표(만장일치)하는 경우</strong>를 서술해 보세요.
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleVerifyThink2}
              className="min-h-[42px] rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-700"
            >
              활동 2 서술 확인하기
            </button>

            {feedback.think2 && (
              <div
                role="status"
                className={`flex items-start gap-2 rounded-xl p-3.5 text-xs sm:text-sm font-medium ${
                  feedback.think2.type === 'good'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                }`}
              >
                {feedback.think2.type === 'good' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <span>{feedback.think2.text}</span>
              </div>
            )}
          </div>

          {/* 2차시 배움 성찰 */}
          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <label htmlFor="l2reflection" className="text-sm sm:text-base font-extrabold text-slate-900">
                2차시 배움 성찰 · 여러 가지 함수 정리하기 (선택·심화)
              </label>
              <CharCountBadge current={(state.reflection || '').trim().length} min={15} />
            </div>
            <textarea
              id="l2reflection"
              rows={3}
              value={state.reflection || ''}
              onChange={(e) => onUpdate((prev) => ({ ...prev, reflection: e.target.value }))}
              placeholder=""
              className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm sm:text-base text-slate-900"
            />
            <div>
              <button
                type="button"
                onClick={() => toggleHint('l2_reflection_hint')}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800"
              >
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                {showHints.l2_reflection_hint ? '성찰 힌트 접기' : '💡 2차시 배움 성찰 힌트 보기'}
              </button>
              {showHints.l2_reflection_hint && (
                <div className="mt-1.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 leading-relaxed">
                  <strong>작성 힌트:</strong> 일대일함수와 일대일대응의 차이(치역과 공역의 일치 여부), 그리고 항등함수(<span className="mono font-bold">f(x)=x</span>)와 상수함수(<span className="mono font-bold">f(x)=c</span>)의 그래프 특징을 자신의 말로 정리해 보세요.
                </div>
              )}
            </div>

            {onGoToLesson3 && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={onGoToLesson3}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
                >
                  <span>03차시 (합성함수 탐구)로 이동</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
