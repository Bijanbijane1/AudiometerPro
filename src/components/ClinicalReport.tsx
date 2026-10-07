import React, { useState } from 'react';
import {
  EarSummary,
  HearingHandicapResult,
  HearingType,
  PatientInfo,
  STANDARD_FREQUENCIES,
  SessionComparison,
  TestResult,
  ThresholdMap,
} from '../types/audiometry';
import { AudiogramChart } from './AudiogramChart';
import { TrendAnalysisSection } from './TrendAnalysisSection';
import { exportReportToPDF } from '../utils/pdfGenerator';
import {
  Printer,
  Download,
  Stethoscope,
  Percent,
  Calculator,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  TrendingUp,
} from 'lucide-react';

interface ClinicalReportProps {
  patient: PatientInfo;
  rightThresholds: ThresholdMap;
  leftThresholds: ThresholdMap;
  rightSummary: EarSummary;
  leftSummary: EarSummary;
  handicap: HearingHandicapResult;
  hearingType: HearingType;
  comparison?: SessionComparison | null;
  priorSessions?: TestResult[];
  selectedPriorSessionId?: string | null;
  onSelectPriorSession?: (sessionId: string) => void;
  overallDiagnosisFa: string;
  overallDiagnosisEn: string;
  recommendations: string[];
  onPrint: () => void;
}

