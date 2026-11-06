import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HelpSourcePicker, nextHelpSource } from './HelpSourcePicker';
import { FullAnswerPanel } from './FullAnswerPanel';
import {
  StudentRecord,
  cleanStudentState,
  createInitialStudentState,
  createSampleTeacherDataset,
  evaluateLevel1Completion,
  evaluateLevel2Completion,
  evaluateLevel3Completion,
  evaluateLevel4Completion,
  mergeStudentStates,
  sanitizeHelpSource,
} from '../utils/mathLogic';
import { splitLessons } from '../utils/lessonMerge';
import { lessonAnswerCsvColumns } from '../utils/funcTeacherMetrics';

const withId = (r: StudentRecord) => {
  r.group = '테스트고 1학년 3반';
  r.code = '10301_가나다';
  return r;
};

test('선택 버튼: 안내 문구와 버튼 4개가 보이고, 고른 버튼만 선택 표시된다', () => {
  const html = renderToStaticMarkup(<HelpSourcePicker idPrefix="l1" value="hint" onChange={() => {}} />);
  assert.ok(html.includes('도움을 받아도 혼내지 않아요. 솔직히 답변해 주세요.'));
  for (const t of ['AI의 도움을 받았어요', '힌트의 도움을 받았어요', '친구나 선생님의 도움을 받았어요', '스스로 해결했어요']) assert.ok(html.includes(t), t);
  assert.equal((html.match(/aria-checked="true"/g) || []).length, 1);
  assert.equal((html.match(/aria-checked="false"/g) || []).length, 3);
  const none = renderToStaticMarkup(<HelpSourcePicker idPrefix="l1" value={undefined} onChange={() => {}} />);
  assert.equal((none.match(/aria-checked="true"/g) || []).length, 0);
});

test('하나만 선택: 다른 버튼을 누르면 바뀌고, 같은 버튼을 다시 누르면 선택이 풀린다', () => {
  assert.equal(nextHelpSource(undefined, 'ai'), 'ai');
  assert.equal(nextHelpSource('ai', 'self'), 'self');
  assert.equal(nextHelpSource('self', 'self'), '');
});

test('불러오기: 정해진 값만 남기고, 이상한 값은 미선택으로 바꾼다', () => {
  assert.equal(sanitizeHelpSource('ai'), 'ai');
  assert.equal(sanitizeHelpSource('hint'), 'hint');
  assert.equal(sanitizeHelpSource('self'), 'self');
  assert.equal(sanitizeHelpSource('cheat'), '');
  assert.equal(sanitizeHelpSource(3), '');
  const r = withId(createInitialStudentState());
  (r.l2 as unknown as Record<string, unknown>).helpSource = '<script>';
  r.l3.helpSource = 'self';
  const cleaned = cleanStudentState(JSON.parse(JSON.stringify(r)));
  assert.equal(cleaned.l2.helpSource, '');
  assert.equal(cleaned.l3.helpSource, 'self');
});

test('예전 기록: 선택 항목이 없던 기록은 불러와도 차시 내용이 그대로라 다시 저장되지 않는다', () => {
  for (const old of createSampleTeacherDataset()) {
    const before = splitLessons(old);
    const after = splitLessons(cleanStudentState(JSON.parse(JSON.stringify(old))));
    for (const k of ['l1', 'l2', 'l3', 'l4'] as const) {
      assert.equal(after[k], before[k], `${old.code} ${k} 차시 JSON 변화 없음`);
      assert.ok(!after[k].includes('helpSource'));
    }
  }
});

test('완료 조건과 무관: 무엇을 고르든(또는 안 고르든) 단계 완료 결과가 같다', () => {
  for (const s of createSampleTeacherDataset()) {
    const base = [
      evaluateLevel1Completion(s.l1),
      evaluateLevel2Completion(s.l2),
      evaluateLevel3Completion(s.l3),
      evaluateLevel4Completion(s.l4),
    ];
    for (const v of ['ai', 'hint', 'peer', 'self', ''] as const) {
      assert.deepEqual(
        [
          evaluateLevel1Completion({ ...s.l1, helpSource: v }),
          evaluateLevel2Completion({ ...s.l2, helpSource: v }),
          evaluateLevel3Completion({ ...s.l3, helpSource: v }),
          evaluateLevel4Completion({ ...s.l4, helpSource: v }),
        ],
        base
      );
    }
  }
});

