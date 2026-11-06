import React, { useId } from 'react';
import { ChartLine, EyeOff, Lock } from 'lucide-react';
import { GraphLegend } from './LinearGraph';
import { rationalValue, type RationalFn } from '../utils/lesson7Logic';

/**
 * 유리함수 y = k/(x − p) + q의 그래프 (7차시)
 * - 보이는 범위: −range ≤ x, y ≤ range (기본 6)
 * - 곡선은 점근선 x = p의 양쪽 두 갈래로 나누어 그립니다(점근선을 가로지르는 선이 생기지 않도록).
 */

export const RAT_COLORS = { base: '#94a3b8', main: '#e11d48', alt: '#2563eb', asym: '#64748b' } as const;

export interface RationalCurve {
  fn: RationalFn;
  color: string;
  width?: number;
  dashed?: boolean;
  /** 이 곡선의 점근선 x = p, y = q를 점선으로 그림 */
  asymptotes?: boolean;
}

export interface RationalGraphProps {
  curves: RationalCurve[];
  points?: { x: number; y: number; color: string; label?: string }[];
  range?: number;
  ariaLabel: string;
}

const SIZE = 360;
const PAD = 14;

/** 곡선을 SVG 경로 조각으로 (점근선에서 끊고, 화면 밖 멀리 나가면 끊음) */
export function rationalPaths(fn: RationalFn, range: number, sx: (x: number) => number, sy: (y: number) => number): string[] {
  const out: string[] = [];
  const N = 480;
  let cur: string[] = [];
  const limit = range * 4;
  for (let i = 0; i <= N; i++) {
    const x = -range + (2 * range * i) / N;
    const y = rationalValue(fn, x);
    const crossed = cur.length > 0 && i > 0 && Math.sign(x - fn.p) !== Math.sign(-range + (2 * range * (i - 1)) / N - fn.p);
    if (!Number.isFinite(y) || Math.abs(y) > limit || crossed) {
      if (cur.length > 1) out.push(cur.join(' '));
      cur = [];
      if (!Number.isFinite(y) || Math.abs(y) > limit) continue;
    }
    cur.push(`${cur.length === 0 ? 'M' : 'L'}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`);
  }
  if (cur.length > 1) out.push(cur.join(' '));
  return out;
}

