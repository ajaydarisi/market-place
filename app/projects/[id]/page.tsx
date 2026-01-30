"use client";

import { useProject } from "@/hooks/use-projects";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profiles";
import { useProjectInterests, useExpressInterest } from "@/hooks/use-interests";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { useParams } from "next/navigation";
import { Loader2, DollarSign, Calendar, User, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function ProjectDetail() {
  const params = useParams();
  const projectId = parseInt(params.id as string || "0");
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id || "");
  const { data: project, isLoading } = useProject(projectId);
  const { data: interests } = useProjectInterests(projectId);

  const isClient = profile?.role === "client";
  const isOwner = isClient && project?.client.id === user?.id;

  const { mutate: expressInterest, isPending: interestPending } = useExpressInterest();
  const [interestMessage, setInterestMessage] = useState("");
  const [interestOpen, setInterestOpen] = useState(false);
  const hasExpressedInterest = interests?.some(i => i.developerId === user?.id);

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
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">{project.category}</Badge>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 truncate" title={project.title}>{project.title}</h1>
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
              <DollarSign className="h-4 w-4" />
              <span>${project.budgetMin?.toLocaleString()} - ${project.budgetMax?.toLocaleString()}</span>
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
                      <CardContent className="p-6 flex items-start gap-4">
                        <Avatar className="h-10 w-10" aria-label={`${interest.developer.firstName} ${interest.developer.lastName}'s avatar`}>
                          <AvatarFallback>{interest.developer.firstName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-bold truncate" title={`${interest.developer.firstName} ${interest.developer.lastName}`}>{interest.developer.firstName} {interest.developer.lastName}</h4>
                              <span className="text-xs text-muted-foreground truncate">Applied {formatDistanceToNow(new Date(interest.createdAt!), { addSuffix: true })}</span>
                            </div>
                            <Button size="sm" variant="outline" aria-label={`View ${interest.developer.firstName}'s profile`}>View Profile</Button>
                          </div>
                          <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg line-clamp-3" title={interest.message || ""}>
                            &quot;{interest.message}&quot;
                          </p>
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
                <Avatar className="h-12 w-12 border-2 border-background shadow-sm" aria-label={`${project.client.firstName} ${project.client.lastName}'s avatar`}>
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">{project.client.firstName?.[0]}</AvatarFallback>
                </Avatar>
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
