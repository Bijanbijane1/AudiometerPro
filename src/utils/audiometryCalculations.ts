import {
  Ear,
  EarSummary,
  Frequency,
  HearingDegree,
  HearingHandicapResult,
  HearingType,
  SessionComparison,
  TestResult,
  ThresholdMap,
} from '../types/audiometry';

/**
 * Calculate Pure Tone Average (PTA) using standard frequencies: 500 Hz, 1000 Hz, 2000 Hz.
 */
export function calculatePTA(thresholds: ThresholdMap): number | null {
  const f500 = thresholds[500];
  const f1000 = thresholds[1000];
  const f2000 = thresholds[2000];

  const validVals: number[] = [];
  if (f500 !== null) validVals.push(f500);
  if (f1000 !== null) validVals.push(f1000);
  if (f2000 !== null) validVals.push(f2000);

  if (validVals.length === 0) return null;
  const sum = validVals.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / validVals.length) * 10) / 10;
}

/**
 * Calculate 4-Frequency Pure Tone Average (PTA-4) at 500, 1000, 2000, 4000 Hz.
 * Standard for AAO-HNS and AMA Hearing Handicap calculations.
 */
export function calculatePTA4(thresholds: ThresholdMap): number | null {
  const f500 = thresholds[500];
  const f1000 = thresholds[1000];
  const f2000 = thresholds[2000];
  const f4000 = thresholds[4000];

  const validVals: number[] = [];
  if (f500 !== null) validVals.push(f500);
  if (f1000 !== null) validVals.push(f1000);
  if (f2000 !== null) validVals.push(f2000);
  if (f4000 !== null) validVals.push(f4000);

  if (validVals.length === 0) return null;
  const sum = validVals.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / validVals.length) * 10) / 10;
}

/**
 * Calculate High Frequency PTA (2000 Hz, 4000 Hz, 8000 Hz).
 */
export function calculateHighFreqPTA(thresholds: ThresholdMap): number | null {
  const f2000 = thresholds[2000];
  const f4000 = thresholds[4000];
  const f8000 = thresholds[8000];

  const validVals: number[] = [];
  if (f2000 !== null) validVals.push(f2000);
  if (f4000 !== null) validVals.push(f4000);
  if (f8000 !== null) validVals.push(f8000);

  if (validVals.length === 0) return null;
  const sum = validVals.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / validVals.length) * 10) / 10;
}

/**
 * Calculate Monoaural Hearing Impairment Percentage (MHI).
 * Standard AAO-HNS / AMA Formula:
 * MHI = ((PTA4 - 25 dB) * 1.5)% clamped between 0% and 100%.
 */
export function calculateMonoauralImpairment(pta4: number | null): number {
  if (pta4 === null || pta4 <= 25) return 0;
  const percent = (pta4 - 25) * 1.5;
  return Math.min(100, Math.max(0, Math.round(percent * 10) / 10));
}

/**
 * Calculate Binaural Hearing Handicap Percentage according to AAO-HNS / AMA:
 * Binaural Handicap = [(5 * Better Ear MHI) + (1 * Worse Ear MHI)] / 6
 */
export function calculateHearingHandicap(
  rightThresholds: ThresholdMap,
  leftThresholds: ThresholdMap
): HearingHandicapResult {
  const rightPTA4 = calculatePTA4(rightThresholds);
  const leftPTA4 = calculatePTA4(leftThresholds);

  const rightMHI = calculateMonoauralImpairment(rightPTA4);
  const leftMHI = calculateMonoauralImpairment(leftPTA4);

  let betterEar: Ear = 'right';
  let worseEar: Ear = 'left';
  let betterMHI = rightMHI;
  let worseMHI = leftMHI;

  if (leftMHI < rightMHI) {
    betterEar = 'left';
    worseEar = 'right';
    betterMHI = leftMHI;
    worseMHI = rightMHI;
  }

  const rawHandicap = ((5 * betterMHI) + (1 * worseMHI)) / 6;
  const binauralHandicapPercentage = Math.round(rawHandicap * 10) / 10;

  let classificationFa = 'بدون ناتوانی شنوایی (۰٪)';
  if (binauralHandicapPercentage === 0) {
    classificationFa = 'طبیعی (بدون ناتوانی شنوایی - ۰٪)';
  } else if (binauralHandicapPercentage <= 20) {
    classificationFa = 'ناتوانی شنوایی خفیف (Mild Handicap)';
  } else if (binauralHandicapPercentage <= 40) {
    classificationFa = 'ناتوانی شنوایی متوسط (Moderate Handicap)';
  } else if (binauralHandicapPercentage <= 60) {
    classificationFa = 'ناتوانی شنوایی نسبتاً شدید (Moderately Severe)';
  } else if (binauralHandicapPercentage <= 80) {
    classificationFa = 'ناتوانی شنوایی شدید (Severe Handicap)';
  } else {
    classificationFa = 'ناتوانی شنوایی عمیق یا کامل (Total Handicap)';
  }

  const formulaDescription =
    'فرمول استاندارد مصوب AAO-HNS و AMA: درصد ناتوانی دوگوشی = [ (۵ × درصد نقص گوش بهتر) + (۱ × درصد نقص گوش بدتر) ] ÷ ۶. تراز آستانه پایه: ۲ factor: ۱.۵٪ به ازای هر دسی‌بل بالای ۲۵ dB در میانگین ۴ فرکانس ۵۰۰، ۱۰۰۰، ۲۰۰۰ و ۴۰۰۰ هرتز.';

  return {
    rightPTA4,
    leftPTA4,
    rightMHI,
    leftMHI,
    betterEar,
    worseEar,
    binauralHandicapPercentage,
    classificationFa,
    formulaDescription,
  };
}

