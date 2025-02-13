'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Heart, MessageSquare, Share2, MoreVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

// Updated interfaces to match API response
interface Commenter {
  type: 'user' | 'doctor';
  name: string;
  avatar: string | null;
  isVerified?: boolean;
  speciality?: string | null;
}

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  likesCount: number;
  repliesCount: number;
  likes: Array<{ userId: string }>;
  commenter: Commenter;
  replies: Comment[];
}

interface PostCardProps {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  hasLiked?: boolean;
}

async function updateLike({ type, action, id }: { type: 'comment' | 'post'; action: 'add' | 'remove'; id: string }) {
  try {
    const response = await fetch('/api/update-vote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, action, id }),
    });

    if (!response.ok) {
      throw new Error('Failed to update like');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating like:', error);
    return null;
  }
}


async function submitComment({ postId, content, parentId }: { postId: string; content: string; parentId?: string }) {
  try {
    console.log(postId, content, parentId);
    
    const response = await fetch('/api/add-comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postId, content, parentId }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit comment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting comment:', error);
    return null;
  }
}


function CommentForm({ postId, parentId, onSuccess }: { postId: string; parentId?: string; onSuccess: () => void }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const result = await submitComment({ postId, content, parentId });

      if (result) {
        setContent('');
        onSuccess();
      } else {
        setError('Failed to submit comment');
      }
    } catch (err) {
      setError('An error occurred while submitting');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        placeholder="Write a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[80px]"
      />
      <div className="flex justify-end space-x-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setContent('')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
        >
          {parentId ? 'Reply' : 'Comment'}
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}


function CommentThread({ comment, postId, depth = 0 }: { comment: Comment; postId: string; depth?: number }) {
  const [hasLiked, setHasLiked] = useState(false); // You might want to check if current user's ID is in likes array
  const [likes, setLikes] = useState(comment.likesCount);
  const [isLiking, setIsLiking] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLike = async () => {
    if (isLiking) return;

    try {
      setIsLiking(true);
      setError(null);

      const newLikeCount = hasLiked ? likes - 1 : likes + 1;
      setLikes(newLikeCount);
      setHasLiked(!hasLiked);

      const action = hasLiked ? 'remove' : 'add';
      const result = await updateLike({ type: 'comment', action, id: comment.id });

      if (!result) {
        setLikes(likes);
        setHasLiked(hasLiked);
        setError('Failed to update like');
      }
    } catch (err) {
      setLikes(likes);
      setHasLiked(hasLiked);
      setError('An error occurred');
    } finally {
      setIsLiking(false);
    }
  };

  const formattedDate = new Date(comment.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className={`pl-${depth * 4}`}>
      <div className="flex items-start space-x-2 mb-2">
        <Avatar className="w-6 h-6">
          <AvatarImage src={comment.commenter.avatar || undefined} />
          <AvatarFallback>{comment.commenter.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{comment.commenter.name}</span>
            {comment.commenter.type === 'doctor' && comment.commenter.isVerified && (
              <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                Verified Doctor
              </span>
            )}
            <span className="text-xs text-muted-foreground">• {formattedDate}</span>
          </div>
          <p className="text-sm mt-1">{comment.content}</p>
          <div className="flex items-center space-x-2 mt-1">
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className={`h-6 w-6 ${hasLiked ? 'text-red-500' : ''}`}
                onClick={handleLike}
                disabled={isLiking}
              >
                <Heart className="h-4 w-4" />
              </Button>
              <span className="text-xs min-w-[1.5rem] text-center">{likes}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              Reply
            </Button>
          </div>
          {error && <span className="text-sm text-red-500">{error}</span>}
          {showReplyForm && (
            <div className="mt-2">
              <CommentForm
                postId={postId}
                parentId={comment.id}
                onSuccess={() => setShowReplyForm(false)}
              />
            </div>
          )}
        </div>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-4 pl-4 border-l border-border">
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function PostCard({
  id,
  title,
  content,
  author,
  createdAt,
  likesCount: initialLikes,
  commentsCount,
  hasLiked: initialHasLiked = false
}: PostCardProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleLike = async () => {
    if (isLiking) return;

    try {
      setIsLiking(true);
      setError(null);

      const newLikeCount = hasLiked ? likes - 1 : likes + 1;
      setLikes(newLikeCount);
      setHasLiked(!hasLiked);

      const action = hasLiked ? 'remove' : 'add';
      const result = await updateLike({ type: 'post', action, id });

      if (!result) {
        setLikes(likes);
        setHasLiked(hasLiked);
        setError('Failed to update like');
      }
    } catch (err) {
      setLikes(likes);
      setHasLiked(hasLiked);
      setError('An error occurred');
    } finally {
      setIsLiking(false);
    }
  };

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/posts/${id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments); // Updated to match API response structure
      }
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  };

  const handleToggleComments = () => {
    setShowComments(!showComments);
    if (!showComments) {
      loadComments();
    }
  };

  return (
    <Card className="mb-4 hover:bg-accent/50 transition-colors">
      {/* Rest of the PostCard JSX remains the same */}
      <CardHeader className="flex flex-row items-start space-x-4">
        <Avatar className="w-10 h-10">
          <AvatarImage src={author.avatar} />
          <AvatarFallback>{author.username[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-semibold">{author.username}</span>
            <span className="text-sm text-muted-foreground">• {createdAt}</span>
          </div>
          <h3 className="text-lg font-semibold mt-1">{title}</h3>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40">
            <div className="flex flex-col space-y-1">
              <Button variant="ghost" className="justify-start">Save</Button>
              <Button variant="ghost" className="justify-start">Report</Button>
              <Button variant="ghost" className="justify-start">Hide</Button>
            </div>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{content}</p>
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="flex items-center space-x-4 w-full">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${hasLiked ? 'text-red-500' : ''}`}
              onClick={handleLike}
              disabled={isLiking}
            >
              <Heart className="h-5 w-5" />
            </Button>
            <span className="min-w-[2rem] text-center">{likes}</span>
          </div>
          {error && <span className="text-sm text-red-500">{error}</span>}
          <Button
            variant="ghost"
            size="sm"
            className="space-x-2"
            onClick={() => setShowCommentForm(!showCommentForm)}
          >
            Reply
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="space-x-2"
            onClick={handleToggleComments}
          >
            <MessageSquare className="h-4 w-4" />
            <span>{commentsCount}</span>
            {showComments ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" className="space-x-2">
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>
        {showCommentForm && (
          <div className="w-full mt-4">
            <CommentForm postId={id} onSuccess={() => loadComments()} />
          </div>
        )}
        {showComments && (
          <div className="w-full mt-4">
            <ScrollArea className="h-[300px] w-full pr-4">
              {comments.map((comment) => (
                <CommentThread key={comment.id} comment={comment} postId={id} />
              ))}
            </ScrollArea>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}