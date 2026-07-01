import React, { useMemo } from 'react';
import { Bot, BotProps } from './Bot';
import { useGameStore } from '../store/useGameStore';

const BOT_NAMES = [
  'Beanos',
  'FallGuy99',
  'WaddleChamp',
  'BouncingBean',
  'SlipNSlide',
  'CrownChaser',
  'TumbleKing',
  'CheekyBean',
  'ClumsyPogo',
];

const BOT_COLORS = [
  '#ffd60a', // Banana Gold
  '#39ff14', // Lime Green
  '#00e5ff', // Cyan
  '#ff6700', // Orange
  '#bd00ff', // Purple
  '#ff0055', // Hot Red
  '#00ffc4', // Mint
  '#ff7da7', // Pastel Pink
  '#a8ff00', // Chartreuse
];

const ACCESSORIES = ['none', 'crown', 'party', 'glasses'];
const DIFFICULTIES: Array<'EASY' | 'MEDIUM' | 'HARD'> = [
  'EASY', 'MEDIUM', 'HARD',
  'EASY', 'MEDIUM', 'MEDIUM',
  'EASY', 'MEDIUM', 'HARD'
];

export const BotManager: React.FC = () => {
  const phase = useGameStore((state) => state.phase);
  const currentLevel = useGameStore((state) => state.currentLevelIndex);

  const botsList = useMemo(() => {
    const list: BotProps[] = [];

    for (let i = 0; i < 9; i++) {
      const name = BOT_NAMES[i] || `Runner_${i}`;
      const color = BOT_COLORS[i] || '#ffffff';
      const accessory = ACCESSORIES[Math.floor(Math.random() * ACCESSORIES.length)] || 'none';
      const difficulty = DIFFICULTIES[i] || 'MEDIUM';

      // Distribute bots in a grid behind the player
      const row = Math.floor(i / 3); // 0, 1, 2
      const col = i % 3;             // 0, 1, 2

      // Y height varies based on selected handcrafted level spawn deck
      const spawnHeight = currentLevel === 4 ? 9.5 : 4.0;

      const spawnPos: [number, number, number] = [
        (col - 1) * 1.3 + (Math.random() - 0.5) * 0.15,
        spawnHeight,
        -1.8 - row * 1.5
      ];

      list.push({
        id: `bot_${i}`,
        name,
        color,
        accessory,
        difficulty,
        spawnPos,
      });
    }

    return list;
  }, [currentLevel, phase]);

  if (phase === 'MENU') return null;

  return (
    <group name="bot-manager">
      {botsList.map((bot) => (
        <Bot key={bot.id} {...bot} />
      ))}
    </group>
  );
};
