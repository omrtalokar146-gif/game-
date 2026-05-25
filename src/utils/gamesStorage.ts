import { GameMetadata } from "../types";
import { GAMES_DATA } from "../data";

const STORAGE_KEY = "vortex_custom_games";
const API_BASE = typeof window !== "undefined"
  ? import.meta.env.VITE_API_BASE_URL || window.location.origin
  : "";

export async function getGamesList(): Promise<GameMetadata[]> {
  try {
    // Try to fetch custom games from the server first
    const response = await fetch(`${API_BASE}/api/games`);
    if (response.ok) {
      const data = await response.json();
      const serverGames = data.games || [];
      return [...GAMES_DATA, ...serverGames];
    }
  } catch (e) {
    console.error("Error fetching games from server:", e);
  }

  // Fallback to localStorage if server is not available
  try {
    const custom = localStorage.getItem(STORAGE_KEY);
    if (custom) {
      const parsed = JSON.parse(custom) as GameMetadata[];
      return [...GAMES_DATA, ...parsed];
    }
  } catch (e) {
    console.error("Error reading custom games from localStorage:", e);
  }

  return GAMES_DATA;
}

export async function saveCustomGame(game: GameMetadata) {
  try {
    // Save to server
    const response = await fetch(`${API_BASE}/api/games`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game }),
    });

    if (response.ok) {
      // Dispatch custom event to notify components
      window.dispatchEvent(new Event("vortex_games_updated"));
      return;
    }
  } catch (e) {
    console.error("Error saving game to server:", e);
  }

  // Fallback to localStorage if server save fails
  try {
    const custom = localStorage.getItem(STORAGE_KEY);
    let list: GameMetadata[] = [];
    if (custom) {
      list = JSON.parse(custom);
    }
    const index = list.findIndex((g) => g.id === game.id);
    if (index >= 0) {
      list[index] = game;
    } else {
      list.push(game);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("vortex_games_updated"));
  } catch (e) {
    console.error("Error saving custom game to localStorage:", e);
  }
}

export async function deleteCustomGame(gameId: string) {
  try {
    // Delete from server
    const response = await fetch(`${API_BASE}/api/games/${gameId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      window.dispatchEvent(new Event("vortex_games_updated"));
      return;
    }
  } catch (e) {
    console.error("Error deleting game from server:", e);
  }

  // Fallback to localStorage if server delete fails
  try {
    const custom = localStorage.getItem(STORAGE_KEY);
    if (custom) {
      let list = JSON.parse(custom) as GameMetadata[];
      list = list.filter((g) => g.id !== gameId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new Event("vortex_games_updated"));
    }
  } catch (e) {
    console.error("Error deleting custom game:", e);
  }
}
