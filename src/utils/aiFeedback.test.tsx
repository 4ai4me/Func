import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  DEFAULT_GEMINI_MODEL,
  buildLessonAnswerDigest,
  describeGeminiError,
  lessonHasAnswers,
  parseFeedbackJson,
  requestLessonFeedback,
} from './aiFeedback';
import { createInitialStudentState, type StudentRecord } from './mathLogic';
import { teacherJson } from './lessonMerge';
import { AiFeedbackPanel } from '../components/AiFeedbackPanel';

function sampleRecord(): StudentRecord {
  const r = createInitialStudentState();
  r.group = '비밀고 1학년 3반';
  r.code = '10301_홍길동';
  r.l3.openAramPrice = '3000';
  r.l3.openMeaningReason = '3차시만의고유답안 f를 먼저 계산한다';
  r.l3.helpSource = 'ai';
  r.l4.p1Reason = '4차시만의고유답안';
  return r;
}

test('보내는 글: 그 차시 답안·문항 상태만 있고, 이름·반·번호·도움 받은 정도·다른 차시 답은 없다', () => {
  const d = buildLessonAnswerDigest(sampleRecord(), 'l3');
  assert.ok(d.includes('3차시만의고유답안'));
  assert.ok(d.includes('(생각 열기 상태) 점검') || d.includes('(생각 열기 상태)'), '문항 상태 포함');
  for (const secret of ['홍길동', '10301', '비밀고', '3반', '4차시만의고유답안', '도움 받은 정도', 'AI 도움']) {
    assert.ok(!d.includes(secret), `포함되면 안 됨: ${secret}`);
  }
});

test('답이 없는 차시는 버튼을 쓸 수 없다', () => {
  const r = sampleRecord();
  assert.equal(lessonHasAnswers(r, 'l3'), true);
  assert.equal(lessonHasAnswers(r, 'l2'), false);
  for (const l of ['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7'] as const) {
    assert.equal(lessonHasAnswers(createInitialStudentState(), l), false, `빈 기록 ${l}`);
  }
  const onlyHelp = createInitialStudentState();
  onlyHelp.l1.helpSource = 'self';
  assert.equal(lessonHasAnswers(onlyHelp, 'l1'), false, '도움 받은 정도만 고른 것은 답안이 아님');
});