/**
 * Get Hearing Degree based on WHO / BIAP classification.
 */
export function getHearingDegree(pta: number | null): {
  degree: HearingDegree;
  degreeFa: string;
  degreeEn: string;
} {
  if (pta === null) {
    return { degree: 'normal', degreeFa: 'ثبت نشده', degreeEn: 'Not Recorded' };
  }

  if (pta <= 20) {
    return { degree: 'normal', degreeFa: 'طبیعی (نرمال)', degreeEn: 'Normal Hearing' };
  }
  if (pta <= 40) {
    return { degree: 'mild', degreeFa: 'کم‌شنوایی خفیف (Mild)', degreeEn: 'Mild Hearing Loss' };
  }
  if (pta <= 55) {
    return { degree: 'moderate', degreeFa: 'کم‌شنوایی متوسط (Moderate)', degreeEn: 'Moderate Hearing Loss' };
  }
  if (pta <= 70) {
    return { degree: 'moderately-severe', degreeFa: 'کم‌شنوایی متوسط تا شدید (Mod-Severe)', degreeEn: 'Moderately Severe Hearing Loss' };
  }
  if (pta <= 90) {
    return { degree: 'severe', degreeFa: 'کم‌شنوایی شدید (Severe)', degreeEn: 'Severe Hearing Loss' };
  }
  return { degree: 'profound', degreeFa: 'کم‌شنوایی عمیق (Profound)', degreeEn: 'Profound Hearing Loss' };
}

/**
 * Summarize ear results.
 */
export function summarizeEar(thresholds: ThresholdMap): EarSummary {
  const pta = calculatePTA(thresholds);
  const pta4 = calculatePTA4(thresholds);
  const highFreqPta = calculateHighFreqPTA(thresholds);
  const degreeInfo = getHearingDegree(pta);
  const monoauralImpairmentPercent = calculateMonoauralImpairment(pta4);

  return {
    pta,
    pta4,
    highFreqPta,
    degree: degreeInfo.degree,
    degreeFa: degreeInfo.degreeFa,
    degreeEn: degreeInfo.degreeEn,
    monoauralImpairmentPercent,
  };
}

/**
 * Generate clinical overall diagnosis and recommendations based on results, hearing type, and medical history.
 */
