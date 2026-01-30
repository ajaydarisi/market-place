"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { insertProfileSchema, insertUserSchema, experienceLevels, availabilityStatuses } from "@shared/schema";
import { ArrowLeft, Loader2, Edit2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const userFormSchema = insertUserSchema.pick({
  firstName: true,
  lastName: true,
});

const profileFormSchema = insertProfileSchema.pick({
  role: true,
  bio: true,
  skills: true,
  portfolioLinks: true,
  experienceLevel: true,
  availabilityStatus: true,
});

const combinedFormSchema = userFormSchema.merge(profileFormSchema);

type CombinedFormValues = z.infer<typeof combinedFormSchema>;

const experienceLevelLabels: Record<string, string> = {
  junior: "Junior",
  mid: "Mid-Level",
  senior: "Senior",
  lead: "Lead",
};

const availabilityLabels: Record<string, string> = {
  available: "Available",
  busy: "Busy",
  open_to_offers: "Open to Offers",
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
      bio: "",
      skills: [],
      portfolioLinks: [],
      experienceLevel: undefined,
      availabilityStatus: "available",
    },
  });

  useEffect(() => {
    if (userData || profile) {
      form.reset({
        firstName: userData?.firstName || "",
        lastName: userData?.lastName || "",
        role: profile?.role || "client",
        bio: profile?.bio || "",
        skills: profile?.skills || [],
        portfolioLinks: profile?.portfolioLinks || [],
        experienceLevel: profile?.experienceLevel,
        availabilityStatus: profile?.availabilityStatus || "available",
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
      bio: data.bio || undefined,
      skills: data.skills || undefined,
      portfolioLinks: data.portfolioLinks || undefined,
      experienceLevel: data.experienceLevel || undefined,
      availabilityStatus: data.availabilityStatus || undefined,
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

  const handleCancel = () => {
    form.reset({
      firstName: userData?.firstName || "",
      lastName: userData?.lastName || "",
      role: profile?.role || "client",
      bio: profile?.bio || "",
      skills: profile?.skills || [],
      portfolioLinks: profile?.portfolioLinks || [],
      experienceLevel: profile?.experienceLevel,
      availabilityStatus: profile?.availabilityStatus || "available",
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
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
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="mx-auto px-4 py-4">
        <Link
          href={backHref}
          aria-label="Go back"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-3 transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Link>

        <Card className="shadow-xl border-primary/10 w-full md:w-[50%] md:min-w-[600px] max-w-[800px] mx-auto">
          <CardHeader className="border-b bg-secondary/20 py-4">
            {!isEditing ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 border-2 border-primary/20" aria-label={`${fullName}'s avatar`}>
                    <AvatarFallback className="bg-primary/10 text-primary text-base sm:text-lg font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <CardTitle className="text-lg sm:text-xl font-display truncate">{fullName}</CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate mt-1">{userData?.email}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" aria-label="Edit profile" className="shrink-0" onClick={() => setIsEditing(true)}>
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

          <CardContent className="pt-5 pb-4">
            {!isEditing ? (
              <div className="space-y-5">
                {/* Personal Details */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Personal Details</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">About</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Bio</p>
                      <p className="text-sm line-clamp-3" title={profile?.bio || undefined}>
                        {profile?.bio || <span className="text-muted-foreground">No bio added yet.</span>}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Skills</p>
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
                  </div>
                </div>

                <Separator />

                {/* Professional Details */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Professional Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Experience Level</p>
                      {profile?.experienceLevel ? (
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
                          profile?.availabilityStatus === "available"
                            ? "default"
                            : profile?.availabilityStatus === "busy"
                              ? "destructive"
                              : "secondary"
                        }
                        className="text-sm"
                      >
                        {availabilityLabels[profile?.availabilityStatus || "available"]}
                      </Badge>
                    </div>
                  </div>
                </div>
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
                  {/* Personal Details */}
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Personal Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input aria-label="First name" placeholder="John" {...field} value={field.value || ""} />
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
                              <Input aria-label="Last name" placeholder="Doe" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="space-y-2">
                        <FormLabel>Email</FormLabel>
                        <div aria-label="Email address" className="h-9 flex items-center px-3 border rounded-md bg-muted/50 text-sm text-muted-foreground truncate" title={userData?.email || "Not set"}>
                          {userData?.email || "Not set"}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <FormLabel>Role</FormLabel>
                        <div aria-label="User role" className="h-9 flex items-center px-3 border rounded-md bg-muted/50 text-sm text-muted-foreground capitalize truncate" title={profile?.role || "Not set"}>
                          {profile?.role || "Not set"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* About */}
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">About</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        name="skills"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Skills</FormLabel>
                            <FormControl>
                              <TagInput
                                aria-label="Skills"
                                value={field.value || []}
                                onChange={field.onChange}
                                placeholder="Type a skill and press Enter..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Professional Details */}
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Professional Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                <SelectTrigger aria-label="Experience level">
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {experienceLevels.map((level) => (
                                  <SelectItem key={level} value={level}>
                                    {experienceLevelLabels[level]}
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
                                <SelectTrigger aria-label="Availability status">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {availabilityStatuses.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {availabilityLabels[status]}
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

                  {/* Actions */}
                  <div className="flex justify-center gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      aria-label="Cancel editing"
                      className="rounded-xl"
                      onClick={handleCancel}
                      disabled={isPending}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" aria-label="Save profile changes" className="rounded-xl px-6" disabled={isPending}>
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
