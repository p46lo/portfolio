import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Calendar } from "lucide-react";

const education = [
  {
    degree: "DAM - Desarrollo de Aplicaciones Multiplataforma",
    institution: "Instituto Tecnologico",
    period: "2020 - 2022",
    description: "Formacion profesional en desarrollo de aplicaciones multiplataforma.",
  },
  {
    degree: "Bachillerato",
    institution: "Instituto",
    period: "2018 - 2020",
    description: "Bachillerato de Ciencias",
  },
];

export default function AboutPage() {
  return (
    <div className="container px-4 py-12 mx-auto">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">About Me</h1>
        
        <div className="prose dark:prose-invert max-w-none mb-12">
          <p className="text-lg text-muted-foreground mb-6">
            Hola! Soy un desarrollador passionate por crear experiencias digitales excepcionales. 
            Me especializo en el desarrollo full-stack con tecnologias modernas.
          </p>
          <p className="text-muted-foreground">
            Con experiencia en proyectos personales y profesionales, me dedico a construir 
            aplicaciones web y moviles que no solo funcionan bien, sino que juga se ven bien.
            Creo firmemente en el aprendizaje continuo y en mantenerme al dia con las ultimas 
            tendencias tecnologicas.
          </p>
        </div>

        <h2 className="text-2xl font-semibold mb-6">Education</h2>
        <div className="space-y-4">
          {education.map((edu, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-start gap-4">
                <GraduationCap className="h-6 w-6 mt-1" />
                <div className="flex-1">
                  <CardTitle>{edu.degree}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{edu.institution}</p>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  {edu.period}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{edu.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
