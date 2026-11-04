import React, { useState } from 'react';
import { Bot, Check, ClipboardCopy, KeyRound, Loader2, RefreshCw, Settings2 } from 'lucide-react';
import { LESSON_ANSWER_CONFIG } from '../utils/answerLabels';
import { DEFAULT_GEMINI_MODEL, AiFeedbackDraft, lessonHasAnswers, requestLessonFeedback } from '../utils/aiFeedback';
import { LESSON_KEYS, type LessonKey } from '../utils/lessonMerge';
import { StudentRecord, studentKey } from '../utils/mathLogic';

/**
 * 교사 전용 AI 피드백 초안 (학생 화면에는 이 컴포넌트가 없다).
 * 차시마다 버튼이 따로 있고, 누를 때만 그 차시 답안으로 초안을 만든다. 초안은 저장하지 않는다.
 */

export interface AiDraftState {
  loading?: boolean;
  draft?: AiFeedbackDraft;
  error?: string;
  at?: number;
}
export type AiDraftMap = Record<string, AiDraftState>;
export const aiDraftKey = (record: StudentRecord, lesson: LessonKey) => `${studentKey(record)}::${lesson}`;

// ── 선생님 브라우저에만 보관하는 설정 (서버·저장소에 없음) ──
const KEY_STORAGE = 'func.teacher.geminiApiKey';
const MODEL_STORAGE = 'func.teacher.geminiModel';
let sessionKey = ''; // '이 브라우저에 기억'을 끈 경우: 페이지를 닫으면 사라짐
/** 지금 요청 중인 학생·차시 — 버튼을 빠르게 여러 번 눌러도 한 번만 요청 (화면 상태보다 먼저 막음) */
const inFlight = new Set<string>();

function readStorage(name: string): string {
  try {
    return window.localStorage.getItem(name) ?? '';
  } catch {
    return '';
  }
}
function writeStorage(name: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(name);
    else window.localStorage.setItem(name, value);
  } catch {
    /* 저장이 막힌 브라우저: 이번 접속 동안만 사용 */
  }
}

function useGeminiSettings() {
  const [apiKey, setApiKeyState] = useState(() => readStorage(KEY_STORAGE) || sessionKey);
  const [remember, setRemember] = useState(() => readStorage(KEY_STORAGE) !== '');
  const [model, setModelState] = useState(() => readStorage(MODEL_STORAGE) || DEFAULT_GEMINI_MODEL);
  const setApiKey = (v: string, keep = remember) => {
    setApiKeyState(v);
    sessionKey = v;
    writeStorage(KEY_STORAGE, keep && v ? v : null);
  };
  const setModel = (v: string) => {
    setModelState(v);
    writeStorage(MODEL_STORAGE, v && v !== DEFAULT_GEMINI_MODEL ? v : null);
  };
  const toggleRemember = (keep: boolean) => {
    setRemember(keep);
    setApiKey(apiKey, keep);
  };
  return { apiKey, setApiKey, model, setModel, remember, toggleRemember };
}

