import {
  StudentRecord,
  evaluateRubricL1,
  evaluateRubricL2,
  evaluateRubricL3,
  evaluateRubricL4,
} from './mathLogic';
import { LESSON_ANSWER_CONFIG } from './answerLabels';
import type { AnswerFormat } from './answerLabels';
import type { LessonKey } from './lessonMerge';

/**
 * 교사 화면의 Func(함수와 그래프) 1~4차시 지표 — 순수 로직 (단위 테스트 대상)
 * ------------------------------------------------------------------
 * 교사 화면이 명제 수업(Props) 틀에서 만들어져 1~3차시 지표가 명제 항목(사례 수, 참·거짓 판단,
 * 탐구 주제 등)을 세고 있었습니다. Func 학생 화면은 그 항목을 입력하지 않으므로 항상 0이나
 * 엉뚱한 값이 나왔습니다. 여기서는 Func 학생 화면이 실제로 기록하는 값(문항 확인 표시와 답안)만
 * 사용합니다.
 * 4차시는 역함수 수업으로 교체됨(2026-10-30). 5~7차시는 현재 학생 화면이 명제 수업 내용(절대부등식)이므로
 * 기존 지표를 그대로 둡니다.
 */

export type LessonProgress = 'done' | 'progress' | 'none';

/** 루브릭 항목 결과로 차시 진행 상태 판정: 모두 충족 = 완료, 일부 = 진행 중, 없음 = 시작 전 */
export function lessonProgress(rubric: boolean[]): LessonProgress {
  const n = rubric.filter(Boolean).length;
  if (n === 0) return 'none';
  return n === rubric.length ? 'done' : 'progress';
}

export const LESSON_PROGRESS_LABEL: Record<LessonProgress, string> = {
  done: '완료',
  progress: '진행 중',
  none: '시작 전',
};

/** 함수 단원으로 운영 중인 차시 */
export const FUNC_LESSONS = [1, 2, 3, 4] as const;
export type FuncLesson = (typeof FUNC_LESSONS)[number];

export function funcLessonProgress(x: StudentRecord, lesson: FuncLesson): LessonProgress {
  if (lesson === 1) return lessonProgress(evaluateRubricL1(x.l1));
  if (lesson === 2) return lessonProgress(evaluateRubricL2(x.l2));
  if (lesson === 3) return lessonProgress(x.l3 ? evaluateRubricL3(x.l3) : [false]);
  return lessonProgress(x.l4 ? evaluateRubricL4(x.l4) : [false]);
}

/** 1~4차시 문항별 확인 현황 (학생 화면의 [확인] 통과 여부 기준) */
export const FUNC_ITEM_CHECKS: { title: string; done: (x: StudentRecord) => boolean }[] = [
  { title: '1차시 [생각 열기] 나라–화폐 대응', done: (x) => Boolean(x.l1.countryMapVerified) },
  { title: '1차시 [문제 1] 함수 판별·정의역·공역·치역', done: (x) => Boolean(x.l1.prob1Verified) },
  { title: '1차시 [문제 2] 정의역과 치역', done: (x) => Boolean(x.l1.prob2Verified) },
  { title: '1차시 [문제 3] 서로 같은 함수', done: (x) => Boolean(x.l1.prob3Verified) },
  {
    title: '1차시 [문제 4·5] 함수의 그래프',
    done: (x) => Boolean(x.l1.prob4_1Verified && x.l1.prob4_2Verified && x.l1.prob5Verified),
  },
  {
    title: '1차시 실생활 함수 설계',
    done: (x) => Boolean(x.l1.realLifeQuizVerified) && (x.l1.realLifeWhyFunc || '').trim().length >= 12,
  },
  { title: '2차시 [보기] 일대일함수·일대일대응', done: (x) => Boolean(x.l2.bogiVerified) },
  { title: '2차시 [문제 6] 일대일함수·일대일대응 판별', done: (x) => Boolean(x.l2.prob6Verified) },
  { title: '2차시 [문제 7] 항등함수·상수함수', done: (x) => Boolean(x.l2.prob7Verified) },
  {
    title: '2차시 [생각 넓히기] 활동 1·2',
    done: (x) => Boolean(x.l2.think1Verified && x.l2.think2Verified),
  },
  { title: '3차시 [생각 열기] 합성함수의 뜻', done: (x) => Boolean(x.l3?.openVerified) },
  { title: '3차시 [문제 1] 합성함수의 함숫값', done: (x) => Boolean(x.l3?.p1Verified) },
  { title: '3차시 교환법칙 탐구', done: (x) => Boolean(x.l3?.ex1Verified) },
  { title: '3차시 [문제 2] 합성함수 구하기', done: (x) => Boolean(x.l3?.p2Verified) },
  { title: '3차시 [생각 넓히기] 결합법칙', done: (x) => Boolean(x.l3?.thinkVerified) },
  { title: '4차시 [생각 열기] 역함수의 뜻', done: (x) => Boolean(x.l4?.openVerified) },
  { title: '4차시 [문제 1] 역함수의 함숫값', done: (x) => Boolean(x.l4?.p1Verified) },
  {
    title: '4차시 역함수 구하기 (예제·문제 2·문제 5)',
    done: (x) => Boolean(x.l4?.ex1Verified && x.l4?.p2Verified && x.l4?.p5Verified),
  },
  { title: '4차시 [함께하기·문제 3] (g∘f)⁻¹', done: (x) => Boolean(x.l4?.togetherVerified && x.l4?.p3Verified) },
  { title: '4차시 [문제 4·공학 도구] 그래프 대칭', done: (x) => Boolean(x.l4?.p4Verified && x.l4?.toolVerified) },
];

