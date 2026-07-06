"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Flag,
  Layers,
  Loader2,
  MessageSquare,
  ScrollText,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  User,
  UserCheck,
  Wand2,
  XCircle,
} from "lucide-react";

import { Navigation } from "@/components/navigation";
import { ProfileAvatar } from "@/components/profile-avatar";
import { RatingPill } from "@/components/rating-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { TagInput } from "@/components/ui/tag-input";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profiles";
import { useProjectInterests, useExpressInterest, useUpdateInterestStatus, useWithdrawInterest } from "@/hooks/use-interests";
import { useCodeReview, useMatchRationale, useProposalDraft, useScopeOfWork, useStackAdvice } from "@/hooks/use-ai";
import { useProjectLogs, useCreateProjectLog } from "@/hooks/use-project-logs";
import { useProject, useDeleteProject, useRequestCompletion } from "@/hooks/use-projects";
import { useProjectReviews, useCreateProjectReview } from "@/hooks/use-reviews";
import { logTypes } from "@shared/schema";
import {
  AVAILABILITY_LABELS,
  COMMUNICATION_CADENCE_LABELS,
  ENGAGEMENT_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  PROJECT_CATEGORY_LABELS,
  PROJECT_TYPE_LABELS,
  SCOPE_SIZE_LABELS,
  TEAM_PREFERENCE_LABELS,
  TECHNOLOGY_TAG_LABELS,
} from "@shared/marketplace";

