"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowRight,
  Briefcase,
  Users,
  MessageSquare,
  FileText,
  UserCircle,
  Search,
  Wallet,
  Globe,
  Smartphone,
  Palette,
  Brain,
  Cloud,
  LayoutDashboard,
  Sun,
  Shield,
  Activity,
  CheckCircle2,
  Github,
  Linkedin,
  Send,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LucideIcon } from "lucide-react";

// Data Constants
const PROJECT_CATEGORIES: {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    id: "web_dev",
    title: "Web Development",
    description: "React, Next.js, Vue, Angular, full-stack applications",
    icon: Globe,
  },
  {
    id: "mobile_app",
    title: "Mobile App",
    description: "iOS, Android, React Native, Flutter applications",
    icon: Smartphone,
  },
  {
    id: "design",
    title: "UI/UX Design",
    description: "User interfaces, prototypes, design systems",
    icon: Palette,
  },
  {
    id: "ai_ml",
    title: "AI & Machine Learning",
    description: "Machine learning models, data pipelines, AI integration",
    icon: Brain,
  },
  {
    id: "devops",
    title: "DevOps & Cloud",
    description: "AWS, GCP, Azure, CI/CD, infrastructure",
    icon: Cloud,
  },
];

const PLATFORM_FEATURES: {
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Real-Time Messaging",
    description: "Instant communication between clients and developers",
    icon: MessageSquare,
  },
  {
    title: "Role-Based Dashboards",
    description: "Tailored experiences for clients and developers",
    icon: LayoutDashboard,
  },
  {
    title: "Dark & Light Theme",
    description: "Comfortable viewing in any lighting condition",
    icon: Sun,
  },
  {
    title: "Mobile Responsive",
    description: "Full functionality on any device",
    icon: Smartphone,
  },
  {
    title: "Secure Authentication",
    description: "Protected accounts with modern security",
    icon: Shield,
  },
  {
    title: "Project Tracking",
    description: "Monitor progress from start to completion",
    icon: Activity,
  },
];

const CLIENT_STEPS: {
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Post Your Project",
    description: "Describe requirements, set budget, choose category",
    icon: FileText,
  },
  {
    title: "Review Proposals",
    description: "Receive applications and review developer profiles",
    icon: Users,
  },
  {
    title: "Collaborate & Ship",
    description: "Message your developer and track progress",
    icon: MessageSquare,
  },
];

const DEVELOPER_STEPS: {
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Build Your Profile",
    description: "Showcase skills, experience, and portfolio",
    icon: UserCircle,
  },
  {
    title: "Browse & Apply",
    description: "Search projects and submit custom proposals",
    icon: Search,
  },
  {
    title: "Get Hired & Earn",
    description: "Connect with clients and build reputation",
    icon: Wallet,
  },
];

const CLIENT_FEATURES: { text: string; icon: LucideIcon }[] = [
  { text: "Post projects with detailed requirements and budgets", icon: Briefcase },
  { text: "Access a curated pool of Junior to Lead-level developers", icon: Users },
  { text: "Review proposals with custom pitches and portfolios", icon: FileText },
  { text: "Real-time messaging to discuss project details", icon: MessageSquare },
  { text: "Track project status from open to completion", icon: Activity },
];

const DEVELOPER_FEATURES: { text: string; icon: LucideIcon }[] = [
  { text: "Browse projects across 5 in-demand categories", icon: Search },
  { text: "Create a detailed profile with GitHub, LinkedIn, and portfolio", icon: Github },
  { text: "Specify your experience level and availability status", icon: UserCircle },
  { text: "Submit custom proposals to stand out", icon: Send },
  { text: "Direct messaging with potential clients", icon: MessageSquare },
];

