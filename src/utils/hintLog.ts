/**
 * 힌트 열람 횟수 기록 (2026-11-12~)
 *
 * - 학생이 [힌트 보기]를 눌러 힌트를 '열 때'마다 1씩 셉니다. 닫기는 세지 않습니다.
 * - 각 차시 기록(Lesson{N}State) 안의 `hintOpens` 항목에 { 힌트 이름: 횟수 } 로 저장합니다.
 *   차시 문서는 JSON 문자열(data)로 저장되므로 보안 규칙·저장 칸은 바뀌지 않습니다.
 * - 단계가 있는 힌트(8차시)는 '열기'를 이름 그대로, 'N단계 더 보기'를 `이름@N` 으로 셉니다.
 * - [N차시 초기화]는 이 항목을 지우지 않습니다(교사용 기록).
 * - 힌트 이름·설명 목록: hintCatalog.ts
 */

export type HintOpens = Record<string, number>;

/** 힌트 이름: 영문·숫자·_·@ (저장 데이터 오염 방지) */
const HINT_KEY_RE = /^[A-Za-z0-9_@]{1,40}$/;
/** 한 차시에 저장할 수 있는 힌트 이름 수 */
export const HINT_OPENS_MAX_KEYS = 80;
/** 한 힌트의 최대 횟수 (잘못된 값으로 표가 깨지지 않도록) */
export const HINT_OPENS_MAX_COUNT = 99999;

/** 단계 힌트의 저장 이름: hintLevelKey('step1', 2) → 'step1@2' */
export const hintLevelKey = (id: string, level: number): string => `${id}@${level}`;

/** 저장된 값을 검사해 올바른 항목만 남깁니다. 남는 것이 없으면 undefined */
export function cleanHintOpens(raw: unknown): HintOpens | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const out: HintOpens = {};
  let n = 0;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (n >= HINT_OPENS_MAX_KEYS) break;
    if (!HINT_KEY_RE.test(k)) continue;
    if (typeof v !== 'number' || !Number.isFinite(v) || v <= 0) continue;
    out[k] = Math.min(HINT_OPENS_MAX_COUNT, Math.floor(v));
    n += 1;
  }
  return n > 0 ? out : undefined;
}

/** 힌트 하나를 연 횟수를 1 늘린 새 차시 기록 */
export function addHintOpen<S extends { hintOpens?: HintOpens }>(state: S, id: string): S {
  if (!HINT_KEY_RE.test(id)) {
    // 코드에서 잘못된 이름을 쓴 경우 — 기록하지 않고 개발자에게 알림 (학생 화면은 그대로)
    console.warn(`[hintLog] 힌트 이름 형식이 올바르지 않아 기록하지 않습니다: ${id}`);
    return state;
  }
  const prev = state.hintOpens ?? {};
  const cur = prev[id] ?? 0;
  if (!(id in prev) && Object.keys(prev).length >= HINT_OPENS_MAX_KEYS) return state;
  return { ...state, hintOpens: { ...prev, [id]: Math.min(HINT_OPENS_MAX_COUNT, cur + 1) } };
}

/**
 * 두 기기의 기록을 합칠 때: 힌트마다 큰 값을 씁니다.
 * (차시 기록은 최신 기기 것을 고르지만, 힌트 횟수는 다른 기기에서 센 것이 사라지지 않도록)
 */
export function mergeHintOpens(a: unknown, b: unknown): HintOpens | undefined {
  const x = cleanHintOpens(a) ?? {};
  const y = cleanHintOpens(b) ?? {};
  const out: HintOpens = { ...x };
  for (const [k, v] of Object.entries(y)) out[k] = Math.max(out[k] ?? 0, v);
  return cleanHintOpens(out);
}

/** 기록에서 힌트 횟수 읽기 (없으면 0) */
export function hintOpenCount(opens: HintOpens | undefined, id: string): number {
  const v = opens?.[id];
  return typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : 0;
}
