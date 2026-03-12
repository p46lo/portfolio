"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase";
import { Loader2, Plus, Trash2, Edit2 } from "lucide-react";

export default function ResearchAdminPage() {
  const supabase = createClient();

  const [research, setResearch] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    publication_date: "",
    conference_journal: "",
    abstract: "",
    paper_url: "",
    code_url: "",
  });

  useEffect(() => {
    fetchResearch();
  }, []);

  const fetchResearch = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("research")
        .select("*")
        .order("publication_date", { ascending: false });

      if (error) throw error;
      setResearch(data || []);
    } catch (err: any) {
      console.error("Error fetching research:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const itemData = {
        title: formData.title,
        publication_date: formData.publication_date || null,
        conference_journal: formData.conference_journal || null,
        abstract: formData.abstract || null,
        paper_url: formData.paper_url || null,
        code_url: formData.code_url || null,
      };

      if (editingItem) {
        const { error } = await supabase
          .from("research")
          .update({
            ...itemData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("research")
          .insert(itemData);

        if (error) throw error;
      }

      await fetchResearch();
      hideForm();
    } catch (err: any) {
      console.error("Error saving research:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this research paper?")) return;

    try {
      const { error } = await supabase
        .from("research")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchResearch();
    } catch (err: any) {
      console.error("Error deleting research:", err);
      setError(err.message);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      title: item.title || "",
      publication_date: item.publication_date || "",
      conference_journal: item.conference_journal || "",
      abstract: item.abstract || "",
      paper_url: item.paper_url || "",
      code_url: item.code_url || "",
    });
    setShowForm(true);
  };

  const hideForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({
      title: "",
      publication_date: "",
      conference_journal: "",
      abstract: "",
      paper_url: "",
      code_url: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Research</h1>
          <p className="text-muted-foreground">Manage your research papers and publications</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Research
        </Button>
      </div>

      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {(showForm || editingItem) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingItem ? "Edit Research" : "New Research"}
            </CardTitle>
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
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="publication_date">Publication Date</Label>
                  <Input
                    id="publication_date"
                    type="date"
                    value={formData.publication_date}
                    onChange={(e) =>
                      setFormData({ ...formData, publication_date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conference_journal">Conference / Journal</Label>
                  <Input
                    id="conference_journal"
                    value={formData.conference_journal}
                    onChange={(e) =>
                      setFormData({ ...formData, conference_journal: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="abstract">Abstract</Label>
                <textarea
                  id="abstract"
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.abstract}
                  onChange={(e) =>
                    setFormData({ ...formData, abstract: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="paper_url">Paper URL</Label>
                  <Input
                    id="paper_url"
                    type="url"
                    value={formData.paper_url}
                    onChange={(e) =>
                      setFormData({ ...formData, paper_url: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code_url">Code URL</Label>
                  <Input
                    id="code_url"
                    type="url"
                    value={formData.code_url}
                    onChange={(e) =>
                      setFormData({ ...formData, code_url: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingItem ? "Update Research" : "Create Research"}
                </Button>
                <Button type="button" variant="outline" onClick={hideForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Research ({research.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {research.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.conference_journal}
                      {item.publication_date && <> ({item.publication_date})</>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.paper_url && (
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs">
                        Paper
                      </span>
                    )}
                    {item.code_url && (
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs">
                        Code
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              {research.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No research papers yet. Add your first one!
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
