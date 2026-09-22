const service = require('../services/postService');
const http = require('../utils/http');

function listPosts(req, res) {
  const result = service.listPosts(req.query);
  return http.sendList(res, result.data, result.meta);
}

function getPost(req, res) {
  const post = service.getPost(req.params.id);
  if (!post) {
    return http.sendError(res, 404, {
      code: 'NOT_FOUND',
      message: 'Post not found'
    });
  }
  return http.sendOk(res, post);
}

function createPost(req, res) {
  const { title, author } = req.body || {};

  if (typeof title !== 'string' || !title.trim() || typeof author !== 'string' || !author.trim()) {
    return http.sendError(res, 400, {
      code: 'VALIDATION_ERROR',
      message: 'Invalid input',
      details: [
        { field: 'title', message: 'Title is required' },
        { field: 'author', message: 'Author is required' }
      ]
    });
  }

  const post = service.createPost({ title: title.trim(), author: author.trim() });
  return http.sendCreated(res, post);
}

function likePost(req, res) {
  const post = service.getPost(req.params.id);
  if (!post) {
    return http.sendError(res, 404, {
      code: 'NOT_FOUND',
      message: 'Post not found'
    });
  }

  const likedPost = service.likePost(req.params.id);
  return http.sendCreated(res, likedPost);
}

function explode(req, res) {
  try {
    service.explode();
  } catch (err) {
    console.error('Internal failure route triggered:', err.stack || err.message);
    return http.sendError(res, 500, {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong'
    });
  }
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  likePost,
  explode
};
