import api from "./api";

const getConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// =============================
// Get All Questions
// =============================

export const getQuestions = async () => {
  const response = await api.get(
    "/questions",
    getConfig()
  );

  return response.data;
};

// =============================
// Delete Question
// =============================

export const deleteQuestion = async (id) => {
  const response = await api.delete(
    `/questions/${id}`,
    getConfig()
  );

  return response.data;
};

// =============================
// Create Question
// =============================

export const createQuestion = async (data) => {
  const response = await api.post(
    "/questions",
    data,
    getConfig()
  );

  return response.data;
};

// =============================
// Update Question
// =============================

export const updateQuestion = async (
  id,
  data
) => {
  const response = await api.put(
    `/questions/${id}`,
    data,
    getConfig()
  );

  return response.data;
};
// =============================
// Bulk Import Questions
// =============================

export const bulkImportQuestions = async (questions) => {
  const response = await api.post(
    "/admin/questions/bulk-import",
    { questions },
    getConfig()
  );

  return response.data;
};

// =============================
// Get Topics
// =============================

export const getTopics = async () => {
  const response = await api.get(
    "/topics",
    getConfig()
  );

  return response.data;
};

// =============================
// Get Companies
// =============================

export const getCompanies = async () => {
  const response = await api.get(
    "/companies",
    getConfig()
  );

  return response.data;
};

// =============================
// Get Sheets
// =============================

export const getSheets = async () => {
  const response = await api.get(
    "/sheets",
    getConfig()
  );

  return response.data;
};