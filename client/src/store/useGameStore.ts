import { create } from 'zustand';

export type GamePhase = 'MENU' | 'PLAYING' | 'QUALIFIED' | 'GAMEOVER';

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
  
  // Actions
  setPhase: (phase: GamePhase) => void;
  startGame: () => void;
  resetGame: () => void;
  passCheckpoint: (position: [number, number, number]) => void;
  updateCustomization: (customization: Partial<PlayerCustomization>) => void;
  triggerWin: () => void;
  triggerLoss: () => void;
  tick: () => void;
}

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

  setPhase: (phase) => set({ phase }),

  startGame: () => set({
    phase: 'PLAYING',
    startTime: Date.now(),
    timeElapsed: 0,
    lastCheckpoint: [0, 4, 0], // Starting spawn coordinate
  }),

  resetGame: () => set({
    phase: 'PLAYING',
    startTime: Date.now(),
    timeElapsed: 0,
    lastCheckpoint: [0, 4, 0],
  }),

  passCheckpoint: (position) => {
    // Only update if checkpoint is different to avoid redundant updates
    const current = get().lastCheckpoint;
    if (!current || current[0] !== position[0] || current[2] !== position[2]) {
      set({ lastCheckpoint: position });
    }
  },

  updateCustomization: (customization) => set((state) => ({
    customization: { ...state.customization, ...customization }
  })),

  triggerWin: () => set((state) => {
    if (state.phase !== 'PLAYING') return {};
    return {
      phase: 'QUALIFIED',
      wins: state.wins + 1,
    };
  }),

  triggerLoss: () => set((state) => {
    if (state.phase !== 'PLAYING') return {};
    return {
      phase: 'GAMEOVER',
      failures: state.failures + 1,
    };
  }),

  tick: () => {
    const { startTime, phase } = get();
    if (phase === 'PLAYING' && startTime) {
      set({ timeElapsed: (Date.now() - startTime) / 1000 });
    }
  }
}));
