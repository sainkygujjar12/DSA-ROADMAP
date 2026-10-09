import api from "./api";

let dashboardCache = null;
let dashboardCacheToken = null;
let dashboardCacheTime = 0;
const DASHBOARD_CACHE_TTL = 30_000;

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const getDashboard = async ({ force = false } = {}) => {
  const token = localStorage.getItem("token") || "guest";
  const cacheIsFresh = Date.now() - dashboardCacheTime < DASHBOARD_CACHE_TTL;

  if (!force && dashboardCache && dashboardCacheToken === token && cacheIsFresh) {
    return dashboardCache;
  }

  const response = await api.get(
    "/dashboard",
    getAuthConfig()
  );

  dashboardCache = response.data;
  dashboardCacheToken = token;
  dashboardCacheTime = Date.now();
  return dashboardCache;
};

export const invalidateDashboardCache = () => {
  dashboardCache = null;
  dashboardCacheToken = null;
  dashboardCacheTime = 0;
};
