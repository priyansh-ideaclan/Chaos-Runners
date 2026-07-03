import React from 'react';
import { useMusicStore, RepeatMode } from '../store/useMusicStore';
import { musicManager } from '../utils/musicManager';
import { Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Volume2, Bell, BellOff, Music } from 'lucide-react';

export const MusicPlayerPanel: React.FC = () => {
  const {
    playlist,
    currentTrackIndex,
    isPlaying,
    shuffle,
    repeatMode,
    musicVolume,
    masterVolume,
    enableMusic,
    showNotifications,
    playbackProgress,
    setPlaying,
    setShuffle,
    setRepeatMode,
    setMusicVolume,
    setMasterVolume,
    setEnableMusic,
    setShowNotifications,
    playTrack
  } = useMusicStore();

  const currentTrack = playlist[currentTrackIndex];

  const handlePlayPause = () => {
    if (!enableMusic) {
      setEnableMusic(true);
    }
    setPlaying(!isPlaying);
  };

  const handlePrev = () => {
    musicManager.skipToPrev();
  };

  const handleNext = () => {
    musicManager.skipToNext();
  };

  const handleShuffleToggle = () => {
    setShuffle(!shuffle);
  };

  const handleRepeatToggle = () => {
    let nextMode: RepeatMode = 'OFF';
    if (repeatMode === 'OFF') nextMode = 'PLAYLIST';
    else if (repeatMode === 'PLAYLIST') nextMode = 'TRACK';
    setRepeatMode(nextMode);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setMusicVolume(val);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If not in fallback mode, we can seek the actual audio. For synth, we can restart it.
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const ratio = clickX / width;
    
    // Seek active HTML5 audio if loaded
    if (musicManager['activeAudio']) {
      musicManager['activeAudio'].currentTime = ratio * musicManager['activeAudio'].duration;
    }
    // Also restart chiptune sequence step to match
    musicManager['synthStep'] = Math.floor(ratio * 16 * 8);
  };

  const getRepeatLabel = () => {
    if (repeatMode === 'TRACK') return 'Repeat One';
    if (repeatMode === 'PLAYLIST') return 'Repeat All';
    return 'Repeat Off';
  };

  return (
    <div 
      className="glass-panel" 
      style={{
        padding: '20px',
        borderRadius: '16px',
        color: 'white',
        fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
        border: '1px solid var(--glass-border)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        background: 'rgba(25, 18, 45, 0.4)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--secondary)' }}>
          <Music size={16} /> EA Dynamic Radio
        </h3>
        
        {/* Enable Music toggle checkbox */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 700 }}>
          <input
            type="checkbox"
            checked={enableMusic}
            onChange={(e) => setEnableMusic(e.target.checked)}
            style={{ accentColor: 'var(--secondary)', cursor: 'pointer' }}
          />
          <span>Radio Enabled</span>
        </label>
      </div>

      {/* Main Track Info Panel */}
      {currentTrack && (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', opacity: enableMusic ? 1 : 0.45 }}>
          {/* Glowing spinning vinyl record artwork */}
          <div 
            className={`now-playing-vinyl-spin ${isPlaying && enableMusic ? 'active-spin' : ''}`}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #333 30%, #111 60%, var(--secondary) 100%)',
              border: '2px solid rgba(255,255,255,0.1)',
              boxShadow: isPlaying && enableMusic ? '0 0 16px rgba(0,229,255,0.5)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              flexShrink: 0,
            }}
          >
            {/* Center label */}
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: 'var(--primary)',
              border: '2.5px solid #000'
            }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ margin: '0 0 3px 0', fontSize: '1.05rem', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
              {currentTrack.title}
            </h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentTrack.artist}
            </p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div style={{ opacity: enableMusic ? 1 : 0.45 }}>
        <div 
          onClick={handleProgressBarClick}
          style={{
            height: '6px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '3px',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div 
            style={{
              height: '100%',
              width: `${playbackProgress}%`,
              background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
              borderRadius: '3px',
              transition: 'width 0.25s linear'
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px', fontWeight: 600 }}>
          <span>{Math.floor((playbackProgress / 100) * (currentTrack?.duration || 0))}s</span>
          <span>{currentTrack?.duration}s</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: enableMusic ? 1 : 0.45 }}>
        {/* Shuffle Button */}
        <button 
          onClick={handleShuffleToggle}
          className="ui-interactive"
          style={{
            background: 'none',
            border: 'none',
            color: shuffle ? 'var(--secondary)' : 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
          }}
          title={shuffle ? 'Shuffle ON' : 'Shuffle OFF'}
        >
          <Shuffle size={16} />
        </button>

        {/* Media Buttons */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <button onClick={handlePrev} className="ui-interactive" style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '6px' }}>
            <SkipBack size={18} fill="white" />
          </button>
          
          <button 
            onClick={handlePlayPause} 
            className="ui-interactive" 
            style={{
              background: 'white',
              border: 'none',
              color: '#111',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
            }}
          >
            {isPlaying && enableMusic ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" style={{ marginLeft: '2px' }} />}
          </button>

          <button onClick={handleNext} className="ui-interactive" style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '6px' }}>
            <SkipForward size={18} fill="white" />
          </button>
        </div>

        {/* Repeat Button */}
        <button 
          onClick={handleRepeatToggle}
          className="ui-interactive"
          style={{
            background: 'none',
            border: 'none',
            color: repeatMode !== 'OFF' ? 'var(--primary)' : 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
          }}
          title={getRepeatLabel()}
        >
          <Repeat size={16} />
          {repeatMode === 'TRACK' && <span style={{ fontSize: '0.55rem', fontWeight: 900, background: 'var(--primary)', color: 'white', borderRadius: '4px', padding: '1px 3px', position: 'absolute', transform: 'translate(10px, -8px)' }}>1</span>}
        </button>
      </div>

      {/* Volume and Notification Preferences */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Volume2 size={15} color="rgba(255,255,255,0.5)" />
          <input
            type="range"
            min="0"
            max="1.0"
            step="0.05"
            value={musicVolume}
            disabled={!enableMusic}
            onChange={handleVolumeChange}
            style={{ flex: 1, accentColor: 'var(--secondary)', cursor: 'pointer', opacity: enableMusic ? 1 : 0.3 }}
          />
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', width: '30px', textAlign: 'right', fontWeight: 700 }}>
            {Math.round(musicVolume * 100)}%
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>Now Playing Popup</span>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="ui-interactive"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: showNotifications ? 'var(--secondary)' : 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.7rem',
              fontWeight: 700
            }}
          >
            {showNotifications ? <Bell size={12} /> : <BellOff size={12} />}
            <span>{showNotifications ? 'Enabled' : 'Disabled'}</span>
          </button>
        </div>
      </div>

      {/* Playlist quick selection */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Playlist</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '100px', overflowY: 'auto' }}>
          {playlist.map((track, idx) => (
            <button
              key={track.id}
              onClick={() => playTrack(idx)}
              className="ui-interactive"
              style={{
                width: '100%',
                background: idx === currentTrackIndex ? 'rgba(0,229,255,0.1)' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                color: idx === currentTrackIndex ? 'var(--secondary)' : 'white',
                padding: '6px 8px',
                textAlign: 'left',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: idx === currentTrackIndex ? 800 : 500,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                {idx + 1}. {track.title}
              </span>
              <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)' }}>
                {track.artist}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
export default MusicPlayerPanel;