export const ClinicalReport: React.FC<ClinicalReportProps> = ({
  patient,
  rightThresholds,
  leftThresholds,
  rightSummary,
  leftSummary,
  handicap,
  hearingType,
  comparison,
  priorSessions = [],
  selectedPriorSessionId = null,
  onSelectPriorSession = () => {},
  overallDiagnosisFa,
  overallDiagnosisEn,
  recommendations,
  onPrint,
}) => {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [pdfStatus, setPdfStatus] = useState<string | null>(null);

  const handleDownloadPDF = async () => {
    try {
      setIsExportingPDF(true);
      const safeName = patient.fullName ? patient.fullName.replace(/\s+/g, '_') : 'Patient';
      const safeCode = patient.nationalCode ? `_${patient.nationalCode}` : '';
      const filename = `Audiology_Report_${safeName}${safeCode}`;

      await exportReportToPDF({
        elementId: 'printable-clinical-report',
        filename,
        onProgress: (status) => setPdfStatus(status),
      });

      setPdfStatus('فایل PDF با موفقیت دانلود شد.');
      setTimeout(() => setPdfStatus(null), 3000);
    } catch (err) {
      console.error('PDF export error:', err);
      setPdfStatus('خطا در ساخت فایل PDF. لطفاً مجدداً تلاش کنید.');
      setTimeout(() => setPdfStatus(null), 4000);
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Action Toolbar on Screen (hidden on print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-white rounded-xl border border-slate-200 shadow-xs no-print">
        <div>
          <h2 className="text-base font-bold text-slate-900">پیش‌نمایش برگه رسمی آزمایش شنوایی‌سنجی</h2>
          <p className="text-xs text-slate-500">
            شما می‌توانید گزارش را مستقیماً چاپ کنید یا به عنوان فایل PDF استاندارد در سیستم خود ذخیره نمایید.
          </p>
          {pdfStatus && (
            <p className="text-xs font-semibold text-teal-700 mt-1 animate-pulse">
              {pdfStatus}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Direct Download as PDF Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={isExportingPDF}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs shadow-xs transition-transform active:scale-95 ${
              isExportingPDF
                ? 'bg-slate-200 text-slate-500 cursor-wait'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>{isExportingPDF ? 'در حال ساخت فایل PDF...' : 'ذخیره در قالب فایل PDF'}</span>
          </button>

          {/* Direct Native Print Button */}
          <button
            onClick={onPrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs shadow-xs transition-transform active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>چاپ مستقیم گزارش (A4)</span>
          </button>
        </div>
      </div>

      {/* Official Medical Report Document (A4 Container) */}
      <div
        id="printable-clinical-report"
        className="bg-white print-card rounded-xl border border-slate-300 shadow-md p-8 md:p-10 text-slate-900"
      >
        
        {/* Document Header */}
        <div className="border-b-2 border-slate-800 pb-5 mb-6">
          <div className="flex items-start justify-between">
            {/* Center/Clinic Info */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold shadow-xs">
                <Stethoscope className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  {patient.clinicName || 'مرکز تخصصی ارزیابی شنوایی و سمعک'}
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  Auditory Diagnostic & Hearing Assessment Center
                </p>
              </div>
            </div>

            {/* Document Title & Reference Metadata */}
            <div className="text-left font-mono text-xs">
              <div className="text-sm font-bold text-slate-900 font-sans text-right">
                گزارش رسمی ادیومتری تن خالص
              </div>
              <div className="text-[11px] text-slate-500 font-sans text-right">
                Pure Tone Audiogram & Hearing Handicap Report
              </div>
              <div className="mt-1 text-slate-600 text-right">
                <span className="font-sans text-[11px] text-slate-500">شماره پرونده: </span>
                <span className="font-bold">{patient.nationalCode || patient.id || 'PTA-2026-01'}</span>
              </div>
              <div className="text-slate-600 text-right">
                <span className="font-sans text-[11px] text-slate-500">تاریخ آزمایش: </span>
                <span>{patient.testDate}</span>
                {patient.sessionNumber && (
                  <span className="font-sans text-[11px] text-teal-700 mr-1.5 font-bold">
                    (جلسه {patient.sessionNumber})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Patient Demographics Table with Full Requested Fields */}
        <div className="bg-slate-50/80 rounded-lg border border-slate-300 p-4 mb-6">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-600"></span>
            مشخصات کامل مراجعه‌کننده و جلسه ارزیابی (Patient Demographics & Session)
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-4 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">نام:</span>
              <span className="font-bold text-slate-900 text-sm">{patient.firstName || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">نام خانوادگی:</span>
              <span className="font-bold text-slate-900 text-sm">{patient.lastName || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">کد ملی / شناسه:</span>
              <span className="font-mono font-bold text-slate-900">{patient.nationalCode || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">تاریخ تولد:</span>
              <span className="font-mono font-medium text-slate-900">{patient.birthDate || '—'}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">سن / جنسیت:</span>
              <span className="font-medium text-slate-900">
                {patient.age ? `${patient.age} سال` : '—'} / {patient.gender === 'male' ? 'مرد' : patient.gender === 'female' ? 'زن' : patient.gender === 'child' ? 'کودک' : 'نامشخص'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">تاریخ و ساعت آزمایش:</span>
              <span className="font-mono text-slate-900">{patient.testDate} - {patient.testTime}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">شماره تماس:</span>
              <span className="font-mono text-slate-900">{patient.phoneNumber || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">جلسه ارزیابی:</span>
              <span className="font-bold text-teal-800">جلسه شماره {patient.sessionNumber || 1}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">پزشک ارجاع‌دهنده:</span>
              <span className="font-medium text-slate-900">{patient.referringDoctor || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">شنوایی‌شناس مسئول:</span>
              <span className="font-medium text-slate-900">{patient.audiologist || '—'}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-500 block text-[11px]">شکایت اصلی / سوابق:</span>
              <span className="font-medium text-slate-800">
                {patient.chiefComplaint || 'چکاپ دوره‌ای شنوایی'}
                {patient.medicalHistory.tinnitus && ' · وزوز گوش'}
                {patient.medicalHistory.vertigo && ' · سرگیجه'}
                {patient.medicalHistory.noiseExposure && ' · سابقه نویز'}
              </span>
            </div>
          </div>
        </div>

        {/* Longitudinal Trend Analysis Section (When prior sessions exist) */}
        {comparison && (
          <TrendAnalysisSection
            comparison={comparison}
            priorSessions={priorSessions}
            selectedPriorSessionId={selectedPriorSessionId}
            onSelectPriorSession={onSelectPriorSession}
            currentDate={patient.testDate}
          />
        )}

        {/* Vector Audiogram Graph */}
        <div className="mb-6 print-break-inside-avoid">
          <div className="text-xs font-bold text-slate-900 mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-800"></span>
              <span>نمودار ادیوگرام بالینی (Pure-Tone Audiogram)</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-normal">
              <span className="flex items-center gap-1 text-red-700 font-bold">
                <span className="w-2.5 h-2.5 rounded-full border border-red-600 inline-block bg-white"></span>
                گوش راست (Right Ear - O)
              </span>
              <span className="flex items-center gap-1 text-blue-700 font-bold">
                <span className="font-bold text-base leading-none">✕</span>
                گوش چپ (Left Ear - X)
              </span>
            </div>
          </div>

          <AudiogramChart
            rightThresholds={rightThresholds}
            leftThresholds={leftThresholds}
            editable={false}
            showSpeechBananaDefault={false}
            className="border-slate-300 shadow-none bg-slate-50/30"
          />
        </div>

        {/* Numerical Thresholds Table */}
        <div className="mb-6 print-break-inside-avoid">
          <div className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-800"></span>
            <span>جدول مقادیر عددی آستانه‌ها (Hearing Thresholds in dB HL)</span>
          </div>

          <div className="overflow-x-auto border border-slate-300 rounded-lg">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                  <th className="py-2 px-3 text-right font-bold">کانال / فرکانس</th>
                  {STANDARD_FREQUENCIES.map((freq) => (
                    <th key={`print-freq-${freq}`} className="py-2 px-2 font-mono font-bold">
                      {freq} Hz
                    </th>
                  ))}
                  <th className="py-2 px-2.5 font-bold bg-slate-200">PTA (3-Freq)</th>
                  <th className="py-2 px-2.5 font-bold bg-slate-200">PTA-4 (AAO)</th>
                </tr>
              </thead>
              <tbody>
                {/* Right Ear */}
                <tr className="border-b border-slate-200 bg-red-50/30">
                  <td className="py-2.5 px-3 text-right font-bold text-red-700">
                    گوش راست (Right Ear)
                  </td>
                  {STANDARD_FREQUENCIES.map((freq) => (
                    <td key={`print-r-${freq}`} className="py-2.5 px-2 font-mono font-bold text-red-900">
                      {rightThresholds[freq] !== null ? `${rightThresholds[freq]}` : '—'}
                    </td>
                  ))}
                  <td className="py-2.5 px-2.5 font-mono font-bold text-red-900 bg-red-100/50">
                    {rightSummary.pta !== null ? `${rightSummary.pta} dB` : '—'}
                  </td>
                  <td className="py-2.5 px-2.5 font-mono font-bold text-red-900 bg-red-100/50">
                    {handicap.rightPTA4 !== null ? `${handicap.rightPTA4} dB` : '—'}
                  </td>
                </tr>
                {/* Left Ear */}
                <tr className="bg-blue-50/30">
                  <td className="py-2.5 px-3 text-right font-bold text-blue-700">
                    گوش چپ (Left Ear)
                  </td>
                  {STANDARD_FREQUENCIES.map((freq) => (
                    <td key={`print-l-${freq}`} className="py-2.5 px-2 font-mono font-bold text-blue-900">
                      {leftThresholds[freq] !== null ? `${leftThresholds[freq]}` : '—'}
                    </td>
                  ))}
                  <td className="py-2.5 px-2.5 font-mono font-bold text-blue-900 bg-blue-100/50">
                    {leftSummary.pta !== null ? `${leftSummary.pta} dB` : '—'}
                  </td>
                  <td className="py-2.5 px-2.5 font-mono font-bold text-blue-900 bg-blue-100/50">
                    {handicap.leftPTA4 !== null ? `${handicap.leftPTA4} dB` : '—'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Diagnostic Indices & Ear Classification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 print-break-inside-avoid">
          {/* Right Ear Card */}
          <div className="border border-red-200 bg-red-50/20 rounded-lg p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-red-800">شاخص‌های گوش راست (Right Ear)</span>
              <span className="text-[11px] font-bold text-red-700 px-2 py-0.5 rounded bg-red-100">
                {rightSummary.degreeFa}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">میانگین گفتاری (PTA):</span>
                <span className="font-mono font-bold text-slate-900">{rightSummary.pta !== null ? `${rightSummary.pta} dB` : '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">میانگین ۴ فرکانس:</span>
                <span className="font-mono font-bold text-slate-900">{handicap.rightPTA4 !== null ? `${handicap.rightPTA4} dB` : '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">نقص تک‌گوشی (MHI):</span>
                <span className="font-mono font-bold text-slate-900">{handicap.rightMHI}%</span>
              </div>
            </div>
          </div>

          {/* Left Ear Card */}
          <div className="border border-blue-200 bg-blue-50/20 rounded-lg p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-blue-800">شاخص‌های گوش چپ (Left Ear)</span>
              <span className="text-[11px] font-bold text-blue-700 px-2 py-0.5 rounded bg-blue-100">
                {leftSummary.degreeFa}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">میانگین گفتاری (PTA):</span>
                <span className="font-mono font-bold text-slate-900">{leftSummary.pta !== null ? `${leftSummary.pta} dB` : '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">میانگین ۴ فرکانس:</span>
                <span className="font-mono font-bold text-slate-900">{handicap.leftPTA4 !== null ? `${handicap.leftPTA4} dB` : '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">نقص تک‌گوشی (MHI):</span>
                <span className="font-mono font-bold text-slate-900">{handicap.leftMHI}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* HEARING HANDICAP PERCENTAGE SECTION (AAO-HNS / AMA Standard) */}
        <div className="border-2 border-teal-600/40 bg-teal-50/30 rounded-xl p-4.5 mb-6 print-break-inside-avoid">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-teal-200">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-teal-600 text-white">
                <Calculator className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs text-teal-950 uppercase tracking-wide">
                محاسبه درصد ناتوانی شنوایی (Hearing Handicap Percentage - AAO-HNS / AMA)
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 font-medium">نتیجه نهایی ناتوانی دوگوشی:</span>
              <span className="text-base font-black font-mono text-teal-900 bg-white border border-teal-300 px-3 py-0.5 rounded-lg shadow-xs">
                {handicap.binauralHandicapPercentage}%
              </span>
              <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                {handicap.classificationFa}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-3">
            <div className="bg-white/80 p-2.5 rounded-lg border border-teal-200/80">
              <span className="text-slate-500 block text-[10px]">گوش با شنوایی بهتر (ضریب ۵):</span>
              <span className="font-bold text-slate-900">
                گوش {handicap.betterEar === 'right' ? 'راست' : 'چپ'} (نقص تک‌گوشی: {handicap.betterEar === 'right' ? handicap.rightMHI : handicap.leftMHI}٪)
              </span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-lg border border-teal-200/80">
              <span className="text-slate-500 block text-[10px]">گوش با شنوایی بدتر (ضریب ۱):</span>
              <span className="font-bold text-slate-900">
                گوش {handicap.worseEar === 'right' ? 'راست' : 'چپ'} (نقص تک‌گوشی: {handicap.worseEar === 'right' ? handicap.rightMHI : handicap.leftMHI}٪)
              </span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-lg border border-teal-200/80">
              <span className="text-slate-500 block text-[10px]">فرمول محاسبه دوگوشی:</span>
              <span className="font-mono font-semibold text-slate-800 text-[11px]">
                [(۵ × بهتر) + (۱ × بدتر)] ÷ ۶
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
            <strong>توضیحات فرمول:</strong> بر اساس دستورالعمل استاندارد آکادمی گوش، حلق و بینی آمریکا (AAO-HNS) و کمیسیون‌های ارزیابی نقص شنوایی پزشکی قانونی، آستانه پایه ۲۵ دسی‌بل در میانگین ۴ فرکانس اصلی (۵۰۰، ۱۰۰۰، ۲۰۰۰ و ۴۰۰۰ هرتز) لحاظ شده و به ازای هر دسی‌بل بالاتر از ۲۵ dB، ضریب ۱.۵٪ نقص برای هر گوش محاسبه و در نهایت گوش بهتر با وزن ۵ برابری تلفیق می‌گردد.
          </p>
        </div>

        {/* Clinical Interpretation & Diagnosis */}
        <div className="bg-slate-50 rounded-lg border border-slate-300 p-4 mb-6 print-break-inside-avoid">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              نتیجه و تشخیص ادیولوژیکال (Clinical Audiological Impression)
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500">طبقه‌بندی پاتولوژی:</span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                hearingType === 'conductive'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : hearingType === 'mixed'
                  ? 'bg-purple-100 text-purple-900 border-purple-300'
                  : hearingType === 'sensorineural'
                  ? 'bg-blue-100 text-blue-900 border-blue-300'
                  : 'bg-emerald-100 text-emerald-900 border-emerald-300'
              }`}>
                {hearingType === 'conductive'
                  ? 'کم‌شنوایی هدایتی (Conductive)'
                  : hearingType === 'mixed'
                  ? 'کم‌شنوایی مختلط (Mixed)'
                  : hearingType === 'sensorineural'
                  ? 'کم‌شنوایی حسی-عصبی (Sensorineural)'
                  : 'شنوایی طبیعی (Normal)'}
              </span>
            </div>
          </div>

          <p className="text-sm font-bold text-slate-900 mb-1 leading-relaxed">
            {overallDiagnosisFa}
          </p>
          <p className="text-xs text-slate-600 font-mono italic mb-3">
            {overallDiagnosisEn}
          </p>

          {/* Specialized Recommendations based on Hearing Type */}
          {recommendations.length > 0 && (
            <div className="pt-3 border-t border-slate-200">
              <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
                <span>اقدامات تشخیصی، درمانی و توانبخشی پیشنهادی (Tailored Clinical Plan):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {recommendations.map((rec, idx) => (
                  <div
                    key={`rec-${idx}`}
                    className="p-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 leading-relaxed flex items-start gap-2 shadow-2xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0"></span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {patient.notes && (
            <div className="pt-3 mt-3 border-t border-slate-200 text-xs">
              <span className="font-bold text-slate-800">ملاحظات اتوسکوپی و بالینی: </span>
              <span className="text-slate-700">{patient.notes}</span>
            </div>
          )}
        </div>

        {/* Doctor Signature & Official Stamp Area */}
        <div className="grid grid-cols-2 gap-8 pt-6 border-t-2 border-slate-800 mt-8 print-break-inside-avoid">
          <div className="text-xs text-slate-600">
            <div className="font-bold text-slate-900 mb-1">تأییدیه و استانداردهای اندازه‌گیری:</div>
            <p className="text-[11px] leading-relaxed">
              این سنجش بر اساس معیارهای بین‌المللی ANSI S3.6 و دستورالعمل سازمان بهداشت جهانی (WHO) و آیین‌نامه محاسبه ناتوانی AAO-HNS انجام شده است.
            </p>
            <div className="mt-3 font-mono text-[10px] text-slate-400">
              Generated by Audioclinic Assessment Engine · Ver. 2026.4
            </div>
          </div>

          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-xs font-bold text-slate-900 mb-8">
              محل مهر و امضای کارشناس شنوایی‌شناسی (ادیولوژیست)
            </div>
            <div className="w-48 border-b border-dashed border-slate-400"></div>
            <div className="text-xs text-slate-700 mt-2 font-medium">
              {patient.audiologist || 'کارشناس شنوایی‌شناس'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
