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
}

export function ProjectCard({ project, isDeveloper }: ProjectCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/60 bg-card/50 backdrop-blur-sm">
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-primary to-accent opacity-0 transition-opacity group-hover:opacity-100" />

      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div>
            <Badge variant="outline" className="mb-2 bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 transition-colors">
              {project.category}
            </Badge>
            <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors truncate" title={project.title}>
              {project.title}
            </CardTitle>
          </div>
          {project.budgetMin && (
            <div className="flex flex-col items-end">
              <span className="text-lg font-bold text-foreground">
                ${project.budgetMin.toLocaleString()}
                {project.budgetMax ? ` - $${project.budgetMax.toLocaleString()}` : '+'}
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

      <CardFooter className="pt-3 border-t bg-muted/20">
        <Link href={`/projects/${project.id}`} aria-label={`View details for ${project.title}`} className="w-full">
          <Button aria-label="View project details" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300" variant="secondary">
            View Details
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
