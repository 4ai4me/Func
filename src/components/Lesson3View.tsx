import React, { useState } from 'react';
import {
  Lesson3State,
  validateL3Open,
  validateL3Prob1,
  validateL3Ex1,
  validateL3Prob2,
  validateL3Think,
} from '../utils/mathLogic';
import { MathText } from './MathText';
import { CompositeVennDiagram } from './CompositeVennDiagram';
import { Lesson3CouponStep } from './Lesson3CouponStep';
import { summarizeCoupon } from '../utils/lesson3Coupon';
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Layers,
  BookOpen,
  Eye,
  EyeOff,
} from 'lucide-react';

interface Lesson3ViewProps {
  state: Lesson3State;
  step: number;
  onStepChange: (next: number) => void;
  onUpdate: (updater: (prev: Lesson3State) => Lesson3State) => void;
  onGoToLesson4: () => void;
  onRequestConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

const STUDENTS_X = [
  { id: '아람', food: '핫도그', price: '3000원', color: 'blue' },
  { id: '재영', food: '김밥', price: '4000원', color: 'emerald' },
  { id: '하영', food: '어묵', price: '2000원', color: 'violet' },
] as const;

const FOODS_Y = ['어묵', '핫도그', '떡볶이', '김밥'] as const;
const PRICES_Z = ['2000원', '3000원', '4000원'] as const;

const FOOD_TO_PRICE: Record<string, string> = {
  어묵: '2000원',
  핫도그: '3000원',
  떡볶이: '4000원',
  김밥: '4000원',
};

export const Lesson3View: React.FC<Lesson3ViewProps> = ({
  state,
  step,
  onStepChange,
  onUpdate,
  onGoToLesson4,
  onRequestConfirm,
}) => {
  // Interactive state for Step 0 (Food -> Price correspondence diagram)
  const [selectedStudent, setSelectedStudent] = useState<'all' | '아람' | '재영' | '하영'>('all');

  // Interactive state for Step 1 (Function machine pipeline simulator)
  const [machineMode, setMachineMode] = useState<'gf' | 'fg' | 'ff' | 'gg'>('gf');
  const [machineX, setMachineX] = useState<number>(2);

  // Interactive state for Step 2 (Toggle original textbook image for converted 예제 1)
  const [showEx1TextbookImg, setShowEx1TextbookImg] = useState<boolean>(false);

  // Interactive state for Step 3 (3-function associative pipeline simulator)
  const [assocTestX, setAssocTestX] = useState<number>(1);

  // Collapsible hint states (Strict Zero-Placeholder Policy: all hints outside inputs)
  const [hints, setHints] = useState<Record<string, boolean>>({});
  const toggleHint = (key: string) => {
    setHints((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Feedback banners per activity
  const [openFeedback, setOpenFeedback] = useState<{
    ok: boolean;
    message: string;
    type: 'good' | 'warn';
  } | null>(null);
  const [prob1Feedback, setProb1Feedback] = useState<{
    ok: boolean;
    message: string;
    type: 'good' | 'warn';
  } | null>(null);
  const [ex1Feedback, setEx1Feedback] = useState<{
    ok: boolean;
    message: string;
    type: 'good' | 'warn';
  } | null>(null);
  const [prob2Feedback, setProb2Feedback] = useState<{
    ok: boolean;
    message: string;
    type: 'good' | 'warn';
  } | null>(null);
  const [thinkFeedback, setThinkFeedback] = useState<{
    ok: boolean;
    message: string;
    type: 'good' | 'warn';
  } | null>(null);

  // Step 1 Function Machine calculations for f(x) = 2x + 1, g(x) = x² - 1
  const calcF1 = (x: number) => 2 * x + 1;
  const calcG1 = (x: number) => x * x - 1;
  const machineFirstVal =
    machineMode === 'gf' || machineMode === 'ff' ? calcF1(machineX) : calcG1(machineX);
  const machineFinalVal =
    machineMode === 'gf' || machineMode === 'gg'
      ? calcG1(machineFirstVal)
      : calcF1(machineFirstVal);

  // Step 3 Associativity simulator calculations for f(x)=2x-1, g(x)=3x+2, h(x)=x²+1
  const calcF3 = (x: number) => 2 * x - 1;
  const calcG3 = (x: number) => 3 * x + 2;
  const calcH3 = (x: number) => x * x + 1;
  const assocHx = calcH3(assocTestX);
  const assocLeftMid = assocHx; // h(x)
  const assocLeftFinal = calcF3(calcG3(assocLeftMid)); // (f∘g)(h(x))
  const assocRightMid = calcG3(calcH3(assocTestX)); // (g∘h)(x)
  const assocRightFinal = calcF3(assocRightMid); // f((g∘h)(x))

  const syncLegacyFields = (next: Lesson3State): Lesson3State => {
    const p1Summary = [
      next.openMeaningReason ? `[생각 열기] ${next.openMeaningReason}` : '',
      next.p1Reason
        ? `[문제 1] (g∘f)(2)=${next.p1_1_ans || ''}, (f∘g)(-1)=${next.p1_2_ans || ''}, (f∘f)(-3)=${next.p1_3_ans || ''} / ${next.p1Reason}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    const p2Summary = [
      next.ex1Reason
        ? `[문제(교환법칙)] (g∘f)(x)=${next.ex1_gf || ''}, (f∘g)(x)=${next.ex1_fg || ''} / ${next.ex1Reason}`
        : '',
      next.p2Reason
        ? `[문제 2] (g∘f)(x)=${next.p2_1_gf || ''}, (f∘g)(x)=${next.p2_2_fg || ''}, (g∘g)(x)=${next.p2_3_gg || ''} / ${next.p2Reason}`
        : '',
      next.thinkComparison
        ? `[생각 넓히기] ((f∘g)∘h)(x)=${next.think_fgh_left || ''}, (f∘(g∘h))(x)=${next.think_fgh_right || ''} / ${next.thinkComparison}`
        : '',
      summarizeCoupon(next),
    ]
      .filter(Boolean)
      .join('\n');

    return {
      ...next,
      prob1ProofText: p1Summary || next.prob1ProofText,
      prob2ProofText: p2Summary || next.prob2ProofText,
    };
  };

  const handleVerifyOpen = () => {
    const res = validateL3Open(state);
    setOpenFeedback(res);
    if (res.ok) {
      onUpdate((prev) =>
        syncLegacyFields({
          ...prev,
          openVerified: true,
        })
      );
    }
  };

  const handleVerifyProb1 = () => {
    const res = validateL3Prob1(state);
    setProb1Feedback(res);
    if (res.ok) {
      onUpdate((prev) =>
        syncLegacyFields({
          ...prev,
          p1Verified: true,
          prob1Verified: [true, true, true, true],
        })
      );
    }
  };

  const handleVerifyEx1 = () => {
    const res = validateL3Ex1(state);
    setEx1Feedback(res);
    if (res.ok) {
      onUpdate((prev) =>
        syncLegacyFields({
          ...prev,
          ex1Verified: true,
        })
      );
    }
  };

  const handleVerifyProb2 = () => {
    const res = validateL3Prob2(state);
    setProb2Feedback(res);
    if (res.ok) {
      onUpdate((prev) =>
        syncLegacyFields({
          ...prev,
          p2Verified: true,
          prob2Verified: [true, true, true, true],
        })
      );
    }
  };

  const handleVerifyThink = () => {
    const res = validateL3Think(state);
    setThinkFeedback(res);
    if (res.ok) {
      onUpdate((prev) =>
        syncLegacyFields({
          ...prev,
          thinkVerified: true,
        })
      );
    }
  };

  const handleResetLesson3 = () => {
    onRequestConfirm(
      '3차시 탐구 기록 초기화',
      '3차시(합성함수 탐구)에 입력한 모든 답안과 확인 상태를 초기화할까요?',
      () => {
        onUpdate((prev) => ({
          ...prev,
          openAramPrice: '',
          openJaeyoungPrice: '',
          openHayoungPrice: '',
          openDomainToCodomainChoice: '',
          openMeaningReason: '',
          openVerified: false,
          p1_1_f2: '',
          p1_1_ans: '',
          p1_2_gm1: '',
          p1_2_ans: '',
          p1_3_fm3: '',
          p1_3_ans: '',
          p1Reason: '',
          p1Verified: false,
          ex1_gf: '',
          ex1_fg: '',
          ex1_commutative: '',
          ex1Reason: '',
          ex1Verified: false,
          p2_1_gf: '',
          p2_2_fg: '',
          p2_3_gg: '',
          p2Reason: '',
          p2Verified: false,
          think_fg: '',
          think_fgh_left: '',
          think_gh: '',
          think_fgh_right: '',
          think_associative: '',
          thinkComparison: '',
          thinkVerified: false,
          reflection1: '',
          reflection2: '',
          prob1ProofText: '',
          prob2ProofText: '',
          cp_predict: '',
          cp_m1_A: '',
          cp_m1_B: '',
          cp_m1_better: '',
          cp_m1Verified: false,
          cp_f: '',
          cp_g: '',
          cp_A: '',
          cp_B: '',
          cp_m2Verified: false,
          cp_m3_choice: '',
          cp_m3_diff: '',
          cp_m3_reason: '',
          cp_m3Verified: false,
          cp_m4_rate: '',
          cp_m4_fixed: '',
          cp_m4_reason: '',
          cp_m4Verified: false,
          cp_final: '',
        }));
        setOpenFeedback(null);
        setProb1Feedback(null);
        setEx1Feedback(null);
        setProb2Feedback(null);
        setThinkFeedback(null);
      }
    );
  };

  return (
    <div className="space-y-7">
      {/* Top Lesson Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200/80 bg-indigo-50/60 px-4 py-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-indigo-950">
          <Layers className="h-4 w-4 text-indigo-600 shrink-0" />
          <span>03차시 · 합성함수 탐구:</span>
          <span className="font-semibold text-indigo-800">
            두 함수를 하나로 연결하는 합성함수 <MathText text="(g ∘ f)(x) = g(f(x))" />와 교환·결합법칙
          </span>
        </div>
        <button
          type="button"
          onClick={handleResetLesson3}
          className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
          <span>3차시 초기화</span>
        </button>
      </div>

      {/* =====================================================================
          STEP 0: 01 생각 열기 · 합성함수의 뜻
      ===================================================================== */}
      {step === 0 && (
        <div className="space-y-6">
          {/* Textbook Image Card: 생각 열기 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-extrabold text-white">
                  생각 열기
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  세 학생이 주문한 음식과 가격의 대응 연결하기
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">교과서 본문 탐구</span>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 flex justify-center">
              <img
                src="/assets/aistudio/image_1b8ffdc0.png"
                alt="합성함수 생각 열기 - 세 학생이 주문한 음식과 각 음식의 가격을 대응으로 나타낸 그림"
                className="max-h-[320px] w-auto object-contain rounded-lg"
              />
            </div>

            {/* Interactive 3-Set Correspondence Simulator */}
            <div className="rounded-2xl border border-indigo-200/90 bg-indigo-50/40 p-4 sm:p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-extrabold text-indigo-700 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-indigo-600" />
                    <span>인터랙티브 합성함수 대응 추적기 (X → Y → Z)</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-600">
                    학생 이름을 클릭하면 <strong>주문한 음식 <MathText text="f(x)" /></strong>를 거쳐{' '}
                    <strong>가격 <MathText text="g(f(x))" /></strong>로 이어지는 두 단계 대응 경로가 강조됩니다.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(['all', '아람', '재영', '하영'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSelectedStudent(st)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                        selectedStudent === st
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-indigo-50'
                      }`}
                    >
                      {st === 'all' ? '전체 경로 보기' : `${st} 추적`}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3-Column Visual Diagram */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-white rounded-xl border border-slate-200 p-4">
                {/* Set X */}
                <div className="rounded-xl border-2 border-blue-200 bg-blue-50/40 p-3.5">
                  <div className="text-center text-xs font-extrabold text-blue-900 pb-2 border-b border-blue-200/80">
                    집합 <MathText text="X" /> (학생) — 함수 <MathText text="f: X → Y" />의 정의역
                  </div>
                  <div className="mt-2.5 space-y-2">
                    {STUDENTS_X.map((item) => {
                      const active = selectedStudent === 'all' || selectedStudent === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            setSelectedStudent((prev) => (prev === item.id ? 'all' : item.id))
                          }
                          className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs sm:text-sm font-bold border transition-all ${
                            active
                              ? 'border-blue-500 bg-blue-600 text-white shadow-2xs'
                              : 'border-slate-200 bg-white text-slate-400'
                          }`}
                        >
                          <span>{item.id}</span>
                          <span className="text-[11px] font-semibold opacity-90">
                            f({item.id}) = {item.food} →
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Set Y */}
                <div className="rounded-xl border-2 border-amber-200 bg-amber-50/40 p-3.5">
                  <div className="text-center text-xs font-extrabold text-amber-900 pb-2 border-b border-amber-200/80">
                    집합 <MathText text="Y" /> (음식) — 징검다리 집합
                  </div>
                  <div className="mt-2.5 space-y-2">
                    {FOODS_Y.map((food) => {
                      const matchedStudent = STUDENTS_X.find((s) => s.food === food);
                      const active =
                        selectedStudent === 'all'
                          ? Boolean(matchedStudent)
                          : matchedStudent?.id === selectedStudent;
                      return (
                        <div
                          key={food}
                          className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs sm:text-sm font-bold border transition-all ${
                            active
                              ? 'border-amber-500 bg-amber-500 text-white shadow-2xs'
                              : 'border-slate-200 bg-white text-slate-400'
                          }`}
                        >
                          <span>{food}</span>
                          <span className="text-[11px] font-semibold">
                            g({food}) = {FOOD_TO_PRICE[food]} →
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Set Z */}
                <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/40 p-3.5">
                  <div className="text-center text-xs font-extrabold text-emerald-900 pb-2 border-b border-emerald-200/80">
                    집합 <MathText text="Z" /> (가격) — 합성함수 <MathText text="g ∘ f" />의 공역
                  </div>
                  <div className="mt-2.5 space-y-2">
                    {PRICES_Z.map((price) => {
                      const matchedStudents = STUDENTS_X.filter((s) => s.price === price);
                      const active =
                        selectedStudent === 'all'
                          ? matchedStudents.length > 0
                          : matchedStudents.some((s) => s.id === selectedStudent);
                      return (
                        <div
                          key={price}
                          className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs sm:text-sm font-bold border transition-all ${
                            active
                              ? 'border-emerald-600 bg-emerald-600 text-white shadow-2xs'
                              : 'border-slate-200 bg-white text-slate-400'
                          }`}
                        >
                          <span>{price}</span>
                          <span className="text-[11px] font-semibold">
                            {matchedStudents.map((s) => `(g∘f)(${s.id})`).join(', ')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Direct Composite Path Banner */}
              <div className="rounded-xl border border-indigo-200 bg-white p-3.5 text-xs sm:text-sm text-slate-800">
                {selectedStudent === 'all' ? (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-indigo-950">
                      💡 두 대응을 하나로 이은 합성함수 <MathText text="(g ∘ f)(x) = g(f(x))" />:
                    </span>
                    <div className="flex flex-wrap items-center gap-2 mono font-bold text-xs">
                      <span className="rounded-md bg-blue-50 text-blue-800 px-2.5 py-1 border border-blue-200">
                        아람 → 핫도그 → 3000원
                      </span>
                      <span className="rounded-md bg-emerald-50 text-emerald-800 px-2.5 py-1 border border-emerald-200">
                        재영 → 김밥 → 4000원
                      </span>
                      <span className="rounded-md bg-violet-50 text-violet-800 px-2.5 py-1 border border-violet-200">
                        하영 → 어묵 → 2000원
                      </span>
                    </div>
                  </div>
                ) : (
                  (() => {
                    const target = STUDENTS_X.find((s) => s.id === selectedStudent)!;
                    return (
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-extrabold text-indigo-900">
                          [{target.id}의 합성함수 대응 경로]
                        </span>
                        <span className="mono font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200">
                          (g ∘ f)({target.id}) = g(f({target.id})) = g({target.food}) = {target.price}
                        </span>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>

            {/* 합성함수 대응 벤다이어그램 (X → Y → Z, 위의 학생 선택과 연동) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
              <div className="mb-1 text-xs sm:text-sm font-extrabold text-slate-800">
                벤다이어그램으로 보는 합성함수 <MathText text="g ∘ f" />
              </div>
              <CompositeVennDiagram
                setX={STUDENTS_X.map((s) => s.id)}
                setY={FOODS_Y}
                setZ={PRICES_Z}
                f={Object.fromEntries(STUDENTS_X.map((s) => [s.id, s.food]))}
                g={FOOD_TO_PRICE}
                labels={{ x: 'X (학생)', y: 'Y (음식)', z: 'Z (가격)' }}
                highlight={selectedStudent === 'all' ? null : selectedStudent}
                onSelectDomain={(x) =>
                  setSelectedStudent((prev) => (prev === x ? 'all' : (x as '아람' | '재영' | '하영')))
                }
                ariaLabel={`합성함수 벤다이어그램: ${STUDENTS_X.map(
                  (s) => `${s.id}→${s.food}→${s.price}`
                ).join(', ')}, 떡볶이→${FOOD_TO_PRICE['떡볶이']}`}
              />
            </div>

            {/* Key Textbook Definition Box */}
            <div className="rounded-2xl border-2 border-indigo-600/80 bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/60 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-indigo-900">
                <BookOpen className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>핵심 개념 정리 — 합성함수의 뜻과 기호</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                두 함수 <MathText text="f: X → Y" />, <MathText text="g: Y → Z" />가 주어졌을 때, 집합{' '}
                <MathText text="X" />의 각 원소 <MathText text="x" />에 집합 <MathText text="Y" />의 원소{' '}
                <MathText text="f(x)" />가 대응하고, 다시 이 <MathText text="f(x)" />에 집합{' '}
                <MathText text="Z" />의 원소 <MathText text="g(f(x))" />가 대응합니다. 이때 집합{' '}
                <MathText text="X" />의 각 원소 <MathText text="x" />에 집합 <MathText text="Z" />의 원소{' '}
                <MathText text="g(f(x))" />를 대응시키는 새로운 함수를 <MathText text="f" />와{' '}
                <MathText text="g" />의 <strong>합성함수</strong>라 하고, 기호로 다음과 같이 나타냅니다.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="rounded-xl border border-indigo-200 bg-white p-3.5 text-center">
                  <div className="text-[11px] font-bold text-slate-500">합성함수의 정의역과 공역</div>
                  <div className="mt-1 text-base sm:text-lg font-extrabold text-indigo-900 mono">
                    <MathText text="g ∘ f : X → Z" />
                  </div>
                </div>
                <div className="rounded-xl border border-indigo-200 bg-white p-3.5 text-center">
                  <div className="text-[11px] font-bold text-slate-500">합성함수의 함숫값 기호</div>
                  <div className="mt-1 text-base sm:text-lg font-extrabold text-blue-700 mono">
                    <MathText text="(g ∘ f)(x) = g(f(x))" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-amber-50/90 border border-amber-200 px-3.5 py-2.5 text-xs font-semibold text-amber-950">
                ⚠️ <strong>기호 순서 주의!</strong> <MathText text="(g ∘ f)(x) = g(f(x))" />에서는{' '}
                <strong>오른쪽(안쪽)에 있는 함수 <MathText text="f" />가 먼저</strong> 적용되고, 그 결과인{' '}
                <MathText text="f(x)" />에 <strong>왼쪽(바깥쪽) 함수 <MathText text="g" />가 나중에</strong>{' '}
                적용됩니다.
              </div>
            </div>
          </div>

          {/* Student Input Card for Step 0 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-extrabold text-indigo-600">탐구 활동 01</span>
                <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                  [생각 열기] 세 학생이 주문한 음식의 가격과 합성함수의 뜻 확인하기
                </h4>
              </div>
              {state.openVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  확인 완료
                </span>
              )}
            </div>

            {/* Question 1: Prices */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label className="text-xs sm:text-sm font-bold text-slate-900">
                  1. 그림의 대응 화살표를 따라 세 학생이 주문한 음식의 가격을 각각 구해 보세요.
                </label>
                <button
                  type="button"
                  onClick={() => toggleHint('openPrices')}
                  className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors"
                >
                  <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
                  <span>{hints.openPrices ? '힌트 닫기' : '💡 힌트 보기'}</span>
                </button>
              </div>

              {hints.openPrices && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-950 space-y-1">
                  <div>
                    • <strong>아람</strong> → 핫도그 → <strong>3000</strong>원
                  </div>
                  <div>
                    • <strong>재영</strong> → 김밥 → <strong>4000</strong>원
                  </div>
                  <div>
                    • <strong>하영</strong> → 어묵 → <strong>2000</strong>원 (숫자만 적거나 ‘3000원’처럼 적을 수 있습니다)
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                  <label
                    htmlFor="l3-open-aram"
                    className="block text-xs font-bold text-slate-700 mb-1.5"
                  >
                    아람 (주문: 핫도그) → 가격
                  </label>
                  <input
                    id="l3-open-aram"
                    type="text"
                    placeholder=""
                    value={state.openAramPrice || ''}
                    onChange={(e) =>
                      onUpdate((prev) => ({
                        ...prev,
                        openAramPrice: e.target.value,
                        openVerified: false,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                  <label
                    htmlFor="l3-open-jaeyoung"
                    className="block text-xs font-bold text-slate-700 mb-1.5"
                  >
                    재영 (주문: 김밥) → 가격
                  </label>
                  <input
                    id="l3-open-jaeyoung"
                    type="text"
                    placeholder=""
                    value={state.openJaeyoungPrice || ''}
                    onChange={(e) =>
                      onUpdate((prev) => ({
                        ...prev,
                        openJaeyoungPrice: e.target.value,
                        openVerified: false,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                  <label
                    htmlFor="l3-open-hayoung"
                    className="block text-xs font-bold text-slate-700 mb-1.5"
                  >
                    하영 (주문: 어묵) → 가격
                  </label>
                  <input
                    id="l3-open-hayoung"
                    type="text"
                    placeholder=""
                    value={state.openHayoungPrice || ''}
                    onChange={(e) =>
                      onUpdate((prev) => ({
                        ...prev,
                        openHayoungPrice: e.target.value,
                        openVerified: false,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Question 2: Domain -> Codomain of g ∘ f */}
            <div className="space-y-2.5">
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                2. 두 함수 <MathText text="f: X → Y" />와 <MathText text="g: Y → Z" />의 합성함수{' '}
                <MathText text="g ∘ f" />는 어느 집합에서 어느 집합으로의 함수인가요?
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {(
                  [
                    ['X_to_Z', 'g ∘ f : X → Z (X에서 Z로의 함수)'],
                    ['Y_to_Z', 'g ∘ f : Y → Z (Y에서 Z로의 함수)'],
                    ['X_to_Y', 'g ∘ f : X → Y (X에서 Y로의 함수)'],
                  ] as const
                ).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      onUpdate((prev) => ({
                        ...prev,
                        openDomainToCodomainChoice: val,
                        openVerified: false,
                      }))
                    }
                    className={`rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm font-bold text-left transition-all ${
                      state.openDomainToCodomainChoice === val
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-950 ring-1 ring-indigo-600'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <MathText text={label} />
                  </button>
                ))}
              </div>
            </div>

            {/* Question 3: Meaning of (g ∘ f)(x) = g(f(x)) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label
                  htmlFor="l3-open-meaning"
                  className="text-xs sm:text-sm font-bold text-slate-900"
                >
                  3. 합성함수 <MathText text="(g ∘ f)(x) = g(f(x))" />가 어떻게 값을 대응시키는지 자신의 말로 서술해 보세요.
                </label>
                <button
                  type="button"
                  onClick={() => toggleHint('openMeaning')}
                  className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors"
                >
                  <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
                  <span>{hints.openMeaning ? '힌트 닫기' : '💡 힌트 보기'}</span>
                </button>
              </div>

              {hints.openMeaning && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-950">
                  💡 작성 예시: “정의역 X의 원소 x에 함수 f를 먼저 적용하여 f(x)를 구한 뒤, 그 함숫값 f(x)를 다시 함수 g에 대입하여 Z의 원소 g(f(x))를 대응시키는 함수이다.”
                </div>
              )}

              <textarea
                id="l3-open-meaning"
                rows={2}
                placeholder=""
                value={state.openMeaningReason || ''}
                onChange={(e) =>
                  onUpdate((prev) =>
                    syncLegacyFields({
                      ...prev,
                      openMeaningReason: e.target.value,
                      openVerified: false,
                    })
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs sm:text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {openFeedback && (
              <div
                className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-xs sm:text-sm font-semibold ${
                  openFeedback.type === 'good'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-amber-200 bg-amber-50 text-amber-900'
                }`}
              >
                {openFeedback.type === 'good' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <span>{openFeedback.message}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleVerifyOpen}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white hover:bg-indigo-700 transition-colors shadow-xs"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>[생각 열기] 확인하기</span>
              </button>

              <button
                type="button"
                onClick={() => onStepChange(1)}
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                <span>다음 단계: 02 문제 1 · 함숫값 구하기</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 1: 02 문제 1 · 함숫값 구하기
      ===================================================================== */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Textbook Image Card: 문제 1 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-extrabold text-white">
                  문제 1
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  합성함수의 함숫값 단계별로 구하기
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                <MathText text="f(x) = 2x + 1,  g(x) = x² - 1" />
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 flex justify-center">
              <img
                src="/assets/aistudio/image_1bb293de.png"
                alt="문제 1 - 두 함수 f(x)=2x+1과 g(x)=x²-1에 대하여 (1) (g∘f)(2), (2) (f∘g)(-1), (3) (f∘f)(-3)을 구하시오."
                className="max-h-[180px] w-auto object-contain rounded-lg"
              />
            </div>

            {/* Interactive Function Machine Simulator */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 sm:p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-extrabold text-emerald-800 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    <span>합성함수 2단계 함수 상자(파이프라인) 실험기</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-600">
                    합성 기호와 입력값 <MathText text="x" />를 선택해 안쪽 함수부터 차례대로 계산되는 흐름을 확인해 보세요.
                  </p>
                </div>

                {/* Mode selector */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(
                    [
                      ['gf', '(g ∘ f)(x) = g(f(x))'],
                      ['fg', '(f ∘ g)(x) = f(g(x))'],
                      ['ff', '(f ∘ f)(x) = f(f(x))'],
                      ['gg', '(g ∘ g)(x) = g(g(x))'],
                    ] as const
                  ).map(([m, label]) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMachineMode(m)}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all ${
                        machineMode === m
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-emerald-50'
                      }`}
                    >
                      <MathText text={label} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Input x selector */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white border border-slate-200 px-4 py-2.5">
                <span className="text-xs font-bold text-slate-700">
                  입력값 <MathText text="x" /> 선택 (문제 1의 입력값: <code className="text-emerald-700 font-extrabold">2, -1, -3</code>):
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[-3, -2, -1, 0, 1, 2, 3].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setMachineX(val)}
                      className={`min-w-[36px] rounded-lg px-2.5 py-1 text-xs font-extrabold mono transition-all ${
                        machineX === val
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Pipeline */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-center bg-white rounded-xl border border-slate-200 p-4 text-center">
                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3">
                  <div className="text-[11px] font-bold text-blue-700">처음 입력값 x</div>
                  <div className="mt-1 text-lg font-extrabold text-blue-950 mono">x = {machineX}</div>
                </div>

                <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-3">
                  <div className="text-[11px] font-bold text-indigo-700">
                    1단계 (안쪽 함수 {machineMode === 'gf' || machineMode === 'ff' ? 'f' : 'g'})
                  </div>
                  <div className="mt-1 text-xs font-extrabold text-indigo-950 mono">
                    {machineMode === 'gf' || machineMode === 'ff'
                      ? `f(${machineX}) = 2(${machineX})+1`
                      : `g(${machineX}) = (${machineX})²-1`}
                  </div>
                </div>

                <div className="rounded-xl border border-amber-300 bg-amber-50 p-3">
                  <div className="text-[11px] font-bold text-amber-800">중간 함숫값</div>
                  <div className="mt-1 text-lg font-extrabold text-amber-950 mono">
                    {machineMode === 'gf' || machineMode === 'ff' ? `f(${machineX})` : `g(${machineX})`} ={' '}
                    {machineFirstVal}
                  </div>
                </div>

                <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-3">
                  <div className="text-[11px] font-bold text-purple-700">
                    2단계 (바깥쪽 함수 {machineMode === 'gf' || machineMode === 'gg' ? 'g' : 'f'})
                  </div>
                  <div className="mt-1 text-xs font-extrabold text-purple-950 mono">
                    {machineMode === 'gf' || machineMode === 'gg'
                      ? `g(${machineFirstVal}) = (${machineFirstVal})²-1`
                      : `f(${machineFirstVal}) = 2(${machineFirstVal})+1`}
                  </div>
                </div>

                <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50 p-3">
                  <div className="text-[11px] font-bold text-emerald-800">최종 함숫값</div>
                  <div className="mt-1 text-lg font-extrabold text-emerald-950 mono">
                    {machineFinalVal}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Student Problem 1 Input Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-extrabold text-emerald-700">탐구 활동 02</span>
                <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                  [문제 1] <MathText text="f(x) = 2x + 1,  g(x) = x² - 1" />에 대하여 함숫값 구하기
                </h4>
              </div>
              {state.p1Verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  문제 1 정답 확인 완료
                </span>
              )}
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => toggleHint('prob1Calc')}
                className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors"
              >
                <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
                <span>{hints.prob1Calc ? '힌트 닫기' : '💡 문제 1 단계별 힌트 보기'}</span>
              </button>
            </div>

            {hints.prob1Calc && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-950 space-y-1.5">
                <div>
                  • <strong>(1) <MathText text="(g ∘ f)(2) = g(f(2))" /></strong>: 먼저{' '}
                  <MathText text="f(2) = 2 × 2 + 1 = 5" />를 구한 뒤,{' '}
                  <MathText text="g(5) = 5² - 1 = 24" />를 계산합니다.
                </div>
                <div>
                  • <strong>(2) <MathText text="(f ∘ g)(-1) = f(g(-1))" /></strong>: 먼저{' '}
                  <MathText text="g(-1) = (-1)² - 1 = 0" />을 구한 뒤,{' '}
                  <MathText text="f(0) = 2 × 0 + 1 = 1" />을 계산합니다.
                </div>
                <div>
                  • <strong>(3) <MathText text="(f ∘ f)(-3) = f(f(-3))" /></strong>: 먼저{' '}
                  <MathText text="f(-3) = 2 × (-3) + 1 = -5" />를 구한 뒤,{' '}
                  <MathText text="f(-5) = 2 × (-5) + 1 = -9" />를 계산합니다.
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Subproblem (1) */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                <div className="text-sm font-extrabold text-slate-900">
                  (1) <MathText text="(g ∘ f)(2)" /> 구하기
                </div>
                <div>
                  <label htmlFor="l3-p1-1-f2" className="block text-xs font-bold text-slate-700 mb-1">
                    1단계: 안쪽 함숫값 <MathText text="f(2)" /> =
                  </label>
                  <input
                    id="l3-p1-1-f2"
                    type="text"
                    placeholder=""
                    value={state.p1_1_f2 || ''}
                    onChange={(e) =>
                      onUpdate((prev) => ({
                        ...prev,
                        p1_1_f2: e.target.value,
                        p1Verified: false,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="l3-p1-1-ans" className="block text-xs font-bold text-slate-700 mb-1">
                    2단계: <MathText text="(g ∘ f)(2) = g(f(2))" /> =
                  </label>
                  <input
                    id="l3-p1-1-ans"
                    type="text"
                    placeholder=""
                    value={state.p1_1_ans || ''}
                    onChange={(e) =>
                      onUpdate((prev) => ({
                        ...prev,
                        p1_1_ans: e.target.value,
                        p1Verified: false,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Subproblem (2) */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                <div className="text-sm font-extrabold text-slate-900">
                  (2) <MathText text="(f ∘ g)(-1)" /> 구하기
                </div>
                <div>
                  <label htmlFor="l3-p1-2-gm1" className="block text-xs font-bold text-slate-700 mb-1">
                    1단계: 안쪽 함숫값 <MathText text="g(-1)" /> =
                  </label>
                  <input
                    id="l3-p1-2-gm1"
                    type="text"
                    placeholder=""
                    value={state.p1_2_gm1 || ''}
                    onChange={(e) =>
                      onUpdate((prev) => ({
                        ...prev,
                        p1_2_gm1: e.target.value,
                        p1Verified: false,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="l3-p1-2-ans" className="block text-xs font-bold text-slate-700 mb-1">
                    2단계: <MathText text="(f ∘ g)(-1) = f(g(-1))" /> =
                  </label>
                  <input
                    id="l3-p1-2-ans"
                    type="text"
                    placeholder=""
                    value={state.p1_2_ans || ''}
                    onChange={(e) =>
                      onUpdate((prev) => ({
                        ...prev,
                        p1_2_ans: e.target.value,
                        p1Verified: false,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Subproblem (3) */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                <div className="text-sm font-extrabold text-slate-900">
                  (3) <MathText text="(f ∘ f)(-3)" /> 구하기
                </div>
                <div>
                  <label htmlFor="l3-p1-3-fm3" className="block text-xs font-bold text-slate-700 mb-1">
                    1단계: 안쪽 함숫값 <MathText text="f(-3)" /> =
                  </label>
                  <input
                    id="l3-p1-3-fm3"
                    type="text"
                    placeholder=""
                    value={state.p1_3_fm3 || ''}
                    onChange={(e) =>
                      onUpdate((prev) => ({
                        ...prev,
                        p1_3_fm3: e.target.value,
                        p1Verified: false,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="l3-p1-3-ans" className="block text-xs font-bold text-slate-700 mb-1">
                    2단계: <MathText text="(f ∘ f)(-3) = f(f(-3))" /> =
                  </label>
                  <input
                    id="l3-p1-3-ans"
                    type="text"
                    placeholder=""
                    value={state.p1_3_ans || ''}
                    onChange={(e) =>
                      onUpdate((prev) => ({
                        ...prev,
                        p1_3_ans: e.target.value,
                        p1Verified: false,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Explanation Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label htmlFor="l3-p1-reason" className="text-xs sm:text-sm font-bold text-slate-900">
                  4. (1), (2), (3)의 함숫값을 구한 계산 과정을 간단히 서술해 보세요.
                </label>
                <button
                  type="button"
                  onClick={() => toggleHint('prob1Reason')}
                  className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors"
                >
                  <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
                  <span>{hints.prob1Reason ? '힌트 닫기' : '💡 힌트 보기'}</span>
                </button>
              </div>

              {hints.prob1Reason && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-950">
                  💡 작성 예시: “(1) f(2)=5이므로 g(5)=5²-1=24이다. (2) g(-1)=0이므로 f(0)=1이다. (3) 같은 함수 f끼리도 합성할 수 있으며 f(-3)=-5이므로 f(-5)=-9이다.”
                </div>
              )}

              <textarea
                id="l3-p1-reason"
                rows={2}
                placeholder=""
                value={state.p1Reason || ''}
                onChange={(e) =>
                  onUpdate((prev) =>
                    syncLegacyFields({
                      ...prev,
                      p1Reason: e.target.value,
                      p1Verified: false,
                    })
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs sm:text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            {prob1Feedback && (
              <div
                className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-xs sm:text-sm font-semibold ${
                  prob1Feedback.type === 'good'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-amber-200 bg-amber-50 text-amber-900'
                }`}
              >
                {prob1Feedback.type === 'good' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <span>{prob1Feedback.message}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onStepChange(0)}
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>이전 단계</span>
                </button>
                <button
                  type="button"
                  onClick={handleVerifyProb1}
                  className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>[문제 1] 정답 확인하기</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => onStepChange(2)}
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                <span>다음 단계: 03 문제 · 합성함수 식과 교환법칙</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 2: 03 문제 · 합성함수 식과 교환법칙 (예제 1 문제 변환 + 문제 2)
      ===================================================================== */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Part A: Textbook 예제 1 converted into a Problem */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-extrabold text-white">
                  문제 (교환법칙 탐구)
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  두 함수 <MathText text="f(x) = -x + 2" />와 <MathText text="g(x) = 4x + 1" />의 합성함수 식 구하기
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {state.ex1Verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    확인 완료
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setShowEx1TextbookImg((prev) => !prev)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  {showEx1TextbookImg ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5 text-slate-500" />
                      <span>교과서 원본 풀이 접기</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5 text-blue-600" />
                      <span>교과서 원본 이미지 보기</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Clean Problem Statement Box (Converted from 예제 1 so students solve it themselves) */}
            <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/40 p-4 sm:p-5 space-y-3">
              <div className="text-sm sm:text-base font-extrabold text-slate-900">
                두 함수 <MathText text="f(x) = -x + 2" />와 <MathText text="g(x) = 4x + 1" />에 대하여 다음을 구하시오.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-bold text-slate-800">
                <div className="rounded-xl bg-white border border-blue-200 px-4 py-2.5">
                  (1) <MathText text="(g ∘ f)(x)" />
                </div>
                <div className="rounded-xl bg-white border border-blue-200 px-4 py-2.5">
                  (2) <MathText text="(f ∘ g)(x)" />
                </div>
              </div>
              <p className="text-xs text-slate-600">
                💡 먼저 스스로 <MathText text="(g ∘ f)(x)" />와 <MathText text="(f ∘ g)(x)" />의 식을 구한 뒤, 두 합성함수가 서로 같은지(<MathText text="g ∘ f = f ∘ g" />인지) 확인해 보세요.
              </p>
            </div>

            {showEx1TextbookImg && (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 flex flex-col items-center gap-2">
                <img
                  src="/assets/aistudio/image_1c8dd915.png"
                  alt="두 함수 f(x)=-x+2와 g(x)=4x+1에 대하여 (1) (g∘f)(x), (2) (f∘g)(x) 구하기 및 교환법칙 설명"
                  className="max-h-[280px] w-auto object-contain rounded-lg"
                />
                <span className="text-[11px] font-semibold text-slate-500">
                  교과서 본문 참고 (일반적으로 <MathText text="g ∘ f ≠ f ∘ g" />, 즉 함수의 합성에서 교환법칙이 성립하지 않는다)
                </span>
              </div>
            )}

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => toggleHint('ex1Hint')}
                className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors"
              >
                <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
                <span>{hints.ex1Hint ? '힌트 닫기' : '💡 힌트 보기'}</span>
              </button>
            </div>

            {hints.ex1Hint && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-950 space-y-1.5">
                <div>
                  • <strong>(1) <MathText text="(g ∘ f)(x) = g(f(x)) = g(-x + 2)" /></strong>: 함수{' '}
                  <MathText text="g(x) = 4x + 1" />의 <MathText text="x" /> 자리에{' '}
                  <MathText text="(-x + 2)" />를 대입하면{' '}
                  <MathText text="4(-x + 2) + 1 = -4x + 9" />입니다.
                </div>
                <div>
                  • <strong>(2) <MathText text="(f ∘ g)(x) = f(g(x)) = f(4x + 1)" /></strong>: 함수{' '}
                  <MathText text="f(x) = -x + 2" />의 <MathText text="x" /> 자리에{' '}
                  <MathText text="(4x + 1)" />을 대입하면{' '}
                  <MathText text="-(4x + 1) + 2 = -4x + 1" />입니다.
                </div>
                <div>
                  • <MathText text="-4x + 9 ≠ -4x + 1" />이므로 <MathText text="g ∘ f ≠ f ∘ g" />입니다. 즉, 함수의 합성에서 <strong>교환법칙은 성립하지 않습니다.</strong>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <label htmlFor="l3-ex1-gf" className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                  (1) <MathText text="(g ∘ f)(x) = g(f(x))" />의 식
                </label>
                <input
                  id="l3-ex1-gf"
                  type="text"
                  placeholder=""
                  value={state.ex1_gf || ''}
                  onChange={(e) =>
                    onUpdate((prev) => ({
                      ...prev,
                      ex1_gf: e.target.value,
                      ex1Verified: false,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold mono text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <label htmlFor="l3-ex1-fg" className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                  (2) <MathText text="(f ∘ g)(x) = f(g(x))" />의 식
                </label>
                <input
                  id="l3-ex1-fg"
                  type="text"
                  placeholder=""
                  value={state.ex1_fg || ''}
                  onChange={(e) =>
                    onUpdate((prev) => ({
                      ...prev,
                      ex1_fg: e.target.value,
                      ex1Verified: false,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold mono text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Commutativity Question */}
            <div className="space-y-2">
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                3. 위의 (1)과 (2)의 결과를 비교할 때, 일반적으로 두 함수 <MathText text="f" />와{' '}
                <MathText text="g" />에 대하여 교환법칙(<MathText text="g ∘ f = f ∘ g" />)이 성립하나요?
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(
                  [
                    ['yes', '항상 성립한다 (g ∘ f = f ∘ g)'],
                    ['no', '일반적으로 성립하지 않는다 (g ∘ f ≠ f ∘ g)'],
                  ] as const
                ).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      onUpdate((prev) => ({
                        ...prev,
                        ex1_commutative: val,
                        ex1Verified: false,
                      }))
                    }
                    className={`rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm font-bold text-left transition-all ${
                      state.ex1_commutative === val
                        ? 'border-blue-600 bg-blue-50 text-blue-950 ring-1 ring-blue-600'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <MathText text={label} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="l3-ex1-reason" className="block text-xs sm:text-sm font-bold text-slate-900">
                4. <MathText text="(g ∘ f)(x)" />와 <MathText text="(f ∘ g)(x)" />의 풀이 과정 및 교환법칙이 성립하지 않는 이유를 적어 보세요.
              </label>
              <textarea
                id="l3-ex1-reason"
                rows={2}
                placeholder=""
                value={state.ex1Reason || ''}
                onChange={(e) =>
                  onUpdate((prev) =>
                    syncLegacyFields({
                      ...prev,
                      ex1Reason: e.target.value,
                      ex1Verified: false,
                    })
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            {ex1Feedback && (
              <div
                className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-xs sm:text-sm font-semibold ${
                  ex1Feedback.type === 'good'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-amber-200 bg-amber-50 text-amber-900'
                }`}
              >
                {ex1Feedback.type === 'good' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <span>{ex1Feedback.message}</span>
              </div>
            )}

            <div>
              <button
                type="button"
                onClick={handleVerifyEx1}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white hover:bg-blue-700 transition-colors shadow-xs"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>[문제 (교환법칙 탐구)] 정답 확인하기</span>
              </button>
            </div>
          </div>

          {/* Part B: Textbook [문제 2] */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-teal-600 px-2.5 py-1 text-xs font-extrabold text-white">
                  문제 2
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  두 함수 <MathText text="f(x) = x - 4" />와 <MathText text="g(x) = -x²" />의 합성함수 구하기
                </h3>
              </div>
              {state.p2Verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  문제 2 확인 완료
                </span>
              )}
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 flex justify-center">
              <img
                src="/assets/aistudio/image_70b33df1.png"
                alt="문제 2 - 두 함수 f(x)=x-4와 g(x)=-x²에 대하여 (1) (g∘f)(x), (2) (f∘g)(x), (3) (g∘g)(x)를 구하시오."
                className="max-h-[180px] w-auto object-contain rounded-lg"
              />
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-600">
                💡 제곱(<MathText text="²" />), 네제곱(<MathText text="⁴" />)은 화면 아래 수식 기호 입력바를 누르거나 키보드로 <code className="font-bold text-teal-700">^2</code>, <code className="font-bold text-teal-700">^4</code>를 입력하면 자동 변환됩니다.
              </span>
              <button
                type="button"
                onClick={() => toggleHint('prob2Hint')}
                className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors"
              >
                <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
                <span>{hints.prob2Hint ? '힌트 닫기' : '💡 문제 2 힌트 보기'}</span>
              </button>
            </div>

            {hints.prob2Hint && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-950 space-y-1.5">
                <div>
                  • <strong>(1) <MathText text="(g ∘ f)(x) = g(f(x)) = g(x - 4)" /></strong>:{' '}
                  <MathText text="g(x) = -x²" />의 <MathText text="x" /> 자리에{' '}
                  <MathText text="(x - 4)" />를 대입하면{' '}
                  <MathText text="-(x - 4)²" /> (전개하면 <MathText text="-x² + 8x - 16" />)입니다. 두 형태 모두 정답으로 인정됩니다.
                </div>
                <div>
                  • <strong>(2) <MathText text="(f ∘ g)(x) = f(g(x)) = f(-x²)" /></strong>:{' '}
                  <MathText text="f(x) = x - 4" />의 <MathText text="x" /> 자리에{' '}
                  <MathText text="-x²" />을 대입하면 <MathText text="-x² - 4" />입니다.
                </div>
                <div>
                  • <strong>(3) <MathText text="(g ∘ g)(x) = g(g(x)) = g(-x²)" /></strong>:{' '}
                  <MathText text="-(-x²)² = -x⁴" />입니다. (괄호 밖의 <MathText text="-" /> 부호에 주의!)
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <label htmlFor="l3-p2-1" className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                  (1) <MathText text="(g ∘ f)(x)" /> =
                </label>
                <input
                  id="l3-p2-1"
                  type="text"
                  placeholder=""
                  value={state.p2_1_gf || ''}
                  onChange={(e) =>
                    onUpdate((prev) => ({
                      ...prev,
                      p2_1_gf: e.target.value,
                      p2Verified: false,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold mono text-slate-900 focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <label htmlFor="l3-p2-2" className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                  (2) <MathText text="(f ∘ g)(x)" /> =
                </label>
                <input
                  id="l3-p2-2"
                  type="text"
                  placeholder=""
                  value={state.p2_2_fg || ''}
                  onChange={(e) =>
                    onUpdate((prev) => ({
                      ...prev,
                      p2_2_fg: e.target.value,
                      p2Verified: false,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold mono text-slate-900 focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <label htmlFor="l3-p2-3" className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                  (3) <MathText text="(g ∘ g)(x)" /> =
                </label>
                <input
                  id="l3-p2-3"
                  type="text"
                  placeholder=""
                  value={state.p2_3_gg || ''}
                  onChange={(e) =>
                    onUpdate((prev) => ({
                      ...prev,
                      p2_3_gg: e.target.value,
                      p2Verified: false,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold mono text-slate-900 focus:border-teal-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="l3-p2-reason" className="block text-xs sm:text-sm font-bold text-slate-900">
                4. [문제 2]의 (1), (2), (3)을 구한 대입 및 정리 과정을 서술해 보세요.
              </label>
              <textarea
                id="l3-p2-reason"
                rows={2}
                placeholder=""
                value={state.p2Reason || ''}
                onChange={(e) =>
                  onUpdate((prev) =>
                    syncLegacyFields({
                      ...prev,
                      p2Reason: e.target.value,
                      p2Verified: false,
                    })
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs sm:text-sm text-slate-900 focus:border-teal-600 focus:outline-none"
              />
            </div>

            {prob2Feedback && (
              <div
                className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-xs sm:text-sm font-semibold ${
                  prob2Feedback.type === 'good'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-amber-200 bg-amber-50 text-amber-900'
                }`}
              >
                {prob2Feedback.type === 'good' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <span>{prob2Feedback.message}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onStepChange(1)}
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>이전 단계</span>
                </button>
                <button
                  type="button"
                  onClick={handleVerifyProb2}
                  className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white hover:bg-teal-700 transition-colors shadow-xs"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>[문제 2] 정답 확인하기</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => onStepChange(3)}
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                <span>다음 단계: 04 생각 넓히기 · 결합법칙</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 3: 04 생각 넓히기 · 결합법칙 탐구 및 3차시 성찰
      ===================================================================== */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Textbook Image Card: 생각 넓히기 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-orange-600 px-2.5 py-1 text-xs font-extrabold text-white">
                  생각 넓히기
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  세 함수의 합성에서 결합법칙 <MathText text="(f ∘ g) ∘ h = f ∘ (g ∘ h)" /> 성립 탐구
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">문제해결 · 추론</span>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 flex justify-center">
              <img
                src="/assets/aistudio/image_f792abdb.png"
                alt="생각 넓히기 - 세 함수 f(x)=2x-1, g(x)=3x+2, h(x)=x²+1에 대하여 ((f∘g)∘h)(x)와 (f∘(g∘h))(x)를 구하고 비교하기"
                className="max-h-[260px] w-auto object-contain rounded-lg"
              />
            </div>

            {/* Interactive Associativity Pipeline Simulator */}
            <div className="rounded-2xl border border-orange-200 bg-orange-50/40 p-4 sm:p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-extrabold text-orange-900 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-orange-600" />
                    <span>세 함수 합성의 괄호 묶기 비교 시뮬레이터</span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-600">
                    입력값 <MathText text="x" />를 바꾸어 보면서 <MathText text="((f ∘ g) ∘ h)(x)" />와{' '}
                    <MathText text="(f ∘ (g ∘ h))(x)" />의 계산 경로와 최종 값을 비교해 보세요.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-700 mr-1">x =</span>
                  {[-2, -1, 0, 1, 2, 3].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setAssocTestX(v)}
                      className={`min-w-[34px] rounded-lg px-2.5 py-1 text-xs font-extrabold mono transition-all ${
                        assocTestX === v
                          ? 'bg-orange-600 text-white shadow-2xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-orange-50'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Left Grouping: ((f ∘ g) ∘ h)(x) */}
                <div className="rounded-xl border border-indigo-200 bg-white p-3.5 space-y-2">
                  <div className="text-xs font-extrabold text-indigo-900 flex items-center justify-between">
                    <span>경로 1: <MathText text="((f ∘ g) ∘ h)(x) = (f ∘ g)(h(x))" /></span>
                    <span className="mono text-indigo-700">먼저 f∘g를 묶은 경우</span>
                  </div>
                  <div className="text-xs text-slate-700 mono space-y-1 bg-indigo-50/50 rounded-lg p-2.5">
                    <div>1단계: h({assocTestX}) = ({assocTestX})² + 1 = <strong>{assocLeftMid}</strong></div>
                    <div>
                      2단계: (f ∘ g)({assocLeftMid}) = f(g({assocLeftMid})) = f({calcG3(assocLeftMid)}) ={' '}
                      <strong className="text-indigo-700 text-sm">{assocLeftFinal}</strong>
                    </div>
                  </div>
                </div>

                {/* Right Grouping: (f ∘ (g ∘ h))(x) */}
                <div className="rounded-xl border border-emerald-200 bg-white p-3.5 space-y-2">
                  <div className="text-xs font-extrabold text-emerald-900 flex items-center justify-between">
                    <span>경로 2: <MathText text="(f ∘ (g ∘ h))(x) = f((g ∘ h)(x))" /></span>
                    <span className="mono text-emerald-700">먼저 g∘h를 묶은 경우</span>
                  </div>
                  <div className="text-xs text-slate-700 mono space-y-1 bg-emerald-50/50 rounded-lg p-2.5">
                    <div>
                      1단계: (g ∘ h)({assocTestX}) = g(h({assocTestX})) = g({assocHx}) ={' '}
                      <strong>{assocRightMid}</strong>
                    </div>
                    <div>
                      2단계: f({assocRightMid}) = 2×({assocRightMid}) - 1 ={' '}
                      <strong className="text-emerald-700 text-sm">{assocRightFinal}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Student Input Card for 생각 넓히기 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-extrabold text-orange-600">탐구 활동 04</span>
                <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                  [생각 넓히기] <MathText text="((f ∘ g) ∘ h)(x)" />와 <MathText text="(f ∘ (g ∘ h))(x)" />를 구하고 비교하기
                </h4>
              </div>
              {state.thinkVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  생각 넓히기 완료
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-700">
                주어진 세 함수: <MathText text="f(x) = 2x - 1,  g(x) = 3x + 2,  h(x) = x² + 1" />
              </span>
              <button
                type="button"
                onClick={() => toggleHint('thinkHint')}
                className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors"
              >
                <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
                <span>{hints.thinkHint ? '힌트 닫기' : '💡 단계별 유도 힌트 보기'}</span>
              </button>
            </div>

            {hints.thinkHint && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-950 space-y-1.5">
                <div>
                  • <strong>좌변 <MathText text="((f ∘ g) ∘ h)(x)" /> 구하기</strong>: 먼저{' '}
                  <MathText text="(f ∘ g)(x) = f(3x + 2) = 2(3x + 2) - 1 = 6x + 3" />입니다. 여기에{' '}
                  <MathText text="h(x) = x² + 1" />을 대입하면{' '}
                  <MathText text="6(x² + 1) + 3 = 6x² + 9" />가 됩니다.
                </div>
                <div>
                  • <strong>우변 <MathText text="(f ∘ (g ∘ h))(x)" /> 구하기</strong>: 먼저{' '}
                  <MathText text="(g ∘ h)(x) = g(x² + 1) = 3(x² + 1) + 2 = 3x² + 5" />입니다. 이를{' '}
                  <MathText text="f(x) = 2x - 1" />에 대입하면{' '}
                  <MathText text="2(3x² + 5) - 1 = 6x² + 9" />가 됩니다.
                </div>
                <div>
                  • 두 식이 모두 <MathText text="6x² + 9" />로 같으므로{' '}
                  <MathText text="(f ∘ g) ∘ h = f ∘ (g ∘ h)" /> <strong>(결합법칙)가 성립합니다.</strong>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Side Derivation */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-4 space-y-3">
                <div className="text-xs sm:text-sm font-extrabold text-indigo-950">
                  ① 좌변 <MathText text="((f ∘ g) ∘ h)(x)" /> 구하기
                </div>
                <div>
                  <label htmlFor="l3-think-fg" className="block text-xs font-bold text-slate-700 mb-1">
                    1단계: <MathText text="(f ∘ g)(x) = f(g(x))" /> =
                  </label>
                  <input
                    id="l3-think-fg"
                    type="text"
                    placeholder=""
                    value={state.think_fg || ''}
                    onChange={(e) =>
                      onUpdate((prev) => ({
                        ...prev,
                        think_fg: e.target.value,
                        thinkVerified: false,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold mono text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="l3-think-left" className="block text-xs font-bold text-slate-700 mb-1">
                    2단계: <MathText text="((f ∘ g) ∘ h)(x) = (f ∘ g)(h(x))" /> =
                  </label>
                  <input
                    id="l3-think-left"
                    type="text"
                    placeholder=""
                    value={state.think_fgh_left || ''}
                    onChange={(e) =>
                      onUpdate((prev) => ({
                        ...prev,
                        think_fgh_left: e.target.value,
                        thinkVerified: false,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold mono text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Right Side Derivation */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 space-y-3">
                <div className="text-xs sm:text-sm font-extrabold text-emerald-950">
                  ② 우변 <MathText text="(f ∘ (g ∘ h))(x)" /> 구하기
                </div>
                <div>
                  <label htmlFor="l3-think-gh" className="block text-xs font-bold text-slate-700 mb-1">
                    1단계: <MathText text="(g ∘ h)(x) = g(h(x))" /> =
                  </label>
                  <input
                    id="l3-think-gh"
                    type="text"
                    placeholder=""
                    value={state.think_gh || ''}
                    onChange={(e) =>
                      onUpdate((prev) => ({
                        ...prev,
                        think_gh: e.target.value,
                        thinkVerified: false,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="l3-think-right" className="block text-xs font-bold text-slate-700 mb-1">
                    2단계: <MathText text="(f ∘ (g ∘ h))(x) = f((g ∘ h)(x))" /> =
                  </label>
                  <input
                    id="l3-think-right"
                    type="text"
                    placeholder=""
                    value={state.think_fgh_right || ''}
                    onChange={(e) =>
                      onUpdate((prev) => ({
                        ...prev,
                        think_fgh_right: e.target.value,
                        thinkVerified: false,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Associativity Choice */}
            <div className="space-y-2">
              <div className="text-xs sm:text-sm font-bold text-slate-900">
                3. 위의 두 결과를 비교할 때, 세 함수의 합성에서 결합법칙{' '}
                <MathText text="(f ∘ g) ∘ h = f ∘ (g ∘ h)" />가 성립하나요?
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(
                  [
                    ['yes', '성립한다 ((f ∘ g) ∘ h = f ∘ (g ∘ h))'],
                    ['no', '성립하지 않는다 ((f ∘ g) ∘ h ≠ f ∘ (g ∘ h))'],
                  ] as const
                ).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      onUpdate((prev) => ({
                        ...prev,
                        think_associative: val,
                        thinkVerified: false,
                      }))
                    }
                    className={`rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm font-bold text-left transition-all ${
                      state.think_associative === val
                        ? 'border-orange-600 bg-orange-50 text-orange-950 ring-1 ring-orange-600'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <MathText text={label} />
                  </button>
                ))}
              </div>
            </div>

            {/* Comparison Narrative */}
            <div className="space-y-2">
              <label htmlFor="l3-think-comp" className="block text-xs sm:text-sm font-bold text-slate-900">
                4. <MathText text="((f ∘ g) ∘ h)(x)" />와 <MathText text="(f ∘ (g ∘ h))(x)" />의 계산 결과를 비교하고 알게 된 성질을 서술해 보세요.
              </label>
              <textarea
                id="l3-think-comp"
                rows={2}
                placeholder=""
                value={state.thinkComparison || ''}
                onChange={(e) =>
                  onUpdate((prev) =>
                    syncLegacyFields({
                      ...prev,
                      thinkComparison: e.target.value,
                      thinkVerified: false,
                    })
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs sm:text-sm text-slate-900 focus:border-orange-600 focus:outline-none"
              />
            </div>

            {thinkFeedback && (
              <div
                className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-xs sm:text-sm font-semibold ${
                  thinkFeedback.type === 'good'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-amber-200 bg-amber-50 text-amber-900'
                }`}
              >
                {thinkFeedback.type === 'good' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <span>{thinkFeedback.message}</span>
              </div>
            )}

            <div>
              <button
                type="button"
                onClick={handleVerifyThink}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white hover:bg-orange-700 transition-colors shadow-xs"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>[생각 넓히기] 정답 확인하기</span>
              </button>
            </div>
          </div>

          {/* 3차시 배움 성찰 Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-extrabold text-indigo-600">3차시 마무리 성찰</span>
                <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                  합성함수의 성질(교환법칙 불성립 · 결합법칙 성립) 정리하기
                </h4>
              </div>
              <button
                type="button"
                onClick={() => toggleHint('reflectionHint')}
                className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors"
              >
                <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
                <span>{hints.reflectionHint ? '힌트 닫기' : '💡 성찰 힌트 보기'}</span>
              </button>
            </div>

            {hints.reflectionHint && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-950 space-y-1">
                <div>
                  • <strong>성찰 1 예시</strong>: “(g ∘ f)(x)는 f를 먼저 계산한 뒤 g에 대입하고, (f ∘ g)(x)는 g를 먼저 계산한 뒤 f에 대입하므로 적용 순서가 달라 일반적으로 g ∘ f ≠ f ∘ g이다.”
                </div>
                <div>
                  • <strong>성찰 2 예시</strong>: “세 함수의 합성에서는 괄호를 어떻게 묶더라도 x에 h, g, f 순서대로 적용하는 것이 같으므로 결합법칙 (f ∘ g) ∘ h = f ∘ (g ∘ h)가 항상 성립한다.”
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label
                  htmlFor="l3-reflection1"
                  className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5"
                >
                  1. <MathText text="(g ∘ f)(x)" />와 <MathText text="(f ∘ g)(x)" />의 계산 순서 차이와 교환법칙이 성립하지 않는 이유를 정리해 보세요.
                </label>
                <textarea
                  id="l3-reflection1"
                  rows={2}
                  placeholder=""
                  value={state.reflection1 || ''}
                  onChange={(e) =>
                    onUpdate((prev) => ({
                      ...prev,
                      reflection1: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs sm:text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="l3-reflection2"
                  className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5"
                >
                  2. 함수의 합성에서 결합법칙 <MathText text="(f ∘ g) ∘ h = f ∘ (g ∘ h)" />가 성립하는 이유나 오늘 새롭게 깨달은 점을 적어 보세요.
                </label>
                <textarea
                  id="l3-reflection2"
                  rows={2}
                  placeholder=""
                  value={state.reflection2 || ''}
                  onChange={(e) =>
                    onUpdate((prev) => ({
                      ...prev,
                      reflection2: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs sm:text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onStepChange(2)}
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>이전 단계</span>
              </button>

              <button
                type="button"
                onClick={() => onStepChange(4)}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white hover:bg-indigo-700 transition-colors shadow-xs"
              >
                <span>다음 단계: 도전!! 실생활 합성함수</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 4: 05 도전!! 실생활 합성함수 · 학교 축제 할인 쿠폰의 비밀
      ===================================================================== */}
      {step === 4 && (
        <Lesson3CouponStep
          state={state}
          onUpdate={(updater) => onUpdate((prev) => syncLegacyFields(updater(prev)))}
          onPrev={() => onStepChange(3)}
          onGoToLesson4={onGoToLesson4}
        />
      )}
    </div>
  );
};