export function generateClinicalSummary(
  rightSummary: EarSummary,
  leftSummary: EarSummary,
  rightThresholds: ThresholdMap,
  leftThresholds: ThresholdMap,
  history?: {
    tinnitus?: boolean;
    vertigo?: boolean;
    noiseExposure?: boolean;
    earInfection?: boolean;
  },
  customHearingType?: HearingType
): {
  overallFa: string;
  overallEn: string;
  hearingType: HearingType;
  recommendations: string[];
} {
  const rPta = rightSummary.pta;
  const lPta = leftSummary.pta;

  // Check if 4000 Hz notch is present (characteristic of noise-induced hearing loss)
  const r4k = rightThresholds[4000];
  const l4k = leftThresholds[4000];
  const hasNoiseNotch = (r4k !== null && r4k >= 35) || (l4k !== null && l4k >= 35);

  let overallFa = '';
  let overallEn = '';
  const recommendations: string[] = [];

  const bothNormal = (rPta === null || rPta <= 20) && (lPta === null || lPta <= 20);

  // Auto-determine hearing type if not explicitly provided
  let hearingType: HearingType = customHearingType || 'normal';

  if (bothNormal && !hasNoiseNotch) {
    hearingType = 'normal';
    overallFa = 'آستانه‌های شنوایی در هر دو گوش در محدوده طبیعی (Normal Hearing Bilaterally)';
    overallEn = 'Bilateral normal hearing thresholds across tested frequencies';

    recommendations.push('حفظ بهداشت شنوایی و پرهیز از گوش دادن به موسیقی با صدای بلند از طریق هندزفری (رعایت قانون ۶۰٪ ولوم).');
    recommendations.push('چکاپ دوره‌ای سالانه جهت پایش سلامت گوش، به ویژه در مشاغل پر سر و صدا.');
  } else if (bothNormal && hasNoiseNotch) {
    hearingType = 'sensorineural';
    overallFa = 'شنوایی در فرکانس‌های پایه طبیعی، افت اختصاصی در فرکانس ۴ کیلوهرتز (ناچ ناشی از صوت/نویز صنعتی)';
    overallEn = 'Normal speech-frequency hearing with acoustic notch at 4 kHz';

    recommendations.push('استفاده مداوم از محافظ گوش استاندارد (Custom Earplugs / Earmuffs) در محیط‌های کاری با تراز صدای بالای ۸۵ دسی‌بل.');
    recommendations.push('انجام تمپانومتری (تیپ A) جهت بررسی عملکرد پرده صماخ و رد درگیری گوش میانی.');
    recommendations.push('پایش دوره‌ای ۶ ماهه آستانه‌های فرکانس بالا جهت جلوگیری از گسترش آسیب به فرکانس‌های گفتاری.');
  } else {
    // If not normal, default to sensorineural unless history/custom indicates conductive or mixed
    if (!customHearingType) {
      if (history?.earInfection) {
        hearingType = 'conductive';
      } else {
        hearingType = 'sensorineural';
      }
    }

    const worseEar = (rPta || 0) > (lPta || 0) ? 'گوش راست' : (lPta || 0) > (rPta || 0) ? 'گوش چپ' : 'هر دو گوش';
    const typeLabelFa =
      hearingType === 'conductive'
        ? 'هدایتی (Conductive)'
        : hearingType === 'mixed'
        ? 'مختلط (Mixed)'
        : 'حسی-عصبی (Sensorineural)';

    if (rightSummary.degree === leftSummary.degree) {
      overallFa = `کم‌شنوایی دوطرفه و متقارن ${typeLabelFa} در رده ${rightSummary.degreeFa}`;
      overallEn = `Bilateral symmetrical ${hearingType} ${rightSummary.degreeEn}`;
    } else {
      overallFa = `کم‌شنوایی نامتقارن ${typeLabelFa} (راست: ${rightSummary.degreeFa} / چپ: ${leftSummary.degreeFa}) با درگیری بیشتر در ${worseEar}`;
      overallEn = `Asymmetrical ${hearingType} hearing loss (R: ${rightSummary.degreeEn}, L: ${leftSummary.degreeEn})`;
    }

    // TAILORED SPECIALIZED RECOMMENDATIONS BY HEARING TYPE
    if (hearingType === 'conductive') {
      recommendations.push('ویزیت و ارجاع فوری به متخصص و جراح گوش، حلق و بینی (ENT) جهت ارزیابی اتوسکوپیک و بررسی پاتولوژی‌های گوش میانی (پرده صماخ، زنجیره استخوانچه‌ای یا شیپور استاش).');
      recommendations.push('انجام آزمایش تمپانومتری (Tympanometry) و رفلکس آکوستیک جهت بررسی فشار گوش میانی و وجود مایع یا ترشح (منحنی تیپ B یا C).');
      recommendations.push('بررسی گزینه‌های درمان دارویی یا جراحی گوش میانی (مانند میرنگوتومی با لوله تهویه VT، تیمپانوپلاستی یا استپدکتومی).');
      recommendations.push('در صورت عدم امکان مداخله جراحی، ارزیابی سمعک‌های هدایت استخوانی (BAHA یا سمعک‌های عینکی/هدبند).');
    } else if (hearingType === 'sensorineural') {
      recommendations.push('ارزیابی و تجویز سمعک دیجیتال هوشمند دوگوشی (Hearing Aid Evaluation & Fitting) با الگوریتم‌های پردازش گفتار در نویز و جهت‌داری میکروفون.');
      recommendations.push('انجام آزمایش تمپانومتری (تیپ A) جهت اطمینان از سلامت ساختار پرده صماخ و عدم وجود اختلال همزمان گوش میانی.');
      recommendations.push('انجام آزمون‌های ادیومتری گفتاری (Speech Audiometry شامل SRT و SDS) جهت سنجش دقیق تمایز و درک واژگان.');
      recommendations.push('رعایت پروتکل‌های حفاظت صوتی و پرهیز جدی از نویزهای محیطی صنعتی برای پیشگیری از تخریب سلول‌های مویی حلزون گوش.');
      if (rightSummary.degree === 'severe' || rightSummary.degree === 'profound' || leftSummary.degree === 'severe' || leftSummary.degree === 'profound') {
        recommendations.push('در صورت عدم پاسخ کافی به سمعک‌های پرقدرت، ارزیابی کاندیداتوری کاشت حلزون شنوایی (Cochlear Implant Evaluation).');
      }
    } else if (hearingType === 'mixed') {
      recommendations.push('رویکرد درمانی دوفازی: گام اول ارجاع به جراح گوش و حلق و بینی (ENT) جهت کنترل و درمان عفونت و بهبود جزء هدایتی گوش میانی.');
      recommendations.push('انجام آزمایش تمپانومتری تشخیصی و تکرار ادیومتری تن خالص پس از تکمیل درمان مدیکال جهت تعیین آستانه پایدار.');
      recommendations.push('تجویز و تنظیم سمعک دیجیتال با توان بالا (Power / Super Power Hearing Aid) متناسب با جزء حسی‌عصبی پس از پایدار شدن وضعیت گوش میانی.');
    }
  }

  if (history?.tinnitus) {
    recommendations.push('ارزیابی تخصصی وزوز گوش (پرسشنامه THI) و استفاده از سمعک‌های مجهز به نویزساز (Tinnitus Masker / Sound Therapy).');
  }
  if (history?.vertigo) {
    recommendations.push('در صورت وجود سرگیجه همزمان، انجام ارزیابی سیستم دهلیزی و تعادل (VNG / Vestibular Testing) پیشنهاد می‌گردد.');
  }

  return {
    overallFa,
    overallEn,
    hearingType,
    recommendations,
  };
}