/** 클립보드 복사 (권한이 막힌 브라우저는 예전 방식으로 대신) */
export async function copyText(text: string): Promise<boolean> {
  try {
    // 권한 창 등으로 응답이 오지 않는 브라우저가 있어 1.5초 안에 끝나지 않으면 예전 방식으로
    await Promise.race([
      navigator.clipboard.writeText(text),
      new Promise((_, reject) => window.setTimeout(() => reject(new Error('timeout')), 1500)),
    ]);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

function CopyBox({ label, text, id }: { label: string; text: string; id: string }) {
  const [state, setState] = useState<'idle' | 'ok' | 'fail'>('idle');
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-xs font-bold text-slate-700">
          {label}
        </label>
        <button
          type="button"
          onClick={async () => {
            const ok = await copyText(text);
            setState(ok ? 'ok' : 'fail');
            window.setTimeout(() => setState('idle'), 2000);
          }}
          className="inline-flex min-h-[32px] items-center gap-1 rounded-lg border border-violet-300 bg-white px-2.5 py-1 text-xs font-bold text-violet-700 hover:bg-violet-50"
        >
          {state === 'ok' ? <Check className="h-3.5 w-3.5" /> : <ClipboardCopy className="h-3.5 w-3.5" />}
          {state === 'ok' ? '복사됨' : state === 'fail' ? '복사 실패 — 직접 선택해 복사' : '복사'}
        </button>
      </div>
      <textarea
        id={id}
        readOnly
        rows={Math.min(8, Math.max(2, Math.ceil(text.length / 60)))}
        value={text}
        onFocus={(e) => e.currentTarget.select()}
        className="w-full rounded-xl border border-violet-200 bg-white p-2.5 text-xs sm:text-sm text-slate-800"
      />
    </div>
  );
}

export function AiFeedbackPanel({
  record,
  drafts,
  onDraftChange,
  idPrefix,
}: {
  record: StudentRecord;
  drafts: AiDraftMap;
  onDraftChange: (key: string, next: AiDraftState) => void;
  idPrefix: string;
}) {
  const settings = useGeminiSettings();
  const [showSettings, setShowSettings] = useState(() => !settings.apiKey);
  const [keyInput, setKeyInput] = useState('');

  const run = async (lesson: LessonKey) => {
    const key = aiDraftKey(record, lesson);
    if (inFlight.has(key)) return; // 중복 요청 방지
    inFlight.add(key);
    const previous = drafts[key];
    onDraftChange(key, { ...previous, loading: true, error: undefined });
    try {
      const draft = await requestLessonFeedback({ apiKey: settings.apiKey, model: settings.model, record, lesson });
      onDraftChange(key, { draft, at: Date.now() });
    } catch (err) {
      onDraftChange(key, { ...previous, loading: false, error: err instanceof Error ? err.message : String(err) });
    } finally {
      inFlight.delete(key);
    }
  };

  const requested = LESSON_KEYS.filter((l) => drafts[aiDraftKey(record, l)]);

  return (
    <div className="rounded-xl border-2 border-dashed border-violet-300 bg-violet-50/50 p-3.5 space-y-3">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <div className="flex items-center gap-1.5 text-sm font-extrabold text-violet-900">
            <Bot className="h-4 w-4" /> AI 피드백 초안 <span className="text-xs font-bold text-violet-700">(선생님만 보임 · 저장 안 됨)</span>
          </div>
          <p className="mt-0.5 text-[11px] text-slate-600">
            차시 버튼을 누를 때만 그 차시 답안으로 초안을 만듭니다. 이름·학교·반·번호는 보내지 않습니다. 쓸 내용은 [복사]해서 아래
            피드백 칸에 붙여 넣으세요.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowSettings((v) => !v)}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50"
          aria-expanded={showSettings}
        >
          <Settings2 className="h-3.5 w-3.5" /> AI 설정 {settings.apiKey ? '' : '(키 필요)'}
        </button>
      </div>

      {showSettings && (
        <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2 text-xs">
          <div className="font-bold text-slate-800 flex items-center gap-1">
            <KeyRound className="h-3.5 w-3.5" /> Gemini API 키 {settings.apiKey ? <span className="text-emerald-700">· 등록됨 (…{settings.apiKey.slice(-4)})</span> : <span className="text-rose-600">· 없음</span>}
          </div>
          <div className="flex gap-2 flex-wrap">
            <input
              id={`${idPrefix}-ai-key`}
              type="password"
              autoComplete="off"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Google AI Studio에서 받은 키 붙여 넣기"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2.5 py-1.5"
            />
            <button
              type="button"
              disabled={!keyInput.trim()}
              onClick={() => {
                settings.setApiKey(keyInput.trim());
                setKeyInput('');
              }}
              className="rounded-lg bg-violet-600 px-3 py-1.5 font-bold text-white disabled:opacity-40"
            >
              키 저장
            </button>
            {settings.apiKey && (
              <button
                type="button"
                onClick={() => settings.setApiKey('')}
                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 font-bold text-rose-700"
              >
                키 지우기
              </button>
            )}
          </div>
          <label className="flex items-center gap-1.5 text-slate-700">
            <input type="checkbox" checked={settings.remember} onChange={(e) => settings.toggleRemember(e.target.checked)} />
            이 브라우저에 키 기억하기 (학교 공용 컴퓨터에서는 끄세요 — 끄면 페이지를 닫을 때 지워짐)
          </label>
          <label className="flex items-center gap-1.5 text-slate-700">
            모델
            <input
              value={settings.model}
              onChange={(e) => settings.setModel(e.target.value.trim())}
              className="w-44 rounded-lg border border-slate-300 px-2 py-1 mono"
            />
            <span className="text-slate-500">기본 {DEFAULT_GEMINI_MODEL}</span>
          </label>
          <p className="text-[11px] text-slate-500">
            키는 이 브라우저에만 저장되며 사이트 코드·서버·학생 화면에는 없습니다. 사용량에 따라 선생님 Google 계정에 요금이 생길 수 있습니다.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {LESSON_KEYS.map((lesson) => {
          const has = lessonHasAnswers(record, lesson);
          const st = drafts[aiDraftKey(record, lesson)];
          const short = LESSON_ANSWER_CONFIG[lesson].title.split('·')[0].trim();
          return (
            <button
              key={lesson}
              type="button"
              disabled={!has || !settings.apiKey || st?.loading}
              title={!has ? '이 차시에 입력한 답이 없습니다' : !settings.apiKey ? '먼저 AI 설정에서 키를 넣어 주세요' : undefined}
              onClick={() => void run(lesson)}
              className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-violet-300 bg-white px-2.5 py-1 text-xs font-bold text-violet-800 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {st?.loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : st?.draft ? <RefreshCw className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
              {short} AI 피드백
            </button>
          );
        })}
      </div>

      {requested.map((lesson) => {
        const st = drafts[aiDraftKey(record, lesson)]!;
        const title = LESSON_ANSWER_CONFIG[lesson].title;
        return (
          <div key={lesson} className="rounded-lg border border-violet-200 bg-white/80 p-3 space-y-2" data-ai-lesson={lesson}>
            <div className="flex items-center justify-between gap-2 text-xs font-extrabold text-violet-900">
              <span>{title} · AI 초안</span>
              {st.at && <span className="font-semibold text-slate-500">{new Date(st.at).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' })}</span>}
            </div>
            {st.loading && <div className="text-xs font-semibold text-blue-700">초안을 만드는 중…</div>}
            {st.error && <div className="rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700">{st.error}</div>}
            {st.draft && (
              <>
                <CopyBox id={`${idPrefix}-${lesson}-fb`} label="학생에게 전달할 피드백 (초안)" text={st.draft.feedback} />
                <CopyBox id={`${idPrefix}-${lesson}-next`} label="다음 탐구를 위한 제안 (초안)" text={st.draft.nextStep} />
                <p className="text-[11px] text-slate-500">AI가 쓴 초안입니다. 학생에게 보내기 전에 내용을 꼭 확인해 주세요.</p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
