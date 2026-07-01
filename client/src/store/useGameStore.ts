import { create } from 'zustand';

export type GamePhase = 'MENU' | 'PLAYING' | 'QUALIFIED' | 'GAMEOVER';
export type VisualTheme = 'SKY_BLUE' | 'SUNSET_ORANGE' | 'PURPLE_NEON' | 'CANDY_LAND' | 'SPACE';

export interface PlayerCustomization {
  color: string;
  accessory: string;
}

interface GameState {
  phase: GamePhase;
  startTime: number | null;
  timeElapsed: number;
  lastCheckpoint: [number, number, number] | null;
  customization: PlayerCustomization;
  wins: number;
  failures: number;
  
  // Sequential Level & Theme states
  currentLevelIndex: number;
  maxLevelUnlocked: number;
  levelSeed: number;
  visualTheme: VisualTheme;
  qualifiedBots: string[];
  eliminatedBots: string[];
  playerQualified: boolean;
  botQualifyingLimit: number;
  
  // Audio settings (Persisted)
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  musicMuted: boolean;
  sfxMuted: boolean;
  
  // Actions
  setPhase: (phase: GamePhase) => void;
  startGame: () => void;
  resetGame: () => void;
  passCheckpoint: (position: [number, number, number]) => void;
  updateCustomization: (customization: Partial<PlayerCustomization>) => void;
  triggerWin: () => void;
  triggerLoss: () => void;
  tick: () => void;
  
  // Bot Actions
  qualifyBot: (id: string) => void;
  eliminateBot: (id: string) => void;
  
  // Level Progression Actions
  unlockNextLevel: () => void;
  selectLevel: (index: number) => void;
  
  // Audio Actions
  setVolume: (type: 'master' | 'music' | 'sfx', value: number) => void;
  toggleMute: (type: 'music' | 'sfx') => void;
}

const THEMES: VisualTheme[] = ['SKY_BLUE', 'SUNSET_ORANGE', 'PURPLE_NEON', 'CANDY_LAND', 'SPACE'];

const SPAWN_POINTS: Record<number, [number, number, number]> = {
  0: [0, 4, 0],   // Level 1: Beginner Bounds
  1: [0, 4, 0],   // Level 2: Conveyor Crossing
  2: [0, 4, 0],   // Level 3: Slippery Slopes
  3: [0, 4, 0],   // Level 4: Precise Pendulums
  4: [0, 11, 0],  // Level 5: Final Ascent (Hex grid start)
};

// Local storage parsing helpers
const getStoredNumber = (key: string, fallback: number): number => {
  const val = localStorage.getItem(key);
  return val ? parseFloat(val) : fallback;
};

