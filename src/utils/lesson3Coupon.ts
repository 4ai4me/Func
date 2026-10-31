import type { Lesson3State } from './mathLogic';
import { isLinearEqual, isNumberAnswer } from './linearExpr';

/**
 * 3차시 도전!! 실생활 합성함수 — 학교 축제 할인 쿠폰의 비밀 (순수 로직, 단위 테스트 대상)
 * ------------------------------------------------------------------
 * f : 할인 (비율 할인 f(x) = (1 − r)x, 정액 할인 f(x) = x − k)
 * g : 포장비 추가 g(x) = x + c
 * A 시스템 = 할인 후 포장비 = g(f(x)) / B 시스템 = 포장비 후 할인 = f(g(x))
 * 비율 할인이면 A − B = r·c (상품 가격 x와 무관), 정액 할인이면 A = B (항상 같음)
 * 학생 화면: src/components/Lesson3CouponStep.tsx
 */

export type CouponKind = 'rate' | 'fixed';

export interface CouponSetting {
  kind: CouponKind;
  /** 비율 할인율(%) */
  ratePct: number;
  /** 정액 할인 금액(원) */
  fixedWon: number;
  /** 포장비(원) */
  feeWon: number;
}

export const COUPON_DEFAULT: CouponSetting = { kind: 'rate', ratePct: 20, fixedWon: 2000, feeWon: 1000 };

/**
 * 실험기 슬라이더 범위. 상품 가격의 최솟값을 정액 할인의 최댓값 이상으로 두어
 * '할인하면 0원 아래' 경우가 생기지 않게 함 (그 경우에는 정액 할인도 순서에 따라 달라짐)
 */
export const COUPON_RANGE = {
  price: { min: 5000, max: 50000, step: 1000 },
  ratePct: { min: 0, max: 50, step: 5 },
  fixedWon: { min: 0, max: 5000, step: 500 },
  feeWon: { min: 0, max: 3000, step: 500 },
} as const;

/** 할인 함수 f — 금액이 음수가 되지 않도록 0원 아래로는 내려가지 않음 */
export function couponDiscount(x: number, s: CouponSetting): number {
  const v = s.kind === 'rate' ? (x * (100 - s.ratePct)) / 100 : x - s.fixedWon;
  return Math.max(0, Math.round(v));
}

/** 포장비 함수 g */
export function couponFee(x: number, s: CouponSetting): number {
  return x + s.feeWon;
}

/** A 시스템 g(f(x)): 할인 후 포장비 추가 */
export function systemA(x: number, s: CouponSetting): number {
  return couponFee(couponDiscount(x, s), s);
}

/** B 시스템 f(g(x)): 포장비 추가 후 전체 할인 */
export function systemB(x: number, s: CouponSetting): number {
  return couponDiscount(couponFee(x, s), s);
}

/** 원 단위 표시 (예: 9000 → "9,000원") */
export function won(n: number): string {
  return `${Math.round(n).toLocaleString('ko-KR')}원`;
}

/** 금액 입력 읽기: 쉼표·'원'·공백 허용 */
export function parseWon(raw?: string): number | null {
  const t = (raw || '').replace(/[,\s원]/g, '');
  if (!t || !/^-?\d+(\.\d+)?$/.test(t)) return null;
  return Number(t);
}

export interface CouponFeedback {
  ok: boolean;
  message: string;
  type: 'good' | 'warn';
}
const warn = (message: string): CouponFeedback => ({ ok: false, message, type: 'warn' });
const good = (message: string): CouponFeedback => ({ ok: true, message, type: 'good' });
const hasReason = (v?: string) => (v || '').trim().length >= 8;

/** 미션 1: 10,000원일 때 A = 9,000원, B = 8,800원, 유리한 쪽 B */
export function validateCouponM1(p: Lesson3State): CouponFeedback {
  if (!p.cp_predict) {
    return warn('먼저 [예상하기]에서 어느 시스템이 유리할지 골라 보세요. 예상은 틀려도 괜찮아요!');
  }
  if (parseWon(p.cp_m1_A) !== 9000) {
    return warn('A 시스템: 10,000원에서 20% 할인하면 8,000원, 여기에 포장비 1,000원을 더해 보세요.');
  }
  if (parseWon(p.cp_m1_B) !== 8800) {
    return warn('B 시스템: 10,000원에 포장비 1,000원을 더한 11,000원 전체에서 20%를 할인해 보세요.');
  }
  if (p.cp_m1_better !== 'B') {
    return warn('A는 9,000원, B는 8,800원입니다. 어느 쪽이 더 적게 내나요?');
  }
  const predicted = p.cp_predict === 'B' ? ' 예상이 맞았어요!' : ' 처음 예상과 비교해 보세요.';
  return good(`[미션 1] 정확합니다! A = 9,000원, B = 8,800원으로 B 시스템이 200원 더 저렴합니다.${predicted}`);
}

