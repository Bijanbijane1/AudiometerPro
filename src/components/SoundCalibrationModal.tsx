import React, { useState } from 'react';
import { audioEngine } from '../utils/audioEngine';
import { Headphones, Volume2, ShieldCheck, X, Check, ArrowRight, ArrowLeft } from 'lucide-react';

interface SoundCalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoundCalibrationModal: React.FC<SoundCalibrationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [activeChannelTesting, setActiveChannelTesting] = useState<'right' | 'left' | null>(null);
  const [calibrationGain, setCalibrationGain] = useState(audioEngine.getCalibrationLevel());

  if (!isOpen) return null;

  const handleTestTone = async () => {
    await audioEngine.resumeContext();
    setIsPlayingTest(true);
    audioEngine.playCalibrationSample(() => {
      setIsPlayingTest(false);
    });
  };

  const handleChannelTest = async (channel: 'right' | 'left') => {
    await audioEngine.resumeContext();
    setActiveChannelTesting(channel);
    audioEngine.playChannelTest(channel, () => {
      setActiveChannelTesting(null);
    });
  };

  const handleGainChange = (newVal: number) => {
    setCalibrationGain(newVal);
    audioEngine.setCalibrationLevel(newVal);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn no-print">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">کالیبراسیون و بررسی هدایت هدفون</h3>
              <p className="text-[11px] text-slate-500">بررسی سلامت کانال‌های استریو و تنظیم تراز صدای مرجع</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions */}
        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-amber-900">
            <span className="font-bold block mb-1">نکات کلیدی برای دقت آزمایش:</span>
            <ul className="list-disc list-inside space-y-1">
              <li>حتماً از <strong>هدفون سیمی یا روگوشی (Over-Ear)</strong> استفاده کنید.</li>
              <li>از قرارگیری در محیط آرام و به دور از همهمه و سر و صدای محیطی اطمینان حاصل فرمایید.</li>
              <li>مطمئن شوید گوشی <strong>R</strong> روی گوش راست و گوشی <strong>L</strong> روی گوش چپ است.</li>
            </ul>
          </div>

          {/* Channel L/R Verification */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="font-bold text-slate-800 block mb-1">
              تست جهت قرارگیری هدفون (تفکیک چپ و راست):
            </label>
            <p className="text-[11px] text-slate-500 mb-2.5">
              جهت اطمینان از قرار نگرفتن وارونه هدفون، کلیدهای زیر را بزنید تا صدا فقط در گوش مربوطه پخش شود:
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => handleChannelTest('right')}
                disabled={activeChannelTesting !== null || isPlayingTest}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-bold text-xs border transition-all ${
                  activeChannelTesting === 'right'
                    ? 'bg-red-600 text-white border-red-600 animate-pulse'
                    : 'bg-white hover:bg-red-50 text-red-700 border-red-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-600 inline-block"></span>
                <span>تست گوش راست (R)</span>
              </button>

              <button
                onClick={() => handleChannelTest('left')}
                disabled={activeChannelTesting !== null || isPlayingTest}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-bold text-xs border transition-all ${
                  activeChannelTesting === 'left'
                    ? 'bg-blue-600 text-white border-blue-600 animate-pulse'
                    : 'bg-white hover:bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                <span className="w-2 h-2 bg-blue-600 inline-block"></span>
                <span>تست گوش چپ (L)</span>
              </button>
            </div>
          </div>

          {/* Volume Calibration */}
          <div>
            <label className="font-bold text-slate-800 block mb-1">
              تنظیم تراز صدای مرجع (Reference Calibration):
            </label>
            <p className="text-[11px] text-slate-500 mb-3">
              با زدن دکمه زیر، یک تن ۱۰۰۰ هرتز پخش می‌شود. ولوم دستگاه را به گونه‌ای تنظیم نمایید که صدا به صورت ملایم و راحت شنیده شود.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={handleTestTone}
                disabled={isPlayingTest || activeChannelTesting !== null}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all ${
                  isPlayingTest ? 'bg-amber-500 animate-pulse' : 'bg-teal-600 hover:bg-teal-700'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                {isPlayingTest ? 'در حال پخش صدای مرجع...' : 'پخش صدای نمونه ۱۰۰۰ هرتز'}
              </button>

              <span className="text-[11px] text-slate-500">
                (۳ بوق با شدت استاندارد ۴۵ دسی‌بل)
              </span>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-700">ضریب حساسیت خروجی (Output Gain):</span>
              <span className="font-mono font-bold text-teal-700">{Math.round(calibrationGain * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={calibrationGain}
              onChange={(e) => handleGainChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
          >
            <Check className="w-4 h-4 text-teal-400" />
            <span>تأیید و بازگشت به آزمایش</span>
          </button>
        </div>

      </div>
    </div>
  );
};
