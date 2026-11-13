/**
 * 무리식 읽기 (8차시 무리식의 계산 채점용) — 순수 로직, 단위 테스트 대상
 * ------------------------------------------------------------------
 * 학생이 입력한 식을 계산 나무로 읽고, 여러 x 값에서 계산해 정답 식과 비교합니다.
 * 같은 식을 다르게 써도(순서 바꾸기, 괄호) 값이 같으면 같은 답으로 봅니다.
 *
 * - '='가 있으면 마지막 '=' 오른쪽만 읽습니다.
 * - 지원: 숫자(소수), 변수 x, + − × ÷ * / ·, 괄호, 거듭제곱 ^n · ², 곱셈 기호 생략,
 *   근호: √(식) · sqrt(식) · root(식). 괄호 없이 √ 뒤에 숫자·x가 오면 그 덩어리만 근호 안 (√2x = √(2x), √x+1 = √x + 1).
 * - 곱셈 기호를 생략한 곱은 나눗셈보다 먼저 계산합니다(ratExpr.ts와 같은 규칙: 1/2√x = 1/(2√x)).
 *   화면에서 읽은 식을 근호·분수 모양으로 보여 주므로 학생이 직접 확인할 수 있습니다.
 * - 다른 문자·기호가 섞이면 null을 돌려줍니다.
 */

export type IrrNode =
  | { k: 'num'; v: number }
  | { k: 'var' }
  | { k: 'add'; a: IrrNode; b: IrrNode }
  | { k: 'sub'; a: IrrNode; b: IrrNode }
  | { k: 'mul'; a: IrrNode; b: IrrNode; implicit?: boolean }
  | { k: 'div'; a: IrrNode; b: IrrNode }
  | { k: 'neg'; a: IrrNode }
  | { k: 'pow'; a: IrrNode; n: number }
  | { k: 'sqrt'; a: IrrNode }
  | { k: 'paren'; a: IrrNode };

type Tok =
  | { t: 'num'; v: number }
  | { t: 'var' }
  | { t: 'sqrt' }
  | { t: 'op'; v: '+' | '-' | '*' | '/' | '^' }
  | { t: 'lp' }
  | { t: 'rp' };

function normalize(raw: string): string {
  const parts = raw.split('=');
  return (parts[parts.length - 1] || '')
    .replace(/[−–—]/g, '-')
    .replace(/[×·]/g, '*')
    .replace(/÷/g, '/')
    .replace(/[[{]/g, '(')
    .replace(/[\]}]/g, ')')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/\*\*/g, '^')
    .replace(/\s+/g, '')
    .toLowerCase()
    .replace(/sqrt|root|루트/g, '√');
}

function tokenize(src: string): Tok[] | null {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      const text = src.slice(i, j);
      if ((text.match(/\./g) || []).length > 1 || text === '.') return null;
      const v = Number(text);
      if (!Number.isFinite(v)) return null;
      out.push({ t: 'num', v });
      i = j;
      continue;
    }
    if (c === 'x') out.push({ t: 'var' });
    else if (c === '√') out.push({ t: 'sqrt' });
    else if (c === '+' || c === '-' || c === '*' || c === '/' || c === '^') out.push({ t: 'op', v: c });
    else if (c === '(') out.push({ t: 'lp' });
    else if (c === ')') out.push({ t: 'rp' });
    else return null;
    i++;
  }
  return out;
}

class Parser {
  private pos = 0;
  constructor(private readonly toks: Tok[]) {}

  parse(): IrrNode | null {
    if (this.toks.length === 0) return null;
    const v = this.expr();
    if (!v || this.pos !== this.toks.length) return null;
    return v;
  }

  private peek(): Tok | undefined {
    return this.toks[this.pos];
  }

