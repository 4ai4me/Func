import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Lesson4View, PART1_RESET, PART2_RESET, LESSON4_SECTIONS } from './Lesson4View';
import { Lesson5View } from './Lesson5View';
import { FullAnswerPanel, findUnlabeledFields } from './FullAnswerPanel';
import {
  STAGE_TITLES,
  createFuncSampleLessons,
  createInitialStudentState,
  cleanStudentState,
  evaluateLevel4Completion,
  evaluateLevel5Completion,
  type Lesson4State,
} from '../utils/mathLogic';
import { L4_PART1_KEYS, L4_PART2_KEYS, LESSON_ANSWER_CONFIG } from '../utils/answerLabels';
import { getQuestionStatus } from '../utils/questionStatus';
import { splitLessons } from '../utils/lessonMerge';

/**
 * 2026-11-05 역함수를 4차시(1부)·5차시(2부)로 나눔 — 같은 저장 칸 l4를 함께 씀.
 * 나누기 전에 4차시에서 써 둔 답이 5차시에 그대로 보이는지, 두 차시가 서로를 건드리지 않는지 확인.
 */

/** 나누기 전(2026-11-05 이전)에 저장된 4차시 기록 — 함께하기·그래프까지 풀어 둔 학생 */
const preSplitL4 = (): Lesson4State => {
  const done = createFuncSampleLessons('complete').l4;
  const { l4Reflection1: _a, l4Reflection2: _b, ...rest } = done;
  return rest as Lesson4State;
};

const render = (state: Lesson4State, step: number, part: 1 | 2) => {
  const props = { state, step, onStepChange: () => {}, onUpdate: () => {}, onRequestConfirm: () => {} };
  return renderToStaticMarkup(part === 1 ? <Lesson4View {...props} /> : <Lesson5View {...props} />);
};

test('단계 수: 4차시 4단계(성찰 추가), 5차시 2단계 — 화면 구역과 단계 제목 수가 같다', () => {
  assert.equal(LESSON4_SECTIONS[1].length, STAGE_TITLES[4].length);
  assert.equal(LESSON4_SECTIONS[2].length, STAGE_TITLES[5].length);
  assert.equal(evaluateLevel4Completion(createInitialStudentState().l4).length, STAGE_TITLES[4].length);
  assert.equal(evaluateLevel5Completion(createInitialStudentState().l4).length, STAGE_TITLES[5].length);
});

test('나누기 전 기록: 함께하기·그래프 답이 5차시 화면에 그대로 보이고 5차시가 완료로 판정된다', () => {
  const old = cleanStudentState(JSON.parse(JSON.stringify({ ...createInitialStudentState(), l4: preSplitL4() }))).l4;
  assert.deepEqual(evaluateLevel5Completion(old), [true, true]);
  // 4차시는 앞 3단계 완료, 새 성찰 단계만 아직
  assert.deepEqual(evaluateLevel4Completion(old), [true, true, true, false]);
  // 5차시 함께하기 화면에 학생이 써 둔 문제 3 이유가 보임
  const html = render(old, 0, 2);
  assert.ok(html.includes(old.p3Reason!.slice(0, 10)));
  assert.ok(html.includes('05차시'));
  // 5차시 성찰 칸에 예전 성찰 답이 그대로
  assert.ok(render(old, 1, 2).includes(old.reflection1!.slice(0, 10)));
});

test('4차시 화면은 생각 열기·문제 1·역함수 구하기·성찰, 5차시 화면은 함께하기·그래프만 그린다', () => {
  const s = createInitialStudentState().l4;
  const p1 = [0, 1, 2, 3].map((i) => render(s, i, 1)).join('');
  const p2 = [0, 1].map((i) => render(s, i, 2)).join('');
  assert.ok(p1.includes('04차시') && !p1.includes('05차시 · 역함수의 성질과 그래프:'));
  assert.ok(p1.includes('id="l4-ex1-ans"') && p1.includes('id="l4-reflection1"'));
  assert.ok(!p1.includes('id="l4-tg-gf"') && !p1.includes('id="l4-p4-1"'), '4차시에 5차시 문항 없음');
  assert.ok(p2.includes('id="l4-tg-gf"') && p2.includes('id="l4-p4-1"') && p2.includes('id="l5-reflection1"'));
  assert.ok(!p2.includes('id="l4-ex1-ans"') && !p2.includes('id="l4-reflection1"'), '5차시에 4차시 문항 없음');
  // 차시별 초기화 버튼
  assert.ok(render(s, 0, 1).includes('4차시 초기화'));
  assert.ok(render(s, 0, 2).includes('5차시 초기화'));
});

