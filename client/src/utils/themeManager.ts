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
        skyInclination: 0.2,
        skyAzimuth: 0.25,
        ambientColor: '#ffffff',
        ambientIntensity: 0.9,
        gridColor1: '#ffffff',
        gridColor2: '#b2ebf2',
        groundColor: '#00e5ff', // Bright electric cyan path
        obstacleColor1: '#ff007f', // High-contrast hot pink
        obstacleColor2: '#ffd60a', // Bright yellow
        accentColor: '#bd00ff', // Violet accent
        glowIntensity: 0.3,
        fogColor: '#e0f7fa', // Bright daylight sky fog
        fogDensity: 0.001,
      };
    case 'SUNSET_ORANGE':
      return {
        skyColor: [10, 8, 20],
        skyTurbidity: 3,
        skyRayleigh: 3.5,
        skyMieCoefficient: 0.008,
        skyMieDirectionalG: 0.9,
        skyInclination: 0.45,
        skyAzimuth: 0.15,
        ambientColor: '#fff3e0',
        ambientIntensity: 0.9,
        gridColor1: '#ffffff',
        gridColor2: '#ffe0b2',
        groundColor: '#ffd60a', // Bright gold path
        obstacleColor1: '#ff5722', // Bright red-orange
        obstacleColor2: '#e91e63', // Hot pink
        accentColor: '#9c27b0', // Purple
        glowIntensity: 0.4,
        fogColor: '#ffe0b2', // Bright sunset fog
        fogDensity: 0.001,
      };
    case 'PURPLE_NEON':
      return {
        skyColor: [5, 12, 15],
        skyTurbidity: 5,
        skyRayleigh: 1.5,
        skyMieCoefficient: 0.004,
        skyMieDirectionalG: 0.85,
        skyInclination: 0.3,
        skyAzimuth: 0.4,
        ambientColor: '#f3e5f5',
        ambientIntensity: 0.9,
        gridColor1: '#ffffff',
        gridColor2: '#e1bee7',
        groundColor: '#bd00ff', // Bright purple neon path
        obstacleColor1: '#00e5ff', // High-contrast electric cyan
        obstacleColor2: '#ff007f', // Hot pink
        accentColor: '#39ff14', // Lime green
        glowIntensity: 0.5,
        fogColor: '#f3e5f5', // Bright lavender daylight fog
        fogDensity: 0.001,
      };
    case 'CANDY_LAND':
      return {
        skyColor: [15, 30, 25],
        skyTurbidity: 1.5,
        skyRayleigh: 1.2,
        skyMieCoefficient: 0.002,
        skyMieDirectionalG: 0.9,
        skyInclination: 0.25,
        skyAzimuth: 0.3,
        ambientColor: '#fff0f5',
        ambientIntensity: 0.95,
        gridColor1: '#ffffff',
        gridColor2: '#f8bbd0',
        groundColor: '#ff7da7', // Sweet pastel pink path
        obstacleColor1: '#00ffff', // High-contrast mint cyan
        obstacleColor2: '#ffd60a', // Lemon yellow
        accentColor: '#9c27b0', // Purple
        glowIntensity: 0.4,
        fogColor: '#fff0f5', // Soft sweet pink fog
        fogDensity: 0.001,
      };
    case 'SPACE':
      return {
        skyColor: [2, 15, 20], // Bright aurora cosmic light
        skyTurbidity: 8,
        skyRayleigh: 2.5,
        skyMieCoefficient: 0.006,
        skyMieDirectionalG: 0.88,
        skyInclination: 0.35,
        skyAzimuth: 0.5,
        ambientColor: '#e8eaf6',
        ambientIntensity: 0.85,
        gridColor1: '#ffffff',
        gridColor2: '#c5cae9',
        groundColor: '#00ffc4', // Glowing teal space path
        obstacleColor1: '#bd00ff', // Hot violet
        obstacleColor2: '#ff3d00', // Neon orange
        accentColor: '#ffd60a', // Lemon gold
        glowIntensity: 0.6,
        fogColor: '#e8eaf6', // Bright cosmic blue fog
        fogDensity: 0.001,
      };
  }
};
