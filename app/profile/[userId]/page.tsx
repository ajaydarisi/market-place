"use client";

import { ProfileAvatar } from "@/components/profile-avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Navigation } from "@/components/navigation";
import { useProfile } from "@/hooks/use-profiles";
import { useUser } from "@/hooks/use-users";
import { experienceLevels, availabilityStatuses } from "@shared/schema";
import { ArrowLeft, Globe, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const experienceLevelLabels: Record<string, string> = {
  junior: "Junior",
  mid: "Mid-Level",
  senior: "Senior",
  lead: "Lead / Principal",
};

const availabilityLabels: Record<string, string> = {
  available: "Available",
  busy: "Busy",
  open_to_offers: "Open to Offers",
};

export default function PublicProfile() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const { data: profile, isLoading: profileLoading } = useProfile(userId);
  const { data: userData, isLoading: userLoading } = useUser(userId);

  const isLoading = profileLoading || userLoading;
  const initials = `${userData?.firstName?.[0] || ""}${userData?.lastName?.[0] || ""}`;
  const fullName = [userData?.firstName, userData?.lastName].filter(Boolean).join(" ") || "User";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="mx-auto px-4 py-4">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-3 transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </button>

        {isLoading ? (
          <Card className="shadow-xl border-primary/10 w-full md:w-[50%] md:min-w-[600px] max-w-[800px] mx-auto">
            <CardHeader className="border-b bg-secondary/20 py-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-5 pb-4 space-y-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ) : !profile || !userData ? (
          <Card className="shadow-xl border-primary/10 w-full md:w-[50%] md:min-w-[600px] max-w-[800px] mx-auto">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Profile not found.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-xl border-primary/10 w-full md:w-[50%] md:min-w-[600px] max-w-[800px] mx-auto">
            <CardHeader className="border-b bg-secondary/20 py-4">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <ProfileAvatar
                  name={fullName}
                  imageUrl={userData.profileImageUrl}
                  size="xl"
                  className="border-2 border-primary/20"
                />
                <div className="min-w-0">
                  <CardTitle className="text-lg sm:text-xl font-display truncate">{fullName}</CardTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground capitalize mt-1">{profile.role}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-5 pb-4">
              <div className="space-y-5">
                {/* About */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">About</h3>
                  <p className="text-sm" title={profile.bio || undefined}>
                    {profile.bio || <span className="text-muted-foreground">No bio added yet.</span>}
                  </p>
                </div>

                {profile.role === "developer" && (
                  <>
                    <Separator />

                    {/* Skills */}
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Skills</h3>
                      {profile.skills && profile.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {profile.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="px-2.5 py-0.5 text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No skills added yet.</p>
                      )}
                    </div>

                    <Separator />

                    {/* Portfolio Links */}
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Portfolio Links</h3>
                      {profile.portfolioLinks?.github || profile.portfolioLinks?.linkedin || profile.portfolioLinks?.website ? (
                        <div className="space-y-2">
                          {profile.portfolioLinks.github && (
                            <a
                              href={profile.portfolioLinks.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-primary hover:underline truncate"
                              title={profile.portfolioLinks.github}
                            >
                              <GitHubIcon className="h-4 w-4 shrink-0" />
                              <span className="truncate">{profile.portfolioLinks.github}</span>
                              <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                            </a>
                          )}
                          {profile.portfolioLinks.linkedin && (
                            <a
                              href={profile.portfolioLinks.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-primary hover:underline truncate"
                              title={profile.portfolioLinks.linkedin}
                            >
                              <LinkedInIcon className="h-4 w-4 shrink-0" />
                              <span className="truncate">{profile.portfolioLinks.linkedin}</span>
                              <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                            </a>
                          )}
                          {profile.portfolioLinks.website && (
                            <a
                              href={profile.portfolioLinks.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-primary hover:underline truncate"
                              title={profile.portfolioLinks.website}
                            >
                              <Globe className="h-4 w-4 shrink-0" />
                              <span className="truncate">{profile.portfolioLinks.website}</span>
                              <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No links added yet.</p>
                      )}
                    </div>

                    <Separator />

                    {/* Professional Details */}
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Professional Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Experience Level</p>
                          {profile.experienceLevel ? (
                            <Badge variant="outline" className="text-sm">
                              {experienceLevelLabels[profile.experienceLevel] || profile.experienceLevel}
                            </Badge>
                          ) : (
                            <p className="text-sm text-muted-foreground">Not set</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Availability</p>
                          <Badge
                            variant={
                              profile.availabilityStatus === "available"
                                ? "default"
                                : profile.availabilityStatus === "busy"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className="text-sm"
                          >
                            {availabilityLabels[profile.availabilityStatus || "available"]}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
