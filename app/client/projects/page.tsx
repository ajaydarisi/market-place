"use client";

import { EmptyState } from "@/components/empty-state";
import { useProjects } from "@/hooks/use-projects";
import { Navigation } from "@/components/navigation";
import { PageHeader } from "@/components/page-header";
import { ProjectCard } from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function MyProjects() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const { data: projects, isLoading } = useProjects({ search, clientId: user?.id });

  return (
    <div className="page-shell min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto mobile-page">
        <PageHeader
          className="mb-6 md:mb-8"
          title="My Projects"
          description="Manage active listings, review project momentum, and keep every opportunity ready for the next conversation."
        >
          <div className="mobile-filter-bar surface-subtle relative w-full max-w-md rounded-2xl p-2">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              aria-label="Search projects"
              placeholder="Search your projects..."
              className="border-0 bg-transparent pl-10 shadow-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="client-projects-search-input"
            />
          </div>
        </PageHeader>

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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6" data-testid="client-projects-list">
            {projects?.map((project) => (
              <ProjectCard key={project.id} project={project} testIdPrefix="client-project-card" />
            ))}
            {projects?.length === 0 && (
              <EmptyState
                icon={Plus}
                title="No projects yet"
                description="Create your first project to start receiving proposals from top developers."
                className="col-span-full"
                action={(
                  <Button asChild aria-label="Post project" variant="outline" className="surface-glass" data-testid="client-projects-create-button">
                    <Link href="/client/post" aria-label="Post a new project">Post Project</Link>
                  </Button>
                )}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
