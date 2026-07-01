import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Timer, Trophy, RotateCcw, Home, HelpCircle, Volume2, VolumeX } from 'lucide-react';

const LEVEL_NAMES: Record<number, string> = {
  0: 'Level 1: Beginner Bounds',
  1: 'Level 2: Conveyor Crossing',
  2: 'Level 3: Slippery Slopes',
  3: 'Level 4: Precise Pendulums',
  4: 'Level 5: Final Ascent',
};

export const HUD: React.FC = () => {
  const { 
    phase, 
    timeElapsed, 
    tick, 
    resetGame, 
    setPhase, 
    currentLevelIndex, 
    qualifiedBots, 
    playerQualified,
    botQualifyingLimit,
    musicMuted,
    toggleMute
  } = useGameStore();
  
  const [fps, setFps] = useState(60);

  // Tick the stopwatch if playing
  useEffect(() => {
    if (phase !== 'PLAYING') return;

    const interval = setInterval(() => {
      tick();
    }, 50);

    return () => clearInterval(interval);
  }, [phase, tick]);

  // Simple FPS counter
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const loop = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  if (phase === 'MENU') return null;

  const formattedTime = timeElapsed.toFixed(2);
  const raceQualifiedCount = qualifiedBots.length + (playerQualified ? 1 : 0);

  return (
    <div className="ui-layer">
      {/* Top HUD Row */}
      {phase === 'PLAYING' && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          pointerEvents: 'none',
        }}>
          {/* Timer & Level Title */}
          <div className="glass-panel" style={{
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            border: '2px solid rgba(255, 255, 255, 0.1)',
          }}>
            <Timer size={22} color="var(--secondary)" />
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--secondary)', letterSpacing: '0.05em' }}>
                {LEVEL_NAMES[currentLevelIndex] || 'Campaign'}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'monospace', color: 'white', lineHeight: 1.1 }}>
                {formattedTime}s
              </div>
            </div>
          </div>

          {/* Qualification Indicator & Quick Controls */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div className="glass-panel" style={{
              padding: '12px 20px',
              textAlign: 'right',
              border: '2px solid var(--primary)',
              boxShadow: '0 0 10px var(--primary-glow)',
            }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 800 }}>Qualified</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white' }}>{raceQualifiedCount} / {botQualifyingLimit}</div>
              
              {qualifiedBots.length > 0 && (
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Passed: {qualifiedBots.slice(-2).join(', ')}
                </div>
              )}
            </div>

            <div className="glass-panel" style={{
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.6)',
              gap: '2px',
              fontWeight: 600,
            }}>
              <div>BOTS: <span style={{ color: 'var(--secondary)', fontWeight: 800 }}>9 ACTIVE</span></div>
              <div>FPS: <span style={{ color: 'var(--yellow)', fontWeight: 800 }}>{fps}</span></div>
            </div>

            {/* Quick volume mute/unmute button */}
            <button
              className="ui-interactive glass-panel"
              onClick={() => toggleMute('music')}
              style={{
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '1px solid var(--glass-border)',
                background: 'var(--glass-bg)',
                height: '46px',
                boxSizing: 'border-box'
              }}
            >
              {musicMuted ? <VolumeX size={16} color="var(--primary)" /> : <Volume2 size={16} color="var(--secondary)" />}
            </button>
          </div>
        </div>
      )}

      {/* Center overlays for QUALIFIED or GAMEOVER */}
      {(phase === 'QUALIFIED' || phase === 'GAMEOVER') && (
        <div className="ui-interactive glass-panel pulse-animation" style={{
          margin: 'auto',
          maxWidth: '450px',
          width: '90%',
          padding: '40px',
          textAlign: 'center',
          boxSizing: 'border-box',
          border: phase === 'QUALIFIED' ? '2px solid var(--secondary)' : '2px solid var(--primary)',
          boxShadow: phase === 'QUALIFIED' ? '0 0 25px var(--secondary-glow)' : '0 0 25px var(--primary-glow)',
        }}>
          {phase === 'QUALIFIED' ? (
            <>
              <div style={{
                display: 'inline-flex',
                background: 'rgba(0, 229, 255, 0.1)',
                padding: '16px',
                borderRadius: '50%',
                marginBottom: '20px',
                border: '1px solid var(--secondary)',
              }}>
                <Trophy size={40} color="var(--yellow)" />
              </div>
              <h2 className="neon-text-cyan" style={{ fontSize: '2.4rem', margin: '0 0 8px 0', fontWeight: 900 }}>
                QUALIFIED!
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', margin: '0 0 24px 0' }}>
                You completed <strong style={{ color: 'var(--secondary)' }}>{LEVEL_NAMES[currentLevelIndex]}</strong> in <strong style={{ color: '#fff' }}>{formattedTime}s</strong>!
              </p>
            </>
          ) : (
            <>
              <h2 className="neon-text-pink" style={{ fontSize: '2.4rem', margin: '0 0 8px 0', fontWeight: 900 }}>
                ELIMINATED!
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', margin: '0 0 24px 0' }}>
                {raceQualifiedCount >= botQualifyingLimit 
                  ? "All qualification slots have been filled by other players!" 
                  : "You fell off the platforms or ran out of time!"}
              </p>
            </>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="btn-primary" onClick={resetGame} style={{ width: '100%', justifyContent: 'center' }}>
              <RotateCcw size={18} />
              Replay Race
            </button>
            <button className="btn-secondary" onClick={() => setPhase('MENU')} style={{ width: '100%', display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <Home size={18} />
              Lobby Menu
            </button>
          </div>
        </div>
      )}

      {/* Bottom Row Controls Cheat Sheet */}
      {phase === 'PLAYING' && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          width: '100%',
          pointerEvents: 'none',
        }}>
          {/* Controls instructions */}
          <div className="glass-panel" style={{
            padding: '14px 20px',
            fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.7)',
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            border: '1px solid var(--glass-border)',
          }}>
            <HelpCircle size={16} color="var(--secondary)" />
            <div style={{ display: 'flex', gap: '12px' }}>
              <span><strong>WASD</strong> Run</span>
              <span><strong>Space</strong> Jump</span>
              <span><strong>Shift</strong> Dive</span>
              <span><strong>E</strong> Grab</span>
              <span><strong>Mouse</strong> Look</span>
            </div>
          </div>

          {/* Reset Button */}
          <button
            className="ui-interactive btn-secondary"
            onClick={resetGame}
            style={{
              padding: '10px 16px',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 800,
            }}
          >
            <RotateCcw size={14} />
            Reset Course
          </button>
        </div>
      )}
    </div>
  );
};
