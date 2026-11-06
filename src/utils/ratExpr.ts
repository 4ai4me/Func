/**
 * 유리식 읽기 (6차시 유리식·유리함수 채점용) — 순수 로직, 단위 테스트 대상
 * ------------------------------------------------------------------
 * 학생이 입력한 식을 계산 나무(AST)로 읽고, 여러 x 값에서 계산해 정답 식과 비교합니다.
 * 같은 식을 다르게 써도(전개·인수분해·순서 바꾸기) 값이 같으면 같은 답으로 봅니다.
 *
 * - '='가 있으면 마지막 '=' 오른쪽만 읽습니다 (예: "y = 1/(x+1)^2").
 * - 지원: 숫자(소수), 변수 x, + − × ÷ * / ·, 괄호 ( ) [ ] { }, 거듭제곱 ^n · ² · ³ · ⁴, 곱셈 기호 생략.
 * - 곱셈 기호를 생략한 곱은 나눗셈보다 먼저 계산합니다: "1/x(x-1)" = 1/(x(x−1)), "1/3x" = 1/(3x).
 *   (화면에서 읽은 식을 분수 모양으로 보여 주므로 학생이 직접 확인할 수 있습니다.)
 * - 다른 문자·기호가 섞이면 null을 돌려줍니다.
 */

export type RatNode =
  | { k: 'num'; v: number }
  | { k: 'var' }
  | { k: 'add'; a: RatNode; b: RatNode }
  | { k: 'sub'; a: RatNode; b: RatNode }
  | { k: 'mul'; a: RatNode; b: RatNode; implicit?: boolean }
  | { k: 'div'; a: RatNode; b: RatNode }
  | { k: 'neg'; a: RatNode }
  | { k: 'pow'; a: RatNode; n: number }
  | { k: 'paren'; a: RatNode };

type Tok =
  | { t: 'num'; v: number }
  | { t: 'var' }
  | { t: 'op'; v: '+' | '-' | '*' | '/' | '^' }
  | { t: 'lp' }
  | { t: 'rp' };

const SUPERSCRIPT: Record<string, string> = { '²': '^2', '³': '^3', '⁴': '^4', '¹': '^1' };