export function RationalGraph({ curves, points = [], range = 6, ariaLabel }: RationalGraphProps) {
  const clipId = `rg-clip-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const unit = (SIZE - PAD * 2) / (range * 2);
  const sx = (x: number) => PAD + (x + range) * unit;
  const sy = (y: number) => PAD + (range - y) * unit;
  const ticks = Array.from({ length: range * 2 + 1 }, (_, i) => i - range);
  const labelStep = range > 6 ? 4 : 2;

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[360px] mx-auto block select-none" role="img" aria-label={ariaLabel}>
      <defs>
        <clipPath id={clipId}>
          <rect x={PAD} y={PAD} width={SIZE - PAD * 2} height={SIZE - PAD * 2} />
        </clipPath>
      </defs>
      <rect x={PAD} y={PAD} width={SIZE - PAD * 2} height={SIZE - PAD * 2} fill="#ffffff" stroke="#e2e8f0" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={sx(t)} y1={PAD} x2={sx(t)} y2={SIZE - PAD} stroke="#f1f5f9" />
          <line x1={PAD} y1={sy(t)} x2={SIZE - PAD} y2={sy(t)} stroke="#f1f5f9" />
        </g>
      ))}
      <line x1={PAD} y1={sy(0)} x2={SIZE - PAD} y2={sy(0)} stroke="#64748b" strokeWidth="1.2" />
      <line x1={sx(0)} y1={PAD} x2={sx(0)} y2={SIZE - PAD} stroke="#64748b" strokeWidth="1.2" />
      <text x={SIZE - PAD - 4} y={sy(0) - 5} textAnchor="end" fontSize="12" fill="#475569" fontStyle="italic">
        x
      </text>
      <text x={sx(0) + 6} y={PAD + 12} fontSize="12" fill="#475569" fontStyle="italic">
        y
      </text>
      <text x={sx(0) - 4} y={sy(0) + 13} textAnchor="end" fontSize="11" fill="#475569">
        O
      </text>
      {ticks
        .filter((t) => t !== 0 && t % labelStep === 0 && Math.abs(t) < range)
        .map((t) => (
          <g key={`lab-${t}`}>
            <text x={sx(t)} y={sy(0) + 13} textAnchor="middle" fontSize="10" fill="#94a3b8">
              {t}
            </text>
            <text x={sx(0) - 4} y={sy(t) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
              {t}
            </text>
          </g>
        ))}

      <g clipPath={`url(#${clipId})`}>
        {curves
          .filter((c) => c.asymptotes)
          .map((c, i) => (
            <g key={`a-${i}`} data-asymptote={`${c.fn.p},${c.fn.q}`}>
              <line x1={sx(c.fn.p)} y1={PAD} x2={sx(c.fn.p)} y2={SIZE - PAD} stroke={RAT_COLORS.asym} strokeWidth="1.3" strokeDasharray="6 4" />
              <line x1={PAD} y1={sy(c.fn.q)} x2={SIZE - PAD} y2={sy(c.fn.q)} stroke={RAT_COLORS.asym} strokeWidth="1.3" strokeDasharray="6 4" />
            </g>
          ))}
        {curves.map((c, i) =>
          rationalPaths(c.fn, range, sx, sy).map((d, j) => (
            <path
              key={`c-${i}-${j}`}
              data-curve={i}
              d={d}
              fill="none"
              stroke={c.color}
              strokeWidth={c.width ?? 2.4}
              strokeDasharray={c.dashed ? '7 5' : undefined}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))
        )}
        {points.map((pt, i) => (
          <g key={`p-${i}`}>
            <circle cx={sx(pt.x)} cy={sy(pt.y)} r={5} fill={pt.color} stroke="#ffffff" strokeWidth="1.5" />
            {pt.label && (
              <text x={sx(pt.x) + 8} y={sy(pt.y) - 8} fontSize="12" fontWeight="700" fill={pt.color}>
                {pt.label}
              </text>
            )}
          </g>
        ))}
      </g>
    </svg>
  );
}

export interface RationalPanel {
  key: string;
  title?: string;
  curves: RationalCurve[];
  points?: RationalGraphProps['points'];
  range?: number;
  legend: { color: string; label: string; dashed?: boolean; dot?: boolean }[];
  note?: React.ReactNode;
  ariaLabel: string;
}

/**
 * 문제별 [그래프로 확인하기] — 정답 확인을 통과해야 켜짐(4차시와 같은 규칙). 열림 상태는 화면에만 있고 저장하지 않음.
 */
export function RationalGraphReveal({
  unlocked,
  open,
  onToggle,
  panels,
  caption,
}: {
  unlocked: boolean;
  open: boolean;
  onToggle: () => void;
  panels: RationalPanel[];
  caption?: React.ReactNode;
}) {
  const shown = unlocked && open;
  const cols = panels.length >= 2 ? 'sm:grid-cols-2' : '';
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
                {pn.title && <div className="text-center text-xs font-extrabold text-slate-700">{pn.title}</div>}
                <RationalGraph curves={pn.curves} points={pn.points} range={pn.range} ariaLabel={pn.ariaLabel} />
                <GraphLegend items={pn.legend} />
                {pn.note && <div className="text-center text-[11px] sm:text-xs text-slate-600">{pn.note}</div>}
              </div>
            ))}
          </div>
          {caption && <p className="text-[11px] sm:text-xs text-slate-600 text-center">{caption}</p>}
        </div>
      )}
    </div>
  );
}
