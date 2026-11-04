import React from 'react';
import { AnswerText } from './AnswerText';
import {
  QUESTION_STATUS_LABEL,
  QuestionStatusResult,
  StatusLessonKey,
  getQuestionStatuses,
} from '../utils/questionStatus';

/** 문항 상태 표시: ✓ 확인 완료(초록) · 점검(노랑) · 오답(주황) · 미작성(빨강) */
const TONE: Record<QuestionStatusResult['status'], string> = {
  done: 'font-bold text-emerald-700',
  unchecked: 'rounded-md border border-amber-300 bg-amber-100 px-1.5 py-0.5 font-extrabold text-amber-800',
  wrong: 'rounded-md border border-orange-300 bg-orange-100 px-1.5 py-0.5 font-extrabold text-orange-800',
  empty: 'font-bold text-rose-600',
};

export function QuestionStatusBadge({ result }: { result: QuestionStatusResult }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span className={TONE[result.status]} data-status={result.status}>
        {QUESTION_STATUS_LABEL[result.status]}
      </span>
      {result.note && result.status !== 'done' && (
        <span className="text-[11px] font-semibold text-slate-500">{result.note}</span>
      )}
    </span>
  );
}

/**
 * 교사 상세 비교 칸: 요약 답안 + (끝나지 않은 문항이 있으면) 문항별 상태.
 * 요약 답안은 학생이 점검을 통과해야 채워지는 경우가 많아, 비어 있다고 모두 '미작성'은 아니다.
 */
export function AnswerWithStatus({
  lesson,
  lessonData,
  value,
  questions,
  math = false,
}: {
  lesson: StatusLessonKey;
  lessonData: unknown;
  value: unknown;
  /** 이 칸에 해당하는 문항의 확인 항목 이름 (예: ['p1Verified']) */
  questions: string[];
  math?: boolean;
}) {
  const statuses = getQuestionStatuses(lesson, questions, lessonData);
  const pending = statuses.filter((s) => s.status !== 'done');
  const hasValue = !(value === null || value === undefined || String(value).trim() === '');

  // 문항이 하나뿐이고 아무것도 안 했으면 예전처럼 '미작성' 한 단어
  if (!hasValue && statuses.length > 0 && statuses.every((s) => s.status === 'empty')) {
    return <QuestionStatusBadge result={{ status: 'empty' }} />;
  }
  return (
    <>
      {(hasValue || statuses.length === 0) && <AnswerText value={value} math={math} />}
      {pending.length > 0 && (
        <ul className={`${hasValue ? 'mt-2 border-t border-dashed border-slate-200 pt-2' : ''} space-y-1 text-xs`}>
          {pending.map((s) => (
            <li key={s.verifiedKey} className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-slate-600">{s.label}:</span>
              <QuestionStatusBadge result={s} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