/** 미션 2: f(x) = 0.8x, g(x) = x + 1000, A = g(f(x)) = 0.8x + 1000, B = f(g(x)) = 0.8x + 800 */
export function validateCouponM2(p: Lesson3State): CouponFeedback {
  if (!isLinearEqual(p.cp_f, 0.8, 0)) {
    return warn('f는 20% 할인 함수입니다. 가격 x에서 20%를 뺀 금액, 즉 x의 80%를 식으로 써 보세요.');
  }
  if (!isLinearEqual(p.cp_g, 1, 1000)) {
    return warn('g는 포장비 1,000원을 더하는 함수입니다.');
  }
  if (!isLinearEqual(p.cp_A, 0.8, 1000)) {
    if (isLinearEqual(p.cp_A, 0.8, 800)) {
      return warn('A 시스템은 할인(f)을 먼저 하고 포장비(g)를 나중에 더합니다. g(f(x))는 f(x)를 g에 대입한 것이에요.');
    }
    return warn('A 시스템 g(f(x)) = g(0.8x)를 정리해 보세요.');
  }
  if (!isLinearEqual(p.cp_B, 0.8, 800)) {
    if (isLinearEqual(p.cp_B, 0.8, 1000)) {
      return warn('B 시스템은 포장비(g)를 먼저 더한 뒤 전체를 할인(f)합니다. f(g(x)) = 0.8(x + 1000)을 전개해 보세요.');
    }
    return warn('B 시스템 f(g(x)) = f(x + 1000) = 0.8(x + 1000)을 전개해 정리해 보세요.');
  }
  return good('[미션 2] 완벽합니다! A = g(f(x)) = 0.8x + 1000, B = f(g(x)) = 0.8(x + 1000) = 0.8x + 800입니다.');
}

/** 미션 3: 항상 B가 유리 (차이 200원 일정) */
export function validateCouponM3(p: Lesson3State): CouponFeedback {
  if (p.cp_m3_choice !== 'B_always') {
    return warn('결제 실험기에서 상품 가격만 여러 번 바꾸어 보세요. 두 금액의 차이가 어떻게 되나요? 미션 2의 두 식을 빼 보아도 좋아요.');
  }
  if (!isNumberAnswer(p.cp_m3_diff, 200)) {
    return warn('(0.8x + 1000) − (0.8x + 800)을 계산해 보세요. x가 남나요?');
  }
  if (!hasReason(p.cp_m3_reason)) {
    return warn('차이가 상품 가격과 관계없이 일정한 이유를 8자 이상으로 설명해 주세요.');
  }
  return good(
    '[미션 3] 정확합니다! A − B = (0.8x + 1000) − (0.8x + 800) = 200으로 x가 사라지므로, 상품 가격과 관계없이 항상 B가 200원 저렴합니다. B는 포장비 1,000원까지 20% 할인받기 때문이에요.'
  );
}

/** 미션 4: 비율 할인이면 0%·0원일 때만 같음, 정액 할인이면 항상 같음 */
export function validateCouponM4(p: Lesson3State): CouponFeedback {
  if (p.cp_m4_rate !== 'only_zero') {
    return warn('비율 할인에서 할인율과 포장비를 바꾸어 보세요. A − B는 (할인율) × (포장비)입니다. 이 값이 0이 되는 경우는?');
  }
  if (p.cp_m4_fixed !== 'yes') {
    return warn('결제 실험기에서 쿠폰을 [정액 할인]으로 바꾸고 상품 가격·할인 금액·포장비를 여러 번 바꾸어 보세요. A와 B가 다른 경우가 있나요?');
  }
  if (!hasReason(p.cp_m4_reason)) {
    return warn('정액 할인일 때 순서를 바꿔도 결과가 같은 이유를 8자 이상으로 설명해 주세요.');
  }
  return good(
    '[미션 4] 훌륭합니다! 비율 할인은 할인율 0% 또는 포장비 0원일 때만 같아집니다. 정액 할인 f(x) = x − k와 포장비 g(x) = x + c는 g(f(x)) = f(g(x)) = x − k + c로 항상 같아요. 더하고 빼기는 순서를 바꿔도 같지만, 곱하기(비율)와 더하기는 순서에 따라 달라집니다.'
  );
}

/** 교사 화면·인쇄용 한 줄 요약 (입력이 없으면 빈 문자열) */
export function summarizeCoupon(p: Lesson3State): string {
  if (!(p.cp_m1_A || p.cp_f || p.cp_m3_reason || p.cp_m4_reason || p.cp_final)) return '';
  const v = (s?: string) => (s && s.trim() ? s.trim() : '-');
  return (
    `[도전!! 할인 쿠폰] 10,000원: A=${v(p.cp_m1_A)}, B=${v(p.cp_m1_B)} / A=g(f(x))=${v(p.cp_A)}, B=f(g(x))=${v(p.cp_B)}` +
    ` / A−B=${v(p.cp_m3_diff)}: ${v(p.cp_m3_reason)} / 정액 할인: ${v(p.cp_m4_reason)} / 마무리: ${v(p.cp_final)}`
  );
}
