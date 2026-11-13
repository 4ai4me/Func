import test from 'node:test';
import assert from 'node:assert/strict';
import { parseIrr, evalIrr, compareIrr, hasVarRoot, hasRootInDenominator } from './irrExpr';
import * as L8 from './lesson8Logic';
import * as M from './mathLogic';

const sample = () => M.createFuncSampleLessons('complete').l7;
const VALIDATORS = [
  L8.validateL8Open,
  L8.validateL8Prob1,
  L8.validateL8Ex1,
  L8.validateL8Prob2,
  L8.validateL8Prob3,
  L8.validateL8Sqrt,
  L8.validateL8Prob4,
  L8.validateL8Prob5,
  L8.validateL8Prob6,
  L8.validateL8Ex2,
  L8.validateL8Prob7,
];

test('무리식 읽기: 여러 표기와 √ 덩어리 규칙', () => {
  const at = (s: string, x: number) => evalIrr(parseIrr(s)!, x);
  assert.equal(at('√(x+1)', 3), 2);
  assert.equal(at('sqrt(x+1)', 3), 2);
  assert.equal(at('√x+1', 4), 3, '괄호 없는 √x + 1');
  assert.equal(at('√2x', 8), 4, '√2x = √(2x)');
  assert.equal(at('2√x', 9), 6);
  assert.equal(at('y = (√(x+2) − √x)/2', 2), 1 - Math.sqrt(2) / 2);
  assert.ok(Number.isNaN(at('√(x-5)', 1)), '근호 안이 음수면 값 없음');
  assert.equal(parseIrr('√'), null);
  assert.equal(parseIrr('√(x+1'), null);
  assert.equal(parseIrr('a+1'), null);
});

test('무리식 비교·근호 남음·분모 유리화 판별', () => {
  assert.equal(compareIrr('x - 3', 'x-3'), 'equal');
  assert.equal(compareIrr('-3+x', 'x-3'), 'equal');
  assert.equal(compareIrr('x+3', 'x-3'), 'different');
  assert.equal(compareIrr('', 'x-3'), 'unreadable');
  assert.ok(hasVarRoot(parseIrr('(√(x+1))^2-4')!));
  assert.ok(!hasVarRoot(parseIrr('x-3')!));
  assert.ok(!hasVarRoot(parseIrr('√2*x')!), '근호 안에 x가 없으면 무리식이 아님');
  assert.ok(hasRootInDenominator(parseIrr('1/(√(x+2)+√x)')!));
  assert.ok(!hasRootInDenominator(parseIrr('(√(x+2)-√x)/2')!));
});

test('8차시 문항 자료: 정답 식이 원래 식과 값이 같다', () => {
  const pairs: [string, string][] = [
    ['(√(x+1)+2)(√(x+1)-2)', L8.L8_EX1[0].answer],
    ['1/(√(x+2)+√x)', L8.L8_EX1[1].answer],
    ['(√(x+3)+√x)(√(x+3)-√x)', L8.L8_P2[0].answer],
    ['2/(√(x+1)-√(x-1))', L8.L8_P2[1].answer],
  ];
  for (const [orig, ans] of pairs) assert.equal(compareIrr(orig, ans), 'equal', orig);
  // 변형한 식 ±√(a(x − p)) + q가 원래 식과 같다
  const originals: [string, L8.IrrFn][] = [
    ['√(2x+8)+2', L8.L8_EX2.fn],
    ['√(-3x+3)-2', L8.L8_P7[0].fn],
    ['-√(-x+4)+5', L8.L8_P7[1].fn],
    ['√(-(x-5))+1', L8.L8_P6[0].fn],
    ['-√(5(x+2))-1', L8.L8_P6[1].fn],
  ];
  for (const [raw, fn] of originals) {
    const n = parseIrr(raw)!;
    for (const x of [-6, -3.5, -2, 0, 0.5, 1, 3, 4, 5, 7]) {
      const a = evalIrr(n, x);
      const b = L8.irrValue(fn, x);
      assert.ok((Number.isNaN(a) && Number.isNaN(b)) || Math.abs(a - b) < 1e-9, `${raw} x=${x}`);
    }
  }
  assert.ok(Math.abs(L8.typhoonSpeed(949) - 50.4) < 1e-9);
});

