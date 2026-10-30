import type { LessonKey } from './lessonMerge';

/**
 * 교사 [전체 답안 보기]에 표시할 문항 이름표 (Func — 함수와 그래프)
 * ------------------------------------------------------------------
 * - 학생 화면(LessonNView)에 문항을 추가·변경하면 여기에도 같은 이름표를 추가하세요.
 *   이름표가 없어도 학생이 입력한 값은 '기타 기록'에 필드 이름으로 표시되지만,
 *   교사가 알아보기 쉽도록 이름표를 붙이는 것이 좋습니다.
 * - hidden: 다른 항목을 이어 붙여 자동으로 만들어지는 요약 필드나, 이 수업에서 쓰지 않는 필드.
 *   (표시하지 않음 — 원본 항목은 각각 따로 표시됨)
 * - 단위 테스트(answerLabels.test.ts)가 학생 화면이 쓰는 모든 필드가 이름표 또는 hidden에
 *   들어 있는지 검사합니다.
 */

export type AnswerFormat =
  | { kind: 'text' }
  | { kind: 'yesno'; yes?: string; no?: string }
  | { kind: 'choice'; options: Record<string, string> }
  | { kind: 'check' }
  | { kind: 'checks' }
  | { kind: 'choices' }
  | { kind: 'points' }
  | { kind: 'map'; valueLabels?: Record<string, string> }
  | { kind: 'list'; itemLabel?: string }
  | { kind: 'table'; columns?: Record<string, string> }
  | { kind: 'json' };

export interface AnswerField {
  key: string;
  label: string;
  format?: AnswerFormat;
}

export interface LessonAnswerGroup {
  title: string;
  fields: AnswerField[];
}

export interface LessonAnswerConfig {
  title: string;
  groups: LessonAnswerGroup[];
  hidden?: string[];
}

const CHECK: AnswerFormat = { kind: 'check' };
const CHECKS: AnswerFormat = { kind: 'checks' };
const CHOICES: AnswerFormat = { kind: 'choices' };
const FUNC_YN: AnswerFormat = { kind: 'yesno', yes: '함수이다 (O)', no: '함수가 아니다 (X)' };
const ONE_TO_ONE_YN: AnswerFormat = { kind: 'yesno', yes: '예 (O)', no: '아니오 (X)' };

