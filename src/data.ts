import { GameMetadata, GamerClass } from "./types";
import voidRunnersCover from "./assets/images/void_runners_cover_1779638578489.png";
import elderwoodCover from "./assets/images/elderwood_cover_1779638598587.png";
import neonHackersCover from "./assets/images/neon_hackers_cover_1779638618417.png";

export const GAMES_DATA: GameMetadata[] = [
  {
    id: "void-runners",
    title: "VOID RUNNERS",
    tagline: "Break the speed of light in a synthwave dimension.",
    description: "Navigate a hyper-dimensional racetrack inside a neon cosmic vortex. Upgrade your starship with gravity-bending thrusters and compete in high-stakes interplanetary tournaments against thousands of pilots online.",
    genre: "Anti-Gravity Sci-Fi Racer",
    themeColor: "from-purple-600 to-indigo-800",
    accentColor: "#a855f7", // Purple-500
    borderColor: "rgba(168, 85, 247, 0.4)",
    coverImage: voidRunnersCover,
    type: "racer",
    playerCount: 42398,
    serverStatus: "ONLINE",
    features: [
      "140fps responsive flight dynamics",
      "Real-time celestial weather storms",
      "Integrated electronic synthwave soundtrack",
      "Custom spaceship decals & engine customization"
    ],
    releaseDate: "OCTOBER 2026",
    platforms: ["PC", "PS5", "XBOX", "VORTEX-CLOUD"]
  },
  {
    id: "echoes-of-elderwood",
    title: "ECHOES OF ELDERWOOD",
    tagline: "Enter a hand-painted tactical RPG of forgotten forest ruins.",
    description: "An atmospheric adventure where every leaf tells a history. Wander through sprawling hand-drawn emerald landscapes, unlock ancient standing stones, command tactical elemental magic, and protect the world tree from dark roots.",
    genre: "Atmospheric Tactical RPG",
    themeColor: "from-emerald-600 to-teal-800",
    accentColor: "#10b981", // Emerald-500
    borderColor: "rgba(16, 185, 129, 0.4)",
    coverImage: elderwoodCover,
    type: "rpg",
    playerCount: 18402,
    serverStatus: "STABLE",
    features: [
      "Dynamic weather-driven tactical tile boards",
      "Stunning hand-crafted isometric assets",
      "Rich lore-driven decision tree",
      "Relaxing atmospheric orchestral score"
    ],
    releaseDate: "DECEMBER 2026",
    platforms: ["PC", "NINTENDO SWITCH", "MOBILE"]
  },
  {
    id: "neon-hackers",
    title: "NEON HACKERS",
    tagline: "Override the network. Brew the code. Take down the grid.",
    description: "A futuristic tactical hacker deckbuilder. Navigate complex binary matrices under intensive search sweeps. Brew viruses, deploy logic shields, counter firewalls, and expose corporate secrets to liberate the digital skyline.",
    genre: "Tactical Terminal Deckbuilder",
    themeColor: "from-cyan-600 to-blue-800",
    accentColor: "#06b6d4", // Cyan-500
    borderColor: "rgba(6, 180, 212, 0.4)",
    coverImage: neonHackersCover,
    type: "hacking",
    playerCount: 81290,
    serverStatus: "ONLINE",
    features: [
      "Interactive 3D hacking playground interface",
      "Over 300 hackable modules and firewalls",
      "Global synchronous competitive scoreboard",
      "Lofi cyber-deck atmospheric music"
    ],
    releaseDate: "MARCH 2027",
    platforms: ["PC", "LINUX", "DECK-CONSOLE"]
  }
];

export interface StudioMember {
  name: string;
  role: string;
  specialty: GamerClass;
  tagline: string;
  statName: string;
  statValue: number;
  avatarId: string;
}

export const STUDIO_TEAM: StudioMember[] = [
  {
    name: "Vikram 'Hex' Roy",
    role: "Lead Tech Alchemist & Core Dev",
    specialty: GamerClass.CODE_MAGE,
    tagline: "Translating hot coffee into smooth 144fps rendering engines.",
    statName: "Code Lines Written",
    statValue: 1890000,
    avatarId: "hex"
  },
  {
    name: "Anya 'Prism' Petrova",
    role: "Art Empress & Visual Wizard",
    specialty: GamerClass.ART_ALCHEMIST,
    tagline: "Breathing dimensional life into plain flat shapes since 2018.",
    statName: "Concept Layers Painted",
    statValue: 47200,
    avatarId: "prism"
  },
  {
    name: "Marcus 'Pulse' Chen",
    role: "Atmospheric Sound Weaver",
    specialty: GamerClass.AUDIO_DRUID,
    tagline: "Blending real-world bird whistles with electric heavy feedback.",
    statName: "Audio Assets Designed",
    statValue: 14500,
    avatarId: "pulse"
  },
  {
    name: "Tanya 'Nova' Vance",
    role: "Chief Director & Game Alchemist",
    specialty: GamerClass.GAME_KNIGHT,
    tagline: "Balancing mechanics and breaking developer keyboards.",
    statName: "Mechanics Tweaked",
    statValue: 8400,
    avatarId: "nova"
  }
];
