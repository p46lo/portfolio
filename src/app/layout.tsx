import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Navigation } from "@/components/portfolio/Navigation";
import { Footer } from "@/components/portfolio/Footer";
import { ChatbotProvider } from "@/components/chatbot/ChatbotProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

const DEFAULT_SITE_SETTINGS = {
  siteName: "Developer Portfolio",
  siteDescription: "Personal developer portfolio showcasing projects, skills, and experience in software engineering.",
};

async function getSiteSettings() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return DEFAULT_SITE_SETTINGS;
  }

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("id", "site")
      .single();

    if (error || !data) {
      return DEFAULT_SITE_SETTINGS;
    }

    const value = data.value as { siteName?: string; siteDescription?: string };
    return {
      siteName: value.siteName || DEFAULT_SITE_SETTINGS.siteName,
      siteDescription: value.siteDescription || DEFAULT_SITE_SETTINGS.siteDescription,
    };
  } catch (error) {
    console.error("Failed to fetch site settings:", error);
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    title: {
      default: settings.siteName,
      template: `%s | ${settings.siteName}`,
    },
    description: settings.siteDescription,
    keywords: [
      "developer",
      "portfolio",
      "software engineer",
      "full-stack",
      "web development",
    ],
    authors: [{ name: settings.siteName }],
    openGraph: {
      type: "website",
      locale: "en_US",
      url: process.env.NEXT_PUBLIC_APP_URL || "https://portfolio.dev",
      siteName: settings.siteName,
      title: settings.siteName,
      description: settings.siteDescription,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: settings.siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: settings.siteName,
      description: settings.siteDescription,
      images: ["/og-image.png"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn(inter.variable, jetbrainsMono.variable)}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="relative flex min-h-screen flex-col">
          <Navigation />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <ChatbotProvider />
      </body>
    </html>
  );
}
