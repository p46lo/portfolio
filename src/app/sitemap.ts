import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey);
}

const staticPages = [
  '/',
  '/about',
  '/skills',
  '/education',
  '/courses',
  '/research',
  '/projects',
  '/blog',
  '/contact',
  '/auth/signin',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pablo.com';

  const urls: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '/' ? 1 : 0.8,
  }));

  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data: projects } = await supabase
        .from('projects')
        .select('slug, updated_at')
        .order('updated_at', { ascending: false });

      if (projects) {
        const projectUrls = projects.map((project) => ({
          url: `${baseUrl}/projects/${project.slug}`,
          lastModified: new Date(project.updated_at),
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        }));
        urls.push(...projectUrls);
      }

      const { data: blogPosts } = await supabase
        .from('blog_posts')
        .select('slug, updated_at')
        .eq('status', 'published')
        .order('updated_at', { ascending: false });

      if (blogPosts) {
        const blogUrls = blogPosts.map((post) => ({
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: new Date(post.updated_at),
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        }));
        urls.push(...blogUrls);
      }
    } catch (error) {
      console.error('Error fetching dynamic pages for sitemap:', error);
    }
  }

  return urls;
}
