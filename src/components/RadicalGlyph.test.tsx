import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createInitialStudentState, createFuncSampleLessons, STAGE_TITLES } from '../utils/mathLogic';
import { Lesson8View } from './Lesson8View';
import { Lesson9View } from './Lesson9View';

/**
 * 규칙: 8·9차시 화면의 근호는 MathText·Root(윗줄이 있는 근호)로 그린다.
 * 글꼴 '√'는 윗줄이 없어 근호가 위에서 잘린 것처럼 보인다 (2026-11-20 수정).
 * 화면에 보이는 글자에서 '√'를 찾는다. 읽기 프로그램용 sr-only 글자, 속성값(aria-label 등), 학생이 쓴 서술 칸은 뺀다.
 */
function visibleText(html: string): string {
  return html
    .replace(/<(\w+) class="sr-only">[^<]*<\/\1>/g, '')
    .replace(/<textarea[\s\S]*?<\/textarea>/g, '')
    .replace(/<[^>]+>/g, ' ');
}

const noop = () => {};
const states: [string, unknown][] = [
  ['빈 기록', createInitialStudentState().l7],
  ['완료 기록', createFuncSampleLessons('complete').l7],
];

for (const [lesson, View] of [
  [8, Lesson8View],
  [9, Lesson9View],
] as const) {
  for (const [label, state] of states) {
    test(`${lesson}차시 ${label}: 화면 글자에 윗줄 없는 글꼴 근호(√)가 없다`, () => {
      for (let step = 0; step < STAGE_TITLES[lesson].length; step++) {
        const html = renderToStaticMarkup(
          <View state={state as never} step={step} onStepChange={noop} onUpdate={noop} onRequestConfirm={noop} onGoToLesson9={noop} />,
        );
        const text = visibleText(html);
        const hits = [...text.matchAll(/[^ ]{0,20}√[^ ]{0,20}/g)].map((m) => m[0]);
        assert.deepEqual(hits, [], `${lesson}차시 ${step + 1}단계에 글꼴 √: ${hits.join(' | ')} — MathText로 감싸 주세요.`);
      }
    });
  }
}

