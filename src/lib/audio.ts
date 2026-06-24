/**
 * Web Audio API synthesizer for guided breathing relaxation
 * Implements a responsive background drone that swells and recedes with cycles,
 * and a meditative Tibetan-style singing bowl chime for stage transitions.
 */

export class BreathingAudioEngine {
  private ctx: AudioContext | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private lfo: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private mainGain: GainNode | null = null;
  private isDroneRunning = false;

  constructor() {}

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  /**
   * Plays a beautiful meditative brass singing bowl chime.
   * Leverages additive harmonic synthesis with exponential decay.
   */
  playChime(frequency = 293.66) { // D4 - deeply grounding
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      
      // Tibetan singing bowl frequency signature has key non-integer harmonics
      // fundamental (1.0), gentle octave (2.0), secondary hums and overtones
      const partials = [
        { ratio: 1.0, gain: 0.35, decay: 2.8 },
        { ratio: 1.5, gain: 0.18, decay: 2.2 },
        { ratio: 2.0, gain: 0.15, decay: 1.6 },
        { ratio: 2.7, gain: 0.08, decay: 1.0 },
        { ratio: 3.14, gain: 0.06, decay: 0.8 },
        { ratio: 4.2, gain: 0.04, decay: 0.5 }
      ];

      // Master chime mix gain with a soft entry and exponential release
      const chimeMix = this.ctx.createGain();
      chimeMix.gain.setValueAtTime(0, now);
      chimeMix.gain.linearRampToValueAtTime(0.3, now + 0.02);
      chimeMix.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);
      chimeMix.connect(this.ctx.destination);

      partials.forEach((partial) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(frequency * partial.ratio, now);

        // Individual partial envelope
        oscGain.gain.setValueAtTime(0, now);
        oscGain.gain.linearRampToValueAtTime(partial.gain, now + 0.01);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + partial.decay);

        osc.connect(oscGain);
        oscGain.connect(chimeMix);
        
