import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RationalSetVenn, RATIONAL_SET_PAIRS, exampleKey } from './RationalSetVenn';
import { L6_P1_EXPRS } from '../utils/lesson6Logic';
import { parseRat, evalRat } from '../utils/ratExpr';

test('세 쌍(정수⊂유리수, 다항식⊂유리식, 다항함수⊂유리함수)을 모두 그린다', () => {
  const h = renderToStaticMarkup(<RationalSetVenn />);
  for (const id of ['number', 'expr', 'function']) assert.ok(h.includes(`data-venn="${id}"`), id);
  for (const s of ['정수 ⊂ 유리수', '다항식 ⊂ 유리식', '다항함수 ⊂ 유리함수']) assert.ok(h.includes(s), s);
});

test('예시 식은 모두 분수 모양으로 읽히고, [문제 1]의 다섯 식과 겹치지 않는다', () => {
  const p1 = new Set<string>(L6_P1_EXPRS.map((e) => e.raw));
  for (const pair of RATIONAL_SET_PAIRS) {
    for (const ex of [...pair.outerOnly, ...pair.innerExamples]) {
      assert.ok(parseRat(ex.raw), `읽을 수 있음: ${exampleKey(ex)}`);
      assert.ok(!p1.has(ex.raw), `[문제 1] 답과 겹치지 않음: ${ex.raw}`);
    }
  }
});

/** 식 나무에서 나눗셈의 분모 쪽에 문자 x가 있는지 */
const hasVarDenominator = (raw: string): boolean => {
  const walk = (n: any, inDen: boolean): boolean => {
    if (!n || typeof n !== 'object') return false;
    if (n.k === 'var') return inDen;
    if (n.k === 'div') return walk(n.a, inDen) || walk(n.b, true);
    return walk(n.a, inDen) || walk(n.b, inDen);
  };
  return walk(parseRat(raw), false);
};

test('식·함수 그림: 안쪽(다항) 예시는 분모에 문자가 없고, 바깥에만 있는 예시는 분모에 문자가 있다', () => {
  for (const id of ['expr', 'function']) {
    const pair = RATIONAL_SET_PAIRS.find((p) => p.id === id)!;
    for (const ex of pair.innerExamples) assert.equal(hasVarDenominator(ex.raw), false, ex.raw);
    for (const ex of pair.outerOnly) assert.equal(hasVarDenominator(ex.raw), true, ex.raw);
  }
});

test('수 그림: 안쪽 예시는 정수, 바깥에만 있는 예시는 정수가 아닌 유리수', () => {
  const pair = RATIONAL_SET_PAIRS.find((p) => p.id === 'number')!;
  for (const ex of pair.innerExamples) assert.ok(Number.isInteger(evalRat(parseRat(ex.raw)!, 0)), ex.raw);
  for (const ex of pair.outerOnly) assert.ok(!Number.isInteger(evalRat(parseRat(ex.raw)!, 0)), exampleKey(ex));
});
