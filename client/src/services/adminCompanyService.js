import api from "./api";

const getConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// =============================
// Get All Companies
// =============================

export const getCompanies = async () => {
  const response = await api.get(
    "/companies",
    getConfig()
  );

  return response.data;
};

// =============================
// Create Company
// =============================

export const createCompany = async (data) => {
  const response = await api.post(
    "/companies",
    data,
    getConfig()
  );

  return response.data;
};

// =============================
// Update Company
// =============================

export const updateCompany = async (
  id,
  data
) => {
  const response = await api.put(
    `/companies/${id}`,
    data,
    getConfig()
  );

  return response.data;
};

// =============================
// Delete Company
// =============================

export const deleteCompany = async (
  id
) => {
  const response = await api.delete(
    `/companies/${id}`,
    getConfig()
  );

  return response.data;
};