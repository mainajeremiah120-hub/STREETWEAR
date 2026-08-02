// Catch-all error handler
export function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  console.error(err.stack);
  res.status(status).json({
    message: err.message || "Server error",
  });
}
