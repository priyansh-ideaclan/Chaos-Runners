import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from './useGameStore';

describe('useGameStore', () => {
  beforeEach(() => {
    const { setPhase, updateCustomization } = useGameStore.getState();
    setPhase('MENU');
    updateCustomization({ color: '#ff007f', accessory: 'none' });
    
    useGameStore.setState({
      wins: 0,
      failures: 0,
      timeElapsed: 0,
      startTime: null,
      lastCheckpoint: null,
      currentLevelIndex: 0,
      maxLevelUnlocked: 0,
      qualifiedBots: [],
      eliminatedBots: [],
      playerQualified: false,
      masterVolume: 1.0,
      musicVolume: 0.6,
      sfxVolume: 0.7,
      musicMuted: false,
      sfxMuted: false,
    });
  });

  it('should initialize with correct default state', () => {
    const state = useGameStore.getState();
    expect(state.phase).toBe('MENU');
    expect(state.timeElapsed).toBe(0);
    expect(state.wins).toBe(0);
    expect(state.failures).toBe(0);
    expect(state.currentLevelIndex).toBe(0);
    expect(state.maxLevelUnlocked).toBe(0);
  });

  it('should start game and select theme, spawn checkpoint', () => {
    const store = useGameStore.getState();
    store.startGame();

    const state = useGameStore.getState();
    expect(state.phase).toBe('PLAYING');
    expect(state.timeElapsed).toBe(0);
    expect(state.visualTheme).toBe('SKY_BLUE'); // Level 0 mapping
    expect(state.levelSeed).toBeGreaterThan(0);
    expect(state.qualifiedBots).toEqual([]);
    expect(state.playerQualified).toBe(false);
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

  it('should increment wins and phase to QUALIFIED on triggerWin, and unlock next level if matching', () => {
    const store = useGameStore.getState();
    store.startGame();
    store.triggerWin();

    const state = useGameStore.getState();
    expect(state.phase).toBe('QUALIFIED');
    expect(state.playerQualified).toBe(true);
    expect(state.wins).toBe(1);
    expect(state.maxLevelUnlocked).toBe(1); // Unlocked Level 2
  });

  it('should allow manually selecting unlocked levels', () => {
    const store = useGameStore.getState();
    store.unlockNextLevel(); // maxLevelUnlocked goes to 1
    store.selectLevel(1);

    const state = useGameStore.getState();
    expect(state.currentLevelIndex).toBe(1);
  });

  it('should adjust volume preferences', () => {
    const store = useGameStore.getState();
    store.setVolume('master', 0.5);
    store.setVolume('music', 0.25);
    store.setVolume('sfx', 0.85);

    const state = useGameStore.getState();
    expect(state.masterVolume).toBe(0.5);
    expect(state.musicVolume).toBe(0.25);
    expect(state.sfxVolume).toBe(0.85);
  });

  it('should toggle audio muting configurations', () => {
    const store = useGameStore.getState();
    store.toggleMute('music');
    store.toggleMute('sfx');

    const state = useGameStore.getState();
    expect(state.musicMuted).toBe(true);
    expect(state.sfxMuted).toBe(true);

    store.toggleMute('music');
    expect(useGameStore.getState().musicMuted).toBe(false);
  });
});
