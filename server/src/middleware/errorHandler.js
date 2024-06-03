// server/src/middleware/errorHandler.js
function errorHandler(err, req, res, next) {
    console.error(err);
    res.status(err.status || 500).json({
      error: {
        message: err.message || "Internal Server Error",
        details: err.details || "An unexpected error occurred",
      },
    });
  }
  
  module.exports = errorHandler;
  