"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Github, Linkedin, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
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
      // Fallback to default technologies
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
            <div className="mb-6 inline-flex items-center rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm backdrop-blur-sm">
              <span className="mr-2 flex h-2 w-2">
                <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              Available for work
            </div>

            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Hi, I&apos;m{" "}
              <span className="gradient-text">Your Name</span>
            </h1>

            <p className="mb-8 text-xl text-muted-foreground sm:text-2xl">
              A passionate{" "}
              <span className="text-foreground font-medium">Software Developer</span>{" "}
              building exceptional digital experiences with modern technologies.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="group">
                <Link href="/projects">
                  View My Work
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">
                  Get In Touch
                </Link>
              </Button>
            </div>

            <div className="mt-12 flex items-center justify-center gap-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Github className="h-6 w-6" />
                <span className="sr-only">GitHub</span>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Linkedin className="h-6 w-6" />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a
                href="mailto:hello@example.com"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Mail className="h-6 w-6" />
                <span className="sr-only">Email</span>
              </a>
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
                  {technologies.slice(0, 12).map((tech) => (
                    <div
                      key={tech}
                      className="flex items-center justify-center rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
                    >
                      {tech}
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
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No technologies detected yet.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Add projects or upload documents to auto-detect technologies.
                </p>
              </div>
            )}
            
            <div className="mt-8 text-center">
              <Button asChild variant="link">
                <Link href="/skills">
                  View All Skills <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects - Dynamic */}
      <section className="py-24">
        <div className="container px-4">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Featured Projects</h2>
                <p className="mt-2 text-muted-foreground">
                  A selection of my recent work
                </p>
              </div>
              <Button asChild variant="link">
                <Link href="/projects">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                <div className="col-span-3 flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : projects.length > 0 ? (
                projects.map((project) => (
                  <Card key={project.id} className="group overflow-hidden transition-all hover:shadow-lg">
                    <div className="aspect-video bg-muted" />
                    <CardContent className="p-6">
                      <h3 className="mb-2 text-xl font-semibold">
                        {project.title}
                      </h3>
                      <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {project.tech_stack?.slice(0, 3).map((tech: string) => (
                          <span
                            key={tech}
                            className="rounded-full bg-secondary px-3 py-1 text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <p className="text-muted-foreground">
                    No projects yet. Add projects in the admin panel.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold">Let&apos;s Work Together</h2>
            <p className="mb-8 text-primary-foreground/80">
              I&apos;m currently available for freelance work and full-time opportunities.
              If you have a project that needs some creative touch, feel free to reach out.
            </p>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="text-foreground"
            >
              <Link href="/contact">
                Start a Conversation
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
