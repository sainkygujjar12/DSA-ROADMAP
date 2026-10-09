const errorHandler = (err, req, res, next) => {
  console.error(`Request failed (${err.name})`);

  res.status(err.statusCode || 500).json({
    success: false,
    message: process.env.NODE_ENV === "production" && (!err.statusCode || err.statusCode >= 500) ? "Unable to complete request" : err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;