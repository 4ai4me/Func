import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRat, evalRat, isRatNumber } from './ratExpr';
import * as L7 from './lesson7Logic';
import * as M from './mathLogic';

const sample = () => M.createFuncSampleLessons('complete').l6;
const VALIDATORS = [L7.validateL7Together, L7.validateL7Prob4, L7.validateL7Think, L7.validateL7Prob5, L7.validateL7Ex2, L7.validateL7Prob6];

test('7차시 문항 자료: 변형한 식 k/(x − p) + q가 원래 식과 값이 같다', () => {
  for (const t of [L7.L7_EX2, ...L7.L7_P6]) {
    const orig = parseRat(t.raw);
    assert.ok(orig, t.raw);
    for (const x of [-4.37, -0.83, 0.77, 2.21, 5.19]) {
      assert.ok(Math.abs(evalRat(orig, x) - L7.rationalValue(t.fn, x)) < 1e-9, `${t.label} x=${x}`);
    }
  }
  // 문제 4의 식과 k
  for (const f of L7.L7_P4) {
    const n = parseRat(f.raw)!;
    assert.ok(Math.abs(evalRat(n, 1) - f.k) < 1e-12, f.label);
  }
});

test('rationalLabel: 식을 읽기 쉬운 글자로', () => {
  assert.equal(L7.rationalLabel({ k: -3, p: -1, q: 2 }), 'y = −3/(x + 1) + 2');
  assert.equal(L7.rationalLabel({ k: 2, p: 1, q: -5 }), 'y = 2/(x − 1) − 5');
  assert.ok(Number.isNaN(L7.rationalValue({ k: 1, p: 2, q: 0 }, 2)));
});

test('그래프 확인용 함수는 채점 정답과 같다', () => {
  assert.deepEqual(L7.L7_GRAPH_SETS.ex2[0].fn, L7.L7_EX2.fn);
  assert.deepEqual(L7.L7_GRAPH_SETS.p6.map((g) => g.fn), L7.L7_P6.map((t) => t.fn));
  assert.deepEqual(L7.L7_GRAPH_SETS.p5.map((g) => g.fn), [...L7.L7_P5]);
  assert.deepEqual(L7.L7_GRAPH_SETS.p4.map((g) => g.fn.k), L7.L7_P4.map((f) => f.k));
});

test('7차시 예시 답안(complete)은 채점 6개를 모두 통과하고 5단계 완료', () => {
  const p = sample();
  for (const fn of VALIDATORS) {
    const r = fn(p);
    assert.ok(r.ok, r.message);
  }
  assert.deepEqual(M.evaluateLevel7Completion(p), [true, true, true, true, true]);
  assert.deepEqual(M.evaluateRubricL7(p), [true, true, true, true, true]);
});

test('7차시 빈 답안은 모두 통과하지 못하고 단계 완료 없음', () => {
  const p = M.createInitialStudentState().l6;
  for (const fn of VALIDATORS) assert.equal(fn(p).ok, false);
  assert.deepEqual(M.evaluateLevel7Completion(p), [false, false, false, false, false]);
});

test('7차시 흔한 오답을 거절하고, 여러 표기는 인정한다', () => {
  const p = sample();
  assert.equal(L7.validateL7Together({ ...p, tgNegQuad: '13' }).ok, false);
  assert.equal(L7.validateL7Together({ ...p, tgAbsTrend: 'near' }).ok, false);
  assert.equal(L7.validateL7Together({ ...p, tgReason: '멀어짐' }).ok, false, '이유 짧음');
  assert.equal(L7.validateL7Prob4({ ...p, p4q3: '24' }).ok, false);
  assert.equal(L7.validateL7Prob4({ ...p, p4v3: '4' }).ok, false, '1/(4x)에서 x=1 → 1/4');
  assert.ok(L7.validateL7Prob4({ ...p, p4v3: '0.25', p4v4: '-0.25' }).ok, '소수 인정');
  assert.equal(L7.validateL7Think({ ...p, thinkSymX: '0', thinkSymY: '0' }).ok, false);
  assert.ok(L7.validateL7Think({ ...p, thinkSymX: ' P', thinkSymY: 'Q ' }).ok, '대문자·공백 인정');
  assert.equal(L7.validateL7Prob5({ ...p, p5_1x: '-1' }).ok, false, '부호 반대');
  assert.equal(L7.validateL7Prob5({ ...p, p5_2y: '2' }).ok, false);
  assert.ok(L7.validateL7Prob5({ ...p, p5_1x: 'x=1', p5_1y: 'y = -5' }).ok, 'x=·y= 형식 인정');
  assert.equal(L7.validateL7Ex2({ ...p, ex2p: '1' }).ok, false, 'x + 1 = x − (−1) 부호');
  assert.equal(L7.validateL7Ex2({ ...p, ex2k: '3' }).ok, false);
  assert.match(L7.validateL7Ex2({ ...p, ex2ay: '-3' }).message, /점근선/);
  assert.equal(L7.validateL7Prob6({ ...p, p6_2q: '3' }).ok, false);
  assert.equal(L7.validateL7Prob6({ ...p, p6Reason: '나눔' }).ok, false, '이유 짧음');
  assert.ok(isRatNumber('y=-5', -5));
});

