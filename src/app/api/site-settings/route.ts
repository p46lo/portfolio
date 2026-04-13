import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const DEFAULT_SETTINGS = {
  siteName: "Developer Portfolio",
  siteDescription: "Personal developer portfolio showcasing projects, skills, and experience in software engineering.",
};

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET() {
  try {
    const supabase = getSupabase();

    if (!supabase) {
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("id", "site")
      .single();

    if (error || !data) {
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    const value = data.value as { siteName?: string; siteDescription?: string };
    return NextResponse.json({
      siteName: value.siteName || DEFAULT_SETTINGS.siteName,
      siteDescription: value.siteDescription || DEFAULT_SETTINGS.siteDescription,
    });
  } catch (error) {
    console.error("Failed to fetch site settings:", error);
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}
