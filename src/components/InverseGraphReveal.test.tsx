import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { InverseGraphReveal, linearInversePanel } from './InverseGraphReveal';
import { Lesson4View } from './Lesson4View';
import { createInitialStudentState, type Lesson4State } from '../utils/mathLogic';
import { L4_GRAPH_SETS, inverseLinear, validateL4Ex1, validateL4Prob2, validateL4Prob5, validateL4Together, validateL4Prob3 } from '../utils/lesson4Logic';
import { formatLinear } from '../utils/linearExpr';

const near = (a: number, b: number) => Math.abs(a - b) < 1e-9;

// ── 그래프에 그리는 역함수 = 채점 정답 ──
test('inverseLinear: y = ax + b의 역함수와 원래 함수는 서로 되돌린다', () => {
  for (const [a, b] of [[3, 4], [-3, 1], [1 / 4, 2], [9 / 5, 32], [2, -5], [1, -1]]) {
    const inv = inverseLinear(a, b);
    for (const x of [-7, 0, 2.5, 11]) {
      assert.ok(near(inv.a * (a * x + b) + inv.b, x));
      assert.ok(near(a * (inv.a * x + inv.b) + b, x));
    }
  }
});

test('그래프의 역함수 식을 답으로 넣으면 각 문제의 채점을 통과한다', () => {
  const s = (k: keyof typeof L4_GRAPH_SETS, i = 0) => {
    const fn = L4_GRAPH_SETS[k][i];
    return formatLinear(inverseLinear(fn.a, fn.b));
  };
  const reason = '역함수를 구한 과정입니다';
  const base = createInitialStudentState().l4;
  assert.ok(validateL4Ex1({ ...base, ex1_solveX: formatLinear(inverseLinear(3, 4), 'y'), ex1_ans: s('ex1') }).ok);
  assert.ok(validateL4Prob2({ ...base, p2_1: s('p2', 0), p2_2: s('p2', 1), p2Reason: reason }).ok);
  assert.ok(validateL4Prob5({ ...base, p5_inv: s('p5'), p5_celsius: '35' }).ok);
  assert.ok(
    validateL4Together({
      ...base,
      tg_gf: '2x+2',
      tg_gfInv: s('together', 2),
      tg_fInv: s('together', 0),
      tg_gInv: s('together', 1),
      tg_inner: s('together', 1),
      tg_result: s('together', 2),
      tg_relation: 'eq',
    }).ok
  );
  // [문제 3] (g∘f)⁻¹(3) = 4 — 그래프의 역함수에 3을 넣은 값이 정답과 같다
  const p3 = L4_GRAPH_SETS.p3[0];
  const inv3 = inverseLinear(p3.a, p3.b);
  assert.ok(near(inv3.a * 3 + inv3.b, 4));
  assert.ok(validateL4Prob3({ ...base, p3_ans: '4', p3Reason: reason }).ok);
});

// ── 버튼 화면 ──
const panels = [linearInversePanel(L4_GRAPH_SETS.ex1[0], 'ex1-0')];

test('정답 확인 전: 버튼이 잠겨 있고 그래프가 그려지지 않는다 (열림 상태여도)', () => {
  const html = renderToStaticMarkup(<InverseGraphReveal unlocked={false} open onToggle={() => {}} panels={panels} />);
  assert.ok(/<button[^>]*disabled/.test(html));
  assert.ok(html.includes('정답 확인을 통과하면 그래프를 볼 수 있어요.'));
  assert.ok(!html.includes('data-graph-panel'));
});

test('정답 확인 후: 닫혀 있으면 버튼만, 열면 함수·역함수·y = x 세 직선과 범례', () => {
  const closed = renderToStaticMarkup(<InverseGraphReveal unlocked open={false} onToggle={() => {}} panels={panels} />);
  assert.ok(!/<button[^>]*disabled/.test(closed));
  assert.ok(closed.includes('그래프로 확인하기'));
  assert.ok(!closed.includes('data-graph-panel'));

  const open = renderToStaticMarkup(<InverseGraphReveal unlocked open onToggle={() => {}} panels={panels} />);
  assert.ok(open.includes('그래프 닫기'));
  assert.ok(open.includes('data-graph-panel="ex1-0"'));
  for (const name of ['y=x', 'f', 'f-inverse']) assert.ok(open.includes(`data-line="${name}"`), name);
  for (const t of ['y = 3x + 4', 'y = (1/3)x − 4/3', 'y = x']) assert.ok(open.includes(t), t);
});

test('함께하기는 f, g, g∘f 세 좌표평면, 문제 5는 넓은 범위·10 간격 눈금', () => {
  const tg = L4_GRAPH_SETS.together.map((fn, i) => linearInversePanel(fn, `together-${i}`));
  const html = renderToStaticMarkup(<InverseGraphReveal unlocked open onToggle={() => {}} panels={tg} />);
  assert.equal((html.match(/data-graph-panel=/g) || []).length, 3);
  for (const t of ['f⁻¹(x) = x + 1', 'g⁻¹(x) = (1/2)x − 2', '(g∘f)⁻¹(x) = (1/2)x − 1']) assert.ok(html.includes(t), t);

  const p5 = renderToStaticMarkup(
    <InverseGraphReveal unlocked open onToggle={() => {}} panels={[linearInversePanel(L4_GRAPH_SETS.p5[0], 'p5-0')]} />
  );
  assert.ok(p5.includes('y = (5/9)x − 160/9'));
  assert.ok(p5.includes('>50<') && p5.includes('>-50<'));
});

// ── 4차시 화면에 붙었는지 ──
test('4차시 화면: 각 단계에 그래프 버튼이 있고, 정답 확인 여부에 따라 잠김/켜짐', () => {
  const base = createInitialStudentState().l4;
  const render = (state: Lesson4State, step: number) =>
    renderToStaticMarkup(
      <Lesson4View state={state} step={step} onStepChange={() => {}} onUpdate={() => {}} onRequestConfirm={() => {}} />
    );
  const countToggles = (html: string) => (html.match(/data-graph-toggle/g) || []).length;
  const countDisabled = (html: string) => (html.match(/<button[^>]*disabled=""[^>]*data-graph-toggle/g) || []).length;
  // 단계별 버튼 수: 1단계(문제 1) 1개, 2단계(예제 1·문제 2·문제 5) 3개, 3단계(함께하기·문제 3) 2개
  for (const [step, n] of [[1, 1], [2, 3], [3, 2]] as const) {
    const locked = render(base, step);
    assert.equal(countToggles(locked), n, `step ${step}`);
    assert.equal(countDisabled(locked), n, `step ${step} locked`);
  }
  const verified: Lesson4State = {
    ...base,
    p1Verified: true,
    ex1Verified: true,
    p2Verified: true,
    p5Verified: true,
    togetherVerified: true,
    p3Verified: true,
  };
  for (const step of [1, 2, 3]) assert.equal(countDisabled(render(verified, step)), 0, `step ${step} unlocked`);
  // 0단계·4단계(문제 4·공학 도구는 원래 그래프가 있음)에는 새 버튼 없음
  assert.equal(countToggles(render(verified, 0)), 0);
  assert.equal(countToggles(render(verified, 4)), 0);
});
