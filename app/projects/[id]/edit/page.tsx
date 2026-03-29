"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Navigation } from "@/components/navigation";
import { ProjectIntakeForm } from "@/components/project-intake-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useProject, useUpdateProject } from "@/hooks/use-projects";
import { projectStatuses, type InsertProject } from "@shared/schema";

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

function toDateInputValue(value?: string | Date | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = Number(params.id);
  const { data: project, isLoading } = useProject(projectId);
  const { mutate: updateProject, isPending } = useUpdateProject();
  const [status, setStatus] = useState<typeof projectStatuses[number]>("open");

  useEffect(() => {
    if (project?.status) {
      setStatus(project.status);
    }
  }, [project?.status]);

  if (isLoading || !project) {
    return (
      <div className="page-shell min-h-screen bg-background">
        <Navigation />
        <div className="flex h-[calc(100vh-80px)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (project.clientId !== user?.id) {
    return (
      <div className="page-shell min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <Card className="mx-auto max-w-2xl">
            <CardContent className="py-12 text-center text-muted-foreground">
              You can only edit projects you own.
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleSubmit = (values: InsertProject) => {
    updateProject(
      {
        id: projectId,
        data: {
          ...values,
          status,
        },
      },
      {
        onSuccess: () => {
          router.push(`/projects/${projectId}`);
        },
      },
    );
  };

  return (
    <div className="page-shell min-h-screen bg-background pb-12">
      <Navigation />
      <div className="container mx-auto mobile-page">
        <Link
          href={`/projects/${projectId}`}
          aria-label="Back to project"
          className="surface-glass mb-4 inline-flex items-center rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-primary md:mb-6"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Project
        </Link>

        <div className="mx-auto max-w-5xl space-y-6">
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg">Project Status</CardTitle>
            </CardHeader>
            <CardContent className="max-w-sm">
              <FormLabel>Status</FormLabel>
              <Select value={status} onValueChange={(value: typeof projectStatuses[number]) => setStatus(value)}>
                <SelectTrigger className="mt-2 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projectStatuses.map((nextStatus) => (
                    <SelectItem key={nextStatus} value={nextStatus}>
                      {STATUS_LABELS[nextStatus]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <ProjectIntakeForm
            mode="edit"
            isPending={isPending}
            onSubmit={handleSubmit}
            initialValues={{
              title: project.title,
              category: project.category,
              description: project.description,
              businessGoal: project.businessGoal ?? "",
              currentState: project.currentState ?? "",
              targetUsers: project.targetUsers ?? "",
              projectType: project.projectType ?? "one_time",
              scopeSize: project.scopeSize ?? "medium",
              budgetMin: project.budgetMin ?? 0,
              budgetMax: project.budgetMax ?? 0,
              requiredSkills: project.requiredSkills ?? [],
              preferredSkills: project.preferredSkills ?? [],
              technologyTags: project.technologyTags ?? [],
              deliverables: project.deliverables ?? [],
              mustHaves: project.mustHaves ?? [],
              niceToHaves: project.niceToHaves ?? [],
              successCriteria: project.successCriteria ?? [],
              preferredExperienceLevel: project.preferredExperienceLevel ?? null,
              engagementType: project.engagementType ?? "fixed",
              teamPreference: project.teamPreference ?? null,
              communicationCadence: project.communicationCadence ?? null,
              estimatedDurationWeeks: project.estimatedDurationWeeks ?? null,
              startDate: toDateInputValue(project.startDate),
              deadline: toDateInputValue(project.deadline),
              screeningQuestions: project.screeningQuestions ?? [],
              referenceLinks: project.referenceLinks ?? [],
            }}
          />
        </div>
      </div>
    </div>
  );
}
