import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { HINT_CATALOG, catalogOf, formatHintCounts, hintCounts, studentHintTotal, summarizeHints } from './hintCatalog';
import { createInitialStudentState, LESSON_STORAGE_KEY } from './mathLogic';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = (name: string) => readFileSync(path.join(here, '..', 'components', name), 'utf8');
/** 화면 코드의 toggleHint('이름') 목록 */
const toggleIds = (code: string) => [...code.matchAll(/toggleHint\('([A-Za-z0-9_]+)'\)/g)].map((m) => m[1]);
const ids = (lesson: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9) => catalogOf(lesson).hints.map((h) => h.id);
const sameSet = (a: string[], b: string[], msg: string) => assert.deepEqual([...new Set(a)].sort(), [...new Set(b)].sort(), msg);

test('힌트 목록이 화면 코드의 힌트 버튼과 빠짐없이 맞는다', () => {
  sameSet(ids(1), [...toggleIds(src('Lesson1View.tsx')), 'prob2_1_graph', 'prob2_2_graph'], '1차시');
  sameSet(ids(2), toggleIds(src('Lesson2View.tsx')), '2차시');
  sameSet(ids(3), [...toggleIds(src('Lesson3View.tsx')), ...toggleIds(src('Lesson3CouponStep.tsx')).map((k) => `coupon_${k}`)], '3차시');
  sameSet([...ids(4), ...ids(5)], toggleIds(src('Lesson4View.tsx')), '4·5차시(같은 화면 코드)');
  sameSet(ids(6), toggleIds(src('Lesson6View.tsx')), '6차시');
  sameSet(ids(7), toggleIds(src('Lesson7View.tsx')), '7차시');
  sameSet([...ids(8), ...ids(9)], toggleIds(src('Lesson8View.tsx')), '8·9차시(같은 화면 코드)');
});

test('같은 저장 칸을 쓰는 차시끼리 힌트 이름이 겹치지 않는다', () => {
  const byKey = new Map<string, string[]>();
  for (const c of HINT_CATALOG) {
    const k = LESSON_STORAGE_KEY[c.lesson];
    byKey.set(k, [...(byKey.get(k) ?? []), ...c.hints.map((h) => h.id)]);
  }
  for (const [k, list] of byKey) assert.equal(new Set(list).size, list.length, k);
});

test('요약: 연 학생 수·총 횟수, 학생 합계, 단계 힌트 표시', () => {
  const a = createInitialStudentState();
  const b = createInitialStudentState();
  const c = createInitialStudentState();
  a.l5 = { ...a.l5, hintOpens: { p1: 3, p2: 1 } }; // 6차시 = 저장 칸 l5
  b.l5 = { ...b.l5, hintOpens: { p1: 1 } };
  const rows = summarizeHints([a, b, c], 6);
  const p1 = rows.find((r) => r.def.id === 'p1')!;
  assert.equal(p1.students, 2);
  assert.deepEqual(p1.totals, [4]);
  assert.equal(rows.find((r) => r.def.id === 'open')!.students, 0);
  assert.equal(studentHintTotal(a, 6), 4);
  assert.equal(studentHintTotal(c, 6), 0);
  assert.equal(studentHintTotal(a, 7), 0, '다른 차시와 섞이지 않음');

  const d = createInitialStudentState();
  // 8차시 = 저장 칸 l7. 예전 절댓값 부등식 화면의 단계 힌트 횟수(step1)는 남아 있어도 새 8차시 합계에 섞이지 않음 (2026-11-13)
  d.l7 = { ...d.l7, hintOpens: { step1: 2, 'step1@2': 1, p6: 2, p1: 1 } };
  assert.equal(studentHintTotal(d, 8), 1);
  assert.equal(studentHintTotal(d, 9), 2, '9차시(같은 저장 칸 l7) 힌트는 9차시로');
  // 단계 힌트 표시 형식 (지금은 쓰는 차시가 없지만 형식은 유지)
  const def = { id: 'step1', label: '단계 힌트', levels: 3 };
  assert.deepEqual(hintCounts(d.l7.hintOpens, def), [2, 1, 0]);
  assert.equal(formatHintCounts([2, 1, 0]), '열기 2 · 2단계 1 · 3단계 0');
  assert.equal(formatHintCounts([5]), '5');
});
