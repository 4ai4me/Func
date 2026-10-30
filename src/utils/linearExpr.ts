/**
 * 일차식 읽기 (4차시 역함수 채점용) — 순수 로직, 단위 테스트 대상
 * ------------------------------------------------------------------
 * 학생이 입력한 식을 a·(변수) + b 꼴로 계산해 계수를 비교합니다.
 * 같은 식을 여러 모양으로 써도(1/3x, x/3, (1/3)x, (x+2)/5, 5/9(x-32) …) 같은 답으로 봅니다.
 *
 * - '='가 있으면 마지막 '=' 오른쪽만 읽습니다 (예: "y = 1/3x - 4/3", "f⁻¹(x) = …").
 * - 지원: 숫자(소수 포함), 변수 한 글자, + − × ÷ * / ·, 괄호, 곱셈 기호 생략.
 * - 일차식이 아니거나(x², x로 나누기) 다른 문자가 섞이면 null을 돌려줍니다.
 */

export interface Linear {
  /** 변수의 계수 */
  a: number;
  /** 상수항 */
  b: number;
}

const EPS = 1e-9;

type Tok =
  | { t: 'num'; v: number }
  | { t: 'var' }
  | { t: 'op'; v: '+' | '-' | '*' | '/' }
  | { t: 'lp' }
  | { t: 'rp' };

function normalize(raw: string): string {
  const parts = raw.split('=');
  return (parts[parts.length - 1] || '')
    .replace(/[−–—]/g, '-')
    .replace(/[×·]/g, '*')
    .replace(/÷/g, '/')
    .replace(/\s+/g, '')
    .toLowerCase();
}

function tokenize(src: string, variable: string): Tok[] | null {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      const text = src.slice(i, j);
      if ((text.match(/\./g) || []).length > 1) return null;
      const v = Number(text);
      if (!Number.isFinite(v)) return null;
      out.push({ t: 'num', v });
      i = j;
      continue;
    }
    if (c === variable) out.push({ t: 'var' });
    else if (c === '+' || c === '-' || c === '*' || c === '/') out.push({ t: 'op', v: c });
    else if (c === '(') out.push({ t: 'lp' });
    else if (c === ')') out.push({ t: 'rp' });
    else return null; // 다른 문자(다른 변수, ², √ 등) → 읽지 않음
    i++;
  }
  return out;
}

class Parser {
  private pos = 0;
  constructor(private readonly toks: Tok[]) {}

  parse(): Linear | null {
    if (this.toks.length === 0) return null;
    const v = this.expr();
    if (!v || this.pos !== this.toks.length) return null;
    return v;
  }

  private peek(): Tok | undefined {
    return this.toks[this.pos];
  }

  // expr := term (('+'|'-') term)*
  private expr(): Linear | null {
    let left = this.term();
    while (left) {
      const t = this.peek();
      if (t && t.t === 'op' && (t.v === '+' || t.v === '-')) {
        this.pos++;
        const right = this.term();
        if (!right) return null;
        left = t.v === '+' ? { a: left.a + right.a, b: left.b + right.b } : { a: left.a - right.a, b: left.b - right.b };
      } else break;
    }
    return left;
  }

  // term := unary (('*'|'/')? unary)*   (곱셈 기호 생략 허용)
  private term(): Linear | null {
    let left = this.unary();
    while (left) {
      const t = this.peek();
      if (t && t.t === 'op' && (t.v === '*' || t.v === '/')) {
        this.pos++;
        const right = this.unary();
        if (!right) return null;
        left = t.v === '*' ? mul(left, right) : div(left, right);
      } else if (t && (t.t === 'num' || t.t === 'var' || t.t === 'lp')) {
        const right = this.unary();
        if (!right) return null;
        left = mul(left, right);
      } else break;
    }
    return left;
  }

  // unary := ('+'|'-') unary | primary
  private unary(): Linear | null {
    const t = this.peek();
    if (t && t.t === 'op' && (t.v === '+' || t.v === '-')) {
      this.pos++;
      const v = this.unary();
      if (!v) return null;
      return t.v === '-' ? { a: -v.a, b: -v.b } : v;
    }
    return this.primary();
  }

