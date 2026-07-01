import { useGameStore } from '../store/useGameStore';

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // Music sequencer states
  private sequencerIntervalId: number | null = null;
  private currentStep = 0;
  private isMusicPlaying = false;
  private bpm = 120;

  // Melody & Bass notes for 8-bit chiptune loop (C Major / A Minor progression)
  // Bass loop frequencies (C3, G2, A2, F2)
  private bassProgression = [130.81, 98.00, 110.00, 87.31];
  
  // Happy melody notes frequencies (C4, D4, E4, G4, A4, C5, D5, E5)
  private melodyScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
  
  // Melody pattern sequence steps (note indices in scale, -1 means rest/no note)
  private melodyPattern = [
    0, -1, 2, -1, 3, 2, 4, -1,
    5, -1, 4, 3, 2, -1, 0, -1,
    4, -1, 6, -1, 7, 6, 5, -1,
    3, 4, 5, 3, 2, -1, 0, -1
  ];

  constructor() {
    // Listen to changes in the game store to adjust volumes dynamically
    useGameStore.subscribe((state) => {
      this.updateVolumes(state);
    });
  }

  private init() {
    if (this.ctx) return;
    
    // Create AudioContext (safely handling browser flags)
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();
    
    // Set up master routing nodes
    this.masterGain = this.ctx.createGain();
    this.musicGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();

    this.masterGain.connect(this.ctx.destination);
    this.musicGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);

    // Initial volumes load from game store state
    const state = useGameStore.getState();
    this.updateVolumes(state);
  }

  private updateVolumes(state: any) {
    if (!this.ctx) return;

    const master = state.masterVolume;
    const music = state.musicMuted ? 0 : state.musicVolume;
    const sfx = state.sfxMuted ? 0 : state.sfxVolume;

    if (this.masterGain) this.masterGain.gain.setValueAtTime(master, this.ctx.currentTime);
    if (this.musicGain) this.musicGain.gain.setValueAtTime(music, this.ctx.currentTime);
    if (this.sfxGain) this.sfxGain.gain.setValueAtTime(sfx * 0.8, this.ctx.currentTime); // slightly damp sfx to make it soft
  }

  private resumeContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- BACKGROUND MUSIC CHIPTUNE LOOP ---
  public startMusic() {
    this.resumeContext();
    if (this.isMusicPlaying || !this.ctx) return;

    this.isMusicPlaying = true;
    this.currentStep = 0;
    
    const stepDuration = 60 / this.bpm / 2; // 8th notes (BPM / 120 steps/s)
    let nextNoteTime = this.ctx.currentTime;

    const scheduler = () => {
      while (nextNoteTime < this.ctx!.currentTime + 0.1) {
        this.scheduleSequencerStep(this.currentStep, nextNoteTime);
        nextNoteTime += stepDuration;
        this.currentStep = (this.currentStep + 1) % 32;
      }
    };

    // Poll scheduler
    this.sequencerIntervalId = window.setInterval(scheduler, 25);
  }

  public stopMusic() {
    if (this.sequencerIntervalId) {
      clearInterval(this.sequencerIntervalId);
      this.sequencerIntervalId = null;
    }
    this.isMusicPlaying = false;
  }

  private scheduleSequencerStep(step: number, time: number) {
    if (!this.ctx || !this.musicGain) return;

    // --- BASS TRACK --- (triangle wave, play on quarter notes)
    if (step % 2 === 0) {
      const progressionIdx = Math.floor(step / 8) % 4;
      const baseFreq = this.bassProgression[progressionIdx];
      
      const bassOsc = this.ctx.createOscillator();
      const bassEnv = this.ctx.createGain();

      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(baseFreq, time);

      // Bass envelope (plucky thud)
      bassEnv.gain.setValueAtTime(0.32, time);
      bassEnv.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

      bassOsc.connect(bassEnv);
      bassEnv.connect(this.musicGain);

      bassOsc.start(time);
      bassOsc.stop(time + 0.22);
    }

    // --- LEAD MELODY TRACK --- (retro plucky square wave)
    const melodyNoteIdx = this.melodyPattern[step];
    if (melodyNoteIdx !== undefined && melodyNoteIdx !== -1) {
      const melodyFreq = this.melodyScale[melodyNoteIdx];

      const leadOsc = this.ctx.createOscillator();
      const leadEnv = this.ctx.createGain();

      leadOsc.type = 'square';
      leadOsc.frequency.setValueAtTime(melodyFreq, time);

      // Lead envelope (plucky chime)
      leadEnv.gain.setValueAtTime(0.12, time);
      leadEnv.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

      leadOsc.connect(leadEnv);
      leadEnv.connect(this.musicGain);

      leadOsc.start(time);
      leadOsc.stop(time + 0.14);
    }
  }

  // --- SOUND EFFECTS SYNTHESIS ---

  public playClick() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.05);

    env.gain.setValueAtTime(0.15, this.ctx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(env);
    env.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  public playJump() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(550, this.ctx.currentTime + 0.15);

    env.gain.setValueAtTime(0.35, this.ctx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.connect(env);
    env.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  public playDive() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(380, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(200, this.ctx.currentTime + 0.1);
    osc.frequency.linearRampToValueAtTime(450, this.ctx.currentTime + 0.2);

    env.gain.setValueAtTime(0.3, this.ctx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

    osc.connect(env);
    env.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.23);
  }

  public playLand() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    // Synthesize low thud sound
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.1);

    env.gain.setValueAtTime(0.4, this.ctx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc.connect(env);
    env.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.11);
  }

  public playCollision() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    // Deep blunt impact noise thud
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(30, this.ctx.currentTime + 0.15);

    env.gain.setValueAtTime(0.35, this.ctx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);

    osc.connect(env);
    env.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.17);
  }

  public playCheckpoint() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    // Dual-tone chime (rising)
    const time = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const env = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, time); // C5
    osc1.frequency.setValueAtTime(659.25, time + 0.1); // E5

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, time); // G5
    osc2.frequency.setValueAtTime(987.77, time + 0.1); // B5

    env.gain.setValueAtTime(0.2, time);
    env.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

    osc1.connect(env);
    osc2.connect(env);
    env.connect(this.sfxGain);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 0.26);
    osc2.stop(time + 0.26);
  }

  public playCountdown() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime); // A4 beep

    env.gain.setValueAtTime(0.25, this.ctx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(env);
    env.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.13);
  }

  public playMatchStart() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime); // High A5 start beep

    env.gain.setValueAtTime(0.3, this.ctx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    osc.connect(env);
    env.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.36);
  }

  public playVictory() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    // Upward chiptune arpeggio
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(523.25, time);      // C5
    osc.frequency.setValueAtTime(659.25, time + 0.1);  // E5
    osc.frequency.setValueAtTime(783.99, time + 0.2);  // G5
    osc.frequency.setValueAtTime(1046.50, time + 0.3); // C6

    env.gain.setValueAtTime(0.18, time);
    env.gain.exponentialRampToValueAtTime(0.001, time + 0.6);

    osc.connect(env);
    env.connect(this.sfxGain);

    osc.start(time);
    osc.stop(time + 0.62);
  }

  public playDefeat() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    // Downward sad chime
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(349.23, time);      // F4
    osc.frequency.linearRampToValueAtTime(220.00, time + 0.4); // A3

    env.gain.setValueAtTime(0.2, time);
    env.gain.exponentialRampToValueAtTime(0.001, time + 0.55);

    osc.connect(env);
    env.connect(this.sfxGain);

    osc.start(time);
    osc.stop(time + 0.6);
  }

  public playMudSplat() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    // Low bubble splat
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.08);

    env.gain.setValueAtTime(0.28, this.ctx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(env);
    env.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
  }

  public playIceSlide() {
    this.resumeContext();
    if (!this.ctx || !this.sfxGain) return;

    // High swishing sine wave
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(550, this.ctx.currentTime + 0.1);

    env.gain.setValueAtTime(0.06, this.ctx.currentTime);
    env.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc.connect(env);
    env.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.11);
  }
}

export const audioManager = new AudioManager();
