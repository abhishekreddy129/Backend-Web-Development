'use strict';
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    const resetTime = req.rateLimit.resetTime;
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((resetTime.getTime() - Date.now()) / 1000)
    );

    res.setHeader('Retry-After', String(retryAfterSeconds));
    res.status(429).json({ error: 'Too many requests, please try again later.' });
  },
});

// The default MemoryStore keeps counters in each individual Node.js process.
// Behind a load balancer, each application instance has a separate counter, so
// a user can exceed the intended limit by sending requests to different instances.
// A RedisStore from rate-limit-redis can replace MemoryStore via the `store`
// option in this configuration, giving all instances one shared Redis counter.
module.exports = authLimiter;
