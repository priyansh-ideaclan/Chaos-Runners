import React, { useMemo } from 'react';
import { Bot } from './Bot';
import { useGameStore } from '../store/useGameStore';

export const BotManager: React.FC = () => {
  const phase = useGameStore((state) => state.phase);
  const currentLevelId = useGameStore((state) => state.currentLevelId);
  const activeBots = useGameStore((state) => state.activeBots);
  const botsEnabled = useGameStore((state) => state.botsEnabled);

  const botsList = useMemo(() => {
    return activeBots.map((bot, i) => {
      let spawnHeight = 0.4;
      if (currentLevelId === 'final_1') {
        spawnHeight = 9.8;
      } else if (currentLevelId === 'logic_1') {
        spawnHeight = 2.1;
      } else if (currentLevelId === 'survival_2') {
        spawnHeight = 8.5;
      } else if (currentLevelId === 'survival_1') {
        spawnHeight = 1.2;
      }

      let spawnPos: [number, number, number];
      if (currentLevelId === 'survival_1') {
        const totalParticipants = activeBots.length + 1;
        const angle = ((i + 1) * Math.PI * 2) / totalParticipants;
        const radius = 5.5;
        spawnPos = [Math.sin(angle) * radius, spawnHeight, Math.cos(angle) * radius];
      } else if (currentLevelId === 'survival_2') {
        const angle = ((i + 1) * Math.PI * 2) / 6;
        const radius = 2.4;
        spawnPos = [Math.sin(angle) * radius, spawnHeight, Math.cos(angle) * radius];
      } else if (currentLevelId === 'logic_1') {
        // Spawning on logic safety deck: Z center -5.8, X bounds [-4, 4], Z bounds [-7.05, -4.55]
        const layoutX = [-3.0, 3.0, -1.5, 1.5, -3.0, 3.0, -1.5, 1.5, 0.0];
        const layoutZ = [-5.8, -5.8, -5.8, -5.8, -6.4, -6.4, -6.4, -6.4, -6.4];
        const idx = i % layoutX.length;
        spawnPos = [layoutX[idx], spawnHeight, layoutZ[idx]];
      } else {
        // race_1 level: spawn platform Z center -1.5, depth 9 (Z [-6, 3]), X bounds [-6, 6]
        const layoutX = [-3.5, 3.5, -4.5, -2.25, 2.25, 4.5, -4.5, -2.25, 0.0, 2.25, 4.5];
        const layoutZ = [0.0, 0.0, -1.5, -1.5, -1.5, -1.5, -3.0, -3.0, -3.0, -3.0, -3.0];
        const idx = i % layoutX.length;
        spawnPos = [layoutX[idx], spawnHeight, layoutZ[idx]];
      }

      return {
        ...bot,
        spawnPos,
      };
    });
  }, [currentLevelId, phase, activeBots]);

  // Bots are toggled off — don't render any bot physics/meshes
  if (!botsEnabled) return null;
  if (phase === 'MENU') return null;

  return (
    <group name="bot-manager">
      {botsList.map((bot) => (
        <Bot key={bot.id} {...bot} />
      ))}
    </group>
  );
};
