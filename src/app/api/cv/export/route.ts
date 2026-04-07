import { createClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient();

  try {
    // Fetch all data in parallel
    const [
      aboutData,
      projectsData,
      educationData,
      coursesData,
      skillsData,
      experienceData,
      documentsData,
    ] = await Promise.all([
      supabase.from("settings").select("value").eq("id", "about").single(),
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("education").select("*").order("sort_order", { ascending: true }),
      supabase.from("courses").select("*").order("created_at", { ascending: false }),
      supabase.from("skills").select("*").order("sort_order", { ascending: true }),
      supabase.from("settings").select("value").eq("id", "experience").single(),
      supabase.from("documents")
        .select("id, file_name")
        .ilike("file_name", "%cv%")
        .or("file_name.ilike.%curriculum%")
        .or("file_name.ilike.%resume%")
        .eq("status", "completed")
        .limit(1),
    ]);

    const about = aboutData?.data?.value || {};
    const projects = projectsData?.data || [];
    const education = educationData?.data || [];
    const courses = coursesData?.data || [];
    const skills = skillsData?.data || [];
    let experience = experienceData?.data?.value || [];

    // If no experience in settings, try to extract from CV document
    if ((!experience || experience.length === 0) && documentsData?.data?.[0]) {
      const cvDocId = documentsData.data[0].id;
      
      const { data: chunks } = await supabase
        .from("document_chunks")
        .select("chunk_text")
        .eq("document_id", cvDocId)
        .order("chunk_index", { ascending: true });

      if (chunks && chunks.length > 0) {
        const fullText = chunks.map(c => c.chunk_text).join("\n");
        experience = extractExperienceFromText(fullText);
      }
    }

    // Extract unique technologies from projects
    const projectTechnologies = new Set<string>();
    projects.forEach((project) => {
      if (project.tech_stack && Array.isArray(project.tech_stack)) {
        project.tech_stack.forEach((tech: string) => projectTechnologies.add(tech));
      }
    });

    // Add technologies from courses
    courses.forEach((course) => {
      if (course.description) {
        // Try to extract technologies from course description
        const commonTechs = [
          "React", "Node.js", "Python", "JavaScript", "TypeScript",
          "AWS", "Docker", "Kubernetes", "PostgreSQL", "MongoDB",
          "Next.js", "Vue", "Angular", "Go", "Rust", "Java", "C++",
        ];
        commonTechs.forEach((tech) => {
          if (course.description.toLowerCase().includes(tech.toLowerCase())) {
            projectTechnologies.add(tech);
          }
        });
      }
    });

    // Group skills by category
    const skillsByCategory: Record<string, string[]> = {
      lenguajes: [],
      frameworks: [],
      bases_de_datos: [],
      cloud: [],
      herramientas: [],
    };

    const categoryMap: Record<string, keyof typeof skillsByCategory> = {
      "Programming Languages": "lenguajes",
      "Frameworks": "frameworks",
      "Frontend": "frameworks",
      "Backend": "frameworks",
      "Database": "bases_de_datos",
      "Cloud": "cloud",
      "DevOps": "cloud",
      "Tools": "herramientas",
      "Other": "herramientas",
    };

    skills.forEach((skill) => {
      const category = categoryMap[skill.category] || "herramientas";
      if (!skillsByCategory[category].includes(skill.name)) {
        skillsByCategory[category].push(skill.name);
      }
    });

    // Map education data
    const educacionFormateada = education.map((edu) => ({
      institucion: edu.institution,
      titulo: edu.degree,
      fecha_inicio: edu.start_date ? formatDate(edu.start_date) : "",
      fecha_fin: edu.end_date ? formatDate(edu.end_date) : "",
      notas: edu.description || "",
    }));

    // Map projects data
    const proyectosFormateados = projects.map((proj) => ({
      nombre: proj.title,
      descripcion: proj.description || "",
      url: proj.github_url || proj.live_url || "",
      tecnologias: proj.tech_stack || [],
      destacado: proj.featured || false,
    }));

    // Map courses to certifications
    const certificaciones = courses
      .filter((course) => course.completion_date)
      .map((course) => ({
        nombre: course.name,
        institucion: course.provider,
        fecha: formatDate(course.completion_date),
      }));

    // Parse personal info from about settings
    const personalInfo = {
      nombre: extractName(about.bio || "") || about.full_name || "",
      apellidos: about.last_name || "",
      titulo: about.title || "",
      email: about.email || "",
      telefono: about.phone || "",
      ubicacion: about.location || "",
      url_linkedin: about.social_links?.linkedin || "",
      url_github: about.social_links?.github || "",
      sitio_web: about.social_links?.website || "",
    };

    // Build CV JSON
    const cvJson = {
      informacion_personal: personalInfo,
      resumen: about.bio || "",
      experiencia: Array.isArray(experience) ? experience : [],
      educacion: educacionFormateada,
      habilidades: skillsByCategory,
      proyectos: proyectosFormateados,
      idiomas: [], // Could be added to settings
      certificaciones: certificaciones,
    };

    return NextResponse.json(cvJson);
  } catch (error) {
    console.error("Error generating CV JSON:", error);
    return NextResponse.json(
      { error: "Failed to generate CV JSON" },
      { status: 500 }
    );
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  // If already in YYYY-MM format, return as is
  if (/^\d{4}-\d{2}$/.test(dateStr)) return dateStr;
  // If full date, convert to YYYY-MM
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr.substring(0, 7);
  }
  return dateStr;
}

