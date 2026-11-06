import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRat, evalRat, compareRat, parseRatNumber, isRatNumber, hasVarInDenominator, formatRat } from './ratExpr';
import * as L6 from './lesson6Logic';
import * as M from './mathLogic';

// ── 유리식 읽기 ──
test('parseRat: 여러 표기를 읽고 같은 값을 계산한다', () => {
  const at = (s: string, x: number) => {
    const n = parseRat(s);
    assert.ok(n, s);
    return evalRat(n, x);
  };
  assert.equal(at('x/(x+3)', 2), 2 / 5);
  assert.equal(at('y = x/(x+3)', 2), 2 / 5);
  assert.equal(at('1/(x+1)^2', 1), 1 / 4);
  assert.equal(at('1/(x+1)²', 1), 1 / 4);
  assert.equal(at('1 ÷ (x + 1)²', 1), 1 / 4);
  assert.equal(at('(3x−2)/[x(x−1)]', 2), 2);
  // 곱셈 기호를 생략한 곱은 나눗셈보다 먼저
  assert.equal(at('(3x-2)/x(x-1)', 2), 2);
  assert.equal(at('1/3x', 2), 1 / 6);
  assert.equal(at('2*3/x', 2), 3);
  assert.equal(at('-x^2+1', 3), -8);
  assert.ok(Number.isNaN(at('1/(x-1)', 1)), '0으로 나누면 NaN');
});

test('parseRat: 다른 문자·잘못된 식은 읽지 않는다', () => {
  for (const s of ['', '  ', '2x+y', '(x+1', 'x/', '1..2', 'x^a', '√x', 'x^x']) {
    assert.equal(parseRat(s), null, s);
  }
});

test('compareRat: 값이 같으면 인정하고, 약분이 덜 된 식은 구분한다', () => {
  for (const s of ['(3x-2)/(x(x-1))', '(3x-2)/(x^2-x)', '(3x - 2)/(x² − x)', '(2-3x)/(x-x^2)', '(3x-2)/x(x-1)']) {
    assert.equal(compareRat(s, '(3x-2)/(x(x-1))'), 'equal', s);
  }
  assert.equal(compareRat('(3x-2)/(x+1)', '(3x-2)/(x(x-1))'), 'different');
  assert.equal(compareRat('3x-2/x(x-1)', '(3x-2)/(x(x-1))'), 'different', '분자 괄호 빠짐');
  assert.equal(compareRat('1/(x+1)', '1/(x+1)^2'), 'different');
  assert.equal(compareRat('x(x-1)/(x(x+1)^2(x-1))', '1/(x+1)^2', [0, 1]), 'notSimplified');
  assert.equal(compareRat('abc', '1/(x+1)^2'), 'unreadable');
  assert.equal(compareRat('', '1/(x+1)^2'), 'unreadable');
});

test('parseRatNumber: 정의역에서 빠지는 값 읽기', () => {
  assert.equal(parseRatNumber('5'), 5);
  assert.equal(parseRatNumber('x≠5'), 5);
  assert.equal(parseRatNumber('x ≠ -1/3'), -1 / 3);
  assert.equal(parseRatNumber('−1/3'), -1 / 3);
  assert.equal(parseRatNumber('x'), null);
  assert.equal(parseRatNumber(''), null);
  assert.ok(isRatNumber('36', 36));
  assert.ok(!isRatNumber('36W', 36));
});

test('formatRat: 한 줄 글자로 나타낸다', () => {
  assert.equal(formatRat(parseRat('(3x-2)/(x(x-1))')!), '(3x − 2)/(x(x − 1))');
  assert.equal(formatRat(parseRat('1/(x+1)^2')!), '1/(x + 1)²');
});

// ── 6차시 문항 자료 ──
test('6차시 문항 자료: 모든 식이 읽히고, 다항식 구분이 분모의 문자와 일치한다', () => {
  assert.ok(L6.l6ExpressionsReadable());
  for (const e of L6.L6_P1_EXPRS) {
    assert.equal(hasVarInDenominator(parseRat(e.raw)!), !e.isPoly, e.label);
  }
  assert.deepEqual([...L6.L6_P1_ANSWER], [0, 2, 3]);
});

