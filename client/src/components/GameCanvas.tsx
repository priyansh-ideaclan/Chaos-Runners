import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Stars, Sky } from '@react-three/drei';
import { Player } from './Player';
import { Level } from './Level';
import { BotManager } from './BotManager';
import { CameraController } from './CameraController';
import { useGameStore } from '../store/useGameStore';
import { getThemeConfig } from '../utils/themeManager';
import { WeatherController } from './WeatherController';

export const GameCanvas: React.FC = () => {
  const theme = useGameStore((state) => state.visualTheme);
  const config = getThemeConfig(theme);

  return (
    <div className="canvas-container">
      <Canvas
        shadows
        camera={{ fov: 60, near: 0.1, far: 250, position: [0, 5, 8] }}
      >
        {/* Dynamic Weather, Seasonal Biomes, Lighting & Particles */}
        <WeatherController />

        {/* Soft fill light from bottom/sides */}
        <pointLight position={[-20, -5, -20]} intensity={0.5} color={config.obstacleColor2} />
        <pointLight position={[20, -5, 20]} intensity={0.5} color={config.obstacleColor1} />

        {/* Sky, Space Stars, and Candy Ocean */}
        {theme !== 'SPACE' ? (
          <Sky 
            distance={450000} 
            sunPosition={config.skyColor} 
            inclination={config.skyInclination} 
            azimuth={config.skyAzimuth} 
            mieCoefficient={config.skyMieCoefficient}
            mieDirectionalG={config.skyMieDirectionalG}
            rayleigh={config.skyRayleigh}
            turbidity={config.skyTurbidity}
          />
        ) : null}
        <Stars radius={120} depth={60} count={800} factor={3} saturation={0.5} fade speed={1} />

        {/* Grid Floor to simulate digital synthwave ocean boundary */}
        <gridHelper args={[800, 120, config.gridColor1, config.gridColor2]} position={[0, -7.0, 50]} />
        <mesh position={[0, -7.2, 50]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[800, 800]} />
          <meshStandardMaterial color={config.fogColor} roughness={0.9} metalness={0.8} />
        </mesh>

        {/* 3D Game World with Physics */}
        <Suspense fallback={null}>
          <Physics gravity={[0, -22, 0]}>
            <Player />
            <BotManager />
            <Level />
          </Physics>
        </Suspense>

        {/* Interactive camera */}
        <CameraController />
      </Canvas>
    </div>
  );
};
