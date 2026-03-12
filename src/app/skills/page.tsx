import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@supabase/supabase-js";

// Fetch skills from database
async function getSkills() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // First try to get skills from skills table
  const { data: skillsData, error: skillsError } = await supabase
    .from("skills")
    .select("*")
    .order("sort_order", { ascending: true });

  if (!skillsError && skillsData && skillsData.length > 0) {
    // Group by category
    const categories: Record<string, string[]> = {};
    skillsData.forEach((skill: any) => {
      if (!categories[skill.category]) {
        categories[skill.category] = [];
      }
      categories[skill.category].push(skill.name);
    });
    return categories;
  }

  // If no skills, extract from projects
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("tech_stack");

  if (projectsError || !projects) {
    return null;
  }

  // Extract unique technologies from projects
  const techSet = new Set<string>();
  projects.forEach((project: any) => {
    if (project.tech_stack && Array.isArray(project.tech_stack)) {
      project.tech_stack.forEach((tech: string) => techSet.add(tech));
    }
  });

  const allTechs = Array.from(techSet).sort();
  
  // Group into categories
  const categories: Record<string, string[]> = {
    "Technologies": allTechs
  };

  return categories;
}

const DEMO_SKILLS = {
  "Frontend": ["React", "Next.js", "TypeScript", "TailwindCSS", "Vue.js", "HTML/CSS"],
  "Backend": ["Node.js", "Express", "Python", "PostgreSQL", "MongoDB", "REST APIs"],
  "Tools & DevOps": ["Git", "Docker", "AWS", "Vercel", "CI/CD", "Linux"],
  "Other": ["Agile", "Scrum", "Figma", "UI/UX Basics", "Testing", "Documentation"],
};

export default async function SkillsPage() {
  const skills = await getSkills();
  const skillCategories = skills || DEMO_SKILLS;

  return (
    <div className="container px-4 py-12 mx-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Skills & Technologies</h1>
        <p className="text-lg text-muted-foreground mb-12">
          Technologies and tools I work with
        </p>

        {!skills && (
          <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              ⚠️ No skills in database. Showing demo data. Add projects in /admin panel to auto-detect technologies.
            </p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {Object.entries(skillCategories).map(([category, skillList]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skillList.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
