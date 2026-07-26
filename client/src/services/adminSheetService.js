import api from "./api";

const getConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// Get All Sheets
export const getSheets = async () => {
  const response = await api.get(
    "/sheets",
    getConfig()
  );

  return response.data;
};

// Create Sheet
export const createSheet = async (data) => {
  const response = await api.post(
    "/sheets",
    data,
    getConfig()
  );

  return response.data;
};

// Update Sheet
export const updateSheet = async (
  id,
  data
) => {
  const response = await api.put(
    `/sheets/${id}`,
    data,
    getConfig()
  );

  return response.data;
};

// Delete Sheet
export const deleteSheet = async (
  id
) => {
  const response = await api.delete(
    `/sheets/${id}`,
    getConfig()
  );

  return response.data;
};