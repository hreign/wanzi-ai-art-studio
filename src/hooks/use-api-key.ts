"use client";

import { useCallback, useEffect, useState } from "react";
import type { ModelId, ProviderId } from "@/types";
import { getProviderId } from "@/config/models";

function getStorageKey(providerId: ProviderId) {
  return `wanzi-ai-art-studio-api-key-${providerId}`;
}

export function useApiKey(modelId: ModelId) {
  const provider = getProviderId(modelId);
  const [apiKey, setApiKeyState] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoaded(true);
    try {
      const stored = localStorage.getItem(getStorageKey(provider));
      if (stored) {
        setApiKeyState(stored);
      }
    } catch {}
  }, [provider]);

  const setApiKey = useCallback((key: string) => {
    setApiKeyState(key);
    try {
      localStorage.setItem(getStorageKey(provider), key);
    } catch {}
  }, [provider]);

  return { apiKey, setApiKey, loaded };
}
