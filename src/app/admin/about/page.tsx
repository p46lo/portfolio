"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

interface AboutData {
  title: string;
  bio: string;
  profile_image_url: string;
  social_links: Record<string, string>;
}

interface DbSettings {
  id: string;
  value: Record<string, unknown>;
  updated_at: string;
}

export default function AboutAdminPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<AboutData>({
    title: "",
    bio: "",
    profile_image_url: "",
    social_links: {},
  });

  const [socialLinksText, setSocialLinksText] = useState("");

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("id", "about")
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        const value = data.value as AboutData;
        setFormData({
          title: value.title || "",
          bio: value.bio || "",
          profile_image_url: value.profile_image_url || "",
          social_links: value.social_links || {},
        });

        const linksText = Object.entries(value.social_links || {})
          .map(([platform, url]) => `${platform}: ${url}`)
          .join("\n");
        setSocialLinksText(linksText);
      }
    } catch (err: any) {
      console.error("Error fetching about:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const parseSocialLinks = (text: string): Record<string, string> => {
    const links: Record<string, string> = {};
    const lines = text.split("\n").filter(Boolean);
    for (const line of lines) {
      const colonIndex = line.indexOf(":");
      if (colonIndex > 0) {
        const platform = line.substring(0, colonIndex).trim().toLowerCase();
        const url = line.substring(colonIndex + 1).trim();
        if (platform && url) {
          links[platform] = url;
        }
      }
    }
    return links;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const aboutData = {
        title: formData.title,
        bio: formData.bio,
        profile_image_url: formData.profile_image_url || null,
        social_links: parseSocialLinks(socialLinksText),
      };

      const { error: upsertError } = await supabase
        .from("settings")
        .upsert(
          {
            id: "about",
            value: aboutData,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      if (upsertError) throw upsertError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error saving about:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">About</h1>
        <p className="text-muted-foreground">
          Manage your about/bio content
        </p>
      </div>

      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <p className="text-sm text-green-600">About content saved successfully!</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>About Content</CardTitle>
          <CardDescription>
            This content appears on your about page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="About Me"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile_image_url">Profile Image URL</Label>
              <Input
                id="profile_image_url"
                type="url"
                value={formData.profile_image_url}
                onChange={(e) =>
                  setFormData({ ...formData, profile_image_url: e.target.value })
                }
                placeholder="https://example.com/profile.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Tell us about yourself..."
                className="min-h-[200px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="social_links">Social Links (one per line, format: platform: url)</Label>
              <Textarea
                id="social_links"
                value={socialLinksText}
                onChange={(e) => setSocialLinksText(e.target.value)}
                placeholder="github: https://github.com/username&#10;linkedin: https://linkedin.com/in/username&#10;twitter: https://twitter.com/username"
                className="min-h-[150px]"
              />
            </div>

            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save About Content
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
