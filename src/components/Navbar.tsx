import React from 'react';
import { Volume2, Printer, Sliders, FileText, History, Headphones } from 'lucide-react';

interface NavbarProps {
  activeTab: 'test' | 'patient' | 'report';
  setActiveTab: (tab: 'test' | 'patient' | 'report') => void;
  onOpenCalibration: () => void;
  onOpenHistory: () => void;
  onPrint: () => void;
  onSaveSession?: () => void;
  patientName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCalibration,
  onOpenHistory,
  onPrint,
  onSaveSession,
  patientName,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Brand wordmark (single text element) */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold shadow-sm">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              سامانه ادیومتری و شنوایی‌سنجی بالینی
            </h1>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('test')}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'test'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-4 h-4 text-slate-500" />
            <span>کنسول سنجش صوت</span>
          </button>

          <button
            onClick={() => setActiveTab('patient')}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'patient'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>مشخصات بیمار {patientName ? `(${patientName})` : ''}</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'report'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>برگه رسمی و پرینت</span>
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCalibration}
            title="بررسی و کالیبراسیون هدفون"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <Headphones className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">کالیبره هدفون</span>
          </button>

          <button
            onClick={onOpenHistory}
            title="سوابق بیماران و نمونه‌ها"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <History className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">سوابق و نمونه‌ها</span>
          </button>

          {onSaveSession && (
            <button
              onClick={onSaveSession}
              title="ذخیره نتایج این جلسه ارزیابی"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <span>ذخیره جلسه</span>
            </button>
          )}

          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>چاپ گزارش (A4)</span>
          </button>
        </div>

      </div>
    </header>
  );
};
