/**
 * 교사 화면: 1~5차시 문항(점검 버튼이 있는 문제)마다 학생이 어디까지 했는지 구분한다.
 *
 *   done      ✓ 확인 완료 — 학생이 점검을 눌러 통과함
 *   unchecked 점검        — 입력은 했지만 점검을 누르지 않음
 *                           (답은 맞았는데 이유 칸만 비었거나 짧은 경우, 빈 칸이 남은 경우 포함)
 *   wrong     오답        — 답 칸을 모두 채웠지만 채점 기준에 맞지 않음
 *   empty     미작성      — 이 문항에 입력한 것이 하나도 없음
 *
 * 채점은 학생 화면의 [점검] 버튼과 같은 함수(validate…)를 그대로 쓴다.
 * 문항에 속한 입력 칸은 answerLabels.ts의 순서(같은 묶음 안에서 앞 확인 항목 다음부터 이 확인 항목 전까지)로 정한다.
 */
import { LESSON_ANSWER_CONFIG, isEmptyAnswer, type AnswerLessonKey } from './answerLabels';
import {
  L3_MIN_REASON,
  validateL1CountryMap,
  validateL1Prob1,
  validateL1Prob2,
  validateL1Prob3,
  validateL1Prob4_1Points,
  validateL1Prob4_2Line,
  validateL1Prob5,
  validateL1AiMission,
  validateL1VendMission1,
  validateL1VendMission3,
  validateL2Bogi,
  validateL2Prob6,
  validateL2Prob7,
  validateL2Think1,
  validateL2Think2,
  validateL3Open,
  validateL3Prob1,
  validateL3Ex1,
  validateL3Prob2,
  validateL3Think,
  type Lesson1State,
  type Lesson2State,
  type Lesson3State,
  type Lesson4State,
  type Lesson5State,
  type Lesson6State,
  type Lesson7State,
} from './mathLogic';
import { validateL1RealLifeQuiz } from './lesson1Quiz';
import { validateCouponM1, validateCouponM2, validateCouponM3, validateCouponM4 } from './lesson3Coupon';
import {
  MIN_REASON as L4_MIN_REASON,
  validateL4Open,
  validateL4Prob1,
  validateL4Ex1,
  validateL4Prob2,
  validateL4Prob5,
  validateL4Together,
  validateL4Prob3,
  validateL4Prob4,
  validateL4Tool,
} from './lesson4Logic';
import { L6_MIN_REASON, validateL6Open, validateL6Prob1, validateL6Ex1, validateL6Prob2, validateL6Prob3 } from './lesson6Logic';
import {
  L7_MIN_REASON,
  validateL7Together,
  validateL7Prob4,
  validateL7Think,
  validateL7Prob5,
  validateL7Ex2,
  validateL7Prob6,
} from './lesson7Logic';
import {
  L8_MIN_REASON,
  validateL8Open,
  validateL8Prob1,
  validateL8Ex1,
  validateL8Prob2,
  validateL8Prob3,
  validateL8Sqrt,
  validateL8Prob4,
  validateL8Prob5,
  validateL8Prob6,
  validateL8Ex2,
  validateL8Prob7,
} from './lesson8Logic';

export type QuestionStatus = 'done' | 'unchecked' | 'wrong' | 'empty';
/** 문항 상태를 구분하는 차시 (답안 묶음 이름 — 'l4b'는 5차시(저장 칸 l4), 'l5'·'l6'·'l7'은 6·7·8차시, 'l7b'는 9차시(저장 칸 l7)) */
export type StatusLessonKey = 'l1' | 'l2' | 'l3' | 'l4' | 'l4b' | 'l5' | 'l6' | 'l7' | 'l7b';

export interface QuestionStatusResult {
  status: QuestionStatus;
  /** 오답일 때: 학생 화면 채점 안내문 / 점검일 때: 짧은 설명 */
  note?: string;
}

type Validate = (data: Record<string, unknown>) => { ok: boolean; message: string };

interface QuestionRule {
  validate: Validate;
  /** 이유(서술) 칸과 최소 글자 수 — 이 칸만 부족하면 '오답'이 아니라 '점검' */
  reasons?: Record<string, number>;
}

const as = <T,>(f: (p: T) => { ok: boolean; message: string }): Validate => (d) => f(d as unknown as T);

