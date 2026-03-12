"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Github, Linkedin, Mail, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase";

// Default settings
const DEFAULT_SETTINGS = {
  hero: {
    name: "Your Name",
    title: "Software Developer",
    tagline: "A passionate developer building exceptional digital experiences with modern technologies.",
    availability: "Available for work",
  },
  social: {
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    twitter: "",
    email: "hello@example.com",
  },
  cta: {
    primaryText: "View My Work",
    primaryLink: "/projects",
    secondaryText: "Get In Touch",
    secondaryLink: "/contact",
  },
};

export default function Home() {
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const supabase = createClient();
      
      // Fetch settings
      const { data: heroData } = await supabase
        .from("settings")
        .select("value")
        .eq("id", "home.hero")
        .single();
      
      const { data: socialData } = await supabase
        .from("settings")
        .select("value")
        .eq("id", "home.social")
        .single();
      
      const { data: ctaData } = await supabase
        .from("settings")
        .select("value")
        .eq("id", "home.cta")
        .single();

      const newSettings = { ...DEFAULT_SETTINGS };
      
      if (heroData?.value) newSettings.hero = { ...DEFAULT_SETTINGS.hero, ...heroData.value };
      if (socialData?.value) newSettings.social = { ...DEFAULT_SETTINGS.social, ...socialData.value };
      if (ctaData?.value) newSettings.cta = { ...DEFAULT_SETTINGS.cta, ...ctaData.value };
      
      setSettings(newSettings);

      // Fetch technologies from API
      const techRes = await fetch("/api/technologies");
      const techData = await techRes.json();
      
      if (techData.technologies) {
        setTechnologies(techData.technologies);
      }

      // Fetch featured projects
      const projectsRes = await fetch("/api/projects?featured=true&limit=3");
      const projectsData = await projectsRes.json();
      
      if (projectsData.projects) {
        setProjects(projectsData.projects);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setTechnologies([
        "TypeScript",
        "React",
        "Next.js",
        "Node.js",
        "PostgreSQL",
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#888_1px,transparent_1px),linear-gradient(to_bottom,#888_1px,transparent_1px)] bg-[size:24px_24px] bg-[mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_40%,transparent_100%)] opacity-20" />

        <div className="container relative z-10 px-4">
          <div className="mx-auto max-w-4xl text-center">
            {/* Availability badge - fade in */}
            <div className={`mb-6 inline-flex items-center rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm backdrop-blur-sm transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <span className="mr-2 flex h-2 w-2">
                <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              {settings.hero.availability}
            </div>

            {/* Name - slide up */}
            <h1 className={`mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              Hi, I&apos;m{" "}
              <span className="gradient-text">{settings.hero.name}</span>
            </h1>

            {/* Title - fade in */}
            <p className={`mb-4 text-xl text-muted-foreground sm:text-2xl transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <span className="text-foreground font-medium">{settings.hero.title}</span>
            </p>

            {/* Description - fade in with more delay */}
            <p className={`mb-8 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {settings.hero.tagline}
            </p>

            {/* CTA Buttons - fade in */}
            <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Button asChild size="lg" className="group">
                <Link href={settings.cta.primaryLink}>
                  {settings.cta.primaryText}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={settings.cta.secondaryLink}>
                  {settings.cta.secondaryText}
                </Link>
              </Button>
            </div>

            {/* Social Links - fade in */}
            <div className={`mt-12 flex items-center justify-center gap-6 transition-all duration-700 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {settings.social.github && (
                <a
                  href={settings.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-all hover:text-foreground hover:scale-110"
                >
                  <Github className="h-6 w-6" />
                  <span className="sr-only">GitHub</span>
                </a>
              )}
              {settings.social.linkedin && (
                <a
                  href={settings.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-all hover:text-foreground hover:scale-110"
                >
                  <Linkedin className="h-6 w-6" />
                  <span className="sr-only">LinkedIn</span>
                </a>
              )}
              {settings.social.twitter && (
                <a
                  href={settings.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-all hover:text-foreground hover:scale-110"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="sr-only">Twitter</span>
                </a>
              )}
              {settings.social.email && (
                <a
                  href={`mailto:${settings.social.email}`}
                  className="text-muted-foreground transition-all hover:text-foreground hover:scale-110"
                >
                  <Mail className="h-6 w-6" />
                  <span className="sr-only">Email</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="h-10 w-6 rounded-full border-2 border-muted-foreground/30">
            <div className="mx-auto mt-2 h-2 w-1 rounded-full bg-muted-foreground/50" />
          </div>
        </div>
      </section>

      {/* Technologies Section - Dynamic */}
      <section className="py-24 bg-muted/30">
        <div className="container px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-4 text-center text-3xl font-bold tracking-tight">
              Technologies I Work With
            </h2>
            <p className="mb-12 text-center text-sm text-muted-foreground">
              Detected from my projects and knowledge base
            </p>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : technologies.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
                  {technologies.slice(0, 12).map((tech, index) => (
                    <div
                      key={tech}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <Card className="text-center py-4 hover:border-primary/50 transition-colors">
                        <CardContent className="p-0">
                          <span className="text-sm font-medium">{tech}</span>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
                {technologies.length > 12 && (
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    +{technologies.length - 12} more technologies
                  </p>
                )}
              </>
            ) : (
              <p className="text-center text-muted-foreground">
                Add projects to see technologies here
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-24">
        <div className="container px-4">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight">Featured Projects</h2>
              <p className="text-muted-foreground">
                Some of my recent work
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : projects.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project, index) => (
                  <Card 
                    key={project.id} 
                    className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      {project.image_url ? (
                        <img 
                          src={project.image_url} 
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl">💼</span>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="mb-2 font-semibold">{project.title}</h3>
                      <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                      <div className="mb-4 flex flex-wrap gap-1">
                        {project.tech_stack?.slice(0, 3).map((tech: string) => (
                          <span key={tech} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs">
                            {tech}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        {project.github_url && (
                          <Button variant="outline" size="sm" asChild className="group/btn">
                            <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                              <Github className="mr-1 h-4 w-4" />
                              Code
                            </a>
                          </Button>
                        )}
                        {project.live_url && (
                          <Button size="sm" asChild className="group/btn">
                            <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-1 h-4 w-4" />
                              Demo
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-muted-foreground mb-4">No featured projects yet.</p>
                <Button asChild>
                  <Link href="/projects">View All Projects</Link>
                </Button>
              </div>
            )}

            {projects.length > 0 && (
              <div className="mt-8 text-center">
                <Button variant="outline" asChild>
                  <Link href="/projects">
                    View All Projects <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary/5">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">
              Let&apos;s Work Together
            </h2>
            <p className="mb-8 text-muted-foreground">
              Have a project in mind or just want to chat? I&apos;m always open to discussing new opportunities.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link href={settings.cta.secondaryLink}>
                  Get In Touch
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/projects">
                  See My Work
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
