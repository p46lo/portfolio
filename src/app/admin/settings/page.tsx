"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

interface SiteSettings {
  siteName: string;
  siteDescription: string;
}

interface FeatureSettings {
  enableChatbot: boolean;
  enableAnalytics: boolean;
}

interface DbSettings {
  id: string;
  value: Record<string, unknown>;
  updated_at: string;
}

export default function SettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: "My Portfolio",
    siteDescription: "Personal developer portfolio",
  });
  const [featureSettings, setFeatureSettings] = useState<FeatureSettings>({
    enableChatbot: true,
    enableAnalytics: false,
  });

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
        .in("id", ["site", "features"]);

      if (fetchError) throw fetchError;

      if (data) {
        const siteData = data.find((s: DbSettings) => s.id === "site");
        const featureData = data.find((s: DbSettings) => s.id === "features");

        if (siteData?.value) {
          setSiteSettings({
            siteName: (siteData.value as SiteSettings).siteName || "My Portfolio",
            siteDescription: (siteData.value as SiteSettings).siteDescription || "Personal developer portfolio",
          });
        }

        if (featureData?.value) {
          setFeatureSettings({
            enableChatbot: (featureData.value as FeatureSettings).enableChatbot ?? true,
            enableAnalytics: (featureData.value as FeatureSettings).enableAnalytics ?? false,
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
      const { error: siteError } = await supabase
        .from("settings")
        .upsert({
          id: "site",
          value: siteSettings,
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" });

      if (siteError) throw siteError;

      const { error: featureError } = await supabase
        .from("settings")
        .upsert({
          id: "features",
          value: featureSettings,
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" });

      if (featureError) throw featureError;

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
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your portfolio settings
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Site Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Site Information</CardTitle>
            <CardDescription>
              Basic information about your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={siteSettings.siteName}
                onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Description</Label>
              <Input
                id="siteDescription"
                value={siteSettings.siteDescription}
                onChange={(e) => setSiteSettings({ ...siteSettings, siteDescription: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Feature Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>
              Toggle features on your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableChatbot">AI Chatbot</Label>
                <p className="text-sm text-muted-foreground">
                  Enable the AI chatbot widget
                </p>
              </div>
              <Switch
                id="enableChatbot"
                checked={featureSettings.enableChatbot}
                onCheckedChange={(checked) => setFeatureSettings({ ...featureSettings, enableChatbot: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableAnalytics">Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Enable analytics tracking
                </p>
              </div>
              <Switch
                id="enableAnalytics"
                checked={featureSettings.enableAnalytics}
                onCheckedChange={(checked) => setFeatureSettings({ ...featureSettings, enableAnalytics: checked })}
              />
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
