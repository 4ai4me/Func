import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ChevronUp, Lightbulb } from 'lucide-react';
import type { StudentRecord } from '../utils/mathLogic';
import {
  HINT_CATALOG,
  catalogOf,
  formatHintCounts,
  hintCounts,
  hintOpensOf,
  studentHintTotal,
  summarizeHints,
  type HintLessonNumber,
} from '../utils/hintCatalog';

/**
 * 교사 화면 · 힌트 사용 현황 (2026-11-12~)
 * - HintUsageSection: 차시를 골라 힌트별 '연 학생 수·총 횟수'와 학생 × 힌트 표 (학생 목록의 검색·반·진행 필터를 따름)
 * - StudentHintPanel: 학생 한 명의 차시별 힌트 횟수 ([상세 비교 · 평가] 화면)
 * 기록 방식: src/utils/hintLog.ts / 힌트 목록: src/utils/hintCatalog.ts
 */

const LESSONS = HINT_CATALOG.map((c) => c.lesson);

/** 학생 × 힌트 표의 한 칸 (단계 힌트는 '열기·2단계·3단계'를 점으로 구분) */
function CountCell({ counts }: { counts: number[] }) {
  const total = counts.reduce((a, b) => a + b, 0);
  const text = counts.length > 1 ? counts.join('·') : String(counts[0] ?? 0);
  const tone =
    total === 0 ? 'text-slate-300' : total >= 5 ? 'bg-amber-200 text-amber-950' : total >= 2 ? 'bg-amber-100 text-amber-900' : 'bg-amber-50 text-amber-900';
  return (
    <td className="border-b border-slate-100 px-1 py-1 text-center">
      <span className={`inline-block min-w-[1.75rem] rounded-md px-1 py-0.5 mono text-[11px] font-bold ${tone}`}>{total === 0 ? '0' : text}</span>
    </td>
  );
}

