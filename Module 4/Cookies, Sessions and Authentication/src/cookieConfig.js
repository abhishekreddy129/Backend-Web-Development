const ONE_HOUR_MS = 60 * 60 * 1000;
const configuredTtl = Number(process.env.SESSION_TTL_MS);
const SESSION_TTL_MS = Number.isSafeInteger(configuredTtl) && configuredTtl > 0
    ? configuredTtl
    : ONE_HOUR_MS;

const COOKIE_OPTIONS = Object.freeze({
    httpOnly: true,
    sameSite: 'lax',
    signed: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true',
    maxAge: SESSION_TTL_MS,
});

module.exports = { COOKIE_OPTIONS, SESSION_TTL_MS };