/**
 * Compare current session with a prior session (Longitudinal Trend Analysis).
 */
export function compareWithPriorSession(
  currentRightThresholds: ThresholdMap,
  currentLeftThresholds: ThresholdMap,
  currentRightSummary: EarSummary,
  currentLeftSummary: EarSummary,
  currentHandicap: HearingHandicapResult,
  priorResult: TestResult
): SessionComparison {
  const priorRightPta = priorResult.rightSummary?.pta ?? null;
  const priorLeftPta = priorResult.leftSummary?.pta ?? null;
  const priorHandicap = priorResult.handicap?.binauralHandicapPercentage ?? 0;

  const currentRightPta = currentRightSummary.pta;
  const currentLeftPta = currentLeftSummary.pta;
  const currentHandicapVal = currentHandicap.binauralHandicapPercentage;

  const rightPtaDelta = (currentRightPta !== null && priorRightPta !== null)
    ? Math.round((currentRightPta - priorRightPta) * 10) / 10
    : null;

  const leftPtaDelta = (currentLeftPta !== null && priorLeftPta !== null)
    ? Math.round((currentLeftPta - priorLeftPta) * 10) / 10
    : null;

  const binauralHandicapDelta = Math.round((currentHandicapVal - priorHandicap) * 10) / 10;

  const maxDelta = Math.max(rightPtaDelta ?? 0, leftPtaDelta ?? 0);
  const minDelta = Math.min(rightPtaDelta ?? 0, leftPtaDelta ?? 0);

  let trendStatus: 'stable' | 'improved' | 'progressed' = 'stable';
  let trendStatusFa = 'پایدار (Stable)';
  let trendDescriptionFa = 'آستانه‌های شنوایی در مقایسه با ارزیابی پیشین در محدوده نوسان طبیعی (کمتر از ۱۰ دسی‌بل) بوده و روند ثابتی را نشان می‌دهد.';

  if (maxDelta >= 10 || binauralHandicapDelta >= 5) {
    trendStatus = 'progressed';
    trendStatusFa = 'پیشرفت و تشدید افت (Progression)';
    trendDescriptionFa = `آستانه‌های شنوایی در مقایسه با جلسه پیشین افت بیشتری نشان می‌دهند (افزایش میانگین تا ${maxDelta} دسی‌بل). پیگیری سریع جهت بررسی علل تشدید افت پیشنهاد می‌گردد.`;
  } else if (minDelta <= -10 || binauralHandicapDelta <= -5) {
    trendStatus = 'improved';
    trendStatusFa = 'بهبود آستانه‌ها (Improvement)';
    trendDescriptionFa = `آستانه‌های شنوایی در مقایسه با جلسه پیشین بهبود پیدا کرده‌اند (کاهش آستانه تا ${Math.abs(minDelta)} دسی‌بل). پاسخ مثبت به درمان را نشان می‌دهد.`;
  }

  return {
    priorSessionDate: priorResult.patient.testDate,
    priorSessionNumber: priorResult.patient.sessionNumber,
    priorRightPta,
    priorLeftPta,
    priorHandicap,
    rightPtaDelta,
    leftPtaDelta,
    binauralHandicapDelta,
    trendStatus,
    trendStatusFa,
    trendDescriptionFa,
    priorRightThresholds: priorResult.rightEarAir,
    priorLeftThresholds: priorResult.leftEarAir,
  };
}