test('irrLabel·정의역·치역 글자', () => {
  assert.equal(L8.irrLabel({ s: -1, a: 5, p: -2, q: -1 }), 'y = −√(5(x + 2)) − 1');
  assert.equal(L8.irrLabel({ s: 1, a: -1, p: 5, q: 1 }), 'y = √(−(x − 5)) + 1');
  assert.equal(L8.irrLabel({ s: 1, a: 1, p: 0, q: 0 }), 'y = √x');
  assert.equal(L8.irrLabel({ s: 1, a: 2, p: 0, q: 0 }), 'y = √(2x)');
  assert.equal(L8.irrDomainText(L8.L8_P7[0].fn), '{x | x ≤ 1}');
  assert.equal(L8.irrRangeText(L8.L8_P7[1].fn), '{y | y ≤ 5}');
});

test('부등식 답: 입력 글자 만들기·읽기·확인', () => {
  assert.equal(L8.composeIneq('x', '≥', '3/2'), 'x ≥ 3/2');
  assert.equal(L8.composeIneq('x', '', '3'), 'x □ 3');
  assert.equal(L8.composeIneq('y', '', ''), '');
  assert.deepEqual(L8.parseIneq('x ≥ 3/2'), { v: 'x', op: '≥', num: '3/2' });
  assert.deepEqual(L8.parseIneq('x □ 3'), { v: 'x', op: '', num: '3' });
  assert.equal(L8.checkIneq('x ≥ 1.5', '≥', 1.5), 'ok', '소수도 인정');
  assert.equal(L8.checkIneq('x > 3/2', '≥', 1.5), 'equality');
  assert.equal(L8.checkIneq('x ≤ 3/2', '≥', 1.5), 'direction');
  assert.equal(L8.checkIneq('x ≥ 2', '≥', 1.5), 'value');
  assert.equal(L8.checkIneq('x □ 2', '≥', 1.5), 'noOp');
  assert.equal(L8.checkIneq('', '≥', 1.5), 'empty');
});

test('8차시 예시 답안(complete)은 채점을 모두 통과하고 8단계 완료', () => {
  const p = sample();
  for (const fn of VALIDATORS) assert.equal(fn(p).ok, true, `${fn.name}: ${fn(p).message}`);
  assert.deepEqual(M.evaluateLevel8Completion(p), new Array(8).fill(true));
  assert.equal(M.STAGE_TITLES[8].length, 8);
});

test('빈 답안은 채점을 통과하지 못하고, 예전 절대부등식3 기록으로는 완료되지 않음', () => {
  const p = M.createInitialStudentState().l7;
  for (const fn of VALIDATORS) assert.equal(fn(p).ok, false, fn.name);
  const legacy = { ...p, reflection1: '절댓값 제곱의 차 원리를 이용해 증명했다.'.repeat(2), prob1Verified: [true, true, true, true] };
  assert.deepEqual(M.evaluateLevel8Completion(legacy), new Array(8).fill(false));
});

test('흔한 오답에 맞는 안내', () => {
  const p = sample();
  // 문제 1 (2) 등호 포함 → 분모 안내
  assert.match(L8.validateL8Prob1({ ...p, p1b: 'x ≤ 4' }).message, /등호를 빼야/);
  // 문제 1 (1) 등호 빠짐
  assert.match(L8.validateL8Prob1({ ...p, p1a: 'x > 3/2' }).message, /등호를 포함/);
  // 예제 1 (1) 근호가 남은 식
  assert.match(L8.validateL8Ex1({ ...p, ex1a: '(√(x+1))^2-4' }).message, /근호가 남아/);
  // 문제 2 (2) 유리화하지 않은 식
  assert.match(L8.validateL8Prob2({ ...p, p2b: '2/(√(x+1)-√(x-1))' }).message, /분모에 근호/);
  // 문제 2 (2) 값이 다른 식
  assert.match(L8.validateL8Prob2({ ...p, p2b: '√(x+1)-√(x-1)' }).message, /값이 달라요/);
  // 예제 2 p 부호 실수
  assert.match(L8.validateL8Ex2({ ...p, ex2p: '4' }).message, /p의 부호/);
  // 문제 7 (2) 근호 앞 부호
  assert.match(L8.validateL8Prob7({ ...p, p7_2s: '+' }).message, /근호 앞의 부호/);
  // 문제 6 (1) 정의역 방향
  assert.match(L8.validateL8Prob6({ ...p, p6_1d: 'x ≥ 5' }).message, /왼쪽/);
  // 문제 4 대칭 오답
  assert.equal(L8.validateL8Prob4({ ...p, p4s2: 'x' }).ok, false);
  // 생각 열기 속력 소수 표기 인정
  assert.equal(L8.validateL8Open({ ...p, opSpeed: '50.40' }).ok, true);
  // 식 입력: 다른 순서·표기 인정
  assert.equal(L8.validateL8Ex1({ ...p, ex1b: '1/2(√(x+2)-√x)' }).ok, false, '1/2(…) = 1/(2(…))로 읽힘 — 미리보기로 확인');
  assert.equal(L8.validateL8Ex1({ ...p, ex1b: '(1/2)(sqrt(x+2)-sqrt(x))' }).ok, true);
  assert.equal(L8.validateL8Prob2({ ...p, p2b: '√(x-1)+√(x+1)' }).ok, true);
});

