import { FileText, Calendar, ExternalLink, Github } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Research } from "@/types";

export const metadata = {
  title: "Research | Portfolio",
  description: "Research papers and publications",
};

async function getResearch(): Promise<Research[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/research`, { cache: "no-store" });
  
  if (!res.ok) {
    throw new Error("Failed to fetch research");
  }
  
  const data = await res.json();
  return data.research || [];
}

export default async function ResearchPage() {
  const research = await getResearch();

  return (
    <div className="container px-4 py-12 mx-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Research</h1>
          <p className="text-lg text-muted-foreground">
            Research papers and publications
          </p>
        </div>

        <div className="grid gap-6">
          {research.map((paper) => (
            <Card key={paper.id}>
              <CardHeader>
                <CardTitle className="flex items-start gap-2">
                  <FileText className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span>{paper.title}</span>
                </CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-2 mt-2">
                  {paper.publication_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {paper.publication_date}
                    </span>
                  )}
                  {paper.conference_journal && (
                    <>
                      <span>•</span>
                      <span className="font-medium text-foreground">{paper.conference_journal}</span>
                    </>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {paper.abstract && (
                  <p className="text-sm text-muted-foreground">{paper.abstract}</p>
                )}
                <div className="flex flex-wrap gap-3">
                  {paper.paper_url && (
                    <a
                      href={paper.paper_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      Read Paper
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {paper.code_url && (
                    <a
                      href={paper.code_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <Github className="h-4 w-4" />
                      View Code
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {research.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No research papers yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
