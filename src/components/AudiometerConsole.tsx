import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Ear, Frequency, HearingType, STANDARD_FREQUENCIES, ThresholdMap } from '../types/audiometry';
import { audioEngine } from '../utils/audioEngine';
import { Volume2, VolumeX, Play, RotateCcw, Check, ArrowRight, ArrowLeft, Headphones, Zap, AlertTriangle, Stethoscope } from 'lucide-react';

interface AudiometerConsoleProps {
  rightThresholds: ThresholdMap;
  leftThresholds: ThresholdMap;
  onUpdateThreshold: (ear: Ear, freq: Frequency, db: number | null) => void;
  onClearAll: () => void;
  selectedEar: Ear;
  setSelectedEar: (ear: Ear) => void;
  hearingType?: HearingType;
  onHearingTypeChange?: (type: HearingType) => void;
}

export const AudiometerConsole: React.FC<AudiometerConsoleProps> = ({
  rightThresholds,
  leftThresholds,
  onUpdateThreshold,
  onClearAll,
  selectedEar,
  setSelectedEar,
  hearingType = 'sensorineural',
  onHearingTypeChange,
}) => {
  const [currentFreq, setCurrentFreq] = useState<Frequency>(1000);
  const [currentDb, setCurrentDb] = useState<number>(30); // Default comfortable start
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [toneMode, setToneMode] = useState<'pulse' | 'continuous'>('pulse');

  // Automated test state
  const [isAutoTesting, setIsAutoTesting] = useState<boolean>(false);
  const [autoStep, setAutoStep] = useState<number>(0);
  const [autoStatusText, setAutoStatusText] = useState<string>('');
  const [autoWaitingResponse, setAutoWaitingResponse] = useState<boolean>(false);
  const [autoAscentHits, setAutoAscentHits] = useState<number>(0);
  const [lastDirection, setLastDirection] = useState<'down' | 'up'>('down');

  // Sequence of frequencies for clinical test (1kHz first, then high freqs, then low freqs)
  const testFreqSequence: Frequency[] = [1000, 2000, 4000, 8000, 500, 250];

  const handleStartTone = useCallback(() => {
    setIsPlaying(true);
    if (toneMode === 'pulse') {
      audioEngine.playPulsedTone(currentFreq, currentDb, selectedEar, 3, () => {
        setIsPlaying(false);
      });
    } else {
      audioEngine.startTone(currentFreq, currentDb, selectedEar);
    }
  }, [currentFreq, currentDb, selectedEar, toneMode]);

  const handleStopTone = useCallback(() => {
    audioEngine.stopTone();
    setIsPlaying(false);
  }, []);

  // Keyboard shortcut: Spacebar presents tone
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space' && !e.repeat && !isAutoTesting) {
        e.preventDefault();
        handleStartTone();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space' && toneMode === 'continuous' && !isAutoTesting) {
        e.preventDefault();
        handleStopTone();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleStartTone, handleStopTone, toneMode, isAutoTesting]);

  const handleSetThreshold = () => {
    onUpdateThreshold(selectedEar, currentFreq, currentDb);
  };

  const handleRemoveThreshold = () => {
    onUpdateThreshold(selectedEar, currentFreq, null);
  };

  // Adjust dB
  const stepDb = (amount: number) => {
    setCurrentDb((prev) => Math.max(-10, Math.min(100, prev + amount)));
  };

  // Automated test logic: Hughson-Westlake (Down 10 dB, Up 5 dB)
  const startAutoTest = () => {
    setIsAutoTesting(true);
    setSelectedEar('right');
    setCurrentFreq(1000);
    setCurrentDb(40);
    setAutoStep(0);
    setAutoAscentHits(0);
    setAutoStatusText('گوش راست - فرکانس ۱۰۰۰ هرتز. در حال پخش صدای آزمایشی...');
    setAutoWaitingResponse(false);

    // Play tone after 800ms
    setTimeout(() => {
      presentAutoTone(1000, 40, 'right');
    }, 800);
  };

  const presentAutoTone = (freq: Frequency, db: number, ear: Ear) => {
    setIsPlaying(true);
    setAutoWaitingResponse(false);
    audioEngine.playPulsedTone(freq, db, ear, 3, () => {
      setIsPlaying(false);
      setAutoWaitingResponse(true);
      setAutoStatusText(`آیا صدای بوق را در گوش ${ear === 'right' ? 'راست' : 'چپ'} شنیدید؟`);
    });
  };

  const handleAutoResponse = (heard: boolean) => {
    setAutoWaitingResponse(false);
    let nextDb = currentDb;
    let nextHits = autoAscentHits;

    if (heard) {
      // Down 10 dB
      nextDb = Math.max(-10, currentDb - 10);
      setLastDirection('down');
      setCurrentDb(nextDb);
      setAutoStatusText('صدا شنیده شد؛ شدت ۱۰ دسی‌بل کاهش یافت.');
    } else {
      // Up 5 dB
      nextDb = Math.min(100, currentDb + 5);
      if (lastDirection === 'up') {
        nextHits += 1;
      }
      setLastDirection('up');
      setCurrentDb(nextDb);
      setAutoStatusText('صدا شنیده نشد؛ شدت ۵ دسی‌بل افزایش یافت.');
    }

    // Check if threshold reached (e.g. 2 hits on ascent, or reached low bound -10 heard twice)
    if (nextHits >= 2 || (heard && nextDb <= 0)) {
      // Found threshold for current frequency!
      const thresholdVal = heard ? nextDb : nextDb - 5;
      onUpdateThreshold(selectedEar, currentFreq, thresholdVal);
      setAutoStatusText(`✓ آستانه فرکانس ${currentFreq} هرتز برابر با ${thresholdVal} dB ثبت شد.`);

      // Advance frequency
      const nextStepIndex = autoStep + 1;
      if (nextStepIndex < testFreqSequence.length) {
        const nextF = testFreqSequence[nextStepIndex];
        setAutoStep(nextStepIndex);
        setCurrentFreq(nextF);
        setCurrentDb(40);
        setAutoAscentHits(0);
        setTimeout(() => {
          presentAutoTone(nextF, 40, selectedEar);
        }, 1200);
      } else {
        // Switch to other ear if Right ear finished
        if (selectedEar === 'right') {
          setSelectedEar('left');
          setAutoStep(0);
          setCurrentFreq(testFreqSequence[0]);
          setCurrentDb(40);
          setAutoAscentHits(0);
          setAutoStatusText('آزمایش گوش راست کامل شد. انتقال به گوش چپ...');
          setTimeout(() => {
            presentAutoTone(testFreqSequence[0], 40, 'left');
          }, 1800);
        } else {
          // Both ears finished
          setIsAutoTesting(false);
          setAutoStatusText('🎉 تست خودکار هر دو گوش با موفقیت به پایان رسید!');
        }
      }
    } else {
      setAutoAscentHits(nextHits);
      setTimeout(() => {
        presentAutoTone(currentFreq, nextDb, selectedEar);
      }, 700);
    }
  };

  const cancelAutoTest = () => {
    setIsAutoTesting(false);
    setAutoWaitingResponse(false);
    audioEngine.stopTone();
    setIsPlaying(false);
  };

  const currentThresholds = selectedEar === 'right' ? rightThresholds : leftThresholds;
  const recordedVal = currentThresholds[currentFreq];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">کنسول شبیه‌ساز ادیومتر بالینی</h2>
            <p className="text-xs text-slate-500">کنترل دقیق فرکانس و شدت صوت با خروجی استریو و استانداردهای PTA</p>
          </div>
        </div>

        {/* Ear Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setSelectedEar('right')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-md transition-all ${
              selectedEar === 'right'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-red-700'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white inline-block"></span>
            گوش راست (قرمز - O)
          </button>
          <button
            onClick={() => setSelectedEar('left')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-md transition-all ${
              selectedEar === 'left'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-blue-700'
            }`}
          >
            <span className="w-2.5 h-2.5 bg-white inline-block"></span>
            گوش چپ (آبی - X)
          </button>
        </div>
      </div>

      {/* Diagnostic Hearing Type Selector */}
      {onHearingTypeChange && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 mb-4 bg-slate-50 border border-slate-200 rounded-lg text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
            <span>نوع پاتولوژی کم‌شنوایی (جهت تولید خودکار توصیه‌های درمانی):</span>
          </div>
          <div className="inline-flex rounded-lg bg-slate-200 p-0.5">
            {[
              { type: 'sensorineural', label: 'حسی-عصبی' },
              { type: 'conductive', label: 'هدایتی (گوش میانی)' },
              { type: 'mixed', label: 'مختلط' },
              { type: 'normal', label: 'طبیعی' },
            ].map(({ type, label }) => (
              <button
                key={type}
                onClick={() => onHearingTypeChange(type as HearingType)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  hearingType === type
                    ? 'bg-white text-teal-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Automated Testing Banner / Runner */}
      {isAutoTesting ? (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-5 mb-6 text-center animate-fadeIn">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800">
              <Zap className="w-4 h-4 text-teal-600" />
              تست خودکار و هدایت‌شده (Automated Audiometry)
            </span>
            <button
              onClick={cancelAutoTest}
              className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded bg-white border border-red-200"
            >
              انصراف از تست خودکار
            </button>
          </div>

          <div className="my-3">
            <div className="text-lg font-bold text-slate-900 mb-1">
              گوش {selectedEar === 'right' ? 'راست' : 'چپ'} · فرکانس {currentFreq} هرتز · شدت {currentDb} dB HL
            </div>
            <p className="text-sm text-slate-700 font-medium">{autoStatusText}</p>
          </div>

          {/* Sound animation */}
          {isPlaying && (
            <div className="flex justify-center items-center gap-1 my-3 text-teal-600">
              <span className="w-1.5 h-6 bg-teal-600 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-10 bg-teal-600 rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-7 bg-teal-600 rounded-full animate-bounce delay-150"></span>
              <span className="w-1.5 h-4 bg-teal-600 rounded-full animate-bounce delay-200"></span>
              <span className="text-xs font-medium mr-2">در حال پخش صدا در هدفون...</span>
            </div>
          )}

          {/* Response Buttons */}
          {autoWaitingResponse && (
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => handleAutoResponse(true)}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 shadow-md transition-transform active:scale-95"
              >
                <Check className="w-5 h-5" />
                بله، صدا را شنیدم
              </button>
              <button
                onClick={() => handleAutoResponse(false)}
                className="flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-xl font-bold text-sm hover:bg-slate-800 shadow-md transition-transform active:scale-95"
              >
                <VolumeX className="w-5 h-5" />
                خیر، صدایی نشنیدم
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-semibold text-slate-800">
              می‌توانید آزمایش را خودکار یا به صورت دستی انجام دهید:
            </span>
          </div>
          <button
            onClick={startAutoTest}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            شروع تست خودکار گام‌به‌گام (Hughson-Westlake)
          </button>
        </div>
      )}

      {/* Manual Audiometer Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Frequency Panel */}
        <div className="lg:col-span-5 flex flex-col justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                انتخاب فرکانس (Hz)
              </label>
              <span className="text-xs font-mono font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded">
                {currentFreq} Hz
              </span>
            </div>

            {/* Frequency Selection Buttons */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 mb-4">
              {STANDARD_FREQUENCIES.map((freq) => {
                const isSelected = currentFreq === freq;
                const hasValue = currentThresholds[freq] !== null;

                return (
                  <button
                    key={`freq-btn-${freq}`}
                    onClick={() => setCurrentFreq(freq)}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border text-xs transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-xs'
                        : hasValue
                        ? 'bg-white border-teal-300 text-teal-900 font-semibold hover:border-teal-400'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-mono">{freq >= 1000 ? `${freq / 1000}k` : freq}</span>
                    {hasValue && (
                      <span className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-teal-300' : 'text-teal-600'}`}>
                        {currentThresholds[freq]}dB
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tone Presentation Mode */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">حالت ارائه تن:</span>
            <div className="inline-flex rounded-md bg-slate-200 p-0.5">
              <button
                onClick={() => setToneMode('pulse')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  toneMode === 'pulse' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
                }`}
              >
                پالس ۳ تایی (استاندارد)
              </button>
              <button
                onClick={() => setToneMode('continuous')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  toneMode === 'continuous' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
                }`}
              >
                پیوسته (ممتد)
              </button>
            </div>
          </div>
        </div>

        {/* Intensity Panel (dB HL) */}
        <div className="lg:col-span-7 flex flex-col justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  شدت صوت (dB HL)
                </label>
                {currentDb >= 85 && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    شدت بالا
                  </span>
                )}
              </div>
              <div className="text-xl font-bold font-mono text-slate-900">
                {currentDb} <span className="text-xs text-slate-500 font-sans font-normal">dB HL</span>
              </div>
            </div>

            {/* Slider */}
            <div className="my-4">
              <input
                type="range"
                min="-10"
                max="100"
                step="5"
                value={currentDb}
                onChange={(e) => setCurrentDb(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                <span>-10 dB (خیلی ضعیف)</span>
                <span>20 dB (طبیعی)</span>
                <span>50 dB (گفتار)</span>
                <span>80 dB (بلند)</span>
                <span>100 dB (حداکثر)</span>
              </div>
            </div>

            {/* Stepper Buttons */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => stepDb(-10)}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100"
              >
                -10 dB
              </button>
              <button
                onClick={() => stepDb(-5)}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100"
              >
                -5 dB
              </button>
              <span className="w-px h-6 bg-slate-300 mx-1"></span>
              <button
                onClick={() => stepDb(5)}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100"
              >
                +5 dB
              </button>
              <button
                onClick={() => stepDb(10)}
                className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100"
              >
                +10 dB
              </button>
            </div>
          </div>

          {/* Audio Presentation & Action Triggers */}
          <div className="pt-4 mt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {toneMode === 'pulse' ? (
                <button
                  onClick={handleStartTone}
                  disabled={isPlaying}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-xs transition-all shadow-sm ${
                    isPlaying
                      ? 'bg-amber-500 text-white animate-pulse'
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  {isPlaying ? 'در حال پخش بوق...' : 'ارائه صوت (۳ بوق)'}
                </button>
              ) : (
                <button
                  onMouseDown={handleStartTone}
                  onMouseUp={handleStopTone}
                  onTouchStart={handleStartTone}
                  onTouchEnd={handleStopTone}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-xs transition-all shadow-sm ${
                    isPlaying
                      ? 'bg-amber-500 text-white'
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  {isPlaying ? 'در حال پخش (کلید را رها کنید)' : 'پخش ممتد (نگه دارید)'}
                </button>
              )}

              <span className="text-[11px] text-slate-500 hidden sm:inline">
                یا فشردن کلید <kbd className="px-1.5 py-0.5 bg-slate-200 rounded font-mono text-slate-700">Space</kbd>
              </span>
            </div>

            {/* Set Threshold Button */}
            <div className="flex items-center gap-2">
              {recordedVal !== null && (
                <button
                  onClick={handleRemoveThreshold}
                  title="حذف آستانه ثبت‌شده این فرکانس"
                  className="px-2.5 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200"
                >
                  حذف آستانه
                </button>
              )}

              <button
                onClick={handleSetThreshold}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
              >
                <Check className="w-3.5 h-3.5 text-teal-400" />
                <span>ثبت آستانه ({currentDb} dB)</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Threshold Overview Table */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700">جدول آستانه‌های ثبت‌شده فعلی:</span>
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-600 font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            پاکسازی تمام آستانه‌ها
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="py-2 px-3 text-right font-semibold">فرکانس (Hz)</th>
                {STANDARD_FREQUENCIES.map((f) => (
                  <th key={`th-${f}`} className="py-2 px-2 font-mono font-medium">
                    {f}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Right Ear */}
              <tr className="border-b border-slate-100 bg-red-50/40">
                <td className="py-2 px-3 text-right font-bold text-red-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span>
                  گوش راست (R)
                </td>
                {STANDARD_FREQUENCIES.map((f) => (
                  <td key={`r-td-${f}`} className="py-2 px-2 font-mono font-bold text-red-900">
                    {rightThresholds[f] !== null ? `${rightThresholds[f]} dB` : '—'}
                  </td>
                ))}
              </tr>
              {/* Left Ear */}
              <tr className="bg-blue-50/40">
                <td className="py-2 px-3 text-right font-bold text-blue-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-blue-600 inline-block"></span>
                  گوش چپ (L)
                </td>
                {STANDARD_FREQUENCIES.map((f) => (
                  <td key={`l-td-${f}`} className="py-2 px-2 font-mono font-bold text-blue-900">
                    {leftThresholds[f] !== null ? `${leftThresholds[f]} dB` : '—'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
