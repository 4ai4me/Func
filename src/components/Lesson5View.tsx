import React from 'react';
import { Lesson4View, type Lesson4ViewProps } from './Lesson4View';

/**
 * Func 5차시 · 역함수의 성질과 그래프 (학생 화면)
 * ------------------------------------------------------------------
 * 2026-11-05 4차시(역함수)를 두 차시로 나눈 뒷부분입니다.
 * 함께하기 · 문제 3 → 그래프와 y = x 대칭 · 문제 4 · 공학 도구 · 성찰
 *
 * 화면 코드와 저장 칸은 4차시와 같습니다(Lesson4View part 2, 학생 기록 l4).
 * 나누기 전에 4차시에서 풀어 둔 답이 그대로 보이도록 기록을 옮기지 않았습니다.
 * 단계 완료: mathLogic.ts evaluateLevel5Completion
 */
export type Lesson5ViewProps = Omit<Lesson4ViewProps, 'part'>;

export const Lesson5View: React.FC<Lesson5ViewProps> = (props) => <Lesson4View {...props} part={2} />;
