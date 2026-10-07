import React from 'react';
import { PatientInfo } from '../types/audiometry';
import { User, Calendar, Phone, Stethoscope, Building2, FileText, Activity } from 'lucide-react';

interface PatientFormProps {
  patient: PatientInfo;
  onChange: (updated: Partial<PatientInfo>) => void;
  onProceedToTest?: () => void;
  onProceedToReport?: () => void;
}

export const PatientForm: React.FC<PatientFormProps> = ({
  patient,
  onChange,
  onProceedToTest,
  onProceedToReport,
}) => {
  const handleHistoryToggle = (key: keyof PatientInfo['medicalHistory']) => {
    onChange({
      medicalHistory: {
        ...patient.medicalHistory,
        [key]: !patient.medicalHistory[key],
      },
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-teal-50 text-teal-700">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">مشخصات و پرونده بالینی بیمار</h2>
            <p className="text-xs text-slate-500">اطلاعات این بخش به صورت کامل در برگه چاپی گزارش شنوایی‌سنجی درج خواهد شد.</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: Demographics */}
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-teal-600 rounded-full inline-block"></span>
            اطلاعات فردی و هویتی
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* First Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                نام مراجعه‌کننده <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={patient.firstName || ''}
                onChange={(e) => {
                  const fName = e.target.value;
                  const full = `${fName} ${patient.lastName || ''}`.trim();
                  onChange({ firstName: fName, fullName: full });
                }}
                placeholder="مثال: امیرحسین"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                نام خانوادگی مراجعه‌کننده <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={patient.lastName || ''}
                onChange={(e) => {
                  const lName = e.target.value;
                  const full = `${patient.firstName || ''} ${lName}`.trim();
                  onChange({ lastName: lName, fullName: full });
                }}
                placeholder="مثال: رضایی"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                تاریخ تولد مراجعه‌کننده <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={patient.birthDate || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  const match = val.match(/^(\d{4})/);
                  let calculatedAge = patient.age;
                  if (match) {
                    const year = Number(match[1]);
                    if (year >= 1300 && year <= 1405) {
                      calculatedAge = 1405 - year;
                    } else if (year >= 1920 && year <= 2026) {
                      calculatedAge = 2026 - year;
                    }
                  }
                  onChange({ birthDate: val, age: calculatedAge });
                }}
                placeholder="مثال: ۱۳۶۶/۰۷/۱۵"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono"
              />
            </div>

            {/* National Code / File Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                کد ملی یا شناسه پرونده <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={patient.nationalCode}
                onChange={(e) => onChange({ nationalCode: e.target.value })}
                placeholder="مثال: ۰۰۱۲۳۴۵۶۷۸"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono"
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                سن (سال)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={patient.age}
                onChange={(e) => onChange({ age: e.target.value ? Number(e.target.value) : '' })}
                placeholder="مثال: ۳۸"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                جنسیت <span className="text-rose-500">*</span>
              </label>
              <select
                value={patient.gender}
                onChange={(e) => onChange({ gender: e.target.value as PatientInfo['gender'] })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="male">مرد</option>
                <option value="female">زن</option>
                <option value="child">کودک</option>
                <option value="other">سایر / نامشخص</option>
              </select>
            </div>

            {/* Test Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                تاریخ آزمایش (تاریخ جلسه) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={patient.testDate}
                onChange={(e) => onChange({ testDate: e.target.value })}
                placeholder="۱۴۰۴/۰۱/۱۵"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono"
              />
            </div>

            {/* Session Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                شماره جلسه ارزیابی
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={patient.sessionNumber || 1}
                onChange={(e) => onChange({ sessionNumber: Number(e.target.value) || 1 })}
                placeholder="مثال: ۱"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                شماره تماس / همراه
              </label>
              <input
                type="text"
                value={patient.phoneNumber}
                onChange={(e) => onChange({ phoneNumber: e.target.value })}
                placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Clinical Details & Clinic */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-teal-600 rounded-full inline-block"></span>
            مشخصات مرکز درمانی و ارجاع
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                نام مرکز / کلینیک شنوایی‌شناسی
              </label>
              <input
                type="text"
                value={patient.clinicName}
                onChange={(e) => onChange({ clinicName: e.target.value })}
                placeholder="کلینیک تخصصی شنوایی و سمعک طنین"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                شنوایی‌شناس / آزمون‌گیرنده
              </label>
              <input
                type="text"
                value={patient.audiologist}
                onChange={(e) => onChange({ audiologist: e.target.value })}
                placeholder="دکتر نیلوفر رضایی (ادیولوژیست)"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                پزشک ارجاع‌دهنده (ENT / معالج)
              </label>
              <input
                type="text"
                value={patient.referringDoctor}
                onChange={(e) => onChange({ referringDoctor: e.target.value })}
                placeholder="دکتر علیرضا کاظمی (متخصص گوش و حلق و بینی)"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Medical History & Complaints */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-teal-600 rounded-full inline-block"></span>
            شکایت اصلی و سوابق پزشکی گوش
          </h3>
          
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              شکایت اصلی بیمار (Chief Complaint)
            </label>
            <input
              type="text"
              value={patient.chiefComplaint}
              onChange={(e) => onChange({ chiefComplaint: e.target.value })}
              placeholder="مثال: احساس کاهش شنوایی در گوش چپ و وزوز ممتد از ۲ ماه پیش"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { key: 'tinnitus', label: 'وزوز گوش (Tinnitus)' },
              { key: 'vertigo', label: 'سرگیجه یا عدم تعادل' },
              { key: 'noiseExposure', label: 'مواجهه با صدای بلند/نویز شغلی' },
              { key: 'earInfection', label: 'سابقه عفونت یا ترشح گوش' },
              { key: 'familyHistory', label: 'سابقه خانوادگی کم‌شنوایی' },
              { key: 'ototoxicDrugs', label: 'مصرف داروهای اتوتوکسیک' },
            ].map(({ key, label }) => {
              const typedKey = key as keyof PatientInfo['medicalHistory'];
              const isChecked = !!patient.medicalHistory[typedKey];
              return (
                <label
                  key={key}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-teal-50/70 border-teal-300 text-teal-900 font-medium'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleHistoryToggle(typedKey)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 accent-teal-600"
                  />
                  <span>{label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Section 4: Notes / Otoscopy */}
        <div className="pt-4 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            توضیحات بالینی و نتایج اتوسکوپی (Otoscopy / Clinical Observations)
          </label>
          <textarea
            rows={2}
            value={patient.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            placeholder="مجرای گوش دوطرفه باز و بدون انسداد جرم (Cerumen)، پرده صماخ در معاینه اتوسکوپی نرمال با رفلکس نوری طبیعی..."
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          ></textarea>
        </div>

        {/* Action Navigation */}
        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {patient.fullName ? (
              <span className="text-emerald-700 font-medium">✓ پرونده بیمار «{patient.fullName}» آماده انجام آزمایش است.</span>
            ) : (
              <span>لطفاً نام بیمار را وارد فرمایید.</span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {onProceedToTest && (
              <button
                type="button"
                onClick={onProceedToTest}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
              >
                رفتن به کنسول سنجش شنوایی →
              </button>
            )}
            {onProceedToReport && (
              <button
                type="button"
                onClick={onProceedToReport}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-xs"
              >
                مشاهده برگه گزارش چاپی →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