function normalize(raw: string): string {
  const parts = raw.split('=');
  return (parts[parts.length - 1] || '')
    .replace(/[−–—]/g, '-')
    .replace(/[×·]/g, '*')
    .replace(/÷/g, '/')
    .replace(/[[{]/g, '(')
    .replace(/[\]}]/g, ')')
    .replace(/[²³⁴¹]/g, (c) => SUPERSCRIPT[c])
    .replace(/\*\*/g, '^')
    .replace(/\s+/g, '')
    .toLowerCase();
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

  parse(): RatNode | null {
    if (this.toks.length === 0) return null;
    const v = this.expr();
    if (!v || this.pos !== this.toks.length) return null;
    return v;
  }

  private peek(): Tok | undefined {
    return this.toks[this.pos];
  }

  // expr := term (('+'|'-') term)*
  private expr(): RatNode | null {
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

  // term := chain (('*'|'/') chain)*
  private term(): RatNode | null {
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

  // chain := unary (power)*   — 곱셈 기호를 생략한 곱 (나눗셈보다 먼저)
  private chain(): RatNode | null {
    let left = this.unary();
    while (left) {
      const t = this.peek();
      if (t && (t.t === 'num' || t.t === 'var' || t.t === 'lp')) {
        const right = this.power();
        if (!right) return null;
        left = { k: 'mul', a: left, b: right, implicit: true };
      } else break;
    }
    return left;
  }

  // unary := ('+'|'-') unary | power
  private unary(): RatNode | null {
    const t = this.peek();
    if (t && t.t === 'op' && (t.v === '+' || t.v === '-')) {
      this.pos++;
      const v = this.unary();
      if (!v) return null;
      return t.v === '-' ? { k: 'neg', a: v } : v;
    }
    return this.power();
  }

  // power := primary ('^' 자연수)*
  private power(): RatNode | null {
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

  private primary(): RatNode | null {
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
    return null;
  }
}

/** 식을 읽어 계산 나무로. 읽을 수 없으면 null */
export function parseRat(raw: string | undefined | null): RatNode | null {
  if (!raw || !raw.trim()) return null;
  const toks = tokenize(normalize(raw));
  if (!toks) return null;
  return new Parser(toks).parse();
}

/** x 값에서 계산. 0으로 나누면 NaN */
export function evalRat(n: RatNode, x: number): number {
  switch (n.k) {
    case 'num':
      return n.v;
    case 'var':
      return x;
    case 'add':
      return evalRat(n.a, x) + evalRat(n.b, x);
    case 'sub':
      return evalRat(n.a, x) - evalRat(n.b, x);
    case 'mul':
      return evalRat(n.a, x) * evalRat(n.b, x);
    case 'div': {
      const d = evalRat(n.b, x);
      if (!Number.isFinite(d) || Math.abs(d) < 1e-12) return NaN;
      return evalRat(n.a, x) / d;
    }
    case 'neg':
      return -evalRat(n.a, x);
    case 'pow':
      return Math.pow(evalRat(n.a, x), n.n);
    case 'paren':
      return evalRat(n.a, x);
  }
}

/** 식 안에 변수 x가 있는지 */
export function hasVar(n: RatNode): boolean {
  switch (n.k) {
    case 'var':
      return true;
    case 'num':
      return false;
    case 'neg':
    case 'pow':
    case 'paren':
      return hasVar(n.a);
    default:
      return hasVar(n.a) || hasVar(n.b);
  }
}

/** 나눗셈의 분모(나누는 식)에 x가 들어 있는지 — 다항식이 아닌 유리식의 겉모습 판단용 */
export function hasVarInDenominator(n: RatNode): boolean {
  switch (n.k) {
    case 'var':
    case 'num':
      return false;
    case 'div':
      return hasVar(n.b) || hasVarInDenominator(n.a) || hasVarInDenominator(n.b);
    case 'neg':
    case 'pow':
    case 'paren':
      return hasVarInDenominator(n.a);
    default:
      return hasVarInDenominator(n.a) || hasVarInDenominator(n.b);
  }
}

/** 비교에 쓰는 x 값 (정답 식의 분모가 0이 되는 정수·간단한 분수를 피한 값) */
export const SAMPLE_XS = [-4.37, -3.13, -2.71, -1.49, -0.83, -0.41, 0.29, 0.77, 1.37, 2.23, 2.89, 3.61, 4.53, 5.19] as const;

const close = (a: number, b: number) => Math.abs(a - b) <= 1e-7 * Math.max(1, Math.abs(a), Math.abs(b));

export type RatCompare = 'unreadable' | 'different' | 'notSimplified' | 'equal';

/**
 * 학생 식과 정답 식 비교.
 * @param cancelXs 약분하면 사라지는 인수의 근(정답 식은 이 x에서 계산되지만, 약분이 덜 된 식은 분모가 0이 됨)
 */
export function compareRat(raw: string | undefined | null, expected: string, cancelXs: readonly number[] = []): RatCompare {
  const s = parseRat(raw);
  if (!s) return 'unreadable';
  const e = parseRat(expected);
  if (!e) throw new Error(`정답 식을 읽을 수 없습니다: ${expected}`);
  let compared = 0;
  for (const x of SAMPLE_XS) {
    const ev = evalRat(e, x);
    if (!Number.isFinite(ev)) continue;
    const sv = evalRat(s, x);
    if (!Number.isFinite(sv) || !close(sv, ev)) return 'different';
    compared++;
  }
  if (compared < 6) return 'different';
  for (const x of cancelXs) {
    const ev = evalRat(e, x);
    const sv = evalRat(s, x);
    if (Number.isFinite(ev) && !Number.isFinite(sv)) return 'notSimplified';
  }
  return 'equal';
}

/** 숫자 답 읽기 ("5", "-1/3", "x≠5", "x ≠ -1/3", "y = -5" 등). 읽을 수 없으면 null */
export function parseRatNumber(raw: string | undefined | null): number | null {
  if (!raw) return null;
  const cleaned = raw
    .replace(/\s+/g, '')
    .replace(/^[xy](≠|!=|=\/=|=)/i, '');
  const n = parseRat(cleaned);
  if (!n || hasVar(n)) return null;
  const v = evalRat(n, 0);
  return Number.isFinite(v) ? v : null;
}

export function isRatNumber(raw: string | undefined | null, expected: number): boolean {
  const v = parseRatNumber(raw);
  return v !== null && Math.abs(v - expected) < 1e-9;
}

// ─────────────────────────────────────────────
// 글자로 나타내기 (교사 화면·안내 문구용)
// ─────────────────────────────────────────────
const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
const supText = (n: number) => String(n).replace(/[0-9]/g, (d) => SUP[d]);

function numText(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return String(Number(v.toFixed(6)));
}

/** 계산 나무를 한 줄 글자로 (예: "(3x − 2)/(x(x − 1))") */
export function formatRat(n: RatNode): string {
  switch (n.k) {
    case 'num':
      return numText(n.v);
    case 'var':
      return 'x';
    case 'add':
      return `${formatRat(n.a)} + ${formatRat(n.b)}`;
    case 'sub':
      return `${formatRat(n.a)} − ${formatRat(n.b)}`;
    case 'mul':
      return n.implicit ? `${formatRat(n.a)}${formatRat(n.b)}` : `${formatRat(n.a)} × ${formatRat(n.b)}`;
    case 'div':
      return `${wrapForDiv(n.a)}/${wrapForDiv(n.b)}`;
    case 'neg':
      return `−${formatRat(n.a)}`;
    case 'pow':
      return `${formatRat(n.a)}${supText(n.n)}`;
    case 'paren':
      return `(${formatRat(n.a)})`;
  }
}

/** 한 줄 글자에서 분자·분모가 여러 항이면 괄호로 묶어 읽는 사람이 헷갈리지 않게 함 */
function wrapForDiv(n: RatNode): string {
  const text = formatRat(n);
  if (n.k === 'num' || n.k === 'var' || n.k === 'paren' || n.k === 'pow') return text;
  return `(${text})`;
}

/** 괄호 껍데기 벗기기 (분수 모양으로 보여 줄 때 분자·분모를 감싼 괄호는 생략) */
export function stripParen(n: RatNode): RatNode {
  return n.k === 'paren' ? stripParen(n.a) : n;
}
