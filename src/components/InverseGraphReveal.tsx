import React from 'react';
import { ChartLine, Lock, EyeOff } from 'lucide-react';
import { LinearGraph, GraphLegend, GraphLine, GraphPoint } from './LinearGraph';
import { MathText } from './MathText';
import { formatLinear } from '../utils/linearExpr';
import { inverseLinear, type L4GraphFunc } from '../utils/lesson4Logic';

/**
 * 4차시 문제별 [그래프로 확인하기]
 * - 주어진 함수(파랑) · 역함수(빨강) · 직선 y = x(회색)를 한 좌표평면에 그립니다.
 * - 역함수 그래프에 정답 식이 드러나므로, 그 문제의 [정답 확인]을 통과한 뒤에만 버튼이 켜집니다(사용자 결정 2026-11-05).
 * - 열림 상태는 화면에만 있고 저장하지 않습니다.
 */

export const GRAPH_COLORS = { f: '#2563eb', inv: '#e11d48', yx: '#94a3b8' } as const;

export interface InverseGraphPanel {
  key: string;
  title?: string;
  lines: GraphLine[];
  points?: GraphPoint[];
  links?: { from: GraphPoint; to: GraphPoint }[];
  range: number;
  tick?: number;
  legend: { color: string; label: string; dashed?: boolean; dot?: boolean }[];
  /** 그래프 아래 짧은 설명 */
  note?: React.ReactNode;
  ariaLabel: string;
}

/** 일차함수 하나 → 함수·역함수·y = x 그래프 묶음 */
export function linearInversePanel(fn: L4GraphFunc, key: string): InverseGraphPanel {
  const inv = inverseLinear(fn.a, fn.b);
  const invLabel = `${fn.invPrefix ?? 'y ='} ${formatLinear(inv)}`;
  return {
    key,
    title: fn.title,
    lines: [
      { a: 1, b: 0, color: GRAPH_COLORS.yx, width: 1.6, label: 'y=x' },
      { a: fn.a, b: fn.b, color: GRAPH_COLORS.f, label: 'f' },
      { a: inv.a, b: inv.b, color: GRAPH_COLORS.inv, label: 'f-inverse' },
    ],
    range: fn.range,
    tick: fn.tick,
    legend: [
      { color: GRAPH_COLORS.f, label: fn.label },
      { color: GRAPH_COLORS.inv, label: invLabel },
      { color: GRAPH_COLORS.yx, label: 'y = x' },
    ],
    ariaLabel: `${fn.label}의 그래프, 역함수 ${invLabel}의 그래프, 직선 y = x`,
  };
}

export function InverseGraphReveal({
  unlocked,
  open,
  onToggle,
  panels,
}: {
  /** 그 문제의 정답 확인을 통과했는지 */
  unlocked: boolean;
  open: boolean;
  onToggle: () => void;
  panels: InverseGraphPanel[];
}) {
  const shown = unlocked && open;
  const cols = panels.length >= 3 ? 'md:grid-cols-3' : panels.length === 2 ? 'sm:grid-cols-2' : '';
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onToggle}
          disabled={!unlocked}
          aria-expanded={shown}
          data-graph-toggle
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-bold transition-colors ${
            unlocked
              ? shown
                ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                : 'border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100'
              : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {!unlocked ? <Lock className="h-4 w-4" /> : shown ? <EyeOff className="h-4 w-4" /> : <ChartLine className="h-4 w-4" />}
          <span>{shown ? '그래프 닫기' : '그래프로 확인하기'}</span>
        </button>
        {!unlocked && <span className="text-[11px] sm:text-xs text-slate-500">정답 확인을 통과하면 그래프를 볼 수 있어요.</span>}
      </div>
      {shown && (
        <div className="rounded-2xl border border-rose-200/80 bg-rose-50/30 p-3 sm:p-4 space-y-3">
          <div className={`grid grid-cols-1 ${cols} gap-3`}>
            {panels.map((pn) => (
              <div key={pn.key} data-graph-panel={pn.key} className="min-w-0 rounded-xl border border-slate-200 bg-white p-2 space-y-2">
                {pn.title && (
                  <div className="text-center text-xs font-extrabold text-slate-700">
                    <MathText text={pn.title} />
                  </div>
                )}
                <LinearGraph lines={pn.lines} points={pn.points} links={pn.links} range={pn.range} tick={pn.tick} ariaLabel={pn.ariaLabel} />
                <GraphLegend items={pn.legend} />
                {pn.note && <div className="text-center text-[11px] sm:text-xs text-slate-600">{pn.note}</div>}
              </div>
            ))}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-600 text-center">
            파란 그래프와 빨간 그래프가 직선 <MathText text="y = x" />에 대하여 대칭인지 확인해 보세요.
          </p>
        </div>
      )}
    </div>
  );
}
