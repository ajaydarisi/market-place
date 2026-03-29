"use client";

import { ActionListItem } from "@/components/action-list-item";
import { BackLinkButton } from "@/components/back-link-button";
import { ProfileAvatar } from "@/components/profile-avatar";
import { AvatarUpload } from "@/components/avatar-upload";
import { CategoryMultiSelect } from "@/components/category-multi-select";
import { RatingPill } from "@/components/rating-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { TagInput } from "@/components/ui/tag-input";
import { Textarea } from "@/components/ui/textarea";
import { Navigation } from "@/components/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useProfile, useUpdateProfile } from "@/hooks/use-profiles";
import { useUser, useUpdateUser } from "@/hooks/use-users";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProfileSchema, insertUserSchema, experienceLevels, availabilityStatuses, companySizes } from "@shared/schema";
import {
  AVAILABILITY_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  PROJECT_CATEGORY_LABELS,
  calculateProfileCompletionScore,
} from "@shared/marketplace";
import { Loader2, Edit2, Globe, ExternalLink } from "lucide-react";

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
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
    </svg>
  );
}

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const userFormSchema = insertUserSchema.pick({
  firstName: true,
  lastName: true,
});

const profileFormSchema = insertProfileSchema.pick({
  role: true,
  headline: true,
  bio: true,
  skills: true,
  primaryCategories: true,
  portfolioLinks: true,
  experienceLevel: true,
  availabilityStatus: true,
  companyName: true,
  industry: true,
  companySize: true,
});

const combinedFormSchema = userFormSchema.merge(profileFormSchema);

type CombinedFormValues = z.infer<typeof combinedFormSchema>;

const companySizeLabels: Record<string, string> = {
  solo: "Solo / Freelancer",
  small: "Small (2–10)",
  medium: "Medium (11–50)",
  enterprise: "Enterprise (50+)",
};