test('6차시 계산 문제: 정답 식은 문제 식과 값이 같고, 문제 식 그대로는 정답이 아니다', () => {
  for (const [key, item] of Object.entries(L6.L6_CALC)) {
    // 정답 식 자체는 equal
    assert.equal(L6.checkL6Calc(key as L6.L6CalcKey, item.answer), 'equal', key);
    // 문제 식과 정답 식은 같은 값 (약분 전 식은 약분 지점에서 계산되지 않음)
    const q = parseRat(item.question)!;
    const a = parseRat(item.answer)!;
    for (const x of [-4.37, -0.83, 0.77, 2.89, 5.19]) {
      assert.ok(Math.abs(evalRat(q, x) - evalRat(a, x)) < 1e-9, `${key} x=${x}`);
    }
  }
  // 약분 전(곱한 채 그대로) 식은 notSimplified
  assert.equal(L6.checkL6Calc('ex1_2', L6.L6_CALC.ex1_2.question), 'notSimplified');
  assert.equal(L6.checkL6Calc('p2_2', L6.L6_CALC.p2_2.question), 'notSimplified');
  // 전개한 모양도 정답
  assert.equal(L6.checkL6Calc('p2_1', '(x+2)/(x^2-1)'), 'equal');
  assert.equal(L6.checkL6Calc('p2_2', '1/(x^2-2x)'), 'equal');
  assert.equal(L6.checkL6Calc('ex1_2', '1/(x^2+2x+1)'), 'equal');
  // 흔한 오답
  assert.equal(L6.checkL6Calc('ex1_1', '3/(2x-1)'), 'different', '분자끼리·분모끼리 더함');
  assert.equal(L6.checkL6Calc('p2_1', '(x-2)/(x^2-1)'), 'different', '−2(x−1) 부호 실수');
  assert.equal(L6.checkL6Calc('p2_2', '1/(x(x+2))'), 'different');
});

// ── 채점 함수 ──
const sample = () => M.createFuncSampleLessons('complete').l5;

test('6차시 예시 답안(complete)은 채점 5개를 모두 통과하고 5단계 완료', () => {
  const p = sample();
  for (const fn of [L6.validateL6Open, L6.validateL6Prob1, L6.validateL6Ex1, L6.validateL6Prob2, L6.validateL6Prob3]) {
    const r = fn(p);
    assert.ok(r.ok, r.message);
  }
  assert.deepEqual(M.evaluateLevel6Completion(p), [true, true, true, true, true]);
  assert.deepEqual(M.evaluateRubricL6(p), [true, true, true, true, true]);
});

test('6차시 빈 답안은 모두 통과하지 못하고 단계 완료 없음', () => {
  const p = M.createInitialStudentState().l5;
  for (const fn of [L6.validateL6Open, L6.validateL6Prob1, L6.validateL6Ex1, L6.validateL6Prob2, L6.validateL6Prob3]) {
    assert.equal(fn(p).ok, false);
  }
  assert.deepEqual(M.evaluateLevel6Completion(p), [false, false, false, false, false]);
});

test('6차시 흔한 오답을 거절한다', () => {
  const p = sample();
  assert.equal(L6.validateL6Open({ ...p, openCopper: 'x/3' }).ok, false);
  assert.equal(L6.validateL6Open({ ...p, openCopperKind: 'poly' }).ok, false);
  assert.equal(L6.validateL6Open({ ...p, openP8: '72' }).ok, false);
  assert.equal(L6.validateL6Open({ ...p, openTrend: 'up' }).ok, false);
  assert.equal(L6.validateL6Prob1({ ...p, p1Picks: [0, 1, 2, 3] }).ok, false, '(x−2)/3 포함');
  assert.equal(L6.validateL6Prob1({ ...p, p1Picks: [0, 2, 3, 4] }).ok, false, 'x²+1/2 포함');
  assert.equal(L6.validateL6Prob1({ ...p, p1Picks: [0, 2] }).ok, false, '하나 빠짐');
  assert.equal(L6.validateL6Prob1({ ...p, p1Reason: '다항식' }).ok, false, '이유 짧음');
  const notSimplified = L6.validateL6Prob2({ ...p, p2_2: '(x+2)(x+3)/(x(x+3)(x+2)(x-2))' });
  assert.equal(notSimplified.ok, false);
  assert.match(notSimplified.message, /약분/);
  assert.equal(L6.validateL6Prob3({ ...p, p3_1: '-5' }).ok, false);
  assert.equal(L6.validateL6Prob3({ ...p, p3_2: '1/3' }).ok, false);
  assert.ok(L6.validateL6Prob3({ ...p, p3_1: 'x≠5', p3_2: 'x ≠ −1/3' }).ok, 'x≠ 형식도 인정');
});

