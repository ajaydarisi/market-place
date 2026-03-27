"use client";

import { useAssignedProjects } from "@/hooks/use-assigned-projects";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Briefcase, Calendar, User } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function DeveloperProjects() {
  const { data: projects, isLoading } = useAssignedProjects();

  const statusLabels: Record<string, string> = {
    open: "Open",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case "open": return "default" as const;
      case "in_progress": return "secondary" as const;
      case "completed": return "default" as const;
      case "cancelled": return "destructive" as const;
      default: return "secondary" as const;
    }
  };

  return (
    <div className="page-shell min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto mobile-page">
        <div className="surface-glass mobile-panel mb-6 overflow-hidden border-primary/10 md:mb-8">
          <h1 className="mobile-section-title">My Projects</h1>
          <p className="mobile-copy mt-2 max-w-2xl">
            Track active assignments, jump into delivery faster, and keep every project surface feeling focused and actionable.
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="surface-glass overflow-hidden">
                <div className="p-6 space-y-4">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-3 pt-2">
                    <Skeleton className="h-6 w-20 rounded-md" />
                    <Skeleton className="h-6 w-28 rounded-md" />
                  </div>
                </div>
                <div className="border-t p-4">
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {projects?.map((project) => (
              <Card key={project.id} className="group surface-glass relative overflow-hidden border-border/60 transition-all duration-300 hover:border-primary/30 hover:shadow-2xl">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-accent/60" />

                <CardHeader className="pb-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-primary/[0.06] text-primary border-primary/20">
                          {project.category}
                        </Badge>
                        <Badge variant={statusVariant(project.status)}>
                          {statusLabels[project.status] || project.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-bold leading-tight transition-colors group-hover:text-primary sm:text-xl" title={project.title}>
                        {project.title}
                      </CardTitle>
                    </div>
                    {project.budgetMin && (
                      <div className="surface-subtle rounded-2xl px-4 py-3 text-left sm:text-right">
                        <span className="block text-base font-bold text-foreground sm:text-lg">
                          ₹{project.budgetMin.toLocaleString('en-IN')}
                          {project.budgetMax ? ` - ₹${project.budgetMax.toLocaleString('en-IN')}` : '+'}
                        </span>
                        <span className="text-[11px] text-muted-foreground uppercase tracking-[0.2em] font-medium">Budget</span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pb-4">
                  <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed" title={project.description}>
                    {project.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3 text-xs text-muted-foreground font-medium">
                    <div className="surface-subtle flex items-center gap-1.5 rounded-full px-3 py-1.5">
                      <User className="h-3.5 w-3.5" />
                      <span>{project.client.firstName} {project.client.lastName}</span>
                    </div>
                    <div className="surface-subtle flex items-center gap-1.5 rounded-full px-3 py-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Posted {formatDistanceToNow(new Date(project.createdAt!), { addSuffix: true })}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="mt-3 border-t border-t-border/50 bg-gradient-to-r from-secondary/55 to-background/20 py-4">
                  <Link href={`/projects/${project.id}`} aria-label={`View details for ${project.title}`} className="w-full">
                    <Button aria-label="View project details" className="w-full" variant="secondary">
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
            {projects?.length === 0 && (
              <Card className="surface-glass col-span-full border-2 border-dashed border-border/60">
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-primary/[0.08] text-primary">
                    <Briefcase className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold">No assigned projects yet</h3>
                  <p className="text-muted-foreground max-w-sm mt-2 mb-6">
                    Browse available projects and submit proposals to get started.
                  </p>
                  <Link href="/developer/browse" aria-label="Browse available projects">
                    <Button aria-label="Browse projects" variant="outline" className="surface-glass">Browse Projects</Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