        osc.start(now);
        osc.stop(now + 3.2);
      });
    } catch (e) {
      console.warn("[THERA Audio] Failed to play chime:", e);
    }
  }

  /**
   * Starts a deep, continuous ambient background drone simulating ocean wave expansion.
   */
  startDrone() {
    try {
      this.initContext();
      if (!this.ctx || this.isDroneRunning) return;

      const now = this.ctx.currentTime;

      // Master drone gain node with slow, warm fade-in
      this.mainGain = this.ctx.createGain();
      this.mainGain.gain.setValueAtTime(0, now);
      this.mainGain.gain.linearRampToValueAtTime(0.08, now + 2.0);

      // Warm resonant lowpass filter
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = "lowpass";
      this.filter.frequency.setValueAtTime(180, now);
      this.filter.Q.setValueAtTime(2.5, now);

      // Deep grounding frequencies: Earth Frequency/OM 136.1Hz triangle voice & 204.15Hz sine fifth
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = "triangle";
      this.droneOsc1.frequency.setValueAtTime(136.1, now);

      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = "sine";
      this.droneOsc2.frequency.setValueAtTime(204.15, now);

      // Subtle LFO to add minor drifting warmth
      this.lfo = this.ctx.createOscillator();
      this.lfo.type = "sine";
      this.lfo.frequency.setValueAtTime(0.12, now); // ~8s cycle

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(50, now);

      this.lfo.connect(lfoGain);
      lfoGain.connect(this.filter.frequency);

      // Connect grounding oscillators
      const oscGain1 = this.ctx.createGain();
      oscGain1.gain.setValueAtTime(0.45, now);
      this.droneOsc1.connect(oscGain1);
      oscGain1.connect(this.filter);

      const oscGain2 = this.ctx.createGain();
      oscGain2.gain.setValueAtTime(0.25, now);
      this.droneOsc2.connect(oscGain2);
      oscGain2.connect(this.filter);

      this.filter.connect(this.mainGain);
      this.mainGain.connect(this.ctx.destination);

      // Ignite oscillators
      this.droneOsc1.start(now);
      this.droneOsc2.start(now);
      this.lfo.start(now);

      this.isDroneRunning = true;
    } catch (e) {
      console.warn("[THERA Audio] Failed to start ambient drone:", e);
    }
  }

  /**
   * Dynamically alters the audio space to match the physical cycle state.
   */
  setStage(stage: "Ready" | "Inhale" | "Hold" | "Exhale" | "Hold (Out)", durationSeconds: number) {
    if (!this.ctx || !this.isDroneRunning || !this.filter || !this.mainGain) return;

    try {
      const now = this.ctx.currentTime;
      const transTime = Math.max(1.0, durationSeconds - 0.5);

      // Cancel previous timeline entries to prevent conflicts
      this.filter.frequency.cancelScheduledValues(now);
      this.mainGain.gain.cancelScheduledValues(now);

      // Current values as baseline
      this.filter.frequency.setValueAtTime(this.filter.frequency.value, now);
      this.mainGain.gain.setValueAtTime(this.mainGain.gain.value, now);

      switch (stage) {
        case "Inhale":
          // Inhale swells the volume and sweeps the filter high to denote expansion
          this.filter.frequency.exponentialRampToValueAtTime(420, now + transTime);
          this.mainGain.gain.linearRampToValueAtTime(0.16, now + transTime);
          break;
        case "Hold":
          // Hold retains a warm, high-pass stillness
          this.filter.frequency.exponentialRampToValueAtTime(260, now + transTime);
          this.mainGain.gain.linearRampToValueAtTime(0.12, now + transTime);
          break;
        case "Exhale":
          // Exhale clears the frequency down to a base release wave
          this.filter.frequency.exponentialRampToValueAtTime(130, now + transTime);
          this.mainGain.gain.linearRampToValueAtTime(0.06, now + transTime);
          break;
        case "Hold (Out)":
          // Empty hold is a silent, very low grounding hum
          this.filter.frequency.exponentialRampToValueAtTime(100, now + transTime);
          this.mainGain.gain.linearRampToValueAtTime(0.04, now + transTime);
          break;
        default:
          // Default baseline
          this.filter.frequency.exponentialRampToValueAtTime(180, now + 1.0);
          this.mainGain.gain.linearRampToValueAtTime(0.08, now + 1.0);
          break;
      }
    } catch (e) {
      console.warn("[THERA Audio] Error adjusting stage in audio engine:", e);
    }
  }

  /**
   * Safely fades out and shuts down the synthesis network to avoid popping clicks.
   */
  stopDrone() {
    if (!this.isDroneRunning) return;

    try {
      const now = this.ctx ? this.ctx.currentTime : 0;
      if (this.mainGain && this.ctx) {
        this.mainGain.gain.cancelScheduledValues(now);
        this.mainGain.gain.setValueAtTime(this.mainGain.gain.value, now);
        this.mainGain.gain.linearRampToValueAtTime(0.0, now + 1.0);
      }

      setTimeout(() => {
        try {
          if (this.droneOsc1) { this.droneOsc1.stop(); this.droneOsc1.disconnect(); }
          if (this.droneOsc2) { this.droneOsc2.stop(); this.droneOsc2.disconnect(); }
          if (this.lfo) { this.lfo.stop(); this.lfo.disconnect(); }
          if (this.filter) this.filter.disconnect();
          if (this.mainGain) this.mainGain.disconnect();
        } catch (err) {
          // Ignore offline errors
        }

        this.droneOsc1 = null;
        this.droneOsc2 = null;
        this.lfo = null;
        this.filter = null;
        this.mainGain = null;
        this.isDroneRunning = false;
      }, 1100);
    } catch (e) {
      console.warn("[THERA Audio] Error stopping ambient drone:", e);
      this.isDroneRunning = false;
    }
  }
}
