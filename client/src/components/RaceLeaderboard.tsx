import React, { useMemo } from 'react';
import { useGameStore, RacerProgress } from '../store/useGameStore';

/** Sort racers by finish status → nodeIndex → zPos */
function sortRacers(progress: Record<string, RacerProgress>): RacerProgress[] {
  return Object.values(progress).sort((a, b) => {
    // Finished racers bubble to top (by finish time)
    if (a.finished && b.finished) {
      return (a.finishTime ?? 0) - (b.finishTime ?? 0);
    }
    if (a.finished) return -1;
    if (b.finished) return 1;
    // Active: sort by furthest node then by Z position
    if (b.nodeIndex !== a.nodeIndex) return b.nodeIndex - a.nodeIndex;
    return b.zPos - a.zPos;
  });
}

export const RaceLeaderboard: React.FC = () => {
  const phase = useGameStore((state) => state.phase);
  const racerProgress = useGameStore((state) => state.racerProgress);
  const playerName = useGameStore((state) => state.playerName);

  const sorted = useMemo(() => sortRacers(racerProgress), [racerProgress]);

  if (phase === 'MENU') return null;

  // Hide when no data yet
  if (sorted.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '72px',
        right: '16px',
        width: '210px',
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(14px)',
          border: '1.5px solid rgba(0,229,255,0.25)',
          borderRadius: '14px 14px 0 0',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <span style={{ fontSize: '1rem' }}>🏁</span>
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: 'rgba(255,255,255,0.85)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Standings
        </span>
      </div>

      {/* Rows */}
      <div
        style={{
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(12px)',
          border: '1.5px solid rgba(0,229,255,0.15)',
          borderTop: 'none',
          borderRadius: '0 0 14px 14px',
          overflow: 'hidden',
        }}
      >
        {sorted.slice(0, 10).map((racer, idx) => {
          const isPlayer = racer.id === 'player';
          const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null;

          return (
            <div
              key={racer.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 12px',
                background: isPlayer
                  ? 'linear-gradient(90deg, rgba(0,229,255,0.14), rgba(0,229,255,0.04))'
                  : idx % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent',
                borderLeft: isPlayer ? '2.5px solid var(--secondary)' : '2.5px solid transparent',
                transition: 'background 0.3s ease',
              }}
            >
              {/* Position number */}
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 900,
                  color: isPlayer ? 'var(--secondary)' : 'rgba(255,255,255,0.4)',
                  minWidth: '16px',
                  textAlign: 'right',
                }}
              >
                {medal || `${idx + 1}.`}
              </span>

              {/* Name */}
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: isPlayer ? 800 : 600,
                  color: isPlayer ? 'var(--secondary)' : 'rgba(255,255,255,0.8)',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {racer.name}
                {isPlayer && (
                  <span
                    style={{
                      fontSize: '0.6rem',
                      color: 'rgba(0,229,255,0.55)',
                      marginLeft: '4px',
                      fontWeight: 600,
                    }}
                  >
                    (you)
                  </span>
                )}
              </span>

              {/* Finish badge */}
              {racer.finished && (
                <span style={{ fontSize: '0.75rem' }}>✅</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