const getStoredBoolean = (key: string, fallback: boolean): boolean => {
  const val = localStorage.getItem(key);
  return val ? val === 'true' : fallback;
};

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'MENU',
  startTime: null,
  timeElapsed: 0,
  lastCheckpoint: null,
  customization: {
    color: '#ff007f', // Hot Pink
    accessory: 'none',
  },
  wins: 0,
  failures: 0,

  // Level Progression defaults (persisted)
  currentLevelIndex: 0,
  maxLevelUnlocked: Math.round(getStoredNumber('chaorunners_max_unlocked', 0)),
  levelSeed: 0.5,
  visualTheme: 'SKY_BLUE',
  qualifiedBots: [],
  eliminatedBots: [],
  playerQualified: false,
  botQualifyingLimit: 5,

  // Audio settings defaults (persisted)
  masterVolume: getStoredNumber('chaorunners_vol_master', 1.0),
  musicVolume: getStoredNumber('chaorunners_vol_music', 0.6),
  sfxVolume: getStoredNumber('chaorunners_vol_sfx', 0.7),
  musicMuted: getStoredBoolean('chaorunners_mute_music', false),
  sfxMuted: getStoredBoolean('chaorunners_mute_sfx', false),

  setPhase: (phase) => set({ phase }),

  startGame: () => {
    const levelIdx = get().currentLevelIndex;
    const nextTheme = THEMES[levelIdx % THEMES.length] || 'SKY_BLUE';
    const nextSeed = Math.random();
    const spawnPoint = SPAWN_POINTS[levelIdx] || [0, 4, 0];

    set({
      phase: 'PLAYING',
      startTime: Date.now(),
      timeElapsed: 0,
      visualTheme: nextTheme,
      levelSeed: nextSeed,
      lastCheckpoint: spawnPoint,
      qualifiedBots: [],
      eliminatedBots: [],
      playerQualified: false,
    });
  },

  resetGame: () => {
    const levelIdx = get().currentLevelIndex;
    const nextTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
    const nextSeed = Math.random();
    const spawnPoint = SPAWN_POINTS[levelIdx] || [0, 4, 0];

    set({
      phase: 'PLAYING',
      startTime: Date.now(),
      timeElapsed: 0,
      visualTheme: nextTheme,
      levelSeed: nextSeed,
      lastCheckpoint: spawnPoint,
      qualifiedBots: [],
      eliminatedBots: [],
      playerQualified: false,
    });
  },

  passCheckpoint: (position) => {
    const current = get().lastCheckpoint;
    if (!current || current[0] !== position[0] || current[2] !== position[2]) {
      set({ lastCheckpoint: position });
    }
  },

  updateCustomization: (customization) => set((state) => ({
    customization: { ...state.customization, ...customization }
  })),

  triggerWin: () => {
    const { phase, currentLevelIndex, maxLevelUnlocked, wins, unlockNextLevel } = get();
    if (phase !== 'PLAYING') return;

    set({
      phase: 'QUALIFIED',
      playerQualified: true,
      wins: wins + 1,
    });

    // Check unlocking progression
    if (currentLevelIndex === maxLevelUnlocked && maxLevelUnlocked < 4) {
      unlockNextLevel();
    }
  },

  triggerLoss: () => set((state) => {
    if (state.phase !== 'PLAYING') return {};
    return {
      phase: 'GAMEOVER',
      failures: state.failures + 1,
    };
  }),

  qualifyBot: (id) => set((state) => {
    if (state.phase !== 'PLAYING') return {};
    if (state.qualifiedBots.includes(id)) return {};
    
    const nextQualified = [...state.qualifiedBots, id];
    const totalQualified = nextQualified.length + (state.playerQualified ? 1 : 0);
    const nextPhase = totalQualified >= state.botQualifyingLimit && !state.playerQualified
      ? 'GAMEOVER'
      : state.phase;

    return {
      qualifiedBots: nextQualified,
      phase: nextPhase,
      failures: nextPhase === 'GAMEOVER' ? state.failures + 1 : state.failures,
    };
  }),

  eliminateBot: (id) => set((state) => {
    if (state.phase !== 'PLAYING') return {};
    if (state.eliminatedBots.includes(id)) return {};
    
    // Hex-a-gone survival check (9 bots + 1 player = 10 total)
    const nextEliminated = [...state.eliminatedBots, id];
    
    // If all 9 bots are dead and player survives, player wins
    const nextPhase = nextEliminated.length >= 9
      ? 'QUALIFIED'
      : state.phase;

    return {
      eliminatedBots: nextEliminated,
      phase: nextPhase,
      wins: nextPhase === 'QUALIFIED' ? state.wins + 1 : state.wins,
    };
  }),

  unlockNextLevel: () => set((state) => {
    const nextMax = Math.min(4, state.maxLevelUnlocked + 1);
    localStorage.setItem('chaorunners_max_unlocked', nextMax.toString());
    return { maxLevelUnlocked: nextMax };
  }),

  selectLevel: (index) => set(() => {
    const sanitizedIndex = Math.max(0, Math.min(4, index));
    return { currentLevelIndex: sanitizedIndex };
  }),

  setVolume: (type, value) => set((state) => {
    const val = Math.max(0, Math.min(1.0, value));
    if (type === 'master') {
      localStorage.setItem('chaorunners_vol_master', val.toString());
      return { masterVolume: val };
    } else if (type === 'music') {
      localStorage.setItem('chaorunners_vol_music', val.toString());
      return { musicVolume: val };
    } else {
      localStorage.setItem('chaorunners_vol_sfx', val.toString());
      return { sfxVolume: val };
    }
  }),

  toggleMute: (type) => set((state) => {
    if (type === 'music') {
      const nextVal = !state.musicMuted;
      localStorage.setItem('chaorunners_mute_music', nextVal.toString());
      return { musicMuted: nextVal };
    } else {
      const nextVal = !state.sfxMuted;
      localStorage.setItem('chaorunners_mute_sfx', nextVal.toString());
      return { sfxMuted: nextVal };
    }
  }),

  tick: () => {
    const { startTime, phase } = get();
    if (phase === 'PLAYING' && startTime) {
      set({ timeElapsed: (Date.now() - startTime) / 1000 });
    }
  }
}));
