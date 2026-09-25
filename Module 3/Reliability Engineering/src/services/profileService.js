const DEFAULT_AVATAR = {
  url: 'https://cdn.aurora-profiles.dev/avatars/default.png',
  initials: '?',
  source: 'fallback',
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRetryable(error) {
  if (!error) return false;
  if (error.name === 'AbortError') return true;

  if (typeof error.status !== 'number') return true;

  return error.status === 429 || (error.status >= 500 && error.status <= 599);
}

async function withTimeout(operation, timeoutMs) {
  const controller = new AbortController();
  let timer;

  try {
    const operationResult = Promise.resolve().then(() => operation(controller.signal));
    const timeoutResult = new Promise((resolve, reject) => {
      timer = setTimeout(() => {
        controller.abort();
        const error = new Error('operation timed out');
        error.name = 'AbortError';
        reject(error);
      }, timeoutMs);
    });

    return await Promise.race([operationResult, timeoutResult]);
  } finally {
    clearTimeout(timer);
  }
}

async function withRetry(operation, options = {}) {
  const { maxAttempts = 3, baseDelayMs = 25 } = options;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      const isFinalAttempt = attempt === maxAttempts - 1;
      if (isFinalAttempt || !isRetryable(error)) throw error;

      await sleep(baseDelayMs * 2 ** attempt);
    }
  }
}

async function getProfileWithAvatar(authorId, avatarClient, options = {}) {
  const timeoutMs = options.timeoutMs ?? 200;
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 25;

  try {
    const avatar = await withRetry(
      () => withTimeout(
        signal => avatarClient.getAvatar(authorId, { signal }),
        timeoutMs,
      ),
      { maxAttempts, baseDelayMs },
    );

    return { authorId, avatar, degraded: false };
  } catch (error) {
    return { authorId, avatar: DEFAULT_AVATAR, degraded: true };
  }
}

module.exports = {
  DEFAULT_AVATAR,
  sleep,
  isRetryable,
  withTimeout,
  withRetry,
  getProfileWithAvatar,
};
