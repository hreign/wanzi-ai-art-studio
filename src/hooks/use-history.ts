"use client";

import { useCallback, useEffect, useState } from "react";
import type { GenerationResult } from "@/types";
import {
  getHistory,
  addToHistory as addToHistoryService,
  removeFromHistory as removeFromHistoryService,
  clearHistory as clearHistoryService,
} from "@/services/history";

export function useHistory() {
  const [history, setHistory] = useState<GenerationResult[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistory(getHistory());
  }, []);

  const add = useCallback((result: GenerationResult) => {
    setHistory(addToHistoryService(result));
  }, []);

  const remove = useCallback((id: string) => {
    setHistory(removeFromHistoryService(id));
  }, []);

  const clear = useCallback(() => {
    clearHistoryService();
    setHistory([]);
  }, []);

  return { history, add, remove, clear };
}