test('교사 요약: 입력이 없으면 빈 글자, 있으면 단계별 줄', () => {
  assert.equal(L8.summarizeL8(M.createInitialStudentState().l7), '');
  const text = L8.summarizeL8(sample());
  assert.match(text, /\[생각 열기\] 식: 6\.3√\(1013 − x\)/);
  assert.match(text, /\[문제 1\] \(1\) x ≥ 3\/2 \(2\) x < 4/);
  assert.equal(text.split('\n').length, 7);
});

test('저장·불러오기: 새 항목 보존, 도움 받은 정도 검사, 기기 간 합치기에서 새 항목도 내용으로 인정', () => {
  const rec = M.createInitialStudentState();
  rec.group = '1-1';
  rec.code = 'T01';
  rec.l7 = { ...sample(), irHelpSource: 'hint' };
  const cleaned = M.cleanStudentState(JSON.parse(JSON.stringify(rec)));
  assert.equal(cleaned.l7.p7_2d, 'x ≤ 4');
  assert.equal(cleaned.l7.irHelpSource, 'hint');
  const bad = M.cleanStudentState({ ...JSON.parse(JSON.stringify(rec)), l7: { ...rec.l7, irHelpSource: 'cheat' } });
  assert.equal(bad.l7.irHelpSource, '');

  const remote = M.createInitialStudentState();
  remote.updatedAt = '2026-11-13T10:00:00.000Z';
  const local = M.createInitialStudentState();
  local.updatedAt = '2026-11-13T09:00:00.000Z';
  local.l7 = { ...local.l7, p1a: 'x ≥ 3/2' };
  const merged = M.mergeStudentStates(remote, local);
  assert.equal(merged.l7.p1a, 'x ≥ 3/2', '원격이 비어 있으면 내용 있는 로컬 기록을 지킴');
});

test('교사 문항 상태(8차시, 답안 묶음 l7): 완료·오답·작성 중·미작성, 근호 앞 부호는 빈 칸으로 세지 않음', async () => {
  const { getQuestionStatus, lessonQuestions } = await import('./questionStatus');
  const keys = lessonQuestions('l7').map((q) => q.verifiedKey);
  assert.deepEqual(keys, ['openVerified', 'p1Verified', 'ex1Verified', 'p2Verified', 'p3Verified', 'sqVerified', 'p4Verified', 'p5Verified', 'p6Verified', 'ex2Verified', 'p7Verified']);
  const p = sample();
  assert.equal(getQuestionStatus('l7', 'p1Verified', p)?.status, 'done');
  assert.equal(getQuestionStatus('l7', 'p1Verified', { ...p, p1Verified: false, p1b: 'x ≤ 4' })?.status, 'wrong');
  assert.equal(getQuestionStatus('l7', 'p1Verified', { ...p, p1Verified: false, p1b: '' })?.status, 'unchecked');
  assert.equal(getQuestionStatus('l7', 'p1Verified', M.createInitialStudentState().l7)?.status, 'empty');
  // 예제 2: 부호를 고르지 않았지만(= 없음) 나머지가 맞으면 '점검 버튼을 누르지 않음'
  assert.equal(getQuestionStatus('l7', 'ex2Verified', { ...p, ex2Verified: false, ex2s: '' })?.note, '점검 버튼을 누르지 않음');
  // 이유만 짧으면 점검
  assert.match(getQuestionStatus('l7', 'p7Verified', { ...p, p7Verified: false, p7Reason: '짧음' })?.note || '', /이유 서술 부족/);
});
