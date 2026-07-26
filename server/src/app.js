const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

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

// ==============================
// Middlewares
// ==============================

// ==============================
// CORS
// In production, set CLIENT_URL to a comma-separated list
// of allowed frontend origins (e.g. your Vercel domain).
// Falls back to permissive CORS if unset, so local dev
// keeps working without any extra setup.
// ==============================

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((o) => o.trim())
  : null;

app.use(
  cors({
    origin: allowedOrigins || true,
    credentials: true,
  })
);

// Security headers — crossOriginOpenerPolicy is relaxed
// because Helmet's default ('same-origin') breaks Google
// Identity Services' popup-based Sign-In flow.
app.use(
  helmet({
    crossOriginOpenerPolicy: {
      policy: "same-origin-allow-popups",
    },
  })
);

// Gzip responses
app.use(compression());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==============================
// Rate Limiting
// General limit across the API, plus a stricter limit
// specifically on auth routes to slow down brute-force
// login/register/password attempts.
// ==============================

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
  },
});

app.use("/api", generalLimiter);
app.use("/api/auth", authLimiter);

// ==============================
// Health Check
// ==============================

app.get("/", (req, res) => {
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