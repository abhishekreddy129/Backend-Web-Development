require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');

if (!process.env.COOKIE_SECRET) throw new Error('COOKIE_SECRET is required');

const app = express();
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use('/auth', authRoutes);
app.use((error, req, res, next) => {
  if (error.status === 400 || error instanceof SyntaxError) {
    return res.status(400).json({ error: { code: 'INVALID_REQUEST', message: 'Invalid request' } });
  }
  console.error('Request failed');
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
});

const port = Number(process.env.PORT || 3000);
if (require.main === module) {
  app.listen(port, () => console.log(`API listening on ${port}`));
}

module.exports = app;