test('AI 요청: 정해진 주소·키 헤더로 한 차시만 보내고, 응답에서 피드백 두 칸을 꺼낸다', async () => {
  const calls: { url: string; init: RequestInit }[] = [];
  const fakeFetch = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(
      JSON.stringify({ candidates: [{ content: { parts: [{ text: '{"feedback":"잘했어요.","nextStep":"다음엔 이렇게 해 보세요."}' }] } }] }),
      { status: 200 }
    );
  }) as unknown as typeof fetch;
  const out = await requestLessonFeedback({ apiKey: ' KEY123 ', model: '', record: sampleRecord(), lesson: 'l3', fetchImpl: fakeFetch });
  assert.deepEqual(out, { feedback: '잘했어요.', nextStep: '다음엔 이렇게 해 보세요.' });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_GEMINI_MODEL}:generateContent`);
  assert.equal((calls[0].init.headers as Record<string, string>)['x-goog-api-key'], 'KEY123');
  const body = String(calls[0].init.body);
  assert.ok(body.includes('3차시만의고유답안') && !body.includes('4차시만의고유답안') && !body.includes('홍길동'));
  assert.ok(!calls[0].url.includes('KEY123'), '키를 주소에 넣지 않음');
});

test('AI 요청 실패·키 없음은 알아들을 수 있는 문구로 알린다', async () => {
  await assert.rejects(requestLessonFeedback({ apiKey: '', model: '', record: sampleRecord(), lesson: 'l3' }), /API 키/);
  await assert.rejects(
    requestLessonFeedback({ apiKey: 'k', model: 'bad model!', record: sampleRecord(), lesson: 'l3' }),
    /모델 이름/
  );
  const failing = (async () => new Response('{"error":{"message":"API key not valid"}}', { status: 400 })) as unknown as typeof fetch;
  await assert.rejects(
    requestLessonFeedback({ apiKey: 'k', model: '', record: sampleRecord(), lesson: 'l3', fetchImpl: failing }),
    /API 키가 올바르지/
  );
  assert.match(describeGeminiError(429, ''), /한도/);
  assert.match(describeGeminiError(404, ''), /모델/);
});

test('답이 없는 차시도 요청할 수 있고, 지시문에 빈 답안일 때의 규칙이 있다', async () => {
  let body = '';
  const fakeFetch = (async (_url: string, init: RequestInit) => {
    body = String(init.body);
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: '{"feedback":"시작해 봐요.","nextStep":"생각 열기부터."}' }] } }] }));
  }) as unknown as typeof fetch;
  const out = await requestLessonFeedback({ apiKey: 'k', model: '', record: createInitialStudentState(), lesson: 'l2', fetchImpl: fakeFetch });
  assert.equal(out.feedback, '시작해 봐요.');
  assert.ok(body.includes('(비어 있음)'));
  assert.ok(body.includes('비어 있으면 칭찬할 내용을 지어내지'));
});

test('응답 읽기: 코드 블록으로 감싼 JSON도 읽고, 내용이 없으면 오류', () => {
  assert.deepEqual(parseFeedbackJson('```json\n{"feedback":"a","nextStep":"b"}\n```'), { feedback: 'a', nextStep: 'b' });
  assert.throws(() => parseFeedbackJson('그냥 글'));
  assert.throws(() => parseFeedbackJson('{"x":1}'));
});

test('화면을 열기만 해서는 AI를 부르지 않는다 (버튼을 눌러야 함)', () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = (async () => {
    calls++;
    return new Response('{}');
  }) as typeof fetch;
  try {
    const html = renderToStaticMarkup(
      <AiFeedbackPanel record={sampleRecord()} drafts={{}} onDraftChange={() => {}} idPrefix="t" />
    );
    assert.ok(html.includes('3차시 AI 피드백') && html.includes('1차시 AI 피드백'), '차시별 버튼');
    assert.ok(html.includes('선생님만 보임'));
    // 답이 없는 차시·키가 없어도 버튼은 켜져 있음 (사용자 요청 2026-11-05)
    const buttons = [...html.matchAll(/<button[^>]*>(?:(?!<\/button>).)*?AI 피드백(?:(?!<\/button>).)*?<\/button>/gs)].map((m) => m[0]);
    assert.equal(buttons.length, 8, '1~8차시 (4·5차시 따로)');
    assert.ok(html.includes('4차시 AI 피드백') && html.includes('5차시 AI 피드백') && html.includes('8차시 AI 피드백'));
    for (const b of buttons) assert.ok(!/\sdisabled=""/.test(b), `꺼진 버튼: ${b.slice(0, 80)}`);
    assert.ok(html.includes('· 답 없음'), '답 없는 차시 표시');
  } finally {
    globalThis.fetch = original;
  }
  assert.equal(calls, 0);
});

test('AI 초안은 학생이 읽는 교사 평가 문서에 들어가지 않는다', () => {
  const r = sampleRecord();
  const json = teacherJson(r);
  assert.ok(!json.includes('draft') && !json.includes('AI 초안'));
  assert.deepEqual(Object.keys(JSON.parse(json)).sort(), ['evaluation', 'teacherMemo'].filter((k) => k in JSON.parse(json)).sort());
});

test('학생 화면 코드는 AI 피드백 모듈을 쓰지 않는다 (교사 화면에서만 사용)', () => {
  const src = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const allowed = new Set(['components/TeacherView.tsx', 'components/AiFeedbackPanel.tsx', 'utils/aiFeedback.ts']);
  const users: string[] = [];
  const walk = (dir: string) => {
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, f.name);
      if (f.isDirectory()) walk(full);
      else if (/\.tsx?$/.test(f.name) && !/\.test\.tsx?$/.test(f.name)) {
        const rel = path.relative(src, full).split(path.sep).join('/');
        const text = fs.readFileSync(full, 'utf8');
        if (/from '\.{1,2}\/(?:components\/|utils\/)?(?:AiFeedbackPanel|aiFeedback)'/.test(text) && !allowed.has(rel)) users.push(rel);
      }
    }
  };
  walk(src);
  assert.deepEqual(users, []);
});

test('4·5차시 AI 요청은 그 차시 문항만 보내고, 도움 받은 정도(4·5차시 모두)는 보내지 않는다', () => {
  const r = sampleRecord();
  r.l4.l4HelpSource = 'ai';
  r.l4.helpSource = 'hint';
  const d4 = buildLessonAnswerDigest(r, 'l4');
  const d5 = buildLessonAnswerDigest(r, 'l4b');
  assert.ok(d4.startsWith('[4차시') && d5.startsWith('[5차시'));
  assert.ok(d4.includes('예제') && !d4.includes('(g∘f)⁻¹(x)'), '4차시에 5차시 문항 없음');
  assert.ok(d5.includes('(g∘f)⁻¹(x)') && !d5.includes('예제 y = 3x + 4'), '5차시에 4차시 문항 없음');
  for (const d of [d4, d5]) {
    assert.ok(!d.includes('해결 방법') && !d.includes('AI 도움') && !d.includes('힌트 도움'), '도움 받은 정도는 보내지 않음');
  }
});
