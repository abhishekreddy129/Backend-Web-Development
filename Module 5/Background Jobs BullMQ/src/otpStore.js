'use strict';

const { randomInt } = require('node:crypto');

const _store = new Map();

function generateOTP() {
  return randomInt(100000, 1000000).toString();
}

function storeOTP(email, otp) {
  _store.set(email, {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
    attempts: 0,
  });
}

function verifyOTP(email, code) {
  const entry = _store.get(email);

  if (!entry) {
    return { ok: false, reason: 'not_found' };
  }

  if (Date.now() >= entry.expiresAt) {
    _store.delete(email);
    return { ok: false, reason: 'expired' };
  }

  if (entry.attempts >= 3) {
    return { ok: false, reason: 'too_many_attempts' };
  }

  if (entry.otp !== code) {
    entry.attempts += 1;
    return { ok: false, reason: 'wrong_code' };
  }

  _store.delete(email);
  return { ok: true };
}

function markVerified(email) {
  console.log(`Email verified: ${email}`);
}

module.exports = { generateOTP, storeOTP, verifyOTP, markVerified, _store };
