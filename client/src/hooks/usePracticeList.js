import { useEffect, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

// List state belongs to the URL so Back, reload and shared links all agree.
export default function usePracticeList(ready) {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const restored = useRef(null);
  const rawPage = Number(params.get("page") || 1);
  const values = {
    page: Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1,
    search: params.get("search") || "",
    difficulty: params.get("difficulty") || "All",
    pattern: params.get("pattern") || "All",
    section: params.get("section") || "All",
    topic: params.get("topic") || "All",
  };

  function setField(field, value) {
    setParams(previous => {
      const next = new URLSearchParams(previous);
      if (!value || value === "All" || (field === "page" && value === 1)) next.delete(field);
      else next.set(field, String(value));
      if (field !== "page") next.delete("page");
      return next;
    }, { replace: true });
  }

  useEffect(() => {
    if (!ready || restored.current === location.key) return;
    // Restore only positions explicitly saved when opening a question.
    const key = `practice-scroll:${location.pathname}${location.search}`;
    let position;
    try { position = sessionStorage.getItem(key); } catch { return; }
    if (position === null) return;
    const frame = requestAnimationFrame(() => {
      restored.current = location.key;
      window.scrollTo({ top: Number(position) || 0, behavior: "instant" });
      try { sessionStorage.removeItem(key); } catch { /* Storage is optional. */ }
    });
    return () => cancelAnimationFrame(frame);
  }, [ready, location.key, location.pathname, location.search]);

  return { ...values, setField };
}
