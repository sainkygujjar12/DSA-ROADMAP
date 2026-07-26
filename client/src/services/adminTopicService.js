import api from "./api";

const getConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// Get All Topics
export const getTopics = async () => {
  const response = await api.get("/topics", getConfig());
  return response.data;
};

// Create Topic
export const createTopic = async (data) => {
  const response = await api.post(
    "/topics",
    data,
    getConfig()
  );

  return response.data;
};

// Update Topic
export const updateTopic = async (id, data) => {
  const response = await api.put(
    `/topics/${id}`,
    data,
    getConfig()
  );

  return response.data;
};

// Delete Topic
export const deleteTopic = async (id) => {
  const response = await api.delete(
    `/topics/${id}`,
    getConfig()
  );

  return response.data;
};