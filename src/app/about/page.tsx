import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Calendar } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Fetch about content from settings
async function getAboutContent() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("id", "about")
    .single();

  if (error || !data) {
    return null;
  }

  return data.value;
}

// Fetch education from database
async function getEducation() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return [];
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("education")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return [];
  }

  return data || [];
}

// Demo education
const DEMO_EDUCATION = [
  {
    degree: "DAM - Desarrollo de Aplicaciones Multiplataforma",
    institution: "Instituto Tecnologico",
    start_date: "2020",
    end_date: "2022",
    description: "Formacion profesional en desarrollo de aplicaciones multiplataforma.",
  },
  {
    degree: "Bachillerato",
    institution: "Instituto",
    start_date: "2018",
    end_date: "2020",
    description: "Bachillerato de Ciencias",
  },
];

// Demo about
const DEMO_ABOUT = {
  title: "About Me",
  bio: "Hola! Soy un desarrollador passionate por crear experiencias digitales excepcionales. Me especializo en el desarrollo full-stack con tecnologias modernas.",
  subtitle: "A passionate Software Developer building exceptional digital experiences with modern technologies."
};

export default async function AboutPage() {
  const about = await getAboutContent();
  const education = await getEducation();
  const displayEducation = education.length > 0 ? education : DEMO_EDUCATION;
  
  const displayAbout = about || DEMO_ABOUT;

  return (
    <div className="container px-4 py-12 mx-auto">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 animate-fade-in-up">
          {displayAbout.title || "About Me"}
        </h1>
        
        <div className="prose dark:prose-invert max-w-none mb-12">
          {displayAbout.bio && (
            <p className="text-lg text-muted-foreground mb-6 animate-fade-in-up delay-100">
              {displayAbout.bio}
            </p>
          )}
          {displayAbout.subtitle && (
            <p className="text-muted-foreground animate-fade-in-up delay-200">
              {displayAbout.subtitle}
            </p>
          )}
        </div>

        {education.length === 0 && (
          <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              ⚠️ No education in database. Showing demo data. Add education in /admin panel.
            </p>
          </div>
        )}

        <h2 className="text-2xl font-semibold mb-6 animate-fade-in-up delay-300">Education</h2>
        <div className="space-y-4">
          {displayEducation.map((edu: any, index: number) => {
            const period = edu.start_date && edu.end_date 
              ? `${edu.start_date} - ${edu.end_date}`
              : edu.start_date || edu.end_date || "";
            
            return (
              <Card key={edu.id || index} className="animate-fade-in-up hover:shadow-lg transition-shadow" style={{ animationDelay: `${400 + index * 100}ms` }}>
                <CardHeader className="flex flex-row items-start gap-4">
                  <GraduationCap className="h-6 w-6 mt-1" />
                  <div className="flex-1">
                    <CardTitle>{edu.degree}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{edu.institution}</p>
                  </div>
                  {period && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {period}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{edu.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
