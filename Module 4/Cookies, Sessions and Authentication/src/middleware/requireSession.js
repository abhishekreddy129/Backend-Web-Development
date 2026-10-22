const sessionStore = require('../session/sessionStore');

module.exports = function requireSession(req, res, next) {
  const sessionId = req.signedCookies && req.signedCookies.sid;
  if (typeof sessionId !== 'string') {
    return res.status(401).json({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
  }

  const session = sessionStore.get(sessionId);
  if (!session) {
    return res.status(401).json({ error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } });
  }

  req.session = session;
  next();
};
