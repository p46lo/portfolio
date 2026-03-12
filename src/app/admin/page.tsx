"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase";
import {
  FolderKanban,
  FileText,
  Brain,
  MessageSquare,
  Loader2,
} from "lucide-react";

export default function AdminDashboard() {
  const supabase = createClient();
  
  const [stats, setStats] = useState({
    projects: 0,
    blogPosts: 0,
    documents: 0,
    conversations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch projects count
      const { count: projectsCount } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true });

      // Fetch blog posts count
      const { count: blogCount } = await supabase
        .from("blog_posts")
        .select("*", { count: "exact", head: true });

      // Fetch documents count
      const { count: docsCount } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true });

      // Fetch conversations count
      const { count: convCount } = await supabase
        .from("conversations")
        .select("*", { count: "exact", head: true });

      setStats({
        projects: projectsCount || 0,
        blogPosts: blogCount || 0,
        documents: docsCount || 0,
        conversations: convCount || 0,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Projects",
      value: stats.projects,
      description: "Total projects",
      icon: FolderKanban,
    },
    {
      title: "Blog Posts",
      value: stats.blogPosts,
      description: "Published posts",
      icon: FileText,
    },
    {
      title: "Documents",
      value: stats.documents,
      description: "In knowledge base",
      icon: Brain,
    },
    {
      title: "Conversations",
      value: stats.conversations,
      description: "Chat sessions",
      icon: MessageSquare,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your portfolio admin panel
        </p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <a
                href="/admin/projects"
                className="flex items-center justify-center rounded-lg border p-4 text-sm font-medium transition-colors hover:bg-muted"
              >
                Add Project
              </a>
              <a
                href="/admin/knowledge"
                className="flex items-center justify-center rounded-lg border p-4 text-sm font-medium transition-colors hover:bg-muted"
              >
                Upload Doc
              </a>
              <a
                href="/admin/settings"
                className="flex items-center justify-center rounded-lg border p-4 text-sm font-medium transition-colors hover:bg-muted"
              >
                Settings
              </a>
              <a
                href="/"
                className="flex items-center justify-center rounded-lg border p-4 text-sm font-medium transition-colors hover:bg-muted"
              >
                View Site
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="text-sm font-medium">Supabase</p>
                  <p className="text-xs text-muted-foreground">Database</p>
                </div>
                <span className="text-xs text-green-600 font-medium">Connected</span>
              </div>
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="text-sm font-medium">API</p>
                  <p className="text-xs text-muted-foreground">Backend</p>
                </div>
                <span className="text-xs text-green-600 font-medium">Running</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Vector Store</p>
                  <p className="text-xs text-muted-foreground">pgvector</p>
                </div>
                <span className="text-xs text-green-600 font-medium">Ready</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
