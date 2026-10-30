import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MappingVennDiagram, rangeOf } from './MappingVennDiagram';

const X = ['학생 1', '학생 2', '학생 3', '학생 4', '학생 5'] as const;
const Y = ['영화 A', '영화 B', '영화 C', '영화 D', '영화 E'] as const;

function render(mapping: Record<string, string>) {
  return renderToStaticMarkup(
    <MappingVennDiagram domainLabel="X" codomainLabel="Y" domain={X} codomain={Y} mapping={mapping} ariaLabel="test" />
  );
}

test('학생이 만든 대응마다 화살표가 하나씩 그려진다', () => {
  const html = render({ '학생 1': '영화 A', '학생 2': '영화 C' });
  assert.equal((html.match(/data-arrow=/g) || []).length, 2);
  assert.ok(html.includes('data-arrow="학생 1-&gt;영화 A"'));
  assert.ok(html.includes('data-arrow="학생 2-&gt;영화 C"'));
});

test('대응이 없으면 화살표 없이 두 집합과 원소만 그리고, 치역은 공집합으로 표시', () => {
  const html = render({});
  assert.equal((html.match(/data-arrow=/g) || []).length, 0);
  assert.equal((html.match(/<ellipse/g) || []).length, 2, '두 집합(타원)');
  for (const v of [...X, ...Y]) assert.ok(html.includes(`>${v}<`), `원소 표시: ${v}`);
  assert.ok(html.includes('∅'));
});

test('치역: 상수함수면 원소 1개, 일대일대응이면 공역 전체', () => {
  const constant = Object.fromEntries(X.map((x) => [x, '영화 B']));
  assert.deepEqual(rangeOf(Y, constant), ['영화 B']);
  const bijection = Object.fromEntries(X.map((x, i) => [x, Y[i]]));
  assert.deepEqual(rangeOf(Y, bijection), [...Y]);
  assert.ok(render(constant).includes('{영화 B}'));
});

test('공역에 없는 값은 화살표를 그리지 않는다 (잘못된 저장값 방어)', () => {
  const html = render({ '학생 1': '없는 영화' });
  assert.equal((html.match(/data-arrow=/g) || []).length, 0);
});

test('항등함수(X → X): 각 원소가 자기 자신으로 가는 화살표', () => {
  const M = ['회원 A', '회원 B', '회원 C', '회원 D'] as const;
  const html = renderToStaticMarkup(
    <MappingVennDiagram domainLabel="X" codomainLabel="X" domain={M} codomain={M} mapping={Object.fromEntries(M.map((m) => [m, m]))} ariaLabel="t" />
  );
  for (const m of M) assert.ok(html.includes(`data-arrow="${m}-&gt;${m}"`));
});
