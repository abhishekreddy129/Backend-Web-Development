const express = require('express');
const bcrypt = require('bcryptjs');
const userRepository = require('../db/userRepository');
const requireSession = require('../middleware/requireSession');
const sessionStore = require('../session/sessionStore');
const { COOKIE_OPTIONS } = require('../cookieConfig');

const router = express.Router();

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    || typeof password !== 'string' || password.length === 0) {
    return res.status(400).json({ error: { code: 'INVALID_REQUEST', message: 'Valid email and password are required' } });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await userRepository.findByEmail(normalizedEmail);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    }

    const sessionId = sessionStore.create(user.id);
    res.cookie('sid', sessionId, COOKIE_OPTIONS);
    return res.status(200).json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireSession, async (req, res, next) => {
  try {
    const user = await userRepository.findIdentityById(req.session.userId);
    if (!user) {
      sessionStore.destroy(req.signedCookies.sid);
      return res.status(401).json({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
    }
    return res.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
});

router.post('/logout', (req, res) => {
  const sessionId = req.signedCookies && req.signedCookies.sid;
  if (typeof sessionId === 'string') sessionStore.destroy(sessionId);
  res.clearCookie('sid', COOKIE_OPTIONS);
  return res.status(204).end();
});

module.exports = router;
