import { PostCard } from '@/components/post-card';
import { Navbar } from '@/components/navbar';
import { CreatePost } from '@/components/create-post';

const MOCK_POSTS = [
  {
    title: "What's your favorite programming language and why?",
    content: "I've been coding for a while now and I'm curious to hear what languages other developers prefer. Personally, I'm a big fan of TypeScript because of its type safety and great tooling.",
    author: "techie123",
    timestamp: "2h ago",
    votes: 142,
    comments: 45,
  },
  {
    title: "Just built my first mechanical keyboard!",
    content: "After months of research and waiting for parts, I finally built my first custom mechanical keyboard. It's a 65% with Gateron Black Ink switches and GMK keycaps.",
    author: "keeb_enthusiast",
    timestamp: "4h ago",
    votes: 89,
    comments: 23,
  },
  {
    title: "Amazing sunset at the beach today",
    content: "Caught this incredible sunset at Venice Beach today. The colors were absolutely breathtaking!",
    author: "sunset_chaser",
    timestamp: "6h ago",
    votes: 234,
    comments: 12,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-2xl mx-auto p-4">
        <div className="space-y-4">
          {MOCK_POSTS.map((post, index) => (
            <PostCard key={index} {...post} />
          ))}
        </div>
      </main>
      <CreatePost />
    </div>
  );
}