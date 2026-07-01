import { VisualTheme } from '../store/useGameStore';

export interface ThemeConfig {
  skyColor: [number, number, number]; // Sun position coordinates
  skyTurbidity: number;
  skyRayleigh: number;
  skyMieCoefficient: number;
  skyMieDirectionalG: number;
  skyInclination: number;
  skyAzimuth: number;
  ambientColor: string;
  ambientIntensity: number;
  gridColor1: string;
  gridColor2: string;
  groundColor: string;
  obstacleColor1: string; 
  obstacleColor2: string; 
  accentColor: string;
  glowIntensity: number;
  fogColor: string;
  fogDensity: number;
}

export const getThemeConfig = (theme: VisualTheme): ThemeConfig => {
  switch (theme) {
    case 'SKY_BLUE':
      return {
        skyColor: [10, 20, 10],
        skyTurbidity: 8,
        skyRayleigh: 2.0,
        skyMieCoefficient: 0.005,
        skyMieDirectionalG: 0.8,
        skyInclination: 0,
        skyAzimuth: 0.25,
        ambientColor: '#ffffff',
        ambientIntensity: 0.5,
        gridColor1: '#ff007f',
        gridColor2: '#2d1a54',
        groundColor: '#1e183a',
        obstacleColor1: '#ff007f',
        obstacleColor2: '#00e5ff',
        accentColor: '#bd00ff',
        glowIntensity: 0.3,
        fogColor: '#0a0814',
        fogDensity: 0.002,
      };
    case 'SUNSET_ORANGE':
      return {
        skyColor: [20, 2, 5],
        skyTurbidity: 4,
        skyRayleigh: 4.0,
        skyMieCoefficient: 0.05,
        skyMieDirectionalG: 0.95,
        skyInclination: 0.48,
        skyAzimuth: 0.15,
        ambientColor: '#ffd89b',
        ambientIntensity: 0.6,
        gridColor1: '#ff6700',
        gridColor2: '#3d1600',
        groundColor: '#301000',
        obstacleColor1: '#ff6700',
        obstacleColor2: '#ffd60a',
        accentColor: '#ff0055',
        glowIntensity: 0.5,
        fogColor: '#120400',
        fogDensity: 0.003,
      };
    case 'PURPLE_NEON':
      return {
        skyColor: [0, -10, 15],
        skyTurbidity: 10,
        skyRayleigh: 0.5,
        skyMieCoefficient: 0.01,
        skyMieDirectionalG: 0.7,
        skyInclination: 0.1,
        skyAzimuth: 0.4,
        ambientColor: '#bd00ff',
        ambientIntensity: 0.4,
        gridColor1: '#00e5ff',
        gridColor2: '#4a0082',
        groundColor: '#110022',
        obstacleColor1: '#bd00ff',
        obstacleColor2: '#00e5ff',
        accentColor: '#ff00a0',
        glowIntensity: 0.7,
        fogColor: '#07000d',
        fogDensity: 0.005,
      };
    case 'CANDY_LAND':
      return {
        skyColor: [15, 30, 25],
        skyTurbidity: 1,
        skyRayleigh: 1.2,
        skyMieCoefficient: 0.002,
        skyMieDirectionalG: 0.9,
        skyInclination: 0.1,
        skyAzimuth: 0.3,
        ambientColor: '#ffc0cb',
        ambientIntensity: 0.65,
        gridColor1: '#ff00ff',
        gridColor2: '#ffe4e1',
        groundColor: '#2b1b36',
        obstacleColor1: '#ff00a0',
        obstacleColor2: '#39ff14',
        accentColor: '#00ffff',
        glowIntensity: 0.4,
        fogColor: '#10081c',
        fogDensity: 0.002,
      };
    case 'SPACE':
      return {
        skyColor: [0, 0, 0],
        skyTurbidity: 20,
        skyRayleigh: 0,
        skyMieCoefficient: 0,
        skyMieDirectionalG: 0,
        skyInclination: 0,
        skyAzimuth: 0,
        ambientColor: '#a1a8ff',
        ambientIntensity: 0.3,
        gridColor1: '#bd00ff',
        gridColor2: '#02001c',
        groundColor: '#050212',
        obstacleColor1: '#00ffff',
        obstacleColor2: '#39ff14',
        accentColor: '#bd00ff',
        glowIntensity: 0.8,
        fogColor: '#010006',
        fogDensity: 0.004,
      };
  }
};
