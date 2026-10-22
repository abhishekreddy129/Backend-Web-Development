const { randomUUID } = require('node:crypto');
const { SESSION_TTL_MS } = require('../cookieConfig');

const sessions = new Map();

function create(userId) {
    const sessionId = randomUUID();
    sessions.set(sessionId, { userId, expiresAt: new Date(Date.now() + SESSION_TTL_MS) });
    return sessionId;
}

function get(sessionId) {
    const session = sessions.get(sessionId);
    if (!session) return null;
    if (session.expiresAt.getTime() <= Date.now()) {
        sessions.delete(sessionId);
        return null;
    }
    return session;
}

function destroy(sessionId) {
    sessions.delete(sessionId);
}

module.exports = { create, get, destroy };
