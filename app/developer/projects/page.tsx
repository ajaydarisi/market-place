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
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">My Projects</h1>
          <p className="text-muted-foreground mt-1">Projects you&apos;ve been assigned to work on.</p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden rounded-xl border-border/50">
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((project) => (
              <Card key={project.id} className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border bg-card/50 backdrop-blur-sm">
                <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-primary to-accent opacity-0 transition-opacity group-hover:opacity-100" />

                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                          {project.category}
                        </Badge>
                        <Badge variant={statusVariant(project.status)}>
                          {statusLabels[project.status] || project.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors truncate" title={project.title}>
                        {project.title}
                      </CardTitle>
                    </div>
                    {project.budgetMin && (
                      <div className="flex flex-col items-end">
                        <span className="text-lg font-bold text-foreground">
                          ₹{project.budgetMin.toLocaleString('en-IN')}
                          {project.budgetMax ? ` - ₹${project.budgetMax.toLocaleString('en-IN')}` : '+'}
                        </span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Budget</span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pb-3">
                  <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed" title={project.description}>
                    {project.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground font-medium">
                    <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
                      <User className="h-3.5 w-3.5" />
                      <span>{project.client.firstName} {project.client.lastName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Posted {formatDistanceToNow(new Date(project.createdAt!), { addSuffix: true })}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="py-4 mt-3 border-t border-t-border bg-muted/20">
                  <Link href={`/projects/${project.id}`} aria-label={`View details for ${project.title}`} className="w-full">
                    <Button aria-label="View project details" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300" variant="secondary">
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
            {projects?.length === 0 && (
              <Card className="col-span-full border-2 border-dashed bg-secondary/20 rounded-2xl">
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Briefcase className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold">No assigned projects yet</h3>
                  <p className="text-muted-foreground max-w-sm mt-2 mb-6">
                    Browse available projects and submit proposals to get started.
                  </p>
                  <Link href="/developer/browse" aria-label="Browse available projects">
                    <Button aria-label="Browse projects" variant="outline">Browse Projects</Button>
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