/**
 * Get current formatted Persian date string and time.
 */
export function getCurrentDateTimePersian(): { date: string; time: string } {
  const now = new Date();
  
  // Persian date formatting using Intl.DateTimeFormat
  let persianDate = '';
  try {
    const formatter = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    persianDate = formatter.format(now);
  } catch {
    persianDate = now.toISOString().split('T')[0];
  }

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const time = `${hours}:${minutes}`;

  return { date: persianDate, time };
}

/**
 * Demo preset cases for immediate examination and clinical review.
 */
export const CLINICAL_PRESETS = [
  {
    name: 'نمونه ۱: شنوایی دوطرفه کاملاً طبیعی',
    desc: 'شنوایی فرد جوان بدون هیچ‌گونه افت در تمام فرکانس‌ها',
    right: { 125: 10, 250: 10, 500: 15, 1000: 10, 2000: 10, 4000: 15, 8000: 10 } as ThresholdMap,
    left: { 125: 15, 250: 10, 500: 10, 1000: 15, 2000: 15, 4000: 10, 8000: 15 } as ThresholdMap,
    history: { tinnitus: false, vertigo: false, noiseExposure: false, earInfection: false, familyHistory: false, ototoxicDrugs: false },
  },
  {
    name: 'نمونه ۲: پیرگوشی شیب‌دار (Presbycusis)',
    desc: 'افت شنوایی حسی‌عصبی متقارن ناشی از افزایش سن در فرکانس‌های زیر',
    right: { 125: 15, 250: 20, 500: 25, 1000: 35, 2000: 50, 4000: 65, 8000: 75 } as ThresholdMap,
    left: { 125: 20, 250: 20, 500: 30, 1000: 40, 2000: 55, 4000: 70, 8000: 80 } as ThresholdMap,
    history: { tinnitus: true, vertigo: false, noiseExposure: false, earInfection: false, familyHistory: true, ototoxicDrugs: false },
  },
  {
    name: 'نمونه ۳: افت ناشی از نویز شغلی (NIHL - ناچ ۴۰۰۰ هرتز)',
    desc: 'فرورفتگی بارز صوتی در فرکانس ۴ کیلوهرتز ناشی از کار در محیط صنعتی',
    right: { 125: 15, 250: 15, 500: 15, 1000: 20, 2000: 25, 4000: 60, 8000: 30 } as ThresholdMap,
    left: { 125: 15, 250: 20, 500: 20, 1000: 20, 2000: 30, 4000: 65, 8000: 35 } as ThresholdMap,
    history: { tinnitus: true, vertigo: false, noiseExposure: true, earInfection: false, familyHistory: false, ototoxicDrugs: false },
  },
  {
    name: 'نمونه ۴: کم‌شنوایی متوسط دوطرفه (نیاز به سمعک)',
    desc: 'افت شنوایی فلت در محدوده گفتاری با نیاز قطعی به تجویز سمعک',
    right: { 125: 45, 250: 50, 500: 50, 1000: 55, 2000: 55, 4000: 60, 8000: 65 } as ThresholdMap,
    left: { 125: 40, 250: 45, 500: 50, 1000: 50, 2000: 55, 4000: 60, 8000: 60 } as ThresholdMap,
    history: { tinnitus: false, vertigo: false, noiseExposure: false, earInfection: false, familyHistory: true, ototoxicDrugs: false },
  },
];
