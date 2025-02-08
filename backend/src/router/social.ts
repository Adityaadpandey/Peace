import { PostCategory, PrismaClient } from '@prisma/client';
import { RequestHandler, Router } from 'express';

const router = Router();
const prisma = new PrismaClient();

// Types
interface CreatePostBody {
  content: string;
  category: PostCategory;
  isPrivate?: boolean;
  userId?: string;
  doctorId?: string;
}

interface UpdatePostBody {
  content?: string;
  category?: PostCategory;
  isPrivate?: boolean;
}

interface CreateCommentBody {
  content: string;
  userId?: string;
  doctorId?: string;
}

// Posts Routes

// GET /api/posts - Fetch all posts
const getPosts: RequestHandler = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        isPrivate: false
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            username: true,
            avatar: true
          }
        },
        doctor: {
          select: {
            name: true,
            avatar: true,
            speciality: true
          }
        },
        _count: {
          select: {
            comments: true,
            likes: true,
            savedBy: true
          }
        }
      }
    });

    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

// POST /api/posts - Create a new post
const createPost: RequestHandler<{}, any, CreatePostBody> = async (req, res) => {
  const { content, category, isPrivate, userId, doctorId } = req.body;

  if (!content || !category) {
    res.status(400).json({ error: 'Content and category are required' });
    return;
  }

  if (!userId && !doctorId) {
    res.status(400).json({ error: 'Either userId or doctorId is required' });
    return;
  }

  try {
    const post = await prisma.post.create({
      data: {
        content,
        category,
        isPrivate: isPrivate || false,
        userId,
        doctorId
      },
      include: {
        user: {
          select: {
            username: true,
            avatar: true
          }
        },
        doctor: {
          select: {
            name: true,
            avatar: true,
            speciality: true
          }
        }
      }
    });

    res.json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

// PUT /api/posts/:id - Update a post
const updatePost: RequestHandler<{ id: string }, any, UpdatePostBody> = async (req, res) => {
  const { id } = req.params;
  const { content, category, isPrivate } = req.body;

  try {
    const post = await prisma.post.update({
      where: { id },
      data: {
        ...(content && { content }),
        ...(category && { category }),
        ...(typeof isPrivate === 'boolean' && { isPrivate })
      }
    });

    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
};

// DELETE /api/posts/:id - Delete a post
const deletePost: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.post.delete({
      where: { id }
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};

// Comments Routes

// POST /api/posts/:postId/comments - Add a comment
const addComment: RequestHandler<{ postId: string }, any, CreateCommentBody> = async (req, res) => {
  const { postId } = req.params;
  const { content, userId, doctorId } = req.body;

  if (!content) {
    res.status(400).json({ error: 'Content is required' });
    return;
  }

  if (!userId && !doctorId) {
    res.status(400).json({ error: 'Either userId or doctorId is required' });
    return;
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        userId,
        doctorId
      },
      include: {
        user: {
          select: {
            username: true,
            avatar: true
          }
        },
        doctor: {
          select: {
            name: true,
            avatar: true
          }
        }
      }
    });

    // Update post's comment count
    await prisma.post.update({
      where: { id: postId },
      data: { commentsCount: { increment: 1 } }
    });

    res.json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Likes Routes

// POST /api/posts/:postId/like - Like a post
const likePost: RequestHandler<{ postId: string }> = async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    res.status(400).json({ error: 'userId is required' });
    return;
  }

  try {
    const like = await prisma.like.create({
      data: {
        postId,
        userId
      }
    });

    // Update post's like count
    await prisma.post.update({
      where: { id: postId },
      data: { likesCount: { increment: 1 } }
    });

    res.json(like);
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
};

// POST /api/posts/:postId/save - Save a post
const savePost: RequestHandler<{ postId: string }> = async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    res.status(400).json({ error: 'userId is required' });
    return;
  }

  try {
    const savedPost = await prisma.savedPost.create({
      data: {
        postId,
        userId
      }
    });

    // Update post's save count
    await prisma.post.update({
      where: { id: postId },
      data: { saveCount: { increment: 1 } }
    });

    res.json(savedPost);
  } catch (error) {
    console.error('Error saving post:', error);
    res.status(500).json({ error: 'Failed to save post' });
  }
};

// Follow Routes

// POST /api/follow/:userId - Follow a user
const followUser: RequestHandler<{ userId: string }> = async (req, res) => {
  const { userId } = req.params;
  const { followerId } = req.body;

  if (!followerId) {
    res.status(400).json({ error: 'followerId is required' });
    return;
  }

  try {
    const follow = await prisma.follow.create({
      data: {
        followerId,
        followingId: userId
      }
    });

    // Update follower counts
    await prisma.$transaction([
      prisma.user.update({
        where: { id: followerId },
        data: { followingCount: { increment: 1 } }
      }),
      prisma.user.update({
        where: { id: userId },
        data: { followersCount: { increment: 1 } }
      })
    ]);

    res.json(follow);
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
};

// DELETE /api/follow/:userId - Unfollow a user
const unfollowUser: RequestHandler<{ userId: string }> = async (req, res) => {
  const { userId } = req.params;
  const { followerId } = req.body;

  if (!followerId) {
    res.status(400).json({ error: 'followerId is required' });
    return;
  }

  try {
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId: userId
        }
      }
    });

    // Update follower counts
    await prisma.$transaction([
      prisma.user.update({
        where: { id: followerId },
        data: { followingCount: { decrement: 1 } }
      }),
      prisma.user.update({
        where: { id: userId },
        data: { followersCount: { decrement: 1 } }
      })
    ]);

    res.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
};

// Register routes
router.get('/', getPosts);
router.post('/', createPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);
router.post('/:postId/comments', addComment);
router.post('/:postId/like', likePost);
router.post('/:postId/save', savePost);
router.post('/follow/:userId', followUser);
router.delete('/follow/:userId', unfollowUser);

export { router as socialRoute };
