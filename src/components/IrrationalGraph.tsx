import React, { useId } from 'react';
import { ChartLine, EyeOff, Lock } from 'lucide-react';
import { MathText } from './MathText';
import { irrValue, type IrrFn } from '../utils/lesson8Logic';

/**
 * 무리함수 y = ±√(a(x − p)) + q의 그래프 (8차시) — RationalGraph(7차시)와 같은 모양
 * - 보이는 범위: −range ≤ x, y ≤ range (기본 6)
 * - 무리함수 곡선은 시작점 (p, q) 근처를 촘촘하게 그립니다(시작점에서 곡선이 세로로 서기 때문).
 * - f로 다른 함수(예: y = x², y = x)도 함께 그릴 수 있습니다.
 */

export const IRR_COLORS = { base: '#94a3b8', main: '#e11d48', alt: '#2563eb', third: '#16a34a', guide: '#64748b' } as const;

export interface IrrCurve {
  fn?: IrrFn;
  /** 무리함수가 아닌 곡선 (fn이 없을 때) */
  f?: (x: number) => number;
  /** f의 정의역 [시작, 끝] (없으면 보이는 범위 전체) */
  domain?: [number, number];
  color: string;
  width?: number;
  dashed?: boolean;
  /** 시작점 (p, q)에 점을 찍고 축까지 점선 */
  start?: boolean;
}

export interface IrrationalGraphProps {
  curves: IrrCurve[];
  points?: { x: number; y: number; color: string; label?: string }[];
  range?: number;
  ariaLabel: string;
}

const SIZE = 360;
const PAD = 14;

/** 곡선을 SVG 경로 조각으로 (값이 없거나 화면 밖 멀리 나가면 끊음) */
export function irrPaths(c: IrrCurve, range: number, sx: (x: number) => number, sy: (y: number) => number): string[] {
  const xs: number[] = [];
  if (c.fn) {
    const dir = c.fn.a > 0 ? 1 : -1;
    const span = range * 2 + Math.abs(c.fn.p) + 1;
    const N = 360;
    for (let i = 0; i <= N; i++) xs.push(c.fn.p + dir * span * (i / N) ** 2);
  } else {
    const [lo, hi] = c.domain ?? [-range, range];
    const N = 480;
    for (let i = 0; i <= N; i++) xs.push(lo + ((hi - lo) * i) / N);
  }
  const value = (x: number) => (c.fn ? irrValue(c.fn, x) : c.f ? c.f(x) : NaN);
  const out: string[] = [];
  let cur: string[] = [];
  const limit = range * 4;
  for (const x of xs) {
    const y = value(x);
    if (!Number.isFinite(y) || Math.abs(y) > limit || Math.abs(x) > limit) {
      if (cur.length > 1) out.push(cur.join(' '));
      cur = [];
      continue;
    }
    cur.push(`${cur.length === 0 ? 'M' : 'L'}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`);
  }
  if (cur.length > 1) out.push(cur.join(' '));
  return out;
}

export function IrrationalGraph({ curves, points = [], range = 6, ariaLabel }: IrrationalGraphProps) {
  const clipId = `ig-clip-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
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
          .filter((c) => c.start && c.fn && (c.fn.p !== 0 || c.fn.q !== 0))
          .map((c, i) => (
            <g key={`g-${i}`} data-start={`${c.fn!.p},${c.fn!.q}`}>
              <line x1={sx(c.fn!.p)} y1={sy(0)} x2={sx(c.fn!.p)} y2={sy(c.fn!.q)} stroke={IRR_COLORS.guide} strokeWidth="1.1" strokeDasharray="4 4" />
              <line x1={sx(0)} y1={sy(c.fn!.q)} x2={sx(c.fn!.p)} y2={sy(c.fn!.q)} stroke={IRR_COLORS.guide} strokeWidth="1.1" strokeDasharray="4 4" />
            </g>
          ))}
        {curves.map((c, i) =>
          irrPaths(c, range, sx, sy).map((d, j) => (
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
        {curves
          .filter((c) => c.start && c.fn)
          .map((c, i) => (
            <circle key={`s-${i}`} cx={sx(c.fn!.p)} cy={sy(c.fn!.q)} r={4.5} fill={c.color} stroke="#ffffff" strokeWidth="1.5" />
          ))}
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

/** 범례 (근호를 MathText로 그림 — LinearGraph의 GraphLegend와 같은 모양) */
export function IrrLegend({ items }: { items: { color: string; label: string; dashed?: boolean; dot?: boolean }[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] sm:text-xs font-bold text-slate-700">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5">
          <svg width="22" height="8" aria-hidden="true">
            {it.dot ? (
              <circle cx="11" cy="4" r="3.5" fill={it.color} />
            ) : (
              <line x1="1" y1="4" x2="21" y2="4" stroke={it.color} strokeWidth="2.5" strokeDasharray={it.dashed ? '5 3' : undefined} />
            )}
          </svg>
          <span>
            <MathText text={it.label} />
          </span>
        </span>
      ))}
    </div>
  );
}

export interface IrrPanel {
  key: string;
  title?: string;
  curves: IrrCurve[];
  points?: IrrationalGraphProps['points'];
  range?: number;
  legend: { color: string; label: string; dashed?: boolean; dot?: boolean }[];
  note?: React.ReactNode;
  ariaLabel: string;
}

/**
 * 문제별 [그래프로 확인하기] — 정답 확인을 통과해야 켜짐(7차시와 같은 규칙). 열림 상태는 화면에만 있고 저장하지 않음.
 */
export function IrrGraphReveal({
  unlocked,
  open,
  onToggle,
  panels,
  caption,
}: {
  unlocked: boolean;
  open: boolean;
  onToggle: () => void;
  panels: IrrPanel[];
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
                <IrrationalGraph curves={pn.curves} points={pn.points} range={pn.range} ariaLabel={pn.ariaLabel} />
                <IrrLegend items={pn.legend} />
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
