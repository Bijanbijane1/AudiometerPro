import React from 'react';
import { Volume2, Printer, Sliders, FileText, History, Headphones, Save, Sparkles } from 'lucide-react';

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
    <>
      {/* Top Navbar adhering to Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs no-print">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
          
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm lg:text-base font-bold text-slate-900 tracking-tight truncate">
                سامانه ادیومتری و شنوایی‌سنجی بالینی برخوار
              </h1>
              <p className="text-[10px] text-slate-500 hidden sm:block truncate">
                ارزیابی تخصصی تن خالص، رسم ادیوگرام و تحلیل بالینی
              </p>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Tablet & Desktop: inline tabs) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => setActiveTab('test')}
              className={`flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'test'
                  ? 'bg-slate-100 text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-slate-500" />
              <span>کنسول سنجش صوت</span>
            </button>

            <button
              onClick={() => setActiveTab('patient')}
              className={`flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'patient'
                  ? 'bg-slate-100 text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-slate-500" />
              <span>مشخصات بیمار {patientName ? `(${patientName})` : ''}</span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'report'
                  ? 'bg-slate-100 text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Printer className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-slate-500" />
              <span>برگه رسمی و پرینت</span>
            </button>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={onOpenCalibration}
              title="کالیبراسیون و بررسی هدفون"
              className="flex items-center gap-1 px-2 sm:px-2.5 lg:px-3 py-1.5 sm:py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <Headphones className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">کالیبره</span>
            </button>

            <button
              onClick={onOpenHistory}
              title="سوابق بیماران و نمونه‌ها"
              className="flex items-center gap-1 px-2 sm:px-2.5 lg:px-3 py-1.5 sm:py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <History className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">سوابق</span>
            </button>

            {onSaveSession && (
              <button
                onClick={onSaveSession}
                title="ذخیره نتایج این جلسه ارزیابی"
                className="hidden xl:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                <Save className="w-3.5 h-3.5 text-slate-500" />
                <span>ذخیره جلسه</span>
              </button>
            )}

            <button
              onClick={onPrint}
              title="چاپ گزارش نهایی (A4)"
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden xs:inline sm:inline">چاپ (A4)</span>
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Sticky Bottom Navigation Bar (< 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg px-2 py-1.5 flex items-center justify-around no-print">
        <button
          onClick={() => setActiveTab('test')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[11px] font-semibold transition-all ${
            activeTab === 'test'
              ? 'text-teal-700 bg-teal-50'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className={`w-4 h-4 mb-0.5 ${activeTab === 'test' ? 'text-teal-600' : 'text-slate-400'}`} />
          <span>سنجش صوت</span>
        </button>

        <button
          onClick={() => setActiveTab('patient')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[11px] font-semibold transition-all ${
            activeTab === 'patient'
              ? 'text-teal-700 bg-teal-50'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className={`w-4 h-4 mb-0.5 ${activeTab === 'patient' ? 'text-teal-600' : 'text-slate-400'}`} />
          <span className="truncate max-w-[85px]">پرونده بیمار</span>
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[11px] font-semibold transition-all ${
            activeTab === 'report'
              ? 'text-teal-700 bg-teal-50'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Printer className={`w-4 h-4 mb-0.5 ${activeTab === 'report' ? 'text-teal-600' : 'text-slate-400'}`} />
          <span>گزارش چاپی</span>
        </button>
      </nav>
    </>
  );
};
