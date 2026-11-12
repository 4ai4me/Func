import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HintUsageSection, StudentHintPanel } from './HintUsagePanel';
import { createInitialStudentState } from '../utils/mathLogic';
import { catalogOf } from '../utils/hintCatalog';

const student = (code: string, l1Opens?: Record<string, number>) => {
  const r = createInitialStudentState();
  r.code = code;
  r.group = '수일고|1|3';
  if (l1Opens) r.l1 = { ...r.l1, hintOpens: l1Opens };
  return r;
};

test('힌트 사용 현황: 1차시 힌트마다 줄이 있고, 학생 × 힌트 표에 학생이 보인다', () => {
  const h = renderToStaticMarkup(<HintUsageSection records={[student('10301 가나', { prob1: 3 }), student('10302 다라')]} totalCount={5} />);
  assert.equal((h.match(/data-hint-row=/g) || []).length, catalogOf(1).hints.length);
  assert.ok(h.includes('10301 가나') && h.includes('10302 다라'));
  assert.ok(h.includes('data-hint-student-table'));
  assert.ok(h.includes('전체 5명'));
});

test('학생 한 명 힌트 기록: 연 힌트와 횟수, 안 연 차시는 "연 힌트 없음"', () => {
  const h = renderToStaticMarkup(<StudentHintPanel record={student('10301 가나', { prob1: 3, prob3_hint: 1 })} />);
  assert.ok(h.includes('모두 4번'));
  assert.ok(h.includes('[문제 1] 전체 힌트'));
  assert.ok(h.includes('연 힌트 없음'));
});
