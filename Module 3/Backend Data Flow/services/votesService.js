const postsRepo = require('./../repository/postsRepo');
const votesRepo = require('./../repository/votesRepo');
const AppError = require('./../utils/AppError');

/**
 * Cast a vote.
 * A user can vote on a post only once.
 */
exports.castVote = async (postId, userId) => {
  // 1. Post must exist
  const post = await postsRepo.findById(postId);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  // 2. User must not have already voted
  const existing = await votesRepo.find(postId, userId);

  if (existing) {
    throw new AppError('You have already voted on this post', 409);
  }

  // 3. All guards passed, so insert the vote
  return votesRepo.insert(postId, userId);
};

exports.countFor = async (postId) => votesRepo.countByPost(postId);