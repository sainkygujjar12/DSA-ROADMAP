import api from "./api";

export const getQuestions = async () => {
  const response = await api.get("/questions");
  return response.data;
};

export const getQuestionsByTopic = async (slug) => {
  const response = await api.get(`/questions/topic/${slug}`);
  return response.data;
};

export const getQuestionBySlug = async (slug) => {
  const response = await api.get(`/questions/${slug}`);
  return response.data;
};