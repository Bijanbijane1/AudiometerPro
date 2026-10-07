import React, { useState, useRef } from 'react';
import { CLINICAL_PRESETS } from '../utils/audiometryCalculations';
import { PatientInfo, TestResult, ThresholdMap } from '../types/audiometry';
import { History, Search, Trash2, FolderOpen, Sparkles, X, Plus, Save, Download, Upload } from 'lucide-react';

interface PatientHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedResults: TestResult[];
  onLoadResult: (result: TestResult) => void;
  onDeleteResult: (id: string) => void;
  onLoadPreset: (presetIndex: number) => void;
  onSaveCurrentTest: () => void;
  onImportRecords?: (records: TestResult[]) => void;
}

export const PatientHistoryModal: React.FC<PatientHistoryModalProps> = ({
  isOpen,
  onClose,
  savedResults,
  onLoadResult,
  onDeleteResult,
  onLoadPreset,
  onSaveCurrentTest,
  onImportRecords,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const filteredResults = savedResults.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.patient.fullName.toLowerCase().includes(q) ||
      item.patient.nationalCode.includes(q) ||
      item.patient.phoneNumber.includes(q)
    );
  });

  const handleExportBackup = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(savedResults, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `Audiometry_Clinic_Backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error('Export error:', e);
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed) && onImportRecords) {
            onImportRecords(parsed);
          }
        } catch {
          alert('فایل انتخاب شده معتبر نمی‌باشد.');
        }
      };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn no-print">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">بانک سوابق بیماران و نمونه‌های بالینی</h3>
              <p className="text-xs text-slate-500">مشاهده پرونده‌های قبلی، بارگذاری سریع و نمونه‌های آموزشی</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو بر اساس نام بیمار یا کد ملی..."
              className="w-full pl-3 pr-9 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportBackup}
              title="خروجی فایل پشتیبان پرونده‌ها (JSON)"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span>پشتیبان‌گیری</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              title="بازیابی فایل پشتیبان (JSON)"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>بازیابی</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />

            <button
              onClick={onSaveCurrentTest}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>ذخیره جلسه فعلی</span>
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          
          {/* Preset Clinical Samples */}
          <div>
            <div className="flex items-center gap-1.5 mb-2.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>نمونه‌های بالینی استاندارد (جهت بررسی و مشاهده سریع ادیوگرام)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CLINICAL_PRESETS.map((preset, idx) => (
                <div
                  key={`preset-${idx}`}
                  className="p-3 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/20 transition-all text-right flex flex-col justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900 mb-0.5">{preset.name}</div>
                    <p className="text-[11px] text-slate-500 leading-normal">{preset.desc}</p>
                  </div>
                  <button
                    onClick={() => {
                      onLoadPreset(idx);
                      onClose();
                    }}
                    className="mt-2 text-[11px] font-semibold text-teal-700 hover:text-teal-900 text-left flex items-center justify-end gap-1"
                  >
                    بارگذاری این نمونه →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Patient Records */}
          <div>
            <div className="flex items-center justify-between mb-2.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <span>پرونده‌های ذخیره‌شده بیماران ({filteredResults.length})</span>
            </div>

            {filteredResults.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
                <FolderOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">هیچ پرونده‌ای یافت نشد.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  پس از انجام آزمایش، می‌توانید با دکمه «ذخیره جلسه فعلی» آن را ثبت کنید.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredResults.map((result) => (
                  <div
                    key={result.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{result.patient.fullName || 'بیمار بدون نام'}</span>
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          کد ملی: {result.patient.nationalCode || '—'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                        <span>تاریخ جلسه: {result.patient.testDate} {result.patient.sessionNumber ? `(جلسه ${result.patient.sessionNumber})` : ''}</span>
                        {result.patient.birthDate && (
                          <>
                            <span>·</span>
                            <span>تولد: {result.patient.birthDate}</span>
                          </>
                        )}
                        <span>·</span>
                        <span>گوش راست: {result.rightSummary.degreeFa}</span>
                        <span>·</span>
                        <span>گوش چپ: {leftSummaryToFa(result)}</span>
                        {result.handicap && (
                          <>
                            <span>·</span>
                            <span className="font-bold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded">
                              ناتوانی شنوایی: {result.handicap.binauralHandicapPercentage}٪
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onLoadResult(result);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg"
                      >
                        بارگذاری
                      </button>
                      <button
                        onClick={() => onDeleteResult(result.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="حذف پرونده"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
          >
            بستن
          </button>
        </div>

      </div>
    </div>
  );
};

function leftSummaryToFa(result: TestResult): string {
  return result.leftSummary?.degreeFa || '—';
}
