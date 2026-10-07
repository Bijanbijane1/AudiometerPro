import React from 'react';
import { Frequency, STANDARD_FREQUENCIES, SessionComparison, TestResult } from '../types/audiometry';
import { TrendingUp, TrendingDown, Minus, Calendar, AlertTriangle, CheckCircle2, History, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TrendAnalysisSectionProps {
  comparison: SessionComparison | null;
  priorSessions: TestResult[];
  selectedPriorSessionId: string | null;
  onSelectPriorSession: (sessionId: string) => void;
  currentDate: string;
}

export const TrendAnalysisSection: React.FC<TrendAnalysisSectionProps> = ({
  comparison,
  priorSessions,
  selectedPriorSessionId,
  onSelectPriorSession,
  currentDate,
}) => {
  if (!comparison || priorSessions.length === 0) {
    return null;
  }

  const getDeltaBadge = (delta: number | null) => {
    if (delta === null) return <span className="text-slate-400 font-mono">—</span>;
    if (delta > 5) {
      return (
        <span className="inline-flex items-center gap-0.5 text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
          <ArrowUpRight className="w-3.5 h-3.5" />
          +{delta} dB (تشدید)
        </span>
      );
    }
    if (delta < -5) {
      return (
        <span className="inline-flex items-center gap-0.5 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
          <ArrowDownRight className="w-3.5 h-3.5" />
          {delta} dB (بهبود)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-mono font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
        <Minus className="w-3 h-3 text-slate-400" />
        {delta >= 0 ? `+${delta}` : delta} dB (پایدار)
      </span>
    );
  };

  return (
    <div className="border border-slate-300 bg-slate-50/70 rounded-xl p-5 mb-6 print-break-inside-avoid">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-teal-600 text-white">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              تحلیل هوشمند روند و مقایسه با جلسات گذشته (Longitudinal Trend Analysis)
            </h3>
            <p className="text-[11px] text-slate-500">
              ارزیابی هوشمند تغییرات آستانه شنوایی نسبت به جلسه تاریخ {comparison.priorSessionDate}
              {comparison.priorSessionNumber && ` (جلسه ${comparison.priorSessionNumber})`}
            </p>
          </div>
        </div>

        {/* Prior session selector on screen */}
        {priorSessions.length > 1 && (
          <div className="flex items-center gap-2 no-print">
            <span className="text-xs text-slate-600 font-medium">مقایسه با:</span>
            <select
              value={selectedPriorSessionId || ''}
              onChange={(e) => onSelectPriorSession(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-teal-500 font-sans"
            >
              {priorSessions.map((session) => (
                <option key={session.id} value={session.id}>
                  جلسه {session.patient.sessionNumber || '۱'} ({session.patient.testDate})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Status banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-white border border-slate-200 mb-4 shadow-2xs">
        <div className="flex items-center gap-2">
          {comparison.trendStatus === 'progressed' ? (
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          ) : comparison.trendStatus === 'improved' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <Minus className="w-5 h-5 text-teal-600" />
          )}
          <div>
            <span className="text-xs font-bold text-slate-900">وضعیت پایش بالینی: </span>
            <span className={`text-xs font-bold ${
              comparison.trendStatus === 'progressed'
                ? 'text-rose-700'
                : comparison.trendStatus === 'improved'
                ? 'text-emerald-700'
                : 'text-slate-800'
            }`}>
              {comparison.trendStatusFa}
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-600 flex items-center gap-3">
          <span>
            تغییر ناتوانی دوگوشی:{' '}
            <strong className="font-mono text-slate-900">
              {comparison.binauralHandicapDelta > 0 ? `+${comparison.binauralHandicapDelta}%` : `${comparison.binauralHandicapDelta}%`}
            </strong>
          </span>
        </div>
      </div>

      {/* Comparison Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Right Ear Delta */}
        <div className="p-3 bg-red-50/30 border border-red-200 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-red-800 block">گوش راست (Right Ear PTA):</span>
            <span className="text-xs font-mono text-slate-600">
              جلسه قبل: {comparison.priorRightPta !== null ? `${comparison.priorRightPta} dB` : '—'}
            </span>
          </div>
          <div>
            {getDeltaBadge(comparison.rightPtaDelta)}
          </div>
        </div>

        {/* Left Ear Delta */}
        <div className="p-3 bg-blue-50/30 border border-blue-200 rounded-lg flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-blue-800 block">گوش چپ (Left Ear PTA):</span>
            <span className="text-xs font-mono text-slate-600">
              جلسه قبل: {comparison.priorLeftPta !== null ? `${comparison.priorLeftPta} dB` : '—'}
            </span>
          </div>
          <div>
            {getDeltaBadge(comparison.leftPtaDelta)}
          </div>
        </div>
      </div>

      {/* Detailed Frequency Delta Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white mb-3">
        <table className="w-full text-[11px] text-center border-collapse">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200">
              <th className="py-1.5 px-2.5 text-right font-bold">فرکانس (Hz)</th>
              {STANDARD_FREQUENCIES.map((f) => (
                <th key={`comp-f-${f}`} className="py-1.5 px-1.5 font-mono">
                  {f >= 1000 ? `${f / 1000}k` : f}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100 bg-red-50/20">
              <td className="py-1.5 px-2.5 text-right font-bold text-red-800">
                گوش راست (تغییر نسبت به قبل)
              </td>
              {STANDARD_FREQUENCIES.map((f) => {
                const prev = comparison.priorRightThresholds[f];
                return (
                  <td key={`comp-r-td-${f}`} className="py-1.5 px-1.5 font-mono text-slate-800">
                    {prev !== null ? `${prev} dB` : '—'}
                  </td>
                );
              })}
            </tr>
            <tr className="bg-blue-50/20">
              <td className="py-1.5 px-2.5 text-right font-bold text-blue-800">
                گوش چپ (تغییر نسبت به قبل)
              </td>
              {STANDARD_FREQUENCIES.map((f) => {
                const prev = comparison.priorLeftThresholds[f];
                return (
                  <td key={`comp-l-td-${f}`} className="py-1.5 px-1.5 font-mono text-slate-800">
                    {prev !== null ? `${prev} dB` : '—'}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Clinical Trend Narrative */}
      <div className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
        <strong>تفسیر روند پایش ادیومتریک: </strong>
        {comparison.trendDescriptionFa}
      </div>
    </div>
  );
};
