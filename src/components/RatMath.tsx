import React from 'react';
import { parseRat, stripParen, type RatNode } from '../utils/ratExpr';

/**
 * 분수 모양 수식 (6·7차시 공용)
 * - Frac: 분자·분모를 위아래로 쌓은 분수
 * - RatView: ratExpr 계산 나무를 분수 모양으로 (학생 입력 미리보기)
 * - Expr: 문항 식(계산용 글자, 예: "(x-1)/(x+2)")을 분수 모양으로
 */

export function Frac({ n, d }: { n: React.ReactNode; d: React.ReactNode }) {
  return (
    <span className="inline-flex flex-col items-center align-middle mx-0.5 leading-tight" role="math">
      <span className="px-1 pb-0.5">{n}</span>
      <span className="px-1 pt-0.5 border-t-[1.5px] border-current w-full text-center">{d}</span>
    </span>
  );
}

export const V = () => <i className="font-serif">x</i>;

/** 계산 나무를 분수 모양으로 그립니다 */
export function RatView({ node }: { node: RatNode }): React.ReactElement {
  switch (node.k) {
    case 'num':
      return <>{Number.isInteger(node.v) ? node.v : Number(node.v.toFixed(6))}</>;
    case 'var':
      return <V />;
    case 'add':
    case 'sub':
      return (
        <>
          <RatView node={node.a} />
          <span className="mx-1">{node.k === 'add' ? '+' : '−'}</span>
          <RatView node={node.b} />
        </>
      );
    case 'mul':
      return (
        <>
          <RatView node={node.a} />
          {!node.implicit && <span className="mx-1">×</span>}
          <RatView node={node.b} />
        </>
      );
    case 'div':
      return <Frac n={<RatView node={stripParen(node.a)} />} d={<RatView node={stripParen(node.b)} />} />;
    case 'neg':
      return (
        <>
          −<RatView node={node.a} />
        </>
      );
    case 'pow':
      return (
        <>
          <RatView node={node.a} />
          <sup className="text-[0.7em]">{node.n}</sup>
        </>
      );
    case 'paren':
      return (
        <>
          (<RatView node={node.a} />)
        </>
      );
  }
}

/** 문항 식(계산용 글자)을 분수 모양으로 */
export function Expr({ raw, className = '' }: { raw: string; className?: string }) {
  const node = parseRat(raw);
  if (!node) return <span className={className}>{raw}</span>;
  return (
    <span className={`inline-flex items-center flex-wrap ${className}`}>
      <RatView node={node} />
    </span>
  );
}

