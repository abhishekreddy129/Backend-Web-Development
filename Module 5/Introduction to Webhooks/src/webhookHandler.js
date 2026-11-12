'use strict';

// ─── YOUR FILE — implement this ───────────────────────────────────────────────
// Export handleWebhook(req, res), used by POST /webhooks in app.js.
// Also export _processedIds (your Set or Map) for test inspection/reset.
//
// Steps (in order):
//  1. Verify HMAC-SHA256 signature
//     - Signature header: req.headers['x-webhook-signature'] → 'sha256=<hex>'
//     - Compute: crypto.createHmac('sha256', WEBHOOK_SECRET).update(req.body).digest('hex')
//     - Compare: crypto.timingSafeEqual(Buffer.from(expected,'hex'), Buffer.from(received,'hex'))
//     - Mismatch or missing → res.status(401).json({ error: 'Invalid signature' })
//
//  2. Parse body: const event = JSON.parse(req.body)
//
//  3. Idempotency: if _processedIds.has(event.id) → res.status(200).json({ status: 'already_processed' })
//
//  4. Mark: _processedIds.add(event.id)
//
//  5. Acknowledge: res.status(200).json({ status: 'received' })
//     Then call handleEvent(event) inside setImmediate(() => { ... })

const { handleEvent } = require('./eventHandlers');
const crypto = require('node:crypto');

const _processedIds = new Set();

async function handleWebhook(req, res) {
  const secret = process.env.WEBHOOK_SECRET;
  const signature = req.headers['x-webhook-signature'];

  if (typeof secret !== 'string' || secret.length === 0) {
    console.error('WEBHOOK_SECRET is not configured');
    return res.status(500).json({ error: 'Webhook secret is not configured' });
  }

  if (!Buffer.isBuffer(req.body)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  if (typeof signature !== 'string' || !/^sha256=[\da-f]{64}$/i.test(signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(req.body)
    .digest('hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  const receivedBuffer = Buffer.from(signature.slice('sha256='.length), 'hex');

  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let event;
  try {
    event = JSON.parse(req.body);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  if (event === null || typeof event !== 'object' || event.id === undefined || event.id === null) {
    return res.status(400).json({ error: 'Invalid event' });
  }

  if (_processedIds.has(event.id)) {
    return res.status(200).json({ status: 'already_processed' });
  }

  _processedIds.add(event.id);
  res.status(200).json({ status: 'received' });

  setImmediate(() => {
    Promise.resolve()
      .then(() => handleEvent(event))
      .catch((error) => {
        console.error('Webhook event processing failed', error);
      });
  });
}

module.exports = { handleWebhook, _processedIds };
