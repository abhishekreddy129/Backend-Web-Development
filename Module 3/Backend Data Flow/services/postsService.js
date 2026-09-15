const repo = require('./../repository/postsRepo');
const AppError = require('./../utils/AppError');

const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000; // a post may only be edited within 24h

exports.getAll = async () => repo.findAll();

exports.create = async ({ authorId, title, body }) =>
  repo.insert({ authorId, title, body });

/**
 * Edit a post.
 * Guards must run in this exact order:
 * 1. Post must exist
 * 2. Only the author may edit
 * 3. Post must be within the 24-hour edit window
 */
exports.editPost = async (postId, userId, changes) => {
  // 1. Post must exist
  const post = await repo.findById(postId);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  // 2. Only the author may edit
  if (post.authorId !== userId) {
    throw new AppError('You can only edit your own post', 403);
  }

  // 3. Post must be within 24 hours
  const ageMs = Date.now() - post.createdAt;

  if (ageMs > EDIT_WINDOW_MS) {
    throw new AppError('Post can no longer be edited', 403);
  }

  // 4. All guards passed, so update the post
  return repo.update(postId, changes);
};