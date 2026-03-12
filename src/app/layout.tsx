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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Developer Portfolio",
    template: "%s | Developer Portfolio",
  },
  description:
    "Personal developer portfolio showcasing projects, skills, and experience in software engineering.",
  keywords: [
    "developer",
    "portfolio",
    "software engineer",
    "full-stack",
    "web development",
  ],
  authors: [{ name: "Developer" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://portfolio.dev",
    siteName: "Developer Portfolio",
    title: "Developer Portfolio",
    description:
      "Personal developer portfolio showcasing projects, skills, and experience.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Developer Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Developer Portfolio",
    description:
      "Personal developer portfolio showcasing projects, skills, and experience.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

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
