import React, { useState } from 'react';
import {
  Lesson1State,
  L1_COUNTRIES,
  L1_CURRENCIES,
  L1_CORRECT_COUNTRY_MAP,
  L1CoordPoint,
  validateL1CountryMap,
  validateL1Prob1,
  validateL1Prob2,
  validateL1Prob3,
  validateL1Prob4_1Points,
  validateL1Prob4_2Line,
  validateL1Prob5,
  evaluateLevel1Completion,
} from '../utils/mathLogic';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Trash2,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Compass,
  Lightbulb,
  BookOpen,
} from 'lucide-react';
import { CharCountBadge, getCharCountBorderClass } from './CharCountBadge';
import { MathText } from './MathText';

interface Lesson1ViewProps {
  state: Lesson1State;
  step: number;
  onStepChange: (nextStep: number) => void;
  onUpdate: (updater: (prev: Lesson1State) => Lesson1State) => void;
  onGoToLesson2: () => void;
  onRequestConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

const REAL_LIFE_QUIZ_ITEMS = [
  {
    id: 'q1',
    title: '사례 A · 편의점 상품 바코드(X) → 그 상품 1개의 판매 가격(Y)',
    desc: '편의점에 진열된 각 상품(바코드)마다 포스기에 등록된 판매 가격 1개를 대응시키는 경우',
    answer: 'yes' as const,
    explanation: '모든 상품에는 정해진 판매 가격이 오직 하나씩 대응하므로 함수입니다.',
  },
  {
    id: 'q2',
    title: '사례 B · 혈액형 {A, B, O, AB}(X) → 우리 반 학생 이름(Y)',
    desc: '각 혈액형에 그 혈액형을 가진 우리 반 학생을 대응시키는 경우 (한 반에 25명)',
    answer: 'no' as const,
    explanation: '하나의 혈액형(예: A형)에 여러 명의 학생이 대응하므로 함수가 아닙니다.',
  },
  {
    id: 'q3',
    title: '사례 C · 우리 반 학생의 학번(X) → 그 학생의 태어난 달(1월~12월)(Y)',
    desc: '각 학생의 학번에 그 학생이 태어난 달을 대응시키는 경우',
    answer: 'yes' as const,
    explanation: '모든 학생은 태어난 달이 반드시 존재하고 오직 하나뿐이므로 함수입니다.',
  },
];

const REAL_LIFE_TEMPLATES = [
  {
    label: '바코드와 상품 가격',
    topic: '편의점 상품 바코드와 판매 가격의 대응',
    domainX: '편의점에 등록된 모든 상품(바코드)의 집합 X',
    codomainY: '자연수(원 단위 금액) 전체의 집합 Y',
    rule: '각 상품 x에 대하여 그 상품의 판매 가격 f(x)원을 대응시킨다.',
    whyFunc:
      '정의역 X의 모든 상품마다 판매 가격이 빠짐없이 존재하고, 한 상품에 두 개 이상의 가격이 동시에 찍히지 않아 오직 하나씩만 대응하기 때문이다.',
    nonFuncExample:
      '반대로 가격(X)에서 상품(Y)으로 대응시키면 1,500원짜리 상품이 여러 개 존재하므로 X의 한 원소에 Y의 원소가 여러 개 대응하여 함수가 아니다.',
  },
  {
    label: '택배 무게와 기본 배송비',
    topic: '택배 상자의 무게와 배송 요금의 대응',
    domainX: '{x | 0 < x ≤ 20인 실수} (택배 무게 kg)',
    codomainY: '자연수 전체의 집합 Y (배송 요금 원)',
    rule: '무게 x kg인 택배 상자에 요금표에 정해진 배송비 f(x)원을 대응시킨다.',
    whyFunc:
      '허용 범위 안의 어떤 무게 x를 재더라도 요금표에 의해 배송비가 오직 하나로 결정되므로 X의 각 원소에 Y의 원소가 하나씩 대응하는 함수이다.',
    nonFuncExample:
      '만약 같은 무게인데도 측정할 때마다 요금이 3,000원 또는 5,000원으로 동시에 나온다면 하나씩 대응하지 않으므로 함수가 될 수 없다.',
  },
  {
    label: '정사각형 한 변과 넓이',
    topic: '정사각형의 한 변의 길이와 넓이의 대응',
    domainX: '{x | x > 0인 실수} (정사각형 한 변의 길이 cm)',
    codomainY: '{y | y > 0인 실수} (넓이 cm²)',
    rule: '한 변의 길이가 x cm인 정사각형에 넓이 f(x) = x² cm²을 대응시킨다.',
    whyFunc:
      '양수인 한 변의 길이 x가 정해지면 제곱한 값 x²은 항상 유일하게 하나로 결정되므로 함수이다.',
    nonFuncExample:
      '실수 전체에서 제곱이 x가 되는 수 y(즉 y² = x)를 대응시키면 x = 4일 때 y = 2와 y = -2 두 개가 대응하므로 함수가 아니다.',
  },
  {
    label: '자판기 버튼과 음료',
    topic: '음료 자판기 버튼 번호와 나오는 음료의 대응',
    domainX: '자판기의 버튼 번호 집합 X = {1, 2, 3, 4, 5, 6}',
    codomainY: '자판기 안의 음료 종류 집합 Y = {생수, 콜라, 사이다, 이온음료}',
    rule: '자판기 버튼 번호 x를 누르면 배정된 음료 f(x)가 1개 나온다.',
    whyFunc:
      '모든 버튼마다 음료가 배정되어 있고, 버튼 하나를 눌렀을 때 정해진 음료 한 종류만 나오므로 함수이다. (여러 버튼에 같은 음료가 배정되어도 함수가 된다!)',
    nonFuncExample:
      '만약 고장 난 버튼이 있어서 눌러도 아무 음료도 안 나오거나(대응 없음), 버튼 하나를 눌렀는데 콜라와 사이다가 동시에 지정되어 있다면 함수가 아니다.',
  },
];

export const Lesson1View: React.FC<Lesson1ViewProps> = ({
  state,
  step,
  onStepChange,
  onUpdate,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('대한민국');
  const [feedback, setFeedback] = useState<Record<string, { text: string; type: 'good' | 'warn' }>>({});
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});
  const [domainExplorerX, setDomainExplorerX] = useState<number>(1);
  const [verticalLineA, setVerticalLineA] = useState<number>(0.5);

  const completion = evaluateLevel1Completion(state);

  const showNotice = (id: string, text: string, type: 'good' | 'warn') => {
    setFeedback((prev) => ({ ...prev, [id]: { text, type } }));
  };

