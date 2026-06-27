import type { GenerationResult } from "@/types";
import { generateId } from "@/lib/utils";

const STORAGE_KEY = "wanzi-ai-art-studio-history";
const MAX_HISTORY = 100;

/**
 * History Service — manages generation history in localStorage.
 * Returns the updated array so callers can update state without re-reading.
 */

function sanitizeHistory(items: GenerationResult[]): GenerationResult[] {
  const seen = new Set<string>();
  return items.map((item) => {
    let id = item.id;
    if (!id || seen.has(id)) {
      id = generateId();
    }
    seen.add(id);
    return id === item.id ? item : { ...item, id };
  });
}

export function getHistory(): GenerationResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GenerationResult[];
    return sanitizeHistory(parsed);
  } catch {
    return [];
  }
}

export function addToHistory(result: GenerationResult): GenerationResult[] {
  const history = getHistory();
  const item = result.id ? result : { ...result, id: generateId() };
  history.unshift(item);
  if (history.length > MAX_HISTORY) {
    history.length = MAX_HISTORY;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Storage full — silently fail
  }
  return history;
}

export function removeFromHistory(id: string): GenerationResult[] {
  const history = getHistory().filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Silently fail
  }
  return history;
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail
  }
}
