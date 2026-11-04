import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createInitialStudentState } from '../utils/mathLogic';

/**
 * 규칙: 학생이 서술하는 모든 칸(textarea)에는 글자 수 표시(CharCountBadge)가 있어야 한다.
 * (2026-11-04: 3차시를 새로 만들 때 글자 수 표시가 빠졌던 일의 재발 방지)
 *
 * src/components/Lesson{N}View.tsx 파일을 모두 찾아 각 단계 화면을 그린 뒤,
 * 서술 칸 수와 글자 수 표시 수가 같은지 검사한다. 새 차시 파일을 추가해도 자동으로 검사된다.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const lessonFiles = fs
  .readdirSync(here)
  .map((f) => /^Lesson(\d+)View\.tsx$/.exec(f))
  .filter((m): m is RegExpExecArray => m !== null)
  .map((m) => ({ file: m[0], lesson: Number(m[1]) }))
  .sort((a, b) => a.lesson - b.lesson);

const noop = () => {};
const MAX_STEP = 8;

test('차시 화면 파일을 찾았다 (검사 대상이 비어 있지 않음)', () => {
  assert.ok(lessonFiles.length >= 4, `찾은 파일: ${lessonFiles.map((x) => x.file).join(', ')}`);
});

for (const { file, lesson } of lessonFiles) {
  test(`${lesson}차시(${file}): 모든 서술 칸에 글자 수 표시가 있다`, async () => {
    const mod = (await import(`./${file.replace('.tsx', '')}`)) as Record<string, unknown>;
    const View = mod[`Lesson${lesson}View`] as React.ComponentType<Record<string, unknown>>;
    assert.ok(View, `Lesson${lesson}View를 내보내야 합니다`);
    const state = (createInitialStudentState() as unknown as Record<string, unknown>)[`l${lesson}`] ?? {};

    let totalTextareas = 0;
    for (let step = 0; step <= MAX_STEP; step++) {
      const props: Record<string, unknown> = {
        state,
        step,
        onStepChange: noop,
        onUpdate: noop,
        onRequestConfirm: noop,
      };
      for (let n = 1; n <= 12; n++) props[`onGoToLesson${n}`] = noop;
      const html = renderToStaticMarkup(<View {...props} />);
      const ids = [...html.matchAll(/<textarea[^>]*\bid="([^"]*)"/g)].map((m) => m[1]);
      const badges = (html.match(/현재 <strong[^>]*>\d+<\/strong>자 \/ 최소/g) || []).length;
      totalTextareas += ids.length;
      assert.equal(
        badges,
        ids.length,
        `${lesson}차시 ${step + 1}단계: 서술 칸 ${ids.length}개(${ids.join(', ')})에 글자 수 표시 ${badges}개 — ` +
          'CharCountBadge(1·2차시)나 ReasonInput min(4차시)처럼 글자 수 표시를 붙여 주세요.'
      );
    }
    assert.ok(totalTextareas > 0, `${lesson}차시에서 서술 칸을 하나도 찾지 못했습니다 (검사 방식 확인 필요)`);
  });
}
