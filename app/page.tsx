"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, CheckCircle2, Shield, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
    <div className="h-screen bg-background overflow-hidden relative">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/5 to-transparent -z-10" />
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl -z-10" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl -z-10" />

      <header className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="font-display text-2xl font-bold tracking-tight">
          Market<span className="text-primary">Place</span>
        </div>
        <Button onClick={() => router.push("/auth")} variant="outline" aria-label="Log in" className="font-semibold">
          Log In
        </Button>
      </header>

      <main className="container mx-auto px-4 pt-16 pb-32">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-5xl md:text-7xl font-display font-bold leading-[1.1] tracking-tight text-foreground">
            Connecting visionaries with <span className="text-gradient">world-class talent</span>.
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The premium marketplace for top-tier developers and ambitious clients. Build your dream team today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              onClick={() => router.push("/auth")}
              aria-label="Get started"
              className="h-14 px-8 text-lg rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-8 pt-24 text-left">
            {[
              {
                icon: Shield,
                title: "Vetted Talent",
                desc: "Every developer is screened for quality and reliability."
              },
              {
                icon: Zap,
                title: "Fast Matching",
                desc: "Our algorithm connects you with the right people instantly."
              },
              {
                icon: CheckCircle2,
                title: "Secure Payments",
                desc: "Milestone-based payments ensure you only pay for results."
              }
            ].map((feature, i) => (
              <Card key={i} className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg hover:border-primary/50 transition-colors rounded-2xl">
                <CardContent className="p-8">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
