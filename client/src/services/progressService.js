import api from "./api";

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

export const getProgress = async () => {
  const response = await api.get(
    "/progress",
    getAuthConfig()
  );

  return response.data;
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

  return response.data;
};