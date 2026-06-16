const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || error.status || 500;

  res.status(statusCode).json({
    message: error.message || "Internal server error"
  });
};

module.exports = errorHandler;
