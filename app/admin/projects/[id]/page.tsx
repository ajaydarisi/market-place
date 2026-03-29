"use client";

import { BackLinkButton } from "@/components/back-link-button";
import { EmptyState } from "@/components/empty-state";
import { Navigation } from "@/components/navigation";
import { PageHeader } from "@/components/page-header";
import { ProfileAvatar } from "@/components/profile-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useAdminProject, useAdminUpdateProject, useAdminDeleteProject } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Loader2, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { projectStatuses } from "@shared/schema";

export default function AdminProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const projectId = Number(params.id);

  const { data: project, isLoading } = useAdminProject(projectId);
  const { mutate: updateProject, isPending: isUpdating } = useAdminUpdateProject();
  const { mutate: deleteProject, isPending: isDeleting } = useAdminDeleteProject();

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("");

  // Populate form when data loads
  useEffect(() => {
    if (project) {
      setTitle(project.title || "");
      setCategory(project.category || "");
      setDescription(project.description || "");
      setBudgetMin(project.budgetMin?.toString() || "");
      setBudgetMax(project.budgetMax?.toString() || "");
      setDeadline(
        project.deadline
          ? new Date(project.deadline).toISOString().split("T")[0]
          : ""
      );
      setStatus(project.status || "open");
    }
  }, [project]);

  const handleSave = () => {
    const data: any = {
      title,
      category,
      description,
      status: status as any,
    };

    if (budgetMin) data.budgetMin = Number(budgetMin);
    if (budgetMax) data.budgetMax = Number(budgetMax);
    if (deadline) data.deadline = deadline;

    updateProject(
      { id: projectId, data },
      {
        onSuccess: () => {
          toast({ title: "Project updated", description: "Project details saved successfully." });
        },
        onError: (error) => {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        },
      }
    );
  };

  const handleDelete = () => {
    deleteProject(projectId, {
      onSuccess: () => {
        toast({ title: "Project deleted", description: "Project has been removed." });
        router.push("/admin/projects");
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-96" />
            <Skeleton className="h-64" />
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <EmptyState
            icon={Briefcase}
            title="Project not found"
            description="This project may have been deleted or is no longer available to administer."
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <BackLinkButton href="/admin/projects" aria-label="Back to projects list" className="mb-4">
          Back to Projects
        </BackLinkButton>

        <PageHeader
          className="mb-8"
          title={
            <div className="min-w-0">
              <div className="truncate text-3xl font-display font-bold" title={project.title}>
                {project.title}
              </div>
              <div className="text-muted-foreground">{project.category}</div>
            </div>
          }
          actions={(
            <Badge variant={getStatusBadgeVariant(project.status)}>
              {project.status.replace(/_/g, " ")}
            </Badge>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          {/* Project Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Edit project information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  aria-label="Project title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  aria-label="Project category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  aria-label="Project description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budgetMin">Min Budget (₹)</Label>
                  <Input
                    id="budgetMin"
                    type="number"
                    aria-label="Minimum budget"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budgetMax">Max Budget (₹)</Label>
                  <Input
                    id="budgetMax"
                    type="number"
                    aria-label="Maximum budget"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  aria-label="Project deadline"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger aria-label="Project status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectStatuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} disabled={isUpdating} aria-label="Save project">
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Client Info Card */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
                <CardDescription>Project owner details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <ProfileAvatar
                    name={`${project.client?.firstName || ""} ${project.client?.lastName || ""}`}
                    imageUrl={project.client?.profileImageUrl}
                    size="lg"
                  />
                  <div>
                    <p className="font-medium">
                      {project.client?.firstName} {project.client?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{project.client?.email}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button asChild variant="outline" aria-label="View client profile">
                    <Link href={`/admin/users/${project.clientId}`}>
                      View Client Profile
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Metadata</CardTitle>
                <CardDescription>System information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Project ID</span>
                  <span className="font-medium">{project.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">
                    {project.createdAt
                      ? new Date(project.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client ID</span>
                  <span className="font-medium font-mono text-xs">{project.clientId}</span>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions</CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" aria-label="Delete project">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Project
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Project</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete &quot;{project.title}&quot;? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
