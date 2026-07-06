"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, User, Users, BriefcaseBusiness, Sparkles, Loader2 } from "lucide-react";
import { useMatchRationale } from "@/hooks/use-ai";
import { type Project, type User as MarketplaceUser } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
  ENGAGEMENT_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  getProjectCategoryLabel,
  getTechnologyTagLabel,
  PROJECT_TYPE_LABELS,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_BADGE_VARIANTS,
  SCOPE_SIZE_LABELS,
} from "@shared/marketplace";
import { RatingPill } from "@/components/rating-pill";

interface ProjectCardProps {
  project: Project & { client: MarketplaceUser };
  isDeveloper?: boolean;
  testIdPrefix?: string;
}

export function ProjectCard({ project, isDeveloper, testIdPrefix = "project-card" }: ProjectCardProps) {
  const matchRationale = useMatchRationale();

  return (
    <Card
      data-testid={`${testIdPrefix}-${project.id}`}
      className="group surface-glass relative overflow-hidden border-border/60 transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
    >
      <div className="pointer-events-none absolute -right-8 top-6 h-28 w-28 rounded-full bg-primary/6 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <CardHeader className="pb-3 md:pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="bg-primary/[0.06] text-primary border-primary/20">
                {getProjectCategoryLabel(project.category)}
              </Badge>
              {!isDeveloper ? (
                <Badge variant={PROJECT_STATUS_BADGE_VARIANTS[project.status] ?? "secondary"}>
                  {PROJECT_STATUS_LABELS[project.status] ?? project.status}
                </Badge>
              ) : null}
            </div>
            <CardTitle className="text-lg font-bold leading-tight transition-colors group-hover:text-primary sm:text-xl" title={project.title}>
              {project.title}
            </CardTitle>
            {project.recommendationScore ? (
              <div className="mt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  data-testid={`${testIdPrefix}-${project.id}-match-rationale`}
                  className="h-auto rounded-full bg-primary/[0.08] px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/[0.14] hover:text-primary"
                  disabled={matchRationale.isPending}
                  onClick={() => {
                    if (!matchRationale.data && !matchRationale.isPending) {
                      matchRationale.mutate({ projectId: project.id! });
                    }
                  }}
                >
                  {matchRationale.isPending
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Sparkles className="h-3.5 w-3.5" />}
                  <span className="ml-1">{project.recommendationScore}% match</span>
                  {!matchRationale.data && !matchRationale.isPending ? (
                    <span className="ml-1.5 underline decoration-dotted underline-offset-2">Why this match?</span>
                  ) : null}
                </Button>
                {matchRationale.data ? (
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {matchRationale.data.rationale}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
          {project.budgetMin && (
            <div className="surface-subtle border-pastel-peach/50 rounded-2xl px-4 py-3 text-left sm:text-right">
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
          {project.businessGoal || project.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {project.engagementType ? (
            <Badge variant="secondary">{ENGAGEMENT_TYPE_LABELS[project.engagementType]}</Badge>
          ) : null}
          {project.projectType ? (
            <Badge variant="secondary">{PROJECT_TYPE_LABELS[project.projectType]}</Badge>
          ) : null}
          {project.scopeSize ? (
            <Badge variant="secondary">{SCOPE_SIZE_LABELS[project.scopeSize]}</Badge>
          ) : null}
          {project.preferredExperienceLevel ? (
            <Badge variant="secondary">{EXPERIENCE_LEVEL_LABELS[project.preferredExperienceLevel]}</Badge>
          ) : null}
          {project.deadline ? (
            <Badge variant="outline">Due {new Date(project.deadline).toLocaleDateString()}</Badge>
          ) : null}
          {(project.technologyTags?.length ? project.technologyTags : project.requiredSkills)?.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="outline">
              {getTechnologyTagLabel(skill)}
            </Badge>
          ))}
          {(project.technologyTags?.length ? project.technologyTags : project.requiredSkills) &&
          (project.technologyTags?.length ? project.technologyTags.length : project.requiredSkills?.length || 0) > 3 ? (
            <Badge variant="outline">
              +{(project.technologyTags?.length ? project.technologyTags.length : project.requiredSkills?.length || 0) - 3} more
            </Badge>
          ) : null}
        </div>

        {project.deliverables && project.deliverables.length > 0 ? (
          <div className="mt-4 rounded-2xl border border-border/50 bg-background/35 px-4 py-3 text-sm text-muted-foreground">
            First deliverable: <span className="font-medium text-foreground">{project.deliverables[0]}</span>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3 text-xs text-muted-foreground font-medium">
          <div className="surface-subtle flex items-center gap-1.5 rounded-full px-3 py-1.5">
            <User className="h-3.5 w-3.5" />
            <span>{project.client.firstName} {project.client.lastName}</span>
          </div>
          {isDeveloper ? (
            <div className="surface-subtle flex items-center gap-1.5 rounded-full px-3 py-1.5">
              <BriefcaseBusiness className="h-3.5 w-3.5" />
              <RatingPill
                averageRating={project.client.averageRating}
                reviewCount={project.client.reviewCount}
                className="border-0 bg-transparent px-0 py-0 text-inherit"
                emptyLabel="New client"
              />
            </div>
          ) : null}
          <div className="surface-subtle flex items-center gap-1.5 rounded-full px-3 py-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>Posted {formatDistanceToNow(new Date(project.createdAt!), { addSuffix: true })}</span>
          </div>
          {!isDeveloper ? (
            <div className="surface-subtle flex items-center gap-1.5 rounded-full px-3 py-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>
                {project.proposalCount ?? 0} {(project.proposalCount ?? 0) === 1 ? "proposal" : "proposals"}
              </span>
            </div>
          ) : null}
        </div>
      </CardContent>

      <CardFooter className="mt-2 border-t border-t-border/50 bg-gradient-to-r from-secondary/55 to-background/20 py-4">
        <Button
          asChild
          aria-label="View project details"
          className="w-full"
          variant="secondary"
          data-testid={`${testIdPrefix}-${project.id}-view-button`}
        >
          <Link href={`/projects/${project.id}`} aria-label={`View details for ${project.title}`}>
            {isDeveloper ? "Review Opportunity" : "View Details"}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
