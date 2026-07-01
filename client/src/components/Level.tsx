import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { Level1 } from './levels/Level1';
import { Level2 } from './levels/Level2';
import { Level3 } from './levels/Level3';
import { Level4 } from './levels/Level4';
import { Level5 } from './levels/Level5';

export const Level: React.FC = () => {
  const currentLevelIndex = useGameStore((state) => state.currentLevelIndex);

  switch (currentLevelIndex) {
    case 0:
      return <Level1 />;
    case 1:
      return <Level2 />;
    case 2:
      return <Level3 />;
    case 3:
      return <Level4 />;
    case 4:
      return <Level5 />;
    default:
      return <Level1 />;
  }
};
