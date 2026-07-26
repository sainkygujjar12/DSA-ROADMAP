import api from "./api";

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// ======================================
// Dashboard
// ======================================

export const getAdminDashboard = async () => {
  const response = await api.get(
    "/admin/dashboard",
    getAuthConfig()
  );

  return response.data;
};