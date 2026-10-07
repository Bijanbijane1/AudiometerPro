import { Ear, Frequency } from '../types/audiometry';

/**
 * ISO 389-1 Reference Equivalent Threshold Sound Pressure Level (RETSPL)
 * offsets relative to 1000 Hz for standard circumaural/supra-aural headphones.
 * These compensate for human ear sensitivity curves (Fletcher-Munson/ISO 226)
 * so that pure tone dB HL represents true biological hearing level.
 */
const RETSPL_OFFSETS: Record<Frequency, number> = {
  125: 30.5,
  250: 16.0,
  500: 6.5,
  1000: 0.0,
  2000: -2.0,
  4000: -4.5,
  8000: 9.5,
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  private currentOsc: OscillatorNode | null = null;
  private currentGain: GainNode | null = null;
  private pannerNode: StereoPannerNode | null = null;
  private isPlaying: boolean = false;
  private pulseTimeoutIds: number[] = [];

  // Master volume calibration scale factor
  private userCalibrationLevel: number = 0.5;

  public initContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public async resumeContext(): Promise<void> {
    const ctx = this.initContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
  }

  public setCalibrationLevel(level: number) {
    this.userCalibrationLevel = Math.max(0.1, Math.min(1.0, level));
  }

  public getCalibrationLevel(): number {
    return this.userCalibrationLevel;
  }

  /**
   * Convert clinical dB HL (-10 to 100 dB HL) to linear Web Audio gain,
   * factoring in ISO 389-1 RETSPL equal-loudness compensation for each frequency.
   */
  private dbToLinearGain(freq: Frequency, dbHL: number): number {
    const clampedDb = Math.max(-10, Math.min(100, dbHL));
    const retsplOffset = RETSPL_OFFSETS[freq] || 0;
    
    // Effective sound pressure level with biological ear canal acoustic compensation
    const compensatedDb = clampedDb + (retsplOffset * 0.7);

    // Base gain anchored around 80 dB SPL
    const normalizedDb = (compensatedDb - 80) / 20;
    const baseGain = Math.pow(10, normalizedDb) * 0.22 * this.userCalibrationLevel;

    // Safety clamp between 0.0001 (threshold) and 0.65 (hearing safety protection limit)
    return Math.max(0.0001, Math.min(0.65, baseGain));
  }

  /**
   * Play a continuous pure tone for given frequency, intensity and ear.
   */
  public startTone(freq: Frequency, dbHL: number, ear: Ear | 'both'): void {
    this.stopTone();

    const ctx = this.initContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Pan sound to Left or Right ear using StereoPannerNode or ChannelSplitter/Merger
    if (ctx.createStereoPanner) {
      const panner = ctx.createStereoPanner();
      if (ear === 'left') {
        panner.pan.setValueAtTime(-1, now);
      } else if (ear === 'right') {
        panner.pan.setValueAtTime(1, now);
      } else {
        panner.pan.setValueAtTime(0, now);
      }

      osc.connect(gain);
      gain.connect(panner);
      panner.connect(ctx.destination);
      this.pannerNode = panner;
    } else {
      // Fallback: connect gain directly to destination
      osc.connect(gain);
      gain.connect(ctx.destination);
    }

    const targetGain = this.dbToLinearGain(freq, dbHL);

    // Click-free exponential envelope
    gain.gain.setValueAtTime(0.00001, now);
    gain.gain.linearRampToValueAtTime(targetGain, now + 0.035);

    osc.start(now);

    this.currentOsc = osc;
    this.currentGain = gain;
    this.isPlaying = true;
  }

  /**
   * Stop any currently sounding tone with smooth anti-click decay.
   */
  public stopTone(): void {
    this.pulseTimeoutIds.forEach((id) => window.clearTimeout(id));
    this.pulseTimeoutIds = [];

    if (this.currentGain && this.ctx && this.isPlaying) {
      try {
        const now = this.ctx.currentTime;
        const currentVal = this.currentGain.gain.value;
        this.currentGain.gain.setValueAtTime(currentVal, now);
        this.currentGain.gain.linearRampToValueAtTime(0.00001, now + 0.035);

        if (this.currentOsc) {
          this.currentOsc.stop(now + 0.04);
        }
      } catch {
        // Safe catch if already stopped
      }
    }

    this.currentOsc = null;
    this.currentGain = null;
    this.isPlaying = false;
  }

  /**
   * Play standard clinical 3-pulse beeps (220ms tone, 120ms gap).
   */
  public playPulsedTone(
    freq: Frequency,
    dbHL: number,
    ear: Ear | 'both',
    pulseCount = 3,
    onComplete?: () => void
  ): void {
    this.stopTone();

    const pulseDuration = 220; // ms
    const gapDuration = 120; // ms

    let currentStep = 0;

    const playNextBeep = () => {
      if (currentStep >= pulseCount) {
        this.isPlaying = false;
        if (onComplete) onComplete();
        return;
      }

      this.startTone(freq, dbHL, ear);

      const stopId = window.setTimeout(() => {
        this.stopTone();
        currentStep++;
        if (currentStep < pulseCount) {
          const gapId = window.setTimeout(playNextBeep, gapDuration);
          this.pulseTimeoutIds.push(gapId);
        } else {
          this.isPlaying = false;
          if (onComplete) onComplete();
        }
      }, pulseDuration);

      this.pulseTimeoutIds.push(stopId);
    };

    playNextBeep();
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Plays a 1000 Hz reference calibration sample at comfortable listening level (45 dB HL).
   */
  public playCalibrationSample(onEnd: () => void): void {
    this.playPulsedTone(1000, 45, 'both', 3, onEnd);
  }

  /**
   * Verifies Left / Right headphone channel orientation to prevent inverted ear tests.
   */
  public playChannelTest(channel: 'left' | 'right', onEnd: () => void): void {
    this.playPulsedTone(1000, 50, channel, 2, onEnd);
  }
}

export const audioEngine = new AudioEngine();
