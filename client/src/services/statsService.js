import api from "./api";

export const getStats = async () => {
  const { data } = await api.get("/stats");
  return data;
};
