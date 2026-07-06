"use client";

import { AppearanceDropdown } from "@/components/appearance-selector";
import { Logo } from "@/components/logo";
import { PoweredByDarisi } from "@/components/powered-by-darisi";
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
  Shield,
  Activity,
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
    title: "AI at Every Step",
    description: "Post drafting, matching, proposals, stack advice, and pre-delivery review",
    icon: Brain,
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
    title: "Describe Your Project",
    description: "Type a rough brief — AI turns it into a professional post",
    icon: FileText,
  },
  {
    title: "Review AI-Matched Proposals",
    description: "Proposals arrive ranked, each with a reason for the match",
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
    description: "AI optimizes your bio and skills to rank higher in matching",
    icon: UserCircle,
  },
  {
    title: "Browse & Apply",
    description: "AI recommends matched projects and drafts your proposal",
    icon: Search,
  },
  {
    title: "Get Hired & Earn",
    description: "Connect with clients and build reputation",
    icon: Wallet,
  },
];

const CLIENT_FEATURES: { text: string; icon: LucideIcon }[] = [
  { text: "AI writes and improves your project post from a rough brief", icon: Briefcase },
  { text: "Access a curated pool of Junior to Lead-level developers", icon: Users },
  { text: "Review proposals with custom pitches and portfolios", icon: FileText },
  { text: "Real-time messaging to discuss project details", icon: MessageSquare },
  { text: "Track project status from open to completion", icon: Activity },
];

const DEVELOPER_FEATURES: { text: string; icon: LucideIcon }[] = [
  { text: "Browse projects across 5 in-demand categories", icon: Search },
  { text: "Create a detailed profile with GitHub, LinkedIn, and portfolio", icon: Github },
  { text: "Specify your experience level and availability status", icon: UserCircle },
  { text: "AI drafts tailored proposals from your profile and the job post", icon: Send },
  { text: "Direct messaging with potential clients", icon: MessageSquare },
];

