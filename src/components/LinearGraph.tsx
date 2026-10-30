import React, { useId } from 'react';

/**
 * 좌표평면에 직선 y = ax + b 여러 개와 점을 그립니다 (4차시 역함수 그래프 탐구용).
 * - 보이는 범위: −range ≤ x, y ≤ range (기본 6)
 * - 화면 밖으로 나가는 부분은 잘라서(clipPath) 그립니다.
 */

export interface GraphLine {
  a: number;
  b: number;
  color: string;
  label?: string;
  dashed?: boolean;
  width?: number;
}

export interface GraphPoint {
  x: number;
  y: number;
  color: string;
  label?: string;
}

export interface LinearGraphProps {
  lines: GraphLine[];
  points?: GraphPoint[];
  /** 두 점을 잇는 점선 (예: (a, b)와 (b, a)) */
  links?: { from: GraphPoint; to: GraphPoint }[];
  range?: number;
  ariaLabel: string;
}

const SIZE = 360;
const PAD = 14;

/** 직선 y = ax + b가 x = −range, range에서 지나는 두 점 */
export function lineEndpoints(a: number, b: number, range: number): [number, number, number, number] {
  return [-range, a * -range + b, range, a * range + b];
}

export function LinearGraph({ lines, points = [], links = [], range = 6, ariaLabel }: LinearGraphProps) {
  const clipId = `lg-clip-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const unit = (SIZE - PAD * 2) / (range * 2);
  const sx = (x: number) => PAD + (x + range) * unit;
  const sy = (y: number) => PAD + (range - y) * unit;
  const ticks = Array.from({ length: range * 2 + 1 }, (_, i) => i - range);

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
      {/* 축 */}
      <line x1={PAD} y1={sy(0)} x2={SIZE - PAD} y2={sy(0)} stroke="#64748b" strokeWidth="1.2" />
      <line x1={sx(0)} y1={PAD} x2={sx(0)} y2={SIZE - PAD} stroke="#64748b" strokeWidth="1.2" />
      <text x={SIZE - PAD - 4} y={sy(0) - 5} textAnchor="end" fontSize="12" fill="#475569" fontStyle="italic">x</text>
      <text x={sx(0) + 6} y={PAD + 12} fontSize="12" fill="#475569" fontStyle="italic">y</text>
      <text x={sx(0) - 4} y={sy(0) + 13} textAnchor="end" fontSize="11" fill="#475569">O</text>
      {[-range / 2, range / 2].map((t) => (
        <g key={`lab-${t}`}>
          <text x={sx(t)} y={sy(0) + 13} textAnchor="middle" fontSize="10" fill="#94a3b8">{t}</text>
          <text x={sx(0) - 4} y={sy(t) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{t}</text>
        </g>
      ))}

      <g clipPath={`url(#${clipId})`}>
        {lines.map((l, i) => {
          const [x1, y1, x2, y2] = lineEndpoints(l.a, l.b, range * 3);
          return (
            <line
              key={`l-${i}`}
              data-line={l.label || i}
              x1={sx(x1)}
              y1={sy(y1)}
              x2={sx(x2)}
              y2={sy(y2)}
              stroke={l.color}
              strokeWidth={l.width ?? 2.4}
              strokeDasharray={l.dashed ? '7 5' : undefined}
              strokeLinecap="round"
            />
          );
        })}
        {links.map((k, i) => (
          <line key={`k-${i}`} x1={sx(k.from.x)} y1={sy(k.from.y)} x2={sx(k.to.x)} y2={sy(k.to.y)} stroke="#64748b" strokeWidth="1.3" strokeDasharray="3 3" />
        ))}
        {points.map((p, i) => (
          <g key={`p-${i}`}>
            <circle cx={sx(p.x)} cy={sy(p.y)} r={5} fill={p.color} stroke="#ffffff" strokeWidth="1.5" />
            {p.label && (
              <text x={sx(p.x) + 8} y={sy(p.y) - 8} fontSize="12" fontWeight="700" fill={p.color}>
                {p.label}
              </text>
            )}
          </g>
        ))}
      </g>
    </svg>
  );
}

/** 그래프 옆에 붙이는 범례 */
export function GraphLegend({ items }: { items: { color: string; label: string; dashed?: boolean }[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] sm:text-xs font-bold text-slate-700">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5">
          <svg width="22" height="8" aria-hidden="true">
            <line x1="1" y1="4" x2="21" y2="4" stroke={it.color} strokeWidth="2.5" strokeDasharray={it.dashed ? '5 3' : undefined} />
          </svg>
          <span>{it.label}</span>
        </span>
      ))}
    </div>
  );
}
