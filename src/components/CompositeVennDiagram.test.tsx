import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CompositeVennDiagram, composeMapping } from './CompositeVennDiagram';

// 3차시 [생각 열기]와 같은 집합·대응
const X = ['아람', '재영', '하영'] as const;
const Y = ['어묵', '핫도그', '떡볶이', '김밥'] as const;
const Z = ['2000원', '3000원', '4000원'] as const;
const f = { 아람: '핫도그', 재영: '김밥', 하영: '어묵' };
const g = { 어묵: '2000원', 핫도그: '3000원', 떡볶이: '4000원', 김밥: '4000원' };

const html = (props: Partial<React.ComponentProps<typeof CompositeVennDiagram>> = {}) =>
  renderToStaticMarkup(<CompositeVennDiagram setX={X} setY={Y} setZ={Z} f={f} g={g} ariaLabel="t" {...props} />);

test('합성 대응 g∘f(x) = g(f(x)) 를 정확히 계산한다', () => {
  assert.deepEqual(composeMapping(X, f, g), { 아람: '3000원', 재영: '4000원', 하영: '2000원' });
});

test('f 화살표 3개, g 화살표 4개(떡볶이 포함), g∘f 점선 3개를 그린다', () => {
  const h = html();
  assert.equal((h.match(/data-arrow="f:/g) || []).length, 3);
  assert.equal((h.match(/data-arrow="g:/g) || []).length, 4);
  assert.equal((h.match(/data-arrow="gf:/g) || []).length, 3);
  assert.ok(h.includes('data-arrow="gf:아람-&gt;3000원"'));
  assert.ok(h.includes('data-arrow="g:떡볶이-&gt;4000원"'), '주문되지 않은 음식의 g 대응도 표시');
  assert.equal((h.match(/<ellipse/g) || []).length, 3, '세 집합');
});

test('g∘f 점선을 끄면 f·g 화살표만 남는다', () => {
  const h = html({ showComposite: false });
  assert.equal((h.match(/data-arrow="gf:/g) || []).length, 0);
  assert.equal((h.match(/data-arrow="[fg]:/g) || []).length, 7);
});

test('학생을 고르면 그 경로만 진하게, 나머지는 흐리게', () => {
  const h = html({ highlight: '재영' });
  assert.match(h, /data-arrow="f:재영-&gt;김밥"[^>]*opacity="1"/);
  assert.match(h, /data-arrow="g:김밥-&gt;4000원"[^>]*opacity="1"/);
  assert.match(h, /data-arrow="f:아람-&gt;핫도그"[^>]*opacity="0.22"/);
});
