"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GenerationResult } from "@/types";

export function useHistorySelection(
  history: GenerationResult[],
  currentResult: GenerationResult | null,
) {
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const didAutoSelectRef = useRef(false);

  useEffect(() => {
    if (didAutoSelectRef.current) return;
    if (history.length > 0 && !currentResult && selectedHistoryId === null) {
      setSelectedHistoryId(history[0].id);
      didAutoSelectRef.current = true;
    }
  }, [history, currentResult, selectedHistoryId]);

  useEffect(() => {
    if (!selectedHistoryId) return;
    if (!history.some((h) => h.id === selectedHistoryId)) {
      setSelectedHistoryId(history.length > 0 ? history[0].id : null);
    }
  }, [history, selectedHistoryId]);

  const select = useCallback((result: GenerationResult | null) => {
    setSelectedHistoryId(result ? result.id : null);
  }, []);

  const reset = useCallback(() => setSelectedHistoryId(null), []);

  const selectedResult = selectedHistoryId
    ? history.find((h) => h.id === selectedHistoryId) ?? null
    : null;

  const displayedResult = selectedResult ?? currentResult;

  return { displayedResult, selectedHistoryId, select, reset };
}
