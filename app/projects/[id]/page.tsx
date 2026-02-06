"use client";

import { useProject, useUpdateProject, useDeleteProject } from "@/hooks/use-projects";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profiles";
import { useProjectInterests, useExpressInterest } from "@/hooks/use-interests";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileAvatar } from "@/components/profile-avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { insertProjectSchema, projectStatuses } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatDistanceToNow } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Calendar, User, CheckCircle2, Pencil, MessageSquare, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function ProjectDetail() {
  const params = useParams();
  const projectId = parseInt(params.id as string || "0");
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id || "");
  const { data: project, isLoading } = useProject(projectId);
  const { data: interests } = useProjectInterests(projectId);

  const isClient = profile?.role === "client";
  const isOwner = isClient && project?.client.id === user?.id;

  const router = useRouter();
  const { mutate: expressInterest, isPending: interestPending } = useExpressInterest();
  const { mutate: updateProject, isPending: updatePending } = useUpdateProject();
  const { mutate: deleteProject, isPending: deletePending } = useDeleteProject();
  const [interestMessage, setInterestMessage] = useState("");
  const [interestOpen, setInterestOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const hasExpressedInterest = interests?.some(i => i.developerId === user?.id);

  const editFormSchema = insertProjectSchema.extend({
    budgetMin: z.coerce.number().min(1, "Budget must be at least ₹1"),
    budgetMax: z.coerce.number().min(1, "Budget must be at least ₹1"),
    status: z.enum(projectStatuses),
  });

  const editForm = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      title: project?.title || "",
      description: project?.description || "",
      category: project?.category || "",
      budgetMin: project?.budgetMin || undefined,
      budgetMax: project?.budgetMax || undefined,
      status: project?.status || "open",
    },
  });

  useEffect(() => {
    if (project && editOpen) {
      editForm.reset({
        title: project.title,
        description: project.description,
        category: project.category,
        budgetMin: project.budgetMin || undefined,
        budgetMax: project.budgetMax || undefined,
        status: project.status || "open",
      });
    }
  }, [project, editOpen, editForm]);

  const statusLabels: Record<string, string> = {
    open: "Open",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case "open": return "default" as const;
      case "in_progress": return "secondary" as const;
      case "completed": return "default" as const;
      case "cancelled": return "destructive" as const;
      default: return "secondary" as const;
    }
  };

  const handleEdit = (data: z.infer<typeof editFormSchema>) => {
    updateProject({ id: projectId, data }, {
      onSuccess: () => setEditOpen(false),
    });
  };

  const handleDelete = () => {
    deleteProject(projectId, {
      onSuccess: () => router.push("/client/projects"),
    });
  };

  const handleInterest = () => {
    expressInterest({ projectId, message: interestMessage }, {
      onSuccess: () => setInterestOpen(false)
    });
  };

  if (isLoading || !project) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="h-[calc(100vh-64px)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <Navigation />

      {/* Header */}
      <div className="bg-secondary/30 border-b border-border/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">{project.category}</Badge>
            <Badge variant={statusVariant(project.status)}>{statusLabels[project.status] || project.status}</Badge>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl md:text-4xl font-display font-bold truncate" title={project.title}>{project.title}</h1>
            {isOwner && (
              <>
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" aria-label="Edit project">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Edit Project</DialogTitle>
                    <DialogDescription>Update your project details.</DialogDescription>
                  </DialogHeader>
                  <Form {...editForm}>
                    <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
                      <FormField
                        control={editForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Title</FormLabel>
                            <FormControl>
                              <Input aria-label="Project title" placeholder="e.g. E-commerce Platform Development" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                          control={editForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger aria-label="Project category">
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="web_dev">Web Development</SelectItem>
                                  <SelectItem value="mobile_app">Mobile App</SelectItem>
                                  <SelectItem value="design">UI/UX Design</SelectItem>
                                  <SelectItem value="ai_ml">AI & Machine Learning</SelectItem>
                                  <SelectItem value="devops">DevOps & Cloud</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={editForm.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger aria-label="Project status">
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {projectStatuses.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {statusLabels[status]}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={editForm.control}
                          name="budgetMin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Min Budget (₹)</FormLabel>
                              <FormControl>
                                <Input aria-label="Minimum budget" type="number" placeholder="1000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={editForm.control}
                          name="budgetMax"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Budget (₹)</FormLabel>
                              <FormControl>
                                <Input aria-label="Maximum budget" type="number" placeholder="5000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={editForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Description</FormLabel>
                            <FormControl>
                              <Textarea
                                aria-label="Project description"
                                placeholder="Describe your project requirements..."
                                className="min-h-[150px] resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={updatePending}>
                          {updatePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" aria-label="Delete project">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this project?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your project and remove all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={deletePending}>
                      {deletePending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="truncate" title={`Posted by ${project.client.firstName} ${project.client.lastName}`}>Posted by {project.client.firstName} {project.client.lastName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Posted {formatDistanceToNow(new Date(project.createdAt!), { addSuffix: true })}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground font-medium">
              <span>₹{project.budgetMin?.toLocaleString('en-IN')} - ₹{project.budgetMax?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {project.description}
              </div>
            </CardContent>
          </Card>

          {isOwner && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold font-display">Proposals ({interests?.length || 0})</h2>
              {interests?.length === 0 ? (
                <Card className="border-dashed rounded-xl">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No proposals yet. Check back later!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {interests?.map((interest) => (
                    <Card key={interest.id} className="overflow-hidden">
                      <CardContent className="p-6 space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <ProfileAvatar
                              name={`${interest.developer.firstName} ${interest.developer.lastName}`}
                              imageUrl={interest.developer.profileImageUrl}
                              size="lg"
                            />
                            <div className="min-w-0">
                              <h4 className="font-bold truncate" title={`${interest.developer.firstName} ${interest.developer.lastName}`}>{interest.developer.firstName} {interest.developer.lastName}</h4>
                              <span className="text-xs text-muted-foreground">Applied {formatDistanceToNow(new Date(interest.createdAt!), { addSuffix: true })}</span>
                            </div>
                          </div>
                          <div className="hidden sm:flex gap-2 shrink-0">
                            <Link href={`/client/messages?projectId=${projectId}&developerId=${interest.developerId}`}>
                              <Button size="sm" variant="outline" aria-label={`Message ${interest.developer.firstName}`}>
                                <MessageSquare className="mr-1 h-3.5 w-3.5" />
                                Message
                              </Button>
                            </Link>
                            <Link href={`/profile/${interest.developerId}`}>
                              <Button size="sm" variant="outline" aria-label={`View ${interest.developer.firstName}'s profile`}>View Profile</Button>
                            </Link>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg line-clamp-3" title={interest.message || ""}>
                          &quot;{interest.message}&quot;
                        </p>
                        <div className="grid grid-cols-2 gap-2 pt-1 sm:hidden">
                          <Link href={`/client/messages?projectId=${projectId}&developerId=${interest.developerId}`}>
                            <Button size="sm" variant="outline" className="w-full" aria-label={`Message ${interest.developer.firstName}`}>
                              <MessageSquare className="mr-1 h-3.5 w-3.5" />
                              Message
                            </Button>
                          </Link>
                          <Link href={`/profile/${interest.developerId}`}>
                            <Button size="sm" variant="outline" className="w-full" aria-label={`View ${interest.developer.firstName}'s profile`}>View Profile</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About the Client</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <ProfileAvatar
                  name={`${project.client.firstName} ${project.client.lastName}`}
                  imageUrl={project.client.profileImageUrl}
                  size="xl"
                  className="border-2 border-background shadow-sm"
                />
                <div className="min-w-0">
                  <div className="font-bold truncate" title={`${project.client.firstName} ${project.client.lastName}`}>{project.client.firstName} {project.client.lastName}</div>
                  <div className="text-sm text-muted-foreground">Member since 2024</div>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-status-online" />
                <span>Payment Verified</span>
              </div>
            </CardContent>
          </Card>

          {!isClient && (
            <Card>
              <CardContent className="pt-6">
                {hasExpressedInterest ? (
                  <Button className="w-full bg-status-online hover:bg-status-online/90 cursor-default" size="lg" aria-label="Already applied">
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Applied
                  </Button>
                ) : (
                  <Dialog open={interestOpen} onOpenChange={setInterestOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full shadow-lg shadow-primary/20" size="lg" aria-label="Apply for this project">Apply Now</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Apply for this project</DialogTitle>
                        <DialogDescription>
                          Introduce yourself and explain why you&apos;re a good fit.
                        </DialogDescription>
                      </DialogHeader>
                      <Textarea
                        aria-label="Application message"
                        placeholder="Hi, I'm a developer with 5 years of experience in..."
                        className="min-h-[150px]"
                        value={interestMessage}
                        onChange={(e) => setInterestMessage(e.target.value)}
                      />
                      <DialogFooter>
                        <Button onClick={handleInterest} aria-label="Submit application" disabled={interestPending || !interestMessage.trim()}>
                          {interestPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Submit Application
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
