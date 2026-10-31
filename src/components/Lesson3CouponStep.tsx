import React, { useState } from 'react';
import type { Lesson3State } from '../utils/mathLogic';
import {
  COUPON_DEFAULT,
  COUPON_RANGE,
  CouponFeedback,
  CouponSetting,
  couponDiscount,
  couponFee,
  systemA,
  systemB,
  validateCouponM1,
  validateCouponM2,
  validateCouponM3,
  validateCouponM4,
  won,
} from '../utils/lesson3Coupon';
import { parseLinear, formatLinear } from '../utils/linearExpr';
import { MathText } from './MathText';
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Lightbulb, RotateCcw, Sparkles, Ticket } from 'lucide-react';

/**
 * 3차시 5단계 · 도전!! 실생활 합성함수 — 학교 축제 할인 쿠폰의 비밀
 * 예상 → 실험 → 규칙 발견(미션 1~3) → 확장(미션 4) → 수학적 설명(마무리 질문)
 * 계산·채점: src/utils/lesson3Coupon.ts
 */

export interface Lesson3CouponStepProps {
  state: Lesson3State;
  onUpdate: (updater: (prev: Lesson3State) => Lesson3State) => void;
  onPrev: () => void;
  onGoToLesson4: () => void;
}

/** 입력 항목 → 속한 미션의 [정답 확인] 표시. 답을 고치면 확인 표시를 해제합니다. */
const FIELD_FLAG: Partial<Record<keyof Lesson3State, keyof Lesson3State>> = {
  cp_predict: 'cp_m1Verified',
  cp_m1_A: 'cp_m1Verified',
  cp_m1_B: 'cp_m1Verified',
  cp_m1_better: 'cp_m1Verified',
  cp_f: 'cp_m2Verified',
  cp_g: 'cp_m2Verified',
  cp_A: 'cp_m2Verified',
  cp_B: 'cp_m2Verified',
  cp_m3_choice: 'cp_m3Verified',
  cp_m3_diff: 'cp_m3Verified',
  cp_m3_reason: 'cp_m3Verified',
  cp_m4_rate: 'cp_m4Verified',
  cp_m4_fixed: 'cp_m4Verified',
  cp_m4_reason: 'cp_m4Verified',
};

type MissionKey = 'm1' | 'm2' | 'm3' | 'm4';

const PREVIEW_PRICES = [5000, 10000, 20000, 30000, 50000];

// ───────────── 작은 화면 조각 ─────────────
function Feedback({ fb }: { fb?: CouponFeedback | null }) {
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

function MissionHeader({ no, title, done }: { no: string; title: React.ReactNode; done?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 pb-3">
      <div>
        <span className="text-xs font-extrabold text-rose-600">{no}</span>
        <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">{title}</h4>
      </div>
      {done && (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          확인 완료
        </span>
      )}
    </div>
  );
}

function Hint({ open, onToggle, children }: { open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors"
      >
        <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
        <span>{open ? '힌트 닫기' : '💡 힌트 보기'}</span>
      </button>
      {open && <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-950 space-y-1">{children}</div>}
    </div>
  );
}

function Choices<T extends string>({
  value,
  options,
  onPick,
  cols = 'sm:grid-cols-3',
}: {
  value?: T | '';
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
            value === val ? 'border-rose-600 bg-rose-50 text-rose-950 ring-1 ring-rose-600' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <MathText text={label} />
        </button>
      ))}
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:border-rose-500 focus:outline-none';

function TextField({
  id,
  label,
  prefix,
  suffix,
  value,
  onChange,
  expr,
}: {
  id: string;
  label: React.ReactNode;
  prefix?: string;
  suffix?: string;
  value?: string;
  onChange: (v: string) => void;
  /** 일차식 입력: 아래에 읽은 식을 보여 줌 */
  expr?: boolean;
}) {
  const parsed = expr && (value || '').trim() ? parseLinear(value) : null;
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <label htmlFor={id} className="block text-xs font-bold text-slate-700 mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-2">
        {prefix && (
          <span className="text-sm font-extrabold text-slate-700 shrink-0">
            <MathText text={prefix} />
          </span>
        )}
        <input id={id} type="text" autoComplete="off" spellCheck={false} value={value || ''} onChange={(e) => onChange(e.target.value)} className={inputCls} />
        {suffix && <span className="text-sm font-bold text-slate-600 shrink-0">{suffix}</span>}
      </div>
      {expr && (value || '').trim() && (
        <div className={`mt-1.5 text-[11px] font-semibold ${parsed ? 'text-slate-500' : 'text-rose-600'}`}>
          {parsed ? (
            <>
              읽은 식: <span className="mono text-slate-700">{formatLinear(parsed)}</span>
            </>
          ) : (
            'x에 대한 일차식으로 써 주세요. (예: 0.8x + 1000, 4/5(x + 1000))'
          )}
        </div>
      )}
    </div>
  );
}

function VerifyBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white hover:bg-rose-700 transition-colors shadow-xs"
    >
      <CheckCircle2 className="h-4 w-4" />
      <span>{children}</span>
    </button>
  );
}

function Slider({
  id,
  label,
  value,
  display,
  range,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  display: string;
  range: { min: number; max: number; step: number };
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
        <label htmlFor={id}>{label}</label>
        <span className="mono text-sm text-slate-900">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        min={range.min}
        max={range.max}
        step={range.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-rose-600"
      />
    </div>
  );
}

/** 계산 순서를 보여 주는 함수 기계 한 줄 */
function Pipeline({
  name,
  order,
  x,
  s,
  tone,
}: {
  name: string;
  order: 'A' | 'B';
  x: number;
  s: CouponSetting;
  tone: 'blue' | 'violet';
}) {
  const fLabel = s.kind === 'rate' ? `${s.ratePct}% 할인` : `${s.fixedWon.toLocaleString('ko-KR')}원 할인`;
  const gLabel = `포장비 +${s.feeWon.toLocaleString('ko-KR')}`;
  const mid = order === 'A' ? couponDiscount(x, s) : couponFee(x, s);
  const end = order === 'A' ? systemA(x, s) : systemB(x, s);
  const steps =
    order === 'A'
      ? [
          { fn: 'f', label: fLabel },
          { fn: 'g', label: gLabel },
        ]
      : [
          { fn: 'g', label: gLabel },
          { fn: 'f', label: fLabel },
        ];
  const border = tone === 'blue' ? 'border-blue-200' : 'border-violet-200';
  const strong = tone === 'blue' ? 'text-blue-800' : 'text-violet-800';
  const box = `rounded-lg border bg-white px-2 py-1 font-extrabold mono text-xs sm:text-sm`;
  return (
    <div className={`rounded-xl border ${border} bg-white/70 p-3 space-y-2`}>
      <div className={`text-xs font-extrabold ${strong}`}>
        {name} <MathText text={order === 'A' ? '= g(f(x))' : '= f(g(x))'} />
      </div>
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className={`${box} border-slate-300`}>{won(x)}</span>
        <span className="font-bold text-slate-600">
          —<MathText text={steps[0].fn} /> {steps[0].label}→
        </span>
        <span className={`${box} border-slate-300`}>{won(mid)}</span>
        <span className="font-bold text-slate-600">
          —<MathText text={steps[1].fn} /> {steps[1].label}→
        </span>
        <span className={`${box} ${border} ${strong}`}>{won(end)}</span>
      </div>
    </div>
  );
}

// ───────────── 도전 단계 화면 ─────────────
export function Lesson3CouponStep({ state, onUpdate, onPrev, onGoToLesson4 }: Lesson3CouponStepProps) {
  const [price, setPrice] = useState(10000);
  const [setting, setSetting] = useState<CouponSetting>(COUPON_DEFAULT);
  const [feedback, setFeedback] = useState<Partial<Record<MissionKey, CouponFeedback | null>>>({});
  const [hints, setHints] = useState<Record<string, boolean>>({});
  const toggleHint = (k: string) => setHints((p) => ({ ...p, [k]: !p[k] }));

  const setField = <K extends keyof Lesson3State>(key: K, value: Lesson3State[K]) => {
    const flag = FIELD_FLAG[key];
    onUpdate((prev) => ({ ...prev, [key]: value, ...(flag ? { [flag]: false } : {}) }));
  };
  const verify = (key: MissionKey, flag: keyof Lesson3State, fn: (p: Lesson3State) => CouponFeedback) => {
    const res = fn(state);
    setFeedback((p) => ({ ...p, [key]: res }));
    if (res.ok) onUpdate((prev) => ({ ...prev, [flag]: true }));
  };

  const a = systemA(price, setting);
  const b = systemB(price, setting);
  const diff = a - b;
  const resetLab = () => {
    setPrice(10000);
    setSetting(COUPON_DEFAULT);
  };

  return (
    <div className="space-y-6">
      {/* 상황 */}
      <div className="rounded-2xl border-2 border-rose-500/70 bg-gradient-to-br from-rose-50/80 via-white to-amber-50/60 p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-extrabold text-white">도전!! 실생활 합성함수</span>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-1.5">
            <Ticket className="h-5 w-5 text-rose-600" />
            학교 축제 할인 쿠폰의 비밀
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
          학교 축제에서 온라인으로 간식을 주문하려고 한다. 행사에서는 <strong>20% 할인 쿠폰</strong>을 제공하지만{' '}
          <strong>포장비 1,000원</strong>이 추가된다. 그런데 두 결제 시스템의 요금 계산 방식이 서로 다르다.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-blue-200 bg-white p-3.5 space-y-1">
            <div className="text-sm font-extrabold text-blue-800">A 시스템</div>
            <div className="text-xs sm:text-sm text-slate-700">상품 가격 → 20% 할인 → 포장비 1,000원 추가</div>
            <div className="text-sm font-extrabold text-blue-900">
              <MathText text="g(f(x))" />
            </div>
          </div>
          <div className="rounded-xl border border-violet-200 bg-white p-3.5 space-y-1">
            <div className="text-sm font-extrabold text-violet-800">B 시스템</div>
            <div className="text-xs sm:text-sm text-slate-700">상품 가격 → 포장비 1,000원 추가 → 전체 금액 20% 할인</div>
            <div className="text-sm font-extrabold text-violet-900">
              <MathText text="f(g(x))" />
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-600">
          여기서 <MathText text="f" />는 <strong>20% 할인</strong>하는 함수, <MathText text="g" />는 <strong>포장비 1,000원을 더하는</strong> 함수입니다.
        </p>
        <p className="text-[11px] text-slate-500">※ 두 시스템은 수학적 비교를 위해 설정한 가상의 결제 방식입니다.</p>
      </div>

      {/* 예상하기 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <MissionHeader no="예상하기" title="계산하기 전에, 어느 시스템이 더 유리할 것 같나요?" />
        <Choices
          value={state.cp_predict}
          options={[
            ['A', 'A 시스템 (할인 먼저)'],
            ['B', 'B 시스템 (포장비 먼저)'],
            ['same', '두 시스템이 같다'],
          ] as const}
          onPick={(v) => setField('cp_predict', v)}
        />
        {state.cp_predict && <p className="text-xs font-semibold text-slate-600">좋아요! 아래 실험기와 미션으로 예상이 맞는지 확인해 보세요.</p>}
      </div>

      {/* 결제 실험기 */}
      <div className="rounded-2xl border border-rose-200/90 bg-rose-50/30 p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm font-extrabold text-rose-800 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-rose-600" />
            직접 조작하는 결제 실험
          </div>
          <div className="flex items-center gap-1.5">
            {(
              [
                ['rate', '비율 할인 쿠폰'],
                ['fixed', '정액 할인 쿠폰'],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                aria-pressed={setting.kind === k}
                onClick={() => setSetting((s) => ({ ...s, kind: k }))}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  setting.kind === k ? 'bg-rose-600 text-white shadow-2xs' : 'border border-slate-200 bg-white text-slate-700 hover:bg-rose-50'
                }`}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={resetLab}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw className="h-3.5 w-3.5" /> 초기화
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl border border-slate-200 bg-white p-4">
          <Slider id="cp-price" label="상품 가격 x" value={price} display={won(price)} range={COUPON_RANGE.price} onChange={setPrice} />
          {setting.kind === 'rate' ? (
            <Slider
              id="cp-rate"
              label="할인율"
              value={setting.ratePct}
              display={`${setting.ratePct}%`}
              range={COUPON_RANGE.ratePct}
              onChange={(v) => setSetting((s) => ({ ...s, ratePct: v }))}
            />
          ) : (
            <Slider
              id="cp-fixed"
              label="할인 금액"
              value={setting.fixedWon}
              display={won(setting.fixedWon)}
              range={COUPON_RANGE.fixedWon}
              onChange={(v) => setSetting((s) => ({ ...s, fixedWon: v }))}
            />
          )}
          <Slider
            id="cp-fee"
            label="포장비"
            value={setting.feeWon}
            display={won(setting.feeWon)}
            range={COUPON_RANGE.feeWon}
            onChange={(v) => setSetting((s) => ({ ...s, feeWon: v }))}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <Pipeline name="A 시스템 · 할인 후 추가" order="A" x={price} s={setting} tone="blue" />
          <Pipeline name="B 시스템 · 추가 후 할인" order="B" x={price} s={setting} tone="violet" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" aria-live="polite">
          <div className="rounded-xl border border-blue-200 bg-white p-3 text-center">
            <div className="text-[11px] font-bold text-slate-500">A 시스템 결제 금액</div>
            <div className="text-lg font-extrabold text-blue-800 mono">{won(a)}</div>
          </div>
          <div className="rounded-xl border border-violet-200 bg-white p-3 text-center">
            <div className="text-[11px] font-bold text-slate-500">B 시스템 결제 금액</div>
            <div className="text-lg font-extrabold text-violet-800 mono">{won(b)}</div>
          </div>
          <div className="rounded-xl border border-rose-200 bg-white p-3 text-center">
            <div className="text-[11px] font-bold text-slate-500">두 시스템의 결제 금액 차이</div>
            <div className="text-lg font-extrabold text-rose-800 mono">{won(Math.abs(diff))}</div>
            <div className="text-xs font-bold text-slate-700">
              {diff > 0 ? 'B 시스템이 더 저렴합니다.' : diff < 0 ? 'A 시스템이 더 저렴합니다.' : '두 시스템의 금액이 같습니다.'}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 overflow-x-auto">
          <div className="mb-2 text-xs font-extrabold text-slate-700">지금 쿠폰·포장비 조건에서 상품 가격만 바꾸어 보면</div>
          <table className="w-full min-w-[360px] text-xs sm:text-sm">
            <thead>
              <tr className="text-slate-500 border-b border-slate-200">
                <th className="py-1.5 text-left font-bold">상품 가격 x</th>
                <th className="py-1.5 text-right font-bold">A</th>
                <th className="py-1.5 text-right font-bold">B</th>
                <th className="py-1.5 text-right font-bold">A − B</th>
              </tr>
            </thead>
            <tbody className="mono">
              {PREVIEW_PRICES.map((x) => (
                <tr key={x} className={`border-b border-slate-100 ${x === price ? 'bg-rose-50 font-extrabold' : ''}`}>
                  <td className="py-1.5">{won(x)}</td>
                  <td className="py-1.5 text-right text-blue-800">{won(systemA(x, setting))}</td>
                  <td className="py-1.5 text-right text-violet-800">{won(systemB(x, setting))}</td>
                  <td className="py-1.5 text-right text-rose-800">{(systemA(x, setting) - systemB(x, setting)).toLocaleString('ko-KR')}원</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 미션 1 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <MissionHeader no="미션 1" title="상품 가격이 10,000원일 때 A, B 시스템 중 어느 쪽이 유리한지 알아보자." done={state.cp_m1Verified} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextField id="cp-m1-a" label="A 시스템 결제 금액" suffix="원" value={state.cp_m1_A} onChange={(v) => setField('cp_m1_A', v)} />
          <TextField id="cp-m1-b" label="B 시스템 결제 금액" suffix="원" value={state.cp_m1_B} onChange={(v) => setField('cp_m1_B', v)} />
        </div>
        <div className="space-y-2">
          <div className="text-xs sm:text-sm font-bold text-slate-900">어느 시스템이 더 유리한가요?</div>
          <Choices
            value={state.cp_m1_better}
            options={[
              ['A', 'A 시스템'],
              ['B', 'B 시스템'],
              ['same', '같다'],
            ] as const}
            onPick={(v) => setField('cp_m1_better', v)}
          />
        </div>
        <Feedback fb={feedback.m1} />
        <VerifyBtn onClick={() => verify('m1', 'cp_m1Verified', validateCouponM1)}>[미션 1] 정답 확인하기</VerifyBtn>
      </div>

      {/* 미션 2 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <MissionHeader no="미션 2" title="상품 가격을 x원이라 할 때, 각 시스템의 최종 결제 금액을 합성함수로 나타내 보자." done={state.cp_m2Verified} />
        <Hint open={!!hints.m2} onToggle={() => toggleHint('m2')}>
          <div>
            • 20% 할인하면 원래 가격의 <strong>80%</strong>를 냅니다. 소수(0.8x)나 분수(4/5x) 모두 됩니다.
          </div>
          <div>
            • <MathText text="g(f(x))" />는 f(x)를 g에, <MathText text="f(g(x))" />는 g(x)를 f에 대입합니다. 괄호째 써도 됩니다: 0.8(x + 1000)
          </div>
        </Hint>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextField id="cp-f" label="할인 함수" prefix="f(x) =" expr value={state.cp_f} onChange={(v) => setField('cp_f', v)} />
          <TextField id="cp-g" label="포장비 함수" prefix="g(x) =" expr value={state.cp_g} onChange={(v) => setField('cp_g', v)} />
          <TextField id="cp-A" label="A 시스템" prefix="g(f(x)) =" expr value={state.cp_A} onChange={(v) => setField('cp_A', v)} />
          <TextField id="cp-B" label="B 시스템" prefix="f(g(x)) =" expr value={state.cp_B} onChange={(v) => setField('cp_B', v)} />
        </div>
        <Feedback fb={feedback.m2} />
        <VerifyBtn onClick={() => verify('m2', 'cp_m2Verified', validateCouponM2)}>[미션 2] 정답 확인하기</VerifyBtn>
      </div>

      {/* 미션 3 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <MissionHeader no="미션 3" title="상품 가격을 바꾸어도 같은 시스템이 항상 유리할까? 그 이유를 수학적으로 설명해 보자." done={state.cp_m3Verified} />
        <Choices
          value={state.cp_m3_choice}
          options={[
            ['B_always', '항상 B 시스템이 유리하다'],
            ['A_always', '항상 A 시스템이 유리하다'],
            ['depends', '상품 가격에 따라 달라진다'],
          ] as const}
          onPick={(v) => setField('cp_m3_choice', v)}
        />
        <div className="w-full sm:w-72">
          <TextField
            id="cp-m3-diff"
            label={<>미션 2의 두 식으로 계산한 A − B</>}
            suffix="원"
            value={state.cp_m3_diff}
            onChange={(v) => setField('cp_m3_diff', v)}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="cp-m3-reason" className="block text-xs sm:text-sm font-bold text-slate-900">
            상품 가격과 관계없이 그렇게 되는 이유를 설명해 보세요.
          </label>
          <textarea
            id="cp-m3-reason"
            rows={2}
            value={state.cp_m3_reason || ''}
            onChange={(e) => setField('cp_m3_reason', e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs sm:text-sm text-slate-900 focus:border-rose-500 focus:outline-none"
          />
        </div>
        <Hint open={!!hints.m3} onToggle={() => toggleHint('m3')}>
          (0.8x + 1000) − (0.8x + 800)을 계산하면 x는 어떻게 되나요? B 시스템에서는 <strong>포장비 1,000원도 함께 할인</strong>된다는 점을 생각해 보세요.
        </Hint>
        <Feedback fb={feedback.m3} />
        <VerifyBtn onClick={() => verify('m3', 'cp_m3Verified', validateCouponM3)}>[미션 3] 정답 확인하기</VerifyBtn>
      </div>

      {/* 미션 4 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <MissionHeader no="미션 4" title="두 시스템의 최종 결제 금액이 같아지도록 할인율이나 포장비 조건을 변경할 수 있을까?" done={state.cp_m4Verified} />
        <p className="text-xs text-slate-600">결제 실험기에서 할인율과 포장비를 바꾸어 보고, [정액 할인 쿠폰]으로도 바꾸어 실험해 보세요.</p>
        <div className="space-y-2">
          <div className="text-xs sm:text-sm font-bold text-slate-900">① 비율 할인 쿠폰일 때 두 금액이 같아지는 경우는?</div>
          <Choices
            value={state.cp_m4_rate}
            options={[
              ['only_zero', '할인율 0% 또는 포장비 0원일 때만'],
              ['some_rate', '알맞은 할인율을 고르면 같아진다'],
              ['never', '어떤 경우에도 같아지지 않는다'],
            ] as const}
            onPick={(v) => setField('cp_m4_rate', v)}
          />
        </div>
        <div className="space-y-2">
          <div className="text-xs sm:text-sm font-bold text-slate-900">
            ② 쿠폰을 <strong>정액 할인</strong>(예: 2,000원 할인)으로 바꾸면, 순서를 바꾸어도 두 금액이 항상 같을까?
          </div>
          <Choices
            cols="sm:grid-cols-2"
            value={state.cp_m4_fixed}
            options={[
              ['yes', '항상 같다'],
              ['no', '다를 때가 있다'],
            ] as const}
            onPick={(v) => setField('cp_m4_fixed', v)}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="cp-m4-reason" className="block text-xs sm:text-sm font-bold text-slate-900">
            ③ 정액 할인일 때 순서를 바꾸어도 결과가 같은(또는 다른) 이유를 식으로 설명해 보세요.
          </label>
          <textarea
            id="cp-m4-reason"
            rows={2}
            value={state.cp_m4_reason || ''}
            onChange={(e) => setField('cp_m4_reason', e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs sm:text-sm text-slate-900 focus:border-rose-500 focus:outline-none"
          />
        </div>
        <Hint open={!!hints.m4} onToggle={() => toggleHint('m4')}>
          <div>
            • 비율 할인: A − B = (할인율) × (포장비)입니다. 이 값이 0이 되려면?
          </div>
          <div>
            • 정액 할인: <MathText text="f(x) = x − 2000" />, <MathText text="g(x) = x + 1000" />이면 <MathText text="g(f(x))" />와{' '}
            <MathText text="f(g(x))" />를 각각 구해 보세요.
          </div>
        </Hint>
        <Feedback fb={feedback.m4} />
        <VerifyBtn onClick={() => verify('m4', 'cp_m4Verified', validateCouponM4)}>[미션 4] 정답 확인하기</VerifyBtn>
      </div>

      {/* 마무리 질문 */}
      <div className="rounded-2xl border-2 border-indigo-500/70 bg-indigo-50/40 p-5 sm:p-6 space-y-4">
        <div className="text-xs font-extrabold text-indigo-700">마무리 질문</div>
        <label htmlFor="cp-final" className="block text-base sm:text-lg font-extrabold text-slate-900">
          “같은 두 함수를 사용했는데, 왜 계산하는 순서에 따라 결과가 달라질까?”
        </label>
        <textarea
          id="cp-final"
          rows={3}
          value={state.cp_final || ''}
          onChange={(e) => onUpdate((prev) => ({ ...prev, cp_final: e.target.value }))}
          className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs sm:text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
        />
        <p className="text-[11px] text-slate-500">
          미션 1~4를 모두 확인하고 이 질문에 10자 이상 답하면 5단계가 완료됩니다. 이 활동은 3단계에서 배운 <strong>합성함수의 교환법칙이 일반적으로 성립하지 않는다</strong>는 성질과 연결됩니다.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-indigo-100">
          <button
            type="button"
            onClick={onPrev}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>이전 단계</span>
          </button>
          <button
            type="button"
            onClick={onGoToLesson4}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            <span>다음 차시: 04차시 역함수 탐구로 이동</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
