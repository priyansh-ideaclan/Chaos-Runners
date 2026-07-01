import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './useGameStore';

describe('useGameStore', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    const { setPhase, updateCustomization } = useGameStore.getState();
    setPhase('MENU');
    updateCustomization({ color: '#ff007f', accessory: 'none' });
    
    // Clear wins/failures for fresh checks
    useGameStore.setState({
      wins: 0,
      failures: 0,
      timeElapsed: 0,
      startTime: null,
      lastCheckpoint: null,
    });
  });

  it('should initialize with correct default state', () => {
    const state = useGameStore.getState();
    expect(state.phase).toBe('MENU');
    expect(state.timeElapsed).toBe(0);
    expect(state.wins).toBe(0);
    expect(state.failures).toBe(0);
    expect(state.customization.color).toBe('#ff007f');
    expect(state.customization.accessory).toBe('none');
  });

  it('should transition to PLAYING on startGame', () => {
    const store = useGameStore.getState();
    store.startGame();

    const state = useGameStore.getState();
    expect(state.phase).toBe('PLAYING');
    expect(state.timeElapsed).toBe(0);
    expect(state.lastCheckpoint).toEqual([0, 4, 0]);
    expect(state.startTime).not.toBeNull();
  });

  it('should update customization options', () => {
    const store = useGameStore.getState();
    store.updateCustomization({ color: '#00e5ff', accessory: 'crown' });

    const state = useGameStore.getState();
    expect(state.customization.color).toBe('#00e5ff');
    expect(state.customization.accessory).toBe('crown');
  });

  it('should update checkpoint location', () => {
    const store = useGameStore.getState();
    store.startGame();
    store.passCheckpoint([10, 2, 45]);

    const state = useGameStore.getState();
    expect(state.lastCheckpoint).toEqual([10, 2, 45]);
  });

  it('should increment wins and set phase to QUALIFIED on triggerWin', () => {
    const store = useGameStore.getState();
    store.startGame(); // must be in PLAYING phase to win
    store.triggerWin();

    const state = useGameStore.getState();
    expect(state.phase).toBe('QUALIFIED');
    expect(state.wins).toBe(1);
    expect(state.failures).toBe(0);
  });

  it('should increment failures and set phase to GAMEOVER on triggerLoss', () => {
    const store = useGameStore.getState();
    store.startGame();
    store.triggerLoss();

    const state = useGameStore.getState();
    expect(state.phase).toBe('GAMEOVER');
    expect(state.wins).toBe(0);
    expect(state.failures).toBe(1);
  });
});
