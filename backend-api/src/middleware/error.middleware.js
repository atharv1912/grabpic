export const errorHandler = (err, req, res, next) => {
  // Zod validation error
  if (err.name === 'ZodError') {
    return res.status(400).json({ error: err.flatten().fieldErrors });
  }

  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ error: message });
};