  private expr(): IrrNode | null {
    let left = this.term();
    while (left) {
      const t = this.peek();
      if (t && t.t === 'op' && (t.v === '+' || t.v === '-')) {
        this.pos++;
        const right = this.term();
        if (!right) return null;
        left = t.v === '+' ? { k: 'add', a: left, b: right } : { k: 'sub', a: left, b: right };
      } else break;
    }
    return left;
  }

  private term(): IrrNode | null {
    let left = this.chain();
    while (left) {
      const t = this.peek();
      if (t && t.t === 'op' && (t.v === '*' || t.v === '/')) {
        this.pos++;
        const right = this.chain();
        if (!right) return null;
        left = t.v === '*' ? { k: 'mul', a: left, b: right } : { k: 'div', a: left, b: right };
      } else break;
    }
    return left;
  }

  // 곱셈 기호를 생략한 곱 (나눗셈보다 먼저)
  private chain(): IrrNode | null {
    let left = this.unary();
    while (left) {
      const t = this.peek();
      if (t && (t.t === 'num' || t.t === 'var' || t.t === 'lp' || t.t === 'sqrt')) {
        const right = this.power();
        if (!right) return null;
        left = { k: 'mul', a: left, b: right, implicit: true };
      } else break;
    }
    return left;
  }

  private unary(): IrrNode | null {
    const t = this.peek();
    if (t && t.t === 'op' && (t.v === '+' || t.v === '-')) {
      this.pos++;
      const v = this.unary();
      if (!v) return null;
      return t.v === '-' ? { k: 'neg', a: v } : v;
    }
    return this.power();
  }

  private power(): IrrNode | null {
    let base = this.primary();
    while (base) {
      const t = this.peek();
      if (t && t.t === 'op' && t.v === '^') {
        this.pos++;
        const n = this.peek();
        if (!n || n.t !== 'num' || !Number.isInteger(n.v) || n.v > 12) return null;
        this.pos++;
        base = { k: 'pow', a: base, n: n.v };
      } else break;
    }
    return base;
  }

  private primary(): IrrNode | null {
    const t = this.peek();
    if (!t) return null;
    if (t.t === 'num') {
      this.pos++;
      return { k: 'num', v: t.v };
    }
    if (t.t === 'var') {
      this.pos++;
      return { k: 'var' };
    }
    if (t.t === 'lp') {
      this.pos++;
      const v = this.expr();
      const close = this.peek();
      if (!v || !close || close.t !== 'rp') return null;
      this.pos++;
      return { k: 'paren', a: v };
    }
    if (t.t === 'sqrt') {
      this.pos++;
      const n = this.peek();
      if (!n) return null;
      if (n.t === 'lp') {
        const inner = this.primary();
        if (!inner || inner.k !== 'paren') return null;
        return { k: 'sqrt', a: inner.a };
      }
      // 괄호 없는 근호: 바로 뒤의 숫자(와 x) 또는 x 하나, 또는 √√…
      if (n.t === 'num') {
        this.pos++;
        const num: IrrNode = { k: 'num', v: n.v };
        const after = this.peek();
        if (after && after.t === 'var') {
          this.pos++;
          return { k: 'sqrt', a: { k: 'mul', a: num, b: { k: 'var' }, implicit: true } };
        }
        return { k: 'sqrt', a: num };
      }
      if (n.t === 'var') {
        this.pos++;
        return { k: 'sqrt', a: { k: 'var' } };
      }
      if (n.t === 'sqrt') {
        const inner = this.primary();
        return inner ? { k: 'sqrt', a: inner } : null;
      }
      return null;
    }
    return null;
  }
}

/** 식을 읽어 계산 나무로. 읽을 수 없으면 null */
export function parseIrr(raw: string | undefined | null): IrrNode | null {
  if (!raw || !raw.trim()) return null;
  const toks = tokenize(normalize(raw));
  if (!toks) return null;
  return new Parser(toks).parse();
}

