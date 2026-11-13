import React from 'react';
import { parseIrr, type IrrNode } from '../utils/irrExpr';
import { Frac, V } from './RatMath';

/**
 * 근호·분수 모양 수식 (8차시)
 * - Root: 근호 안에 React 요소를 넣는 근호 (MathText의 MathRadical과 같은 모양 — index.css .math-radical)
 * - IrrView: irrExpr 계산 나무를 근호·분수 모양으로 (학생 입력 미리보기)
 */

const SURD_PATH = 'M 0.8 11.4 L 3.0 9.8 L 6.0 18.2 L 11.3 0.85 L 12.6 0.85';

export function Root({ children }: { children: React.ReactNode }) {
  return (
    <span className="math-radical" role="math">
      <span className="math-radical-surd" aria-hidden="true">
        <svg viewBox="0 0 12 20" preserveAspectRatio="none" className="math-radical-svg" focusable="false">
          <path d={SURD_PATH} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
      </span>
      <span className="sr-only">√(</span>
      <span className="math-radical-body">{children}</span>
      <span className="sr-only">)</span>
    </span>
  );
}

const strip = (n: IrrNode): IrrNode => (n.k === 'paren' ? strip(n.a) : n);

export function IrrView({ node }: { node: IrrNode }): React.ReactElement {
  switch (node.k) {
    case 'num':
      return <>{Number.isInteger(node.v) ? node.v : Number(node.v.toFixed(6))}</>;
    case 'var':
      return <V />;
    case 'add':
    case 'sub':
      return (
        <>
          <IrrView node={node.a} />
          <span className="mx-1">{node.k === 'add' ? '+' : '−'}</span>
          <IrrView node={node.b} />
        </>
      );
    case 'mul':
      return (
        <>
          <IrrView node={node.a} />
          {!node.implicit && <span className="mx-1">×</span>}
          <IrrView node={node.b} />
        </>
      );
    case 'div':
      return <Frac n={<IrrView node={strip(node.a)} />} d={<IrrView node={strip(node.b)} />} />;
    case 'neg':
      return (
        <>
          −<IrrView node={node.a} />
        </>
      );
    case 'pow':
      return (
        <>
          <IrrView node={node.a} />
          <sup className="text-[0.7em]">{node.n}</sup>
        </>
      );
    case 'sqrt':
      return (
        <Root>
          <IrrView node={strip(node.a)} />
        </Root>
      );
    case 'paren':
      return (
        <>
          (<IrrView node={node.a} />)
        </>
      );
  }
}

/** 식 글자(계산용)를 근호·분수 모양으로 */
export function IrrExpr({ raw, className = '' }: { raw: string; className?: string }) {
  const node = parseIrr(raw);
  if (!node) return <span className={className}>{raw}</span>;
  return (
    <span className={`inline-flex items-center flex-wrap ${className}`}>
      <IrrView node={node} />
    </span>
  );
}
