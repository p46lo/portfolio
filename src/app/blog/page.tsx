import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Fetch blog posts from database
async function getBlogPosts() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return [];
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    return [];
  }

  return data || [];
}

// Demo blog posts
const DEMO_POSTS = [
  {
    id: "demo-1",
    title: "Getting Started with Next.js 14",
    slug: "getting-started-nextjs-14",
    excerpt: "Learn how to build modern web applications with Next.js 14 and the App Router.",
    published_at: "2024-01-15",
    reading_time: 8,
    tags: ["Next.js", "React", "Tutorial"],
  },
  {
    id: "demo-2",
    title: "Building a RAG Chatbot from Scratch",
    slug: "building-rag-chatbot",
    excerpt: "A comprehensive Guide to building an AI-powered chatbot with retrieval-augmented generation.",
    published_at: "2024-01-10",
    reading_time: 15,
    tags: ["AI", "RAG", "LangChain"],
  },
  {
    id: "demo-3",
    title: "Mastering TypeScript Generics",
    slug: "mastering-typescript-generics",
    excerpt: "Deep dive into TypeScript generics and how to use them effectively in your code.",
    published_at: "2024-01-05",
    reading_time: 12,
    tags: ["TypeScript", "Tutorial"],
  },
];

export default async function BlogPage() {
  const blogPosts = await getBlogPosts();
  const displayPosts = blogPosts.length > 0 ? blogPosts : DEMO_POSTS;

  return (
    <div className="container px-4 py-12 mx-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Blog</h1>
          <p className="text-lg text-muted-foreground">
            Thoughts on development, technology, and learning
          </p>
        </div>

        {blogPosts.length === 0 && (
          <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              ⚠️ No published blog posts. Showing demo data. Add posts in /admin panel.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {displayPosts.map((post: any) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  <time>{post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Draft'}</time>
                  {post.reading_time && (
                    <>
                      <span>·</span>
                      <span>{post.reading_time} min read</span>
                    </>
                  )}
                </div>
                <CardTitle className="text-xl">{post.title}</CardTitle>
                <CardDescription className="text-base">
                  {post.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {post.tags && post.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Button variant="ghost" asChild>
                    <Link href={`/blog/${post.slug}`}>
                      Read more <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {displayPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No blog posts yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