  const toggleHint = (id: string) => {
    setShowHints((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // --- Step 0 Handlers ([생각 열기] & [문제 1]) ---
  const countryMap = state.countryMap || {};

  const handleAssignCurrency = (country: string, currency: string) => {
    onUpdate((prev) => ({
      ...prev,
      countryMap: { ...(prev.countryMap || {}), [country]: currency },
      countryMapVerified: false,
    }));
    const idx = L1_COUNTRIES.indexOf(country as any);
    if (idx >= 0 && idx < L1_COUNTRIES.length - 1) {
      setSelectedCountry(L1_COUNTRIES[idx + 1]);
    }
  };

  const handleVerifyCountryMap = () => {
    const res = validateL1CountryMap(state.countryMap);
    if (res.ok) {
      onUpdate((prev) => ({
        ...prev,
        countryMapVerified: true,
        examples:
          prev.examples.length >= 4
            ? prev.examples
            : [
                { n: -3, sq: 9, r: 1, valid: true },
                { n: 1, sq: 1, r: 1, valid: true },
                { n: 3, sq: 9, r: 1, valid: true },
                { n: 5, sq: 25, r: 1, valid: true },
              ],
      }));
    }
    showNotice('countryMap', res.message, res.type);
  };

  const handleVerifyProb1 = () => {
    const res = validateL1Prob1(state);
    if (res.ok) {
      onUpdate((prev) => ({
        ...prev,
        prob1Verified: true,
        claim: `[문제 1] 함수: (2)번 (정의역 ${prev.prob1_2Domain}, 공역 ${prev.prob1_2Codomain}, 치역 ${prev.prob1_2Range}) / (1) 아님: ${prev.prob1_1Reason} / (3) 아님: ${prev.prob1_3Reason}`,
      }));
    }
    showNotice('prob1', res.message, res.type);
  };

  // --- Step 1 Handlers ([문제 2] 정의역과 치역) ---
  const handleVerifyProb2 = () => {
    const res = validateL1Prob2(state);
    if (res.ok) {
      onUpdate((prev) => ({
        ...prev,
        prob2Verified: true,
        claimChecked: true,
        claim: `[문제 2] (1) y=2x+1 정의역: ${prev.prob2_1Domain}, 치역: ${prev.prob2_1Range} / (2) y=-x²+3 정의역: ${prev.prob2_2Domain}, 치역: ${prev.prob2_2Range}`,
      }));
    }
    showNotice('prob2', res.message, res.type);
  };

  // --- Step 2 Handlers ([탐구+ 문제 3] 서로 같은 함수) ---
  const prob3Table = state.prob3Table || { f0: '', f1: '', gm1: '', g1: '' };

  const updateProb3Cell = (key: keyof typeof prob3Table, val: string) => {
    onUpdate((prev) => ({
      ...prev,
      prob3Table: {
        ...(prev.prob3Table || { f0: '', f1: '', gm1: '', g1: '' }),
        [key]: val,
      },
      prob3Verified: false,
    }));
  };

  const handleVerifyProb3 = () => {
    const res = validateL1Prob3(state);
    if (res.ok) {
      onUpdate((prev) => ({
        ...prev,
        prob3Verified: true,
        limits: `[문제 3] 정의역 {-1, 0, 1}에서 f(x)=|2x|와 g(x)=2x²은 f(-1)=g(-1)=2, f(0)=g(0)=0, f(1)=g(1)=2이므로 f=g이다. (${prev.prob3Reason})`,
      }));
    }
    showNotice('prob3', res.message, res.type);
  };

  // --- Step 3 Handlers ([문제 4] 좌표평면 점 찍기 & 직선 긋기 + [문제 5]) ---
  const prob4_1Points = state.prob4_1Points || [];
  const prob4_2LinePoints = state.prob4_2LinePoints || [];

  const handleTogglePoint4_1 = (pt: L1CoordPoint) => {
    onUpdate((prev) => {
      const curr = prev.prob4_1Points || [];
      const exists = curr.some((p) => p.x === pt.x && p.y === pt.y);
      const next = exists
        ? curr.filter((p) => !(p.x === pt.x && p.y === pt.y))
        : [...curr, pt];
      return {
        ...prev,
        prob4_1Points: next,
        prob4_1Verified: false,
      };
    });
  };

  const handleVerifyProb4_1 = () => {
    const res = validateL1Prob4_1Points(state.prob4_1Points);
    if (res.ok) {
      onUpdate((prev) => ({
        ...prev,
        prob4_1Verified: true,
      }));
    }
    showNotice('prob4_1', res.message, res.type);
  };

  const handleToggleLinePoint4_2 = (pt: L1CoordPoint) => {
    onUpdate((prev) => {
      const curr = prev.prob4_2LinePoints || [];
      const exists = curr.some((p) => p.x === pt.x && p.y === pt.y);
      let next: L1CoordPoint[];
      if (exists) {
        next = curr.filter((p) => !(p.x === pt.x && p.y === pt.y));
      } else if (curr.length >= 2) {
        next = [curr[1], pt];
      } else {
        next = [...curr, pt];
      }
      return {
        ...prev,
        prob4_2LinePoints: next,
        prob4_2Verified: false,
      };
    });
  };

  const handleVerifyProb4_2 = () => {
    const res = validateL1Prob4_2Line(state.prob4_2LinePoints);
    if (res.ok) {
      onUpdate((prev) => ({
        ...prev,
        prob4_2Verified: true,
      }));
    }
    showNotice('prob4_2', res.message, res.type);
  };

  const handleVerifyProb5 = () => {
    const res = validateL1Prob5(state);
    if (res.ok) {
      onUpdate((prev) => ({
        ...prev,
        prob5Verified: true,
        proofVerified: [true, true, true, true],
        proofText: `[문제 4] y=-2x+3 그래프: (1) 점 (0,3),(1,1),(2,-1),(3,-3), (2) 실수 전체 직선 완료. [문제 5] 함수의 그래프는 (1)번. (2) 아님: ${prev.prob5_2Reason} / (3) 아님: ${prev.prob5_3Reason}`,
      }));
    }
    showNotice('prob5', res.message, res.type);
  };

  // --- Step 4 Handlers (실생활에서 함수인 예 찾아보기 도전 활동지) ---
  const realLifeQuiz = state.realLifeQuiz || {};

  const handleVerifyRealLifeQuiz = () => {
    for (const item of REAL_LIFE_QUIZ_ITEMS) {
      if (realLifeQuiz[item.id] !== item.answer) {
        showNotice(
          'realLifeQuiz',
          `[${item.title.split('·')[0].trim()}]의 판별 결과를 다시 확인해 보세요. 힌트: ${item.explanation}`,
          'warn'
        );
        return;
      }
    }
    onUpdate((prev) => ({ ...prev, realLifeQuizVerified: true }));
    showNotice(
      'realLifeQuiz',
      '실생활 대응 3가지 사례를 모두 정확하게 판별했습니다! 이제 아래에서 나만의 실생활 함수를 설계해 보세요.',
      'good'
    );
  };

  const applyRealLifeTemplate = (tpl: (typeof REAL_LIFE_TEMPLATES)[number]) => {
    onUpdate((prev) => ({
      ...prev,
      realLifeTopic: tpl.topic,
      realLifeDomainX: tpl.domainX,
      realLifeCodomainY: tpl.codomainY,
      realLifeRule: tpl.rule,
      realLifeWhyFunc: tpl.whyFunc,
      realLifeNonFuncExample: tpl.nonFuncExample,
      bridge: `[실생활 함수] ${tpl.topic}: 정의역(${tpl.domainX}) → 공역(${tpl.codomainY}), 규칙: ${tpl.rule}`,
    }));
    showNotice(
      'realLifeDesign',
      `‘${tpl.label}’ 예시 틀을 불러왔습니다. 나만의 말이나 주변 사례로 자유롭게 수정해 보세요!`,
      'good'
    );
  };

  // Coordinate plane SVG helper for Problem 4
  const renderCoordinatePlane = (
    mode: 'points' | 'line',
    points: L1CoordPoint[],
    onPointClick: (pt: L1CoordPoint) => void
  ) => {
    // Grid from -4 to 4 on both axes
    // SVG size 320 x 320, padding 28 -> inner 264 -> step = 264 / 8 = 33px per unit
    const size = 320;
    const center = 160;
    const unit = 32;
    const toSvgX = (x: number) => center + x * unit;
    const toSvgY = (y: number) => center - y * unit;

    // Extended line calculation for mode === 'line' when 2 distinct points are selected
    let lineCoords: { x1: number; y1: number; x2: number; y2: number } | null = null;
    if (mode === 'line' && points.length === 2) {
      const [p1, p2] = points;
      if (p1.x !== p2.x) {
        const m = (p2.y - p1.y) / (p2.x - p1.x);
        const b = p1.y - m * p1.x;
        const xLeft = -4.2;
        const yLeft = m * xLeft + b;
        const xRight = 4.2;
        const yRight = m * xRight + b;
        lineCoords = {
          x1: toSvgX(xLeft),
          y1: toSvgY(yLeft),
          x2: toSvgX(xRight),
          y2: toSvgY(yRight),
        };
      } else if (p1.y !== p2.y) {
        lineCoords = {
          x1: toSvgX(p1.x),
          y1: toSvgY(-4.2),
          x2: toSvgX(p1.x),
          y2: toSvgY(4.2),
        };
      }
    }

    const ticks = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

    return (
      <div className="flex flex-col items-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full max-w-[320px] h-auto rounded-2xl border border-slate-200 bg-white shadow-inner select-none"
          role="img"
          aria-label={
            mode === 'points'
              ? '문제 4-(1) 정의역이 {0, 1, 2, 3}일 때 점 찍기 좌표평면'
              : '문제 4-(2) 정의역이 실수 전체일 때 직선 긋기 좌표평면'
          }
        >
          {/* Grid lines */}
          {ticks.map((t) => (
            <React.Fragment key={t}>
              <line
                x1={toSvgX(t)}
                y1={toSvgY(4)}
                x2={toSvgX(t)}
                y2={toSvgY(-4)}
                stroke={t === 0 ? '#0f172a' : '#e2e8f0'}
                strokeWidth={t === 0 ? 2 : 1}
              />
              <line
                x1={toSvgX(-4)}
                y1={toSvgY(t)}
                x2={toSvgX(4)}
                y2={toSvgY(t)}
                stroke={t === 0 ? '#0f172a' : '#e2e8f0'}
                strokeWidth={t === 0 ? 2 : 1}
              />
              {t !== 0 && (
                <>
                  <text
                    x={toSvgX(t)}
                    y={center + 14}
                    textAnchor="middle"
                    className="fill-slate-500 text-[10px] font-semibold mono"
                  >
                    {t}
                  </text>
                  <text
                    x={center - 10}
                    y={toSvgY(t) + 3}
                    textAnchor="end"
                    className="fill-slate-500 text-[10px] font-semibold mono"
                  >
                    {t}
                  </text>
                </>
              )}
            </React.Fragment>
          ))}

          {/* Origin and axis labels */}
          <text x={center - 10} y={center + 14} className="fill-slate-700 text-[10px] font-bold">
            O
          </text>
          <text x={toSvgX(4) + 8} y={center + 4} className="fill-slate-800 text-xs font-bold italic">
            x
          </text>
          <text x={center + 6} y={toSvgY(4) - 6} className="fill-slate-800 text-xs font-bold italic">
            y
          </text>

          {/* Drawn Line & Segment in Mode 2 */}
          {mode === 'line' && lineCoords && (
            <>
              {/* Extended infinite line */}
              <line
                x1={lineCoords.x1}
                y1={lineCoords.y1}
                x2={lineCoords.x2}
                y2={lineCoords.y2}
                stroke="#2563eb"
                strokeWidth={2.5}
              />
              {/* Highlighted segment between the two anchor points */}
              <line
                x1={toSvgX(points[0].x)}
                y1={toSvgY(points[0].y)}
                x2={toSvgX(points[1].x)}
                y2={toSvgY(points[1].y)}
                stroke="#1d4ed8"
                strokeWidth={4}
              />
            </>
          )}

          {/* Dashed coordinate guide lines for plotted points */}
          {points.map((p) => (
            <g key={`guide-${p.x}-${p.y}`}>
              <line
                x1={toSvgX(p.x)}
                y1={center}
                x2={toSvgX(p.x)}
                y2={toSvgY(p.y)}
                stroke="#94a3b8"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <line
                x1={center}
                y1={toSvgY(p.y)}
                x2={toSvgX(p.x)}
                y2={toSvgY(p.y)}
                stroke="#94a3b8"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
            </g>
          ))}

          {/* Interactive clickable lattice points */}
          {ticks.map((gx) =>
            ticks.map((gy) => {
              const isSelected = points.some((p) => p.x === gx && p.y === gy);
              return (
                <g
                  key={`pt-${gx}-${gy}`}
                  onClick={() => onPointClick({ x: gx, y: gy })}
                  className="cursor-pointer group"
                >
                  <circle
                    cx={toSvgX(gx)}
                    cy={toSvgY(gy)}
                    r={12}
                    fill="transparent"
                  />
                  <circle
                    cx={toSvgX(gx)}
                    cy={toSvgY(gy)}
                    r={isSelected ? 6 : 3}
                    className={
                      isSelected
                        ? mode === 'points'
                          ? 'fill-emerald-600 stroke-white stroke-2'
                          : 'fill-blue-600 stroke-white stroke-2'
                        : 'fill-slate-300 opacity-60 group-hover:fill-blue-500 group-hover:opacity-100 group-hover:r-5 transition-all'
                    }
                  />
                  {isSelected && (
                    <text
                      x={toSvgX(gx) + 8}
                      y={toSvgY(gy) - 6}
                      className="fill-slate-900 text-[10px] font-extrabold mono"
                    >
                      ({gx},{gy})
                    </text>
                  )}
                </g>
              );
            })
          )}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* =====================================================================
          STEP 0: 대응과 함수 도입 인터랙티브 활동지 ([생각 열기], [보기], [문제 1])
         ===================================================================== */}
      {step === 0 && (
        <div className="space-y-6">
          <div>
            <div className="text-xs font-bold text-blue-600">
              01차시 · 함수의 뜻과 그래프 · 1 / 5단계
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              탐구 01 · 대응으로서의 함수 도입
            </h2>
            <p className="mt-1 text-sm sm:text-base text-slate-600">
              두 집합 <MathText text="X, Y" /> 사이의 대응 관계를 화살표로 직접 연결해 보고, 어떤 대응이 <strong>함수</strong>가 되는지 조건을 찾아봅시다.
            </p>
          </div>

          {/* 1. 교과서 [생각 열기] 이미지 + 인터랙티브 화살표 연결 활동지 */}
          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-blue-600 text-xs font-bold text-white mono">
                  1
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  [생각 열기] 나라와 화폐 단위를 화살표로 연결하기
                </h3>
              </div>
              {state.countryMapVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  연결 확인 완료
                </span>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
              <img
                src="/assets/aistudio/image_0c986aed.png"
                alt="생각 열기: 세계 여러 나라 X와 화폐 단위 Y"
                className="w-full max-w-2xl mx-auto h-auto rounded-lg"
              />
            </div>

            <div className="rounded-xl border border-blue-200/80 bg-blue-50/50 p-4 text-xs sm:text-sm text-slate-800 leading-relaxed">
              <strong className="text-blue-800">인터랙티브 조작 방법:</strong> 왼쪽 집합{' '}
              <span className="mono font-bold">X</span>의 나라를 선택한 뒤 오른쪽 집합{' '}
              <span className="mono font-bold">Y</span>의 화폐 단위를 클릭하여 화살표를 연결해 보세요.
            </div>

            {/* Interactive SVG Correspondence Diagram */}
            <div className="grid gap-5 lg:grid-cols-[1fr_280px] items-center">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <svg
                  viewBox="0 0 460 250"
                  className="w-full h-auto select-none"
                  role="img"
                  aria-label="집합 X(나라)에서 집합 Y(화폐 단위)로의 대응 화살표 다이어그램"
                >
                  <defs>
                    <marker
                      id="arrow-blue"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563eb" />
                    </marker>
                  </defs>

                  {/* Ovals for Set X and Set Y */}
                  <text x="105" y="24" textAnchor="middle" className="fill-slate-900 font-extrabold text-sm italic">
                    X (나라)
                  </text>
                  <ellipse
                    cx="105"
                    cy="135"
                    rx="72"
                    ry="98"
                    fill="#f8fafc"
                    stroke="#334155"
                    strokeWidth="2"
                  />

                  <text x="355" y="24" textAnchor="middle" className="fill-slate-900 font-extrabold text-sm italic">
                    Y (화폐 단위)
                  </text>
                  <ellipse
                    cx="355"
                    cy="135"
                    rx="72"
                    ry="98"
                    fill="#f8fafc"
                    stroke="#334155"
                    strokeWidth="2"
                  />

                  {/* Arrows */}
                  {L1_COUNTRIES.map((country, cIdx) => {
                    const targetCurrency = countryMap[country];
                    if (!targetCurrency) return null;
                    const tIdx = L1_CURRENCIES.indexOf(targetCurrency as any);
                    if (tIdx === -1) return null;
                    const y1 = 68 + cIdx * 44;
                    const y2 = 68 + tIdx * 44;
                    return (
                      <line
                        key={country}
                        x1={155}
                        y1={y1}
                        x2={298}
                        y2={y2}
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        markerEnd="url(#arrow-blue)"
                      />
                    );
                  })}

                  {/* Elements of X */}
                  {L1_COUNTRIES.map((country, idx) => {
                    const cy = 68 + idx * 44;
                    const isActive = selectedCountry === country;
                    return (
                      <g
                        key={country}
                        onClick={() => setSelectedCountry(country)}
                        className="cursor-pointer"
                      >
                        <rect
                          x={48}
                          y={cy - 15}
                          width={106}
                          height={30}
                          rx={8}
                          fill={isActive ? '#dbeafe' : '#ffffff'}
                          stroke={isActive ? '#2563eb' : '#cbd5e1'}
                          strokeWidth={isActive ? 2 : 1}
                        />
                        <text
                          x={101}
                          y={cy + 4}
                          textAnchor="middle"
                          className="fill-slate-900 text-xs font-bold"
                        >
                          {country}
                        </text>
                      </g>
                    );
                  })}

                  {/* Elements of Y */}
                  {L1_CURRENCIES.map((currency, idx) => {
                    const cy = 68 + idx * 44;
                    const isMappedFromSelected = countryMap[selectedCountry] === currency;
                    return (
                      <g
                        key={currency}
                        onClick={() => handleAssignCurrency(selectedCountry, currency)}
                        className="cursor-pointer"
                      >
                        <rect
                          x={302}
                          y={cy - 15}
                          width={106}
                          height={30}
                          rx={8}
                          fill={isMappedFromSelected ? '#dcfce7' : '#ffffff'}
                          stroke={isMappedFromSelected ? '#16a34a' : '#cbd5e1'}
                          strokeWidth={isMappedFromSelected ? 2 : 1}
                        />
                        <text
                          x={355}
                          y={cy + 4}
                          textAnchor="middle"
                          className="fill-slate-900 text-xs font-bold"
                        >
                          {currency}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Accessible Button / Select Controls for Country -> Currency */}
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-extrabold text-slate-700">
                  나라별 화폐 단위 선택 패널
                </div>
                {L1_COUNTRIES.map((country) => (
                  <div key={country} className="flex items-center justify-between gap-2">
                    <label
                      htmlFor={`country-select-${country}`}
                      className="text-xs sm:text-sm font-bold text-slate-800 shrink-0"
                    >
                      {country} →
                    </label>
                    <select
                      id={`country-select-${country}`}
                      aria-label={`${country} 화폐 단위 선택`}
                      value={countryMap[country] || ''}
                      onChange={(e) => handleAssignCurrency(country, e.target.value)}
                      className="w-full max-w-[150px] rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-900"
                    >
                      <option value="">선택하세요</option>
                      {L1_CURRENCIES.map((cur) => (
                        <option key={cur} value={cur}>
                          {cur}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}

                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleVerifyCountryMap}
                    className="flex-1 min-h-[40px] rounded-xl bg-blue-600 px-3 py-2 text-xs sm:text-sm font-bold text-white hover:bg-blue-700"
                  >
                    화살표 연결 확인
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdate((prev) => ({
                        ...prev,
                        countryMap: { ...L1_CORRECT_COUNTRY_MAP },
                        countryMapVerified: true,
                        examples:
                          prev.examples.length >= 4
                            ? prev.examples
                            : [
                                { n: -3, sq: 9, r: 1, valid: true },
                                { n: 1, sq: 1, r: 1, valid: true },
                                { n: 3, sq: 9, r: 1, valid: true },
                                { n: 5, sq: 25, r: 1, valid: true },
                              ],
                      }));
                      showNotice(
                        'countryMap',
                        '정확합니다! 대한민국→원(₩), 독일→유로(€), 프랑스→유로(€), 미국→달러($)로 X의 각 원소에 Y의 원소가 오직 하나씩 대응하므로 이 대응은 함수입니다.',
                        'good'
                      );
                    }}
                    className="min-h-[40px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    정답 자동 연결
                  </button>
                </div>
              </div>
            </div>

            {feedback.countryMap && (
              <div
                role="status"
                className={`flex items-start gap-2 rounded-xl p-3.5 text-xs sm:text-sm font-medium ${
                  feedback.countryMap.type === 'good'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                }`}
              >
                {feedback.countryMap.type === 'good' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <span>{feedback.countryMap.text}</span>
              </div>
            )}
          </div>

          {/* 2. 교과서 [보기] 정의역·공역·치역 개념 카드 */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-slate-900">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <span>핵심 개념 · 함수의 뜻과 정의역, 공역, 치역</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              공집합이 아닌 두 집합 <span className="mono font-bold">X, Y</span>에 대하여{' '}
              <strong>
                <span className="mono">X</span>의 각 원소에 <span className="mono">Y</span>의 원소가 오직 하나씩 대응
              </strong>
              할 때, 이 대응을 <span className="mono font-bold">X</span>에서 <span className="mono font-bold">Y</span>로의{' '}
              <strong className="text-blue-700">함수</strong>라 하고, 기호로{' '}
              <span className="mono font-bold text-blue-700">f: X → Y</span>와 같이 나타냅니다. 이때 함숫값 전체의 집합{' '}
              <span className="mono font-semibold">{'{f(x) | x ∈ X}'}</span>를 함수 <span className="mono">f</span>의{' '}
              <strong className="text-emerald-700">치역</strong>이라고 하며, 치역은 공역 <span className="mono">Y</span>의 부분집합입니다.
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 sm:p-4">
              <img
                src="/assets/aistudio/image_27581b60.png"
                alt="보기: 함수 f: X -> Y의 정의역, 공역, 치역"
                className="w-full max-w-2xl mx-auto h-auto rounded-lg"
              />
            </div>
          </div>

          {/* 3. 교과서 [문제 1] 인터랙티브 활동지 */}
          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-slate-900 text-xs font-bold text-white mono">
                  2
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  [문제 1] 함수인 것 찾기와 정의역·공역·치역 구하기
                </h3>
              </div>
              {state.prob1Verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  문제 1 해결 완료
                </span>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
              <img
                src="/assets/aistudio/image_e014c6f3.png"
                alt="문제 1: 세 가지 대응 (1), (2), (3)"
                className="w-full max-w-2xl mx-auto h-auto rounded-lg"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {/* (1)번 대응 */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-slate-900">(1)번 대응 판별</span>
                  <span className="mono text-xs text-slate-500">1→c, 2→a, 4→b</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdate((prev) => ({ ...prev, prob1_1IsFunc: 'yes', prob1Verified: false }))}
                    className={`rounded-lg border py-2 text-xs font-bold transition-colors ${
                      state.prob1_1IsFunc === 'yes'
                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    함수이다
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdate((prev) => ({ ...prev, prob1_1IsFunc: 'no', prob1Verified: false }))}
                    className={`rounded-lg border py-2 text-xs font-bold transition-colors ${
                      state.prob1_1IsFunc === 'no'
                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    함수가 아니다
                  </button>
                </div>
                <div>
                  <label htmlFor="prob1_1Reason" className="block text-xs font-bold text-slate-700 mb-1">
                    함수가 아닌 이유 (원소 번호 포함)
                  </label>
                  <input
                    id="prob1_1Reason"
                    type="text"
                    value={state.prob1_1Reason || ''}
                    onChange={(e) =>
                      onUpdate((prev) => ({ ...prev, prob1_1Reason: e.target.value, prob1Verified: false }))
                    }
                    placeholder="예: X의 원소 3에 대응하는 Y의 원소가 없다."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white px-3 py-2 text-xs sm:text-sm text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onUpdate((prev) => ({
                        ...prev,
                        prob1_1IsFunc: 'no',
                        prob1_1Reason: 'X의 원소 3에 대응하는 Y의 원소가 없기 때문이다.',
                        prob1Verified: false,
                      }))
                    }
                    className="mt-1.5 text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    + 예시 문장 넣기 (원소 3 미대응)
                  </button>
                </div>
              </div>

              {/* (2)번 대응 */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-slate-900">(2)번 대응 판별</span>
                  <span className="mono text-xs text-slate-500">1→c, 2→d, 3→a, 4→c</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdate((prev) => ({ ...prev, prob1_2IsFunc: 'yes', prob1Verified: false }))}
                    className={`rounded-lg border py-2 text-xs font-bold transition-colors ${
                      state.prob1_2IsFunc === 'yes'
                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    함수이다
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdate((prev) => ({ ...prev, prob1_2IsFunc: 'no', prob1Verified: false }))}
                    className={`rounded-lg border py-2 text-xs font-bold transition-colors ${
                      state.prob1_2IsFunc === 'no'
                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    함수가 아니다
                  </button>
                </div>
                <div className="space-y-2">
                  <div>
                    <label htmlFor="prob1_2Domain" className="block text-xs font-bold text-slate-700">
                      ① 정의역 X
                    </label>
                    <input
                      id="prob1_2Domain"
                      type="text"
                      value={state.prob1_2Domain || ''}
                      onChange={(e) =>
                        onUpdate((prev) => ({ ...prev, prob1_2Domain: e.target.value, prob1Verified: false }))
                      }
                      placeholder="{1, 2, 3, 4}"
                      className="mt-0.5 w-full rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white px-2.5 py-1.5 text-xs sm:text-sm mono text-slate-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="prob1_2Codomain" className="block text-xs font-bold text-slate-700">
                      ② 공역 Y
                    </label>
                    <input
                      id="prob1_2Codomain"
                      type="text"
                      value={state.prob1_2Codomain || ''}
                      onChange={(e) =>
                        onUpdate((prev) => ({ ...prev, prob1_2Codomain: e.target.value, prob1Verified: false }))
                      }
                      placeholder="{a, b, c, d}"
                      className="mt-0.5 w-full rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white px-2.5 py-1.5 text-xs sm:text-sm mono text-slate-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="prob1_2Range" className="block text-xs font-bold text-slate-700">
                      ③ 치역 {'{f(x) | x ∈ X}'}
                    </label>
                    <input
                      id="prob1_2Range"
                      type="text"
                      value={state.prob1_2Range || ''}
                      onChange={(e) =>
                        onUpdate((prev) => ({ ...prev, prob1_2Range: e.target.value, prob1Verified: false }))
                      }
                      placeholder="{a, c, d}"
                      className="mt-0.5 w-full rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white px-2.5 py-1.5 text-xs sm:text-sm mono text-slate-900"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdate((prev) => ({
                        ...prev,
                        prob1_2IsFunc: 'yes',
                        prob1_2Domain: '{1, 2, 3, 4}',
                        prob1_2Codomain: '{a, b, c, d}',
                        prob1_2Range: '{a, c, d}',
                        prob1Verified: false,
                      }))
                    }
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    + 집합 기호 빠른 입력 ({'{1,2,3,4}'}, {'{a,b,c,d}'}, {'{a,c,d}'})
                  </button>
                </div>
              </div>

              {/* (3)번 대응 */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-slate-900">(3)번 대응 판별</span>
                  <span className="mono text-xs text-slate-500">4→b, 4→d</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdate((prev) => ({ ...prev, prob1_3IsFunc: 'yes', prob1Verified: false }))}
                    className={`rounded-lg border py-2 text-xs font-bold transition-colors ${
                      state.prob1_3IsFunc === 'yes'
                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    함수이다
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdate((prev) => ({ ...prev, prob1_3IsFunc: 'no', prob1Verified: false }))}
                    className={`rounded-lg border py-2 text-xs font-bold transition-colors ${
                      state.prob1_3IsFunc === 'no'
                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    함수가 아니다
                  </button>
                </div>
                <div>
                  <label htmlFor="prob1_3Reason" className="block text-xs font-bold text-slate-700 mb-1">
                    함수가 아닌 이유 (원소 번호 포함)
                  </label>
                  <input
                    id="prob1_3Reason"
                    type="text"
                    value={state.prob1_3Reason || ''}
                    onChange={(e) =>
                      onUpdate((prev) => ({ ...prev, prob1_3Reason: e.target.value, prob1Verified: false }))
                    }
                    placeholder="예: X의 원소 4에 대응하는 Y의 원소가 b, d로 2개이다."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white px-3 py-2 text-xs sm:text-sm text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onUpdate((prev) => ({
                        ...prev,
                        prob1_3IsFunc: 'no',
                        prob1_3Reason: 'X의 원소 4에 대응하는 Y의 원소가 b와 d로 2개이기 때문이다.',
                        prob1Verified: false,
                      }))
                    }
                    className="mt-1.5 text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    + 예시 문장 넣기 (원소 4에 2개 대응)
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleVerifyProb1}
                className="min-h-[44px] rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
              >
                문제 1 정답 및 이유 점검
              </button>
              <button
                type="button"
                onClick={() => toggleHint('prob1')}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs sm:text-sm font-bold text-amber-800 hover:bg-amber-100"
              >
                <HelpCircle className="h-4 w-4" />
                {showHints.prob1 ? '힌트 접기' : '문제 1 힌트 보기'}
              </button>
            </div>

            {showHints.prob1 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs sm:text-sm text-amber-900 space-y-1">
                <div>
                  <strong>힌트 1:</strong> 함수가 되려면 집합 X의 모든 원소 1, 2, 3, 4에서 화살표가 빠짐없이 1개씩만 출발해야 합니다.
                </div>
                <div>
                  <strong>힌트 2:</strong> (2)번에서 1과 4가 모두 c에 대응하더라도, X의 각 원소에서 화살표가 하나씩만 나갔으므로 함수가 맞습니다! 이때 치역은 화살표를 받은 원소들의 집합 {'{a, c, d}'}입니다.
                </div>
              </div>
            )}

            {feedback.prob1 && (
              <div
                role="status"
                className={`flex items-start gap-2 rounded-xl p-3.5 text-xs sm:text-sm font-medium ${
                  feedback.prob1.type === 'good'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                }`}
              >
                {feedback.prob1.type === 'good' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <span>{feedback.prob1.text}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 1: 정의역과 치역 구하기 ([보기] & [문제 2])
         ===================================================================== */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <div className="text-xs font-bold text-blue-600">
              01차시 · 함수의 뜻과 그래프 · 2 / 5단계
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              탐구 02 · 함수의 정의역과 치역 구하기
            </h2>
            <p className="mt-1 text-sm sm:text-base text-slate-600">
              정의역이나 공역이 따로 정해져 있지 않은 경우, 함숫값 <MathText text="f(x)" />가 정의되는 실수 전체의 집합을 정의역으로 합니다.
            </p>
          </div>

          {/* 교과서 [보기] & [문제 2] 이미지 */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6 space-y-4">
            <img
              src="/assets/aistudio/image_d9cfc624.png"
              alt="보기 및 문제 2: 함수의 정의역과 치역"
              className="w-full max-w-2xl mx-auto h-auto rounded-lg"
            />
          </div>

          {/* 인터랙티브 함숫값 실험기 */}
          <div className="rounded-2xl border border-blue-200/80 bg-blue-50/40 p-5 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Compass className="h-4 w-4 text-blue-600" />
                <span>실시간 함숫값 탐색기 · x를 움직여 y의 범위(치역) 관찰하기</span>
              </h3>
              <span className="mono text-xs font-bold text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-blue-200">
                현재 x = {domainExplorerX}
              </span>
            </div>

            <div>
              <label htmlFor="domainExplorerSlider" className="sr-only">
                실수 x 값 조절 슬라이더
              </label>
              <input
                id="domainExplorerSlider"
                type="range"
                min={-4}
                max={4}
                step={0.5}
                value={domainExplorerX}
                onChange={(e) => setDomainExplorerX(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] mono text-slate-500 mt-1">
                <span>x = -4</span>
                <span>x = -2</span>
                <span>x = 0 (최댓값 지점)</span>
                <span>x = 2</span>
                <span>x = 4</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                <div className="text-xs font-bold text-slate-500">(1) 일차함수 y = 2x + 1</div>
                <div className="mt-1 mono text-sm sm:text-base font-extrabold text-slate-900">
                  y = 2 × ({domainExplorerX}) + 1 ={' '}
                  <span className="text-blue-600">{2 * domainExplorerX + 1}</span>
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  x가 모든 실수를 움직이면 y도 제한 없이 <strong>모든 실수</strong> 값을 가집니다.
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                <div className="text-xs font-bold text-slate-500">(2) 이차함수 y = -x² + 3</div>
                <div className="mt-1 mono text-sm sm:text-base font-extrabold text-slate-900">
                  y = -({domainExplorerX})² + 3 ={' '}
                  <span className="text-emerald-600">{-(domainExplorerX * domainExplorerX) + 3}</span> ≤ 3
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  실수의 제곱은 항상 <span className="mono">x² ≥ 0</span>이므로 <span className="mono">-x² ≤ 0</span>이 되어 함숫값 y는 항상 <strong>3 이하</strong>입니다.
                </div>
              </div>
            </div>
          </div>

          {/* [문제 2] 작성 폼 */}
          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                [문제 2] 다음 함수의 정의역과 치역을 구하시오
              </h3>
              {state.prob2Verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  문제 2 확인 완료
                </span>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* 문제 2-(1) */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <div className="text-sm font-extrabold text-slate-900">
                  (1) 함수 <span className="mono text-blue-700">y = 2x + 1</span>
                </div>
                <div>
                  <label htmlFor="prob2_1Domain" className="block text-xs font-bold text-slate-700 mb-1">
                    정의역
                  </label>
                  <input
                    id="prob2_1Domain"
                    type="text"
                    value={state.prob2_1Domain || ''}
                    onChange={(e) =>
                      onUpdate((prev) => ({ ...prev, prob2_1Domain: e.target.value, prob2Verified: false }))
                    }
                    placeholder="예: {x | x는 실수}"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 focus:bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label htmlFor="prob2_1Range" className="block text-xs font-bold text-slate-700 mb-1">
                    치역
                  </label>
                  <input
                    id="prob2_1Range"
                    type="text"
                    value={state.prob2_1Range || ''}
                    onChange={(e) =>
                      onUpdate((prev) => ({ ...prev, prob2_1Range: e.target.value, prob2Verified: false }))
                    }
                    placeholder="예: {y | y는 실수}"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 focus:bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onUpdate((prev) => ({
                      ...prev,
                      prob2_1Domain: '{x | x는 실수}',
                      prob2_1Range: '{y | y는 실수}',
                      prob2Verified: false,
                    }))
                  }
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  + 조건제시법 빠른 입력 ({'{x | x는 실수}'}, {'{y | y는 실수}'})
                </button>
              </div>

              {/* 문제 2-(2) */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <div className="text-sm font-extrabold text-slate-900">
                  (2) 함수 <span className="mono text-blue-700">y = -x² + 3</span>
                </div>
                <div>
                  <label htmlFor="prob2_2Domain" className="block text-xs font-bold text-slate-700 mb-1">
                    정의역
                  </label>
                  <input
                    id="prob2_2Domain"
                    type="text"
                    value={state.prob2_2Domain || ''}
                    onChange={(e) =>
                      onUpdate((prev) => ({ ...prev, prob2_2Domain: e.target.value, prob2Verified: false }))
                    }
                    placeholder="예: {x | x는 실수}"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 focus:bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label htmlFor="prob2_2Range" className="block text-xs font-bold text-slate-700 mb-1">
                    치역
                  </label>
                  <input
                    id="prob2_2Range"
                    type="text"
                    value={state.prob2_2Range || ''}
                    onChange={(e) =>
                      onUpdate((prev) => ({ ...prev, prob2_2Range: e.target.value, prob2Verified: false }))
                    }
                    placeholder="예: {y | y ≤ 3인 실수}"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 focus:bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onUpdate((prev) => ({
                      ...prev,
                      prob2_2Domain: '{x | x는 실수}',
                      prob2_2Range: '{y | y ≤ 3인 실수}',
                      prob2Verified: false,
                    }))
                  }
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  + 조건제시법 빠른 입력 ({'{x | x는 실수}'}, {'{y | y ≤ 3인 실수}'})
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleVerifyProb2}
                className="min-h-[44px] rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
              >
                문제 2 정의역·치역 점검
              </button>
            </div>

            {feedback.prob2 && (
              <div
                role="status"
                className={`flex items-start gap-2 rounded-xl p-3.5 text-xs sm:text-sm font-medium ${
                  feedback.prob2.type === 'good'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                }`}
              >
                {feedback.prob2.type === 'good' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <span>{feedback.prob2.text}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 2: 서로 같은 함수 ([탐구+ 문제 3])
         ===================================================================== */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <div className="text-xs font-bold text-blue-600">
              01차시 · 함수의 뜻과 그래프 · 3 / 5단계
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              탐구 03 · 두 함수의 식이 달라도 서로 같은 함수가 될 수 있을까?
            </h2>
            <p className="mt-1 text-sm sm:text-base text-slate-600">
              두 함수 <span className="mono font-bold">f, g</span>의 정의역과 공역이 각각 같고, 정의역의 모든 원소{' '}
              <span className="mono font-bold">x</span>에 대하여 <span className="mono font-bold">f(x) = g(x)</span>일 때, 두 함수는 서로 같다고 하며{' '}
              <strong className="text-blue-700 mono">f = g</strong>로 나타냅니다.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6">
            <img
              src="/assets/aistudio/image_b125265d.png"
              alt="탐구+ 문제 3: 정의역이 {-1, 0, 1}인 두 함수 f(x)=|2x|와 g(x)=2x² 비교"
              className="w-full max-w-2xl mx-auto h-auto rounded-lg"
            />
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                [탐구+ 문제 3] 함숫값 표 완성 및 두 함수의 일치 판별
              </h3>
              {state.prob3Verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  문제 3 확인 완료
                </span>
              )}
            </div>

            {/* (1) 표 완성하기 */}
            <div className="space-y-2">
              <div className="text-sm font-bold text-slate-800">
                (1) 정의역 <span className="mono">{'{-1, 0, 1}'}</span>의 각 원소에서{' '}
                <span className="mono text-blue-700">f(x) = |2x|</span>와{' '}
                <span className="mono text-indigo-700">g(x) = 2x²</span>의 함숫값 표를 완성하시오.
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full border-collapse text-sm text-center">
                  <thead>
                    <tr className="bg-emerald-50/70 border-b border-slate-200 font-extrabold text-slate-800">
                      <th className="py-3 px-4 border-r border-slate-200 mono">x</th>
                      <th className="py-3 px-4 border-r border-slate-200 mono">-1</th>
                      <th className="py-3 px-4 border-r border-slate-200 mono">0</th>
                      <th className="py-3 px-4 mono">1</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-3 px-4 border-r border-slate-200 bg-emerald-50/40 font-extrabold mono text-blue-700">
                        f(x) = |2x|
                      </td>
                      <td className="py-3 px-4 border-r border-slate-200 mono font-bold text-slate-900">
                        2
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200">
                        <input
                          type="text"
                          inputMode="numeric"
                          aria-label="x=0일 때 f(0)의 값"
                          value={prob3Table.f0}
                          onChange={(e) => updateProb3Cell('f0', e.target.value)}
                          placeholder="f(0)"
                          className="w-20 rounded-lg border border-blue-300 bg-blue-50/40 focus:bg-white py-1.5 text-center font-extrabold mono text-slate-900"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          inputMode="numeric"
                          aria-label="x=1일 때 f(1)의 값"
                          value={prob3Table.f1}
                          onChange={(e) => updateProb3Cell('f1', e.target.value)}
                          placeholder="f(1)"
                          className="w-20 rounded-lg border border-blue-300 bg-blue-50/40 focus:bg-white py-1.5 text-center font-extrabold mono text-slate-900"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 border-r border-slate-200 bg-emerald-50/40 font-extrabold mono text-indigo-700">
                        g(x) = 2x²
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200">
                        <input
                          type="text"
                          inputMode="numeric"
                          aria-label="x=-1일 때 g(-1)의 값"
                          value={prob3Table.gm1}
                          onChange={(e) => updateProb3Cell('gm1', e.target.value)}
                          placeholder="g(-1)"
                          className="w-20 rounded-lg border border-indigo-300 bg-indigo-50/40 focus:bg-white py-1.5 text-center font-extrabold mono text-slate-900"
                        />
                      </td>
                      <td className="py-3 px-4 border-r border-slate-200 mono font-bold text-slate-900">
                        0
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          inputMode="numeric"
                          aria-label="x=1일 때 g(1)의 값"
                          value={prob3Table.g1}
                          onChange={(e) => updateProb3Cell('g1', e.target.value)}
                          placeholder="g(1)"
                          className="w-20 rounded-lg border border-indigo-300 bg-indigo-50/40 focus:bg-white py-1.5 text-center font-extrabold mono text-slate-900"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* (2) 두 함수가 서로 같은지 말하기 */}
            <div className="space-y-3 pt-2 border-t border-slate-200/80">
              <div className="text-sm font-bold text-slate-800">
                (2) (1)의 결과를 이용하여 두 함수 <span className="mono">f</span>와 <span className="mono">g</span>가 서로 같은지 판별하고 그 이유를 서술하시오.
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => onUpdate((prev) => ({ ...prev, prob3IsEqual: 'yes', prob3Verified: false }))}
                  className={`rounded-xl border p-3.5 text-sm font-bold transition-colors ${
                    state.prob3IsEqual === 'yes'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-600'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  두 함수는 서로 같다 (f = g)
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate((prev) => ({ ...prev, prob3IsEqual: 'no', prob3Verified: false }))}
                  className={`rounded-xl border p-3.5 text-sm font-bold transition-colors ${
                    state.prob3IsEqual === 'no'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-600'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  두 함수는 서로 같지 않다 (f ≠ g)
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                  <label htmlFor="prob3Reason" className="text-xs sm:text-sm font-bold text-slate-800">
                    두 함수가 서로 같은(또는 다른) 수학적 이유 서술 (10자 이상)
                  </label>
                  <CharCountBadge current={(state.prob3Reason || '').trim().length} min={10} />
                </div>
                <textarea
                  id="prob3Reason"
                  rows={2}
                  value={state.prob3Reason || ''}
                  onChange={(e) =>
                    onUpdate((prev) => ({ ...prev, prob3Reason: e.target.value, prob3Verified: false }))
                  }
                  placeholder="정의역 {-1, 0, 1}의 모든 원소에 대하여 f(-1)=g(-1)=2, f(0)=g(0)=0, f(1)=g(1)=2이므로 f = g이다."
                  className={`w-full rounded-xl border bg-white p-3 text-sm text-slate-900 ${getCharCountBorderClass(
                    (state.prob3Reason || '').trim().length,
                    10
                  )}`}
                />
                <button
                  type="button"
                  onClick={() =>
                    onUpdate((prev) => ({
                      ...prev,
                      prob3Table: { f0: '0', f1: '2', gm1: '2', g1: '2' },
                      prob3IsEqual: 'yes',
                      prob3Reason:
                        '정의역 {-1, 0, 1}의 모든 원소 x에 대하여 f(-1)=g(-1)=2, f(0)=g(0)=0, f(1)=g(1)=2로 함숫값이 모두 같으므로 두 함수 f와 g는 서로 같다 (f = g).',
                      prob3Verified: false,
                    }))
                  }
                  className="mt-1.5 text-xs font-bold text-blue-600 hover:underline"
                >
                  + 표와 서술 예시 채우기
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleVerifyProb3}
                className="min-h-[44px] rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
              >
                문제 3 확인하기
              </button>
            </div>

            {feedback.prob3 && (
              <div
                role="status"
                className={`flex items-start gap-2 rounded-xl p-3.5 text-xs sm:text-sm font-medium ${
                  feedback.prob3.type === 'good'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                }`}
              >
                {feedback.prob3.type === 'good' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <span>{feedback.prob3.text}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 3: 함수의 그래프 — 직접 점 찍기 & 직선 긋기 ([문제 4], [문제 5])
         ===================================================================== */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <div className="text-xs font-bold text-blue-600">
              01차시 · 함수의 뜻과 그래프 · 4 / 5단계
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              탐구 04 · 좌표평면 위에 직접 점 찍기와 직선 긋기
            </h2>
            <p className="mt-1 text-sm sm:text-base text-slate-600">
              함수 <span className="mono font-bold">f: X → Y</span>에서 정의역 <span className="mono font-bold">X</span>의 원소{' '}
              <span className="mono font-bold">x</span>와 이에 대응하는 함숫값 <span className="mono font-bold">f(x)</span>의 순서쌍{' '}
              <span className="mono font-semibold">{'{(x, f(x)) | x ∈ X}'}</span> 전체의 집합을 함수 <span className="mono font-bold">f</span>의 그래프라고 합니다.
            </p>
          </div>

          {/* 교과서 함수의 그래프 & 문제 4, 5 이미지 */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6">
            <img
              src="/assets/aistudio/image_4e12a268.png"
              alt="함수의 그래프 개념 및 문제 4, 문제 5"
              className="w-full max-w-2xl mx-auto h-auto rounded-lg"
            />
          </div>

          {/* [문제 4] 인터랙티브 좌표평면 (점 찍기 & 직선 긋기) */}
          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  [문제 4] 정의역에 따라 함수 <span className="mono text-blue-700">y = -2x + 3</span>의 그래프 그리기
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  좌표평면의 격자점을 직접 클릭하거나 아래 좌표 버튼을 눌러 점을 찍고 직선을 그어 보세요.
                </p>
              </div>
              {state.prob4_1Verified && state.prob4_2Verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  문제 4 그래프 완성
                </span>
              )}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* 문제 4-(1): 점 찍기 */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-sm font-extrabold text-slate-900">
                      (1) 정의역이 <span className="mono text-emerald-700">{'{0, 1, 2, 3}'}</span>일 때
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      좌표평면을 클릭하여 4개의 순서쌍 점을 직접 찍으세요.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdate((prev) => ({ ...prev, prob4_1Points: [], prob4_1Verified: false }))
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    <RotateCcw className="h-3 w-3" />
                    초기화
                  </button>
                </div>

                {renderCoordinatePlane('points', prob4_1Points, handleTogglePoint4_1)}

                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700">
                    빠른 점 찍기 보조 버튼 (클릭 시 토글 · 현재 찍힌 점:{' '}
                    <span className="mono text-emerald-700">
                      {prob4_1Points.length > 0
                        ? prob4_1Points.map((p) => `(${p.x}, ${p.y})`).join(', ')
                        : '없음'}
                    </span>
                    )
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { x: 0, y: 3 },
                      { x: 1, y: 1 },
                      { x: 2, y: -1 },
                      { x: 3, y: -3 },
                      { x: -1, y: 2 },
                    ].map((pt) => {
                      const active = prob4_1Points.some((p) => p.x === pt.x && p.y === pt.y);
                      return (
                        <button
                          key={`${pt.x},${pt.y}`}
                          type="button"
                          onClick={() => handleTogglePoint4_1(pt)}
                          className={`rounded-lg border px-2.5 py-1 text-xs font-bold mono transition-colors ${
                            active
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          점 ({pt.x}, {pt.y})
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleVerifyProb4_1}
                  className="w-full min-h-[42px] rounded-xl bg-emerald-600 px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-emerald-700"
                >
                  문제 4-(1) 점 그래프 확인
                </button>

                {feedback.prob4_1 && (
                  <div
                    role="status"
                    className={`rounded-xl p-3 text-xs font-medium ${
                      feedback.prob4_1.type === 'good'
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        : 'bg-amber-50 text-amber-900 border border-amber-200'
                    }`}
                  >
                    {feedback.prob4_1.text}
                  </div>
                )}
              </div>

              {/* 문제 4-(2): 선분/직선 긋기 */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-sm font-extrabold text-slate-900">
                      (2) 정의역이 <span className="mono text-blue-700">{'{x | x는 실수}'}</span>일 때
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      직선 <span className="mono">y = -2x + 3</span> 위의 서로 다른 두 점을 클릭하여 선분·직선을 그으세요.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdate((prev) => ({ ...prev, prob4_2LinePoints: [], prob4_2Verified: false }))
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    <RotateCcw className="h-3 w-3" />
                    초기화
                  </button>
                </div>

                {renderCoordinatePlane('line', prob4_2LinePoints, handleToggleLinePoint4_2)}

                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700">
                    직선 기준점 선택 (2개 선택 시 자동 연결 · 현재:{' '}
                    <span className="mono text-blue-700">
                      {prob4_2LinePoints.length > 0
                        ? prob4_2LinePoints.map((p) => `(${p.x}, ${p.y})`).join(' — ')
                        : '없음'}
                    </span>
                    )
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdate((prev) => ({
                          ...prev,
                          prob4_2LinePoints: [
                            { x: 0, y: 3 },
                            { x: 2, y: -1 },
                          ],
                          prob4_2Verified: false,
                        }))
                      }
                      className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100"
                    >
                      두 점 (0, 3)과 (2, -1) 연결하여 직선 긋기
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdate((prev) => ({
                          ...prev,
                          prob4_2LinePoints: [
                            { x: 0, y: 3 },
                            { x: 1, y: 1 },
                          ],
                          prob4_2Verified: false,
                        }))
                      }
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100"
                    >
                      (0, 3)과 (1, 1) 연결
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleVerifyProb4_2}
                  className="w-full min-h-[42px] rounded-xl bg-blue-600 px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-blue-700"
                >
                  문제 4-(2) 직선 그래프 확인
                </button>

                {feedback.prob4_2 && (
                  <div
                    role="status"
                    className={`rounded-xl p-3 text-xs font-medium ${
                      feedback.prob4_2.type === 'good'
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        : 'bg-amber-50 text-amber-900 border border-amber-200'
                    }`}
                  >
                    {feedback.prob4_2.text}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* [문제 5] 수직선 판정법(x = a) 시뮬레이터 및 판별 활동지 */}
          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  [문제 5] 직선 <span className="mono text-blue-700">x = a</span>를 움직여 함수의 그래프 판별하기
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  함수의 그래프는 정의역의 각 원소 <span className="mono">a</span>에 대하여 <span className="mono">x</span>축에 수직인 직선{' '}
                  <span className="mono font-bold">x = a</span>와 <strong>오직 한 점</strong>에서 만납니다.
                </p>
              </div>
              {state.prob5Verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  문제 5 해결 완료
                </span>
              )}
            </div>

            {/* 수직선 x = a 슬라이더 실험 */}
            <div className="rounded-xl border border-blue-200 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label htmlFor="verticalLineSlider" className="text-xs sm:text-sm font-bold text-slate-800">
                  수직선 <span className="mono text-blue-600">x = a</span> 위치 조절 (현재{' '}
                  <span className="mono font-extrabold text-blue-700">a = {verticalLineA}</span>)
                </label>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setVerticalLineA(0.5)}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 mono"
                  >
                    a = 0.5 (원 내부)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerticalLineA(3)}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 mono"
                  >
                    a = 3 (점 그래프 중복)
                  </button>
                </div>
              </div>
              <input
                id="verticalLineSlider"
                type="range"
                min={-1}
                max={4}
                step={0.5}
                value={verticalLineA}
                onChange={(e) => setVerticalLineA(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="grid gap-2 sm:grid-cols-3 text-xs">
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5">
                  <strong className="text-emerald-900">(1) 직선 그래프:</strong>{' '}
                  <span className="text-emerald-800">
                    x = {verticalLineA}에서 교점 <strong>1개</strong> (함수 O)
                  </span>
                </div>
                <div
                  className={`rounded-lg border p-2.5 ${
                    verticalLineA === 3
                      ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <strong>(2) 점 그래프:</strong>{' '}
                  {verticalLineA === 3
                    ? 'x = 3에서 (3, 1), (3, 3) 교점 2개! (함수 X)'
                    : 'a = 3으로 이동해 교점 개수를 확인해 보세요.'}
                </div>
                <div
                  className={`rounded-lg border p-2.5 ${
                    verticalLineA > -1 && verticalLineA < 1
                      ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <strong>(3) 원 그래프:</strong>{' '}
                  {verticalLineA > -1 && verticalLineA < 1
                    ? `x = ${verticalLineA}에서 위·아래 교점 2개! (함수 X)`
                    : '-1 < a < 1 구간으로 이동해 보세요.'}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-800 mb-2">
                  ① (1), (2), (3) 중 함수의 그래프인 것을 고르시오.
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['1', '2', '3'] as const).map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => onUpdate((prev) => ({ ...prev, prob5Choice: num, prob5Verified: false }))}
                      className={`rounded-xl border py-2.5 text-sm font-bold transition-colors ${
                        state.prob5Choice === num
                          ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-600'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      ({num})번 그래프
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="prob5_2Reason" className="block text-xs font-bold text-slate-700 mb-1">
                    ② (2)번이 함수의 그래프가 아닌 이유
                  </label>
                  <input
                    id="prob5_2Reason"
                    type="text"
                    value={state.prob5_2Reason || ''}
                    onChange={(e) =>
                      onUpdate((prev) => ({ ...prev, prob5_2Reason: e.target.value, prob5Verified: false }))
                    }
                    placeholder="예: x = 3일 때 대응하는 y의 값이 1, 3으로 2개이기 때문이다."
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label htmlFor="prob5_3Reason" className="block text-xs font-bold text-slate-700 mb-1">
                    ③ (3)번이 함수의 그래프가 아닌 이유
                  </label>
                  <input
                    id="prob5_3Reason"
                    type="text"
                    value={state.prob5_3Reason || ''}
                    onChange={(e) =>
                      onUpdate((prev) => ({ ...prev, prob5_3Reason: e.target.value, prob5Verified: false }))
                    }
                    placeholder="예: -1 < a < 1인 직선 x = a와 두 점에서 만나기 때문이다."
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleVerifyProb5}
                  className="min-h-[44px] rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
                >
                  문제 5 정답 및 이유 확인
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onUpdate((prev) => ({
                      ...prev,
                      prob5Choice: '1',
                      prob5_2Reason: 'x = 3에서 직선 x = 3과 두 점 (3, 1), (3, 3)에서 만나므로(y값이 2개 대응) 함수의 그래프가 아니다.',
                      prob5_3Reason: '-1 < a < 1인 실수 a에 대하여 직선 x = a와 두 점에서 만나므로 함수의 그래프가 아니다.',
                      prob5Verified: false,
                    }))
                  }
                  className="text-xs font-bold text-blue-600 hover:underline px-2 py-1"
                >
                  + 예시 답안 채우기
                </button>
              </div>

              {feedback.prob5 && (
                <div
                  role="status"
                  className={`flex items-start gap-2 rounded-xl p-3.5 text-xs sm:text-sm font-medium ${
                    feedback.prob5.type === 'good'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-amber-50 text-amber-900 border border-amber-200'
                  }`}
                >
                  {feedback.prob5.type === 'good' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <span>{feedback.prob5.text}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 4: 마지막 도전 활동 — 실생활에서 함수인 예 찾아보기 활동지
         ===================================================================== */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <div className="text-xs font-bold text-blue-600">
              01차시 · 함수의 뜻과 그래프 · 5 / 5단계 (도전 활동)
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              도전! 실생활에서 함수인 예 찾아보기 활동지
            </h2>
            <p className="mt-1 text-sm sm:text-base text-slate-600">
              우리 주변의 현상이나 규칙 중에서 <strong>집합 X의 각 원소에 집합 Y의 원소가 오직 하나씩 대응하는 실생활 함수</strong>를 찾아 정의역, 공역, 대응 규칙으로 설계해 봅시다.
            </p>
          </div>

          {/* 활동 1: 실생활 대응 워밍업 퀴즈 */}
          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  활동 1 · 실생활 대응 중 함수인 것 가려내기
                </h3>
              </div>
              {state.realLifeQuizVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  실생활 판별 완료
                </span>
              )}
            </div>

            <div className="space-y-3">
              {REAL_LIFE_QUIZ_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="text-sm font-extrabold text-slate-900">{item.title}</div>
                    <div className="text-xs text-slate-600">{item.desc}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdate((prev) => ({
                          ...prev,
                          realLifeQuiz: { ...(prev.realLifeQuiz || {}), [item.id]: 'yes' },
                          realLifeQuizVerified: false,
                        }))
                      }
                      className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                        realLifeQuiz[item.id] === 'yes'
                          ? 'border-blue-600 bg-blue-50 text-blue-800'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      함수이다 (O)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdate((prev) => ({
                          ...prev,
                          realLifeQuiz: { ...(prev.realLifeQuiz || {}), [item.id]: 'no' },
                          realLifeQuizVerified: false,
                        }))
                      }
                      className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                        realLifeQuiz[item.id] === 'no'
                          ? 'border-blue-600 bg-blue-50 text-blue-800'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      함수가 아니다 (X)
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleVerifyRealLifeQuiz}
              className="min-h-[42px] rounded-xl bg-blue-600 px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-blue-700"
            >
              실생활 대응 판별 확인
            </button>

            {feedback.realLifeQuiz && (
              <div
                role="status"
                className={`flex items-start gap-2 rounded-xl p-3.5 text-xs sm:text-sm font-medium ${
                  feedback.realLifeQuiz.type === 'good'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-amber-50 text-amber-900 border border-amber-200'
                }`}
              >
                {feedback.realLifeQuiz.type === 'good' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <span>{feedback.realLifeQuiz.text}</span>
              </div>
            )}
          </div>

          {/* 활동 2: 나만의 실생활 함수 설계 활동지 */}
          <div className="rounded-2xl border border-blue-200/90 bg-white p-5 sm:p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  활동 2 · 내가 찾은 실생활 속 함수 <span className="mono text-blue-700">f: X → Y</span> 설계서
                </h3>
              </div>
            </div>

            {/* 추천 실생활 소재 버튼 */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
              <div className="text-xs font-bold text-slate-700">
                💡 실생활 함수 아이디어 뱅크 (클릭하면 예시 양식을 불러와 자유롭게 수정할 수 있습니다):
              </div>
              <div className="flex flex-wrap gap-2">
                {REAL_LIFE_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.label}
                    type="button"
                    onClick={() => applyRealLifeTemplate(tpl)}
                    className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50 transition-colors"
                  >
                    + {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {feedback.realLifeDesign && (
              <div
                role="status"
                className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs sm:text-sm font-medium text-blue-900"
              >
                {feedback.realLifeDesign.text}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="realLifeDomainX" className="block text-xs sm:text-sm font-bold text-slate-800 mb-1">
                  1. 정의역 <span className="mono text-blue-600">X</span> (입력 집합)
                </label>
                <input
                  id="realLifeDomainX"
                  type="text"
                  value={state.realLifeDomainX || ''}
                  onChange={(e) =>
                    onUpdate((prev) => ({
                      ...prev,
                      realLifeDomainX: e.target.value,
                      bridge: `[실생활 함수] 정의역(${e.target.value}) → 공역(${prev.realLifeCodomainY || ''}): ${prev.realLifeRule || ''}`,
                    }))
                  }
                  placeholder="예: 편의점의 모든 상품 집합 X"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white px-3.5 py-2.5 text-sm text-slate-900"
                />
              </div>

              <div>
                <label htmlFor="realLifeCodomainY" className="block text-xs sm:text-sm font-bold text-slate-800 mb-1">
                  2. 공역 <span className="mono text-blue-600">Y</span> (출력 후보 집합)
                </label>
                <input
                  id="realLifeCodomainY"
                  type="text"
                  value={state.realLifeCodomainY || ''}
                  onChange={(e) =>
                    onUpdate((prev) => ({
                      ...prev,
                      realLifeCodomainY: e.target.value,
                      bridge: `[실생활 함수] 정의역(${prev.realLifeDomainX || ''}) → 공역(${e.target.value}): ${prev.realLifeRule || ''}`,
                    }))
                  }
                  placeholder="예: 자연수 전체의 집합 Y (가격 원)"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white px-3.5 py-2.5 text-sm text-slate-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="realLifeRule" className="block text-xs sm:text-sm font-bold text-slate-800 mb-1">
                3. 대응 규칙 <span className="mono text-blue-600">x → f(x)</span> (5자 이상)
              </label>
              <input
                id="realLifeRule"
                type="text"
                value={state.realLifeRule || ''}
                onChange={(e) =>
                  onUpdate((prev) => ({
                    ...prev,
                    realLifeRule: e.target.value,
                    bridge: `[실생활 함수] 정의역(${prev.realLifeDomainX || ''}) → 공역(${prev.realLifeCodomainY || ''}): ${e.target.value}`,
                  }))
                }
                placeholder="예: 각 상품 x에 대하여 그 상품의 판매 가격 f(x)원을 대응시킨다."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white px-3.5 py-2.5 text-sm text-slate-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                <label htmlFor="realLifeWhyFunc" className="block text-xs sm:text-sm font-bold text-slate-800">
                  4. 이 실생활 대응이 함수인 이유 (12자 이상 · ‘각 원소’, ‘하나씩’ 개념 포함 권장)
                </label>
                <CharCountBadge current={(state.realLifeWhyFunc || '').trim().length} min={12} />
              </div>
              <textarea
                id="realLifeWhyFunc"
                rows={3}
                value={state.realLifeWhyFunc || ''}
                onChange={(e) =>
                  onUpdate((prev) => ({
                    ...prev,
                    realLifeWhyFunc: e.target.value,
                  }))
                }
                placeholder="정의역 X의 모든 원소에 대하여 빠짐없이 대응하는 Y의 원소가 오직 하나씩만 결정되기 때문이다."
                className={`w-full rounded-xl border bg-slate-50/60 focus:bg-white p-3.5 text-sm text-slate-900 ${getCharCountBorderClass(
                  (state.realLifeWhyFunc || '').trim().length,
                  12
                )}`}
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                <label htmlFor="l1reflection" className="block text-xs sm:text-sm font-bold text-slate-800">
                  5. 1차시 성찰 · 대응으로서의 함수와 함수의 그래프를 배우며 새롭게 알게 된 점 (15자 이상)
                </label>
                <CharCountBadge current={state.reflection.trim().length} min={15} />
              </div>
              <textarea
                id="l1reflection"
                rows={3}
                value={state.reflection}
                onChange={(e) => onUpdate((prev) => ({ ...prev, reflection: e.target.value }))}
                placeholder="함수는 수식뿐만 아니라 두 집합 X, Y 사이의 대응으로 정의되며, 좌표평면에서 직선 x=a와 오직 한 점에서 만난다는 성질을 알게 되었다."
                className={`w-full rounded-xl border bg-slate-50/60 focus:bg-white p-3.5 text-sm text-slate-900 ${getCharCountBorderClass(
                  state.reflection.trim().length,
                  15
                )}`}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5">
            <h3 className="text-lg font-extrabold text-slate-900">
              01차시 (함수의 뜻과 그래프) 탐구 기록 완료 안내
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              대응으로서의 함수 도입, 정의역·공역·치역, 서로 같은 함수, 좌표평면 그래프 그리기, 그리고 실생활 함수 찾기 도전 활동까지 모두 안전하게 저장됩니다.
            </p>
          </div>
        </div>
      )}

      {/* Bottom Step Navigation */}
      <div className="flex items-center justify-between gap-3 pt-5 border-t border-slate-100 flex-wrap">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => onStepChange(Math.max(0, step - 1))}
          className="min-h-[44px] rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap"
        >
          ← 이전 단계
        </button>

        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-extrabold ${
              completion[step] ? 'text-emerald-700' : 'text-amber-700'
            }`}
          >
            {completion[step] ? '✓ 현재 단계 작성 조건 충족' : '현재 단계 탐구 진행 중'}
          </span>
          <button
            type="button"
            disabled={step === 4}
            onClick={() => onStepChange(Math.min(4, step + 1))}
            className="min-h-[44px] rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-40 whitespace-nowrap"
          >
            다음 단계 →
          </button>
        </div>
      </div>
    </div>
  );
};
