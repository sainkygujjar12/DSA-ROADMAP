const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token || !token.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    token = token.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

// ======================================
// OPTIONAL AUTH
// Attaches req.user if a valid token is present,
// but never blocks the request if it's missing or
// invalid. Used on public browsing routes (topics,
// sheets, companies) so logged-in users get their
// solved/bookmarked state without requiring guests
// to log in just to browse.
// ======================================

exports.optionalAuth = (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token || !token.startsWith("Bearer ")) {
      return next();
    }

    token = token.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };
  } catch (error) {
    // Invalid/expired token on a public route — just
    // treat the request as a guest instead of failing it.
  }

  next();
};