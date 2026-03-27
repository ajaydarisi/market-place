"use client";

import { useProjects } from "@/hooks/use-projects";
import { Navigation } from "@/components/navigation";
import { ProjectCard } from "@/components/project-card";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { useState } from "react";

export default function BrowseJobs() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [sort, setSort] = useState<string>("newest");
  const { data: projects, isLoading } = useProjects({ search, category: category === "all" ? undefined : category, sort });

  return (
    <div className="page-shell min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto mobile-page">
        <div className="surface-glass mobile-panel overflow-hidden border-primary/10">
          <div className="mobile-stack">
            <div className="text-left md:text-center">
              <h1 className="mobile-section-title mb-4 tracking-tight">
                Find your next <span className="text-gradient">opportunity</span>
              </h1>
              <p className="mobile-copy max-w-2xl md:mx-auto md:text-lg">
                Browse focused projects from serious clients and step into work that keeps your craft visible.
              </p>
            </div>

            <div className="mobile-filter-bar mx-auto flex w-full max-w-4xl flex-col gap-3 rounded-[1.6rem] bg-background/55 p-2 sm:flex-row md:static md:bg-transparent md:p-0">
              <div className="surface-subtle relative flex-1 rounded-2xl p-2">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  aria-label="Search projects"
                  placeholder="Search by keywords..."
                  className="border-0 bg-transparent pl-11 text-base shadow-none md:text-lg"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  data-testid="browse-search-input"
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger aria-label="Filter by category" className="w-full sm:w-[220px]" data-testid="browse-category-filter">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="web_dev">Web Development</SelectItem>
                  <SelectItem value="mobile_app">Mobile App</SelectItem>
                  <SelectItem value="design">UI/UX Design</SelectItem>
                  <SelectItem value="ai_ml">AI & Machine Learning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 pb-10 pt-2 md:py-12">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:mb-8">
          <h2 className="text-xl font-bold font-display sm:text-2xl">
            {projects?.length ? `${projects.length} Projects Available` : 'Loading projects...'}
          </h2>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger aria-label="Sort projects" className="w-full sm:w-[180px]" data-testid="browse-sort-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="budget_high">Budget: High to Low</SelectItem>
              <SelectItem value="budget_low">Budget: Low to High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6" data-testid="browse-projects-list">
            {projects?.map((project) => (
              <ProjectCard key={project.id} project={project} isDeveloper testIdPrefix="developer-project-card" />
            ))}
            {projects?.length === 0 && (
              <Card className="surface-glass col-span-full py-16 text-center">
                <h3 className="text-xl font-bold">No projects found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your search filters.</p>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