export default function Landing() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (isLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/5 to-transparent -z-10 pointer-events-none" />
      <div className="hidden md:block absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl -z-10 pointer-events-none translate-x-1/4 -translate-y-1/4" />
      <div className="hidden md:block absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl -z-10 pointer-events-none -translate-x-1/4 translate-y-1/4" />

      {/* Header */}
      <header className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="font-display text-2xl font-bold tracking-tight">
          Market<span className="text-primary">Place</span>
        </div>
        <Button
          onClick={() => router.push("/auth")}
          variant="outline"
          aria-label="Log in to your account"
          className="font-semibold"
        >
          Log In
        </Button>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold leading-[1.1] tracking-tight text-foreground">
            Build Your Vision.{" "}
            <p className="text-gradient">Find World-Class Talent.</p>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The premium freelance marketplace for Web, Mobile, AI, Design, and DevOps projects. Connect with verified developers today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              onClick={() => router.push("/auth")}
              aria-label="Get started as a client to hire developers"
              className="h-14 px-8 text-lg rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-105 transition-all duration-300 w-full sm:w-auto"
            >
              Hire a Developer
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/auth")}
              aria-label="Get started as a developer to find projects"
              className="h-14 px-8 text-lg rounded-xl hover:scale-105 transition-all duration-300 w-full sm:w-auto"
            >
              Find Projects
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Verified Developers
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Shield className="h-4 w-4 mr-2" />
              Secure Platform
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Briefcase className="h-4 w-4 mr-2" />
              5 Project Categories
            </Badge>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes whether you&apos;re hiring or looking for work
            </p>
          </div>

          <Tabs defaultValue="clients" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
              <TabsTrigger value="clients" className="text-base">
                For Clients
              </TabsTrigger>
              <TabsTrigger value="developers" className="text-base">
                For Developers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="clients">
              <div className="grid md:grid-cols-3 gap-6">
                {CLIENT_STEPS.map((step, index) => (
                  <Card
                    key={step.title}
                    className="bg-card/50 backdrop-blur-sm border-border relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="absolute top-4 right-4 text-6xl font-bold text-primary/10">
                        {index + 1}
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary/20 transition-colors">
                        <step.icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="developers">
              <div className="grid md:grid-cols-3 gap-6">
                {DEVELOPER_STEPS.map((step, index) => (
                  <Card
                    key={step.title}
                    className="bg-card/50 backdrop-blur-sm border-border relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="absolute top-4 right-4 text-6xl font-bold text-primary/10">
                        {index + 1}
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary/20 transition-colors">
                        <step.icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* For Clients Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-6">
              <Badge variant="secondary" className="px-3 py-1">
                For Clients
              </Badge>
              <h2 className="text-3xl md:text-4xl font-display font-bold">
                Hire Top-Tier Developers
              </h2>
              <p className="text-lg text-muted-foreground">
                Find the perfect developer for your project. Post your requirements and receive proposals from qualified professionals.
              </p>
              <ul className="space-y-4">
                {CLIENT_FEATURES.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <feature.icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-foreground">{feature.text}</span>
                  </li>
                ))}
              </ul>
              <Button
                size="lg"
                onClick={() => router.push("/auth")}
                aria-label="Post your first project"
                className="h-12 px-6 rounded-xl shadow-lg shadow-primary/25"
              >
                Post Your First Project
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Visual Mockup */}
            <div className="relative order-first lg:order-last">
              <Card className="p-6 bg-card/80 backdrop-blur-sm border-border shadow-2xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge>Web Development</Badge>
                    <Badge variant="secondary">Open</Badge>
                  </div>
                  <h3 className="font-bold text-xl">E-Commerce Platform Redesign</h3>
                  <p className="text-muted-foreground text-sm">
                    Looking for an experienced React developer to redesign our e-commerce platform with modern UI/UX...
                  </p>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>₹50,000 - ₹1,00,000</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>12 proposals</span>
                    </div>
                  </div>
                  <div className="border-t border-border pt-4 mt-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                        TC
                      </div>
                      <div>
                        <p className="font-medium text-sm">TechCorp Inc.</p>
                        <p className="text-xs text-muted-foreground">Posted 2 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
              {/* Decorative elements */}
              <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-primary/10 rounded-2xl -z-10" />
              <div className="absolute -top-4 -left-4 h-16 w-16 bg-accent/10 rounded-xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* For Developers Section */}
      <section className="py-16 md:py-24 bg-secondary/10">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Visual Mockup */}
            <div className="relative">
              <Card className="p-6 bg-card/80 backdrop-blur-sm border-border shadow-2xl">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                      AD
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">Ajay Darisi</h3>
                      <p className="text-muted-foreground text-sm">Senior Full-Stack Developer</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">React</Badge>
                    <Badge variant="secondary">TypeScript</Badge>
                    <Badge variant="secondary">Node.js</Badge>
                    <Badge variant="secondary">PostgreSQL</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    3+ years building scalable web applications. Passionate about clean code and great user experiences.
                  </p>
                  <div className="flex items-center gap-4 pt-2 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Github className="h-4 w-4" />
                      <span>github.com/ajaydarisi</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Linkedin className="h-4 w-4" />
                      <span>linkedin.com/in/ajaydarisi</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-status-online/20 text-status-online border-status-online/30">
                      Available
                    </Badge>
                    <span className="text-sm text-muted-foreground">4 projects completed</span>
                  </div>
                </div>
              </Card>
              {/* Decorative elements */}
              <div className="absolute -bottom-4 -left-4 h-24 w-24 bg-accent/10 rounded-2xl -z-10" />
              <div className="absolute -top-4 -right-4 h-16 w-16 bg-primary/10 rounded-xl -z-10" />
            </div>

            {/* Text Content */}
            <div className="space-y-6">
              <Badge variant="secondary" className="px-3 py-1">
                For Developers
              </Badge>
              <h2 className="text-3xl md:text-4xl font-display font-bold">
                Find Exciting Projects
              </h2>
              <p className="text-lg text-muted-foreground">
                Showcase your skills and connect with clients looking for your expertise. Build your reputation and grow your freelance career.
              </p>
              <ul className="space-y-4">
                {DEVELOPER_FEATURES.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <feature.icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-foreground">{feature.text}</span>
                  </li>
                ))}
              </ul>
              <Button
                size="lg"
                onClick={() => router.push("/auth")}
                aria-label="Create your developer profile"
                className="h-12 px-6 rounded-xl shadow-lg shadow-primary/25"
              >
                Create Your Profile
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Explore Project Categories
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find projects across the most in-demand tech categories
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {PROJECT_CATEGORIES.map((category) => (
              <Card
                key={category.id}
                className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border hover:border-primary/50"
              >
                <CardContent className="p-6 text-center">
                  <div className="h-14 w-14 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <category.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{category.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section className="py-16 md:py-24 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Built for Modern Teams
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to succeed in one platform
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLATFORM_FEATURES.map((feature) => (
              <Card
                key={feature.title}
                className="bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-12 md:py-16 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 -z-10" />

        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">
            Ready to Get Started?
          </h2>
          <p className="text-base md:text-lg text-muted-foreground mb-6 max-w-xl mx-auto">
            Join clients and developers building the future together.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={() => router.push("/auth")}
              aria-label="Start hiring developers"
              className="h-12 px-6 rounded-xl shadow-lg shadow-primary/25 hover:scale-105 transition-all duration-300"
            >
              Start Hiring
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/auth")}
              aria-label="Join as a developer"
              className="h-12 px-6 rounded-xl hover:scale-105 transition-all duration-300"
            >
              Join as Developer
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="font-display text-lg font-bold tracking-tight">
              Market<span className="text-primary">Place</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date().getFullYear()} MarketPlace. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
