import api from "./api";

// =====================================
// Get All Sheets
// =====================================

export const getSheets = async () => {
  const response = await api.get("/sheets");
  return response.data;
};

// =====================================
// Get Sheet By Slug
// =====================================

export const getSheetBySlug = async (slug) => {
  const response = await api.get(
    `/sheets/${slug}`
  );

  return response.data;
};