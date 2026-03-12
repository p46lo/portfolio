"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  Brain,
  Settings,
  LogOut,
  ChevronLeft,
  GraduationCap,
  BookOpen,
  FileText,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/home", label: "Home Page", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/skills", label: "Skills", icon: Lightbulb },
  { href: "/admin/education", label: "Education", icon: GraduationCap },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/research", label: "Research", icon: FileText },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/about", label: "About", icon: LayoutDashboard },
  { href: "/admin/knowledge", label: "Knowledge Base", icon: Brain },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r bg-muted/30 hidden md:block">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin" className="font-semibold">
            Admin Panel
          </Link>
        </div>

        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 border-t p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="flex h-16 items-center justify-between border-b px-4 md:hidden">
        <span className="font-semibold">Admin Panel</span>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ChevronLeft className="h-4 w-4" />
            Back to site
          </Link>
        </Button>
      </header>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1">
        {/* Main content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
