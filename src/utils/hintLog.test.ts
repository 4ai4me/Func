import test from 'node:test';
import assert from 'node:assert/strict';
import { addHintOpen, cleanHintOpens, hintLevelKey, mergeHintOpens, HINT_OPENS_MAX_COUNT } from './hintLog';
import { cleanStudentState, createInitialStudentState, mergeStudentStates } from './mathLogic';
import { assembleRecord } from './lessonMerge';
import { findUnlabeledFields } from '../components/FullAnswerPanel';
import { LESSON6_RESET } from '../components/Lesson6View';
import { PART1_RESET } from '../components/Lesson4View';

test('addHintOpen: 열 때마다 1씩 늘고, 원래 기록은 바꾸지 않는다', () => {
  const s0 = { a: 1 } as { a: number; hintOpens?: Record<string, number> };
  const s1 = addHintOpen(s0, 'p1');
  const s2 = addHintOpen(addHintOpen(s1, 'p1'), 'p2');
  assert.equal(s0.hintOpens, undefined);
  assert.deepEqual(s1.hintOpens, { p1: 1 });
  assert.deepEqual(s2.hintOpens, { p1: 2, p2: 1 });
  assert.equal(addHintOpen(s2, hintLevelKey('step1', 2)).hintOpens?.['step1@2'], 1);
});

test('addHintOpen: 잘못된 이름은 기록하지 않는다', () => {
  const s = { hintOpens: { p1: 1 } };
  assert.equal(addHintOpen(s, 'bad name!'), s);
});

test('cleanHintOpens: 올바른 이름·양의 정수만 남기고 상한을 둔다', () => {
  assert.equal(cleanHintOpens(null), undefined);
  assert.equal(cleanHintOpens([1, 2]), undefined);
  assert.equal(cleanHintOpens({}), undefined);
  assert.deepEqual(
    cleanHintOpens({ ok: 3, half: 2.7, zero: 0, neg: -1, str: '5', 'a b': 4, huge: 1e12, 'step1@3': 1 }),
    { ok: 3, half: 2, huge: HINT_OPENS_MAX_COUNT, 'step1@3': 1 }
  );
});

test('mergeHintOpens: 힌트마다 큰 값', () => {
  assert.deepEqual(mergeHintOpens({ a: 2, b: 1 }, { a: 1, c: 4 }), { a: 2, b: 1, c: 4 });
  assert.equal(mergeHintOpens(undefined, undefined), undefined);
});

test('저장·불러오기(cleanStudentState)에서 힌트 횟수가 유지되고, 잘못된 값은 걸러진다', () => {
  const rec = createInitialStudentState();
  rec.l5 = { ...rec.l5, hintOpens: { p1: 3 } };
  rec.l7 = { ...rec.l7, hintOpens: { 'step1@2': 1, step1: 2 } };
  (rec.l1 as unknown as Record<string, unknown>).hintOpens = { 'x y': 5, ok: -2 };
  const back = cleanStudentState(JSON.parse(JSON.stringify(rec)));
  assert.deepEqual(back.l5.hintOpens, { p1: 3 });
  assert.deepEqual(back.l7.hintOpens, { 'step1@2': 1, step1: 2 });
  assert.equal('hintOpens' in back.l1, false);
});

test('서버 차시 문서로 조립(assembleRecord)해도 힌트 횟수가 남는다', () => {
  const base = createInitialStudentState();
  const l5 = { ...base.l5, hintOpens: { p2: 4 } };
  const out = assembleRecord(base, {
    lessons: { l5: { studentKey: 'k', lesson: 5, data: JSON.stringify(l5), clientUpdatedAt: new Date().toISOString() } },
  });
  assert.deepEqual(out.l5.hintOpens, { p2: 4 });
});

test('기기 간 합치기: 어느 기기 기록을 고르든 힌트 횟수는 힌트마다 큰 값', () => {
  const remote = createInitialStudentState();
  const local = createInitialStudentState();
  remote.updatedAt = '2026-11-12T01:00:00.000Z';
  local.updatedAt = '2026-11-12T02:00:00.000Z'; // 로컬이 최신 → 로컬 차시 기록을 고름
  remote.l5 = { ...remote.l5, hintOpens: { p1: 5, p3: 1 } };
  local.l5 = { ...local.l5, hintOpens: { p1: 2, p2: 1 } };
  const merged = mergeStudentStates(remote, local);
  assert.deepEqual(merged.l5.hintOpens, { p1: 5, p3: 1, p2: 1 });
  assert.equal('hintOpens' in merged.l1, false, '기록 없는 차시에 빈 항목을 만들지 않음');
});

test('[N차시 초기화]해도 힌트 횟수는 남는다 (6차시·4차시 초기화 값에 hintOpens 없음)', () => {
  assert.equal('hintOpens' in LESSON6_RESET, false);
  assert.equal('hintOpens' in PART1_RESET, false);
  const s = { ...createInitialStudentState().l5, hintOpens: { p1: 2 } };
  assert.deepEqual({ ...s, ...LESSON6_RESET }.hintOpens, { p1: 2 });
});

test('교사 [전체 답안 보기]의 기타 기록에 hintOpens가 섞이지 않는다', () => {
  const l5 = { ...createInitialStudentState().l5, hintOpens: { p1: 2 } };
  assert.equal(findUnlabeledFields('l5', l5).includes('hintOpens'), false);
});