function extractName(bio: string): string {
  // Try to extract name from bio or return empty
  // This could be enhanced based on how the user fills in the data
  return "";
}

interface ExperienceEntry {
  empresa: string;
  puesto: string;
  ubicacion: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  actual: boolean;
  descripcion: string;
  logros?: string[];
  tecnologias?: string[];
}

function extractExperienceFromText(text: string): ExperienceEntry[] {
  const experiences: ExperienceEntry[] = [];
  
  // Common patterns to identify job entries
  const jobPatterns = [
    /(?:Empresa|Company|Employer|Trabajo en)[\s:]+([^\n]+)/gi,
    /(?:Puesto|Position|Job title|Rol)[\s:]+([^\n]+)/gi,
    /(\w{3,}\s+\d{4})\s*[-–—]\s*((\w{3,}\s+\d{4})|presente|actual|now)/gi,
  ];
  
  // Split text into potential job sections
  const sections = text.split(/(?:Experiencia|Experience|Employment)/i).filter(s => s.trim().length > 20);
  
  for (const section of sections) {
    const entry: ExperienceEntry = {
      empresa: "",
      puesto: "",
      ubicacion: "",
      fecha_inicio: "",
      fecha_fin: null,
      actual: false,
      descripcion: "",
      tecnologias: [],
    };
    
    // Try to extract company name
    const companyMatch = section.match(/(?:Empresa|Company|Employer)[\s:]+([^\n]+)/i);
    if (companyMatch) entry.empresa = companyMatch[1].trim();
    
    // Try to extract position
    const positionMatch = section.match(/(?:Puesto|Position|Rol)[\s:]+([^\n]+)/i);
    if (positionMatch) entry.puesto = positionMatch[1].trim();
    
    // Try to extract dates
    const dateMatch = section.match(/(\w{3,})\s+(\d{4})\s*[-–—]\s*((\w{3,})\s+(\d{4})|presente|actual|now)?/i);
    if (dateMatch) {
      entry.fecha_inicio = `${dateMatch[2]}-${getMonthNumber(dateMatch[1])}`;
      if (dateMatch[3]) {
        if (/presente|actual|now/i.test(dateMatch[3])) {
          entry.actual = true;
          entry.fecha_fin = null;
        } else {
          entry.fecha_fin = `${dateMatch[5]}-${getMonthNumber(dateMatch[4])}`;
        }
      }
    }
    
    // Get remaining text as description (first 500 chars)
    let desc = section
      .replace(/(?:Empresa|Company)[\s:]+[^\n]+\n?/gi, "")
      .replace(/(?:Puesto|Position)[\s:]+[^\n]+\n?/gi, "")
      .replace(dateMatch?.[0] || "", "")
      .trim()
      .substring(0, 500);
    
    // Extract achievements (bullet points)
    const achievements = section.match(/[-•*]\s*([^\n]+)/g);
    if (achievements) {
      entry.logros = achievements.map(a => a.replace(/[-•*]\s*/, "").trim());
      desc = desc.replace(/[-•*]\s*[^\n]+\n?/g, "").trim();
    }
    
    // Try to extract technologies mentioned
    const commonTechs = [
      "React", "Node.js", "Python", "JavaScript", "TypeScript", "AWS", "Docker",
      "Kubernetes", "PostgreSQL", "MongoDB", "Next.js", "Vue", "Angular", "Go",
      "Rust", "Java", "C++", "SQL", "Git", "Linux", "GCP", "Azure", "Firebase",
    ];
    const foundTechs: string[] = [];
    for (const tech of commonTechs) {
      if (section.toLowerCase().includes(tech.toLowerCase())) {
        foundTechs.push(tech);
      }
    }
    if (foundTechs.length > 0) entry.tecnologias = foundTechs;
    
    entry.descripcion = desc.substring(0, 500);
    
    // Only add if we have at least company or position
    if (entry.empresa || entry.puesto) {
      experiences.push(entry);
    }
  }
  
  return experiences;
}

function getMonthNumber(month: string): string {
  const months: Record<string, string> = {
    "enero": "01", "febrero": "02", "marzo": "03", "abril": "04",
    "mayo": "05", "junio": "06", "julio": "07", "agosto": "08",
    "septiembre": "09", "octubre": "10", "noviembre": "11", "diciembre": "12",
    "january": "01", "february": "02", "march": "03", "april": "04",
    "may": "05", "june": "06", "july": "07", "august": "08",
    "september": "09", "october": "10", "november": "11", "december": "12",
  };
  return months[month.toLowerCase()] || "01";
}