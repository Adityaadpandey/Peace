'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, MoreVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Comment {
  id: number;
  author: string;
  content: string;
  timestamp: string;
  votes: number;
  replies?: Comment[];
}

interface PostCardProps {
  title: string;
  content: string;
  author: string;
  timestamp: string;
  votes: number;
  comments: number;
}

// Mock comments data
const MOCK_COMMENTS: Comment[] = [
  {
    id: 1,
    author: "user123",
    content: "This is a great post! Really insightful.",
    timestamp: "1h ago",
    votes: 15,
    replies: [
      {
        id: 2,
        author: "commenter456",
        content: "I completely agree with your point.",
        timestamp: "45m ago",
        votes: 8,
      }
    ]
  },
  {
    id: 3,
    author: "techie789",
    content: "Interesting perspective, but have you considered...",
    timestamp: "30m ago",
    votes: 12,
  }
];

function CommentThread({ comment, depth = 0 }: { comment: Comment; depth?: number }) {
  const [voteStatus, setVoteStatus] = useState<'up' | 'down' | null>(null);
  const [votes, setVotes] = useState(comment.votes);

  const handleVote = (type: 'up' | 'down') => {
    if (voteStatus === type) {
      setVotes(votes - (type === 'up' ? 1 : -1));
      setVoteStatus(null);
    } else {
      setVotes(votes + (type === 'up' ? 1 : -1) + (voteStatus ? (voteStatus === 'up' ? -1 : 1) : 0));
      setVoteStatus(type);
    }
  };

  return (
    <div className={`pl-${depth * 4}`}>
      <div className="flex items-start space-x-2 mb-2">
        <Avatar className="w-6 h-6">
          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author}`} />
          <AvatarFallback>{comment.author[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{comment.author}</span>
            <span className="text-xs text-muted-foreground">• {comment.timestamp}</span>
          </div>
          <p className="text-sm mt-1">{comment.content}</p>
          <div className="flex items-center space-x-2 mt-1">
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className={`h-6 w-6 ${voteStatus === 'up' ? 'text-orange-500' : ''}`}
                onClick={() => handleVote('up')}
              >
                <ArrowBigUp className="h-4 w-4" />
              </Button>
              <span className="text-xs min-w-[1.5rem] text-center">{votes}</span>
              <Button
                variant="ghost"
                size="icon"
                className={`h-6 w-6 ${voteStatus === 'down' ? 'text-blue-500' : ''}`}
                onClick={() => handleVote('down')}
              >
                <ArrowBigDown className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              Reply
            </Button>
          </div>
        </div>
      </div>
      {comment.replies && (
        <div className="ml-4 pl-4 border-l border-border">
          {comment.replies.map((reply) => (
            <CommentThread key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function PostCard({ title, content, author, timestamp, votes: initialVotes, comments }: PostCardProps) {
  const [votes, setVotes] = useState(initialVotes);
  const [voteStatus, setVoteStatus] = useState<'up' | 'down' | null>(null);
  const [showComments, setShowComments] = useState(false);

  const handleVote = (type: 'up' | 'down') => {
    if (voteStatus === type) {
      setVotes(votes - (type === 'up' ? 1 : -1));
      setVoteStatus(null);
    } else {
      setVotes(votes + (type === 'up' ? 1 : -1) + (voteStatus ? (voteStatus === 'up' ? -1 : 1) : 0));
      setVoteStatus(type);
    }
  };

  return (
    <Card className="mb-4 hover:bg-accent/50 transition-colors">
      <CardHeader className="flex flex-row items-start space-x-4">
        <Avatar className="w-10 h-10">
          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${author}`} />
          <AvatarFallback>{author[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-semibold">r/{author}</span>
            <span className="text-sm text-muted-foreground">• {timestamp}</span>
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
              className={`h-8 w-8 ${voteStatus === 'up' ? 'text-orange-500' : ''}`}
              onClick={() => handleVote('up')}
            >
              <ArrowBigUp className="h-5 w-5" />
            </Button>
            <span className="min-w-[2rem] text-center">{votes}</span>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${voteStatus === 'down' ? 'text-blue-500' : ''}`}
              onClick={() => handleVote('down')}
            >
              <ArrowBigDown className="h-5 w-5" />
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="space-x-2"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageSquare className="h-4 w-4" />
            <span>{comments}</span>
            {showComments ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" className="space-x-2">
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>
        {showComments && (
          <div className="w-full mt-4">
            <ScrollArea className="h-[300px] w-full pr-4">
              {MOCK_COMMENTS.map((comment) => (
                <CommentThread key={comment.id} comment={comment} />
              ))}
            </ScrollArea>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}