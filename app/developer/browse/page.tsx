"use client";

import { EmptyState } from "@/components/empty-state";
import { useProjects } from "@/hooks/use-projects";
import { Navigation } from "@/components/navigation";
import { PageHeader } from "@/components/page-header";
import { ProjectCard } from "@/components/project-card";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TagInput } from "@/components/ui/tag-input";
import {
  EXPERIENCE_LEVEL_LABELS,
  PROJECT_CATEGORY_OPTIONS,
  PROJECT_TYPE_LABELS,
  SCOPE_SIZE_LABELS,
} from "@shared/marketplace";
import { Search } from "lucide-react";
import { useDeferredValue, useState } from "react";

export default function BrowseJobs() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<string>("recommended");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [technologyTags, setTechnologyTags] = useState<string[]>([]);
  const [preferredExperienceLevel, setPreferredExperienceLevel] = useState<string>("all");
  const [projectType, setProjectType] = useState<string>("all");
  const [scopeSize, setScopeSize] = useState<string>("all");
  const deferredSearch = useDeferredValue(search);
  const { data: projects, isLoading } = useProjects({
    search: deferredSearch,
    category: category === "all" ? undefined : category,
    sort,
    status: "open",
    minBudget: minBudget ? Number(minBudget) : undefined,
    maxBudget: maxBudget ? Number(maxBudget) : undefined,
    requiredSkills: requiredSkills.length > 0 ? requiredSkills : undefined,
    technologyTags: technologyTags.length > 0 ? technologyTags : undefined,
    preferredExperienceLevel:
      preferredExperienceLevel === "all" ? undefined : preferredExperienceLevel,
    projectType: projectType === "all" ? undefined : projectType,
    scopeSize: scopeSize === "all" ? undefined : scopeSize,
  });

  return (
    <div className="page-shell min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto mobile-page">
        <PageHeader
          title={<>Find your next <span className="text-gradient">opportunity</span></>}
          description="Browse focused projects from serious clients and step into work that keeps your craft visible."
        >
          <div className="mobile-stack">
            <div className="mobile-filter-bar mx-auto flex w-full max-w-5xl flex-col gap-3 rounded-[1.6rem] bg-background/55 p-2 md:static md:bg-transparent md:p-0">
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
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger aria-label="Filter by category" className="w-full" data-testid="browse-category-filter">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {PROJECT_CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={projectType} onValueChange={setProjectType}>
                  <SelectTrigger aria-label="Project type" className="w-full">
                    <SelectValue placeholder="Any project type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any project type</SelectItem>
                    {Object.entries(PROJECT_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={scopeSize} onValueChange={setScopeSize}>
                  <SelectTrigger aria-label="Scope size" className="w-full">
                    <SelectValue placeholder="Any scope size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any scope size</SelectItem>
                    {Object.entries(SCOPE_SIZE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={preferredExperienceLevel} onValueChange={setPreferredExperienceLevel}>
                  <SelectTrigger aria-label="Preferred experience level" className="w-full">
                    <SelectValue placeholder="Any experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any experience</SelectItem>
                    {Object.entries(EXPERIENCE_LEVEL_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  aria-label="Minimum budget filter"
                  type="number"
                  placeholder="Min budget"
                  value={minBudget}
                  onChange={(event) => setMinBudget(event.target.value)}
                />

                <Input
                  aria-label="Maximum budget filter"
                  type="number"
                  placeholder="Max budget"
                  value={maxBudget}
                  onChange={(event) => setMaxBudget(event.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="surface-subtle rounded-[1.6rem] p-3">
                <TagInput
                  value={requiredSkills}
                  onChange={setRequiredSkills}
                  placeholder="Filter by required skills..."
                />
              </div>
              <div className="surface-subtle rounded-[1.6rem] p-3">
                <TagInput
                  value={technologyTags}
                  onChange={setTechnologyTags}
                  placeholder="Filter by technology tags..."
                />
              </div>
            </div>
          </div>
        </PageHeader>
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
              <SelectItem value="recommended">Recommended</SelectItem>
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
              <EmptyState
                icon={Search}
                title="No projects found"
                description="Try adjusting your search terms, budget, or skill filters."
                className="col-span-full"
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
