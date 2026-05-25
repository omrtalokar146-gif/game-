export enum GamerClass {
  CODE_MAGE = "Code Mage",
  ART_ALCHEMIST = "Art Alchemist",
  AUDIO_DRUID = "Audio Druid",
  GAME_KNIGHT = "Game Knight",
  LEVEL_ARCHITECT = "Level Architect"
}

export interface GameMetadata {
  id: string;
  title: string;
  tagline: string;
  description: string;
  genre: string;
  themeColor: string; // e.g. "rgb(168, 85, 247)"
  accentColor: string;
  borderColor: string;
  coverImage: string;
  type: "racer" | "rpg" | "hacking" | "custom";
  playerCount: number;
  serverStatus: "ONLINE" | "MAINTENANCE" | "STABLE";
  features: string[];
  releaseDate: string;
  platforms: string[];
  iframeUrl?: string;
}

export interface DeveloperIDCard {
  fullName: string;
  gamerTag: string;
  selectedClass: GamerClass;
  favoriteGame: string;
  avatarColor: string;
  hasSubscribed: boolean;
  level: number;
  xp: number;
  badgeId: string;
}
