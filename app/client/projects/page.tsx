"use client";

import { useProjects } from "@/hooks/use-projects";
import { Navigation } from "@/components/navigation";
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
        <div className="surface-glass mobile-panel mb-6 overflow-hidden border-primary/10 md:mb-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="mobile-section-title">My Projects</h1>
              <p className="mobile-copy mt-2 max-w-2xl">
                Manage active listings, review project momentum, and keep every opportunity ready for the next conversation.
              </p>
            </div>

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
          </div>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6" data-testid="client-projects-list">
            {projects?.map((project) => (
              <ProjectCard key={project.id} project={project} testIdPrefix="client-project-card" />
            ))}
            {projects?.length === 0 && (
              <Card className="surface-glass col-span-full border-2 border-dashed border-border/60">
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-primary/[0.08] text-primary">
                    <Plus className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold">No projects yet</h3>
                  <p className="text-muted-foreground max-w-sm mt-2 mb-6">Create your first project to start receiving proposals from top developers.</p>
                  <Link href="/client/post" aria-label="Post a new project">
                    <Button aria-label="Post project" variant="outline" className="surface-glass" data-testid="client-projects-create-button">Post Project</Button>
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
