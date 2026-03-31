"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, Linkedin, Mail, Twitter, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

interface SocialSettings {
  github_url: string;
  linkedin_url: string;
  twitter_url: string;
  email: string;
  whatsapp?: string;
}

export default function ContactPage() {
  const supabase = createClient();
  const [social, setSocial] = useState<SocialSettings>({
    github_url: "",
    linkedin_url: "",
    twitter_url: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadSocialSettings();
  }, []);

  const loadSocialSettings = async () => {
    try {
      const { data } = await supabase
        .from("settings")
        .select("value")
        .eq("id", "home.social")
        .single();
      
      if (data?.value) {
        setSocial(data.value as SocialSettings);
      }
    } catch (error) {
      console.error("Error loading social settings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Build social links from settings
  const getSocialLinks = () => {
    const links = [];
    if (social.github_url) links.push({ href: social.github_url, icon: Github, label: "GitHub" });
    if (social.linkedin_url) links.push({ href: social.linkedin_url, icon: Linkedin, label: "LinkedIn" });
    if (social.twitter_url) links.push({ href: social.twitter_url, icon: Twitter, label: "Twitter" });
    if (social.whatsapp) links.push({ href: social.whatsapp, icon: MessageCircle, label: "WhatsApp" });
    return links;
  };

  const sendToEmail = () => {
    if (!social.email) return;
    const subject = encodeURIComponent(`Portfolio Contact from ${formData.name}`);
    const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`);
    window.location.href = `mailto:${social.email}?subject=${subject}&body=${body}`;
  };

  const sendToWhatsApp = () => {
    if (!social.whatsapp) return;
    const text = encodeURIComponent(`*Portfolio Contact*\n\n*Name:* ${formData.name}\n*Email:* ${formData.email}\n\n*Message:*\n${formData.message}`);
    window.open(`${social.whatsapp}?text=${text}`, '_blank');
  };

  // Handle form submission - send via email or WhatsApp
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (social.whatsapp) {
      sendToWhatsApp();
    } else if (social.email) {
      sendToEmail();
    } else {
      alert("No contact method configured. Please try again later.");
    }
  };

  return (
    <div className="container px-4 py-12 mx-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 animate-fade-in-up">Get In Touch</h1>
        <p className="text-lg text-muted-foreground mb-12 animate-fade-in-up delay-100">
          Have a question or want to work together? Drop me a message!
        </p>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Contact Form */}
          <Card className="animate-fade-in-up delay-200">
            <CardHeader>
              <CardTitle>Send a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Your message..."
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={sending}>
                  {sending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Social Links */}
          <div className="space-y-6">
            <Card className="animate-fade-in-up delay-300">
              <CardHeader>
                <CardTitle>Connect With Me</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {getSocialLinks().map((link: { href: string; icon: any; label: string }) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-all hover:scale-105"
                    >
                      <link.icon className="h-5 w-5" />
                      <span>{link.label}</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in-up delay-400">
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Based in Spain<br />
                  Available for remote work worldwide
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