/** 1~4차시 중 완료한 차시 수(0~4)별 학생 수 — 배열의 i번째 = i개 차시 완료 */
export function completedLessonDistribution(records: StudentRecord[]): number[] {
  const dist = new Array<number>(FUNC_LESSONS.length + 1).fill(0);
  for (const x of records) {
    const n = FUNC_LESSONS.filter((l) => funcLessonProgress(x, l) === 'done').length;
    dist[n] += 1;
  }
  return dist;
}

/** [전체 답안 보기]와 같은 이름표로 CSV 값을 만듭니다 (답안 내용을 글자로 펼침). */
export function answerToCsvText(value: unknown, format?: AnswerFormat): string {
  const kind = format?.kind ?? 'text';
  if (kind === 'check') return value === true ? 'O' : '';
  if (kind === 'checks') {
    const arr = Array.isArray(value) ? value : [];
    return arr.length ? `${arr.filter(Boolean).length}/${arr.length}` : '';
  }
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') {
    if (kind === 'yesno') {
      const yes = format && 'yes' in format && format.yes ? format.yes : 'O';
      const no = format && 'no' in format && format.no ? format.no : 'X';
      return value === 'yes' ? yes : value === 'no' ? no : value;
    }
    if (kind === 'choice' && format && 'options' in format) return format.options[value] ?? value;
    return value;
  }
  if (kind === 'map' && typeof value === 'object' && !Array.isArray(value)) {
    const labels = format && 'valueLabels' in format ? format.valueLabels ?? {} : {};
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `${k}→${labels[String(v)] ?? String(v)}`)
      .join(', ');
  }
  if (kind === 'points' && Array.isArray(value)) {
    return value.map((p) => `(${(p as { x?: unknown })?.x},${(p as { y?: unknown })?.y})`).join(' ');
  }
  if (kind === 'list' && Array.isArray(value)) {
    return value.map((v, i) => `${i + 1}:${v ?? ''}`).join(', ');
  }
  return JSON.stringify(value);
}

export interface CsvColumn {
  header: string;
  value: (x: StudentRecord) => string | number;
}

/** 지정한 차시의 모든 답안 문항을 CSV 열로 (머리글은 '차시 제목 · 문항 이름') */
export function lessonAnswerCsvColumns(lessons: LessonKey[]): CsvColumn[] {
  const cols: CsvColumn[] = [];
  for (const lesson of lessons) {
    const config = LESSON_ANSWER_CONFIG[lesson];
    const short = config.title.split('·')[0].trim(); // 예: '1차시'
    for (const group of config.groups) {
      for (const field of group.fields) {
        cols.push({
          header: `${short} ${group.title} ${field.label}`.replace(/\s+/g, ' ').trim(),
          value: (x) =>
            answerToCsvText(((x[lesson] ?? {}) as unknown as Record<string, unknown>)[field.key], field.format),
        });
      }
    }
  }
  return cols;
}
