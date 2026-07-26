import api from "./api";

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const getDashboard = async () => {
  const response = await api.get(
    "/dashboard",
    getAuthConfig()
  );

  return response.data;
};