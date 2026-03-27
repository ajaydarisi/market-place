"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, User } from "lucide-react";
import { type Project } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface ProjectCardProps {
  project: Project & { client: { firstName: string | null; lastName: string | null } };
  isDeveloper?: boolean;
  testIdPrefix?: string;
}

export function ProjectCard({ project, isDeveloper, testIdPrefix = "project-card" }: ProjectCardProps) {
  return (
    <Card
      data-testid={`${testIdPrefix}-${project.id}`}
      className="group surface-glass relative overflow-hidden border-border/60 transition-all duration-300 hover:border-primary/30 hover:shadow-2xl"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-accent/60" />
      <div className="pointer-events-none absolute -right-8 top-6 h-28 w-28 rounded-full bg-primary/10 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <CardHeader className="pb-3 md:pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <Badge variant="outline" className="mb-3 bg-primary/[0.06] text-primary border-primary/20">
              {project.category}
            </Badge>
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

      <CardContent className="pb-3 md:pb-4">
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

      <CardFooter className="mt-2 border-t border-t-border/50 bg-gradient-to-r from-secondary/55 to-background/20 py-4">
        <Link href={`/projects/${project.id}`} aria-label={`View details for ${project.title}`} className="w-full">
          <Button
            aria-label="View project details"
            className="w-full"
            variant="secondary"
            data-testid={`${testIdPrefix}-${project.id}-view-button`}
          >
            {isDeveloper ? "Review Opportunity" : "View Details"}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
