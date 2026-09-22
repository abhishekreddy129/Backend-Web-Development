const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createApp, resetData } = require('./app');

async function request(app, method, path, body) {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));

  const { port } = server.address();
  const payload = body ? JSON.stringify(body) : null;

  const response = await fetch(`http://127.0.0.1:${port}${path}`, {
    method,
    headers: payload ? { 'Content-Type': 'application/json' } : undefined,
    body: payload
  });

  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }

  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });

  return { status: response.status, body: json };
}

test.beforeEach(() => resetData());

test('GET /posts returns paginated data with meta envelope', async () => {
  const res = await request(createApp(), 'GET', '/posts');

  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.data));
  assert.equal(res.body.data.length, 5);
  assert.equal(res.body.meta.page, 1);
  assert.equal(res.body.meta.limit, 20);
  assert.equal(res.body.meta.total, 5);
  assert.equal(res.body.meta.pages, 1);
});

test('GET /posts?page=2&limit=2 returns second page metadata and limited data', async () => {
  const res = await request(createApp(), 'GET', '/posts?page=2&limit=2');

  assert.equal(res.status, 200);
  assert.equal(res.body.meta.page, 2);
  assert.equal(res.body.meta.limit, 2);
  assert.equal(res.body.meta.total, 5);
  assert.equal(res.body.meta.pages, 3);
  assert.equal(res.body.data.length, 2);
});

test('GET /posts?limit=1000000 caps limit at 100', async () => {
  const res = await request(createApp(), 'GET', '/posts?limit=1000000');

  assert.equal(res.status, 200);
  assert.equal(res.body.meta.limit, 100);
  assert.ok(res.body.data.length <= 100);
});

test('GET /posts/999999 returns structured 404', async () => {
  const res = await request(createApp(), 'GET', '/posts/999999');

  assert.equal(res.status, 404);
  assert.deepEqual(res.body, {
    error: {
      code: 'NOT_FOUND',
      message: 'Post not found'
    }
  });
});

test('POST /posts creates a post with 201 and data envelope', async () => {
  const res = await request(createApp(), 'POST', '/posts', {
    title: 'New post',
    author: 'carlos'
  });

  assert.equal(res.status, 201);
  assert.equal(res.body.data.title, 'New post');
  assert.equal(res.body.data.author, 'carlos');
  assert.equal(res.body.data.likes, 0);
});

test('POST /posts/1/likes increments likes', async () => {
  const res = await request(createApp(), 'POST', '/posts/1/likes');

  assert.equal(res.status, 201);
  assert.equal(res.body.data.id, 1);
  assert.equal(res.body.data.likes, 1);
});

test('GET /explode returns safe internal error without stack details', async () => {
  const res = await request(createApp(), 'GET', '/explode');

  assert.equal(res.status, 500);
  assert.deepEqual(res.body, {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong'
    }
  });
});

test('Old verb routes are no longer exposed', async () => {
  const res = await request(createApp(), 'GET', '/getPosts');

  assert.equal(res.status, 404);
});
