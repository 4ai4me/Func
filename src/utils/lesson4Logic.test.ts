import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLinear, isLinearEqual, isNumberAnswer } from './linearExpr';
import * as L4 from './lesson4Logic';
import * as M from './mathLogic';

// ── 일차식 읽기 ──
test('parseLinear: 같은 일차식을 여러 표기로 써도 같은 계수로 읽는다', () => {
  const third = [1 / 3, -4 / 3];
  for (const s of ['1/3x-4/3', 'y = 1/3x − 4/3', '(1/3)x - 4/3', 'x/3 - 4/3', '(x-4)/3', '1/3*x-4/3', 'f⁻¹(x) = (x − 4) ÷ 3']) {
    const v = parseLinear(s);
    assert.ok(v, s);
    assert.ok(Math.abs(v.a - third[0]) < 1e-9 && Math.abs(v.b - third[1]) < 1e-9, s);
  }
  assert.ok(isLinearEqual('5/9(x-32)', 5 / 9, -160 / 9));
  assert.ok(isLinearEqual('5/9x - 160/9', 5 / 9, -160 / 9));
  assert.ok(isLinearEqual('-3x+9', -3, 9));
  assert.ok(isLinearEqual('9 - 3x', -3, 9));
  assert.ok(isLinearEqual('x = (y-4)/3', 1 / 3, -4 / 3, 'y'));
  assert.ok(isLinearEqual('0.2x+0.4', 1 / 5, 2 / 5));
});

test('parseLinear: 일차식이 아니거나 다른 문자가 섞이면 읽지 않는다', () => {
  for (const s of ['x^2+1', 'x²', 'x*x', '1/x', '2x+y', '', '   ', '3x+', '(x+1', 'x/0', '1..2x']) {
    assert.equal(parseLinear(s), null, s);
  }
  assert.equal(isLinearEqual('3x+4', 1 / 3, -4 / 3), false);
  // 변수를 y로 요구하는데 x로 쓰면 오답
  assert.equal(isLinearEqual('1/3x-4/3', 1 / 3, -4 / 3, 'y'), false);
});

test('isNumberAnswer: 단위가 붙어도 숫자만 비교한다', () => {
  assert.ok(isNumberAnswer('35', 35));
  assert.ok(isNumberAnswer('35℃', 35));
  assert.ok(isNumberAnswer(' 35 °C', 35));
  assert.ok(isNumberAnswer('−1', -1));
  assert.equal(isNumberAnswer('3x', 3), false);
  assert.equal(isNumberAnswer('', 0), false);
  assert.equal(isNumberAnswer('36', 35), false);
});

// ── 문항 채점 ──
const blank = () => M.createInitialStudentState().l4;
const sample = () => M.createFuncSampleLessons('complete').l4;

test('예시 학생(complete)의 4차시 답안은 모든 채점 함수를 통과하고 5단계가 모두 완료된다', () => {
  const s = sample();
  for (const fn of [
    L4.validateL4Open,
    L4.validateL4Prob1,
    L4.validateL4Ex1,
    L4.validateL4Prob2,
    L4.validateL4Prob5,
    L4.validateL4Together,
    L4.validateL4Prob3,
    L4.validateL4Prob4,
    L4.validateL4Tool,
  ]) {
    const r = fn(s);
    assert.equal(r.ok, true, `${fn.name}: ${r.message}`);
  }
  assert.deepEqual(M.evaluateLevel4Completion(s), [true, true, true, true, true]);
  assert.deepEqual(M.evaluateRubricL4(s), [true, true, true, true, true]);
  // partial: 생각 열기만
  assert.deepEqual(M.evaluateLevel4Completion(M.createFuncSampleLessons('partial').l4), [true, false, false, false, false]);
});

test('빈 답안은 모든 채점 함수에서 통과하지 못한다', () => {
  const s = blank();
  for (const fn of [
    L4.validateL4Open,
    L4.validateL4Prob1,
    L4.validateL4Ex1,
    L4.validateL4Prob2,
    L4.validateL4Prob5,
    L4.validateL4Together,
    L4.validateL4Prob3,
    L4.validateL4Prob4,
    L4.validateL4Tool,
  ]) {
    assert.equal(fn(s).ok, false, fn.name);
  }
});

test('생각 열기: 뒤집은 대응이 틀리거나 조건 선택이 틀리면 통과하지 못한다', () => {
  const s = sample();
  assert.equal(L4.validateL4Open({ ...s, openReverseMap: { ...s.openReverseMap, CH4: '이산화 탄소' } }).ok, false);
  assert.equal(L4.validateL4Open({ ...s, openReverseIsFunc: 'no' }).ok, false);
  assert.equal(L4.validateL4Open({ ...s, openConditionChoice: 'oneToOne' }).ok, false);
  assert.equal(L4.validateL4Open({ ...s, openDomainRangeSame: 'no' }).ok, false);
  assert.equal(L4.validateL4Open({ ...s, openReason: '짧음' }).ok, false);
  // 정답 대응은 원래 대응을 정확히 뒤집은 것
  for (const [gas, formula] of Object.entries(L4.L4_GAS_TO_FORMULA)) {
    assert.equal(L4.L4_FORMULA_TO_GAS[formula], gas);
  }
});

test('문제 1: 3을 7이 아닌 곳에 연결하면(일대일대응 아님) 통과하지 못한다', () => {
  const s = sample();
  for (const y of ['1', '3', '5']) assert.equal(L4.validateL4Prob1({ ...s, p1_f3: y }).ok, false, y);
  assert.equal(L4.validateL4Prob1({ ...s, p1_4: '2' }).ok, false);
});