const HERO_PULSES: {
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Post in two minutes",
    description: "AI turns your rough idea into a brief developers can actually bid on.",
    icon: FileText,
  },
  {
    title: "Win more work",
    description: "AI drafts your proposals, optimizes your profile, and checks your code before delivery.",
    icon: Send,
  },
  {
    title: "Trust built in",
    description: "Every match comes with a reason, and every delivery is AI-reviewed against the agreed scope.",
    icon: Shield,
  },
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
    <div className="page-shell min-h-screen bg-background">

      <header className="container mx-auto flex h-16 items-center justify-between px-4 md:h-20">
        <Logo />
        <div className="flex items-center gap-3">
          <AppearanceDropdown
            buttonVariant="outline"
            buttonSize="sm"
            labelClassName="hidden md:inline"
            triggerTestId="landing-theme-trigger"
          />
          <Button
            onClick={() => router.push("/auth")}
            variant="outline"
            aria-label="Log in to your account"
          >
            Log In
          </Button>
        </div>
      </header>

      <section className="container mx-auto px-4 pb-8 pt-2 md:pb-12 md:pt-6 bg-pastel-blue/20 rounded-3xl">
        <div className="mx-auto max-w-5xl text-center">
          <Badge variant="outline" className="mx-auto mb-3 border-primary/20 px-3 py-1 text-xs text-muted-foreground sm:text-sm">
            <Brain className="mr-2 h-3.5 w-3.5 text-accent" />
            The AI-first freelancer marketplace
          </Badge>

          <div className="hero-grid relative overflow-hidden rounded-[1.5rem] border border-border/40 px-4 py-6 sm:px-6 sm:py-8 md:rounded-2xl md:px-8 md:py-10">
            <div className="mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-4 space-y-3 duration-700 md:space-y-4">
              <h1 className="text-[2.1rem] font-display font-bold leading-[0.95] tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Hire Smarter. Deliver Faster.
                <span className="mt-1 block text-primary">AI at Every Step.</span>
              </h1>

              <p className="mx-auto max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg">
                SkillPilot is the freelancer marketplace built AI-first: every post, proposal, and match is drafted, checked, and ranked by AI. Clients get a professional brief and a shortlist of matched developers in minutes. Developers get AI that writes proposals, plans the stack, and reviews work before delivery.
              </p>

              <div className="flex flex-col items-stretch justify-center gap-2 pt-2 sm:flex-row sm:items-center">
                <Button
                  size="default"
                  onClick={() => router.push("/auth")}
                  aria-label="Get started as a client to hire developers"
                >
                  Hire a Developer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="default"
                  variant="outline"
                  onClick={() => router.push("/auth")}
                  aria-label="Get started as a developer to find projects"
                >
                  Find Projects
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <Badge variant="secondary" className="px-3 py-1 text-xs">
                  <Brain className="mr-1.5 h-3 w-3 text-primary" />
                  AI Matching
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 text-xs">
                  <Shield className="mr-1.5 h-3 w-3 text-accent" />
                  Secure Platform
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 text-xs">
                  <Briefcase className="mr-1.5 h-3 w-3 text-primary" />
                  5 Project Categories
                </Badge>
              </div>
            </div>
          </div>

          <div className="phone-scroll-row mt-4 md:mt-6 md:grid md:gap-3 md:grid-cols-3">
            {HERO_PULSES.map((signal, idx) => {
              const pastels = [
                { border: 'border-pastel-blue/60', bg: 'bg-pastel-blue/40 text-pastel-blue' },
                { border: 'border-pastel-rose/60', bg: 'bg-pastel-rose/40 text-pastel-rose' },
                { border: 'border-pastel-lemon/60', bg: 'bg-pastel-lemon/40 text-pastel-lemon' },
              ];
              const p = pastels[idx] || pastels[0];
              return (
                <Card key={signal.title} className={`surface-card h-full w-full md:w-auto md:max-w-none ${p.border}`}>
                  <div className="flex min-h-[7rem] h-full flex-col items-center justify-center px-4 py-4 text-center md:min-h-[8rem]">
                    <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${p.bg}`}>
                      <signal.icon className="h-4 w-4" />
                    </div>
                    <h3 className="mb-1 text-sm font-bold">{signal.title}</h3>
                    <p className="mx-auto max-w-[16rem] text-xs leading-relaxed text-muted-foreground">{signal.description}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-band py-8 md:py-12 bg-pastel-rose/20">
        <div className="container mx-auto px-4">
          <div className="mb-6 text-center">
            <Badge variant="outline" className="mb-2 px-3 py-1 text-xs sm:text-sm">How It Works</Badge>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
              A Marketplace That Moves With You
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
              Get started in minutes whether you&apos;re hiring or looking for work, with flows that feel focused instead of crowded.
            </p>
          </div>

          <Tabs defaultValue="clients" className="mx-auto max-w-5xl">
            <TabsList className="mb-4 grid w-full grid-cols-2">
              <TabsTrigger value="clients" className="text-base">
                For Clients
              </TabsTrigger>
              <TabsTrigger value="developers" className="text-base">
                For Developers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="clients">
              <div className="phone-scroll-row md:grid md:grid-cols-3 md:gap-3">
                {CLIENT_STEPS.map((step, index) => (
                  <Card
                    key={step.title}
                    className="group surface-card relative w-full overflow-hidden border-primary/10 hover:border-primary/30 md:w-auto md:max-w-none"
                  >
                    <div className="relative flex min-h-[8rem] h-full flex-col items-center justify-center px-4 py-4 text-center">
                      <div className="pointer-events-none absolute right-4 top-2 text-5xl font-bold text-primary/10">
                        {index + 1}
                      </div>
                      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-pastel-lemon/40 text-pastel-lemon group-hover:bg-pastel-lemon/50">
                        <step.icon className="h-4 w-4" />
                      </div>
                      <h3 className="mb-1 text-sm font-bold">{step.title}</h3>
                      <p className="mx-auto max-w-[15rem] text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="developers">
              <div className="phone-scroll-row md:grid md:grid-cols-3 md:gap-3">
                {DEVELOPER_STEPS.map((step, index) => (
                  <Card
                    key={step.title}
                    className="group surface-card relative w-full overflow-hidden border-primary/10 hover:border-primary/30 md:w-auto md:max-w-none"
                  >
                    <div className="relative flex min-h-[8rem] h-full flex-col items-center justify-center px-4 py-4 text-center">
                      <div className="pointer-events-none absolute right-4 top-2 text-5xl font-bold text-primary/10">
                        {index + 1}
                      </div>
                      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-pastel-orchid/40 text-pastel-orchid group-hover:bg-pastel-orchid/50">
                        <step.icon className="h-4 w-4" />
                      </div>
                      <h3 className="mb-1 text-sm font-bold">{step.title}</h3>
                      <p className="mx-auto max-w-[15rem] text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <section className="py-8 md:py-12 bg-pastel-lemon/20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-3">
              <Badge variant="outline" className="px-3 py-1 text-sm">For Clients</Badge>
              <h2 className="text-2xl md:text-3xl font-display font-bold">
                Hire Top-Tier Developers
              </h2>
              <p className="text-sm text-muted-foreground">
                Post your idea with confidence, review strong proposals, and move into execution with a workspace designed to keep momentum high.
              </p>
              <div className="space-y-3">
                {CLIENT_FEATURES.map((feature, idx) => {
                  const iconClasses = [
                    'bg-pastel-blue/40 text-pastel-blue',
                    'bg-pastel-rose/40 text-pastel-rose',
                    'bg-pastel-lemon/40 text-pastel-lemon',
                    'bg-pastel-orchid/40 text-pastel-orchid',
                    'bg-pastel-coral/40 text-pastel-coral',
                  ];
                  const iconClass = iconClasses[idx % iconClasses.length];
                  return (
                    <Card key={feature.text} className="flex items-center gap-3 p-4 border border-border/60 shadow-sm">
                      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${iconClass}`}>
                        <feature.icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm leading-relaxed text-foreground">{feature.text}</span>
                    </Card>
                  );
                })}
              </div>
              <Button
                size="lg"
                onClick={() => router.push("/auth")}
                aria-label="Post your first project"
              >
                Post Your First Project
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="relative order-first lg:order-last">
              <Card className="surface-card border-pastel-mint/50 p-6 md:p-7">
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge>Web Development</Badge>
                    <Badge variant="secondary">Open</Badge>
                  </div>
                  <h3 className="font-bold text-2xl">E-Commerce Platform Redesign</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Looking for an experienced React developer to redesign our e-commerce platform with a more modern, conversion-focused experience and a scalable front-end foundation.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-border/60 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Budget</p>
                      <p className="mt-1 text-lg font-bold text-foreground">₹50,000 - ₹1,00,000</p>
                    </div>
                    <div className="rounded-xl border border-border/60 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Proposals</p>
                      <p className="mt-1 text-lg font-bold text-foreground">12 active reviews</p>
                    </div>
                  </div>
                  <div className="border-t border-border/50 pt-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pastel-coral/40 text-pastel-coral font-semibold">
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
            </div>
          </div>
        </div>
      </section>

      <section className="section-band-strong py-8 md:py-12 bg-pastel-orchid/20">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="relative">
              <Card className="surface-card border-pastel-lavender/50 p-6 md:p-7">
                <div className="relative space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-pastel-orchid/40 text-pastel-orchid font-bold text-xl">
                      AD
                    </div>
                    <div>
                      <h3 className="font-bold text-2xl">Ajay Darisi</h3>
                      <p className="text-muted-foreground text-sm">Senior Full-Stack Developer</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">React</Badge>
                    <Badge variant="secondary">TypeScript</Badge>
                    <Badge variant="secondary">Node.js</Badge>
                    <Badge variant="secondary">PostgreSQL</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    3+ years building scalable web applications with a strong eye for product detail, performance, and polished user experience.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-border/60 px-4 py-3 text-sm text-muted-foreground">
                      <div className="mb-2 flex items-center gap-2 text-foreground">
                        <Github className="h-4 w-4 text-primary" />
                        github.com/ajaydarisi
                      </div>
                      Full-stack portfolio and code samples
                    </div>
                    <div className="rounded-xl border border-border/60 px-4 py-3 text-sm text-muted-foreground">
                      <div className="mb-2 flex items-center gap-2 text-foreground">
                        <Linkedin className="h-4 w-4 text-accent" />
                        linkedin.com/in/ajaydarisi
                      </div>
                      Product-minded client collaboration
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
            </div>

            <div className="space-y-3">
              <Badge variant="outline" className="px-3 py-1 text-sm">For Developers</Badge>
              <h2 className="text-2xl md:text-3xl font-display font-bold">
                Find Exciting Projects
              </h2>
              <p className="text-sm text-muted-foreground">
                Build a profile that feels premium, browse opportunities with clarity, and work inside a platform that highlights your craft instead of burying it.
              </p>
              <div className="space-y-3">
                {DEVELOPER_FEATURES.map((feature, idx) => {
                  const iconClasses = [
                    'bg-pastel-aqua/40 text-pastel-aqua',
                    'bg-pastel-sky/40 text-pastel-sky',
                    'bg-pastel-sage/40 text-pastel-sage',
                    'bg-pastel-peach/40 text-pastel-peach',
                    'bg-pastel-lavender/40 text-pastel-lavender',
                  ];
                  const iconClass = iconClasses[idx % iconClasses.length];
                  return (
                    <Card key={feature.text} className="flex items-center gap-3 p-4 border border-border/60 shadow-sm">
                      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${iconClass}`}>
                        <feature.icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm leading-relaxed text-foreground">{feature.text}</span>
                    </Card>
                  );
                })}
              </div>
              <Button
                size="lg"
                onClick={() => router.push("/auth")}
                aria-label="Create your developer profile"
              >
                Create Your Profile
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12 bg-pastel-aqua/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <Badge variant="outline" className="mb-2 px-3 py-1 text-sm">Categories</Badge>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
              Explore Project Categories
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
              Discover high-value opportunities across the most in-demand technology lanes.
            </p>
          </div>

          <div className="phone-scroll-row sm:grid sm:grid-cols-2 sm:gap-6 lg:grid-cols-5">
            {PROJECT_CATEGORIES.map((category, idx) => {
              const iconBgs = [
                'bg-pastel-blue/40 text-pastel-blue',
                'bg-pastel-rose/40 text-pastel-rose',
                'bg-pastel-lemon/40 text-pastel-lemon',
                'bg-pastel-orchid/40 text-pastel-orchid',
                'bg-pastel-coral/40 text-pastel-coral',
              ];
              const iconBg = iconBgs[idx % iconBgs.length];
              return (
                <Card
                  key={category.id}
                  className="group surface-card w-full overflow-hidden border-border/60 text-center hover:border-primary/30 sm:w-auto sm:max-w-none"
                >
                  <div className="flex min-h-[8rem] h-full flex-col items-center justify-center px-4 py-4 text-center">
                    <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} group-hover:${iconBg.replace('/20', '/30')}`}>
                      <category.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-sm mb-1">{category.title}</h3>
                    <p className="mx-auto max-w-[13rem] text-xs text-muted-foreground leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-band py-8 md:py-12 bg-pastel-coral/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <Badge variant="outline" className="mb-2 px-3 py-1 text-sm">Platform</Badge>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
              Built for Modern Teams
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
              Everything you need to hire, collaborate, and ship inside one polished workspace.
            </p>
          </div>

          <div className="phone-scroll-row mx-auto max-w-5xl sm:grid sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {PLATFORM_FEATURES.map((feature, idx) => {
              const featPastels = [
                'bg-pastel-aqua/40 text-pastel-aqua',
                'bg-pastel-rose/40 text-pastel-rose',
                'bg-pastel-lemon/40 text-pastel-lemon',
                'bg-pastel-orchid/40 text-pastel-orchid',
                'bg-pastel-coral/40 text-pastel-coral',
                'bg-pastel-blue/40 text-pastel-blue',
              ];
              const fp = featPastels[idx % featPastels.length];
              return (
                <Card
                  key={feature.title}
                  className="surface-card w-full border-border/60 hover:border-primary/30 sm:w-auto sm:max-w-none"
                >
                  <div className="flex min-h-[7.5rem] h-full flex-col items-center justify-center px-4 py-4 text-center">
                    <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${fp}`}>
                      <feature.icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-sm mb-1">{feature.title}</h3>
                    <p className="mx-auto max-w-[15rem] text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12 bg-pastel-blue/20">
        <div className="container mx-auto px-4">
          <Card className="surface-card mx-auto max-w-4xl overflow-hidden border-pastel-peach/60 text-center">
            <CardContent className="relative p-6 md:p-8">
              <Badge variant="outline" className="mb-2 px-3 py-1 text-sm">Get Started</Badge>
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
                Ready to Build Something Great?
              </h2>
              <p className="text-sm text-muted-foreground mb-4 max-w-2xl mx-auto">
                Join clients and developers building the future together with a marketplace that feels fast, trustworthy, and alive.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  size="default"
                  onClick={() => router.push("/auth")}
                  aria-label="Start hiring developers"
                >
                  Start Hiring
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="default"
                  variant="outline"
                  onClick={() => router.push("/auth")}
                  aria-label="Join as a developer"
                >
                  Join as Developer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t border-border/55 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <Logo showIcon={false} textSize="text-base" />
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              © {new Date().getFullYear()} SkillPilot. All rights reserved.
            </p>
          </div>
          <div className="mt-2 flex justify-center sm:justify-end">
            <PoweredByDarisi />
          </div>
        </div>
      </footer>
    </div>
  );
}