export function HintUsageSection({ records, totalCount }: { records: readonly StudentRecord[]; totalCount: number }) {
  const [open, setOpen] = useState(true);
  const [lesson, setLesson] = useState<HintLessonNumber>(1);
  const catalog = catalogOf(lesson);
  const summary = summarizeHints(records, lesson);
  const usedStudents = records.filter((r) => studentHintTotal(r, lesson) > 0).length;
  const hasLevels = catalog.hints.some((h) => (h.levels ?? 1) > 1);

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs" data-hint-usage-section>
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          aria-expanded={open}
        >
          {open ? <ChevronUp className="h-4 w-4 text-slate-600" /> : <ChevronDown className="h-4 w-4 text-slate-600" />}
          <span>{open ? '접기' : '펼치기'}</span>
        </button>
        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <span>힌트 사용 현황</span>
        </h3>
        <span className="text-xs font-medium text-slate-500">
          학생이 [힌트 보기]를 눌러 연 횟수 (닫기는 세지 않음, 2026-11-12부터 기록)
        </span>
      </div>

      {open && (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="차시 선택">
            {LESSONS.map((n) => (
              <button
                key={n}
                type="button"
                role="tab"
                aria-selected={lesson === n}
                onClick={() => setLesson(n)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                  lesson === n ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {n}차시
              </button>
            ))}
          </div>

          <p className="text-xs text-slate-600">
            <strong className="text-slate-900">{catalog.title}</strong> · 아래 &lsquo;탐정별 사건 기록&rsquo;의 검색·반·진행 필터가 적용된 학생{' '}
            <strong className="mono">{records.length}</strong>명 (전체 {totalCount}명) 중 힌트를 한 번 이상 연 학생{' '}
            <strong className="mono text-amber-800">{usedStudents}</strong>명
          </p>

          {/* 힌트별 요약 */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[560px] border-collapse text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-2 py-2 text-left w-10">번호</th>
                  <th className="px-2 py-2 text-left">힌트 위치</th>
                  <th className="px-2 py-2 text-right whitespace-nowrap">연 학생 수</th>
                  <th className="px-2 py-2 text-right whitespace-nowrap">총 횟수</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((row, i) => (
                  <tr key={row.def.id} className="border-t border-slate-100" data-hint-row={row.def.id}>
                    <td className="px-2 py-1.5 mono font-bold text-amber-700">H{i + 1}</td>
                    <td className="px-2 py-1.5 text-slate-800">
                      {row.def.label}
                      {row.def.openByDefault && <span className="ml-1 text-[11px] text-slate-500">(처음부터 열려 있음 — 다시 연 횟수)</span>}
                    </td>
                    <td className="px-2 py-1.5 text-right mono">
                      {row.students}
                      <span className="text-slate-400">/{records.length}</span>
                    </td>
                    <td className="px-2 py-1.5 text-right mono font-bold text-slate-900 whitespace-nowrap">{formatHintCounts(row.totals)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 학생 × 힌트 */}
          {records.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs text-slate-500">표시할 학생이 없습니다.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-[480px] overflow-y-auto">
              <table className="w-max min-w-full border-collapse text-xs" data-hint-student-table>
                <thead className="sticky top-0 bg-slate-50 text-slate-700 z-10">
                  <tr>
                    <th className="sticky left-0 bg-slate-50 px-2 py-2 text-left whitespace-nowrap">학생</th>
                    {catalog.hints.map((h, i) => (
                      <th key={h.id} className="px-1 py-2 text-center mono text-amber-700" title={h.label}>
                        H{i + 1}
                      </th>
                    ))}
                    <th className="px-2 py-2 text-center whitespace-nowrap">합계</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => {
                    const opens = hintOpensOf(r, lesson);
                    return (
                      <tr key={`${r.group}|${r.code}`} className="hover:bg-slate-50/70">
                        <td className="sticky left-0 bg-white border-b border-slate-100 px-2 py-1 whitespace-nowrap">
                          <div className="font-bold text-slate-900">{r.code || '미입력'}</div>
                          <div className="text-[10px] text-slate-500">{r.group || '학급 미입력'}</div>
                        </td>
                        {catalog.hints.map((h) => (
                          <CountCell key={h.id} counts={hintCounts(opens, h)} />
                        ))}
                        <td className="border-b border-slate-100 px-2 py-1 text-center mono font-extrabold text-slate-900">
                          {studentHintTotal(r, lesson)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-[11px] text-slate-500">
            H 번호는 위 요약표의 힌트 위치입니다(머리글에 마우스를 올려도 보여요).
            {hasLevels && ' 단계 힌트 칸은 열기·2단계·3단계 횟수를 점(·)으로 구분합니다.'} 같은 학생이 두 기기를 동시에 쓰면 일부 횟수가 빠질 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
}

/** 학생 한 명의 차시별 힌트 횟수 ([상세 비교 · 평가]) */
export function StudentHintPanel({ record }: { record: StudentRecord }) {
  const [open, setOpen] = useState(true);
  const totals = LESSONS.map((n) => studentHintTotal(record, n));
  const all = totals.reduce((a, b) => a + b, 0);
  return (
    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/40 p-3 sm:p-4" data-student-hint-panel>
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between text-left" aria-expanded={open}>
        <span className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-1.5">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          힌트 사용 기록 <span className="text-xs font-bold text-slate-500">(연 횟수, 모두 {all}번)</span>
        </span>
        {open ? <ChevronDown className="h-5 w-5 text-slate-500" /> : <ChevronRight className="h-5 w-5 text-slate-500" />}
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          {LESSONS.map((n, li) => {
            const catalog = catalogOf(n);
            const opens = hintOpensOf(record, n);
            const used = catalog.hints.filter((h) => hintCounts(opens, h).some((c) => c > 0));
            return (
              <div key={n} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                  <span className="font-bold text-slate-800">{catalog.title}</span>
                  <span className={`mono text-[11px] font-bold ${totals[li] ? 'text-amber-800' : 'text-slate-400'}`}>합계 {totals[li]}</span>
                </div>
                {used.length > 0 ? (
                  <ul className="mt-1.5 space-y-0.5 text-xs text-slate-700">
                    {used.map((h) => (
                      <li key={h.id} className="flex justify-between gap-3">
                        <span>{h.label}</span>
                        <span className="mono font-bold text-slate-900 whitespace-nowrap">{formatHintCounts(hintCounts(opens, h))}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-1 text-[11px] text-slate-400">연 힌트 없음</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
