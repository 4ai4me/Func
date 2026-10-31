import test from 'node:test';
import assert from 'node:assert/strict';
import * as C from './lesson3Coupon';
import * as M from './mathLogic';

const rate = (ratePct: number, feeWon: number): C.CouponSetting => ({ ...C.COUPON_DEFAULT, kind: 'rate', ratePct, feeWon });
const fixed = (fixedWon: number, feeWon: number): C.CouponSetting => ({ ...C.COUPON_DEFAULT, kind: 'fixed', fixedWon, feeWon });

test('기본 설정(20%, 1,000원): 10,000원이면 A = 9,000원, B = 8,800원', () => {
  assert.equal(C.systemA(10000, C.COUPON_DEFAULT), 9000);
  assert.equal(C.systemB(10000, C.COUPON_DEFAULT), 8800);
});

test('비율 할인: 가격과 관계없이 A − B = 할인율 × 포장비, 0%·0원일 때만 같다', () => {
  for (const x of [5000, 12000, 37000, 50000]) {
    assert.equal(C.systemA(x, rate(20, 1000)) - C.systemB(x, rate(20, 1000)), 200, `x=${x}`);
    assert.equal(C.systemA(x, rate(30, 2000)) - C.systemB(x, rate(30, 2000)), 600, `x=${x}`);
    assert.equal(C.systemA(x, rate(0, 1000)), C.systemB(x, rate(0, 1000)));
    assert.equal(C.systemA(x, rate(20, 0)), C.systemB(x, rate(20, 0)));
  }
});

test('정액 할인: 실험기 범위 안의 모든 경우에 A = B', () => {
  const R = C.COUPON_RANGE;
  for (let x = R.price.min; x <= R.price.max; x += 7000) {
    for (let k = R.fixedWon.min; k <= R.fixedWon.max; k += R.fixedWon.step) {
      for (let c = R.feeWon.min; c <= R.feeWon.max; c += R.feeWon.step) {
        assert.equal(C.systemA(x, fixed(k, c)), C.systemB(x, fixed(k, c)), `x=${x} k=${k} c=${c}`);
      }
    }
  }
});

test('금액 입력 읽기: 쉼표·원·공백 허용, 숫자가 아니면 null', () => {
  assert.equal(C.parseWon('9,000원'), 9000);
  assert.equal(C.parseWon(' 8800 '), 8800);
  assert.equal(C.parseWon(''), null);
  assert.equal(C.parseWon('구천원'), null);
  assert.equal(C.won(8800), '8,800원');
});

test('예시 학생 답안은 미션 1~4를 모두 통과하고 3차시 5단계가 완료된다', () => {
  const l3 = M.createFuncSampleLessons('complete').l3;
  for (const fn of [C.validateCouponM1, C.validateCouponM2, C.validateCouponM3, C.validateCouponM4]) {
    const r = fn(l3);
    assert.equal(r.ok, true, `${fn.name}: ${r.message}`);
  }
  assert.equal(M.evaluateLevel3Completion(l3)[4], true);
});

test('흔한 오답은 통과하지 못한다', () => {
  const s = M.createFuncSampleLessons('complete').l3;
  assert.equal(C.validateCouponM1({ ...s, cp_predict: '' }).ok, false, '예상 없이');
  assert.equal(C.validateCouponM1({ ...s, cp_m1_A: '8800', cp_m1_B: '9000' }).ok, false, 'A·B 바꿔 씀');
  assert.equal(C.validateCouponM2({ ...s, cp_A: '0.8x+800', cp_B: '0.8x+1000' }).ok, false, '순서 바꿔 씀');
  assert.equal(C.validateCouponM2({ ...s, cp_B: '0.8x+1000' }).ok, false, '포장비 할인 빠뜨림');
  assert.ok(C.validateCouponM2({ ...s, cp_A: '0.8x+1000', cp_B: '0.8x+1000' }).message.includes('전개'));
  assert.equal(C.validateCouponM2({ ...s, cp_f: '0.2x' }).ok, false, '할인 금액을 함수로');
  assert.equal(C.validateCouponM2({ ...s, cp_f: '4/5x', cp_A: '(4/5)x+1000', cp_B: '4/5(x+1000)' }).ok, true, '분수 표기');
  assert.equal(C.validateCouponM3({ ...s, cp_m3_choice: 'depends' }).ok, false);
  assert.equal(C.validateCouponM3({ ...s, cp_m3_diff: '-200' }).ok, false);
  assert.equal(C.validateCouponM4({ ...s, cp_m4_rate: 'some_rate' }).ok, false);
  assert.equal(C.validateCouponM4({ ...s, cp_m4_fixed: 'no' }).ok, false);
});

test('3차시 완료: 예전 4단계만 마친 학생은 5단계가 미완료, 마무리 서술이 짧으면 미완료', () => {
  const s = M.createFuncSampleLessons('complete').l3;
  assert.equal(M.evaluateLevel3Completion({ ...s, cp_final: '짧음' })[4], false);
  assert.equal(M.evaluateLevel3Completion({ ...s, cp_m4Verified: false })[4], false);
  assert.equal(M.evaluateLevel3Completion(M.createInitialStudentState().l3).length, 5);
});
