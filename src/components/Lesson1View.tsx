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
  validateL1AiMission,
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
  LineChart,
  TrendingUp,
  Bot,
  Cpu,
  Wrench,
  Download,
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
  onGoToLesson2,
  onRequestConfirm,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('대한민국');
  const [feedback, setFeedback] = useState<Record<string, { text: string; type: 'good' | 'warn' }>>({});
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});
  const [domainExplorerX, setDomainExplorerX] = useState<number>(1);
  const [verticalLineA, setVerticalLineA] = useState<number>(0.5);
  const [selectedRealLifeIdea, setSelectedRealLifeIdea] = useState<(typeof REAL_LIFE_TEMPLATES)[number] | null>(null);
  const [showProb2Graph1Hint, setShowProb2Graph1Hint] = useState<boolean>(true);
  const [showProb2Graph2Hint, setShowProb2Graph2Hint] = useState<boolean>(true);

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

  const selectRealLifeIdea = (tpl: (typeof REAL_LIFE_TEMPLATES)[number]) => {
    setSelectedRealLifeIdea(tpl);
    showNotice(
      'realLifeDesign',
      `‘${tpl.label}’ 아이디어 탐구 가이드를 열었습니다. 아래 가이드를 읽어보고 학습자 본인의 생각과 표현으로 직접 적어보세요!`,
      'good'
    );
  };

  // --- Step 5 Handlers (도전!! 실생활 함수 - AI 얼굴 인식) ---
  const handleVerifyAiMission1 = () => {
    const res = validateL1AiMission(state);
    if (!res.ok) {
      showNotice('aiMission1', res.message, res.type);
      return;
    }
    onUpdate((prev) => ({ ...prev, aiCheck1: true }));
    showNotice('aiMission1', res.message, 'good');
  };

  const handleRepairMachineB = () => {
    if (!state.aiFixB) {
      showNotice(
        'aiRepairB',
        '기계 B의 사진 ②에 대응시킬 이름 하나(지민, 유나, 민수 중 택 1)를 선택해 주세요.',
        'warn'
      );
      return;
    }
    onUpdate((prev) => ({ ...prev, aiFixBVerified: true }));
    showNotice(
      'aiRepairB',
      `기계 B 수리 성공! 사진 ②의 출력이 [${state.aiFixB}] 1개로 결정되었습니다. 이제 기계 B는 함수의 정의를 완벽하게 만족합니다. 🔧✨`,
      'good'
    );
  };

  const handleRepairMachineC = () => {
    if (!state.aiFixC) {
      showNotice(
        'aiRepairC',
        '기계 C의 사진 ③에 대응시킬 이름 하나(지민, 유나, 민수 중 택 1)를 선택해 주세요.',
        'warn'
      );
      return;
    }
    onUpdate((prev) => ({ ...prev, aiFixCVerified: true }));
    showNotice(
      'aiRepairC',
      `기계 C 수리 성공! 사진 ③에 [${state.aiFixC}]라는 출력이 연결되었습니다. 이제 정의역의 모든 사진에 빠짐없이 출력이 하나씩 존재하므로 기계 C도 함수가 되었습니다. 🔧✨`,
      'good'
    );
  };

  const handleVerifyAiReflection = () => {
    const refText = (state.aiReflection || '').trim();
    if (refText.length < 5) {
      showNotice(
        'aiReflection',
        '두 장의 사진이 같은 사람의 이름으로 출력되어도 함수가 될 수 있는지 자신의 생각을 적어 주세요.',
        'warn'
      );
      return;
    }
    onUpdate((prev) => ({ ...prev, aiReflectionChecked: true }));
    showNotice(
      'aiReflection',
      '문항 3 개념 확인 완료! 서로 다른 두 사진에 같은 이름이 대응하는 다대일 대응도 함수입니다. 중요한 것은 각각의 입력에 출력이 오직 하나씩 정해지는 것입니다.',
      'good'
    );
  };

  const handleDownloadAiRecord = () => {
    const payload = {
      activity: 'AI 얼굴 인식은 함수일까? (창의 탐구 ①)',
      studentState: {
        aiA: state.aiA,
        aiB: state.aiB,
        aiC: state.aiC,
        aiExplain: state.aiExplain,
        check1: state.aiCheck1,
        fixB: state.aiFixB,
        fixBVerified: state.aiFixBVerified,
        fixC: state.aiFixC,
        fixCVerified: state.aiFixCVerified,
        aiReflection: state.aiReflection,
      },
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI_얼굴인식_학습기록.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  // --- Graph Hint Renderers for Problem 2 ---
  const renderProb2Graph1 = () => {
    const sizeX = 320;
    const sizeY = 220;
    const centerX = 160;
    const centerY = 110;
    const xUnit = 28;
    const yUnit = 16;
    const toX = (x: number) => centerX + x * xUnit;
    const toY = (y: number) => centerY - y * yUnit;

    const curX = domainExplorerX;
    const curY = 2 * curX + 1;

    const xTicks = [-4, -3, -2, -1, 1, 2, 3, 4];
    const yTicks = [-5, -3, -1, 1, 3, 5];

    return (
      <div className="flex flex-col items-center">
        <svg
          viewBox={`0 0 ${sizeX} ${sizeY}`}
          className="w-full max-w-[320px] h-auto rounded-xl border border-blue-200 bg-white shadow-xs select-none"
          role="img"
          aria-label="일차함수 y = 2x + 1 그래프 힌트"
        >
          {/* Grid lines */}
          {xTicks.map((xt) => (
            <line
              key={`grid-x-${xt}`}
              x1={toX(xt)}
              y1={toY(6)}
              x2={toX(xt)}
              y2={toY(-6)}
              stroke="#f1f5f9"
              strokeWidth={1}
            />
          ))}
          {yTicks.map((yt) => (
            <line
              key={`grid-y-${yt}`}
              x1={toX(-4.5)}
              y1={toY(yt)}
              x2={toX(4.5)}
              y2={toY(yt)}
              stroke="#f1f5f9"
              strokeWidth={1}
            />
          ))}

          {/* Domain highlight on X axis */}
          <line
            x1={toX(-4.2)}
            y1={centerY}
            x2={toX(4.2)}
            y2={centerY}
            stroke="#93c5fd"
            strokeWidth={6}
            strokeOpacity={0.6}
          />
          {/* Range highlight on Y axis */}
          <line
            x1={centerX}
            y1={toY(-5.8)}
            x2={centerX}
            y2={toY(5.8)}
            stroke="#86efac"
            strokeWidth={6}
            strokeOpacity={0.6}
          />

          {/* Coordinate axes */}
          <line x1={toX(-4.5)} y1={centerY} x2={toX(4.5)} y2={centerY} stroke="#334155" strokeWidth={1.5} />
          <line x1={centerX} y1={toY(-6)} x2={centerX} y2={toY(6)} stroke="#334155" strokeWidth={1.5} />

          {/* Arrowheads */}
          <polygon points={`${toX(4.5)},${centerY} ${toX(4.5)-6},${centerY-3} ${toX(4.5)-6},${centerY+3}`} fill="#334155" />
          <polygon points={`${centerX},${toY(6)} ${centerX-3},${toY(6)+6} ${centerX+3},${toY(6)+6}`} fill="#334155" />

          {/* Axis labels */}
          <text x={toX(4.5) - 4} y={centerY + 14} className="fill-slate-800 text-[10px] font-bold italic">x</text>
          <text x={centerX + 6} y={toY(6) + 10} className="fill-slate-800 text-[10px] font-bold italic">y</text>
          <text x={centerX - 8} y={centerY + 12} className="fill-slate-600 text-[9px] font-semibold">O</text>

          {/* Ticks */}
          {xTicks.map((xt) => (
            <text key={`tx-${xt}`} x={toX(xt)} y={centerY + 12} textAnchor="middle" className="fill-slate-400 text-[9px] mono">
              {xt}
            </text>
          ))}
          {yTicks.map((yt) => (
            <text key={`ty-${yt}`} x={centerX - 6} y={toY(yt) + 3} textAnchor="end" className="fill-slate-400 text-[9px] mono">
              {yt}
            </text>
          ))}

          {/* Line y = 2x + 1 */}
          <line
            x1={toX(-3.5)}
            y1={toY(2 * -3.5 + 1)}
            x2={toX(2.5)}
            y2={toY(2 * 2.5 + 1)}
            stroke="#2563eb"
            strokeWidth={2.5}
          />

          {/* Lattice points */}
          {[
            { x: -1, y: -1 },
            { x: 0, y: 1 },
            { x: 1, y: 3 },
            { x: 2, y: 5 },
          ].map((pt) => (
            <g key={`pt-${pt.x}-${pt.y}`}>
              <circle cx={toX(pt.x)} cy={toY(pt.y)} r={3} fill="#1d4ed8" />
              <text x={toX(pt.x) + 4} y={toY(pt.y) - 4} className="fill-blue-900 text-[9px] font-bold mono">
                ({pt.x},{pt.y})
              </text>
            </g>
          ))}

          {/* Dynamic point from domain slider */}
          {curX >= -3.5 && curX <= 2.5 && (
            <g>
              <line x1={toX(curX)} y1={centerY} x2={toX(curX)} y2={toY(curY)} stroke="#64748b" strokeDasharray="2 2" strokeWidth={1} />
              <line x1={centerX} y1={toY(curY)} x2={toX(curX)} y2={toY(curY)} stroke="#64748b" strokeDasharray="2 2" strokeWidth={1} />
              <circle cx={toX(curX)} cy={toY(curY)} r={5} fill="#ef4444" stroke="#ffffff" strokeWidth={2} />
              <rect x={toX(curX) + 6} y={toY(curY) - 16} width={58} height={16} rx={4} fill="#1e293b" fillOpacity={0.85} />
              <text x={toX(curX) + 35} y={toY(curY) - 5} textAnchor="middle" className="fill-white text-[9px] font-bold mono">
                ({curX}, {curY})
              </text>
            </g>
          )}
        </svg>
        <div className="mt-1.5 flex items-center justify-between w-full max-w-[320px] text-[11px] text-slate-600 px-1">
          <span className="flex items-center gap-1 font-semibold text-blue-700">
            <span className="inline-block w-2.5 h-1.5 bg-blue-300 rounded-sm"></span> 정의역: 실수 전체
          </span>
          <span className="flex items-center gap-1 font-semibold text-emerald-700">
            <span className="inline-block w-2.5 h-1.5 bg-emerald-300 rounded-sm"></span> 치역: 실수 전체
          </span>
        </div>
      </div>
    );
  };

  const renderProb2Graph2 = () => {
    const sizeX = 320;
    const sizeY = 220;
    const centerX = 160;
    const centerY = 80;
    const xUnit = 28;
    const yUnit = 20;
    const toX = (x: number) => centerX + x * xUnit;
    const toY = (y: number) => centerY - y * yUnit;

    const curX = domainExplorerX;
    const curY = -(curX * curX) + 3;

    const xTicks = [-4, -3, -2, -1, 1, 2, 3, 4];
    const yTicks = [-5, -3, -1, 1, 3];

    // Parabola points from -3.0 to 3.0
    const pathD = Array.from({ length: 61 }, (_, i) => {
      const x = -3.0 + i * 0.1;
      const y = -(x * x) + 3;
      return `${i === 0 ? 'M' : 'L'} ${toX(x)} ${toY(y)}`;
    }).join(' ');

    return (
      <div className="flex flex-col items-center">
        <svg
          viewBox={`0 0 ${sizeX} ${sizeY}`}
          className="w-full max-w-[320px] h-auto rounded-xl border border-indigo-200 bg-white shadow-xs select-none"
          role="img"
          aria-label="이차함수 y = -x² + 3 그래프 힌트"
        >
          {/* Grid lines */}
          {xTicks.map((xt) => (
            <line
              key={`grid-x-${xt}`}
              x1={toX(xt)}
              y1={toY(4)}
              x2={toX(xt)}
              y2={toY(-6)}
              stroke="#f1f5f9"
              strokeWidth={1}
            />
          ))}
          {yTicks.map((yt) => (
            <line
              key={`grid-y-${yt}`}
              x1={toX(-4.5)}
              y1={toY(yt)}
              x2={toX(4.5)}
              y2={toY(yt)}
              stroke="#f1f5f9"
              strokeWidth={1}
            />
          ))}

          {/* Range highlight on Y axis: y <= 3 */}
          <line
            x1={centerX}
            y1={toY(3)}
            x2={centerX}
            y2={toY(-6)}
            stroke="#86efac"
            strokeWidth={6}
            strokeOpacity={0.7}
          />
          {/* Maximum horizontal dashed line at y = 3 */}
          <line
            x1={toX(-4.2)}
            y1={toY(3)}
            x2={toX(4.2)}
            y2={toY(3)}
            stroke="#f59e0b"
            strokeWidth={1.5}
            strokeDasharray="3 3"
          />
          <text x={toX(3.5)} y={toY(3) - 4} textAnchor="end" className="fill-amber-700 text-[9px] font-extrabold mono">
            최댓값 y = 3
          </text>

          {/* Coordinate axes */}
          <line x1={toX(-4.5)} y1={centerY} x2={toX(4.5)} y2={centerY} stroke="#334155" strokeWidth={1.5} />
          <line x1={centerX} y1={toY(-6)} x2={centerX} y2={toY(4)} stroke="#334155" strokeWidth={1.5} />

          {/* Arrowheads */}
          <polygon points={`${toX(4.5)},${centerY} ${toX(4.5)-6},${centerY-3} ${toX(4.5)-6},${centerY+3}`} fill="#334155" />
          <polygon points={`${centerX},${toY(4)} ${centerX-3},${toY(4)+6} ${centerX+3},${toY(4)+6}`} fill="#334155" />

          {/* Axis labels */}
          <text x={toX(4.5) - 4} y={centerY + 14} className="fill-slate-800 text-[10px] font-bold italic">x</text>
          <text x={centerX + 6} y={toY(4) + 10} className="fill-slate-800 text-[10px] font-bold italic">y</text>
          <text x={centerX - 8} y={centerY + 12} className="fill-slate-600 text-[9px] font-semibold">O</text>

          {/* Ticks */}
          {xTicks.map((xt) => (
            <text key={`tx-${xt}`} x={toX(xt)} y={centerY + 12} textAnchor="middle" className="fill-slate-400 text-[9px] mono">
              {xt}
            </text>
          ))}
          {yTicks.map((yt) => (
            <text key={`ty-${yt}`} x={centerX - 6} y={toY(yt) + 3} textAnchor="end" className="fill-slate-400 text-[9px] mono">
              {yt}
            </text>
          ))}

          {/* Parabola curve */}
          <path d={pathD} fill="none" stroke="#6366f1" strokeWidth={2.5} />

          {/* Vertex point (0, 3) */}
          <circle cx={toX(0)} cy={toY(3)} r={5} fill="#f59e0b" stroke="#ffffff" strokeWidth={2} />
          <text x={toX(0) + 7} y={toY(3) - 2} className="fill-amber-900 text-[10px] font-extrabold mono">
            꼭짓점 (0, 3)
          </text>

          {/* Dynamic point from domain slider */}
          {curX >= -2.8 && curX <= 2.8 && (
            <g>
              <line x1={toX(curX)} y1={centerY} x2={toX(curX)} y2={toY(curY)} stroke="#64748b" strokeDasharray="2 2" strokeWidth={1} />
              <line x1={centerX} y1={toY(curY)} x2={toX(curX)} y2={toY(curY)} stroke="#64748b" strokeDasharray="2 2" strokeWidth={1} />
              <circle cx={toX(curX)} cy={toY(curY)} r={5} fill="#ef4444" stroke="#ffffff" strokeWidth={2} />
              <rect x={toX(curX) + 6} y={toY(curY) - 16} width={58} height={16} rx={4} fill="#1e293b" fillOpacity={0.85} />
              <text x={toX(curX) + 35} y={toY(curY) - 5} textAnchor="middle" className="fill-white text-[9px] font-bold mono">
                ({curX}, {curY})
              </text>
            </g>
          )}
        </svg>
        <div className="mt-1.5 flex items-center justify-between w-full max-w-[320px] text-[11px] text-slate-600 px-1">
          <span className="flex items-center gap-1 font-semibold text-blue-700">
            정의역: 실수 전체
          </span>
          <span className="flex items-center gap-1 font-bold text-emerald-700">
            <span className="inline-block w-2.5 h-1.5 bg-emerald-400 rounded-sm"></span> 치역: {'{y | y ≤ 3인 실수}'}
          </span>
        </div>
      </div>
    );
  };

  // --- Graph Simulation Renderers for Problem 5 (수직선 판정법) ---
  const renderProb5Sim1 = (a: number) => {
    const size = 220;
    const center = 110;
    const unit = 26;
    const toX = (x: number) => center + x * unit;
    const toY = (y: number) => center - y * unit;

    const yInt = -a + 1;
    const inView = yInt >= -3.5 && yInt <= 3.5 && a >= -3.5 && a <= 3.5;

    return (
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[240px] h-auto rounded-xl border border-slate-200 bg-white shadow-xs select-none cursor-crosshair"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const mathX = Number(((clickX - center * (rect.width / size)) / (unit * (rect.width / size))).toFixed(1));
          setVerticalLineA(Math.max(-1.5, Math.min(4, mathX)));
        }}
        role="img"
        aria-label="문제 5-(1) 직선 그래프 시뮬레이션"
      >
        {[-3, -2, -1, 1, 2, 3].map((t) => (
          <React.Fragment key={t}>
            <line x1={toX(t)} y1={10} x2={toX(t)} y2={size - 10} stroke="#f1f5f9" strokeWidth={1} />
            <line x1={10} y1={toY(t)} x2={size - 10} y2={toY(t)} stroke="#f1f5f9" strokeWidth={1} />
          </React.Fragment>
        ))}
        <line x1={10} y1={center} x2={size - 10} y2={center} stroke="#475569" strokeWidth={1.5} />
        <line x1={center} y1={size - 10} x2={center} y2={10} stroke="#475569" strokeWidth={1.5} />
        <text x={size - 16} y={center + 12} className="fill-slate-700 text-[10px] font-bold italic">x</text>
        <text x={center + 6} y={16} className="fill-slate-700 text-[10px] font-bold italic">y</text>
        <text x={center - 8} y={center + 12} className="fill-slate-500 text-[9px] font-semibold">O</text>

        {/* Line y = -x + 1 */}
        <line
          x1={toX(-3.2)}
          y1={toY(4.2)}
          x2={toX(4.2)}
          y2={toY(-3.2)}
          stroke="#2563eb"
          strokeWidth={2.5}
        />
        <circle cx={toX(0)} cy={toY(1)} r={3} fill="#1d4ed8" />
        <text x={toX(0) + 4} y={toY(1) - 4} className="fill-slate-800 text-[9px] font-bold mono">(0,1)</text>
        <circle cx={toX(1)} cy={toY(0)} r={3} fill="#1d4ed8" />
        <text x={toX(1) + 4} y={toY(0) + 12} className="fill-slate-800 text-[9px] font-bold mono">(1,0)</text>

        {/* Vertical line x = a */}
        <line
          x1={toX(a)}
          y1={10}
          x2={toX(a)}
          y2={size - 10}
          stroke="#ef4444"
          strokeWidth={2}
          strokeDasharray="4 2"
        />
        <text x={toX(a) + 3} y={22} className="fill-rose-700 text-[9px] font-extrabold mono">
          x = {a}
        </text>

        {/* Intersection */}
        {inView && (
          <g>
            <circle cx={toX(a)} cy={toY(yInt)} r={6} fill="#ef4444" stroke="#ffffff" strokeWidth={2} />
            <circle cx={toX(a)} cy={toY(yInt)} r={10} fill="none" stroke="#ef4444" strokeWidth={1} strokeOpacity={0.6} />
            <text x={toX(a) + 8} y={toY(yInt) - 6} className="fill-rose-900 text-[9px] font-bold mono">
              교점 ({a.toFixed(1)}, {yInt.toFixed(1)})
            </text>
          </g>
        )}
      </svg>
    );
  };

  const renderProb5Sim2 = (a: number) => {
    const size = 220;
    const center = 30;
    const bottomY = 190;
    const unit = 32;
    const toX = (x: number) => center + x * unit;
    const toY = (y: number) => bottomY - y * unit;

    const points = [
      { x: 0, y: 2 },
      { x: 1, y: 3 },
      { x: 2, y: 4 },
      { x: 3, y: 3 },
      { x: 3, y: 1 },
      { x: 4, y: 2 },
    ];

    const hitPoints = points.filter((p) => Math.abs(p.x - a) < 0.25);

    return (
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[240px] h-auto rounded-xl border border-slate-200 bg-white shadow-xs select-none cursor-crosshair"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const mathX = Number(((clickX - center * (rect.width / size)) / (unit * (rect.width / size))).toFixed(1));
          setVerticalLineA(Math.max(-0.5, Math.min(4.5, mathX)));
        }}
        role="img"
        aria-label="문제 5-(2) 점 그래프 시뮬레이션"
      >
        {[0, 1, 2, 3, 4].map((t) => (
          <React.Fragment key={t}>
            <line x1={toX(t)} y1={10} x2={toX(t)} y2={bottomY + 10} stroke="#f1f5f9" strokeWidth={1} />
            <line x1={center - 10} y1={toY(t)} x2={size - 10} y2={toY(t)} stroke="#f1f5f9" strokeWidth={1} />
            {t > 0 && (
              <>
                <text x={toX(t)} y={bottomY + 14} textAnchor="middle" className="fill-slate-400 text-[9px] mono">{t}</text>
                <text x={center - 6} y={toY(t) + 3} textAnchor="end" className="fill-slate-400 text-[9px] mono">{t}</text>
              </>
            )}
          </React.Fragment>
        ))}
        <line x1={center - 10} y1={bottomY} x2={size - 10} y2={bottomY} stroke="#475569" strokeWidth={1.5} />
        <line x1={center} y1={bottomY + 10} x2={center} y2={10} stroke="#475569" strokeWidth={1.5} />
        <text x={size - 14} y={bottomY + 14} className="fill-slate-700 text-[10px] font-bold italic">x</text>
        <text x={center + 6} y={16} className="fill-slate-700 text-[10px] font-bold italic">y</text>
        <text x={center - 8} y={bottomY + 12} className="fill-slate-500 text-[9px] font-semibold">O</text>

        {points.map((p, idx) => {
          const isHit = hitPoints.some((hp) => hp.x === p.x && hp.y === p.y);
          return (
            <g key={`prob5-pt-${idx}`}>
              <circle
                cx={toX(p.x)}
                cy={toY(p.y)}
                r={isHit ? 6 : 4}
                fill={isHit ? (hitPoints.length > 1 ? '#ef4444' : '#10b981') : '#0f172a'}
                stroke="#ffffff"
                strokeWidth={isHit ? 2 : 1}
              />
              <text
                x={toX(p.x) + 5}
                y={toY(p.y) - 5}
                className={`text-[9px] font-bold mono ${
                  isHit
                    ? hitPoints.length > 1
                      ? 'fill-rose-700'
                      : 'fill-emerald-700'
                    : 'fill-slate-600'
                }`}
              >
                ({p.x},{p.y})
              </text>
            </g>
          );
        })}

        {/* Vertical line x = a */}
        <line
          x1={toX(a)}
          y1={10}
          x2={toX(a)}
          y2={bottomY + 10}
          stroke="#ef4444"
          strokeWidth={2}
          strokeDasharray="4 2"
        />
        <text x={toX(a) + 3} y={22} className="fill-rose-700 text-[9px] font-extrabold mono">
          x = {a}
        </text>

        {/* If hit count > 1, draw bracket */}
        {hitPoints.length > 1 && (
          <line
            x1={toX(3)}
            y1={toY(3)}
            x2={toX(3)}
            y2={toY(1)}
            stroke="#ef4444"
            strokeWidth={3}
            strokeDasharray="2 2"
          />
        )}
      </svg>
    );
  };

  const renderProb5Sim3 = (a: number) => {
    const size = 220;
    const center = 110;
    const unit = 50;
    const toX = (x: number) => center + x * unit;
    const toY = (y: number) => center - y * unit;

    const hasHits = a > -1 && a < 1;
    const isTangent = Math.abs(a - 1) < 0.05 || Math.abs(a - (-1)) < 0.05;
    const y1 = hasHits ? Math.sqrt(Math.max(0, 1 - a * a)) : 0;
    const y2 = -y1;

    return (
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[240px] h-auto rounded-xl border border-slate-200 bg-white shadow-xs select-none cursor-crosshair"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const mathX = Number(((clickX - center * (rect.width / size)) / (unit * (rect.width / size))).toFixed(1));
          setVerticalLineA(Math.max(-1.5, Math.min(1.8, mathX)));
        }}
        role="img"
        aria-label="문제 5-(3) 원 그래프 시뮬레이션"
      >
        {[-1, 1].map((t) => (
          <React.Fragment key={t}>
            <line x1={toX(t)} y1={10} x2={toX(t)} y2={size - 10} stroke="#f1f5f9" strokeWidth={1} />
            <line x1={10} y1={toY(t)} x2={size - 10} y2={toY(t)} stroke="#f1f5f9" strokeWidth={1} />
            <text x={toX(t)} y={center + 14} textAnchor="middle" className="fill-slate-400 text-[9px] mono">{t}</text>
            <text x={center - 6} y={toY(t) + 3} textAnchor="end" className="fill-slate-400 text-[9px] mono">{t}</text>
          </React.Fragment>
        ))}
        <line x1={10} y1={center} x2={size - 10} y2={center} stroke="#475569" strokeWidth={1.5} />
        <line x1={center} y1={size - 10} x2={center} y2={10} stroke="#475569" strokeWidth={1.5} />
        <text x={size - 14} y={center + 12} className="fill-slate-700 text-[10px] font-bold italic">x</text>
        <text x={center + 6} y={16} className="fill-slate-700 text-[10px] font-bold italic">y</text>
        <text x={center - 8} y={center + 12} className="fill-slate-500 text-[9px] font-semibold">O</text>

        {/* Circle */}
        <circle cx={center} cy={center} r={unit} fill="none" stroke="#6366f1" strokeWidth={2.5} />

        {/* Vertical line x = a */}
        <line
          x1={toX(a)}
          y1={10}
          x2={toX(a)}
          y2={size - 10}
          stroke="#ef4444"
          strokeWidth={2}
          strokeDasharray="4 2"
        />
        <text x={toX(a) + 3} y={22} className="fill-rose-700 text-[9px] font-extrabold mono">
          x = {a}
        </text>

        {/* Intersection points */}
        {hasHits && (
          <g>
            <line x1={toX(a)} y1={toY(y1)} x2={toX(a)} y2={toY(y2)} stroke="#ef4444" strokeWidth={2.5} strokeDasharray="2 2" />
            <circle cx={toX(a)} cy={toY(y1)} r={5} fill="#ef4444" stroke="#ffffff" strokeWidth={2} />
            <circle cx={toX(a)} cy={toY(y2)} r={5} fill="#ef4444" stroke="#ffffff" strokeWidth={2} />
            <text x={toX(a) + 6} y={toY(y1) - 4} className="fill-rose-800 text-[8px] font-bold mono">
              y={y1.toFixed(2)}
            </text>
            <text x={toX(a) + 6} y={toY(y2) + 10} className="fill-rose-800 text-[8px] font-bold mono">
              y={y2.toFixed(2)}
            </text>
          </g>
        )}

        {isTangent && (
          <circle cx={toX(a > 0 ? 1 : -1)} cy={toY(0)} r={5} fill="#f59e0b" stroke="#ffffff" strokeWidth={2} />
        )}
      </svg>
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
              01차시 · 함수의 뜻과 그래프 · 1 / 6단계
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
                src={getTextbookImageSrc('image_0c986aed.png')}
                onError={(e) => handleTextbookImageError(e, 'image_0c986aed.png')}
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
                src={getTextbookImageSrc('image_27581b60.png')}
                onError={(e) => handleTextbookImageError(e, 'image_27581b60.png')}
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
                src={getTextbookImageSrc('image_e014c6f3.png')}
                onError={(e) => handleTextbookImageError(e, 'image_e014c6f3.png')}
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
                  <textarea
                    id="prob1_1Reason"
                    rows={3}
                    value={state.prob1_1Reason || ''}
                    onChange={(e) =>
                      onUpdate((prev) => ({ ...prev, prob1_1Reason: e.target.value, prob1Verified: false }))
                    }
                    placeholder="예: 집합 X의 원소 3에 대응하는 집합 Y의 원소가 없기 때문이다."
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs sm:text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="mt-1.5 flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => toggleHint('prob1_1')}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800"
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                      {showHints.prob1_1 ? '이유 서술 힌트 접기' : '💡 (1)번 이유 서술 힌트 보기'}
                    </button>
                    {showHints.prob1_1 && (
                      <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-900 leading-relaxed">
                        <strong>서술 힌트:</strong> 집합 X의 원소 1, 2, 3, 4 중에서 화살표가 출발하지 않은 원소가 있는지 살펴보고, &ldquo;X의 원소 3에 대응하는 Y의 원소가 없다&rdquo;는 사실을 문장으로 서술해 보세요.
                      </div>
                    )}
                  </div>
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
                  <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-700">💡 집합 기호 입력 도움:</span>
                    {['{', '}', ',', '1', '2', '3', '4', 'a', 'b', 'c', 'd'].map((sym) => (
                      <span key={sym} className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 mono font-bold text-slate-800">
                        {sym}
                      </span>
                    ))}
                  </div>
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
                  <textarea
                    id="prob1_3Reason"
                    rows={3}
                    value={state.prob1_3Reason || ''}
                    onChange={(e) =>
                      onUpdate((prev) => ({ ...prev, prob1_3Reason: e.target.value, prob1Verified: false }))
                    }
                    placeholder="예: 집합 X의 원소 4에 대응하는 집합 Y의 원소가 b와 d로 2개이기 때문이다."
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs sm:text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="mt-1.5 flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => toggleHint('prob1_3')}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800"
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                      {showHints.prob1_3 ? '이유 서술 힌트 접기' : '💡 (3)번 이유 서술 힌트 보기'}
                    </button>
                    {showHints.prob1_3 && (
                      <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-900 leading-relaxed">
                        <strong>서술 힌트:</strong> 집합 X의 원소 4에서 화살표가 몇 개 나가는지 살펴보고, &ldquo;원소 4에 대응하는 Y의 원소가 b와 d로 2개이다&rdquo;는 사실을 적어보세요. (함수는 오직 하나씩만 대응해야 합니다!)
                      </div>
                    )}
                  </div>
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
              01차시 · 함수의 뜻과 그래프 · 2 / 6단계
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
              src={getTextbookImageSrc('image_d9cfc624.png')}
              onError={(e) => handleTextbookImageError(e, 'image_d9cfc624.png')}
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

            <div className="grid gap-6 md:grid-cols-2">
              {/* 문제 2-(1) */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-sm sm:text-base font-extrabold text-slate-900">
                    (1) 함수 <span className="mono text-blue-700">y = 2x + 1</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowProb2Graph1Hint((v) => !v)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100"
                  >
                    <LineChart className="h-3.5 w-3.5" />
                    {showProb2Graph1Hint ? '그래프 힌트 접기' : '📊 그래프 힌트 보기'}
                  </button>
                </div>

                {/* Graph Hint Widget for (1) */}
                {showProb2Graph1Hint && (
                  <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3 space-y-2">
                    <div className="text-xs font-bold text-blue-900 flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                      <span>좌표평면 그래프 분석 힌트 (직선)</span>
                    </div>
                    {renderProb2Graph1()}
                    <div className="text-[11px] text-slate-600 space-y-1 bg-white p-2.5 rounded-lg border border-blue-100 leading-relaxed">
                      <div>
                        • <strong>정의역:</strong> 분모가 0이 되거나 근호 안이 음수가 되는 제한이 없으므로 모든 실수 <MathText text="x" />에서 정의됩니다.
                      </div>
                      <div>
                        • <strong>치역:</strong> 기울기가 2인 직선은 위아래로 끝없이 뻗어나가므로 <MathText text="y" /> 역시 모든 실수 값을 가집니다.
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label htmlFor="prob2_1Domain" className="block text-xs font-bold text-slate-700 mb-1">
                      정의역 (집합 조건제시법 형식)
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
                      치역 (집합 조건제시법 형식)
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
                  <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-700">기호 도움:</span>
                    {['{', '}', '|', 'x', 'y', '실수', '는'].map((sym) => (
                      <span key={sym} className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 mono font-bold text-slate-800">
                        {sym}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 문제 2-(2) */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-sm sm:text-base font-extrabold text-slate-900">
                    (2) 함수 <span className="mono text-blue-700">y = -x² + 3</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowProb2Graph2Hint((v) => !v)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
                  >
                    <LineChart className="h-3.5 w-3.5" />
                    {showProb2Graph2Hint ? '그래프 힌트 접기' : '📊 그래프 힌트 보기'}
                  </button>
                </div>

                {/* Graph Hint Widget for (2) */}
                {showProb2Graph2Hint && (
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 space-y-2">
                    <div className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5 text-indigo-600" />
                      <span>좌표평면 그래프 분석 힌트 (포물선)</span>
                    </div>
                    {renderProb2Graph2()}
                    <div className="text-[11px] text-slate-600 space-y-1 bg-white p-2.5 rounded-lg border border-indigo-100 leading-relaxed">
                      <div>
                        • <strong>정의역:</strong> 모든 실수 <MathText text="x" />에 대해 <MathText text="-x^2 + 3" />을 계산할 수 있으므로 정의역은 실수 전체입니다.
                      </div>
                      <div>
                        • <strong>치역:</strong> 포물선 꼭짓점이 <MathText text="(0, 3)" />이고 위로 볼록하므로 <MathText text="y \le 3" />인 범위만 가집니다.
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label htmlFor="prob2_2Domain" className="block text-xs font-bold text-slate-700 mb-1">
                      정의역 (집합 조건제시법 형식)
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
                      치역 (집합 조건제시법 형식)
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
                  <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-700">기호 도움:</span>
                    {['{', '}', '|', 'x', 'y', '≤', '3', '인', '실수'].map((sym) => (
                      <span key={sym} className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 mono font-bold text-slate-800">
                        {sym}
                      </span>
                    ))}
                  </div>
                </div>
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
              01차시 · 함수의 뜻과 그래프 · 3 / 6단계
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
              src={getTextbookImageSrc('image_b125265d.png')}
              onError={(e) => handleTextbookImageError(e, 'image_b125265d.png')}
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
                  rows={4}
                  value={state.prob3Reason || ''}
                  onChange={(e) =>
                    onUpdate((prev) => ({ ...prev, prob3Reason: e.target.value, prob3Verified: false }))
                  }
                  placeholder="정의역 {-1, 0, 1}의 모든 원소에 대하여 f(-1)=g(-1)=2, f(0)=g(0)=0, f(1)=g(1)=2이므로 두 함수의 대응이 완전히 같아서 f = g이다."
                  className={`w-full rounded-xl border bg-white p-3.5 text-sm sm:text-base text-slate-900 ${getCharCountBorderClass(
                    (state.prob3Reason || '').trim().length,
                    10
                  )}`}
                />
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => toggleHint('prob3_hint')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800"
                  >
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    {showHints.prob3_hint ? '문제 3 탐구 힌트 접기' : '💡 문제 3 풀이 힌트 보기'}
                  </button>
                  {showHints.prob3_hint && (
                    <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50/90 p-3.5 text-xs sm:text-sm text-amber-900 space-y-1.5 leading-relaxed">
                      <div>
                        • <strong>표 채우기 힌트:</strong> <MathText text="x = 0" />일 때 <MathText text="f(0) = |2 \times 0| = 0" />, <MathText text="x = 1" />일 때 <MathText text="f(1) = |2 \times 1| = 2" />입니다. 마찬가지로 <MathText text="g(x) = 2x^2" />에도 대입해 보세요.
                      </div>
                      <div>
                        • <strong>서술 힌트:</strong> 두 함수가 서로 같으려면( <MathText text="f = g" />) 정의역의 모든 원소 <MathText text="x" />에 대해 함숫값이 일치해야 합니다. <MathText text="f(-1)=g(-1)=2" />, <MathText text="f(0)=g(0)=0" />, <MathText text="f(1)=g(1)=2" />임을 언급하여 서술해 보세요.
                      </div>
                    </div>
                  )}
                </div>
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
              01차시 · 함수의 뜻과 그래프 · 4 / 6단계
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
              src={getTextbookImageSrc('image_4e12a268.png')}
              onError={(e) => handleTextbookImageError(e, 'image_4e12a268.png')}
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

            {/* 수직선 x = a 3개 그래프 시뮬레이터 */}
            <div className="rounded-2xl border-2 border-blue-200 bg-white p-4 sm:p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-blue-600" />
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                    수직선 판정법 실시간 시뮬레이터 (x = a를 움직여 세 그래프의 교점을 비교하세요)
                  </h4>
                </div>
                <span className="mono text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  현재 수직선 a = {verticalLineA.toFixed(1)}
                </span>
              </div>

              {/* 3 Coordinated Simulation Graphs */}
              <div className="grid gap-4 md:grid-cols-3">
                {/* Simulation 1: 직선 */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 flex flex-col items-center space-y-2">
                  <div className="text-xs font-extrabold text-slate-900">
                    (1) 일차함수 <span className="mono text-blue-700">y = -x + 1</span>
                  </div>
                  {renderProb5Sim1(verticalLineA)}
                  <div className="w-full text-center py-1.5 px-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800">
                    ✓ 교점 1개 (어떤 a에서도 항상 1개 $\rightarrow$ 함수 O)
                  </div>
                </div>

                {/* Simulation 2: 점 그래프 */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 flex flex-col items-center space-y-2">
                  <div className="text-xs font-extrabold text-slate-900">
                    (2) 이산 점 그래프
                  </div>
                  {renderProb5Sim2(verticalLineA)}
                  <div className="w-full text-center py-1.5 px-2 rounded-lg text-[11px] font-bold transition-colors">
                    {Math.abs(verticalLineA - 3) < 0.25 ? (
                      <span className="text-rose-700 bg-rose-50 border border-rose-200 block py-0.5 rounded">
                        ⚠️ 교점 2개! (x=3에 1과 3 동시 대응 $\rightarrow$ 함수 X)
                      </span>
                    ) : [0, 1, 2, 4].some((n) => Math.abs(verticalLineA - n) < 0.25) ? (
                      <span className="text-blue-700 bg-blue-50 border border-blue-200 block py-0.5 rounded">
                        교점 1개 (x = {Math.round(verticalLineA)})
                      </span>
                    ) : (
                      <span className="text-slate-600 bg-slate-100 border border-slate-200 block py-0.5 rounded">
                        교점 0개 (a = 3으로 이동해 보세요)
                      </span>
                    )}
                  </div>
                </div>

                {/* Simulation 3: 원 그래프 */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 flex flex-col items-center space-y-2">
                  <div className="text-xs font-extrabold text-slate-900">
                    (3) 원 <span className="mono text-indigo-700">x² + y² = 1</span>
                  </div>
                  {renderProb5Sim3(verticalLineA)}
                  <div className="w-full text-center py-1.5 px-2 rounded-lg text-[11px] font-bold transition-colors">
                    {verticalLineA > -1 && verticalLineA < 1 ? (
                      <span className="text-rose-700 bg-rose-50 border border-rose-200 block py-0.5 rounded">
                        ⚠️ 교점 2개! (위·아래 2개 y값 대응 $\rightarrow$ 함수 X)
                      </span>
                    ) : Math.abs(verticalLineA - 1) < 0.05 || Math.abs(verticalLineA - (-1)) < 0.05 ? (
                      <span className="text-amber-700 bg-amber-50 border border-amber-200 block py-0.5 rounded">
                        접점 1개 (x = {verticalLineA > 0 ? '1' : '-1'})
                      </span>
                    ) : (
                      <span className="text-slate-600 bg-slate-100 border border-slate-200 block py-0.5 rounded">
                        교점 0개 (-1 &lt; a &lt; 1 구간으로 이동해 보세요)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Slider & Quick Buttons */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <label htmlFor="verticalLineSlider" className="text-xs font-bold text-slate-700">
                    수직선 <span className="mono text-blue-600">x = a</span> 위치 조절 (-1.5 ~ 4.5)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setVerticalLineA(0.5)}
                      className={`rounded-md border px-2 py-1 text-xs font-bold mono transition-colors ${
                        verticalLineA === 0.5 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      a = 0.5 (원 내부 2점)
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerticalLineA(1)}
                      className={`rounded-md border px-2 py-1 text-xs font-bold mono transition-colors ${
                        verticalLineA === 1 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      a = 1.0 (원 접점)
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerticalLineA(2)}
                      className={`rounded-md border px-2 py-1 text-xs font-bold mono transition-colors ${
                        verticalLineA === 2 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      a = 2.0 (점 그래프 1점)
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerticalLineA(3)}
                      className={`rounded-md border px-2 py-1 text-xs font-bold mono transition-colors ${
                        verticalLineA === 3 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      a = 3.0 (점 그래프 2점 중복)
                    </button>
                  </div>
                </div>
                <input
                  id="verticalLineSlider"
                  type="range"
                  min={-1.5}
                  max={4.5}
                  step={0.1}
                  value={verticalLineA}
                  onChange={(e) => setVerticalLineA(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500">
                  💡 각 그래프 영역을 직접 클릭해도 수직선 x = a가 해당 좌표로 이동합니다.
                </p>
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
                    ② (2)번이 함수의 그래프가 아닌 이유 (문장으로 서술)
                  </label>
                  <textarea
                    id="prob5_2Reason"
                    rows={3}
                    value={state.prob5_2Reason || ''}
                    onChange={(e) =>
                      onUpdate((prev) => ({ ...prev, prob5_2Reason: e.target.value, prob5Verified: false }))
                    }
                    placeholder="예: x = 3일 때 대응하는 y의 값이 1과 3으로 2개이기 때문에 오직 하나씩 대응해야 한다는 함수의 정의를 만족하지 않는다."
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs sm:text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="prob5_3Reason" className="block text-xs font-bold text-slate-700 mb-1">
                    ③ (3)번이 함수의 그래프가 아닌 이유 (문장으로 서술)
                  </label>
                  <textarea
                    id="prob5_3Reason"
                    rows={3}
                    value={state.prob5_3Reason || ''}
                    onChange={(e) =>
                      onUpdate((prev) => ({ ...prev, prob5_3Reason: e.target.value, prob5Verified: false }))
                    }
                    placeholder="예: -1 < a < 1인 수직선 x = a를 그었을 때 원과 두 점에서 만나므로 하나의 x값에 서로 다른 2개의 y값이 대응하여 함수가 아니다."
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs sm:text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                  onClick={() => toggleHint('prob5_hint')}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs sm:text-sm font-bold text-amber-800 hover:bg-amber-100"
                >
                  <HelpCircle className="h-4 w-4" />
                  {showHints.prob5_hint ? '문제 5 힌트 접기' : '💡 문제 5 풀이 힌트 보기'}
                </button>
              </div>

              {showHints.prob5_hint && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-xs sm:text-sm text-amber-900 space-y-1.5 leading-relaxed">
                  <div>
                    • <strong>(1)번 직선:</strong> 모든 실수 a에 대하여 수직선 x = a와 오직 한 점에서 만나므로 함수의 그래프입니다.
                  </div>
                  <div>
                    • <strong>(2)번 점 그래프:</strong> x = 3에서 직선 x = 3과 점 (3, 1), (3, 3)의 두 점에서 만나므로(y값이 2개 대응) 함수의 그래프가 아닙니다.
                  </div>
                  <div>
                    • <strong>(3)번 원:</strong> -1 &lt; a &lt; 1인 실수 a에 대하여 수직선 x = a와 위아래 두 점에서 만나므로 함수의 그래프가 아닙니다.
                  </div>
                </div>
              )}

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
              01차시 · 함수의 뜻과 그래프 · 5 / 6단계 (실생활 함수 모델링)
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              탐구 05 · 실생활에서 함수인 예 찾아보기 활동지
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

            {/* 추천 실생활 소재 아이디어 뱅크 버튼 */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
              <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>💡 실생활 함수 아이디어 뱅크 (클릭하면 주제별 탐구 힌트를 확인하여 스스로 작성할 수 있습니다):</span>
                {selectedRealLifeIdea && (
                  <button
                    type="button"
                    onClick={() => setSelectedRealLifeIdea(null)}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline"
                  >
                    힌트 닫기
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {REAL_LIFE_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.label}
                    type="button"
                    onClick={() => selectRealLifeIdea(tpl)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                      selectedRealLifeIdea?.label === tpl.label
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-600'
                        : 'border-blue-200 bg-white text-blue-700 hover:bg-blue-50'
                    }`}
                  >
                    💡 {tpl.label} 힌트 보기
                  </button>
                ))}
              </div>

              {/* Selected Idea Exploration Guide Card */}
              {selectedRealLifeIdea && (
                <div className="mt-3 rounded-xl border border-indigo-200 bg-white p-4 space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-extrabold text-indigo-950 flex items-center gap-1.5">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      ‘{selectedRealLifeIdea.label}’ 탐구 가이드
                    </span>
                    <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      스스로 작성 안내
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 space-y-1.5 leading-relaxed">
                    <p>
                      • <strong>주제 상황:</strong> {selectedRealLifeIdea.topic}
                    </p>
                    <p>
                      • <strong>정의역 X &amp; 공역 Y 생각하기:</strong> 어떤 대상을 입력 집합(X)으로 두고, 결과값은 어떤 수나 대상들의 집합(Y)으로 설정할지 아래 1, 2번에 적어보세요.
                    </p>
                    <p>
                      • <strong>대응 규칙 &amp; 함수 이유:</strong> 입력의 각 원소마다 빠짐없이 결과가 존재하는지, 한 원소에 두 개 이상의 가격이나 결과가 나오지 않고 ‘오직 하나씩’ 대응하는지를 3, 4번에 자신의 문장으로 서술해 보세요.
                    </p>
                  </div>
                </div>
              )}
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
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                <label htmlFor="realLifeRule" className="block text-xs sm:text-sm font-bold text-slate-800">
                  3. 대응 규칙 <span className="mono text-blue-600">x → f(x)</span> (문장 서술 · 5자 이상)
                </label>
                <CharCountBadge current={(state.realLifeRule || '').trim().length} min={5} />
              </div>
              <textarea
                id="realLifeRule"
                rows={2}
                value={state.realLifeRule || ''}
                onChange={(e) =>
                  onUpdate((prev) => ({
                    ...prev,
                    realLifeRule: e.target.value,
                    bridge: `[실생활 함수] 정의역(${prev.realLifeDomainX || ''}) → 공역(${prev.realLifeCodomainY || ''}): ${e.target.value}`,
                  }))
                }
                placeholder="예: 각 상품 x에 대하여 포스기(바코드)에 등록된 해당 상품 1개의 판매 가격 f(x)원을 대응시킨다."
                className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm sm:text-base text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
                rows={4}
                value={state.realLifeWhyFunc || ''}
                onChange={(e) =>
                  onUpdate((prev) => ({
                    ...prev,
                    realLifeWhyFunc: e.target.value,
                  }))
                }
                placeholder="정의역 X의 모든 원소(각 상품)에 대하여 가격이 빠짐없이 존재하고, 하나의 상품에 두 개의 가격이 동시에 찍히지 않고 오직 하나씩만 대응하기 때문이다."
                className={`w-full rounded-xl border bg-white p-3.5 text-sm sm:text-base text-slate-900 ${getCharCountBorderClass(
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
                rows={4}
                value={state.reflection}
                onChange={(e) => onUpdate((prev) => ({ ...prev, reflection: e.target.value }))}
                placeholder="함수는 수식뿐만 아니라 두 집합 X, Y 사이의 대응으로 정의되며, 좌표평면에서 직선 x=a와 오직 한 점에서 만난다는 수직선 판정법의 원리를 알게 되었다."
                className={`w-full rounded-xl border bg-white p-3.5 text-sm sm:text-base text-slate-900 ${getCharCountBorderClass(
                  state.reflection.trim().length,
                  15
                )}`}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                05단계 실생활 함수 모델링 작성 완료!
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-600">
                작성을 마치셨다면 다음 '06 도전!! 실생활 함수 (AI 얼굴 인식은 함수일까?)' 단계로 이동하여 AI 얼굴 인식 시스템을 함수 관점에서 수사해 보세요.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onStepChange(5)}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 shadow-xs flex items-center gap-2 whitespace-nowrap"
            >
              <span>06단계 도전 탐구로 이동</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 5: 도전!! 실생활 함수 — AI 얼굴 인식은 함수일까? (창의 탐구 ①)
         ===================================================================== */}
      {step === 5 && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-extrabold text-blue-800">
                <Cpu className="h-3.5 w-3.5 text-blue-600" />
                창의 융합 탐구 ① · AI 얼굴 인식
              </span>
              <span className="text-xs font-bold text-slate-500">
                01차시 · 함수의 뜻과 그래프 · 6 / 6단계 (최종 도전)
              </span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2 flex-wrap">
              <span>탐구 06 · 도전!! 실생활 함수 — AI 얼굴 인식은 함수일까?</span>
            </h2>
            <p className="mt-1 text-sm sm:text-base text-slate-600">
              인공지능(AI) 카메라에 얼굴 사진을 입력하면 인식된 <strong>이름 1개</strong>를 출력하도록 설계했습니다.
              사진의 집합을 <strong>정의역 X</strong>, 사람 이름의 집합을 <strong>공역 Y</strong>로 생각하고, 세 기계의 작동 결과를 수학적으로 판별해 봅시다.
            </p>
          </div>

          {/* 미션 1: AI가 얼굴을 알아본다면? (기계 A, B, C 비교) */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  미션 1 · AI 기계 A, B, C의 출력 판별하기
                </h3>
              </div>
              {state.aiCheck1 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  문항 1 판별 완료
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-600">
              세 대의 AI 기계에 각각 세 장의 사진(사진 ①, ②, ③)을 입력했을 때의 결과입니다.
              사진은 정의역의 원소, 사람 이름은 공역의 원소입니다.
            </p>

            {/* 3 Machines Visual Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 기계 A */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-blue-200/80 mb-3">
                    <span className="font-extrabold text-blue-900 text-sm sm:text-base">
                      기계 A · 한 번에 한 이름
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-200/70 text-blue-800 mono">
                      정상 출력
                    </span>
                  </div>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center justify-between bg-white/90 p-2 rounded-lg border border-blue-100 shadow-2xs">
                      <span className="font-semibold text-slate-700">사진 ① 🙎‍♂️</span>
                      <span className="text-blue-600 font-extrabold text-base">➜</span>
                      <span className="font-extrabold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded">지민</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/90 p-2 rounded-lg border border-blue-100 shadow-2xs">
                      <span className="font-semibold text-slate-700">사진 ② 👩</span>
                      <span className="text-blue-600 font-extrabold text-base">➜</span>
                      <span className="font-extrabold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded">유나</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/90 p-2 rounded-lg border border-blue-100 shadow-2xs">
                      <span className="font-semibold text-slate-700">사진 ③ 🙎‍♂️</span>
                      <span className="text-blue-600 font-extrabold text-base">➜</span>
                      <span className="font-extrabold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded">지민</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-blue-200/70">
                  <label htmlFor="aiA" className="block text-xs font-bold text-slate-800 mb-1">
                    기계 A는 함수일까요?
                  </label>
                  <select
                    id="aiA"
                    value={state.aiA || ''}
                    onChange={(e) =>
                      onUpdate((prev) => ({
                        ...prev,
                        aiA: e.target.value as any,
                        aiCheck1: false,
                      }))
                    }
                    className="w-full rounded-lg border border-blue-300 bg-white px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">선택하세요</option>
                    <option value="yes">함수이다 (O)</option>
                    <option value="no">함수가 아니다 (X)</option>
                  </select>
                </div>
              </div>

              {/* 기계 B */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-amber-200/80 mb-3">
                    <span className="font-extrabold text-amber-950 text-sm sm:text-base">
                      기계 B · 이상한 출력
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200/80 text-amber-900 mono">
                      출력 중복 의심
                    </span>
                  </div>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center justify-between bg-white/90 p-2 rounded-lg border border-amber-100 shadow-2xs">
                      <span className="font-semibold text-slate-700">사진 ① 🙎‍♂️</span>
                      <span className="text-amber-600 font-extrabold text-base">➜</span>
                      <span className="font-extrabold text-amber-950 bg-amber-100 px-2.5 py-0.5 rounded">지민</span>
                    </div>
                    <div className="flex items-center justify-between bg-amber-100/70 p-2 rounded-lg border border-amber-300 shadow-2xs">
                      <span className="font-semibold text-slate-900">사진 ② 👩</span>
                      <span className="text-red-600 font-extrabold text-base">➜</span>
                      <span className="font-extrabold text-red-700 bg-red-100 px-2 py-0.5 rounded text-xs">
                        유나, 민수 (각각!)
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-white/90 p-2 rounded-lg border border-amber-100 shadow-2xs">
                      <span className="font-semibold text-slate-700">사진 ③ 🙎‍♂️</span>
                      <span className="text-amber-600 font-extrabold text-base">➜</span>
                      <span className="font-extrabold text-amber-950 bg-amber-100 px-2.5 py-0.5 rounded">지민</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-200/70">
                  <label htmlFor="aiB" className="block text-xs font-bold text-slate-800 mb-1">
                    기계 B는 함수일까요?
                  </label>
                  <select
                    id="aiB"
                    value={state.aiB || ''}
                    onChange={(e) =>
                      onUpdate((prev) => ({
                        ...prev,
                        aiB: e.target.value as any,
                        aiCheck1: false,
                      }))
                    }
                    className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="">선택하세요</option>
                    <option value="yes">함수이다 (O)</option>
                    <option value="no">함수가 아니다 (X)</option>
                  </select>
                </div>
              </div>

              {/* 기계 C */}
              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-rose-200/80 mb-3">
                    <span className="font-extrabold text-rose-950 text-sm sm:text-base">
                      기계 C · 사라진 출력
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-200/80 text-rose-900 mono">
                      출력 누락 의심
                    </span>
                  </div>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center justify-between bg-white/90 p-2 rounded-lg border border-rose-100 shadow-2xs">
                      <span className="font-semibold text-slate-700">사진 ① 🙎‍♂️</span>
                      <span className="text-rose-600 font-extrabold text-base">➜</span>
                      <span className="font-extrabold text-rose-950 bg-rose-100 px-2.5 py-0.5 rounded">지민</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/90 p-2 rounded-lg border border-rose-100 shadow-2xs">
                      <span className="font-semibold text-slate-700">사진 ② 👩</span>
                      <span className="text-rose-600 font-extrabold text-base">➜</span>
                      <span className="font-extrabold text-rose-950 bg-rose-100 px-2.5 py-0.5 rounded">유나</span>
                    </div>
                    <div className="flex items-center justify-between bg-rose-100/70 p-2 rounded-lg border border-rose-300 shadow-2xs">
                      <span className="font-semibold text-slate-900">사진 ③ 🙎‍♂️</span>
                      <span className="text-rose-600 font-extrabold text-base">➜</span>
                      <span className="font-extrabold text-slate-500 italic bg-white/80 px-2.5 py-0.5 rounded border border-rose-200">
                        결과 없음 (미출력)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-rose-200/70">
                  <label htmlFor="aiC" className="block text-xs font-bold text-slate-800 mb-1">
                    기계 C는 함수일까요?
                  </label>
                  <select
                    id="aiC"
                    value={state.aiC || ''}
                    onChange={(e) =>
                      onUpdate((prev) => ({
                        ...prev,
                        aiC: e.target.value as any,
                        aiCheck1: false,
                      }))
                    }
                    className="w-full rounded-lg border border-rose-300 bg-white px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="">선택하세요</option>
                    <option value="yes">함수이다 (O)</option>
                    <option value="no">함수가 아니다 (X)</option>
                  </select>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              💡 <strong>참고:</strong> 이 실험에서는 이름을 각각 별도의 공역 원소로 다룹니다. (이름 목록 전체를 한 개의 묶음 원소로 정의하는 특수 경우가 아닙니다.)
            </p>

            {/* 설명 서술형 입력창 (넓은 textarea) */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label htmlFor="aiExplain" className="block text-xs sm:text-sm font-bold text-slate-900">
                  세 기계(A, B, C)의 차이를 함수의 정의(입력과 출력 조건)를 사용하여 자신의 말로 설명하기
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleHint('aiExplainHint')}
                    className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-bold text-amber-800 hover:bg-amber-100"
                  >
                    <HelpCircle className="h-3 w-3" />
                    <span>💡 힌트 보기</span>
                  </button>
                  <CharCountBadge current={(state.aiExplain || '').trim().length} min={8} />
                </div>
              </div>

              {showHints.aiExplainHint && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs sm:text-sm text-amber-900 space-y-1 animate-fadeIn">
                  <p className="font-bold flex items-center gap-1.5 text-amber-950">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                    함수의 핵심 판별 조건 힌트
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-amber-900">
                    <li><strong>조건 1:</strong> 정의역의 모든 원소(사진 ①, ②, ③)에 출력이 빠짐없이 존재하는가? (기계 C 검토)</li>
                    <li><strong>조건 2:</strong> 각 사진마다 출력이 '오직 하나씩'만 정해지는가? (기계 B 검토)</li>
                    <li><strong>조건 3:</strong> 서로 다른 두 사진이 같은 사람의 이름을 가리키는 것(기계 A의 사진 ①과 ③)은 함수 조건에 맞을까요?</li>
                  </ul>
                </div>
              )}

              <textarea
                id="aiExplain"
                rows={4}
                value={state.aiExplain || ''}
                onChange={(e) =>
                  onUpdate((prev) => ({
                    ...prev,
                    aiExplain: e.target.value,
                    aiCheck1: false,
                  }))
                }
                placeholder="예: 기계 A는 사진 ①과 ③의 출력이 모두 지민이지만 각 사진마다 출력이 오직 하나씩이므로 함수입니다. 기계 B는 사진 ②에 유나와 민수 두 개가 대응하여 오직 하나 조건에 위배되고, 기계 C는 사진 ③에 대응하는 출력이 누락되어 함수가 아닙니다."
                className={`w-full rounded-xl border p-3.5 text-sm sm:text-base text-slate-900 focus:ring-1 focus:ring-blue-500 ${getCharCountBorderClass(
                  (state.aiExplain || '').trim().length,
                  8
                )}`}
              />
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
              <button
                type="button"
                onClick={handleVerifyAiMission1}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-blue-700 shadow-xs flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>문항 1 판별 결과 확인</span>
              </button>
            </div>

            {feedback.aiMission1 && (
              <div
                className={`rounded-xl border p-4 text-xs sm:text-sm flex items-start gap-3 ${
                  feedback.aiMission1.type === 'good'
                    ? 'border-emerald-200 bg-emerald-50/80 text-emerald-900'
                    : 'border-amber-200 bg-amber-50/80 text-amber-900'
                }`}
              >
                {feedback.aiMission1.type === 'good' ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <strong className="block font-bold">
                    {feedback.aiMission1.type === 'good' ? '판별 결과: 정확합니다! 🎉' : '확인 필요'}
                  </strong>
                  <p className="leading-relaxed">{feedback.aiMission1.text}</p>
                </div>
              </div>
            )}
          </div>

          {/* 미션 2: AI 오류를 직접 수리하기 (인터랙티브 기계 수리 시뮬레이터) */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-indigo-600" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  미션 2 · AI 오류를 직접 수리하기 (기계 수리 엔지니어링)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {state.aiFixBVerified && state.aiFixCVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    기계 B·C 수리 완료!
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600">
              기계 B는 사진 ②에 두 이름이 대응하는 <strong>출력 중복 오류</strong>, 기계 C는 사진 ③의 출력이 없는 <strong>출력 누락 오류</strong>입니다.
              학습자가 AI 소프트웨어 엔지니어가 되어 <strong>각 기계를 정상적인 함수로 직접 수리</strong>해 보세요!
            </p>

            {/* 수리 인터랙션 카드 2종 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 기계 B 수리 */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded bg-amber-600 text-xs font-bold text-white mono">
                      B
                    </span>
                    기계 B 수리 · 사진 ②의 출력 하나로 변경
                  </h4>
                  {state.aiFixBVerified && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      수리 완료 ✓
                    </span>
                  )}
                </div>

                <div className="rounded-lg bg-white p-3 border border-amber-200 space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>수리 전 상태:</span>
                    <span className="text-red-600 font-bold">사진 ② ➜ [유나, 민수] (2개 대응 오류)</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <span className="font-extrabold text-slate-900 whitespace-nowrap">사진 ② 👩</span>
                    <span className="text-indigo-600 font-extrabold text-lg">➜</span>
                    <select
                      aria-label="기계 B 사진 2의 출력 선택"
                      value={state.aiFixB || ''}
                      onChange={(e) =>
                        onUpdate((prev) => ({
                          ...prev,
                          aiFixB: e.target.value,
                          aiFixBVerified: false,
                        }))
                      }
                      className="rounded-lg border border-indigo-300 bg-white px-3 py-1.5 text-xs sm:text-sm font-bold text-indigo-950 focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">이름 하나 선택</option>
                      <option value="지민">지민</option>
                      <option value="유나">유나</option>
                      <option value="민수">민수</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRepairMachineB}
                  className="w-full rounded-xl bg-amber-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-amber-700 shadow-xs flex items-center justify-center gap-2"
                >
                  <Wrench className="h-4 w-4" />
                  <span>기계 B 수리 및 함수 검증</span>
                </button>

                {feedback.aiRepairB && (
                  <div
                    className={`rounded-lg p-3 text-xs flex items-start gap-2 ${
                      feedback.aiRepairB.type === 'good'
                        ? 'bg-emerald-100/80 text-emerald-900 border border-emerald-300'
                        : 'bg-amber-100/80 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {feedback.aiRepairB.type === 'good' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                    )}
                    <span>{feedback.aiRepairB.text}</span>
                  </div>
                )}
              </div>

              {/* 기계 C 수리 */}
              <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded bg-rose-600 text-xs font-bold text-white mono">
                      C
                    </span>
                    기계 C 수리 · 사진 ③의 출력 채우기
                  </h4>
                  {state.aiFixCVerified && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      수리 완료 ✓
                    </span>
                  )}
                </div>

                <div className="rounded-lg bg-white p-3 border border-rose-200 space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>수리 전 상태:</span>
                    <span className="text-rose-600 font-bold">사진 ③ ➜ 결과 없음 (출력 누락 오류)</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <span className="font-extrabold text-slate-900 whitespace-nowrap">사진 ③ 🙎‍♂️</span>
                    <span className="text-indigo-600 font-extrabold text-lg">➜</span>
                    <select
                      aria-label="기계 C 사진 3의 출력 선택"
                      value={state.aiFixC || ''}
                      onChange={(e) =>
                        onUpdate((prev) => ({
                          ...prev,
                          aiFixC: e.target.value,
                          aiFixCVerified: false,
                        }))
                      }
                      className="rounded-lg border border-indigo-300 bg-white px-3 py-1.5 text-xs sm:text-sm font-bold text-indigo-950 focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">이름 하나 선택</option>
                      <option value="지민">지민</option>
                      <option value="유나">유나</option>
                      <option value="민수">민수</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRepairMachineC}
                  className="w-full rounded-xl bg-rose-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-rose-700 shadow-xs flex items-center justify-center gap-2"
                >
                  <Wrench className="h-4 w-4" />
                  <span>기계 C 수리 및 함수 검증</span>
                </button>

                {feedback.aiRepairC && (
                  <div
                    className={`rounded-lg p-3 text-xs flex items-start gap-2 ${
                      feedback.aiRepairC.type === 'good'
                        ? 'bg-emerald-100/80 text-emerald-900 border border-emerald-300'
                        : 'bg-rose-100/80 text-rose-900 border border-rose-300'
                    }`}
                  >
                    {feedback.aiRepairC.type === 'good' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-rose-700 shrink-0 mt-0.5" />
                    )}
                    <span>{feedback.aiRepairC.text}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 심화 탐구 질문 (문항 3 · 서술형) */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label htmlFor="aiReflection" className="block text-xs sm:text-sm font-bold text-slate-900">
                  탐구 질문: 두 장의 사진이 같은 사람의 이름으로 출력되어도 함수일까요? 이유는?
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleHint('aiReflectionHint')}
                    className="inline-flex items-center gap-1 rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-xs font-bold text-indigo-800 hover:bg-indigo-100"
                  >
                    <HelpCircle className="h-3 w-3" />
                    <span>💡 힌트 보기</span>
                  </button>
                  <CharCountBadge current={(state.aiReflection || '').trim().length} min={8} />
                </div>
              </div>

              {showHints.aiReflectionHint && (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-3.5 text-xs sm:text-sm text-indigo-900 space-y-1 animate-fadeIn">
                  <p className="font-bold flex items-center gap-1.5 text-indigo-950">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                    수학적 개념 힌트
                  </p>
                  <p>
                    정의역 <MathText text="X" />의 각 원소에 공역 <MathText text="Y" />의 원소가 <strong>'오직 하나씩'</strong> 대응한다는 것은, 화살표를 쏘는 쪽(정의역)에서 두 발을 쏘지 않는다는 뜻입니다.
                    공역의 한 원소가 여러 개의 화살표를 받는 다대일(many-to-one) 대응은 함수에 해당할까요?
                  </p>
                </div>
              )}

              <textarea
                id="aiReflection"
                rows={4}
                value={state.aiReflection || ''}
                onChange={(e) =>
                  onUpdate((prev) => ({
                    ...prev,
                    aiReflection: e.target.value,
                    aiReflectionChecked: false,
                  }))
                }
                placeholder="정의역의 모든 원소와 공역의 원소 사이의 관계를 이용하여 설명하세요. (예: 서로 다른 사진 ①과 ③이 모두 지민으로 대응되어도, 각 사진마다 출력이 오직 하나씩 정해지므로...)"
                className={`w-full rounded-xl border p-3.5 text-sm sm:text-base text-slate-900 focus:ring-1 focus:ring-blue-500 ${getCharCountBorderClass(
                  (state.aiReflection || '').trim().length,
                  8
                )}`}
              />

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={handleVerifyAiReflection}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-indigo-700 shadow-xs flex items-center gap-2"
                >
                  <Lightbulb className="h-4 w-4" />
                  <span>문항 3 생각 및 개념 확인</span>
                </button>
              </div>

              {feedback.aiReflection && (
                <div
                  className={`rounded-xl border p-4 text-xs sm:text-sm flex items-start gap-3 ${
                    feedback.aiReflection.type === 'good'
                      ? 'border-emerald-200 bg-emerald-50/80 text-emerald-900'
                      : 'border-amber-200 bg-amber-50/80 text-amber-900'
                  }`}
                >
                  {feedback.aiReflection.type === 'good' ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <strong className="block font-bold">
                      {feedback.aiReflection.type === 'good' ? '개념 정리 완료!' : '작성 안내'}
                    </strong>
                    <p className="mt-0.5">{feedback.aiReflection.text}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 학습 마무리 & 성찰 배너 */}
          <div className="rounded-2xl border border-blue-200 bg-linear-to-r from-blue-50 to-indigo-50/60 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  🎉 01차시 (함수의 뜻과 그래프) 전체 탐구 완주!
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">
                  실생활 AI를 수학적으로 모델링하려면 <strong>입력(정의역)과 출력(공역)이 무엇인지</strong> 먼저 명확히 정의해야 합니다.
                  작성하신 모든 탐구 기록과 AI 수리 데이터는 브라우저와 클라우드에 안전하게 보관됩니다.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleDownloadAiRecord}
                  className="rounded-xl border border-blue-300 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-blue-900 hover:bg-blue-50 shadow-2xs flex items-center gap-1.5"
                >
                  <Download className="h-4 w-4 text-blue-600" />
                  <span>AI 미션 기록 JSON 다운로드</span>
                </button>
                <button
                  type="button"
                  onClick={onGoToLesson2}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white hover:bg-blue-700 shadow-xs flex items-center gap-2"
                >
                  <span>02차시 (여러 가지 함수) 도전하기</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
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
          {step === 5 ? (
            <button
              type="button"
              onClick={onGoToLesson2}
              className="min-h-[44px] rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 shadow-xs flex items-center gap-2 whitespace-nowrap"
            >
              <span>02차시로 이동 →</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onStepChange(Math.min(5, step + 1))}
              className="min-h-[44px] rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-40 whitespace-nowrap"
            >
              다음 단계 →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
