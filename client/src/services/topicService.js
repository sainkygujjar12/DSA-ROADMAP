import api from "./api";

// Get all topics
export const getTopics = async () => {
  const { data } = await api.get("/topics");
  return data;
};

// Get topic by slug with questions
export const getTopicBySlug = async (slug, params = {}) => {
  const { data } = await api.get(`/topics/${slug}`, { params });
  return data;
};
