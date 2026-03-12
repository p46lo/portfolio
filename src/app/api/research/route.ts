import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase configuration is missing");
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

const researchSchema = z.object({
  title: z.string().min(1),
  publication_date: z.string().optional(),
  conference_journal: z.string().optional(),
  abstract: z.string().optional(),
  paper_url: z.string().url().optional().or(z.literal("")),
  code_url: z.string().url().optional().or(z.literal("")),
});

function parseDate(dateStr: string | undefined | null): string | null {
  if (!dateStr) return null;
  return dateStr;
}

export async function GET(req: NextRequest) {
  try {
    const { data: research, error } = await getSupabase()
      .from("research")
      .select("*")
      .order("publication_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ research });
  } catch (error) {
    console.error("Error fetching research:", error);
    return NextResponse.json(
      { error: "Failed to fetch research" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await getSupabase().auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = researchSchema.parse(body);

    const { data: research, error } = await getSupabase()
      .from("research")
      .insert({
        title: validatedData.title,
        publication_date: parseDate(validatedData.publication_date),
        conference_journal: validatedData.conference_journal || null,
        abstract: validatedData.abstract || null,
        paper_url: validatedData.paper_url || null,
        code_url: validatedData.code_url || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ research }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating research:", error);
    return NextResponse.json(
      { error: "Failed to create research" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Research ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validatedData = researchSchema.partial().parse(body);

    const { data: research, error } = await getSupabase()
      .from("research")
      .update({
        ...(validatedData.title !== undefined && { title: validatedData.title }),
        publication_date: parseDate(validatedData.publication_date),
        conference_journal: validatedData.conference_journal || null,
        abstract: validatedData.abstract || null,
        paper_url: validatedData.paper_url || null,
        code_url: validatedData.code_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ research });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating research:", error);
    return NextResponse.json(
      { error: "Failed to update research" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Research ID is required" },
        { status: 400 }
      );
    }

    const { error } = await getSupabase().from("research").delete().eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting research:", error);
    return NextResponse.json(
      { error: "Failed to delete research" },
      { status: 500 }
    );
  }
}