test('예전 절대부등식2 기록만으로는 7차시가 완료되지 않는다', () => {
  const legacy: M.Lesson6State = {
    ...M.createInitialStudentState().l6,
    amgmConceptChoice: 'positive',
    prob1Verified: [true, true, true, true],
    prob1ProofText: '가'.repeat(40),
    harmonicChecked: true,
    harmonicReason: '가'.repeat(20),
    prob2Verified: [true, true, true, true],
    prob2ProofText: '가'.repeat(45),
    reflection1: '가'.repeat(25),
    reflection2: '가'.repeat(20),
  };
  assert.deepEqual(M.evaluateLevel7Completion(legacy), [false, false, false, false, false]);
});

test('7차시 저장·불러오기: 새 항목과 예전 항목을 모두 보존하고, 없던 항목은 새로 붙이지 않는다', () => {
  const s = M.createInitialStudentState();
  s.l6 = { ...sample(), prob1ProofText: '예전 증명', reflection1: '예전 성찰', rgHelpSource: 'hint' };
  const back = M.cleanStudentState(JSON.parse(JSON.stringify(s)));
  assert.equal(back.l6.ex2k, '-3');
  assert.equal(back.l6.p4q4, '24');
  assert.equal(back.l6.rgHelpSource, 'hint');
  assert.equal(back.l6.prob1ProofText, '예전 증명');
  assert.equal(back.l6.reflection1, '예전 성찰');
  const bad = JSON.parse(JSON.stringify(s));
  bad.l6.rgHelpSource = 'nonsense';
  assert.equal(M.cleanStudentState(bad).l6.rgHelpSource, '');
  const oldBack = M.cleanStudentState(JSON.parse(JSON.stringify(M.createInitialStudentState())));
  assert.equal(oldBack.l6.rgHelpSource, undefined);
});

test('7차시 교사용 요약과 문항 상태', async () => {
  const { getQuestionStatus } = await import('./questionStatus');
  const { findUnlabeledFields } = await import('../components/FullAnswerPanel');
  assert.equal(L7.summarizeL7(M.createInitialStudentState().l6), '');
  const text = L7.summarizeL7(sample());
  assert.match(text, /\[함께하기\] k>0: 1·3사분면, k<0: 2·4사분면, \|k\|↑: 원점에서 멀어짐/);
  assert.match(text, /\[문제 5\] \(1\) x=1, y=-5/);
  assert.match(text, /예제 2: k=-3, p=-1, q=2/);

  const p = sample();
  assert.equal(getQuestionStatus('l6', 'ex2Verified', p)?.status, 'done');
  assert.equal(getQuestionStatus('l6', 'ex2Verified', { ...p, ex2Verified: false })?.status, 'unchecked');
  assert.equal(getQuestionStatus('l6', 'ex2Verified', { ...p, ex2Verified: false, ex2p: '1' })?.status, 'wrong');
  assert.match(getQuestionStatus('l6', 'p6Verified', { ...p, p6Verified: false, p6Reason: '' })?.note ?? '', /이유 서술 부족/);
  assert.equal(getQuestionStatus('l6', 'p4Verified', M.createInitialStudentState().l6)?.status, 'empty');
  assert.deepEqual(findUnlabeledFields('l6', p), []);
});
