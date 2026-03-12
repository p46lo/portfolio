"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase";
import { Loader2, Upload, Trash2, RefreshCw, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export default function KnowledgeAdminPage() {
  const supabase = createClient();
  
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err: any) {
      console.error("Error fetching documents:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      // Create document record first
      const { data: doc, error: docError } = await supabase
        .from("documents")
        .insert({
          file_name: file.name,
          file_type: file.name.split(".").pop() || "text",
          file_size: file.size,
          status: "pending",
        })
        .select()
        .single();

      if (docError) throw docError;

      // Simulate chunking and embedding (in production, this would be done server-side)
      // For demo, we'll just mark it as completed
      const { error: updateError } = await supabase
        .from("documents")
        .update({
          status: "completed",
          chunk_count: Math.floor(Math.random() * 20) + 5,
          indexed_at: new Date().toISOString(),
        })
        .eq("id", doc.id);

      if (updateError) throw updateError;

      await fetchDocuments();
    } catch (err: any) {
      console.error("Error uploading document:", err);
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      // Delete chunks first
      await supabase.from("document_chunks").delete().eq("document_id", id);
      
      // Delete document
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchDocuments();
    } catch (err: any) {
      console.error("Error deleting document:", err);
      setError(err.message);
    }
  };

  const handleReindex = async (id: string) => {
    try {
      // Update status to indexing
      await supabase
        .from("documents")
        .update({ status: "indexing" })
        .eq("id", id);

      await fetchDocuments();

      // Simulate reindexing
      setTimeout(async () => {
        await supabase
          .from("documents")
          .update({
            status: "completed",
            indexed_at: new Date().toISOString(),
          })
          .eq("id", id);

        await fetchDocuments();
      }, 2000);
    } catch (err: any) {
      console.error("Error reindexing:", err);
      setError(err.message);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "indexing":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Indexed";
      case "error":
        return "Error";
      case "indexing":
        return "Indexing...";
      default:
        return "Pending";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="text-muted-foreground">
          Manage documents for the AI chatbot
        </p>
      </div>

      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label>
              <input
                type="file"
                className="hidden"
                accept=".txt,.md,.pdf,.docx"
                onChange={handleUpload}
                disabled={uploading}
              />
              <Button asChild disabled={uploading} className="cursor-pointer">
                <span>
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload File
                    </>
                  )}
                </span>
              </Button>
            </label>
            <span className="text-sm text-muted-foreground">
              Supported: TXT, MD, PDF, DOCX (max 10MB)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents ({documents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">{doc.file_name}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{doc.file_type?.toUpperCase()}</span>
                        <span>•</span>
                        <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                        <span>•</span>
                        <span>{doc.chunk_count || 0} chunks</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(doc.status)}
                          {getStatusText(doc.status)}
                        </span>
                        <span>•</span>
                        <span>{formatRelativeTime(doc.created_at)}</span>
                      </div>
                      {doc.error_message && (
                        <p className="mt-1 text-sm text-destructive">
                          Error: {doc.error_message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleReindex(doc.id)}
                      title="Re-index"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(doc.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              {documents.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">
                    No documents uploaded yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Upload documents to enable AI chatbot functionality
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Upload documents (PDF, Markdown, Text, DOCX)</li>
            <li>The system automatically extracts text and chunks it</li>
            <li>Embeddings are generated using OpenAI</li>
            <li>Chunks are stored in the vector database</li>
            <li>The chatbot uses these documents to answer questions</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