/** 확인 항목 이름 → 채점 규칙 */
export const QUESTION_RULES: Record<StatusLessonKey, Record<string, QuestionRule>> = {
  l1: {
    countryMapVerified: { validate: (d) => validateL1CountryMap(d.countryMap as Record<string, string>) },
    prob1Verified: { validate: as<Lesson1State>(validateL1Prob1), reasons: { prob1_1Reason: 5, prob1_3Reason: 5 } },
    prob2Verified: { validate: as<Lesson1State>(validateL1Prob2) },
    prob3Verified: { validate: as<Lesson1State>(validateL1Prob3), reasons: { prob3Reason: 10 } },
    prob4_1Verified: { validate: (d) => validateL1Prob4_1Points(d.prob4_1Points as Lesson1State['prob4_1Points']) },
    prob4_2Verified: { validate: (d) => validateL1Prob4_2Line(d.prob4_2LinePoints as Lesson1State['prob4_2LinePoints']) },
    prob5Verified: { validate: as<Lesson1State>(validateL1Prob5), reasons: { prob5_2Reason: 6, prob5_3Reason: 6 } },
    realLifeQuizVerified: { validate: (d) => validateL1RealLifeQuiz(d.realLifeQuiz as Record<string, string>) },
    aiCheck1: { validate: as<Lesson1State>(validateL1AiMission), reasons: { aiExplain: 8 } },
    // 아래 셋은 Lesson1View 안의 버튼 처리와 같은 기준 (이름을 하나 고르면 통과 / 5자 이상 / 네 버튼 모두 선택)
    aiFixBVerified: { validate: (d) => ({ ok: !isEmptyAnswer(d.aiFixB), message: '이름을 하나 선택해야 합니다.' }) },
    aiFixCVerified: { validate: (d) => ({ ok: !isEmptyAnswer(d.aiFixC), message: '이름을 하나 선택해야 합니다.' }) },
    aiReflectionChecked: {
      validate: (d) => ({ ok: String(d.aiReflection ?? '').trim().length >= 5, message: '생각을 5자 이상 적어야 합니다.' }),
      reasons: { aiReflection: 5 },
    },
    vendCheck1: { validate: as<Lesson1State>(validateL1VendMission1), reasons: { vendExplain: 6 } },
    vendCheck2: {
      validate: (d) => {
        const v = Array.isArray(d.vFix) ? d.vFix : [];
        return { ok: v.length >= 4 && v.slice(0, 4).every(Boolean), message: '네 버튼 모두에 음료를 연결해야 합니다.' };
      },
    },
    vendCheck3: { validate: as<Lesson1State>(validateL1VendMission3), reasons: { setExplain: 6 } },
  },
  l2: {
    bogiVerified: { validate: as<Lesson2State>(validateL2Bogi), reasons: { bogi2Reason: 8 } },
    prob6Verified: {
      validate: as<Lesson2State>(validateL2Prob6),
      reasons: { prob6NonOneToOneReason: 8, prob6BijectiveReason: 8 },
    },
    prob7Verified: { validate: as<Lesson2State>(validateL2Prob7), reasons: { prob7Graph2Reason: 8 } },
    think1Verified: { validate: as<Lesson2State>(validateL2Think1), reasons: { think1BijectiveCase: 8, think1ConstantCase: 8 } },
    think2Verified: { validate: as<Lesson2State>(validateL2Think2), reasons: { think2IdentityCase: 8, think2ConstantCase: 8 } },
  },
  l3: {
    openVerified: { validate: as<Lesson3State>(validateL3Open), reasons: { openMeaningReason: L3_MIN_REASON } },
    p1Verified: { validate: as<Lesson3State>(validateL3Prob1), reasons: { p1Reason: L3_MIN_REASON } },
    ex1Verified: { validate: as<Lesson3State>(validateL3Ex1), reasons: { ex1Reason: L3_MIN_REASON } },
    p2Verified: { validate: as<Lesson3State>(validateL3Prob2), reasons: { p2Reason: L3_MIN_REASON } },
    thinkVerified: { validate: as<Lesson3State>(validateL3Think), reasons: { thinkComparison: L3_MIN_REASON } },
    cp_m1Verified: { validate: as<Lesson3State>(validateCouponM1) },
    cp_m2Verified: { validate: as<Lesson3State>(validateCouponM2) },
    cp_m3Verified: { validate: as<Lesson3State>(validateCouponM3), reasons: { cp_m3_reason: L3_MIN_REASON } },
    cp_m4Verified: { validate: as<Lesson3State>(validateCouponM4), reasons: { cp_m4_reason: L3_MIN_REASON } },
  },
  l4: {
    openVerified: { validate: as<Lesson4State>(validateL4Open), reasons: { openReason: L4_MIN_REASON } },
    p1Verified: { validate: as<Lesson4State>(validateL4Prob1), reasons: { p1Reason: L4_MIN_REASON } },
    ex1Verified: { validate: as<Lesson4State>(validateL4Ex1) },
    p2Verified: { validate: as<Lesson4State>(validateL4Prob2), reasons: { p2Reason: L4_MIN_REASON } },
    p5Verified: { validate: as<Lesson4State>(validateL4Prob5) },
  },
  l4b: {
    togetherVerified: { validate: as<Lesson4State>(validateL4Together) },
    p3Verified: { validate: as<Lesson4State>(validateL4Prob3), reasons: { p3Reason: L4_MIN_REASON } },
    p4Verified: { validate: as<Lesson4State>(validateL4Prob4) },
    toolVerified: { validate: as<Lesson4State>(validateL4Tool) },
  },
  l5: {
    openVerified: { validate: as<Lesson5State>(validateL6Open) },
    p1Verified: { validate: as<Lesson5State>(validateL6Prob1), reasons: { p1Reason: L6_MIN_REASON } },
    ex1Verified: { validate: as<Lesson5State>(validateL6Ex1) },
    p2Verified: { validate: as<Lesson5State>(validateL6Prob2), reasons: { p2Reason: L6_MIN_REASON } },
    p3Verified: { validate: as<Lesson5State>(validateL6Prob3), reasons: { p3Reason: L6_MIN_REASON } },
  },
  l6: {
    tgVerified: { validate: as<Lesson6State>(validateL7Together), reasons: { tgReason: L7_MIN_REASON } },
    p4Verified: { validate: as<Lesson6State>(validateL7Prob4) },
    thinkVerified: { validate: as<Lesson6State>(validateL7Think) },
    p5Verified: { validate: as<Lesson6State>(validateL7Prob5) },
    ex2Verified: { validate: as<Lesson6State>(validateL7Ex2) },
    p6Verified: { validate: as<Lesson6State>(validateL7Prob6), reasons: { p6Reason: L7_MIN_REASON } },
  },
  l7: {
    openVerified: { validate: as<Lesson7State>(validateL8Open), reasons: { opReason: L8_MIN_REASON } },
    p1Verified: { validate: as<Lesson7State>(validateL8Prob1) },
    ex1Verified: { validate: as<Lesson7State>(validateL8Ex1) },
    p2Verified: { validate: as<Lesson7State>(validateL8Prob2), reasons: { p2Reason: L8_MIN_REASON } },
    p3Verified: { validate: as<Lesson7State>(validateL8Prob3) },
    sqVerified: { validate: as<Lesson7State>(validateL8Sqrt) },
    p4Verified: { validate: as<Lesson7State>(validateL8Prob4) },
    p5Verified: { validate: as<Lesson7State>(validateL8Prob5) },
  },
  // 9차시 (8차시와 같은 저장 칸 l7)
  l7b: {
    p6Verified: { validate: as<Lesson7State>(validateL8Prob6) },
    ex2Verified: { validate: as<Lesson7State>(validateL8Ex2) },
    p7Verified: { validate: as<Lesson7State>(validateL8Prob7), reasons: { p7Reason: L8_MIN_REASON } },
  },
};

