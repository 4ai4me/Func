import React, { useId } from 'react';

/**
 * 합성함수 g∘f 를 세 집합 X → Y → Z 벤다이어그램으로 그립니다.
 * - 세 타원: X(정의역), Y(징검다리 집합), Z(g∘f의 공역)
 * - 실선 화살표: f (X → Y), g (Y → Z)
 * - 점선 곡선 화살표: g∘f (X → Z, Y를 건너뛰어 바로 대응)
 * - highlight 를 주면 그 원소의 경로(x → f(x) → g(f(x)))만 진하게, 나머지는 흐리게 표시
 * - onSelectDomain 을 주면 X의 원소를 눌러 경로를 고를 수 있음 (마우스·터치·키보드)
 */

export interface CompositeVennDiagramProps {
  setX: readonly string[];
  setY: readonly string[];
  setZ: readonly string[];
  /** f: X → Y */
  f: Record<string, string>;
  /** g: Y → Z */
  g: Record<string, string>;
  labels?: { x: string; y: string; z: string };
  /** 강조할 X의 원소 (없으면 전체 경로) */
  highlight?: string | null;
  /** g∘f 점선 화살표 표시 여부 */
  showComposite?: boolean;
  onSelectDomain?: (x: string) => void;
  ariaLabel: string;
}

const WIDTH = 760;
const ROW = 46;
const CX = { x: 120, y: 380, z: 640 } as const;
const RX = 92;
const BOX_W = 92;

export function columnY(i: number, n: number, height: number): number {
  return (height - (n - 1) * ROW) / 2 + i * ROW + 14;
}

/** g∘f 대응표: x → g(f(x)) (f나 g가 정의되지 않으면 제외) */
export function composeMapping(
  setX: readonly string[],
  f: Record<string, string>,
  g: Record<string, string>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const x of setX) {
    const y = f[x];
    const z = y !== undefined ? g[y] : undefined;
    if (z !== undefined) out[x] = z;
  }
  return out;
}

