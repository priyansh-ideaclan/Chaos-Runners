import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Timer, Trophy, RotateCcw, Home, HelpCircle } from 'lucide-react';

export const HUD: React.FC = () => {
  const { phase, timeElapsed, tick, resetGame, setPhase, wins } = useGameStore();
  const [fps, setFps] = useState(60);

  // Tick the stopwatch if playing
  useEffect(() => {
    if (phase !== 'PLAYING') return;

    const interval = setInterval(() => {
      tick();
    }, 50); // 20hz update for stopwatch is plenty precise and friendly to react render cycles

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
          {/* Timer card */}
          <div className="glass-panel" style={{
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '2px solid rgba(255, 255, 255, 0.1)',
          }}>
            <Timer size={20} color="var(--secondary)" />
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>Time Elapsed</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'monospace', color: 'white' }}>{formattedTime}s</div>
            </div>
          </div>

          {/* Qualification Indicator & Stats */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="glass-panel" style={{
              padding: '12px 20px',
              textAlign: 'right',
              border: '2px solid var(--primary)',
              boxShadow: '0 0 10px var(--primary-glow)',
            }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 800 }}>Qualified</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white' }}>0 / 1</div>
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
              <div>PING: <span style={{ color: 'var(--secondary)', fontWeight: 800 }}>12ms</span></div>
              <div>FPS: <span style={{ color: 'var(--yellow)', fontWeight: 800 }}>{fps}</span></div>
            </div>
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
              <h2 className="neon-text-cyan" style={{ fontSize: '2.5rem', margin: '0 0 8px 0', fontWeight: 900 }}>
                QUALIFIED!
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', margin: '0 0 24px 0' }}>
                You beat the course in <strong style={{ color: '#fff' }}>{formattedTime}</strong> seconds!
              </p>
            </>
          ) : (
            <>
              <h2 className="neon-text-pink" style={{ fontSize: '2.5rem', margin: '0 0 8px 0', fontWeight: 900 }}>
                ELIMINATED!
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', margin: '0 0 24px 0' }}>
                You fell behind the time limit or was knocked off the map!
              </p>
            </>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="btn-primary" onClick={resetGame} style={{ width: '100%', justifyContent: 'center' }}>
              <RotateCcw size={18} />
              Run Again
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
            Reset Level
          </button>
        </div>
      )}
    </div>
  );
};
