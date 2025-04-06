module.exports = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code || 'INTERNAL_ERROR'
    }
  });
};