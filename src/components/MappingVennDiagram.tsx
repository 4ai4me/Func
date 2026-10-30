import React, { useId } from 'react';

/**
 * 두 집합 X → Y 사이의 대응을 벤다이어그램(두 타원 + 화살표)으로 그립니다.
 * - 왼쪽 타원: 정의역 X, 오른쪽 타원: 공역 Y
 * - 화살표: 학생이 만든 대응 x → f(x)
 * - 화살표를 받은 Y의 원소(치역)는 색을 채워 강조하고, 아래에 치역을 글로 보여 줍니다.
 * - onSelectDomain / onPickCodomain 을 주면 그림 속 원소를 눌러 대응을 만들 수 있습니다
 *   (기존 버튼과 같은 처리 함수를 사용 — 마우스·터치 모두 가능).
 */

export interface MappingVennDiagramProps {
  domainLabel: string;
  codomainLabel: string;
  domain: readonly string[];
  codomain: readonly string[];
  /** x → f(x) (선택하지 않은 원소는 없음) */
  mapping: Record<string, string>;
  /** 지금 대응을 정하고 있는 X의 원소 (강조 표시) */
  selectedDomain?: string;
  onSelectDomain?: (x: string) => void;
  onPickCodomain?: (y: string) => void;
  /** 그림 설명 (화면 읽기 프로그램용) */
  ariaLabel: string;
}

const WIDTH = 520;
const ROW = 46;
const PAD_Y = 56;
const X_CX = 130;
const Y_CX = 390;
const RX = 92;

/** 원소 i(전체 n개)의 세로 위치 */
export function elementY(i: number, n: number, height: number): number {
  const top = (height - (n - 1) * ROW) / 2;
  return top + i * ROW;
}

/** 대응에서 치역(화살표를 받은 Y의 원소)을 공역 순서대로 */
export function rangeOf(codomain: readonly string[], mapping: Record<string, string>): string[] {
  const hit = new Set(Object.values(mapping).filter(Boolean));
  return codomain.filter((y) => hit.has(y));
}

function activate(handler?: () => void) {
  return handler
    ? {
        role: 'button' as const,
        tabIndex: 0,
        onClick: handler,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handler();
          }
        },
        style: { cursor: 'pointer' } as React.CSSProperties,
      }
    : {};
}

export function MappingVennDiagram({
  domainLabel,
  codomainLabel,
  domain,
  codomain,
  mapping,
  selectedDomain,
  onSelectDomain,
  onPickCodomain,
  ariaLabel,
}: MappingVennDiagramProps) {
  const markerId = `venn-arrow-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const n = Math.max(domain.length, codomain.length);
  const height = Math.max(240, (n - 1) * ROW + PAD_Y * 2 + 30);
  const ry = ((n - 1) * ROW) / 2 + 40;
  const cy = height / 2;
  const range = rangeOf(codomain, mapping);
  const rangeSet = new Set(range);

  const yPos = (list: readonly string[], v: string) => elementY(list.indexOf(v), list.length, height);

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${WIDTH} ${height + 8}`}
        className="w-full max-w-xl mx-auto block select-none"
        role="img"
        aria-label={ariaLabel}
      >
        <defs>
          <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
          </marker>
        </defs>

        {/* 집합 이름 */}
        <text x={X_CX} y={22} textAnchor="middle" className="fill-slate-700" fontSize="15" fontWeight="800">
          {domainLabel}
        </text>
        <text x={Y_CX} y={22} textAnchor="middle" className="fill-slate-700" fontSize="15" fontWeight="800">
          {codomainLabel}
        </text>

        {/* 두 집합 (타원) */}
        <ellipse cx={X_CX} cy={cy + 8} rx={RX} ry={ry} fill="#eff6ff" stroke="#2563eb" strokeWidth="2" />
        <ellipse cx={Y_CX} cy={cy + 8} rx={RX} ry={ry} fill="#f0fdf4" stroke="#16a34a" strokeWidth="2" />

        {/* 대응 화살표 */}
        {domain.map((x) => {
          const y = mapping[x];
          if (!y || !codomain.includes(y)) return null;
          const y1 = yPos(domain, x) + 8;
          const y2 = yPos(codomain, y) + 8;
          return (
            <line
              key={`${x}->${y}`}
              data-arrow={`${x}->${y}`}
              x1={X_CX + 44}
              y1={y1}
              x2={Y_CX - 46}
              y2={y2}
              stroke="#2563eb"
              strokeWidth={2}
              strokeOpacity={selectedDomain && selectedDomain !== x ? 0.75 : 1}
              markerEnd={`url(#${markerId})`}
            />
          );
        })}

        {/* 정의역 X의 원소 */}
        {domain.map((x) => {
          const y = yPos(domain, x) + 8;
          const selected = selectedDomain === x;
          const mapped = Boolean(mapping[x]);
          return (
            <g key={`d-${x}`} {...activate(onSelectDomain ? () => onSelectDomain(x) : undefined)} aria-label={`${domainLabel}의 원소 ${x}`}>
              <rect
                x={X_CX - 44}
                y={y - 15}
                width={88}
                height={30}
                rx={15}
                fill={selected ? '#2563eb' : mapped ? '#dbeafe' : '#ffffff'}
                stroke={selected ? '#1d4ed8' : '#93c5fd'}
                strokeWidth="1.5"
              />
              <text x={X_CX} y={y + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill={selected ? '#ffffff' : '#1e3a8a'}>
                {x}
              </text>
            </g>
          );
        })}

        {/* 공역 Y의 원소 (치역에 속하면 색 채움) */}
        {codomain.map((v) => {
          const y = yPos(codomain, v) + 8;
          const inRange = rangeSet.has(v);
          return (
            <g key={`c-${v}`} {...activate(onPickCodomain ? () => onPickCodomain(v) : undefined)} aria-label={`${codomainLabel}의 원소 ${v}${inRange ? ' (치역)' : ''}`}>
              <rect
                x={Y_CX - 44}
                y={y - 15}
                width={88}
                height={30}
                rx={15}
                fill={inRange ? '#16a34a' : '#ffffff'}
                stroke={inRange ? '#15803d' : '#86efac'}
                strokeWidth="1.5"
              />
              <text x={Y_CX} y={y + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill={inRange ? '#ffffff' : '#14532d'}>
                {v}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-1 text-center text-[11px] sm:text-xs text-slate-600">
        <span className="font-bold text-emerald-700">치역</span> = {range.length ? `{${range.join(', ')}}` : '∅ (아직 대응 없음)'}
        {' · '}화살표를 받은 원소는 초록색으로 표시됩니다.
        {onSelectDomain && onPickCodomain && ' 그림에서 왼쪽 원소를 누른 뒤 오른쪽 원소를 눌러도 연결됩니다.'}
      </figcaption>
    </figure>
  );
}