/** x에서의 값 (근호 안이 음수이거나 분모가 0이면 NaN) */
export function evalIrr(n: IrrNode, x: number): number {
  switch (n.k) {
    case 'num':
      return n.v;
    case 'var':
      return x;
    case 'add':
      return evalIrr(n.a, x) + evalIrr(n.b, x);
    case 'sub':
      return evalIrr(n.a, x) - evalIrr(n.b, x);
    case 'mul':
      return evalIrr(n.a, x) * evalIrr(n.b, x);
    case 'div': {
      const d = evalIrr(n.b, x);
      if (Math.abs(d) < 1e-12) return NaN;
      return evalIrr(n.a, x) / d;
    }
    case 'neg':
      return -evalIrr(n.a, x);
    case 'pow':
      return Math.pow(evalIrr(n.a, x), n.n);
    case 'sqrt': {
      const v = evalIrr(n.a, x);
      if (v < -1e-12) return NaN;
      return Math.sqrt(Math.max(0, v));
    }
    case 'paren':
      return evalIrr(n.a, x);
  }
}

/** 근호 안에 x가 있는 근호가 있는지 (무리식인지) */
export function hasVarRoot(n: IrrNode): boolean {
  switch (n.k) {
    case 'num':
    case 'var':
      return false;
    case 'sqrt':
      return hasVar(n.a) || hasVarRoot(n.a);
    case 'neg':
    case 'pow':
    case 'paren':
      return hasVarRoot(n.a);
    default:
      return hasVarRoot(n.a) || hasVarRoot(n.b);
  }
}

export function hasVar(n: IrrNode): boolean {
  switch (n.k) {
    case 'num':
      return false;
    case 'var':
      return true;
    case 'neg':
    case 'pow':
    case 'paren':
    case 'sqrt':
      return hasVar(n.a);
    default:
      return hasVar(n.a) || hasVar(n.b);
  }
}

/** 분모에 근호가 남아 있는지 (분모의 유리화가 덜 되었는지) */
export function hasRootInDenominator(n: IrrNode): boolean {
  switch (n.k) {
    case 'num':
    case 'var':
      return false;
    case 'div':
      return hasAnyRoot(n.b) || hasRootInDenominator(n.a) || hasRootInDenominator(n.b);
    case 'neg':
    case 'pow':
    case 'paren':
    case 'sqrt':
      return hasRootInDenominator(n.a);
    default:
      return hasRootInDenominator(n.a) || hasRootInDenominator(n.b);
  }
}

function hasAnyRoot(n: IrrNode): boolean {
  switch (n.k) {
    case 'num':
    case 'var':
      return false;
    case 'sqrt':
      return true;
    case 'neg':
    case 'pow':
    case 'paren':
      return hasAnyRoot(n.a);
    default:
      return hasAnyRoot(n.a) || hasAnyRoot(n.b);
  }
}

/** 비교에 쓰는 x 값 (8차시 문항의 정의역이 모두 x ≥ 1 안쪽이므로 1보다 큰 값) */
export const IRR_SAMPLE_XS = [1.13, 1.57, 2.21, 2.83, 3.49, 4.37, 5.71, 7.19] as const;

export type IrrCompare = 'unreadable' | 'different' | 'equal';

/** 학생 식과 정답 식의 값이 같은지 (정답 식이 계산되는 모든 표본 x에서) */
export function compareIrr(raw: string | undefined | null, expected: string): IrrCompare {
  const s = parseIrr(raw);
  if (!s) return 'unreadable';
  const e = parseIrr(expected);
  if (!e) return 'different';
  let used = 0;
  for (const x of IRR_SAMPLE_XS) {
    const ev = evalIrr(e, x);
    if (!Number.isFinite(ev)) continue;
    const sv = evalIrr(s, x);
    if (!Number.isFinite(sv) || Math.abs(sv - ev) > 1e-7 * Math.max(1, Math.abs(ev))) return 'different';
    used++;
  }
  return used >= 3 ? 'equal' : 'different';
}
