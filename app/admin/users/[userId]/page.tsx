"use client";

import { Navigation } from "@/components/navigation";
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
import { Separator } from "@/components/ui/separator";
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
import {
  useAdminUser,
  useAdminUpdateUser,
  useAdminUpdateProfile,
  useAdminDeleteUser,
} from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { userRoles, experienceLevels, availabilityStatuses, companySizes } from "@shared/schema";

export default function AdminUserDetail() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const userId = params.userId as string;

  const { data: user, isLoading } = useAdminUser(userId);
  const { mutate: updateUser, isPending: isUpdatingUser } = useAdminUpdateUser();
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useAdminUpdateProfile();
  const { mutate: deleteUser, isPending: isDeleting } = useAdminDeleteUser();

  // User form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Profile form state
  const [role, setRole] = useState<string>("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [availabilityStatus, setAvailabilityStatus] = useState<string>("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState<string>("");

  // Populate form when data loads
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setRole(user.profile?.role || "");
      setBio(user.profile?.bio || "");
      setSkills(user.profile?.skills?.join(", ") || "");
      setExperienceLevel(user.profile?.experienceLevel || "");
      setAvailabilityStatus(user.profile?.availabilityStatus || "");
      setCompanyName(user.profile?.companyName || "");
      setIndustry(user.profile?.industry || "");
      setCompanySize(user.profile?.companySize || "");
    }
  }, [user]);

  const handleSaveUser = () => {
    updateUser(
      { userId, data: { firstName, lastName } },
      {
        onSuccess: () => {
          toast({ title: "User updated", description: "User details saved successfully." });
        },
        onError: (error) => {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        },
      }
    );
  };

  const handleSaveProfile = () => {
    const profileData: any = {
      role: role as any,
      bio,
    };

    if (role === "developer") {
      profileData.skills = skills.split(",").map((s) => s.trim()).filter(Boolean);
      profileData.experienceLevel = experienceLevel || null;
      profileData.availabilityStatus = availabilityStatus || "available";
    } else if (role === "client") {
      profileData.companyName = companyName || null;
      profileData.industry = industry || null;
      profileData.companySize = companySize || null;
    }

    updateProfile(
      { userId, data: profileData },
      {
        onSuccess: () => {
          toast({ title: "Profile updated", description: "Profile details saved successfully." });
        },
        onError: (error) => {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        },
      }
    );
  };

  const handleDelete = () => {
    deleteUser(userId, {
      onSuccess: () => {
        toast({ title: "User deleted", description: "User has been removed from the platform." });
        router.push("/admin/users");
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">User not found</p>
        </main>
      </div>
    );
  }

  const isDeveloper = role === "developer";
  const isClient = role === "client";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Link
          href="/admin/users"
          aria-label="Back to users list"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Users
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <ProfileAvatar
              name={`${user.firstName || ""} ${user.lastName || ""}`}
              imageUrl={user.profileImageUrl}
              size="lg"
            />
            <div>
              <h1 className="text-3xl font-display font-bold">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Badge variant={role === "admin" ? "default" : "secondary"}>{role || "No role"}</Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* User Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>User Details</CardTitle>
              <CardDescription>Basic user information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  aria-label="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  aria-label="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input aria-label="Email" value={user.email} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Member Since</Label>
                <Input
                  aria-label="Member since"
                  value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                  disabled
                  className="bg-muted"
                />
              </div>
              <Button
                onClick={handleSaveUser}
                disabled={isUpdatingUser}
                aria-label="Save user details"
              >
                {isUpdatingUser ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save User
              </Button>
            </CardContent>
          </Card>

          {/* Profile Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>Role and profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger aria-label="Select role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {userRoles.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  aria-label="Biography"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                />
              </div>

              {isDeveloper && (
                <>
                  <Separator />
                  <p className="text-sm font-medium text-muted-foreground">Developer Fields</p>
                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills (comma-separated)</Label>
                    <Input
                      id="skills"
                      aria-label="Skills"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="React, TypeScript, Node.js"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experienceLevel">Experience Level</Label>
                    <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                      <SelectTrigger aria-label="Experience level">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="availabilityStatus">Availability</Label>
                    <Select value={availabilityStatus} onValueChange={setAvailabilityStatus}>
                      <SelectTrigger aria-label="Availability status">
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        {availabilityStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {isClient && (
                <>
                  <Separator />
                  <p className="text-sm font-medium text-muted-foreground">Client Fields</p>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      aria-label="Company name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      aria-label="Industry"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companySize">Company Size</Label>
                    <Select value={companySize} onValueChange={setCompanySize}>
                      <SelectTrigger aria-label="Company size">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {companySizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size.charAt(0).toUpperCase() + size.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <Button
                onClick={handleSaveProfile}
                disabled={isUpdatingProfile}
                aria-label="Save profile details"
              >
                {isUpdatingProfile ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Danger Zone */}
        <Card className="mt-6 border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" aria-label="Delete user">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete User
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {user.firstName} {user.lastName}? This will also
                    remove all their projects and data. This action cannot be undone.
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
      </main>
    </div>
  );
}