export default function Profile() {
  const { user: authUser } = useAuth();
  const { data: userData, isLoading: isLoadingUser } = useUser(authUser?.id ?? "");
  const { data: profile, isLoading: isLoadingProfile } = useProfile(authUser?.id ?? "");
  const { mutate: updateUser, isPending: isUpdatingUser } = useUpdateUser();
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<CombinedFormValues>({
    resolver: zodResolver(combinedFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      role: "client",
      headline: "",
      bio: "",
      skills: [],
      primaryCategories: [],
      portfolioLinks: { github: "", linkedin: "", website: "" },
      experienceLevel: undefined,
      availabilityStatus: "available",
      companyName: "",
      industry: "",
      companySize: undefined,
    },
  });

  useEffect(() => {
    if (userData || profile) {
      form.reset({
        firstName: userData?.firstName || "",
        lastName: userData?.lastName || "",
        role: profile?.role || "client",
        headline: profile?.headline || "",
        bio: profile?.bio || "",
        skills: profile?.skills || [],
        primaryCategories: profile?.primaryCategories || [],
        portfolioLinks: {
          github: profile?.portfolioLinks?.github || "",
          linkedin: profile?.portfolioLinks?.linkedin || "",
          website: profile?.portfolioLinks?.website || "",
        },
        experienceLevel: profile?.experienceLevel,
        availabilityStatus: profile?.availabilityStatus || "available",
        companyName: profile?.companyName || "",
        industry: profile?.industry || "",
        companySize: profile?.companySize,
      });
    }
  }, [userData, profile, form]);

  const onSubmit = (data: CombinedFormValues) => {
    const userUpdates = {
      firstName: data.firstName || undefined,
      lastName: data.lastName || undefined,
    };

    const profileUpdates = {
      role: data.role,
      headline: data.headline || undefined,
      bio: data.bio || undefined,
      skills: data.skills || undefined,
      primaryCategories: data.primaryCategories || undefined,
      portfolioLinks: data.portfolioLinks ? {
        github: data.portfolioLinks.github || null,
        linkedin: data.portfolioLinks.linkedin || null,
        website: data.portfolioLinks.website || null,
      } : undefined,
      experienceLevel: data.experienceLevel || undefined,
      availabilityStatus: data.availabilityStatus || undefined,
      companyName: data.companyName || undefined,
      industry: data.industry || undefined,
      companySize: data.companySize || undefined,
    };

    updateUser(userUpdates, {
      onSuccess: () => {
        updateProfile(profileUpdates, {
          onSuccess: () => {
            setIsEditing(false);
            toast({
              title: "Profile updated",
              description: "Your changes have been saved successfully.",
            });
          },
          onError: (error) => {
            toast({
              title: "Error updating profile",
              description: error.message || "Failed to update profile",
              variant: "destructive",
            });
          },
        });
      },
      onError: (error) => {
        toast({
          title: "Error updating user data",
          description: error.message || "Failed to update user data",
          variant: "destructive",
        });
      },
    });
  };

  const isLoading = isLoadingUser || isLoadingProfile;
  const isPending = isUpdatingUser || isUpdatingProfile;

  const backHref = profile?.role === "client" ? "/client/projects" : "/developer/browse";
  const profileCompletionScore = profile?.profileCompletionScore ?? calculateProfileCompletionScore(profile);

  const handleCancel = () => {
    form.reset({
      firstName: userData?.firstName || "",
      lastName: userData?.lastName || "",
      role: profile?.role || "client",
      headline: profile?.headline || "",
      bio: profile?.bio || "",
      skills: profile?.skills || [],
      primaryCategories: profile?.primaryCategories || [],
      portfolioLinks: {
        github: profile?.portfolioLinks?.github || "",
        linkedin: profile?.portfolioLinks?.linkedin || "",
        website: profile?.portfolioLinks?.website || "",
      },
      experienceLevel: profile?.experienceLevel,
      availabilityStatus: profile?.availabilityStatus || "available",
      companyName: profile?.companyName || "",
      industry: profile?.industry || "",
      companySize: profile?.companySize,
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="page-shell min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const initials = `${userData?.firstName?.[0] || ""}${userData?.lastName?.[0] || ""}`;
  const fullName = [userData?.firstName, userData?.lastName].filter(Boolean).join(" ") || "User";

  return (
    <div className="page-shell min-h-screen bg-background">
      <Navigation />
      <div className="mx-auto max-w-5xl px-4 py-4 md:py-6">
        <BackLinkButton href={backHref} aria-label="Go back" className="mb-4">
          Back
        </BackLinkButton>

        <Card className="surface-glass mx-auto w-full border-primary/10">
          <CardHeader className="hero-grid relative overflow-hidden border-b border-border/50 bg-transparent py-5 md:py-6">
            {!isEditing ? (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <ProfileAvatar
                    name={fullName}
                    imageUrl={userData?.profileImageUrl}
                    size="xl"
                    className="border-2 border-primary/20"
                  />
                  <div className="min-w-0">
                    <CardTitle className="text-lg font-display truncate sm:text-xl">{fullName}</CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate mt-1">{userData?.email}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{profileCompletionScore}% complete</Badge>
                      <RatingPill
                        averageRating={userData?.averageRating}
                        reviewCount={userData?.reviewCount}
                        emptyLabel="No reviews yet"
                      />
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" aria-label="Edit profile" className="surface-glass w-full shrink-0 sm:w-auto" onClick={() => setIsEditing(true)} data-testid="profile-edit-button">
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </div>
            ) : (
              <div>
                <CardTitle className="text-xl font-display">Edit Profile</CardTitle>
                <CardDescription>Update your profile information and preferences.</CardDescription>
              </div>
            )}
          </CardHeader>

          <CardContent className="pt-6 pb-6">
            {!isEditing ? (
              <div className="space-y-5">
                {/* Personal Details */}
                <div className="surface-subtle rounded-[1.5rem] p-4 sm:p-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Personal Details</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs text-muted-foreground">First Name</p>
                      <p className="text-sm font-medium truncate" title={userData?.firstName || "Not set"}>{userData?.firstName || "Not set"}</p>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Last Name</p>
                      <p className="text-sm font-medium truncate" title={userData?.lastName || "Not set"}>{userData?.lastName || "Not set"}</p>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium truncate" title={userData?.email || "Not set"}>{userData?.email || "Not set"}</p>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Role</p>
                      <p className="text-sm font-medium capitalize truncate" title={profile?.role || "Not set"}>{profile?.role || "Not set"}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* About */}
                <div className="surface-subtle rounded-[1.5rem] p-4 sm:p-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">About</h3>
                  <div className="space-y-1 min-w-0 mb-4">
                    <p className="text-xs text-muted-foreground">Headline</p>
                    <p className="text-sm font-medium" title={profile?.headline || undefined}>
                      {profile?.headline || <span className="text-muted-foreground">Add a headline to improve matching.</span>}
                    </p>
                  </div>
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Bio</p>
                    <p className="text-sm line-clamp-3" title={profile?.bio || undefined}>
                      {profile?.bio || <span className="text-muted-foreground">No bio added yet.</span>}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="surface-subtle rounded-[1.5rem] p-4 sm:p-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Primary Categories</h3>
                  {profile?.primaryCategories && profile.primaryCategories.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {profile.primaryCategories.map((category) => (
                        <Badge key={category} variant="secondary" className="px-2.5 py-0.5 text-xs">
                          {PROJECT_CATEGORY_LABELS[category] || category}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Choose categories to improve recommendation quality.</p>
                  )}
                </div>

                {profile?.role === "developer" && (
                  <>
                    {/* Skills (Developer only) */}
                    <div className="surface-subtle rounded-[1.5rem] p-4 sm:p-5">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Skills</h3>
                      {profile?.skills && profile.skills.length > 0 ? (
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

                    {/* Portfolio Links (Developer only) */}
                    <div className="surface-subtle rounded-[1.5rem] p-4 sm:p-5">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Portfolio Links</h3>
                      {profile?.portfolioLinks?.github || profile?.portfolioLinks?.linkedin || profile?.portfolioLinks?.website ? (
                        <div className="space-y-2">
                          {profile.portfolioLinks.github && (
                            <ActionListItem
                              href={profile.portfolioLinks.github}
                              ariaLabel="Open GitHub profile"
                              icon={GitHubIcon}
                              title="GitHub"
                              description={profile.portfolioLinks.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              trailing={<ExternalLink className="h-3 w-3" />}
                              className="justify-between rounded-xl px-3"
                            />
                          )}
                          {profile.portfolioLinks.linkedin && (
                            <ActionListItem
                              href={profile.portfolioLinks.linkedin}
                              ariaLabel="Open LinkedIn profile"
                              icon={LinkedInIcon}
                              title="LinkedIn"
                              description={profile.portfolioLinks.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              trailing={<ExternalLink className="h-3 w-3" />}
                              className="justify-between rounded-xl px-3"
                            />
                          )}
                          {profile.portfolioLinks.website && (
                            <ActionListItem
                              href={profile.portfolioLinks.website}
                              ariaLabel="Open personal website"
                              icon={Globe}
                              title="Website"
                              description={profile.portfolioLinks.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              trailing={<ExternalLink className="h-3 w-3" />}
                              className="justify-between rounded-xl px-3"
                            />
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No links added yet.</p>
                      )}
                    </div>

                    <Separator />

                    {/* Professional Details (Developer only) */}
                    <div className="surface-subtle rounded-[1.5rem] p-4 sm:p-5">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Professional Details</h3>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Experience Level</p>
                              {profile?.experienceLevel ? (
                            <Badge variant="outline" className="text-sm">
                              {EXPERIENCE_LEVEL_LABELS[profile.experienceLevel] || profile.experienceLevel}
                            </Badge>
                          ) : (
                            <p className="text-sm text-muted-foreground">Not set</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Availability</p>
                          <Badge
                            variant={
                              profile?.availabilityStatus === "available"
                                ? "default"
                                : profile?.availabilityStatus === "busy"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className="text-sm"
                          >
                            {AVAILABILITY_LABELS[profile?.availabilityStatus || "available"]}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {profile?.role === "client" && (
                  <>
                    <Separator />

                    {/* Company Details (Client only) */}
                    <div className="surface-subtle rounded-[1.5rem] p-4 sm:p-5">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Company Details</h3>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-1 min-w-0">
                          <p className="text-xs text-muted-foreground">Company Name</p>
                          <p className="text-sm font-medium truncate" title={profile?.companyName || "Not set"}>
                            {profile?.companyName || <span className="text-muted-foreground">Not set</span>}
                          </p>
                        </div>
                        <div className="space-y-1 min-w-0">
                          <p className="text-xs text-muted-foreground">Industry</p>
                          <p className="text-sm font-medium truncate" title={profile?.industry || "Not set"}>
                            {profile?.industry || <span className="text-muted-foreground">Not set</span>}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Company Size</p>
                          {profile?.companySize ? (
                            <Badge variant="outline" className="text-sm">
                              {companySizeLabels[profile.companySize] || profile.companySize}
                            </Badge>
                          ) : (
                            <p className="text-sm text-muted-foreground">Not set</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit, () => {
                    toast({
                      title: "Validation Error",
                      description: "Please check the form for errors.",
                      variant: "destructive",
                    });
                  })}
                  className="space-y-5"
                >
                  {/* Avatar Upload */}
                  <div className="flex justify-center">
                    <AvatarUpload
                      currentImageUrl={userData?.profileImageUrl}
                      initials={initials}
                      userId={authUser?.id ?? ""}
                      size="lg"
                      data-testid="profile-edit-avatar-upload"
                      onUploadComplete={(url) => {
                        updateUser({ profileImageUrl: url }, {
                          onError: (error) => {
                            toast({
                              title: "Failed to save photo",
                              description: error.message,
                              variant: "destructive",
                            });
                          },
                        });
                      }}
                      onRemove={() => {
                        updateUser({ profileImageUrl: null }, {
                          onError: (error) => {
                            toast({
                              title: "Failed to remove photo",
                              description: error.message,
                              variant: "destructive",
                            });
                          },
                        });
                      }}
                    />
                  </div>

                  <Separator />

                  {/* Personal Details */}
                  <div className="surface-subtle rounded-[1.5rem] p-4 sm:p-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Personal Details</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input aria-label="First name" placeholder="John" data-testid="profile-edit-firstname-input" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input aria-label="Last name" placeholder="Doe" data-testid="profile-edit-lastname-input" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="space-y-2">
                        <FormLabel>Email</FormLabel>
                        <div aria-label="Email address" className="surface-subtle flex h-11 items-center rounded-xl px-4 text-sm text-muted-foreground truncate" title={userData?.email || "Not set"}>
                          {userData?.email || "Not set"}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <FormLabel>Role</FormLabel>
                        <div aria-label="User role" className="surface-subtle flex h-11 items-center rounded-xl px-4 text-sm text-muted-foreground capitalize truncate" title={profile?.role || "Not set"}>
                          {profile?.role || "Not set"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* About */}
                  <div className="surface-subtle rounded-[1.5rem] p-4 sm:p-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">About</h3>
                    <FormField
                      control={form.control}
                      name="headline"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel>Headline</FormLabel>
                          <FormControl>
                            <Input
                              aria-label="Headline"
                              placeholder="Add a short headline that explains your work"
                              data-testid="profile-edit-headline-input"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              aria-label="Biography"
                              placeholder="Tell us about yourself..."
                              className="min-h-[80px] resize-none text-sm"
                              data-testid="profile-edit-bio-textarea"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="surface-subtle rounded-[1.5rem] p-4 sm:p-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Primary Categories</h3>
                    <FormField
                      control={form.control}
                      name="primaryCategories"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <CategoryMultiSelect value={field.value || []} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {profile?.role === "developer" && (
                    <>
                      <Separator />

                      {/* Skills (Developer only) */}
                      <div className="surface-subtle rounded-[1.5rem] p-4 sm:p-5">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Skills</h3>
                        <FormField
                          control={form.control}
                          name="skills"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <TagInput
                                  aria-label="Skills"
                                  value={field.value || []}
                                  onChange={field.onChange}
                                  placeholder="Type a skill and press Enter..."
                                  data-testid="profile-edit-skills-input"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator />

                      {/* Portfolio Links (Developer only) */}
                      <div className="surface-subtle rounded-[1.5rem] p-4 sm:p-5">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Portfolio Links</h3>
                        <div className="space-y-3">
                          <FormField
                            control={form.control}
                            name="portfolioLinks.github"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <GitHubIcon className="h-4 w-4" />
                                  GitHub
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    aria-label="GitHub profile URL"
                                    placeholder="https://github.com/username"
                                    data-testid="profile-edit-github-input"
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="portfolioLinks.linkedin"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <LinkedInIcon className="h-4 w-4" />
                                  LinkedIn
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    aria-label="LinkedIn profile URL"
                                    placeholder="https://linkedin.com/in/username"
                                    data-testid="profile-edit-linkedin-input"
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="portfolioLinks.website"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  <Globe className="h-4 w-4" />
                                  Website
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    aria-label="Personal website URL"
                                    placeholder="https://yourwebsite.com"
                                    data-testid="profile-edit-website-input"
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Professional Details (Developer only) */}
                      <div className="surface-subtle rounded-[1.5rem] p-4 sm:p-5">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Professional Details</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="experienceLevel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Experience Level</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value || undefined}
                                >
                                  <FormControl>
                                    <SelectTrigger aria-label="Experience level" data-testid="profile-edit-experience-select">
                                      <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {experienceLevels.map((level) => (
                                      <SelectItem key={level} value={level}>
                                        {EXPERIENCE_LEVEL_LABELS[level]}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="availabilityStatus"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Availability</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value || "available"}
                                >
                                  <FormControl>
                                    <SelectTrigger aria-label="Availability status" data-testid="profile-edit-availability-select">
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {availabilityStatuses.map((status) => (
                                      <SelectItem key={status} value={status}>
                                        {AVAILABILITY_LABELS[status]}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {profile?.role === "client" && (
                    <>
                      <Separator />

                      {/* Company Details (Client only) */}
                      <div className="surface-subtle rounded-[1.5rem] p-4 sm:p-5">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Company Details</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Name</FormLabel>
                                <FormControl>
                                  <Input
                                    aria-label="Company name"
                                    placeholder="Acme Inc."
                                    data-testid="profile-edit-company-name-input"
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="industry"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Industry</FormLabel>
                                <FormControl>
                                  <Input
                                    aria-label="Industry"
                                    placeholder="e.g. Technology, Healthcare..."
                                    data-testid="profile-edit-industry-input"
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="companySize"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Size</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value || undefined}
                                >
                                  <FormControl>
                                    <SelectTrigger aria-label="Company size" data-testid="profile-edit-company-size-select">
                                      <SelectValue placeholder="Select size" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {companySizes.map((size) => (
                                      <SelectItem key={size} value={size}>
                                        {companySizeLabels[size]}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      aria-label="Cancel editing"
                      className="w-full rounded-2xl sm:w-auto"
                      onClick={handleCancel}
                      disabled={isPending}
                      data-testid="profile-edit-cancel-button"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" aria-label="Save profile changes" className="w-full rounded-2xl px-6 sm:w-auto" disabled={isPending} data-testid="profile-edit-save-button">
                      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
