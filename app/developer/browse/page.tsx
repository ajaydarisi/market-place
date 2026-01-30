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
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Search Section */}
      <div className="bg-secondary/30 border-b border-border/50 py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 tracking-tight">Find your next <span className="text-gradient">opportunity</span></h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">Browse hundreds of projects from top clients and start building your reputation.</p>

          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                aria-label="Search projects"
                placeholder="Search by keywords..."
                className="pl-12 h-14 rounded-xl text-lg shadow-sm border-transparent focus:border-primary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger aria-label="Filter by category" className="w-full sm:w-[200px] h-14 rounded-xl border-transparent shadow-sm bg-background">
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

      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold font-display">
            {projects?.length ? `${projects.length} Projects Available` : 'Loading projects...'}
          </h2>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger aria-label="Sort projects" className="w-[180px]">
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
              <ProjectCard key={project.id} project={project} isDeveloper />
            ))}
            {projects?.length === 0 && (
              <div className="col-span-full py-24 text-center">
                <h3 className="text-xl font-bold">No projects found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your search filters.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