test('예전 절대부등식 기록만으로는 6차시가 완료되지 않는다', () => {
  const s = M.createSampleTeacherDataset()[0];
  // 예시 데이터를 새 6차시 항목 없이(예전 항목만) 만든 경우
  const legacy: M.Lesson5State = {
    ...M.createInitialStudentState().l5,
    examples: [
      { a: 1, b: 2, lhs: 5, rhs: 2, diff: 3, isEqual: false },
      { a: 1, b: 1, lhs: 2, rhs: 1, diff: 1, isEqual: false },
      { a: 0, b: 0, lhs: 0, rhs: 0, diff: 0, isEqual: true },
    ],
    squareConceptChoice: 'nonnegative',
    prob1Verified: [true, true, true, true],
    prob1ProofText: '가'.repeat(40),
    equalityConditionChecked: true,
    equalityReason: '가'.repeat(20),
    prob2Verified: [true, true, true, true],
    prob2ProofText: '가'.repeat(45),
    reflection1: '가'.repeat(25),
    reflection2: '가'.repeat(20),
  };
  assert.deepEqual(M.evaluateLevel6Completion(legacy), [false, false, false, false, false]);
  assert.ok(s.l5, '예시 학생에 6차시 칸이 있음');
});

test('6차시 저장·불러오기: 새 항목과 예전 항목을 모두 보존하고, 없던 항목은 새로 붙이지 않는다', () => {
  const s = M.createInitialStudentState();
  s.l5 = { ...sample(), prob1ProofText: '예전 증명', reflection1: '예전 성찰' };
  const back = M.cleanStudentState(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(back.l5.p1Picks, [0, 2, 3]);
  assert.equal(back.l5.ex1_2, '1/(x+1)^2');
  assert.equal(back.l5.ratReflection1, s.l5.ratReflection1);
  assert.equal(back.l5.prob1ProofText, '예전 증명');
  assert.equal(back.l5.reflection1, '예전 성찰');

  // 잘못된 고른 번호는 걸러냄
  const bad = JSON.parse(JSON.stringify(s));
  bad.l5.p1Picks = [3, 0, 0, 9, -1, 'x', 2.5];
  assert.deepEqual(M.cleanStudentState(bad).l5.p1Picks, [0, 3]);

  // 예전 기록(새 항목 없음)을 불러와도 p1Picks·ratHelpSource를 새로 만들지 않음
  const old = M.createInitialStudentState();
  const oldBack = M.cleanStudentState(JSON.parse(JSON.stringify(old)));
  assert.equal('p1Picks' in oldBack.l5 && oldBack.l5.p1Picks !== undefined, false);
  assert.equal(oldBack.l5.ratHelpSource, undefined);
});

test('6차시 교사용 요약', () => {
  assert.equal(L6.summarizeL6(M.createInitialStudentState().l5), '');
  const text = L6.summarizeL6(sample());
  assert.match(text, /\[생각 열기\] R=4 → P=36/);
  assert.match(text, /\[문제 1\] 고른 식: 2\/\(x \+ 5\), 1\/4 − 1\/x, \(2x − 1\)\/\(x² \+ x\)/);
  assert.match(text, /\[문제 3\] \(1\) x ≠ 5 \(2\) x ≠ -1\/3/);
});

test('교사 문항 상태(6차시, 묶음 l5): 확인 완료·점검·오답·미작성을 구분한다', async () => {
  const { getQuestionStatus } = await import('./questionStatus');
  const { findUnlabeledFields } = await import('../components/FullAnswerPanel');
  const p = sample();
  assert.equal(getQuestionStatus('l5', 'p2Verified', p)?.status, 'done');
  const unchecked = { ...p, p2Verified: false };
  assert.equal(getQuestionStatus('l5', 'p2Verified', unchecked)?.status, 'unchecked');
  const shortReason = { ...p, p2Verified: false, p2Reason: '약분' };
  assert.match(getQuestionStatus('l5', 'p2Verified', shortReason)?.note ?? '', /이유 서술 부족/);
  const wrong = { ...p, p2Verified: false, p2_2: '1/(x(x+2))' };
  assert.equal(getQuestionStatus('l5', 'p2Verified', wrong)?.status, 'wrong');
  const empty = M.createInitialStudentState().l5;
  assert.equal(getQuestionStatus('l5', 'p1Verified', empty)?.status, 'empty');
  // 예시 답안의 모든 항목에 이름표가 있음 (기타 기록에 섞이지 않음)
  assert.deepEqual(findUnlabeledFields('l5', p), []);
});