test('역함수 구하기·함께하기·그래프: 다른 표기의 정답은 인정하고 흔한 오답은 거절한다', () => {
  const s = sample();
  assert.equal(L4.validateL4Ex1({ ...s, ex1_solveX: 'x=(y-4)/3', ex1_ans: 'y=(x-4)/3' }).ok, true);
  assert.equal(L4.validateL4Ex1({ ...s, ex1_ans: 'y=3x+4' }).ok, false); // 원래 함수 그대로
  assert.equal(L4.validateL4Ex1({ ...s, ex1_solveX: '1/3x-4/3' }).ok, false); // x에 대하여 풀지 않고 이미 바꾼 식
  assert.equal(L4.validateL4Prob2({ ...s, p2_1: '(1-x)/3', p2_2: '4(x-2)' }).ok, true);
  assert.equal(L4.validateL4Prob2({ ...s, p2_1: '1/3x+1/3' }).ok, false); // 부호 실수
  assert.equal(L4.validateL4Prob5({ ...s, p5_inv: '5/9x-160/9', p5_celsius: '35℃' }).ok, true);
  assert.equal(L4.validateL4Prob5({ ...s, p5_inv: '5/9x-32' }).ok, false); // 괄호 빠뜨림
  assert.equal(L4.validateL4Together({ ...s, tg_relation: 'neq' }).ok, false);
  assert.equal(L4.validateL4Together({ ...s, tg_gfInv: 'x/2-1', tg_result: '(x-2)/2' }).ok, true);
  assert.equal(L4.validateL4Prob3({ ...s, p3_ans: '1' }).ok, false); // (g∘f)(3)=1을 답으로 쓴 경우
  assert.equal(L4.validateL4Prob4({ ...s, p4_1_inv: '(x+2)/5', p4_2_inv: '9-3x' }).ok, true);
  assert.equal(L4.validateL4Prob4({ ...s, p4_2_inv: '-1/3x+3' }).ok, false);
  assert.equal(L4.validateL4Tool({ ...s, toolParallelA: '-1' }).ok, false);
  assert.equal(L4.validateL4Tool({ ...s, toolSameA: '1' }).ok, false);
});

test('4차시 완료 판정은 예전 귀류법 기록으로는 완료되지 않는다', () => {
  const s = blank();
  s.prob1Verified = [true, true, true, true];
  s.prob1ProofText = '가'.repeat(50);
  s.prob2Verified = [true, true, true, true];
  s.prob2ProofText = '가'.repeat(50);
  s.reflection1 = '가'.repeat(30);
  s.reflection2 = '가'.repeat(30);
  assert.deepEqual(M.evaluateLevel4Completion(s), [false, false, false, false, false]);
});

test('저장·불러오기: 새 4차시 항목이 보존되고, 예전 귀류법 항목도 지워지지 않는다', () => {
  const rec = M.createInitialStudentState();
  rec.l4 = { ...sample(), prob1ProofText: '예전 귀류법 기록' };
  const cleaned = M.cleanStudentState(JSON.parse(JSON.stringify(rec)));
  assert.deepEqual(cleaned.l4.openReverseMap, rec.l4.openReverseMap);
  assert.equal(cleaned.l4.p5_inv, rec.l4.p5_inv);
  assert.equal(cleaned.l4.toolVerified, true);
  assert.equal(cleaned.l4.prob1ProofText, '예전 귀류법 기록');
  // 손상된 대응 기록은 빈 대응으로
  const broken = JSON.parse(JSON.stringify(rec));
  broken.l4.openReverseMap = ['x'];
  assert.equal(M.cleanStudentState(broken).l4.openReverseMap, undefined);
  const odd = JSON.parse(JSON.stringify(rec));
  odd.l4.openReverseMap = { CH4: '메테인', CO2: 3 };
  assert.deepEqual(M.cleanStudentState(odd).l4.openReverseMap, { CH4: '메테인' });
});

test('기기 간 합치기: 한쪽에만 새 4차시 답이 있으면 그 쪽을 고른다', () => {
  const withAnswers = M.createInitialStudentState();
  withAnswers.l4 = { ...withAnswers.l4, p1_f3: '7' };
  withAnswers.updatedAt = '2026-10-30T00:00:00.000Z';
  const empty = M.createInitialStudentState();
  empty.updatedAt = '2026-10-31T00:00:00.000Z'; // 더 최근이지만 비어 있음
  assert.equal(M.mergeStudentStates(empty, withAnswers).l4.p1_f3, '7');
  assert.equal(M.mergeStudentStates(withAnswers, empty).l4.p1_f3, '7');
});

test('교사용 요약: 입력이 없으면 빈 문자열, 있으면 문항별 답을 포함', () => {
  assert.deepEqual(L4.summarizeL4(blank()), { part1: '', part2: '' });
  const sum = L4.summarizeL4(sample());
  assert.match(sum.part1, /\[생각 열기\]/);
  assert.match(sum.part1, /f\(3\)=7/);
  assert.match(sum.part2, /95℉ = 35℃/);
  assert.match(sum.part2, /일치 a=-1/);
});

test('formatLinear: 읽은 식을 분수로 보여 준다', async () => {
  const { formatLinear } = await import('./linearExpr');
  assert.equal(formatLinear({ a: 1 / 3, b: -4 / 3 }), '(1/3)x − 4/3');
  assert.equal(formatLinear({ a: -3, b: 9 }), '−3x + 9');
  assert.equal(formatLinear({ a: 1, b: 0 }), 'x');
  assert.equal(formatLinear({ a: 0, b: -2 }), '−2');
  assert.equal(formatLinear({ a: 5 / 9, b: -160 / 9 }), '(5/9)x − 160/9');
});
