import test from 'node:test';
import assert from 'node:assert/strict';
import * as M from './mathLogic';
import {
  FUNC_ITEM_CHECKS,
  answerToCsvText,
  completedLessonDistribution,
  funcLessonProgress,
  lessonAnswerCsvColumns,
  lessonProgress,
} from './funcTeacherMetrics';

test('차시 진행 상태: 모두 충족 = 완료, 일부 = 진행 중, 없음 = 시작 전', () => {
  assert.equal(lessonProgress([true, true]), 'done');
  assert.equal(lessonProgress([true, false]), 'progress');
  assert.equal(lessonProgress([false, false]), 'none');
});

test('빈 활동지는 1~4차시 모두 시작 전이고, 문항 확인 현황도 0이다', () => {
  const x = M.createInitialStudentState();
  for (const l of [1, 2, 3, 4] as const) assert.equal(funcLessonProgress(x, l), 'none');
  assert.equal(FUNC_ITEM_CHECKS.filter((c) => c.done(x)).length, 0);
});

test('예시 학생 답안은 학생 화면의 채점 함수를 실제로 통과한다 (틀린 예시 방지)', () => {
  const s = M.createFuncSampleLessons('complete');
  const results: [string, { ok: boolean; message: string }][] = [
    ['나라-화폐', M.validateL1CountryMap(s.l1.countryMap)],
    ['1차시 문제 1', M.validateL1Prob1(s.l1)],
    ['1차시 문제 2', M.validateL1Prob2(s.l1)],
    ['1차시 문제 3', M.validateL1Prob3(s.l1)],
    ['1차시 문제 4-(1)', M.validateL1Prob4_1Points(s.l1.prob4_1Points)],
    ['1차시 문제 4-(2)', M.validateL1Prob4_2Line(s.l1.prob4_2LinePoints)],
    ['1차시 문제 5', M.validateL1Prob5(s.l1)],
    ['2차시 보기', M.validateL2Bogi(s.l2)],
    ['2차시 문제 6', M.validateL2Prob6(s.l2)],
    ['2차시 문제 7', M.validateL2Prob7(s.l2)],
    ['2차시 활동 1', M.validateL2Think1(s.l2)],
    ['2차시 활동 2', M.validateL2Think2(s.l2)],
    ['3차시 생각 열기', M.validateL3Open(s.l3)],
    ['3차시 문제 1', M.validateL3Prob1(s.l3)],
  ];
  for (const [name, r] of results) assert.ok(r.ok, `${name}: ${r.message}`);
});

test('예시 학생 2명: 완료 학생은 1·2차시 완료, 진행 학생은 진행 중으로 집계된다', () => {
  const [s1, s2] = M.createSampleTeacherDataset();
  assert.equal(funcLessonProgress(s1, 1), 'done');
  assert.equal(funcLessonProgress(s1, 2), 'done');
  assert.equal(funcLessonProgress(s2, 2), 'progress');
  const dist = completedLessonDistribution([s1, s2]);
  assert.equal(dist.length, 5, '0~4개 차시 완료');
  assert.equal(dist.reduce((a, b) => a + b, 0), 2, '분포 합계 = 학생 수');
  // 4차시(역함수): 완료 학생은 완료, 진행 학생은 생각 열기만 → 진행 중
  assert.equal(funcLessonProgress(s1, 4), 'done');
  assert.equal(funcLessonProgress(s2, 4), 'progress');
  assert.ok(FUNC_ITEM_CHECKS.filter((c) => c.title.startsWith('4차시')).every((c) => c.done(s1)));
});

test('CSV 4차시 열은 역함수 문항 이름을 쓰고, 귀류법 항목이 없다', () => {
  const cols = lessonAnswerCsvColumns(['l4']);
  const headers = cols.map((c) => c.header).join('|');
  assert.ok(headers.includes('4차시') && headers.includes('역함수'));
  for (const old of ['귀류', '√2', '증명 보고서']) assert.ok(!headers.includes(old), `귀류법 항목이 남아 있음: ${old}`);
  const rec = { ...M.createInitialStudentState(), ...M.createFuncSampleLessons('complete') };
  const row = cols.map((c) => c.value(rec));
  assert.ok(row.includes('N2O→아산화 질소, CH4→메테인, CO2→이산화 탄소'), '대응표를 글자로');
  assert.ok(row.includes('y = 5/9(x - 32)'));
});

test('CSV 1~3차시 열은 Func 문항 이름을 쓰고, 명제 수업 항목이 없다', () => {
  const cols = lessonAnswerCsvColumns(['l1', 'l2', 'l3']);
  const headers = cols.map((c) => c.header).join('|');
  assert.ok(headers.includes('1차시') && headers.includes('정의역'));
  for (const old of ['반례', '추측', '대우', '탐구 주제', '사례 수']) {
    assert.ok(!headers.includes(old), `명제 수업 항목이 남아 있음: ${old}`);
  }
  const s = M.createFuncSampleLessons('complete');
  const rec = { ...M.createInitialStudentState(), ...s };
  const row = cols.map((c) => c.value(rec));
  assert.ok(row.includes('{a, c, d}'), '답안 값이 그대로 들어감');
  assert.ok(row.includes('함수가 아니다 (X)'), '예/아니오는 화면 문구로 변환');
});

test('CSV 값 변환: 확인 여부·대응표·좌표', () => {
  assert.equal(answerToCsvText(true, { kind: 'check' }), 'O');
  assert.equal(answerToCsvText(false, { kind: 'check' }), '');
  assert.equal(answerToCsvText({ 대한민국: '원(₩)' }, { kind: 'map' }), '대한민국→원(₩)');
  assert.equal(answerToCsvText([{ x: 0, y: 3 }], { kind: 'points' }), '(0,3)');
  assert.equal(answerToCsvText(undefined), '');
});
