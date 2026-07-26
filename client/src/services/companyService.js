import api from "./api";

// =====================================
// Get All Companies
// =====================================

export const getCompanies = async () => {
  const { data } = await api.get("/companies");
  return data;
};

// =====================================
// Get Company By Slug
// =====================================

export const getCompanyBySlug = async (slug) => {
  const { data } = await api.get(`/companies/${slug}`);
  return data;
};