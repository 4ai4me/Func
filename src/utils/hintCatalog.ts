import { LESSON_STORAGE_KEY, PROOF7_PROB1_STEPS, PROOF7_PROB2_STEPS, type StudentRecord } from './mathLogic';
import { hintLevelKey, hintOpenCount, type HintOpens } from './hintLog';

/**
 * 차시별 힌트 목록 — 교사 화면 '힌트 사용 현황'·학생 상세 화면의 표 머리글
 *
 * - id: 학생 화면에서 기록하는 힌트 이름 (각 Lesson{N}View의 toggleHint 이름과 같음)
 * - levels: 단계가 있는 힌트(8차시)의 단계 수 — 열기 = id, N단계 더 보기 = id@N (N ≥ 2)
 * - 힌트 버튼을 새로 만들면 여기에도 추가합니다(hintCatalog.test.ts가 화면 코드의 이름과 대조).
 * - 5차시는 4차시와 저장 칸(l4)을 함께 쓰지만 힌트 이름이 겹치지 않습니다(p3·reflection은 5차시).
 */

export type HintLessonNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface HintDef {
  id: string;
  /** 교사 화면에 보일 위치·내용 */
  label: string;
  /** 단계 수 (단계 힌트만) */
  levels?: number;
  /** 처음부터 열려 있는 힌트 (다시 연 횟수만 셈) */
  openByDefault?: boolean;
}

export interface LessonHintCatalog {
  lesson: HintLessonNumber;
  title: string;
  hints: HintDef[];
}

/** 8차시 단계 힌트 수 (Lesson8View의 STEP1_HINTS·STEP3_HINTS) */
export const L8_STEP_HINT_LEVELS = 3;

const proofStepHints = (prefix: 'prob1' | 'prob2', steps: readonly { hints: readonly string[] }[], title: string): HintDef[] =>
  steps.map((s, i) => ({ id: `${prefix}_s${i + 1}`, label: `${title} Step 0${i + 1}`, levels: s.hints.length }));

export const HINT_CATALOG: readonly LessonHintCatalog[] = [
  {
    lesson: 1,
    title: '1차시 · 함수의 뜻과 그래프',
    hints: [
      { id: 'countryMapHint', label: '[생각 열기] 나라와 화폐 연결' },
      { id: 'prob1_1', label: '[문제 1] (1) 이유 서술' },
      { id: 'prob1_2', label: '[문제 1] (2) 정의역·공역·치역 작성' },
      { id: 'prob1_3', label: '[문제 1] (3) 이유 서술' },
      { id: 'prob1', label: '[문제 1] 전체 힌트' },
      { id: 'prob2_1_graph', label: '[문제 2] (1) 그래프 힌트', openByDefault: true },
      { id: 'prob2_1_hint', label: '[문제 2] (1) 작성 형식' },
      { id: 'prob2_2_graph', label: '[문제 2] (2) 그래프 힌트', openByDefault: true },
      { id: 'prob2_2_hint', label: '[문제 2] (2) 작성 형식' },
      { id: 'prob3_hint', label: '[문제 3] 풀이' },
      { id: 'prob5_2_hint', label: '[문제 5] (2) 서술' },
      { id: 'prob5_3_hint', label: '[문제 5] (3) 서술' },
      { id: 'prob5_hint', label: '[문제 5] 풀이' },
      { id: 'realLife1', label: '[활동 2] 실생활 함수 설계서 1번' },
      { id: 'realLife2', label: '[활동 2] 실생활 함수 설계서 2번' },
      { id: 'realLife3', label: '[활동 2] 실생활 함수 설계서 3번' },
      { id: 'realLife4', label: '[활동 2] 실생활 함수 설계서 4번' },
      { id: 'realLife5', label: '[활동 2] 실생활 함수 설계서 5번' },
      { id: 'aiExplainHint', label: '[도전] AI 미션 1 · 세 기계 차이 설명' },
      { id: 'aiReflectionHint', label: '[도전] AI 미션 2 · 수리 성찰' },
      { id: 'vendExplainHint', label: '[도전] 자판기 미션 1 · 설명' },
      { id: 'setExplainHint', label: '[도전] 자판기 미션 3 · 공역 재정의' },
    ],
  },
  {
    lesson: 2,
    title: '2차시 · 여러 가지 함수',
    hints: [
      { id: 'bogi2_hint', label: '[보기 ②] 서술' },
      { id: 'prob6_non_hint', label: '[문제 6] (2)·(3) 반례' },
      { id: 'prob6_bij_hint', label: '[문제 6] (1)·(4) 치역·공역' },
      { id: 'prob7_hint', label: '[문제 7] (2) 그래프' },
      { id: 'think1_bij_hint', label: '[생각 넓히기] 활동 1-(1) 일대일대응' },
      { id: 'think1_const_hint', label: '[생각 넓히기] 활동 1-(2) 상수함수' },
      { id: 'think2_id_hint', label: '[생각 넓히기] 활동 2-(1) 항등함수' },
      { id: 'think2_const_hint', label: '[생각 넓히기] 활동 2-(2) 상수함수' },
      { id: 'l2_reflection_hint', label: '[성찰] 2차시 배움 성찰' },
    ],
  },
  {
    lesson: 3,
    title: '3차시 · 합성함수 탐구',
    hints: [
      { id: 'openPrices', label: '[생각 열기] 음식 가격' },
      { id: 'openMeaning', label: '[생각 열기] 합성함수의 뜻' },
      { id: 'prob1Calc', label: '[문제 1] 단계별 계산' },
      { id: 'prob1Reason', label: '[문제 1] 이유 서술' },
      { id: 'ex1Hint', label: '[예제 1]' },
      { id: 'prob2Hint', label: '[문제 2]' },
      { id: 'coupon_m2', label: '[쿠폰 탐구] 미션 2' },
      { id: 'coupon_m3', label: '[쿠폰 탐구] 미션 3' },
      { id: 'coupon_m4', label: '[쿠폰 탐구] 미션 4' },
      { id: 'thinkHint', label: '[생각 넓히기] 단계별 유도' },
      { id: 'reflectionHint', label: '[성찰] 3차시 마무리' },
    ],
  },
  {
    lesson: 4,
    title: '4차시 · 역함수의 뜻과 구하기',
    hints: [
      { id: 'openMap', label: '[생각 열기] 화살표 뒤집기' },
      { id: 'openCond', label: '[생각 열기] 함수가 되는 조건' },
      { id: 'openReason', label: '[생각 열기] 이유 서술' },
      { id: 'p1', label: '[문제 1] 역함수의 함숫값' },
      { id: 'p2', label: '[문제 2] 역함수 구하기' },
      { id: 'reflect4', label: '[성찰] 4차시' },
    ],
  },
  {
    lesson: 5,
    title: '5차시 · 역함수의 성질과 그래프',
    hints: [
      { id: 'p3', label: '[함께하기] □ 안에 알맞은 것' },
      { id: 'reflection', label: '[문제 4]·성찰' },
    ],
  },
  {
    lesson: 6,
    title: '6차시 · 유리식과 유리함수의 정의역',
    hints: [
      { id: 'open', label: '[생각 열기] 구리의 비율' },
      { id: 'p1', label: '[문제 1] 다항식이 아닌 유리식' },
      { id: 'ex1', label: '[예제 1] 유리식의 계산' },
      { id: 'p2', label: '[문제 2] 유리식의 계산' },
      { id: 'p3', label: '[문제 3] 정의역' },
      { id: 'reflection', label: '[성찰] 6차시' },
    ],
  },
  {
    lesson: 7,
    title: '7차시 · 유리함수의 그래프',
    hints: [
      { id: 'tg', label: '[함께하기] y = k/x의 그래프' },
      { id: 'p4', label: '[문제 4]' },
      { id: 'p5', label: '[문제 5]' },
      { id: 'ex2', label: '[예제 2]' },
      { id: 'p6', label: '[문제 6]' },
      { id: 'reflection', label: '[성찰] 7차시' },
    ],
  },
  {
    lesson: 8,
    title: '8차시 · 절댓값 부등식 (예전 화면)',
    hints: [
      { id: 'step1', label: '[탐구] 절댓값 부등식의 증명 원리', levels: L8_STEP_HINT_LEVELS },
      ...proofStepHints('prob1', PROOF7_PROB1_STEPS, '[문제 1]'),
      { id: 'step3', label: '[탐구] 경우 나누기 원리', levels: L8_STEP_HINT_LEVELS },
      ...proofStepHints('prob2', PROOF7_PROB2_STEPS, '[문제 2]'),
    ],
  },
];

