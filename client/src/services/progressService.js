import api from "./api";
import { invalidateDashboardCache } from "./dashboardService";

let progressCache = null;
let progressCacheToken = null;
let progressCacheTime = 0;
const PROGRESS_CACHE_TTL = 15_000;

export const getProgressSummary = async () => {
  const response = await api.get('/progress', { params: { summary: true } });
  return response.data;
};

// =====================================
// Helper
// =====================================

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// =====================================
// Get Progress
// =====================================

export const getProgress = async ({ force = false } = {}) => {
  const token = localStorage.getItem("token") || "guest";
  const cacheIsFresh = Date.now() - progressCacheTime < PROGRESS_CACHE_TTL;

  if (!force && progressCache && progressCacheToken === token && cacheIsFresh) {
    return progressCache;
  }

  const response = await api.get(
    "/progress",
    getAuthConfig()
  );

  progressCache = response.data;
  progressCacheToken = token;
  progressCacheTime = Date.now();
  return progressCache;
};

const invalidateProgressCache = () => {
  progressCache = null;
  progressCacheToken = null;
  progressCacheTime = 0;
};

const notifyProgressUpdated = (response) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("progress:updated", {
        detail: response?.data || null,
      })
    );
  }
};

// =====================================
// Toggle Solved Question
// =====================================

export const toggleQuestionSolved = async (
  questionId
) => {
  const response = await api.patch(
    `/progress/toggle/${questionId}`,
    {},
    getAuthConfig()
  );

  invalidateProgressCache();
  invalidateDashboardCache();
  notifyProgressUpdated(response.data);
  return response.data;
};

// =====================================
// Update Last Visited Question
// =====================================

export const updateLastVisited = async (
  questionId
) => {
  const response = await api.patch(
    `/progress/last-visited/${questionId}`,
    {},
    getAuthConfig()
  );

  invalidateProgressCache();
  return response.data;
};

// =====================================
// (Next Feature)
// Toggle Bookmark
// =====================================

export const toggleBookmark = async (
  questionId
) => {
  const response = await api.patch(
    `/progress/bookmark/${questionId}`,
    {},
    getAuthConfig()
  );

  invalidateProgressCache();
  invalidateDashboardCache();
  notifyProgressUpdated(response.data);
  return response.data;
};

// =====================================
// (Next Feature)
// Save Notes
// =====================================

export const saveNotes = async (
  questionId,
  content
) => {
  const response = await api.patch(
    `/progress/note/${questionId}`,
    { content },
    getAuthConfig()
  );

  invalidateProgressCache();
  return response.data;
};
// =====================================
// Delete Note
// =====================================

export const deleteNote = async (
  questionId
) => {
  const response = await api.delete(
    `/progress/note/${questionId}`,
    getAuthConfig()
  );

  invalidateProgressCache();
  return response.data;
};
