import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LESSON_ANSWER_CONFIG, isEmptyAnswer } from './answerLabels';
import { createInitialStudentState, createSampleTeacherDataset } from './mathLogic';
import { QUESTION_RULES, getQuestionStatus, lessonQuestions } from './questionStatus';
import { FullAnswerPanel } from '../components/FullAnswerPanel';
import { AnswerWithStatus } from '../components/QuestionStatusBadge';

const LESSONS = ['l1', 'l2', 'l3', 'l4'] as const;

test('1~4차시의 모든 점검 항목에 채점 규칙이 있다 (새 문항 추가 시 누락 방지)', () => {
  for (const l of LESSONS) {
    const checks = LESSON_ANSWER_CONFIG[l].groups.flatMap((g) => g.fields).filter((f) => f.format?.kind === 'check');
    for (const f of checks) assert.ok(QUESTION_RULES[l][f.key], `${l}.${f.key} 규칙 없음`);
    for (const q of lessonQuestions(l)) assert.ok(q.inputKeys.length > 0, `${l}.${q.verifiedKey} 입력 칸 없음`);
  }
});

test('빈 활동지: 모든 문항이 미작성', () => {
  const r = createInitialStudentState();
  for (const l of LESSONS) {
    for (const q of lessonQuestions(l)) {
      assert.equal(getQuestionStatus(l, q.verifiedKey, r[l])?.status, 'empty', `${l}.${q.verifiedKey}`);
    }
  }
});

test('예시 학생의 맞는 답: 점검을 눌렀으면 확인 완료, 점검 표시를 지우면 "점검"(오답 아님)', () => {
  let checked = 0;
  for (const s of createSampleTeacherDataset()) {
    for (const l of LESSONS) {
      const data = s[l] as unknown as Record<string, unknown>;
      for (const q of lessonQuestions(l)) {
        if (data[q.verifiedKey] !== true) continue;
        // 예시 데이터 중에는 확인 표시만 있고 입력이 비어 있는 것이 있음(예: 실생활 판별) — 비교 대상에서 제외
        if (q.inputKeys.every((k) => isEmptyAnswer(data[k]))) continue;
        assert.equal(getQuestionStatus(l, q.verifiedKey, data)?.status, 'done');
        const r = getQuestionStatus(l, q.verifiedKey, { ...data, [q.verifiedKey]: false });
        assert.equal(r?.status, 'unchecked', `${s.code} ${l}.${q.verifiedKey}: ${r?.note}`);
        checked++;
      }
    }
  }
  assert.ok(checked >= 20, `확인한 문항 수 ${checked}`);
});

function l3OpenState(over: Record<string, unknown>) {
  return {
    ...createInitialStudentState().l3,
    openAramPrice: '3000',
    openJaeyoungPrice: '4000',
    openHayoungPrice: '2000',
    openDomainToCodomainChoice: 'X_to_Z',
    openMeaningReason: 'f를 먼저 적용한 뒤 g를 적용한다.',
    openVerified: false,
    ...over,
  };
}

test('3차시 생각 열기: 점검 / 오답 / 미작성 구분', () => {
  assert.equal(getQuestionStatus('l3', 'openVerified', l3OpenState({}))?.status, 'unchecked');
  assert.equal(getQuestionStatus('l3', 'openVerified', l3OpenState({ openVerified: true }))?.status, 'done');

  // 답은 맞고 이유만 비었거나 짧음 → 점검 (사용자 결정)
  const shortReason = getQuestionStatus('l3', 'openVerified', l3OpenState({ openMeaningReason: '몰라' }));
  assert.equal(shortReason?.status, 'unchecked');
  assert.match(shortReason?.note ?? '', /이유 서술 부족/);
  assert.equal(getQuestionStatus('l3', 'openVerified', l3OpenState({ openMeaningReason: '' }))?.status, 'unchecked');

  // 답 칸이 아직 비어 있음 → 점검(작성 중)
  const partial = getQuestionStatus('l3', 'openVerified', l3OpenState({ openJaeyoungPrice: '' }));
  assert.equal(partial?.status, 'unchecked');
  assert.match(partial?.note ?? '', /빈 칸 1개/);

  // 모두 채웠는데 틀림 → 오답 + 채점 안내문
  const wrong = getQuestionStatus('l3', 'openVerified', l3OpenState({ openAramPrice: '5000' }));
  assert.equal(wrong?.status, 'wrong');
  assert.match(wrong?.note ?? '', /아람/);
  // 틀린 답 + 이유 부족 → 오답이 우선
  assert.equal(getQuestionStatus('l3', 'openVerified', l3OpenState({ openAramPrice: '5000', openMeaningReason: '' }))?.status, 'wrong');
});

test('1차시 문제 1: 이유를 길게 썼지만 필요한 원소 번호가 없으면 오답', () => {
  const sample = createSampleTeacherDataset().find((s) => s.l1.prob1Verified)!;
  const base = { ...sample.l1, prob1Verified: false };
  assert.equal(getQuestionStatus('l1', 'prob1Verified', base)?.status, 'unchecked');
  const noNumber = getQuestionStatus('l1', 'prob1Verified', { ...base, prob1_1Reason: '대응하지 않는 원소가 있어서 함수가 아니다' });
  assert.equal(noNumber?.status, 'wrong');
});

test('모든 칸이 빈 표(3번 표 기본값)는 입력 없음으로 본다', () => {
  assert.equal(isEmptyAnswer({ f0: '', f1: '', gm1: '', g1: '' }), true);
  assert.equal(isEmptyAnswer({ f0: '0', f1: '' }), false);
  assert.equal(isEmptyAnswer({}), true);
});

test('전체 답안 보기: 확인 줄에 점검·오답·미작성이 표시된다', () => {
  const r = createInitialStudentState();
  Object.assign(r.l3, l3OpenState({}));
  r.l3.p1_1_f2 = '5';
  r.l3.p1_1_ans = '24';
  r.l3.p1_2_gm1 = '0';
  r.l3.p1_2_ans = '1';
  r.l3.p1_3_fm3 = '-5';
  r.l3.p1_3_ans = '-8';
  r.l3.p1Reason = '대입해서 차례로 계산했다.';
  const html = renderToStaticMarkup(<FullAnswerPanel record={r} initiallyOpen />);
  assert.ok(html.includes('data-status="unchecked"'), '점검');
  assert.ok(html.includes('data-status="wrong"'), '오답');
  assert.ok(html.includes('data-status="empty"'), '미작성');
});

test('상세 비교 칸: 요약이 비어도 문항별 상태를 보여 주고, 모두 끝났으면 답만 보여 준다', () => {
  const l3 = l3OpenState({});
  const html = renderToStaticMarkup(
    <AnswerWithStatus lesson="l3" lessonData={l3} value="" questions={['openVerified', 'p1Verified']} />
  );
  assert.ok(html.includes('생각 열기:') && html.includes('data-status="unchecked"'));
  assert.ok(html.includes('문제 1:') && html.includes('data-status="empty"'));

  const allEmpty = renderToStaticMarkup(
    <AnswerWithStatus lesson="l3" lessonData={createInitialStudentState().l3} value="" questions={['openVerified']} />
  );
  assert.ok(allEmpty.includes('미작성') && !allEmpty.includes('생각 열기:'));

  const done = renderToStaticMarkup(
    <AnswerWithStatus lesson="l3" lessonData={{ ...l3, openVerified: true }} value="학생 요약" questions={['openVerified']} />
  );
  assert.ok(done.includes('학생 요약') && !done.includes('data-status'));
});