/** 이유 칸을 '충분히 쓴 것'으로 가정할 때 넣는 글 (숫자를 넣어 두어 '원소 번호 포함' 같은 조건도 통과) */
const REASON_STAND_IN = '이유 서술 자리 0 1 2 3 4 5 6 7 8 9 '.repeat(3);

export interface QuestionInfo {
  verifiedKey: string;
  /** 교사에게 보일 문항 이름 (예: '문제 1') */
  label: string;
  inputKeys: string[];
}

/** answerLabels.ts에서 확인 항목과 그 앞 입력 칸들을 묶어 문항 목록을 만든다 */
export function lessonQuestions(lesson: StatusLessonKey): QuestionInfo[] {
  const out: QuestionInfo[] = [];
  for (const group of LESSON_ANSWER_CONFIG[lesson].groups) {
    let pending: string[] = [];
    for (const f of group.fields) {
      if (f.format?.kind === 'check') {
        if (QUESTION_RULES[lesson][f.key]) {
          out.push({ verifiedKey: f.key, label: f.label.replace(/\s*확인$/, ''), inputKeys: pending });
        }
        pending = [];
      } else if (!f.optional) {
        pending.push(f.key);
      }
    }
  }
  return out;
}

const questionCache = new Map<StatusLessonKey, Map<string, QuestionInfo>>();
function findQuestion(lesson: StatusLessonKey, verifiedKey: string): QuestionInfo | undefined {
  if (!questionCache.has(lesson)) {
    questionCache.set(lesson, new Map(lessonQuestions(lesson).map((q) => [q.verifiedKey, q])));
  }
  return questionCache.get(lesson)!.get(verifiedKey);
}

