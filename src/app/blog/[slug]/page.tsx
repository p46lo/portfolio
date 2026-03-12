import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, ArrowRight } from "lucide-react";

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  // In production, fetch the post from the database based on params.slug
  const post = {
    title: "Getting Started with Next.js 14",
    content: `
# Getting Started with Next.js 14

Next.js 14 brings exciting new features and improvements to the React framework. In this guide, we'll explore what's new and how to get started.

## What's New in Next.js 14?

### App Router Improvements
The App Router has matured significantly in version 14, with better performance and more intuitive APIs.

### Turbopack
The new Rust-based bundler is now stable and offers dramatically faster build times.

### Server Actions
Simplify your data mutations with the new Server Actions feature.

## Getting Started

\`\`\`bash
npx create-next-app@latest my-app
\`\`\`

Choose TypeScript, TailwindCSS, and the App Router to get started quickly.

## Conclusion

Next.js 14 is a major step forward for React development. Start building with it today!
    `,
    published_at: "2024-01-15",
    reading_time: 8,
    tags: ["Next.js", "React", "Tutorial"],
  };

  return (
    <div className="container px-4 py-12 mx-auto">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/blog">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>
        </Button>

        <article className="prose dark:prose-invert max-w-none">
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(post.published_at).toLocaleDateString()}
            </span>
            <span>{post.reading_time} min read</span>
          </div>

          <h1 className="text-4xl font-bold mb-8">{post.title}</h1>

          <div className="flex gap-2 mb-8">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="whitespace-pre-wrap font-sans">
            {post.content}
          </div>
        </article>
      </div>
    </div>
  );
}
