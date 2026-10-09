import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getTopics } from "../services/topicService";

export function useLandingProgress() {
  const { token, initializing, isAuthenticated } = useAuth();
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    if (initializing) return;
    let cancelled = false;
    let request = 0;
    async function refresh() {
      const current = ++request;
      try {
        const response = await getTopics();
        if (!cancelled && current === request) {
          setSnapshot({ token, topics: response.data || [], error: false });
        }
      } catch {
        if (!cancelled && current === request) {
          setSnapshot({ token, topics: [], error: true });
        }
      }
    }
    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("progress:updated", refresh);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", refresh);
      window.removeEventListener("progress:updated", refresh);
    };
  }, [token, initializing]);

  const current = !initializing && snapshot?.token === token ? snapshot : null;
  return {
    topics: current?.topics || [],
    loading: !current,
    error: current?.error || false,
    isAuthenticated,
  };
}