test('차시별 초기화는 상대 차시 항목을 건드리지 않는다 (겹치는 항목 없음)', () => {
  const k1 = Object.keys(PART1_RESET);
  const k2 = Object.keys(PART2_RESET);
  assert.equal(k1.filter((k) => k2.includes(k)).length, 0);
  // 교사 화면 이름표의 차시별 항목과 같은 범위
  assert.deepEqual([...k1].sort(), [...L4_PART1_KEYS].sort());
  assert.deepEqual([...k2].sort(), [...L4_PART2_KEYS].sort());
  // 4차시를 초기화해도 5차시 답은 남음
  const s = { ...preSplitL4(), ...PART1_RESET };
  assert.deepEqual(evaluateLevel5Completion(s), [true, true]);
  assert.equal(evaluateLevel4Completion(s).some(Boolean), false);
});

test('교사 전체 답안: 4·5차시가 따로 보이고, 서로의 항목이 기타 기록에 섞이지 않는다', () => {
  const rec = { ...createInitialStudentState(), ...createFuncSampleLessons('complete') };
  assert.deepEqual(findUnlabeledFields('l4', rec.l4), []);
  assert.deepEqual(findUnlabeledFields('l4b', rec.l4), []);
  const html = renderToStaticMarkup(<FullAnswerPanel record={rec} initiallyOpen />);
  for (const t of ['4차시 · 역함수의 뜻과 구하기', '5차시 · 역함수의 성질과 그래프', '6차시 · 절대부등식', '7차시 · 절대부등식', '8차시 · 절대부등식']) {
    assert.ok(html.includes(t), t);
  }
  assert.ok(!html.includes('기타 기록'));
  // 4차시 묶음에는 함께하기가, 5차시 묶음에는 역함수 구하기가 없음
  const t4 = LESSON_ANSWER_CONFIG.l4.groups.map((g) => g.title).join('|');
  const t5 = LESSON_ANSWER_CONFIG.l4b.groups.map((g) => g.title).join('|');
  assert.ok(t4.includes('역함수 구하기') && !t4.includes('함께하기'));
  assert.ok(t5.includes('함께하기') && !t5.includes('역함수 구하기'));
});

test('문항 상태: 5차시 문항(l4b)도 점검·오답·미작성을 구분한다', () => {
  const s = createInitialStudentState().l4;
  assert.equal(getQuestionStatus('l4b', 'togetherVerified', s)?.status, 'empty');
  assert.equal(getQuestionStatus('l4b', 'togetherVerified', { ...s, tg_gf: '2x+2' })?.status, 'unchecked');
  assert.equal(getQuestionStatus('l4b', 'togetherVerified', { ...preSplitL4(), togetherVerified: true })?.status, 'done');
  // 4차시 묶음으로는 5차시 문항 상태를 묻지 않음
  assert.equal(getQuestionStatus('l4', 'togetherVerified', s), undefined);
  assert.equal(getQuestionStatus('l4', 'p5Verified', s)?.status, 'empty');
});

test('저장: 4·5차시 답은 여전히 l4 문서 하나에 들어가고, 저장 칸은 l1~l7 그대로', () => {
  const rec = createInitialStudentState();
  rec.l4 = { ...rec.l4, ex1_ans: '1/3x-4/3', tg_gf: '2x+2', l4Reflection1: '성찰' };
  const json = splitLessons(rec);
  assert.deepEqual(Object.keys(json), ['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7']);
  const l4 = JSON.parse(json.l4);
  assert.equal(l4.ex1_ans, '1/3x-4/3');
  assert.equal(l4.tg_gf, '2x+2');
  assert.equal(l4.l4Reflection1, '성찰');
  // 불러오기 후에도 새 항목 보존
  const back = cleanStudentState(JSON.parse(JSON.stringify(rec)));
  assert.equal(back.l4.l4Reflection1, '성찰');
});
