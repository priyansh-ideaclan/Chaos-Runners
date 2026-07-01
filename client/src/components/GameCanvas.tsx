import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Stars, Sky } from '@react-three/drei';
import { Player } from './Player';
import { Level } from './Level';
import { CameraController } from './CameraController';

export const GameCanvas: React.FC = () => {
  return (
    <div className="canvas-container">
      <Canvas
        shadows
        camera={{ fov: 60, near: 0.1, far: 250, position: [0, 5, 8] }}
      >
        {/* Lights */}
        <ambientLight intensity={0.5} />
        
        <directionalLight
          castShadow
          position={[25, 45, 25]}
          intensity={1.4}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={180}
          shadow-camera-left={-45}
          shadow-camera-right={45}
          shadow-camera-top={45}
          shadow-camera-bottom={-45}
          shadow-bias={-0.0005}
        />

        {/* Soft fill light from bottom/sides */}
        <pointLight position={[-20, -5, -20]} intensity={0.6} color="#00e5ff" />
        <pointLight position={[20, -5, 20]} intensity={0.6} color="#ff007f" />

        {/* Sky, Space Stars, and Candy Ocean */}
        <Sky 
          distance={450000} 
          sunPosition={[10, 20, 10]} 
          inclination={0} 
          azimuth={0.25} 
          mieCoefficient={0.005}
          mieDirectionalG={0.8}
          rayleigh={2.0}
          turbidity={8}
        />
        <Stars radius={100} depth={50} count={1000} factor={4} saturation={0.5} fade speed={1} />

        {/* Grid Floor to simulate digital synthwave ocean boundary */}
        <gridHelper args={[800, 160, '#ff007f', '#2d1a54']} position={[0, -7.0, 50]} />
        <mesh position={[0, -7.2, 50]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[800, 800]} />
          <meshStandardMaterial color="#0c081d" roughness={0.8} metalness={0.9} />
        </mesh>

        {/* 3D Game World with Physics */}
        <Suspense fallback={null}>
          <Physics gravity={[0, -22, 0]}>
            <Player />
            <Level />
          </Physics>
        </Suspense>

        {/* Interactive camera */}
        <CameraController />
      </Canvas>
    </div>
  );
};
