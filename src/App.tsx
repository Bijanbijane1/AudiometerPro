import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Ear,
  Frequency,
  HearingType,
  PatientInfo,
  STANDARD_FREQUENCIES,
  TestResult,
  ThresholdMap,
} from './types/audiometry';
import {
  calculatePTA,
  getCurrentDateTimePersian,
  generateClinicalSummary,
  summarizeEar,
  calculateHearingHandicap,
  compareWithPriorSession,
  CLINICAL_PRESETS,
} from './utils/audiometryCalculations';
import { Navbar } from './components/Navbar';
import { AudiogramChart } from './components/AudiogramChart';
import { AudiometerConsole } from './components/AudiometerConsole';
import { PatientForm } from './components/PatientForm';
import { ClinicalReport } from './components/ClinicalReport';
import { SoundCalibrationModal } from './components/SoundCalibrationModal';
import { PatientHistoryModal } from './components/PatientHistoryModal';
import {
  Printer,
  FileText,
  Sliders,
  History,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Info,
} from 'lucide-react';

const STORAGE_KEY = 'audiometry_patient_records_v1';

export default function App() {
  const initialDateTime = useMemo(() => getCurrentDateTimePersian(), []);

  // Patient Intake State
  const [patient, setPatient] = useState<PatientInfo>({
    id: `PTA-${Date.now().toString().slice(-6)}`,
    firstName: 'امیرحسین',
    lastName: 'رضایی',
    fullName: 'امیرحسین رضایی',
    birthDate: '۱۳۶۶/۰۷/۱۵',
    nationalCode: '۰۰۱۲۳۴۵۶۷۸',
    age: 38,
    gender: 'male',
    phoneNumber: '۰۹۱۲۳۴۵۶۷۸۹',
    referringDoctor: 'دکتر علیرضا کاظمی (متخصص گوش و حلق و بینی)',
    audiologist: 'دکتر مریم احمدی (کارشناس ارشد شنوایی‌شناسی)',
    clinicName: 'مرکز تخصصی ادیومتری و ارزیابی شنوایی پارس',
    testDate: initialDateTime.date,
    testTime: initialDateTime.time,
    sessionNumber: 1,
    chiefComplaint: 'احساس افت شنوایی در مکالمات شلوغ و وزوز خفیف گوش راست',
    medicalHistory: {
      tinnitus: true,
      vertigo: false,
      noiseExposure: true,
      earInfection: false,
      familyHistory: false,
      ototoxicDrugs: false,
    },
    notes: 'مجرای گوش دوطرفه فاقد سرومن است؛ پرده صماخ در اتوسکوپی اینتکت و نرمال می‌باشد.',
  });

  // Thresholds State (Right & Left ears)
  // Default values set to an illustrative mild-to-moderate high frequency curve
  const [rightThresholds, setRightThresholds] = useState<ThresholdMap>({
    125: 15,
    250: 15,
    500: 20,
    1000: 20,
    2000: 30,
    4000: 55,
    8000: 45,
  });

  const [leftThresholds, setLeftThresholds] = useState<ThresholdMap>({
    125: 15,
    250: 20,
    500: 20,
    1000: 25,
    2000: 25,
    4000: 50,
    8000: 40,
  });

  // UI Navigation & Modals
  const [activeTab, setActiveTab] = useState<'test' | 'patient' | 'report'>('test');
  const [selectedEar, setSelectedEar] = useState<Ear>('right');
  const [hearingType, setHearingType] = useState<HearingType>('sensorineural');
  const [selectedPriorSessionId, setSelectedPriorSessionId] = useState<string | null>(null);
  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Saved tests list
  const [savedRecords, setSavedRecords] = useState<TestResult[]>([]);

  // Load saved tests from localStorage on mount
  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        setSavedRecords(JSON.parse(data));
      } else {
        // Seed baseline historical session for demonstration of smart Trend Analysis
        const priorRight: ThresholdMap = { 125: 15, 250: 15, 500: 15, 1000: 15, 2000: 20, 4000: 35, 8000: 30 };
        const priorLeft: ThresholdMap = { 125: 15, 250: 15, 500: 15, 1000: 15, 2000: 20, 4000: 30, 8000: 25 };
        const priorRSummary = summarizeEar(priorRight);
        const priorLSummary = summarizeEar(priorLeft);
        const priorHandicap = calculateHearingHandicap(priorRight, priorLeft);
        const demoPriorRecord: TestResult = {
          id: 'TEST-HISTORICAL-01',
          patient: {
            id: 'PTA-HIST-01',
            firstName: 'امیرحسین',
            lastName: 'رضایی',
            fullName: 'امیرحسین رضایی',
            birthDate: '۱۳۶۶/۰۷/۱۵',
            nationalCode: '۰۰۱۲۳۴۵۶۷۸',
            age: 38,
            gender: 'male',
            phoneNumber: '۰۹۱۲۳۴۵۶۷۸۹',
            referringDoctor: 'دکتر علیرضا کاظمی (متخصص گوش و حلق و بینی)',
            audiologist: 'دکتر مریم احمدی (کارشناس ارشد شنوایی‌شناسی)',
            clinicName: 'مرکز تخصصی ادیومتری و ارزیابی شنوایی پارس',
            testDate: '۱۴۰۳/۰۶/۱۰',
            testTime: '۱۰:۳۰',
            sessionNumber: 1,
            chiefComplaint: 'ارزیابی دوره اول شنوایی (چکاپ اولیه)',
            medicalHistory: {
              tinnitus: false,
              vertigo: false,
              noiseExposure: true,
              earInfection: false,
              familyHistory: false,
              ototoxicDrugs: false,
            },
            notes: 'جلسه ارزیابی اول (۶ ماه پیش)',
          },
          createdAt: new Date(Date.now() - 180 * 24 * 3600 * 1000).toISOString(),
          rightEarAir: priorRight,
          leftEarAir: priorLeft,
          rightSummary: priorRSummary,
          leftSummary: priorLSummary,
          handicap: priorHandicap,
          overallDiagnosisFa: 'شنوایی در محدوده طبیعی با ناچ خفیف ناشی از نویز در ۴ کیلوهرتز',
          overallDiagnosisEn: 'Bilateral normal with slight 4kHz notch',
          hearingType: 'sensorineural',
          recommendations: ['پایش دوره‌ای ۶ ماهه شنوایی'],
          testedBy: 'دکتر مریم احمدی',
        };

        setSavedRecords([demoPriorRecord]);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify([demoPriorRecord]));
        } catch {
          // ignore
        }
      }
    } catch {
      // Ignore storage read error
    }
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // Threshold manipulations
  const handleUpdateThreshold = (ear: Ear, freq: Frequency, db: number | null) => {
    if (ear === 'right') {
      setRightThresholds((prev) => ({ ...prev, [freq]: db }));
    } else {
      setLeftThresholds((prev) => ({ ...prev, [freq]: db }));
    }
    if (db !== null) {
      showToast(`آستانه ${freq} هرتز گوش ${ear === 'right' ? 'راست' : 'چپ'} روی ${db} dB ثبت شد.`);
    }
  };

  const handleClearAll = () => {
    const empty: ThresholdMap = {
      125: null,
      250: null,
      500: null,
      1000: null,
      2000: null,
      4000: null,
      8000: null,
    };
    setRightThresholds(empty);
    setLeftThresholds(empty);
    showToast('تمامی آستانه‌های شنوایی پاک شدند.');
  };

  // Summaries & Diagnosis recalculations
  const rightSummary = useMemo(() => summarizeEar(rightThresholds), [rightThresholds]);
  const leftSummary = useMemo(() => summarizeEar(leftThresholds), [leftThresholds]);
  const handicap = useMemo(() => calculateHearingHandicap(rightThresholds, leftThresholds), [rightThresholds, leftThresholds]);

  const clinicalAssessment = useMemo(() => {
    return generateClinicalSummary(
      rightSummary,
      leftSummary,
      rightThresholds,
      leftThresholds,
      patient.medicalHistory,
      hearingType
    );
  }, [rightSummary, leftSummary, rightThresholds, leftThresholds, patient.medicalHistory, hearingType]);

  // Match previous sessions for current patient (matched by nationalCode or fullName)
  const patientPriorSessions = useMemo(() => {
    return savedRecords.filter((record) => {
      const sameNationalCode =
        patient.nationalCode &&
        record.patient.nationalCode &&
        record.patient.nationalCode.trim() === patient.nationalCode.trim();
      const sameName =
        patient.fullName &&
        record.patient.fullName &&
        record.patient.fullName.trim() === patient.fullName.trim();
      return (sameNationalCode || sameName) && record.id !== patient.id;
    });
  }, [savedRecords, patient.nationalCode, patient.fullName, patient.id]);

  // Active prior session for longitudinal comparison
  const activePriorSession = useMemo(() => {
    if (patientPriorSessions.length === 0) return null;
    if (selectedPriorSessionId) {
      return patientPriorSessions.find((s) => s.id === selectedPriorSessionId) || patientPriorSessions[0];
    }
    return patientPriorSessions[0];
  }, [patientPriorSessions, selectedPriorSessionId]);

  // Trend comparison analysis
  const comparison = useMemo(() => {
    if (!activePriorSession) return null;
    return compareWithPriorSession(
      rightThresholds,
      leftThresholds,
      rightSummary,
      leftSummary,
      handicap,
      activePriorSession
    );
  }, [activePriorSession, rightThresholds, leftThresholds, rightSummary, leftSummary, handicap]);

  // Save current test
  const handleSaveCurrentTest = () => {
    const newRecord: TestResult = {
      id: `TEST-${Date.now()}`,
      patient: { ...patient },
      createdAt: new Date().toISOString(),
      rightEarAir: { ...rightThresholds },
      leftEarAir: { ...leftThresholds },
      rightSummary,
      leftSummary,
      handicap,
      overallDiagnosisFa: clinicalAssessment.overallFa,
      overallDiagnosisEn: clinicalAssessment.overallEn,
      hearingType: clinicalAssessment.hearingType,
      recommendations: clinicalAssessment.recommendations,
      testedBy: patient.audiologist || 'ادیولوژیست',
    };

    const updated = [newRecord, ...savedRecords.filter((r) => r.patient.id !== newRecord.patient.id)];
    setSavedRecords(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Storage error
    }
    showToast(`جلسه ارزیابی بیمار «${patient.fullName}» با موفقیت ذخیره گردید.`);
  };

  // Load a test from history
  const handleLoadResult = (res: TestResult) => {
    setPatient({ ...res.patient });
    setRightThresholds({ ...res.rightEarAir });
    setLeftThresholds({ ...res.leftEarAir });
    showToast(`پرونده «${res.patient.fullName}» بارگذاری گردید.`);
  };

  // Delete a test from history
  const handleDeleteResult = (id: string) => {
    const updated = savedRecords.filter((r) => r.id !== id);
    setSavedRecords(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // storage error
    }
    showToast('پرونده مورد نظر حذف شد.');
  };

  // Load preset sample
  const handleLoadPreset = (index: number) => {
    const p = CLINICAL_PRESETS[index];
    if (!p) return;
    setRightThresholds({ ...p.right });
    setLeftThresholds({ ...p.left });
    setPatient((prev) => ({
      ...prev,
      firstName: 'بیمار نمونه',
      lastName: `(${p.name.split(':')[0]})`,
      fullName: `بیمار نمونه (${p.name.split(':')[0]})`,
      birthDate: '۱۳۶۰/۰۴/۱۱',
      chiefComplaint: p.desc,
      medicalHistory: { ...p.history },
    }));
    showToast(`نمونه بالینی «${p.name}» بارگذاری شد.`);
  };

  // Print Handler
  const handlePrint = () => {
    // If not already in report tab, switch to it, then call print
    setActiveTab('report');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Navbar adhering to Top Bar Contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCalibration={() => setIsCalibrationOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onPrint={handlePrint}
        onSaveSession={handleSaveCurrentTest}
        patientName={patient.fullName}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-bounce no-print">
          <CheckCircle className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* TAB 1: TESTING & AUDIOMETER CONSOLE */}
        {activeTab === 'test' && (
          <div className="space-y-6">
            
            {/* Patient Header Banner */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
                  {patient.gender === 'female' ? 'خانم' : 'آقا'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{patient.fullName || 'بیمار بدون نام'}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-xs text-slate-500 font-mono">کد ملی: {patient.nationalCode || '—'}</span>
                    {patient.age && (
                      <>
                        <span className="text-slate-400">·</span>
                        <span className="text-xs text-slate-500">{patient.age} ساله</span>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate max-w-md">
                    {patient.chiefComplaint || 'بدون شکایت مشخص'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveCurrentTest}
                  className="px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                >
                  <span>ذخیره نتایج این جلسه</span>
                </button>
                <button
                  onClick={() => setActiveTab('patient')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  ویرایش مشخصات بیمار
                </button>
                <button
                  onClick={() => setActiveTab('report')}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  مشاهده و چاپ گزارش نهایی
                </button>
              </div>
            </div>

            {/* Split Console & Live Audiogram Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Audiometer Controls */}
              <div className="lg:col-span-6 space-y-6">
                <AudiometerConsole
                  rightThresholds={rightThresholds}
                  leftThresholds={leftThresholds}
                  onUpdateThreshold={handleUpdateThreshold}
                  onClearAll={handleClearAll}
                  selectedEar={selectedEar}
                  setSelectedEar={setSelectedEar}
                  hearingType={hearingType}
                  onHearingTypeChange={setHearingType}
                />
              </div>

              {/* Live Vector Audiogram Display */}
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900">
                      رسم زنده ادیوگرام بالینی (Live Audiogram Display)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      محور وارونه dB HL (-10 تا 120)
                    </span>
                  </div>

                  <AudiogramChart
                    rightThresholds={rightThresholds}
                    leftThresholds={leftThresholds}
                    selectedEar={selectedEar}
                    editable={true}
                    onPointSelect={(freq, db, ear) => handleUpdateThreshold(ear, freq, db)}
                  />
                </div>

                {/* Instant Assessment Metrics Box */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Right Ear Quick Metric */}
                  <div className="p-3 bg-red-50/40 border border-red-200 rounded-xl">
                    <div className="text-[11px] font-bold text-red-700 flex items-center justify-between">
                      <span>گوش راست (R)</span>
                      <span className="font-mono">{rightSummary.degreeFa}</span>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-[10px] text-slate-500">میانگین PTA:</span>
                      <span className="text-sm font-mono font-bold text-red-900">
                        {rightSummary.pta !== null ? `${rightSummary.pta} dB` : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Left Ear Quick Metric */}
                  <div className="p-3 bg-blue-50/40 border border-blue-200 rounded-xl">
                    <div className="text-[11px] font-bold text-blue-700 flex items-center justify-between">
                      <span>گوش چپ (L)</span>
                      <span className="font-mono">{leftSummary.degreeFa}</span>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-[10px] text-slate-500">میانگین PTA:</span>
                      <span className="text-sm font-mono font-bold text-blue-900">
                        {leftSummary.pta !== null ? `${leftSummary.pta} dB` : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Diagnosis Snippet */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <div className="font-bold text-slate-800 mb-0.5">تفسیر اولیه:</div>
                  <p className="text-slate-600 leading-normal">{clinicalAssessment.overallFa}</p>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 2: PATIENT INTAKE FORM */}
        {activeTab === 'patient' && (
          <div className="space-y-6">
            <PatientForm
              patient={patient}
              onChange={(updated) => setPatient((prev) => ({ ...prev, ...updated }))}
              onProceedToTest={() => setActiveTab('test')}
              onProceedToReport={() => setActiveTab('report')}
            />
          </div>
        )}

        {/* TAB 3: OFFICIAL CLINICAL PRINTABLE REPORT */}
        {activeTab === 'report' && (
          <div className="space-y-6">
            <ClinicalReport
              patient={patient}
              rightThresholds={rightThresholds}
              leftThresholds={leftThresholds}
              rightSummary={rightSummary}
              leftSummary={leftSummary}
              handicap={handicap}
              hearingType={hearingType}
              comparison={comparison}
              priorSessions={patientPriorSessions}
              selectedPriorSessionId={selectedPriorSessionId}
              onSelectPriorSession={setSelectedPriorSessionId}
              overallDiagnosisFa={clinicalAssessment.overallFa}
              overallDiagnosisEn={clinicalAssessment.overallEn}
              recommendations={clinicalAssessment.recommendations}
              onPrint={handlePrint}
            />
          </div>
        )}

      </main>

      {/* Hidden Print Container: When window.print() is called on any tab, this ensures the printable report is what prints */}
      <div className="print-only">
        <ClinicalReport
          patient={patient}
          rightThresholds={rightThresholds}
          leftThresholds={leftThresholds}
          rightSummary={rightSummary}
          leftSummary={leftSummary}
          handicap={handicap}
          hearingType={hearingType}
          comparison={comparison}
          priorSessions={patientPriorSessions}
          selectedPriorSessionId={selectedPriorSessionId}
          onSelectPriorSession={setSelectedPriorSessionId}
          overallDiagnosisFa={clinicalAssessment.overallFa}
          overallDiagnosisEn={clinicalAssessment.overallEn}
          recommendations={clinicalAssessment.recommendations}
          onPrint={handlePrint}
        />
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-xs text-slate-500 text-center no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>
            سامانه جامع شنوایی‌سنجی بالینی و صدور گزارش ادیوگرام · استاندارد ANSI S3.6 / WHO
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCalibrationOpen(true)}
              className="text-teal-700 hover:underline"
            >
              کالیبراسیون هدفون
            </button>
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="text-teal-700 hover:underline"
            >
              بانک پرونده‌ها و نمونه‌ها
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SoundCalibrationModal
        isOpen={isCalibrationOpen}
        onClose={() => setIsCalibrationOpen(false)}
      />

      <PatientHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedResults={savedRecords}
        onLoadResult={handleLoadResult}
        onDeleteResult={handleDeleteResult}
        onLoadPreset={handleLoadPreset}
        onSaveCurrentTest={handleSaveCurrentTest}
        onImportRecords={(imported) => {
          setSavedRecords(imported);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
          } catch {
            // ignore
          }
          showToast(`${imported.length} پرونده با موفقیت بازیابی شد.`);
        }}
      />
    </div>
  );
}
