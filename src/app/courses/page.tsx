import { BookOpen, Calendar, Award, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Course } from "@/types";

export const metadata = {
  title: "Courses | Portfolio",
  description: "Courses I've completed and certifications",
};

async function getCourses(): Promise<Course[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/courses`, { cache: "no-store" });
  
  if (!res.ok) {
    throw new Error("Failed to fetch courses");
  }
  
  const data = await res.json();
  return data.courses || [];
}

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="container px-4 py-12 mx-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Courses & Certifications</h1>
          <p className="text-lg text-muted-foreground">
            Completed courses and professional certifications
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <CardTitle className="flex items-start gap-2">
                  <BookOpen className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span>{course.name}</span>
                </CardTitle>
                <CardDescription className="flex flex-col gap-1 mt-2">
                  <span className="font-medium text-foreground">{course.provider}</span>
                  {course.completion_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Completed: {course.completion_date}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {course.description && (
                  <p className="text-sm text-muted-foreground">{course.description}</p>
                )}
                {course.certificate_url && (
                  <a
                    href={course.certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <Award className="h-4 w-4" />
                    View Certificate
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No courses yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
