import api from "./api";

const getConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// ==============================
// Get Users
// ==============================

export const getUsers = async () => {
  const response = await api.get(
    "/users",
    getConfig()
  );

  return response.data;
};

// ==============================
// Update Role
// ==============================

export const updateUserRole = async (
  id,
  role
) => {
  const response = await api.put(
    `/users/${id}/role`,
    { role },
    getConfig()
  );

  return response.data;
};

// ==============================
// Delete User
// ==============================

export const deleteUser = async (
  id
) => {
  const response = await api.delete(
    `/users/${id}`,
    getConfig()
  );

  return response.data;
};