// Replacing this in-memory store with Prisma changes storage only; keep this repository contract unchanged.
// Services continue depending on this contract, so services, controllers, and routes need no storage-specific changes.
const postStore = require('../data/postStore');

const posts = new Map(postStore.posts.map((post) => [post.id, { ...post }]));
let nextId = Math.max(0, ...posts.keys()) + 1;

function findAll() {
  return Array.from(posts.values(), (post) => ({ ...post }));
}

function findById(id) {
  const post = posts.get(Number(id));
  return post ? { ...post } : null;
}

function create(fields) {
  const post = {
    id: nextId++,
    title: fields.title,
    body: fields.body || '',
    authorId: fields.authorId,
  };
  posts.set(post.id, post);
  return { ...post };
}

function update(id, patch) {
  const post = posts.get(Number(id));
  if (!post) return null;
  if (patch.title !== undefined) post.title = patch.title;
  if (patch.body !== undefined) post.body = patch.body;
  return { ...post };
}

function remove(id) {
  return posts.delete(Number(id));
}

module.exports = { findAll, findById, create, update, remove };
