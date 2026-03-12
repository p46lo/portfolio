import { GraduationCap, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Education } from "@/types";

export const metadata = {
  title: "Education | Portfolio",
  description: "My educational background and qualifications",
};

async function getEducation(): Promise<Education[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/education`, { cache: "no-store" });
  
  if (!res.ok) {
    throw new Error("Failed to fetch education");
  }
  
  const data = await res.json();
  return data.education || [];
}

export default async function EducationPage() {
  const education = await getEducation();

  return (
    <div className="container px-4 py-12 mx-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Education</h1>
          <p className="text-lg text-muted-foreground">
            My academic background and qualifications
          </p>
        </div>

        <div className="grid gap-6">
          {education.map((edu) => (
            <Card key={edu.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  {edu.degree}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 text-base">
                  <span className="font-medium">{edu.institution}</span>
                  {edu.start_date && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {edu.start_date}
                        {edu.end_date && ` - ${edu.end_date}`}
                      </span>
                    </>
                  )}
                </CardDescription>
              </CardHeader>
              {edu.description && (
                <CardContent>
                  <p className="text-muted-foreground">{edu.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {education.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No education entries yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