  private primary(): Linear | null {
    const t = this.peek();
    if (!t) return null;
    if (t.t === 'num') {
      this.pos++;
      return { a: 0, b: t.v };
    }
    if (t.t === 'var') {
      this.pos++;
      return { a: 1, b: 0 };
    }
    if (t.t === 'lp') {
      this.pos++;
      const v = this.expr();
      const close = this.peek();
      if (!v || !close || close.t !== 'rp') return null;
      this.pos++;
      return v;
    }
    return null;
  }
}

function mul(p: Linear | null, q: Linear | null): Linear | null {
  if (!p || !q) return null;
  if (Math.abs(p.a) > EPS && Math.abs(q.a) > EPS) return null; // x² → 일차식 아님
  return { a: p.a * q.b + q.a * p.b, b: p.b * q.b };
}

function div(p: Linear | null, q: Linear | null): Linear | null {
  if (!p || !q) return null;
  if (Math.abs(q.a) > EPS || Math.abs(q.b) < EPS) return null; // 변수로 나누기, 0으로 나누기
  return { a: p.a / q.b, b: p.b / q.b };
}

/** 식을 일차식 a·변수 + b로 읽습니다. 읽을 수 없으면 null. */
export function parseLinear(raw: string | undefined | null, variable = 'x'): Linear | null {
  if (!raw) return null;
  const toks = tokenize(normalize(raw), variable.toLowerCase());
  if (!toks) return null;
  return new Parser(toks).parse();
}

/** 입력한 식이 a·변수 + b와 같은 식인지 */
export function isLinearEqual(raw: string | undefined | null, a: number, b: number, variable = 'x'): boolean {
  const v = parseLinear(raw, variable);
  return Boolean(v && Math.abs(v.a - a) < 1e-6 && Math.abs(v.b - b) < 1e-6);
}

/** 숫자 답 읽기 ("35", "35℃", "35°C", "-2", "1/2" 등). 읽을 수 없으면 null */
export function parseNumberAnswer(raw: string | undefined | null): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/℃|°c|°f|℉|도|°/gi, '');
  const v = parseLinear(cleaned, 'x');
  if (!v || Math.abs(v.a) > EPS) return null;
  return v.b;
}

export function isNumberAnswer(raw: string | undefined | null, expected: number): boolean {
  const v = parseNumberAnswer(raw);
  return v !== null && Math.abs(v - expected) < 1e-6;
}

/** 소수를 분모 100 이하의 분수 글자로 (예: 0.333… → "1/3"). 맞는 분수가 없으면 소수 2자리 */
export function fractionText(n: number): string {
  if (Math.abs(n - Math.round(n)) < 1e-9) return String(Math.round(n));
  for (let d = 2; d <= 100; d++) {
    const num = n * d;
    if (Math.abs(num - Math.round(num)) < 1e-6) {
      const r = Math.round(num);
      return `${r < 0 ? '−' : ''}${Math.abs(r)}/${d}`;
    }
  }
  return n.toFixed(2).replace('-', '−');
}

/** 일차식을 읽기 쉬운 글자로 (예: a=1/3, b=−4/3 → "(1/3)x − 4/3") */
export function formatLinear(v: Linear, variable = 'x'): string {
  const { a, b } = v;
  let s = '';
  if (Math.abs(a) > EPS) {
    const abs = Math.abs(a);
    const coef = Math.abs(abs - 1) < 1e-9 ? '' : fractionText(abs).includes('/') ? `(${fractionText(abs)})` : fractionText(abs);
    s = `${a < 0 ? '−' : ''}${coef}${variable}`;
  }
  if (Math.abs(b) > EPS || !s) {
    const bt = fractionText(Math.abs(b));
    s = s ? `${s} ${b < 0 ? '−' : '+'} ${bt}` : `${b < 0 ? '−' : ''}${bt}`;
  }
  return s;
}