test('기기 간 합치기: 선택 값이 차시 기록과 함께 남는다', () => {
  const local = withId(createInitialStudentState());
  local.l4.helpSource = 'ai';
  local.l4.reflection1 = '역함수는 일대일대응일 때 존재한다.';
  local.updatedAt = '2026-11-04T02:00:00.000Z';
  const remote = withId(createInitialStudentState());
  remote.updatedAt = '2026-11-04T01:00:00.000Z';
  assert.equal(mergeStudentStates(remote, local).l4.helpSource, 'ai');
});

test('교사 전체 답안 보기: 선택은 짧은 이름으로, 안 고르면 회색 미선택으로 보이고 작성 개수에는 들어가지 않는다', () => {
  const r = createInitialStudentState();
  const emptyHtml = renderToStaticMarkup(<FullAnswerPanel record={r} initiallyOpen />);
  assert.equal((emptyHtml.match(/해결 방법 \(도움 받은 정도\)/g) || []).length, 7, '1~7차시에 하나씩 (4·5차시는 같은 저장 칸이지만 따로)');
  assert.ok(emptyHtml.includes('text-slate-400">미선택<'));
  const countBefore = emptyHtml.match(/작성 0\/(\d+)/g);

  r.l1.helpSource = 'ai';
  r.l2.helpSource = 'hint';
  r.l3.helpSource = 'self';
  const html = renderToStaticMarkup(<FullAnswerPanel record={r} initiallyOpen />);
  for (const t of ['AI 도움', '힌트 도움', '스스로 해결']) assert.ok(html.includes(t), t);
  assert.deepEqual(html.match(/작성 0\/(\d+)/g)!.slice(0, 3), countBefore!.slice(0, 3), '선택해도 작성 개수 변화 없음');
});

test('CSV: 차시마다 해결 방법 열이 생기고 짧은 이름으로 나온다', () => {
  const cols = lessonAnswerCsvColumns(['l1', 'l2', 'l3', 'l4', 'l4b', 'l5', 'l6']).filter((c) => c.header.includes('해결 방법'));
  assert.equal(cols.length, 7);
  const r = createInitialStudentState();
  r.l1.helpSource = 'self';
  assert.equal(cols[0].value(r), '스스로 해결');
  // 4차시(l4HelpSource)와 5차시(helpSource)는 같은 저장 칸 l4에서 서로 다른 항목
  r.l4.l4HelpSource = 'hint';
  r.l4.helpSource = 'ai';
  assert.ok(cols[3].header.startsWith('4차시'));
  assert.equal(cols[3].value(r), '힌트 도움');
  assert.ok(cols[4].header.startsWith('5차시'));
  assert.equal(cols[4].value(r), 'AI 도움');
  // 6차시(저장 칸 l5)는 ratHelpSource
  r.l5.ratHelpSource = 'self';
  assert.ok(cols[5].header.startsWith('6차시'));
  assert.equal(cols[5].value(r), '스스로 해결');
  // 7차시(저장 칸 l6)는 rgHelpSource
  r.l6.rgHelpSource = 'hint';
  assert.ok(cols[6].header.startsWith('7차시'));
  assert.equal(cols[6].value(r), '힌트 도움');
});


test('친구나 선생님의 도움 (2026-11-06 추가): 버튼 4개, 저장·불러오기·교사 표시', () => {
  const html = renderToStaticMarkup(<HelpSourcePicker idPrefix="t" value="peer" onChange={() => {}} />);
  assert.equal((html.match(/role="radio"/g) || []).length, 4);
  assert.ok(html.includes('친구나 선생님의 도움을 받았어요'));
  assert.match(html, /aria-checked="true"[^>]*>(?:(?!<\/button>).)*친구나 선생님/s);
  assert.equal(sanitizeHelpSource('peer'), 'peer');
  assert.equal(nextHelpSource('peer', 'peer'), '');
  const r = createInitialStudentState();
  r.l2.helpSource = 'peer';
  r.l6.rgHelpSource = 'peer';
  const back = cleanStudentState(JSON.parse(JSON.stringify(r)));
  assert.equal(back.l2.helpSource, 'peer');
  assert.equal(back.l6.rgHelpSource, 'peer');
  const cols = lessonAnswerCsvColumns(['l2']).filter((c) => c.header.includes('해결 방법'));
  assert.equal(cols[0].value(r), '친구·선생님 도움');
});
