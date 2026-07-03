import React, { useEffect } from 'react';
import { useMusicStore } from '../store/useMusicStore';
import { Music } from 'lucide-react';

export const NowPlayingOverlay: React.FC = () => {
  const nowPlayingTrack = useMusicStore((state) => state.nowPlayingTrack);
  const nowPlayingVisible = useMusicStore((state) => state.nowPlayingVisible);
  const hideNowPlaying = useMusicStore((state) => state.hideNowPlaying);

  useEffect(() => {
    if (!nowPlayingVisible || !nowPlayingTrack) {
      return;
    }
    const timer = setTimeout(() => {
      hideNowPlaying();
    }, 4000); // Hide after 4 seconds
    return () => clearTimeout(timer);
  }, [nowPlayingVisible, nowPlayingTrack, hideNowPlaying]);

  if (!nowPlayingVisible || !nowPlayingTrack) return null;

  return (
    <div 
      className="now-playing-banner"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 99999,
        background: 'rgba(15, 12, 30, 0.9)',
        backdropFilter: 'blur(12px)',
        border: '2px solid var(--secondary)',
        borderRadius: '12px',
        padding: '12px 20px',
        boxShadow: '0 0 20px rgba(0, 229, 255, 0.4), inset 0 0 10px rgba(0, 229, 255, 0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        color: 'white',
        fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
        pointerEvents: 'none',
      }}
    >
      <div 
        className="now-playing-vinyl-spin"
        style={{
          background: 'linear-gradient(135deg, var(--secondary), var(--primary))',
          borderRadius: '50%',
          padding: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 12px rgba(0, 229, 255, 0.6)',
        }}
      >
        <Music size={22} color="white" />
      </div>
      <div>
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1.8px', color: 'var(--secondary)', fontWeight: 800, marginBottom: '2px' }}>
          🎵 Now Playing
        </div>
        <div style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '0.3px', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
          {nowPlayingTrack.title}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.65)', fontWeight: 600 }}>
          {nowPlayingTrack.artist}
        </div>
      </div>
    </div>
  );
};
