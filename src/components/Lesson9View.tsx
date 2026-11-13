import React from 'react';
import { Lesson8View, type Lesson8ViewProps } from './Lesson8View';

/**
 * Func 9차시 · 무리함수의 그래프와 평행이동 (학생 화면)
 * ------------------------------------------------------------------
 * 2026-11-13 8차시(무리함수)를 두 차시로 나눈 뒷부분입니다.
 * 평행이동 실험실 · 정리 · [보기] · [문제 6] → y = √(ax+b)+c 변형 · [예제 2] · [문제 7] → 성찰
 *
 * 화면 코드와 저장 칸은 8차시와 같습니다(Lesson8View part 2, 학생 기록 l7).
 * 단계 완료: mathLogic.ts evaluateLevel9Completion
 */
export type Lesson9ViewProps = Omit<Lesson8ViewProps, 'part' | 'onGoToLesson9'>;

export const Lesson9View: React.FC<Lesson9ViewProps> = (props) => <Lesson8View {...props} part={2} />;
