"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useProfile, useUpdateProfile } from "@/hooks/use-profiles";
import { useUser, useUpdateUser } from "@/hooks/use-users";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProfileSchema, insertUserSchema } from "@shared/schema";
import { ArrowLeft, Loader2, X, Plus, Edit2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";

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

export default function Profile() {
  const { user: authUser } = useAuth();
  const { data: userData, isLoading: isLoadingUser } = useUser(authUser?.id ?? "");
  const { data: profile, isLoading: isLoadingProfile } = useProfile(authUser?.id ?? "");
  const { mutate: updateUser, isPending: isUpdatingUser } = useUpdateUser();
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile();
  const { toast } = useToast();
  const router = useRouter();
  const [skillInput, setSkillInput] = useState("");
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

  const handleBack = () => {
    if (profile?.role === "client") {
      router.push("/client/projects");
    } else {
      router.push("/developer/browse");
    }
  };

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
    setSkillInput("");
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container max-w-2xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={handleBack} className="mb-6 -ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  {isEditing ? "Update your profile information and preferences." : "View your profile information."}
                </CardDescription>
              </div>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit, () => {
                  toast({
                    title: "Validation Error",
                    description: "Please check the form for errors",
                    variant: "destructive",
                  });
                })}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Personal Information</h3>

                  {isEditing ? (
                    <>
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} value={field.value || ""} />
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
                              <Input placeholder="Doe" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <FormLabel>First Name</FormLabel>
                        <div className="text-base">{userData?.firstName || "Not set"}</div>
                      </div>
                      <div className="space-y-2">
                        <FormLabel>Last Name</FormLabel>
                        <div className="text-base">{userData?.lastName || "Not set"}</div>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold">Profile Information</h3>

                  <div className="space-y-2">
                    <FormLabel>Email</FormLabel>
                    <div className={isEditing ? "p-3 border rounded-md bg-muted/50 text-sm text-muted-foreground" : "text-base"}>
                      {userData?.email || "Not set"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <FormLabel>Role</FormLabel>
                    <div className={isEditing ? "p-3 border rounded-md bg-muted/50 text-sm text-muted-foreground capitalize" : "text-base capitalize"}>
                      {profile?.role || "Not set"} {isEditing && "(Cannot be changed)"}
                    </div>
                  </div>

                  {isEditing ? (
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about yourself..."
                              className="resize-none h-32"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <div className="space-y-2">
                      <FormLabel>Bio</FormLabel>
                      <div className="text-base whitespace-pre-wrap">{profile?.bio || "Not set"}</div>
                    </div>
                  )}

                  {isEditing ? (
                    <FormField
                      control={form.control}
                      name="skills"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skills</FormLabel>
                          <FormControl>
                            <div className="space-y-3">
                              {field.value && field.value.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {field.value.map((skill, index) => (
                                    <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                                      {skill}
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="ml-1 h-4 w-4 p-0 hover:text-destructive hover:bg-transparent"
                                        onClick={() => {
                                          const newSkills = field.value?.filter((_, i) => i !== index) || [];
                                          field.onChange(newSkills);
                                        }}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Add a skill (e.g., React, Node.js, TypeScript)"
                                  value={skillInput}
                                  onChange={(e) => setSkillInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      const trimmedSkill = skillInput.trim();
                                      if (trimmedSkill && !field.value?.includes(trimmedSkill)) {
                                        field.onChange([...(field.value || []), trimmedSkill]);
                                        setSkillInput("");
                                      }
                                    }
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="icon"
                                  onClick={() => {
                                    const trimmedSkill = skillInput.trim();
                                    if (trimmedSkill && !field.value?.includes(trimmedSkill)) {
                                      field.onChange([...(field.value || []), trimmedSkill]);
                                      setSkillInput("");
                                    }
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <div className="space-y-2">
                      <FormLabel>Skills</FormLabel>
                      {profile?.skills && profile.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="text-base text-muted-foreground">No skills added</div>
                      )}
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="flex gap-3">
                    <Button type="submit" disabled={isPending}>
                      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
