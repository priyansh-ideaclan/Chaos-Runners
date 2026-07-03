import React from 'react';
import { GameCanvas } from './components/GameCanvas';
import { MainMenu } from './components/MainMenu';
import { HUD } from './components/HUD';
import { PlayerNameEntry } from './components/PlayerNameEntry';
import { NowPlayingOverlay } from './components/NowPlayingOverlay';

const App: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* 3D Render Canvas */}
      <GameCanvas />

      {/* HTML UI overlays */}
      <div className="ui-layer" style={{ height: '100%' }}>
        {/* Name entry screen (shown only when playerName is empty) */}
        <PlayerNameEntry />

        <MainMenu />
        <HUD />
        <NowPlayingOverlay />
      </div>
    </div>
  );
};

export default App;
