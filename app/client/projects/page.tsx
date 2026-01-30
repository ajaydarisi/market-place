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

export default function MyProjects() {
  const [search, setSearch] = useState("");
  const { data: projects, isLoading } = useProjects({ search });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">My Projects</h1>
          <p className="text-muted-foreground mt-1">Manage your active listings and view proposals.</p>
        </div>

        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your projects..."
            className="pl-10 h-12 rounded-xl border-muted bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
              <ProjectCard key={project.id} project={project} />
            ))}
            {projects?.length === 0 && (
              <Card className="col-span-full border-2 border-dashed bg-secondary/20 rounded-2xl">
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold">No projects yet</h3>
                  <p className="text-muted-foreground max-w-sm mt-2 mb-6">Create your first project to start receiving proposals from top developers.</p>
                  <Link href="/client/post">
                    <Button variant="outline">Post Project</Button>
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
