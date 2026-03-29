"use client";

import { BackLinkButton } from "@/components/back-link-button";
import { EmptyState } from "@/components/empty-state";
import { FilterBar } from "@/components/filter-bar";
import { Navigation } from "@/components/navigation";
import { PageHeader } from "@/components/page-header";
import { ProfileAvatar } from "@/components/profile-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAdminProjects, useAdminDeleteProject } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Search, Edit, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";

export default function AdminProjects() {
  return (
    <Suspense fallback={<AdminProjectsFallback />}>
      <AdminProjectsContent />
    </Suspense>
  );
}

function AdminProjectsFallback() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">Loading projects...</p>
        </div>
        <Card className="mb-6 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-[180px]" />
          </div>
        </Card>
        <Card className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </Card>
      </main>
    </div>
  );
}

function AdminProjectsContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [page, setPage] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const { data, isLoading } = useAdminProjects({
    search: search || undefined,
    status: status !== "all" ? status : undefined,
    page,
    pageSize: 20,
  });

  const { mutate: deleteProject, isPending: isDeleting } = useAdminDeleteProject();

  const handleDelete = (projectId: number, projectTitle: string) => {
    deleteProject(projectId, {
      onSuccess: () => {
        toast({
          title: "Project deleted",
          description: `"${projectTitle}" has been removed.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "open":
        return "default";
      case "in_progress":
        return "secondary";
      case "completed":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatBudget = (min?: number, max?: number) => {
    if (!min && !max) return "Not specified";
    if (min && max) return `₹${min.toLocaleString('en-IN')} - ₹${max.toLocaleString('en-IN')}`;
    if (min) return `From ₹${min.toLocaleString('en-IN')}`;
    if (max) return `Up to ₹${max.toLocaleString('en-IN')}`;
    return "Not specified";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto mobile-page">
        <BackLinkButton href="/admin" aria-label="Back to admin dashboard" className="mb-4">
          Back to Dashboard
        </BackLinkButton>

        <PageHeader
          className="mb-6 md:mb-8"
          title="Projects"
          description={`Manage all projects on the platform. Total: ${data?.total || 0} projects.`}
        />

        <FilterBar className="mb-4 md:mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                aria-label="Search projects"
                placeholder="Search by title or description..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger aria-label="Filter by status" className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FilterBar>

        {isLoading ? (
          <Card>
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </Card>
        ) : data?.items.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No projects found"
            description="Try a different keyword or reset the status filter."
          />
        ) : (
          <Card>
            <>
              <div className="divide-y divide-border/50 md:hidden">
                {data?.items.map((project) => (
                  <div key={project.id} className="space-y-4 p-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(project.status)}>
                          {project.status.replace(/_/g, " ")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{project.category}</span>
                      </div>
                      <p className="font-semibold" title={project.title}>{project.title}</p>
                      <div className="flex items-center gap-2">
                        <ProfileAvatar
                          name={`${project.client?.firstName || ""} ${project.client?.lastName || ""}`}
                          imageUrl={project.client?.profileImageUrl}
                          size="sm"
                        />
                        <span className="truncate text-sm text-muted-foreground" title={`${project.client?.firstName} ${project.client?.lastName}`}>
                          {project.client?.firstName} {project.client?.lastName}
                        </span>
                      </div>
                    </div>
                    <div className="grid gap-2 text-sm">
                      <div className="surface-subtle rounded-2xl px-3 py-2">
                        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Budget</span>
                        <p className="mt-1 font-medium">{formatBudget(project.budgetMin, project.budgetMax)}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Created {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button asChild variant="outline" className="w-full" aria-label="Edit project">
                        <Link href={`/admin/projects/${project.id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="w-full text-destructive" aria-label="Delete project">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Project</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &quot;{project.title}&quot;? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(project.id!, project.title)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.items.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <div className="min-w-0">
                            <p className="font-medium truncate" title={project.title}>
                              {project.title}
                            </p>
                            <p className="text-sm text-muted-foreground">{project.category}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ProfileAvatar
                              name={`${project.client?.firstName || ""} ${project.client?.lastName || ""}`}
                              imageUrl={project.client?.profileImageUrl}
                              size="sm"
                            />
                            <span className="truncate" title={`${project.client?.firstName} ${project.client?.lastName}`}>
                              {project.client?.firstName} {project.client?.lastName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(project.status)}>
                            {project.status.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatBudget(project.budgetMin, project.budgetMax)}</TableCell>
                        <TableCell>
                          {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button asChild variant="ghost" size="icon" aria-label="Edit project">
                              <Link href={`/admin/projects/${project.id}`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label="Delete project">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Project</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete &quot;{project.title}&quot;? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(project.id!, project.title)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          </Card>
        )}

        {/* Pagination */}
        {data && data.total > 20 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm text-muted-foreground">
              Page {page} of {Math.ceil(data.total / 20)}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(data.total / 20)}
              aria-label="Next page"
            >
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