/** 4~7차시 (Func·Props 공통 문항) — Func는 4차시를 아래 LESSON_ANSWER_CONFIG.l4(역함수)로 바꿔 씀 */
export const COMMON_L4_TO_L7: Record<'l4' | 'l5' | 'l6' | 'l7', LessonAnswerConfig> = {
  l4: {
    title: '4차시 · 귀류법',
    groups: [
      {
        title: '실험과 개념 확인',
        fields: [
          {
            key: 'fractionExamples',
            label: '분수 n/m 실험 기록',
            format: { kind: 'table', columns: { m: 'm', n: 'n', g: '최대공약수', coprime: '서로소', mSq2: '2m²', nSq: 'n²', diff: 'n² − 2m²' } },
          },
          { key: 'contradictionConceptChecked', label: '귀류법 논리 순서 확인', format: CHECK },
        ],
      },
      {
        title: '[문제 1] 귀류법 증명',
        fields: [
          { key: 'prob1Choices', label: '단계별 선택', format: CHOICES },
          { key: 'prob1Verified', label: '단계 확인', format: CHECKS },
          { key: 'prob1ProofText', label: '[문제 1] 나의 말로 쓰는 귀류법 증명 보고서' },
        ],
      },
      {
        title: '[문제 2] 귀류법 증명',
        fields: [
          { key: 'closureChecked', label: 'r − 1에 대한 설명 확인', format: CHECK },
          { key: 'closureReason', label: 'r − 1에 대한 설명 (선택한 내용)' },
          { key: 'prob2Choices', label: '단계별 선택', format: CHOICES },
          { key: 'prob2Verified', label: '단계 확인', format: CHECKS },
          { key: 'prob2ProofText', label: '[문제 2] 나의 말로 쓰는 귀류법 증명 보고서' },
        ],
      },
      {
        title: '성찰',
        fields: [
          { key: 'reflection1', label: '성찰 1. 결론을 부정하는 이유와 모순을 찾는 과정' },
          { key: 'reflection2', label: '성찰 2. 대우를 이용한 증명과 귀류법 비교' },
        ],
      },
    ],
  },
  l5: {
    title: '5차시 · 절대부등식 1 (완전제곱식)',
    groups: [
      {
        title: '실험과 개념 확인',
        fields: [
          {
            key: 'examples',
            label: '수치 대입 실험 기록',
            format: { kind: 'table', columns: { a: 'a', b: 'b', lhs: '좌변', rhs: '우변', diff: '차', isEqual: '등호' } },
          },
          {
            key: 'squareConceptChoice',
            label: 'A ≥ B 증명의 핵심 원리',
            format: {
              kind: 'choice',
              options: {
                nonnegative: 'A − B를 완전제곱식의 합으로 변형하여 A − B ≥ 0임을 보인다',
                alwayspositive: '양수 2~3개만 대입해 확인하면 증명이 끝난다',
                negative: '실수를 제곱하면 음수가 되므로 A − B < 0임을 보인다',
              },
            },
          },
        ],
      },
      {
        title: '[문제 1] 증명',
        fields: [
          { key: 'prob1Choices', label: '단계별 선택', format: CHOICES },
          { key: 'prob1Verified', label: '단계 확인', format: CHECKS },
          { key: 'prob1ProofText', label: '[문제 1] 증명 보고서 (등호 성립 조건 포함)' },
        ],
      },
      {
        title: '[문제 2] 증명',
        fields: [
          { key: 'equalityConditionChecked', label: '등호 성립 필요충분조건 확인', format: CHECK },
          { key: 'equalityReason', label: '5b²을 4b² + b²으로 쪼개어 변형하는 이유' },
          { key: 'prob2Choices', label: '단계별 선택', format: CHOICES },
          { key: 'prob2Verified', label: '단계 확인', format: CHECKS },
          { key: 'prob2ProofText', label: '[문제 2] (1)·(2) 증명 보고서' },
        ],
      },
      {
        title: '성찰',
        fields: [
          { key: 'reflection1', label: '성찰 1. 완전제곱식이 강력한 도구가 되는 이유' },
          { key: 'reflection2', label: '성찰 2. (1)·(2)의 등호 성립 조건 비교' },
        ],
      },
    ],
  },
  l6: {
    title: '6차시 · 절대부등식 2 (산술·기하·조화평균)',
    groups: [
      {
        title: '실험과 개념 확인',
        fields: [
          {
            key: 'examples',
            label: '평균 비교 실험 기록',
            format: { kind: 'table', columns: { a: 'a', b: 'b', arith: '산술평균', geom: '기하평균', harm: '조화평균', diff: '차', isEqual: '등호' } },
          },
          {
            key: 'amgmConceptChoice',
            label: '(√a − √b)²을 만들 수 있는 조건',
            format: {
              kind: 'choice',
              options: {
                positive: 'a, b가 모두 양수일 때 (√a − √b)² ≥ 0을 이용할 수 있다',
                anyreal: 'a, b가 음수여도 항상 성립한다',
                negative: 'a = −b일 때만 성립한다',
              },
            },
          },
        ],
      },
      {
        title: '[문제 1] 증명',
        fields: [
          { key: 'prob1Choices', label: '단계별 선택', format: CHOICES },
          { key: 'prob1Verified', label: '단계 확인', format: CHECKS },
          { key: 'prob1ProofText', label: '[문제 1] 증명 보고서' },
        ],
      },
      {
        title: '[문제 2] 증명',
        fields: [
          { key: 'harmonicChecked', label: '조화평균 관계 확인', format: CHECK },
          { key: 'harmonicReason', label: '조화평균 관계에 대한 이유' },
          { key: 'prob2Choices', label: '단계별 선택', format: CHOICES },
          { key: 'prob2Verified', label: '단계 확인', format: CHECKS },
          { key: 'prob2ProofText', label: '[문제 2] 증명 보고서' },
        ],
      },
      {
        title: '성찰',
        fields: [
          { key: 'reflection1', label: '성찰 1. 양수 조건과 제곱근 변형' },
          { key: 'reflection2', label: '성찰 2. 산술·기하·조화평균의 대소관계' },
        ],
      },
    ],
  },
  l7: {
    title: '7차시 · 절대부등식 3 (절댓값)',
    groups: [
      {
        title: '실험과 개념 확인',
        fields: [
          {
            key: 'examples',
            label: '절댓값 실험 기록',
            format: { kind: 'table', columns: { a: 'a', b: 'b', lhsSum: '|a| + |b|', rhsSum: '|a + b|', diffSq: '제곱의 차', sameSign: '같은 부호' } },
          },
          {
            key: 'absSquareConceptChoice',
            label: '|a + b| ≤ |a| + |b| 증명 전략',
            format: {
              kind: 'choice',
              options: {
                square_diff: '양변이 0 이상이므로 제곱의 차 (|a| + |b|)² − |a + b|² ≥ 0을 보인다',
                direct_sub: '절댓값 기호를 임의로 지워서 계산한다',
                cube: '양변을 세제곱하여 비교한다',
              },
            },
          },
        ],
      },
      {
        title: '[문제 1] 증명',
        fields: [
          { key: 'prob1Choices', label: '단계별 선택', format: CHOICES },
          { key: 'prob1Verified', label: '단계 확인', format: CHECKS },
          { key: 'prob1ProofText', label: '[문제 1] 증명 보고서' },
        ],
      },
      {
        title: '[문제 2] 증명',
        fields: [
          { key: 'absDiffChecked', label: '|a| − |b| 관계 확인', format: CHECK },
          { key: 'absDiffReason', label: '|a| − |b| 관계에 대한 이유' },
          { key: 'prob2Choices', label: '단계별 선택', format: CHOICES },
          { key: 'prob2Verified', label: '단계 확인', format: CHECKS },
          { key: 'prob2ProofText', label: '[문제 2] 증명 보고서' },
        ],
      },
      {
        title: '성찰',
        fields: [
          { key: 'reflection1', label: '성찰 1. 절댓값 제곱의 차 원리' },
          { key: 'reflection2', label: '성찰 2. 부호 조건에 따른 등호 성립 차이' },
        ],
      },
    ],
  },
};