export function catalogOf(lesson: HintLessonNumber): LessonHintCatalog {
  return HINT_CATALOG.find((c) => c.lesson === lesson) ?? { lesson, title: `${lesson}차시`, hints: [] };
}

/** 학생 기록에서 그 차시의 힌트 횟수 묶음 */
export function hintOpensOf(record: StudentRecord | null | undefined, lesson: HintLessonNumber): HintOpens | undefined {
  if (!record) return undefined;
  const key = LESSON_STORAGE_KEY[lesson];
  const lessonData = record[key] as { hintOpens?: HintOpens } | undefined;
  return lessonData?.hintOpens;
}

/** 표의 한 칸: 단계 힌트는 [열기, 2단계, 3단계, …], 보통 힌트는 [열기] */
export function hintCounts(opens: HintOpens | undefined, def: HintDef): number[] {
  const out = [hintOpenCount(opens, def.id)];
  for (let lv = 2; lv <= (def.levels ?? 1); lv += 1) out.push(hintOpenCount(opens, hintLevelKey(def.id, lv)));
  return out;
}

/** 칸에 보일 글자: '3' 또는 '열기 3 · 2단계 1 · 3단계 0' */
export function formatHintCounts(counts: number[]): string {
  if (counts.length <= 1) return String(counts[0] ?? 0);
  return counts.map((n, i) => (i === 0 ? `열기 ${n}` : `${i + 1}단계 ${n}`)).join(' · ');
}

/** 학생 한 명의 그 차시 힌트 연 횟수 합계 (단계 더 보기 포함) */
export function studentHintTotal(record: StudentRecord, lesson: HintLessonNumber): number {
  const opens = hintOpensOf(record, lesson);
  return catalogOf(lesson).hints.reduce((sum, def) => sum + hintCounts(opens, def).reduce((a, b) => a + b, 0), 0);
}

export interface HintSummaryRow {
  def: HintDef;
  /** 한 번 이상 연 학생 수 */
  students: number;
  /** 열기(단계 힌트는 단계별) 총 횟수 */
  totals: number[];
}

/** 차시의 힌트별 요약: 연 학생 수·총 횟수 */
export function summarizeHints(records: readonly StudentRecord[], lesson: HintLessonNumber): HintSummaryRow[] {
  return catalogOf(lesson).hints.map((def) => {
    let students = 0;
    const totals = new Array<number>(Math.max(1, def.levels ?? 1)).fill(0);
    for (const r of records) {
      const c = hintCounts(hintOpensOf(r, lesson), def);
      if (c.some((n) => n > 0)) students += 1;
      c.forEach((n, i) => (totals[i] += n));
    }
    return { def, students, totals };
  });
}
