export type Ear = 'right' | 'left';

export const STANDARD_FREQUENCIES = [125, 250, 500, 1000, 2000, 4000, 8000] as const;
export type Frequency = typeof STANDARD_FREQUENCIES[number];

export type ThresholdMap = Record<Frequency, number | null>;

export interface PatientInfo {
  id: string;
  firstName: string; // نام
  lastName: string; // نام خانوادگی
  fullName: string; // نام و نام خانوادگی کامل
  birthDate: string; // تاریخ تولد
  nationalCode: string; // کد ملی
  age: number | ''; // سن
  gender: 'male' | 'female' | 'child' | 'other';
  phoneNumber: string; // شماره تماس
  referringDoctor: string; // پزشک معالج
  audiologist: string; // ادیولوژیست
  clinicName: string; // نام کلینیک
  testDate: string; // تاریخ آزمایش
  testTime: string; // ساعت آزمایش
  sessionNumber?: number; // شماره جلسه ارزیابی
  chiefComplaint: string; // شکایت اصلی: وزوز، افت شنوایی، سرگیجه و ...
  medicalHistory: {
    tinnitus: boolean; // وزوز گوش
    vertigo: boolean; // سرگیجه
    noiseExposure: boolean; // قرارگیری در معرض سر و صدای زیاد
    earInfection: boolean; // عفونت یا جراحی قبلی گوش
    familyHistory: boolean; // سابقه خانوادگی کم‌شنوایی
    ototoxicDrugs: boolean; // مصرف داروهای خاص
  };
  notes: string;
}

export type HearingDegree = 
  | 'normal' // طبیعی (-10 تا 20)
  | 'slight' // بسیار خفیف (16 تا 25 در کودکان یا 21-25)
  | 'mild' // خفیف (26 تا 40)
  | 'moderate' // متوسط (41 تا 55)
  | 'moderately-severe' // متوسط تا شدید (56 تا 70)
  | 'severe' // شدید (71 تا 90)
  | 'profound'; // عمیق (91+)

export type HearingType = 
  | 'normal'
  | 'conductive' // هدایتی
  | 'sensorineural' // حسی-عصبی
  | 'mixed' // مختلط
  | 'undetermined'; // نامشخص

export interface EarSummary {
  pta: number | null; // Pure tone average (500, 1000, 2000 Hz)
  pta4: number | null; // 4-frequency PTA (500, 1000, 2000, 4000 Hz)
  highFreqPta: number | null; // High frequency average (2k, 4k, 8k)
  degree: HearingDegree;
  degreeFa: string;
  degreeEn: string;
  monoauralImpairmentPercent: number; // MHI: ((PTA4 - 25) * 1.5)%
}

export interface HearingHandicapResult {
  rightPTA4: number | null;
  leftPTA4: number | null;
  rightMHI: number; // Monoaural Hearing Impairment %
  leftMHI: number;
  betterEar: Ear;
  worseEar: Ear;
  binauralHandicapPercentage: number; // Binaural handicap %
  classificationFa: string;
  formulaDescription: string;
}

export interface SessionComparison {
  priorSessionDate: string;
  priorSessionNumber?: number;
  priorRightPta: number | null;
  priorLeftPta: number | null;
  priorHandicap: number;
  rightPtaDelta: number | null;
  leftPtaDelta: number | null;
  binauralHandicapDelta: number;
  trendStatus: 'stable' | 'improved' | 'progressed';
  trendStatusFa: string;
  trendDescriptionFa: string;
  priorRightThresholds: ThresholdMap;
  priorLeftThresholds: ThresholdMap;
}

export interface TestResult {
  id: string;
  patient: PatientInfo;
  createdAt: string;
  rightEarAir: ThresholdMap;
  leftEarAir: ThresholdMap;
  rightEarBone?: ThresholdMap;
  leftEarBone?: ThresholdMap;
  rightSummary: EarSummary;
  leftSummary: EarSummary;
  handicap: HearingHandicapResult;
  overallDiagnosisFa: string;
  overallDiagnosisEn: string;
  hearingType: HearingType;
  recommendations: string[];
  testedBy: string;
}