/** AI 얼굴 인식·자판기 도전 활동 (Func 1차시 / Props 1차시 도전 활동 공통) */
export const CHALLENGE_GROUPS: LessonAnswerGroup[] = [
  {
    title: '도전 ① AI 얼굴 인식은 함수일까?',
    fields: [
      { key: 'aiA', label: '기계 A는 함수인가?', format: FUNC_YN },
      { key: 'aiB', label: '기계 B는 함수인가?', format: FUNC_YN },
      { key: 'aiC', label: '기계 C는 함수인가?', format: FUNC_YN },
      { key: 'aiExplain', label: '판별 이유' },
      { key: 'aiCheck1', label: '판별 확인', format: CHECK },
      { key: 'aiFixB', label: '기계 B 수리: 사진 ②에 대응시킨 이름' },
      { key: 'aiFixBVerified', label: '기계 B 수리 확인', format: CHECK },
      { key: 'aiFixC', label: '기계 C 수리: 사진 ③에 대응시킨 이름' },
      { key: 'aiFixCVerified', label: '기계 C 수리 확인', format: CHECK },
      { key: 'aiReflection', label: '두 사진이 같은 사람 이름으로 출력되어도 함수일까? 이유' },
      { key: 'aiReflectionChecked', label: '탐구 질문 확인', format: CHECK },
    ],
  },
  {
    title: '도전 ② 고장 난 자판기를 수리하라!',
    fields: [
      { key: 'vendAnswer', label: '지금 대응은 함수인가?', format: FUNC_YN },
      { key: 'vendExplain', label: '판단 이유 (조건을 위반한 버튼)' },
      { key: 'vendCheck1', label: '미션 1 확인', format: CHECK },
      { key: 'vFix', label: '수리: 버튼별로 연결한 음료', format: { kind: 'list', itemLabel: '버튼' } },
      { key: 'vendCheck2', label: '미션 2 (수리) 확인', format: CHECK },
      {
        key: 'setAns',
        label: '미션 3: 음료 세트 전체를 하나의 출력으로 보면 함수가 될 수 있을까?',
        format: { kind: 'yesno', yes: '그럴 수 있다 (O)', no: '불가능하다 (X)' },
      },
      { key: 'setExplain', label: '미션 3 근거 설명' },
      { key: 'vendCheck3', label: '미션 3 확인', format: CHECK },
    ],
  },
];

