"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Navigation } from "@/components/navigation";
import { ProjectIntakeForm } from "@/components/project-intake-form";
import { useCreateProject } from "@/hooks/use-projects";
import type { InsertProject } from "@shared/routes";

export default function PostProject() {
  const router = useRouter();
  const { mutate: createProject, isPending } = useCreateProject();

  const handleSubmit = (values: InsertProject) => {
    createProject(values, {
      onSuccess: () => {
        router.push("/client/projects");
      },
    });
  };

  return (
    <div className="page-shell min-h-screen bg-background pb-12">
      <Navigation />
      <div className="container mx-auto mobile-page">
        <Link
          href="/client/projects"
          aria-label="Back to projects"
          className="surface-glass mb-4 inline-flex items-center rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-primary md:mb-6"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Projects
        </Link>

        <div className="mx-auto max-w-5xl">
          <ProjectIntakeForm mode="create" isPending={isPending} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
