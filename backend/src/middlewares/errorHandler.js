export default function errorHandler(err, req, res, next) {
  console.error(err.stack);

  const multerStatus = err.code?.startsWith?.('LIMIT_') ? 400 : undefined;
  const statusCode = err.statusCode || err.status || multerStatus || (res.statusCode === 200 ? 500 : res.statusCode);
  const isProduction = process.env.NODE_ENV === 'production';
  const message = err.code === 'LIMIT_FILE_SIZE'
    ? 'Uploaded file is too large. Maximum size is 5MB.'
    : err.message;
  
  res.status(statusCode).json({
    error: statusCode >= 500 && isProduction ? 'Internal server error' : message,
    details: err.details,
    stack: isProduction ? undefined : err.stack,
  });
}
