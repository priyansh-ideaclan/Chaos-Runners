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
      // Y height varies based on level spawn deck
      let spawnHeight = 0.4;
      if (currentLevelId === 'final_1') {
        spawnHeight = 9.8;
      } else if (currentLevelId === 'logic_1') {
        spawnHeight = 2.1;
      }

      // Distribute bots naturally across the starting grid (avoiding the center at Z=0 for the player)
      const layoutX = [-3.5, 3.5, -2.0, 2.0, -4.0, 4.0, -1.0, 1.0, -2.5, 2.5, 0.0];
      const layoutZ = [0.0, 0.0, -1.6, -1.6, -3.2, -3.2, -4.8, -4.8, -6.4, -6.4, -8.0];
      const idx = i % layoutX.length;
      const spawnPos: [number, number, number] = [layoutX[idx], spawnHeight, layoutZ[idx]];

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
