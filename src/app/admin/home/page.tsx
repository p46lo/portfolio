"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

interface HeroSettings {
  name: string;
  title: string;
  tagline: string;
  availability: string;
}

interface SocialSettings {
  github_url: string;
  linkedin_url: string;
  twitter_url: string;
  email: string;
  whatsapp?: string;
}

interface CtaSettings {
  primaryText: string;
  primaryLink: string;
  secondaryText: string;
  secondaryLink: string;
}

interface HomeSettings {
  hero: HeroSettings;
  social: SocialSettings;
  cta: CtaSettings;
}

interface DbSettings {
  id: string;
  value: Record<string, unknown>;
  updated_at: string;
}

const defaultHero: HeroSettings = {
  name: "",
  title: "",
  tagline: "",
  availability: "Available for work",
};

const defaultSocial: SocialSettings = {
  github_url: "",
  linkedin_url: "",
  twitter_url: "",
  email: "",
  whatsapp: "",
};

const defaultCta: CtaSettings = {
  primaryText: "View Projects",
  primaryLink: "/projects",
  secondaryText: "Contact Me",
  secondaryLink: "/contact",
};

export default function HomeSettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hero, setHero] = useState<HeroSettings>(defaultHero);
  const [social, setSocial] = useState<SocialSettings>(defaultSocial);
  const [cta, setCta] = useState<CtaSettings>(defaultCta);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("settings")
        .select("*")
        .in("id", ["home.hero", "home.social", "home.cta"]);

      if (fetchError) throw fetchError;

      if (data) {
        const heroData = data.find((s: DbSettings) => s.id === "home.hero");
        const socialData = data.find((s: DbSettings) => s.id === "home.social");
        const ctaData = data.find((s: DbSettings) => s.id === "home.cta");

        if (heroData?.value) {
          setHero({
            name: (heroData.value as HeroSettings).name || "",
            title: (heroData.value as HeroSettings).title || "",
            tagline: (heroData.value as HeroSettings).tagline || "",
            availability: (heroData.value as HeroSettings).availability || "Available for work",
          });
        }

        if (socialData?.value) {
          setSocial({
            github_url: (socialData.value as SocialSettings).github_url || "",
            linkedin_url: (socialData.value as SocialSettings).linkedin_url || "",
            twitter_url: (socialData.value as SocialSettings).twitter_url || "",
            email: (socialData.value as SocialSettings).email || "",
            whatsapp: (socialData.value as SocialSettings).whatsapp || "",
          });
        }

        if (ctaData?.value) {
          setCta({
            primaryText: (ctaData.value as CtaSettings).primaryText || "View Projects",
            primaryLink: (ctaData.value as CtaSettings).primaryLink || "/projects",
            secondaryText: (ctaData.value as CtaSettings).secondaryText || "Contact Me",
            secondaryLink: (ctaData.value as CtaSettings).secondaryLink || "/contact",
          });
        }
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const { error: heroError } = await supabase
        .from("settings")
        .upsert({
          id: "home.hero",
          value: {
            name: hero.name,
            title: hero.title,
            tagline: hero.tagline,
            availability: hero.availability,
          },
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" });

      if (heroError) throw heroError;

      const { error: socialError } = await supabase
        .from("settings")
        .upsert({
          id: "home.social",
          value: social,
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" });

      if (socialError) throw socialError;

      const { error: ctaError } = await supabase
        .from("settings")
        .upsert({
          id: "home.cta",
          value: {
            primaryText: cta.primaryText,
            primaryLink: cta.primaryLink,
            secondaryText: cta.secondaryText,
            secondaryLink: cta.secondaryLink,
          },
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" });

      if (ctaError) throw ctaError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
      setError("Failed to save settings");
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
        <h1 className="text-3xl font-bold tracking-tight">Home Page Settings</h1>
        <p className="text-muted-foreground">
          Configure your home page hero section and call-to-action buttons
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Hero Section */}
        <Card>
          <CardHeader>
            <CardTitle>Hero Section</CardTitle>
            <CardDescription>
              The main introduction that appears at the top of your home page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={hero.name}
                onChange={(e) => setHero({ ...hero, name: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Appears as &quot;Hi, I&apos;m [Name]&quot;
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title / Subtitle</Label>
              <Input
                id="title"
                placeholder="Full Stack Developer"
                value={hero.title}
                onChange={(e) => setHero({ ...hero, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline / Description</Label>
              <Textarea
                id="tagline"
                placeholder="I build beautiful web applications..."
                value={hero.tagline}
                onChange={(e) => setHero({ ...hero, tagline: e.target.value })}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availability">Availability Text</Label>
              <Input
                id="availability"
                placeholder="Available for work"
                value={hero.availability}
                onChange={(e) => setHero({ ...hero, availability: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
            <CardDescription>
              Your social media and contact profiles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="github_url">GitHub URL</Label>
              <Input
                id="github_url"
                placeholder="https://github.com/username"
                value={social.github_url}
                onChange={(e) => setSocial({ ...social, github_url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                placeholder="https://linkedin.com/in/username"
                value={social.linkedin_url}
                onChange={(e) => setSocial({ ...social, linkedin_url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter_url">Twitter URL</Label>
              <Input
                id="twitter_url"
                placeholder="https://twitter.com/username"
                value={social.twitter_url}
                onChange={(e) => setSocial({ ...social, twitter_url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="hello@example.com"
                value={social.email}
                onChange={(e) => setSocial({ ...social, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp URL</Label>
              <Input
                id="whatsapp"
                placeholder="https://wa.me/34600000000"
                value={social.whatsapp || ""}
                onChange={(e) => setSocial({ ...social, whatsapp: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Call to Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Call to Action Buttons</CardTitle>
            <CardDescription>
              Configure the buttons displayed in your hero section
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="primaryText">Primary Button Text</Label>
                <Input
                  id="primaryText"
                  placeholder="View Projects"
                  value={cta.primaryText}
                  onChange={(e) => setCta({ ...cta, primaryText: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryLink">Primary Button Link</Label>
                <Input
                  id="primaryLink"
                  placeholder="/projects"
                  value={cta.primaryLink}
                  onChange={(e) => setCta({ ...cta, primaryLink: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="secondaryText">Secondary Button Text</Label>
                <Input
                  id="secondaryText"
                  placeholder="Contact Me"
                  value={cta.secondaryText}
                  onChange={(e) => setCta({ ...cta, secondaryText: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryLink">Secondary Button Link</Label>
                <Input
                  id="secondaryLink"
                  placeholder="/contact"
                  value={cta.secondaryLink}
                  onChange={(e) => setCta({ ...cta, secondaryLink: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-500">Settings saved successfully!</p>
        )}
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>
    </div>
  );
}
