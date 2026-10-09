const express = require("express");
const path = require("node:path");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const { edgeLimiter, userLimiter, authLimiter } = require('./middleware/rateLimits');
const { optionalAuth } = require('./middleware/auth.middleware');

const authRoutes = require("./routes/auth.routes");
const topicRoutes = require("./routes/topic.routes");
const questionRoutes = require("./routes/question.routes");
const companyRoutes = require("./routes/company.routes");
const sheetRoutes = require("./routes/sheet.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const progressRoutes = require("./routes/progress.routes");
const adminRoutes = require("./routes/admin.routes");
const adminQuestionRoutes = require("./routes/adminQuestion.routes");
const userRoutes = require("./routes/user.routes");

const errorHandler = require("./middleware/error.middleware");

const app = express();
app.disable("x-powered-by");
if (process.env.TRUST_PROXY_HOPS) app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS));

// ==============================
// Middlewares
// ==============================

// ==============================
// CORS
// In production, set CLIENT_URL to a comma-separated list
// of allowed frontend origins (e.g. your Vercel domain).
// Local development permits only the Vite development origins.
// ==============================

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((o) => o.trim())
  : null;
const developmentOrigins = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"];

app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? allowedOrigins || false : [...new Set([...(allowedOrigins || []), ...developmentOrigins])],
    credentials: true,
  })
);

// Security headers — crossOriginOpenerPolicy is relaxed
// because Helmet's default ('same-origin') breaks Google
// Identity Services' popup-based Sign-In flow.
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? { directives: {
      "script-src": ["'self'", "https://accounts.google.com"],
      "connect-src": ["'self'", "https://accounts.google.com"],
      "frame-src": ["https://accounts.google.com"],
      "img-src": ["'self'", "data:", "https:"],
      "style-src": ["'self'", "'unsafe-inline'", "https://accounts.google.com", "https://fonts.googleapis.com"],
      "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
    } } : false,
    crossOriginOpenerPolicy: {
      policy: "same-origin-allow-popups",
    },
  })
);

// Gzip responses
app.use(compression());

// Profile photos are resized in the browser before upload, but allow a
// reasonable payload size for the resulting data URL.
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// ==============================
// Rate Limiting
// General limit across the API, plus a stricter limit
// specifically on auth routes to slow down brute-force
// login/register/password attempts.
// ==============================

app.use('/api', edgeLimiter);
app.use('/api', (req, res, next) => req.path === '/health' ? next() : optionalAuth(req, res, next));
app.use('/api', userLimiter);
app.use('/api/auth', authLimiter);

// ==============================
// Health Check
// ==============================

app.get("/api/health", (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ success: ready });
});

app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 DSA Roadmap API is running...",
  });
});

// ==============================
// API Routes
// ==============================

app.use("/api/auth", authRoutes);

app.use("/api/topics", topicRoutes);

app.use("/api/questions", questionRoutes);

app.use(
  "/api/admin/questions",
  adminQuestionRoutes
);

app.use("/api/companies", companyRoutes);

app.use("/api/sheets", sheetRoutes);

const statsRoutes = require("./routes/stats.routes");
app.use("/api/stats", statsRoutes);

app.use("/api/users", userRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/progress", progressRoutes);

app.use("/api/admin", adminRoutes);

// ==============================
// 404 Route
// ==============================

if (process.env.NODE_ENV === "production") {
  const staticDirectory = path.resolve(__dirname, "../../client/dist");
  app.use(express.static(staticDirectory));
  app.get("/{*splat}", (req, res, next) => {
    if (req.path.startsWith("/api/") || path.extname(req.path)) return next();
    res.sendFile(path.join(staticDirectory, "index.html"));
  });
}

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// ==============================
// Error Handler
// ==============================

app.use(errorHandler);

module.exports = app;