export default function ProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const projectId = parseInt((params.id as string) || "0", 10);

  const { user } = useAuth();
  const { data: currentProfile } = useProfile(user?.id || "");
  const { data: project, isLoading } = useProject(projectId);
  const { data: clientProfile } = useProfile(project?.client.id || "");

  const [proposalSort, setProposalSort] = useState<string>("best_match");
  const { data: interests } = useProjectInterests(projectId, proposalSort);
  const { data: logs } = useProjectLogs(projectId);
  const { data: reviews } = useProjectReviews(projectId);

  const { mutate: expressInterest, isPending: interestPending } = useExpressInterest();
  const { mutate: deleteProject, isPending: deletePending } = useDeleteProject();
  const { mutate: withdrawInterest, isPending: withdrawPending } = useWithdrawInterest();
  const { mutate: requestCompletion, isPending: completionPending } = useRequestCompletion();
  const { mutate: updateInterestStatus, isPending: assignPending } = useUpdateInterestStatus();
  const { mutate: createLog, isPending: logPending } = useCreateProjectLog();
  const { mutate: createReview, isPending: reviewPending } = useCreateProjectReview();

  const [interestOpen, setInterestOpen] = useState(false);
  const [interestMessage, setInterestMessage] = useState("");
  const [interestBudget, setInterestBudget] = useState("");
  const [interestDuration, setInterestDuration] = useState("");
  const [interestSkills, setInterestSkills] = useState<string[]>([]);
  const [interestScreeningAnswers, setInterestScreeningAnswers] = useState<string[]>([]);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedInterestId, setSelectedInterestId] = useState<number | null>(null);

  const [logContent, setLogContent] = useState("");
  const [logType, setLogType] = useState<typeof logTypes[number]>("update");

  const queryClient = useQueryClient();
  const proposalDraft = useProposalDraft();
  const stackAdvice = useStackAdvice();
  const scopeOfWork = useScopeOfWork();
  const codeReview = useCodeReview();
  const [reviewSubmission, setReviewSubmission] = useState("");

  const invalidateLogs = () =>
    queryClient.invalidateQueries({ queryKey: [api.projectLogs.list.path, projectId] });

  const handleProposalDraft = () => {
    proposalDraft.mutate(projectId, {
      onSuccess: (draft) => {
        setInterestMessage(draft.message);
        if (draft.proposedBudget) setInterestBudget(String(draft.proposedBudget));
        if (draft.estimatedDurationDays) setInterestDuration(String(draft.estimatedDurationDays));
        if (draft.relevantSkills.length > 0) setInterestSkills(draft.relevantSkills);
        setInterestScreeningAnswers((project?.screeningQuestions ?? []).map((question, index) =>
          draft.screeningAnswers.find((answer) => answer.question === question)?.answer
            ?? draft.screeningAnswers[index]?.answer
            ?? "",
        ));
      },
    });
  };

  const [reviewRating, setReviewRating] = useState("5");
  const [reviewComment, setReviewComment] = useState("");

  const isClient = currentProfile?.role === "client";
  const isDeveloper = currentProfile?.role === "developer";
  const isOwner = Boolean(isClient && project?.client.id === user?.id);
  const isAssignedDev = Boolean(isDeveloper && project?.assignedDeveloperId === user?.id);
  const canViewLogs = isOwner || isAssignedDev;
  const myInterest = interests?.find((interest) => interest.developerId === user?.id);
  const hasExpressedInterest = Boolean(myInterest);
  const myReview = reviews?.find((review) => review.reviewerId === user?.id);
  const canReview =
    project?.status === "completed" &&
    Boolean(project.assignedDeveloperId) &&
    (isOwner || isAssignedDev) &&
    !myReview;

  useEffect(() => {
    setInterestScreeningAnswers((project?.screeningQuestions ?? []).map(() => ""));
  }, [project?.id, project?.screeningQuestions?.join("||")]);

  const selectedInterest = useMemo(
    () => interests?.find((interest) => interest.id === selectedInterestId),
    [interests, selectedInterestId],
  );

  const statusLabels: Record<string, string> = {
    open: "Open",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case "open":
        return "default" as const;
      case "in_progress":
        return "secondary" as const;
      case "completed":
        return "default" as const;
      case "cancelled":
        return "destructive" as const;
      default:
        return "secondary" as const;
    }
  };

  const logTypeLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    update: { label: "Update", icon: <Clock className="h-3 w-3" />, color: "bg-primary/10 text-primary" },
    milestone: { label: "Milestone", icon: <Flag className="h-3 w-3" />, color: "bg-status-online/15 text-status-online" },
    blocker: { label: "Blocker", icon: <AlertTriangle className="h-3 w-3" />, color: "bg-destructive/10 text-destructive" },
    completed: { label: "Completed", icon: <CheckCircle2 className="h-3 w-3" />, color: "bg-accent/10 text-accent" },
  };

  const handleDelete = () => {
    deleteProject(projectId, {
      onSuccess: () => router.push("/client/projects"),
    });
  };

  const handleInterest = () => {
    expressInterest(
      {
        projectId,
        message: interestMessage,
        proposedBudget: interestBudget ? Number(interestBudget) : undefined,
        estimatedDurationDays: interestDuration ? Number(interestDuration) : undefined,
        relevantSkills: interestSkills,
        screeningAnswers: (project?.screeningQuestions ?? [])
          .map((question, index) => ({
            question,
            answer: interestScreeningAnswers[index]?.trim() ?? "",
          }))
          .filter((answer) => answer.answer),
      },
      {
        onSuccess: () => {
          setInterestMessage("");
          setInterestBudget("");
          setInterestDuration("");
          setInterestSkills([]);
          setInterestScreeningAnswers((project?.screeningQuestions ?? []).map(() => ""));
          setInterestOpen(false);
        },
      },
    );
  };

  const handleAssign = (interestId: number) => {
    setSelectedInterestId(interestId);
    setAssignDialogOpen(true);
  };

  const confirmAssign = () => {
    if (!selectedInterest) return;

    updateInterestStatus(
      { projectId, interestId: selectedInterest.id!, status: "accepted" },
      {
        onSuccess: () => {
          setAssignDialogOpen(false);
          router.push(`/client/messages?projectId=${projectId}&developerId=${selectedInterest.developerId}`);
        },
      },
    );
  };

  const handleCreateLog = () => {
    if (!logContent.trim()) return;

    createLog(
      { projectId, content: logContent, logType },
      {
        onSuccess: () => {
          setLogContent("");
          setLogType("update");
        },
      },
    );
  };

  const handleCreateReview = () => {
    createReview(
      {
        projectId,
        rating: Number(reviewRating),
        comment: reviewComment.trim() || undefined,
      },
      {
        onSuccess: () => {
          setReviewComment("");
          setReviewRating("5");
        },
      },
    );
  };

  if (isLoading || !project) {
    return (
      <div className="page-shell min-h-screen bg-background">
        <Navigation />
        <div className="flex h-[calc(100vh-80px)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell min-h-screen bg-background pb-12">
      <Navigation />

      <div className="section-band-strong border-b border-border/55 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge className="border-primary/20 bg-primary/[0.08] text-primary" data-testid="project-detail-category">
              {PROJECT_CATEGORY_LABELS[project.category] || project.category}
            </Badge>
            <Badge variant={statusVariant(project.status)} data-testid="project-detail-status">
              {statusLabels[project.status] || project.status}
            </Badge>
            {project.engagementType ? (
              <Badge variant="outline">{ENGAGEMENT_TYPE_LABELS[project.engagementType]}</Badge>
            ) : null}
            {project.projectType ? (
              <Badge variant="outline">{PROJECT_TYPE_LABELS[project.projectType]}</Badge>
            ) : null}
            {project.scopeSize ? (
              <Badge variant="outline">{SCOPE_SIZE_LABELS[project.scopeSize]}</Badge>
            ) : null}
            {project.preferredExperienceLevel ? (
              <Badge variant="outline">{EXPERIENCE_LEVEL_LABELS[project.preferredExperienceLevel]}</Badge>
            ) : null}
          </div>

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-4xl">
              <h1 className="text-2xl font-display font-bold line-clamp-3 sm:text-3xl md:text-4xl" data-testid="project-detail-title">
                {project.title}
              </h1>
              <div className="mt-4 flex flex-wrap gap-2">
                {[...new Set([...(project.technologyTags ?? []), ...(project.requiredSkills ?? [])])].slice(0, 8).map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {TECHNOLOGY_TAG_LABELS[skill] || skill}
                  </Badge>
                ))}
              </div>
            </div>

            {isOwner ? (
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline" className="surface-glass" aria-label="Edit project">
                  <Link href={`/projects/${projectId}/edit`}>
                    Edit Brief
                  </Link>
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" aria-label="Delete project">
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this project?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This hides the project and removes it from active marketplace discovery.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} disabled={deletePending}>
                        {deletePending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Delete Project
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-6">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>
                Posted by {project.client.firstName} {project.client.lastName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Posted {formatDistanceToNow(new Date(project.createdAt!), { addSuffix: true })}</span>
            </div>
            <div className="font-medium text-foreground">
              ₹{project.budgetMin?.toLocaleString("en-IN")} - ₹{project.budgetMax?.toLocaleString("en-IN")}
            </div>
            {project.estimatedDurationWeeks ? (
              <div>Duration: {project.estimatedDurationWeeks} weeks</div>
            ) : null}
            <div>
              Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : "Flexible"}
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto grid gap-6 px-4 py-6 lg:grid-cols-3 lg:gap-8 lg:py-8">
        <div className="space-y-6 lg:col-span-2">
          <Card className="surface-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Project Brief
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="surface-subtle rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Project Type</p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {project.projectType ? PROJECT_TYPE_LABELS[project.projectType] : "Not specified"}
                  </p>
                </div>
                <div className="surface-subtle rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Scope Size</p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {project.scopeSize ? SCOPE_SIZE_LABELS[project.scopeSize] : "Not specified"}
                  </p>
                </div>
                <div className="surface-subtle rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Engagement</p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {project.engagementType ? ENGAGEMENT_TYPE_LABELS[project.engagementType] : "Not specified"}
                  </p>
                </div>
                <div className="surface-subtle rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Preferred Experience</p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {project.preferredExperienceLevel
                      ? EXPERIENCE_LEVEL_LABELS[project.preferredExperienceLevel]
                      : "Open to all levels"}
                  </p>
                </div>
                <div className="surface-subtle rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Team Preference</p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {project.teamPreference ? TEAM_PREFERENCE_LABELS[project.teamPreference] : "Flexible"}
                  </p>
                </div>
                <div className="surface-subtle rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Communication</p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {project.communicationCadence ? COMMUNICATION_CADENCE_LABELS[project.communicationCadence] : "Flexible"}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Business Goal</p>
                <p className="rounded-2xl border border-border/60 bg-background/35 p-4 text-sm text-foreground">
                  {project.businessGoal || "No goal added yet."}
                </p>
              </div>

              <Separator />

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Technology Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {project.technologyTags && project.technologyTags.length > 0 ? (
                      project.technologyTags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {TECHNOLOGY_TAG_LABELS[tag] || tag}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No technology tags listed yet.</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {project.requiredSkills && project.requiredSkills.length > 0 ? (
                      project.requiredSkills.map((skill) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No required skills listed yet.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current State</p>
                  <p className="rounded-2xl border border-border/60 bg-background/35 p-4 text-sm text-muted-foreground">
                    {project.currentState || "No current-state notes shared."}
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target Users</p>
                  <p className="rounded-2xl border border-border/60 bg-background/35 p-4 text-sm text-muted-foreground">
                    {project.targetUsers || "No target-user notes shared."}
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deliverables</p>
                  <div className="space-y-2">
                    {(project.deliverables ?? []).length > 0 ? (
                      project.deliverables?.map((item) => (
                        <div key={item} className="rounded-2xl border border-border/60 bg-background/35 px-4 py-3 text-sm text-muted-foreground">
                          {item}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No deliverables listed.</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Must-haves</p>
                  <div className="flex flex-wrap gap-2">
                    {(project.mustHaves ?? []).length > 0 ? (
                      project.mustHaves?.map((item) => (
                        <Badge key={item} variant="secondary">{item}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No must-haves listed.</p>
                    )}
                  </div>
                  <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nice-to-haves</p>
                  <div className="flex flex-wrap gap-2">
                    {(project.niceToHaves ?? []).length > 0 ? (
                      project.niceToHaves?.map((item) => (
                        <Badge key={item} variant="outline">{item}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No nice-to-haves listed.</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Success Criteria</p>
                  <div className="space-y-2">
                    {(project.successCriteria ?? []).length > 0 ? (
                      project.successCriteria?.map((item) => (
                        <div key={item} className="rounded-2xl border border-border/60 bg-background/35 px-4 py-3 text-sm text-muted-foreground">
                          {item}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No success criteria listed.</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="prose max-w-none whitespace-pre-wrap text-muted-foreground">
                {project.description}
              </div>

              {(project.referenceLinks ?? []).length > 0 ? (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reference Links</p>
                  <div className="flex flex-col gap-2">
                    {project.referenceLinks?.map((link) => (
                      <a
                        key={`${link.label}-${link.url}`}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-2xl border border-border/60 px-4 py-3 text-sm text-primary transition-colors hover:border-primary/40"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              {(project.screeningQuestions ?? []).length > 0 ? (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Screening Questions</p>
                  <div className="space-y-2">
                    {project.screeningQuestions?.map((question) => (
                      <div key={question} className="rounded-2xl border border-border/60 bg-background/35 px-4 py-3 text-sm text-muted-foreground">
                        {question}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {isOwner ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold font-display">
                  Proposal Workspace ({interests?.length || 0})
                </h2>
                <Select value={proposalSort} onValueChange={setProposalSort}>
                  <SelectTrigger className="w-full sm:w-[220px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="best_match">Best Match</SelectItem>
                    <SelectItem value="lowest_budget">Lowest Budget</SelectItem>
                    <SelectItem value="fastest_delivery">Fastest Delivery</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {interests?.length === 0 ? (
                <Card className="surface-glass border-dashed">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No proposals yet. The structured brief is live and ready for the right developers.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {interests?.map((interest) => (
                    <Card
                      key={interest.id}
                      className={`surface-glass overflow-hidden ${interest.status === "accepted" ? "border-primary/40" : ""}`}
                    >
                      <CardContent className="space-y-4 p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex min-w-0 items-start gap-3">
                            <ProfileAvatar
                              name={`${interest.developer.firstName} ${interest.developer.lastName}`}
                              imageUrl={interest.developer.profileImageUrl}
                              size="lg"
                            />
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-bold">
                                  {interest.developer.firstName} {interest.developer.lastName}
                                </h4>
                                <Badge variant={statusVariant(interest.status)}>{interest.status}</Badge>
                                {interest.matchScore ? (
                                  <Badge className="bg-primary/10 text-primary">{interest.matchScore}% match</Badge>
                                ) : null}
                              </div>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  Applied {formatDistanceToNow(new Date(interest.createdAt!), { addSuffix: true })}
                                </span>
                                <RatingPill
                                  averageRating={interest.developer.averageRating}
                                  reviewCount={interest.developer.reviewCount}
                                  emptyLabel="No reviews yet"
                                />
                              </div>
                              <ProposalMatchRationale projectId={projectId} interestId={interest.id!} />
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {project.status === "open" && interest.status === "pending" ? (
                              <Button size="sm" onClick={() => handleAssign(interest.id!)}>
                                <UserCheck className="mr-1 h-3.5 w-3.5" />
                                Assign
                              </Button>
                            ) : null}
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/client/messages?projectId=${projectId}&developerId=${interest.developerId}`}>
                                <MessageSquare className="mr-1 h-3.5 w-3.5" />
                                Message
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/profile/${interest.developerId}`}>View Profile</Link>
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="surface-subtle rounded-2xl p-3 text-sm">
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Budget</p>
                            <p className="mt-2 font-medium text-foreground">
                              {interest.proposedBudget
                                ? `₹${interest.proposedBudget.toLocaleString("en-IN")}`
                                : "Not specified"}
                            </p>
                          </div>
                          <div className="surface-subtle rounded-2xl p-3 text-sm">
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Delivery</p>
                            <p className="mt-2 font-medium text-foreground">
                              {interest.estimatedDurationDays
                                ? `${interest.estimatedDurationDays} days`
                                : "Flexible"}
                            </p>
                          </div>
                          <div className="surface-subtle rounded-2xl p-3 text-sm">
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Relevant Skills</p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {interest.relevantSkills && interest.relevantSkills.length > 0 ? (
                                interest.relevantSkills.map((skill) => (
                                  <Badge key={skill} variant="secondary">
                                    {skill}
                                  </Badge>
                                ))
                              ) : (
                                <p className="text-muted-foreground">No extra skills listed</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-border/60 bg-background/35 p-4 text-sm text-muted-foreground">
                          {interest.message}
                        </div>

                        {interest.screeningAnswers && interest.screeningAnswers.length > 0 ? (
                          <div className="space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                              Screening Answers
                            </p>
                            <div className="space-y-3">
                              {interest.screeningAnswers.map((answer) => (
                                <div key={`${answer.question}-${answer.answer}`} className="rounded-2xl border border-border/60 bg-background/35 p-4">
                                  <p className="text-sm font-medium text-foreground">{answer.question}</p>
                                  <p className="mt-2 text-sm text-muted-foreground">{answer.answer}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          <AlertDialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Assign this developer?</AlertDialogTitle>
                <AlertDialogDescription>
                  This moves the project into active delivery, rejects other pending proposals, and sends you straight into the conversation thread.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmAssign} disabled={assignPending}>
                  {assignPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Confirm Assignment
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {canViewLogs ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold font-display">Project Activity</h2>

              <Card className="surface-glass">
                <CardContent className="space-y-3 p-4">
                  <Textarea
                    placeholder="Add a project update..."
                    className="min-h-[80px] resize-none"
                    value={logContent}
                    onChange={(event) => setLogContent(event.target.value)}
                  />
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Select value={logType} onValueChange={(value: typeof logTypes[number]) => setLogType(value)}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {logTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {logTypeLabels[type]?.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleCreateLog} disabled={logPending || !logContent.trim()}>
                      {logPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                      Post Update
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {logs && logs.length > 0 ? (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <Card key={log.id} className="surface-glass">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <ProfileAvatar
                            name={`${log.author.firstName} ${log.author.lastName}`}
                            imageUrl={log.author.profileImageUrl}
                            size="sm"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <span className="text-sm font-medium">
                                {log.isSystem ? "System" : `${log.author.firstName} ${log.author.lastName}`}
                              </span>
                              <Badge className={`text-xs ${logTypeLabels[log.logType]?.color || ""}`}>
                                {logTypeLabels[log.logType]?.label}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(log.createdAt!), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{log.content}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="surface-glass border-dashed">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No activity yet. Post the first delivery update.
                  </CardContent>
                </Card>
              )}
            </div>
          ) : null}

          {project.status === "completed" ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold font-display">Reviews</h2>

              {canReview ? (
                <Card className="surface-glass">
                  <CardHeader>
                    <CardTitle>Leave a Project Review</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Rating</p>
                        <Select value={reviewRating} onValueChange={setReviewRating}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[5, 4, 3, 2, 1].map((rating) => (
                              <SelectItem key={rating} value={String(rating)}>
                                {rating} stars
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Comment</p>
                        <Textarea
                          value={reviewComment}
                          onChange={(event) => setReviewComment(event.target.value)}
                          placeholder="What went well? What should future collaborators know?"
                          className="min-h-[110px] resize-none"
                        />
                      </div>
                    </div>

                    <Button onClick={handleCreateReview} disabled={reviewPending}>
                      {reviewPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Star className="mr-2 h-4 w-4" />}
                      Submit Review
                    </Button>
                  </CardContent>
                </Card>
              ) : null}

              {reviews && reviews.length > 0 ? (
                <div className="grid gap-4">
                  {reviews.map((review) => (
                    <Card key={review.id} className="surface-glass">
                      <CardContent className="space-y-3 p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <ProfileAvatar
                              name={`${review.reviewer.firstName} ${review.reviewer.lastName}`}
                              imageUrl={review.reviewer.profileImageUrl}
                              size="sm"
                            />
                            <div>
                              <p className="font-medium">
                                {review.reviewer.firstName} {review.reviewer.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(review.createdAt!), { addSuffix: true })}
                              </p>
                            </div>
                          </div>

                          <div className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-medium text-amber-700">
                            <Star className="h-4 w-4 fill-current" />
                            {review.rating.toFixed(1)}
                          </div>
                        </div>

                        {review.comment ? (
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground">No written comment provided.</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="surface-glass border-dashed">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No reviews yet for this project.
                  </CardContent>
                </Card>
              )}
            </div>
          ) : null}
        </div>

        <div className="space-y-4 md:space-y-6">
          <Card className="surface-glass">
            <CardHeader>
              <CardTitle className="text-lg">About the Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <ProfileAvatar
                  name={`${project.client.firstName} ${project.client.lastName}`}
                  imageUrl={project.client.profileImageUrl}
                  size="xl"
                  className="border-2 border-background shadow-sm"
                />
                <div className="min-w-0">
                  <div className="font-bold">
                    {project.client.firstName} {project.client.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Member since {project.client.createdAt ? new Date(project.client.createdAt).getFullYear() : new Date().getFullYear()}
                  </div>
                  <div className="mt-2">
                    <RatingPill
                      averageRating={project.client.averageRating}
                      reviewCount={project.client.reviewCount}
                      emptyLabel="No client reviews yet"
                    />
                  </div>
                </div>
              </div>

              {clientProfile?.headline ? (
                <div className="rounded-2xl border border-border/60 bg-background/35 p-4 text-sm text-foreground">
                  {clientProfile.headline}
                </div>
              ) : null}

              <div className="space-y-2 text-sm text-muted-foreground">
                {clientProfile?.companyName ? (
                  <p>
                    <span className="font-medium text-foreground">Company:</span> {clientProfile.companyName}
                  </p>
                ) : null}
                {clientProfile?.industry ? (
                  <p>
                    <span className="font-medium text-foreground">Industry:</span> {clientProfile.industry}
                  </p>
                ) : null}
                {clientProfile?.bio ? <p>{clientProfile.bio}</p> : null}
                {clientProfile?.primaryCategories && clientProfile.primaryCategories.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {clientProfile.primaryCategories.map((category) => (
                      <Badge key={category} variant="secondary">
                        {PROJECT_CATEGORY_LABELS[category] || category}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {isDeveloper ? (
            <Card className="surface-glass">
              <CardContent className="pt-6">
                {hasExpressedInterest ? (
                  <div className="space-y-3">
                    {myInterest?.status === "rejected" ? (
                      <Button variant="secondary" className="w-full cursor-default" size="lg" disabled>
                        <XCircle className="mr-2 h-5 w-5" />
                        Not Selected
                      </Button>
                    ) : (
                      <Button className="w-full cursor-default border-status-online bg-status-online text-white hover:bg-status-online/90" size="lg">
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        {myInterest?.status === "accepted" ? "Proposal Accepted" : "Proposal Submitted"}
                      </Button>
                    )}
                    {myInterest?.status === "pending" ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        aria-label="Withdraw proposal"
                        disabled={withdrawPending}
                        onClick={() =>
                          withdrawInterest({ projectId, interestId: myInterest.id as number })
                        }
                        data-testid="withdraw-proposal-button"
                      >
                        {withdrawPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Withdraw Proposal
                      </Button>
                    ) : null}
                    {isAssignedDev && project?.status === "in_progress" ? (
                      <Button
                        className="w-full"
                        aria-label="Request completion"
                        disabled={completionPending}
                        onClick={() => requestCompletion(projectId)}
                        data-testid="request-completion-button"
                      >
                        {completionPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Request Completion
                      </Button>
                    ) : null}
                    {isAssignedDev ? (
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/developer/messages">
                          Open Project Messages
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  <Dialog open={interestOpen} onOpenChange={setInterestOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full shadow-lg shadow-primary/20" size="lg">
                        Apply Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[620px]">
                      <DialogHeader>
                        <DialogTitle>Submit a Proposal</DialogTitle>
                        <DialogDescription>
                          Share your fit, budget, timing, and the skills that make you a strong match.
                        </DialogDescription>
                      </DialogHeader>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-primary/30 text-primary"
                        onClick={handleProposalDraft}
                        disabled={proposalDraft.isPending}
                        data-testid="proposal-draft-button"
                      >
                        {proposalDraft.isPending
                          ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          : <Wand2 className="mr-2 h-4 w-4" />}
                        Write my proposal
                      </Button>
                      {proposalDraft.isError ? (
                        <p className="text-sm text-muted-foreground">
                          {proposalDraft.error instanceof Error ? proposalDraft.error.message : "Draft failed."}
                        </p>
                      ) : null}
                      {proposalDraft.data ? (
                        <p className="text-xs text-muted-foreground">
                          AI drafted this proposal from your profile — review and edit before submitting.
                        </p>
                      ) : null}

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <FormLabel>Proposed Budget (₹)</FormLabel>
                          <Input
                            type="number"
                            value={interestBudget}
                            onChange={(event) => setInterestBudget(event.target.value)}
                            placeholder="75000"
                          />
                        </div>
                        <div className="space-y-2">
                          <FormLabel>Estimated Duration (days)</FormLabel>
                          <Input
                            type="number"
                            value={interestDuration}
                            onChange={(event) => setInterestDuration(event.target.value)}
                            placeholder="21"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <FormLabel>Relevant Skills</FormLabel>
                        <TagInput
                          value={interestSkills}
                          onChange={setInterestSkills}
                          placeholder="Add the skills that are most relevant to this brief..."
                        />
                      </div>

                      {(project.screeningQuestions ?? []).length > 0 ? (
                        <div className="space-y-3">
                          <FormLabel>Screening Questions</FormLabel>
                          {(project.screeningQuestions ?? []).map((question, index) => (
                            <div key={question} className="space-y-2">
                              <p className="text-sm font-medium text-foreground">{question}</p>
                              <Textarea
                                value={interestScreeningAnswers[index] ?? ""}
                                onChange={(event) =>
                                  setInterestScreeningAnswers((current) => {
                                    const next = [...current];
                                    next[index] = event.target.value;
                                    return next;
                                  })
                                }
                                className="min-h-[100px] resize-none"
                                placeholder="Add a concise answer..."
                              />
                            </div>
                          ))}
                        </div>
                      ) : null}

                      <div className="space-y-2">
                        <FormLabel>Proposal Message</FormLabel>
                        <Textarea
                          value={interestMessage}
                          onChange={(event) => setInterestMessage(event.target.value)}
                          className="min-h-[150px] resize-none"
                          placeholder="Explain why you're a strong fit, how you'd approach the work, and any delivery assumptions."
                        />
                      </div>

                      <DialogFooter>
                        <Button
                          onClick={handleInterest}
                          disabled={interestPending || !interestMessage.trim()}
                        >
                          {interestPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Submit Proposal
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          ) : null}

          {isDeveloper ? (
            <Card className="surface-glass" data-testid="ai-tools-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => stackAdvice.mutate(projectId)}
                    disabled={stackAdvice.isPending}
                    data-testid="stack-advice-button"
                  >
                    {stackAdvice.isPending
                      ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      : <Layers className="mr-2 h-4 w-4" />}
                    Suggest a stack
                  </Button>
                  {stackAdvice.isError ? (
                    <p className="text-sm text-muted-foreground">
                      {stackAdvice.error instanceof Error ? stackAdvice.error.message : "Advice failed."}
                    </p>
                  ) : null}
                  {stackAdvice.data ? (
                    <div className="space-y-3 text-sm">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Recommended</p>
                        {stackAdvice.data.primary.map((item) => (
                          <div key={`${item.component}-${item.choice}`} className="rounded-2xl border border-border/60 bg-background/35 px-3 py-2">
                            <p className="font-medium text-foreground">{item.component}: {item.choice}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{item.reason}</p>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Budget alternative</p>
                        {stackAdvice.data.budgetAlternative.map((item) => (
                          <div key={`${item.component}-${item.choice}`} className="rounded-2xl border border-border/60 bg-background/35 px-3 py-2">
                            <p className="font-medium text-foreground">{item.component}: {item.choice}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{item.reason}</p>
                          </div>
                        ))}
                      </div>
                      {stackAdvice.data.notes ? (
                        <p className="text-xs text-muted-foreground">{stackAdvice.data.notes}</p>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {isAssignedDev ? (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => scopeOfWork.mutate(projectId, { onSuccess: invalidateLogs })}
                        disabled={scopeOfWork.isPending}
                        data-testid="scope-of-work-button"
                      >
                        {scopeOfWork.isPending
                          ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          : <ScrollText className="mr-2 h-4 w-4" />}
                        Draft scope of work
                      </Button>
                      {scopeOfWork.isError ? (
                        <p className="text-sm text-muted-foreground">
                          {scopeOfWork.error instanceof Error ? scopeOfWork.error.message : "Scope draft failed."}
                        </p>
                      ) : null}
                      {scopeOfWork.data ? (
                        <p className="text-sm text-muted-foreground">
                          Scope of work drafted from the message thread and saved to Project Activity for the client to confirm.
                        </p>
                      ) : null}
                    </div>

                    <Separator />
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Pre-delivery review</p>
                      <Textarea
                        value={reviewSubmission}
                        onChange={(event) => setReviewSubmission(event.target.value)}
                        className="min-h-[100px] resize-none"
                        placeholder="Paste a repo link, diff, or a summary of the finished work..."
                        data-testid="review-submission-input"
                      />
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => codeReview.mutate({ projectId, submission: reviewSubmission }, { onSuccess: invalidateLogs })}
                        disabled={codeReview.isPending || reviewSubmission.trim().length < 20}
                        data-testid="code-review-button"
                      >
                        {codeReview.isPending
                          ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          : <ShieldCheck className="mr-2 h-4 w-4" />}
                        Run AI review
                      </Button>
                      {codeReview.isError ? (
                        <p className="text-sm text-muted-foreground">
                          {codeReview.error instanceof Error ? codeReview.error.message : "Review failed."}
                        </p>
                      ) : null}
                      {codeReview.data ? (
                        <div className="space-y-2 text-sm">
                          <p className="text-muted-foreground">{codeReview.data.summary}</p>
                          {codeReview.data.findings.map((finding, index) => (
                            <div key={index} className="rounded-2xl border border-border/60 bg-background/35 px-3 py-2">
                              <div className="flex items-center gap-2">
                                <Badge variant={finding.severity === "high" ? "destructive" : "secondary"}>
                                  {finding.severity}
                                </Badge>
                                <Badge variant="outline">{finding.category}</Badge>
                              </div>
                              <p className="mt-1.5 text-xs text-muted-foreground">{finding.detail}</p>
                            </div>
                          ))}
                          {codeReview.data.findings.length === 0 ? (
                            <p className="text-muted-foreground">No issues flagged — looks ready to deliver.</p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function ProposalMatchRationale({ projectId, interestId }: { projectId: number; interestId: number }) {
  const rationale = useMatchRationale();

  if (rationale.data) {
    return (
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        <Sparkles className="mr-1 inline h-3 w-3 text-primary" />
        {rationale.data.rationale}
      </p>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="mt-1 h-auto px-2 py-1 text-xs text-primary hover:text-primary"
      disabled={rationale.isPending}
      onClick={() => rationale.mutate({ projectId, interestId })}
      data-testid={`proposal-rationale-${interestId}`}
    >
      {rationale.isPending
        ? <Loader2 className="h-3 w-3 animate-spin" />
        : <Sparkles className="h-3 w-3" />}
      <span className="ml-1">Why this match?</span>
    </Button>
  );
}