export const LESSON_ANSWER_CONFIG: Record<LessonKey, LessonAnswerConfig> = {
  l1: {
    title: '1차시 · 함수의 뜻과 그래프',
    groups: [
      {
        title: '[생각 열기] 나라와 화폐 단위 연결',
        fields: [
          { key: 'countryMap', label: '나라 → 화폐 단위 연결', format: { kind: 'map' } },
          { key: 'countryMapVerified', label: '연결 확인', format: CHECK },
        ],
      },
      {
        title: '[문제 1] 함수인 것 찾기와 정의역·공역·치역',
        fields: [
          { key: 'prob1_1IsFunc', label: '(1)번 대응 판별', format: FUNC_YN },
          { key: 'prob1_1Reason', label: '(1)번 판별 이유' },
          { key: 'prob1_2IsFunc', label: '(2)번 대응 판별', format: FUNC_YN },
          { key: 'prob1_2Domain', label: '(2)번 정의역' },
          { key: 'prob1_2Codomain', label: '(2)번 공역' },
          { key: 'prob1_2Range', label: '(2)번 치역' },
          { key: 'prob1_3IsFunc', label: '(3)번 대응 판별', format: FUNC_YN },
          { key: 'prob1_3Reason', label: '(3)번 판별 이유' },
          { key: 'prob1Verified', label: '문제 1 확인', format: CHECK },
        ],
      },
      {
        title: '[문제 2] 정의역과 치역',
        fields: [
          { key: 'prob2_1Domain', label: '(1) y = 2x + 1의 정의역' },
          { key: 'prob2_1Range', label: '(1) y = 2x + 1의 치역' },
          { key: 'prob2_2Domain', label: '(2) y = −x² + 3의 정의역' },
          { key: 'prob2_2Range', label: '(2) y = −x² + 3의 치역' },
          { key: 'prob2Verified', label: '문제 2 확인', format: CHECK },
        ],
      },
      {
        title: '[탐구+ 문제 3] 서로 같은 함수',
        fields: [
          { key: 'prob3Table', label: '(1) 함숫값 표 f(x) = |2x|, g(x) = 2x²', format: { kind: 'json' } },
          { key: 'prob3IsEqual', label: '(2) f와 g는 서로 같은 함수인가?', format: { kind: 'yesno', yes: '서로 같다 (O)', no: '서로 같지 않다 (X)' } },
          { key: 'prob3Reason', label: '(2) 판별 이유' },
          { key: 'prob3Verified', label: '문제 3 확인', format: CHECK },
        ],
      },
      {
        title: '[문제 4·5] 함수의 그래프',
        fields: [
          { key: 'prob4_1Points', label: '[문제 4] (1) 찍은 점', format: { kind: 'points' } },
          { key: 'prob4_1Verified', label: '[문제 4] (1) 확인', format: CHECK },
          { key: 'prob4_2LinePoints', label: '[문제 4] (2) 직선을 그은 점', format: { kind: 'points' } },
          { key: 'prob4_2Verified', label: '[문제 4] (2) 확인', format: CHECK },
          { key: 'prob5Choice', label: '[문제 5] ① 함수의 그래프인 것', format: { kind: 'choice', options: { '1': '(1)번', '2': '(2)번', '3': '(3)번' } } },
          { key: 'prob5_2Reason', label: '[문제 5] ② (2)번이 함수의 그래프가 아닌 이유' },
          { key: 'prob5_3Reason', label: '[문제 5] ③ (3)번이 함수의 그래프가 아닌 이유' },
          { key: 'prob5Verified', label: '[문제 5] 확인', format: CHECK },
        ],
      },
      {
        title: '[탐구 05] 실생활에서 함수인 예 찾아보기',
        fields: [
          {
            key: 'realLifeQuiz',
            label: '활동 1 · 실생활 대응 판별',
            format: { kind: 'map', valueLabels: { yes: '함수이다 (O)', no: '함수가 아니다 (X)' } },
          },
          { key: 'realLifeQuizVerified', label: '활동 1 확인', format: CHECK },
          { key: 'realLifeTopic', label: '활동 2 · 선택한 소재' },
          { key: 'realLifeDomainX', label: '활동 2 · 정의역 X' },
          { key: 'realLifeCodomainY', label: '활동 2 · 공역 Y' },
          { key: 'realLifeRule', label: '활동 2 · 대응 규칙' },
          { key: 'realLifeWhyFunc', label: '활동 2 · 이 대응이 함수인 이유' },
          { key: 'realLifeNonFuncExample', label: '활동 2 · 함수가 아닌 예' },
        ],
      },
      ...CHALLENGE_GROUPS,
      {
        title: '성찰',
        fields: [{ key: 'reflection', label: '1차시 성찰 · 새롭게 알게 된 점' }],
      },
    ],
    // claim·limits·proofText·bridge: 위 문항들을 이어 붙여 자동으로 만들어지는 요약 (원본 문항이 각각 표시됨)
    // claimChecked·proofVerified: 문제 확인 시 자동으로 켜지는 표시
    // scope·checks·proofChoices·examples: 명제 수업(Props) 틀에서 남은 필드로 이 수업에서는 입력하지 않음
    hidden: ['claim', 'limits', 'proofText', 'bridge', 'claimChecked', 'proofVerified', 'scope', 'checks', 'proofChoices', 'examples'],
  },
  l2: {
    title: '2차시 · 여러 가지 함수',
    groups: [
      {
        title: '[보기] 일대일함수와 일대일대응',
        fields: [
          { key: 'bogi1IsOneToOne', label: '① f(x) = 2x: 일대일함수인가?', format: ONE_TO_ONE_YN },
          { key: 'bogi1IsBijective', label: '① f(x) = 2x: 일대일대응인가?', format: ONE_TO_ONE_YN },
          {
            key: 'bogiConditionChoice',
            label: '일대일함수가 일대일대응이 되기 위한 추가 조건',
            format: {
              kind: 'choice',
              options: {
                range_eq_codomain: '치역 = 공역',
                domain_eq_range: '정의역 = 치역',
                always_positive: '함숫값이 항상 양수',
              },
            },
          },
          { key: 'bogi2IsOneToOne', label: '② g(x) = x²: 일대일함수인가?', format: ONE_TO_ONE_YN },
          { key: 'bogi2Reason', label: '② g(x) = x² 판별 이유' },
          { key: 'bogiVerified', label: '보기 확인', format: CHECK },
        ],
      },
      {
        title: '[문제 6] 일대일함수·일대일대응 판별',
        fields: [
          { key: 'prob6_1OneToOne', label: '(1) y = 3x − 1: 일대일함수?', format: ONE_TO_ONE_YN },
          { key: 'prob6_1Bijective', label: '(1) y = 3x − 1: 일대일대응?', format: ONE_TO_ONE_YN },
          { key: 'prob6_2OneToOne', label: '(2) y = −x² + 2: 일대일함수?', format: ONE_TO_ONE_YN },
          { key: 'prob6_2Bijective', label: '(2) y = −x² + 2: 일대일대응?', format: ONE_TO_ONE_YN },
          { key: 'prob6_3OneToOne', label: '(3) y = |x|: 일대일함수?', format: ONE_TO_ONE_YN },
          { key: 'prob6_3Bijective', label: '(3) y = |x|: 일대일대응?', format: ONE_TO_ONE_YN },
          { key: 'prob6_4OneToOne', label: '(4) y = −2x (x ≥ 0), y = x² (x < 0): 일대일함수?', format: ONE_TO_ONE_YN },
          { key: 'prob6_4Bijective', label: '(4) y = −2x (x ≥ 0), y = x² (x < 0): 일대일대응?', format: ONE_TO_ONE_YN },
          { key: 'prob6NonOneToOneReason', label: '일대일함수가 아닌 것의 이유' },
          { key: 'prob6BijectiveReason', label: '일대일대응인 것의 이유' },
          { key: 'prob6Verified', label: '문제 6 확인', format: CHECK },
        ],
      },
      {
        title: '[문제 7] 항등함수와 상수함수의 그래프',
        fields: [
          { key: 'prob7IdentityChoice', label: '항등함수의 그래프', format: { kind: 'choice', options: { '1': '(1)번', '2': '(2)번', '3': '(3)번' } } },
          { key: 'prob7ConstantChoice', label: '상수함수의 그래프', format: { kind: 'choice', options: { '1': '(1)번', '2': '(2)번', '3': '(3)번' } } },
          { key: 'prob7Graph2Reason', label: '(2)번 x = 1이 함수가 아닌 이유' },
          { key: 'prob7Verified', label: '문제 7 확인', format: CHECK },
        ],
      },
      {
        title: '[생각 넓히기] 활동 1 영화관 · 활동 2 동아리 투표',
        fields: [
          { key: 'think1Map', label: '활동 1 · 학생 5명 → 영화 대응', format: { kind: 'map' } },
          { key: 'think1BijectiveCase', label: '활동 1 · 일대일대응이 되는 경우' },
          { key: 'think1ConstantCase', label: '활동 1 · 상수함수가 되는 경우' },
          { key: 'think1Verified', label: '활동 1 확인', format: CHECK },
          { key: 'think2Map', label: '활동 2 · 회원 4명 → 대표 투표 대응', format: { kind: 'map' } },
          { key: 'think2IdentityCase', label: '활동 2 · 항등함수가 되는 경우' },
          { key: 'think2ConstantCase', label: '활동 2 · 상수함수가 되는 경우' },
          { key: 'think2Verified', label: '활동 2 확인', format: CHECK },
        ],
      },
      {
        title: '성찰',
        fields: [{ key: 'reflection', label: '2차시 배움 성찰 · 여러 가지 함수 정리하기' }],
      },
    ],
    // guess·decision·proofText·counterReason·share·nextQuestion: 위 문항들을 이어 붙인 자동 요약
    // decisionChecked: 문제 확인 시 자동 표시 / 그 밖: 명제 수업(Props) 틀에서 남은 필드
    hidden: [
      'guess', 'decision', 'decisionChecked', 'proofText', 'counterReason', 'share', 'nextQuestion',
      'topic', 'customStatement', 'customScope', 'examples', 'checks', 'counter', 'peer', 'peerComment', 'revision',
    ],
  },
  l3: {
    title: '3차시 · 합성함수',
    groups: [
      {
        title: '[생각 열기] 주문한 음식의 가격과 합성함수의 뜻',
        fields: [
          { key: 'openAramPrice', label: '아람 (핫도그) → 가격' },
          { key: 'openJaeyoungPrice', label: '재영 (김밥) → 가격' },
          { key: 'openHayoungPrice', label: '하영 (어묵) → 가격' },
          {
            key: 'openDomainToCodomainChoice',
            label: 'g ∘ f는 어느 집합에서 어느 집합으로의 함수인가?',
            format: { kind: 'choice', options: { X_to_Z: 'g ∘ f : X → Z', Y_to_Z: 'g ∘ f : Y → Z', X_to_Y: 'g ∘ f : X → Y' } },
          },
          { key: 'openMeaningReason', label: '합성함수의 뜻 설명' },
          { key: 'openVerified', label: '생각 열기 확인', format: CHECK },
        ],
      },
      {
        title: '[문제 1] 합성함수의 함숫값',
        fields: [
          { key: 'p1_1_f2', label: '(1) 1단계 안쪽 함숫값' },
          { key: 'p1_1_ans', label: '(1) 최종 함숫값' },
          { key: 'p1_2_gm1', label: '(2) 1단계 안쪽 함숫값' },
          { key: 'p1_2_ans', label: '(2) 최종 함숫값' },
          { key: 'p1_3_fm3', label: '(3) 1단계 안쪽 함숫값' },
          { key: 'p1_3_ans', label: '(3) 최종 함숫값' },
          { key: 'p1Reason', label: '풀이 과정 서술' },
          { key: 'p1Verified', label: '문제 1 확인', format: CHECK },
        ],
      },
      {
        title: '[문제 (교환법칙 탐구)] 합성함수의 식',
        fields: [
          { key: 'ex1_gf', label: '(1) (g ∘ f)(x)의 식' },
          { key: 'ex1_fg', label: '(2) (f ∘ g)(x)의 식' },
          {
            key: 'ex1_commutative',
            label: '교환법칙 g ∘ f = f ∘ g가 성립하나요?',
            format: { kind: 'yesno', yes: '항상 성립한다', no: '일반적으로 성립하지 않는다' },
          },
          { key: 'ex1Reason', label: '풀이 과정과 교환법칙이 성립하지 않는 이유' },
          { key: 'ex1Verified', label: '교환법칙 탐구 확인', format: CHECK },
        ],
      },
      {
        title: '[문제 2] 합성함수 구하기',
        fields: [
          { key: 'p2_1_gf', label: '(1) (g ∘ f)(x)' },
          { key: 'p2_2_fg', label: '(2) (f ∘ g)(x)' },
          { key: 'p2_3_gg', label: '(3) (g ∘ g)(x)' },
          { key: 'p2Reason', label: '대입 및 정리 과정' },
          { key: 'p2Verified', label: '문제 2 확인', format: CHECK },
        ],
      },
      {
        title: '[생각 넓히기] 세 함수의 합성과 결합법칙',
        fields: [
          { key: 'think_fg', label: '① 좌변 1단계 (f ∘ g)(x)' },
          { key: 'think_fgh_left', label: '① 좌변 ((f ∘ g) ∘ h)(x)' },
          { key: 'think_gh', label: '② 우변 1단계 (g ∘ h)(x)' },
          { key: 'think_fgh_right', label: '② 우변 (f ∘ (g ∘ h))(x)' },
          {
            key: 'think_associative',
            label: '결합법칙 (f ∘ g) ∘ h = f ∘ (g ∘ h)가 성립하나요?',
            format: { kind: 'yesno', yes: '성립한다', no: '성립하지 않는다' },
          },
          { key: 'thinkComparison', label: '계산 결과 비교와 알게 된 성질' },
          { key: 'thinkVerified', label: '생각 넓히기 확인', format: CHECK },
        ],
      },
      {
        title: '성찰',
        fields: [
          { key: 'reflection1', label: '성찰 1. 계산 순서 차이와 교환법칙이 성립하지 않는 이유' },
          { key: 'reflection2', label: '성찰 2. 결합법칙이 성립하는 이유 / 새롭게 깨달은 점' },
        ],
      },
    ],
    // prob1ProofText·prob2ProofText: 위 문항들을 이어 붙인 자동 요약 / prob1·2Verified: 자동 표시
    // 그 밖: 명제 수업(Props) 틀에서 남은 필드
    hidden: [
      'prob1ProofText', 'prob2ProofText', 'prob1Verified', 'prob2Verified',
      'parityExamples', 'contrapositiveChoice', 'prob1Choices', 'mod3Examples', 'mod3CasesChecked', 'prob2Choices',
    ],
  },
  ...COMMON_L4_TO_L7,
  // Func 4차시는 역함수 수업 (2026-10-30~). 공통 4차시(귀류법) 이름표 대신 사용.
  l4: {
    title: '4차시 · 역함수',
    groups: [
      {
        title: '[생각 열기] 온실가스 대응 뒤집기와 역함수의 뜻',
        fields: [
          {
            key: 'openReverseMap',
            label: '뒤집은 대응 Y(화학식) → X(온실가스)',
            format: { kind: 'map' },
          },
          {
            key: 'openReverseIsFunc',
            label: '뒤집은 대응 Y → X는 함수인가?',
            format: { kind: 'yesno', yes: '함수가 된다', no: '함수가 되지 않는다' },
          },
          {
            key: 'openConditionChoice',
            label: '역함수가 존재하기 위한 f의 조건',
            format: {
              kind: 'choice',
              options: {
                bijection: 'f가 일대일대응이어야 한다',
                oneToOne: 'f가 일대일함수이기만 하면 된다',
                anyFunction: 'f가 함수이기만 하면 된다',
              },
            },
          },
          {
            key: 'openDomainRangeSame',
            label: '[생각 톡톡] f의 정의역과 f⁻¹의 치역은 같은가?',
            format: { kind: 'yesno', yes: '같다', no: '다르다' },
          },
          { key: 'openReason', label: '뒤집은 대응이 함수가 되는 이유' },
          { key: 'openVerified', label: '생각 열기 확인', format: CHECK },
        ],
      },
      {
        title: '[문제 1] 그림 완성과 역함수의 함숫값',
        fields: [
          { key: 'p1_f3', label: '그림 완성: f(3)의 값' },
          { key: 'p1_1', label: '(1) f⁻¹(7)' },
          { key: 'p1_2', label: '(2) (f⁻¹ ∘ f)(4)' },
          { key: 'p1_3', label: '(3) (f ∘ f⁻¹)(3)' },
          { key: 'p1_4', label: '(4) (f⁻¹)⁻¹(2)' },
          { key: 'p1Reason', label: '구한 과정' },
          { key: 'p1Verified', label: '문제 1 확인', format: CHECK },
        ],
      },
      {
        title: '[역함수 구하기] 예제 1 · 문제 2 · 문제 5',
        fields: [
          { key: 'ex1_solveX', label: '예제 y = 3x + 4 ① x에 대하여 풀기 (x = …)' },
          { key: 'ex1_ans', label: '예제 y = 3x + 4 ② 역함수 (y = …)' },
          { key: 'ex1Verified', label: '예제 1 확인', format: CHECK },
          { key: 'p2_1', label: '문제 2 (1) y = −3x + 1의 역함수' },
          { key: 'p2_2', label: '문제 2 (2) y = (1/4)x + 2의 역함수' },
          { key: 'p2Reason', label: '문제 2 역함수를 구한 과정' },
          { key: 'p2Verified', label: '문제 2 확인', format: CHECK },
          { key: 'p5_inv', label: '문제 5 (1) y = (9/5)x + 32의 역함수' },
          { key: 'p5_celsius', label: '문제 5 (2) 95℉ → ℃' },
          { key: 'p5Verified', label: '문제 5 확인', format: CHECK },
        ],
      },
      {
        title: '[함께하기] (g∘f)⁻¹와 f⁻¹∘g⁻¹ · 문제 3',
        fields: [
          { key: 'tg_gf', label: '(i) (g∘f)(x)' },
          { key: 'tg_gfInv', label: '(i) (g∘f)⁻¹(x)' },
          { key: 'tg_fInv', label: '(ii) f⁻¹(x)' },
          { key: 'tg_gInv', label: '(ii) g⁻¹(x)' },
          { key: 'tg_inner', label: '(ii) f⁻¹( □ )의 괄호 안' },
          { key: 'tg_result', label: '(ii) (f⁻¹∘g⁻¹)(x)' },
          {
            key: 'tg_relation',
            label: '(g∘f)⁻¹ □ f⁻¹∘g⁻¹',
            format: { kind: 'choice', options: { eq: '=', neq: '≠' } },
          },
          { key: 'togetherVerified', label: '함께하기 확인', format: CHECK },
          { key: 'p3_ans', label: '문제 3 (f⁻¹∘g⁻¹)(3)' },
          { key: 'p3Reason', label: '문제 3 구한 과정' },
          { key: 'p3Verified', label: '문제 3 확인', format: CHECK },
        ],
      },
      {
        title: '[그래프] 문제 4 · 공학 도구',
        fields: [
          { key: 'p4_1_inv', label: '문제 4 (1) y = 5x − 2의 역함수' },
          { key: 'p4_2_inv', label: '문제 4 (2) y = −(1/3)x + 3의 역함수' },
          { key: 'p4Verified', label: '문제 4 확인', format: CHECK },
          {
            key: 'toolAlwaysOverlap',
            label: '확인 1. g의 그래프와 대칭이동한 그래프가 항상 겹치는가?',
            format: { kind: 'yesno', yes: '항상 겹쳐진다', no: '겹쳐지지 않을 때도 있다' },
          },
          { key: 'toolParallelA', label: '확인 2. 평행할 때 a' },
          { key: 'toolSameA', label: '확인 3. 일치할 때 a' },
          { key: 'toolVerified', label: '공학 도구 확인', format: CHECK },
        ],
      },
      {
        title: '성찰',
        fields: [
          { key: 'reflection1', label: '성찰 1. 역함수가 존재하기 위한 조건과 이유' },
          { key: 'reflection2', label: '성찰 2. 그래프가 y = x에 대하여 대칭인 이유 / 새롭게 알게 된 점' },
        ],
      },
    ],
    // 예전 4차시(귀류법) 화면의 항목 — 데이터는 보존하되 표시하지 않음
    hidden: [
      'fractionExamples', 'contradictionConceptChecked', 'prob1Choices', 'prob1Verified', 'prob1ProofText',
      'closureChecked', 'closureReason', 'prob2Choices', 'prob2Verified', 'prob2ProofText',
    ],
  },
};
