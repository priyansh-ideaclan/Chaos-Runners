/**
 * botNames.ts
 * A pool of 100+ fun, playful bot names for Chaos Runners races.
 */

const BOT_NAME_POOL: string[] = [
  // Speed-themed
  'TurboTom', 'BlazeRunner', 'RocketKid', 'FlashRunner', 'NovaDash',
  'HyperBolt', 'SwiftFox', 'FrostDash', 'ThunderFeet', 'CosmicDash',
  'SpeedsterX', 'LightningLeg', 'QuickQuinn', 'ZoomZara', 'VelocityVince',
  'RapidRacer', 'DashDrake', 'SwiftStorm', 'TurboTina', 'JetJumper',
  // Nature-themed
  'ShadowFox', 'CrystalWind', 'BoulderBash', 'StormCloud', 'FrostBite',
  'SunflashSam', 'ThunderPaw', 'GaleGust', 'CrimsonLeaf', 'AzureWave',
  'TempestTed', 'EmberElla', 'GlacierGus', 'CycloneCarla', 'MistMike',
  // Fun/playful
  'PixelRush', 'BouncyBob', 'WobbleWiz', 'JumpMaster', 'CloudRunner',
  'CrazyBean', 'LuckyLeap', 'CaptainJump', 'TurboPanda', 'RapidRobin',
  'DizzyDave', 'WaddleWing', 'ClumsyCurt', 'BounceKing', 'GiggleGuru',
  'NoodleNick', 'ZippyZoe', 'CheekyChris', 'BubbleBot', 'GigglyGrace',
  // Animal-themed
  'PandaLeap', 'TigerDash', 'RabbitRun', 'FoxFlash', 'EagleEye',
  'CheetahChase', 'BeaverBolt', 'LlamaLaunch', 'MonkeyMo', 'PenguinPro',
  'KoalaSprint', 'WombatWin', 'DolphinDive', 'HawkHustle', 'WolfWhip',
  'ArmadilloAce', 'LeopardLeap', 'BisonBurst', 'OtterOlly', 'FalconFred',
  // Retro/gamer
  'PixelPete', 'NeonNinja', 'CyberSprint', 'MegaMarco', 'UltraUna',
  'TurboTank', 'VortexVic', 'PlasmaPaul', 'QuantumQuick', 'GalaxyStar',
  'LaserLou', 'PhaserPhil', 'BitBlazer', 'RetroRita', 'BinaryBen',
  // Cosmic
  'StarStrike', 'MoonMasher', 'OrbitOliver', 'AstroAce', 'CometCrash',
  'NebulaNick', 'PulsarPat', 'QuasarQuinn', 'SolarSam', 'GalacticGus',
  'CelestialCed', 'StellarSteve', 'NovaKnight', 'ZenithZara', 'AbyssBob',
  // Food-fun
  'TacoTom', 'NoodleNova', 'WaffleWin', 'BurritoBlast', 'PizzaProton',
  'MuffinMach', 'CookieCrash', 'DonutDash', 'PancakePro', 'BagelBolt',
];

/**
 * Generates a list of unique bot names for a race.
 * Excludes the player's own name (case-insensitive).
 *
 * @param count - How many bot names to generate (typically 9)
 * @param excludeName - The player's chosen name to exclude
 * @returns Array of unique bot names
 */
export function generateBotNames(count: number, excludeName: string): string[] {
  const exclude = excludeName.trim().toLowerCase();

  // Filter out player's name and shuffle remaining pool
  const filtered = BOT_NAME_POOL.filter((n) => n.toLowerCase() !== exclude);

  // Fisher-Yates shuffle
  for (let i = filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
  }

  return filtered.slice(0, count);
}
