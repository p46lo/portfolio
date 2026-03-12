import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase configuration is missing");
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

const ALLOWED_TYPES = [
  "text/plain",
  "text/markdown",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  const words = text.split(/\s+/);

  let currentChunk = "";
  for (const word of words) {
    if (currentChunk.length + word.length + 1 > CHUNK_SIZE) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      const wordsInChunk = currentChunk.split(/\s+/);
      currentChunk = wordsInChunk.slice(-CHUNK_OVERLAP / 5).join(" ") + " " + word;
    } else {
      currentChunk += (currentChunk ? " " : "") + word;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

async function extractText(file: File): Promise<{ text: string; fileType: string }> {
  const fileType = file.type;

  if (fileType === "text/plain" || fileType === "text/markdown") {
    const text = await file.text();
    return { text, fileType: fileType.split("/")[1] || "text" };
  }

  if (fileType === "application/pdf") {
    return {
      text: `[PDF content - ${file.name}]\n\nNote: PDF parsing happens on the client side for this demo.`,
      fileType: "pdf",
    };
  }

  return {
    text: await file.text(),
    fileType: fileType.split("/")[1] || "text",
  };
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed. Allowed types: TXT, MD, PDF, DOCX" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size too large. Maximum size: 10MB" },
        { status: 400 }
      );
    }

    const { text, fileType } = await extractText(file);

    const { data: document, error: docError } = await getSupabase()
      .from("documents")
      .insert({
        file_name: file.name,
        file_type: fileType,
        file_size: file.size,
        status: "completed",
      })
      .select()
      .single();

    if (docError) {
      return NextResponse.json({ error: docError.message }, { status: 500 });
    }

    const chunks = chunkText(text);

    const chunkInserts = chunks.map((chunkText, index) => ({
      document_id: document.id,
      chunk_text: chunkText,
      chunk_index: index,
      embedding: null,
    }));

    if (chunkInserts.length > 0) {
      const { error: chunkError } = await getSupabase()
        .from("document_chunks")
        .insert(chunkInserts);

      if (chunkError) {
        console.error("Error inserting chunks:", chunkError);
      }
    }

    await getSupabase()
      .from("documents")
      .update({
        status: "completed",
        chunk_count: chunks.length,
        indexed_at: new Date().toISOString(),
      })
      .eq("id", document.id);

    return NextResponse.json({
      success: true,
      document: {
        ...document,
        status: "completed",
        chunk_count: chunks.length,
      },
      note: "Documents are stored as plain text chunks without vector embeddings. Chat uses keyword matching.",
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { data: documents, error } = await getSupabase()
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      documents,
      storageMode: "text-only",
      note: "Documents are stored as plain text without vector embeddings",
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
    }

    await getSupabase().from("document_chunks").delete().eq("document_id", id);

    const { error } = await getSupabase().from("documents").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