export function isStatusLesson(lesson: string): lesson is StatusLessonKey {
  return lesson === 'l1' || lesson === 'l2' || lesson === 'l3' || lesson === 'l4' || lesson === 'l4b' || lesson === 'l5' || lesson === 'l6' || lesson === 'l7' || lesson === 'l7b';
}

/** 한 문항의 상태. 규칙이 없는 확인 항목이면 undefined (예전처럼 확인/미확인으로 표시) */
export function getQuestionStatus(
  lesson: AnswerLessonKey,
  verifiedKey: string,
  lessonData: unknown
): QuestionStatusResult | undefined {
  if (!isStatusLesson(lesson)) return undefined;
  const rule = QUESTION_RULES[lesson][verifiedKey];
  const q = findQuestion(lesson, verifiedKey);
  if (!rule || !q) return undefined;
  const data = (lessonData && typeof lessonData === 'object' ? lessonData : {}) as Record<string, unknown>;

  if (data[verifiedKey] === true) return { status: 'done' };
  if (q.inputKeys.every((k) => isEmptyAnswer(data[k]))) return { status: 'empty' };

  const reasons = rule.reasons ?? {};
  const shortReasons = Object.entries(reasons).filter(([k, min]) => String(data[k] ?? '').trim().length < min);
  const safeValidate = (d: Record<string, unknown>) => {
    try {
      return rule.validate(d);
    } catch {
      return { ok: false, message: '' };
    }
  };

  if (safeValidate(data).ok) return { status: 'unchecked', note: '점검 버튼을 누르지 않음' };

  // 이유 칸만 부족한 경우: 이유를 채웠다고 가정하면 통과 → '점검'
  if (shortReasons.length > 0) {
    const filled = { ...data };
    for (const [k] of shortReasons) filled[k] = REASON_STAND_IN;
    if (safeValidate(filled).ok) {
      return { status: 'unchecked', note: `답은 맞음 · 이유 서술 부족 (${shortReasons.length}칸)` };
    }
  }

  // 답 칸이 아직 비어 있으면 틀렸다고 단정하지 않음 → '점검'(작성 중)
  const emptyAnswerKeys = q.inputKeys.filter((k) => !(k in reasons) && isEmptyAnswer(data[k]));
  if (emptyAnswerKeys.length > 0) {
    return { status: 'unchecked', note: `작성 중 · 빈 칸 ${emptyAnswerKeys.length}개` };
  }

  return { status: 'wrong', note: safeValidate(data).message || undefined };
}

/** 여러 문항 상태를 한꺼번에 (교사 상세 비교 칸용) */
export function getQuestionStatuses(
  lesson: StatusLessonKey,
  verifiedKeys: string[],
  lessonData: unknown
): (QuestionStatusResult & { verifiedKey: string; label: string })[] {
  return verifiedKeys.flatMap((key) => {
    const r = getQuestionStatus(lesson, key, lessonData);
    const q = findQuestion(lesson, key);
    return r && q ? [{ ...r, verifiedKey: key, label: q.label }] : [];
  });
}

export const QUESTION_STATUS_LABEL: Record<QuestionStatus, string> = {
  done: '✓ 확인 완료',
  unchecked: '점검',
  wrong: '오답',
  empty: '미작성',
};