export function CompositeVennDiagram({
  setX,
  setY,
  setZ,
  f,
  g,
  labels = { x: 'X', y: 'Y', z: 'Z' },
  highlight = null,
  showComposite = true,
  onSelectDomain,
  ariaLabel,
}: CompositeVennDiagramProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const n = Math.max(setX.length, setY.length, setZ.length);
  // 아래쪽에 g∘f 점선이 지나갈 공간 포함
  const height = Math.max(250, (n - 1) * ROW + 150);
  const svgHeight = height + 24 + setX.length * 9;
  const ry = ((n - 1) * ROW) / 2 + 42;
  const cy = height / 2 + 14;
  const gf = composeMapping(setX, f, g);

  const posX = (v: string) => columnY(setX.indexOf(v), setX.length, height);
  const posY = (v: string) => columnY(setY.indexOf(v), setY.length, height);
  const posZ = (v: string) => columnY(setZ.indexOf(v), setZ.length, height);

  // 강조 경로에 포함된 원소
  const hiY = highlight ? f[highlight] : null;
  const hiZ = highlight ? gf[highlight] : null;
  const dim = (on: boolean) => (highlight && !on ? 0.22 : 1);

  const fUsed = new Set(Object.values(f));
  const gfUsed = new Set(Object.values(gf));

  const box = (
    key: string,
    cx: number,
    y: number,
    text: string,
    fill: string,
    stroke: string,
    textFill: string,
    opacity: number,
    onClick?: () => void
  ) => (
    <g
      key={key}
      opacity={opacity}
      {...(onClick
        ? {
            role: 'button',
            tabIndex: 0,
            onClick,
            onKeyDown: (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            },
            style: { cursor: 'pointer' },
            'aria-label': `${text} 경로 보기`,
          }
        : {})}
    >
      <rect x={cx - BOX_W / 2} y={y - 15} width={BOX_W} height={30} rx={15} fill={fill} stroke={stroke} strokeWidth="1.5" />
      <text x={cx} y={y + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill={textFill}>
        {text}
      </text>
    </g>
  );

  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${WIDTH} ${svgHeight}`} className="w-full max-w-3xl mx-auto block select-none" role="img" aria-label={ariaLabel}>
        <defs>
          <marker id={`f-${uid}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
          </marker>
          <marker id={`g-${uid}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#d97706" />
          </marker>
          <marker id={`gf-${uid}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#059669" />
          </marker>
        </defs>

        {/* 집합 이름과 함수 이름 */}
        <text x={CX.x} y={22} textAnchor="middle" fontSize="15" fontWeight="800" fill="#334155">{labels.x}</text>
        <text x={CX.y} y={22} textAnchor="middle" fontSize="15" fontWeight="800" fill="#334155">{labels.y}</text>
        <text x={CX.z} y={22} textAnchor="middle" fontSize="15" fontWeight="800" fill="#334155">{labels.z}</text>
        <text x={(CX.x + CX.y) / 2} y={44} textAnchor="middle" fontSize="15" fontStyle="italic" fontWeight="700" fill="#2563eb">f</text>
        <text x={(CX.y + CX.z) / 2} y={44} textAnchor="middle" fontSize="15" fontStyle="italic" fontWeight="700" fill="#d97706">g</text>

        {/* 세 집합 */}
        <ellipse cx={CX.x} cy={cy} rx={RX} ry={ry} fill="#eff6ff" stroke="#2563eb" strokeWidth="2" />
        <ellipse cx={CX.y} cy={cy} rx={RX} ry={ry} fill="#fffbeb" stroke="#d97706" strokeWidth="2" />
        <ellipse cx={CX.z} cy={cy} rx={RX} ry={ry} fill="#ecfdf5" stroke="#059669" strokeWidth="2" />

        {/* g∘f: X → Z 점선 곡선 (Y 아래쪽으로 돌아감) */}
        {showComposite &&
          setX.map((x) => {
            const z = gf[x];
            if (z === undefined || !setZ.includes(z)) return null;
            const y1 = posX(x);
            const y2 = posZ(z);
            const x1 = CX.x + BOX_W / 2;
            const x2 = CX.z - BOX_W / 2 - 2;
            // 두 조절점의 높이가 같은 3차 베지어 곡선의 가운데(t=0.5) 높이는 (y1 + y2)/8 + 0.75 × 조절점 높이.
            // 가운데가 Y 집합(타원) 아래쪽(clear)을 지나도록 조절점 높이를 정함
            const clear = cy + ry + 14 + setX.indexOf(x) * 9;
            const bottom = (clear - (y1 + y2) / 8) / 0.75;
            return (
              <path
                key={`gf-${x}`}
                data-arrow={`gf:${x}->${z}`}
                d={`M ${x1} ${y1} C ${x1 + 120} ${bottom}, ${x2 - 120} ${bottom}, ${x2} ${y2}`}
                fill="none"
                stroke="#059669"
                strokeWidth="2"
                strokeDasharray="6 5"
                markerEnd={`url(#gf-${uid})`}
                opacity={dim(highlight === x)}
              />
            );
          })}

        {/* f: X → Y */}
        {setX.map((x) => {
          const y = f[x];
          if (y === undefined || !setY.includes(y)) return null;
          return (
            <line
              key={`f-${x}`}
              data-arrow={`f:${x}->${y}`}
              x1={CX.x + BOX_W / 2}
              y1={posX(x)}
              x2={CX.y - BOX_W / 2 - 2}
              y2={posY(y)}
              stroke="#2563eb"
              strokeWidth="2"
              markerEnd={`url(#f-${uid})`}
              opacity={dim(highlight === x)}
            />
          );
        })}

        {/* g: Y → Z */}
        {setY.map((y) => {
          const z = g[y];
          if (z === undefined || !setZ.includes(z)) return null;
          return (
            <line
              key={`g-${y}`}
              data-arrow={`g:${y}->${z}`}
              x1={CX.y + BOX_W / 2}
              y1={posY(y)}
              x2={CX.z - BOX_W / 2 - 2}
              y2={posZ(z)}
              stroke="#d97706"
              strokeWidth="2"
              markerEnd={`url(#g-${uid})`}
              opacity={dim(hiY === y)}
            />
          );
        })}

        {/* 원소 */}
        {setX.map((x) =>
          box(`x-${x}`, CX.x, posX(x), x,
            highlight === x ? '#2563eb' : '#dbeafe', '#2563eb', highlight === x ? '#ffffff' : '#1e3a8a',
            dim(highlight === x), onSelectDomain ? () => onSelectDomain(x) : undefined)
        )}
        {setY.map((y) =>
          box(`y-${y}`, CX.y, posY(y), y,
            hiY === y ? '#d97706' : fUsed.has(y) ? '#fde68a' : '#ffffff', '#d97706', hiY === y ? '#ffffff' : '#78350f',
            dim(hiY === y))
        )}
        {setZ.map((z) =>
          box(`z-${z}`, CX.z, posZ(z), z,
            hiZ === z ? '#059669' : gfUsed.has(z) ? '#a7f3d0' : '#ffffff', '#059669', hiZ === z ? '#ffffff' : '#064e3b',
            dim(hiZ === z))
        )}
      </svg>
      <figcaption className="mt-1 text-center text-[11px] sm:text-xs text-slate-600 leading-relaxed">
        <span className="font-bold text-blue-700">파란 실선</span> f: X → Y ·{' '}
        <span className="font-bold text-amber-700">주황 실선</span> g: Y → Z
        {showComposite && (
          <>
            {' '}· <span className="font-bold text-emerald-700">초록 점선</span> g∘f: X → Z (Y를 거쳐 한 번에 대응)
          </>
        )}
        {onSelectDomain && <> · 그림에서 X의 원소를 누르면 그 경로만 강조됩니다.</>}
      </figcaption>
    </figure>
  );
}
