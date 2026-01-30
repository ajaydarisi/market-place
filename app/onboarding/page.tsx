"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useProfile, useUpdateProfile } from "@/hooks/use-profiles";
import { useUser } from "@/hooks/use-users";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProfileSchema } from "@shared/schema";
import { Code2, Loader2, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const onboardingSchema = insertProfileSchema.pick({
  role: true,
  bio: true,
  skills: true,
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export default function Onboarding() {
  const { user } = useAuth();
  const { data: userData } = useUser(user?.id ?? "");
  const { data: profile } = useProfile(user?.id ?? "");
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const router = useRouter();

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      role: "client",
      bio: "",
      skills: [],
    },
  });

  if (profile) {
    router.push("/dashboard");
    return null;
  }

  const onSubmit = (data: OnboardingFormValues) => {
    updateProfile(data, {
      onSuccess: () => {
        router.push("/dashboard");
        router.refresh();
      },
    });
  };

  const selectedRole = form.watch("role");

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 py-12 px-4">
      <Card className="w-full max-w-xl shadow-2xl border-primary/10">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
            <UserCircle className="w-8 h-8" />
          </div>
          <div>
            <CardTitle className="text-3xl font-display font-bold">Welcome, {userData?.firstName || 'User'}!</CardTitle>
            <CardDescription className="text-lg mt-2">Let&apos;s set up your profile to get you started.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">I want to...</FormLabel>
                    <RadioGroup
                      aria-label="Select your role"
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4 mt-2"
                    >
                      <Label
                        htmlFor="role-client"
                        className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 ${field.value === 'client' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border'}`}
                      >
                        <RadioGroupItem value="client" id="role-client" className="sr-only" />
                        <UserCircle className="w-8 h-8 mb-3 text-primary" />
                        <h3 className="font-bold">Hire Talent</h3>
                        <p className="text-sm text-muted-foreground mt-1 font-normal">Post projects and find experts.</p>
                      </Label>
                      <Label
                        htmlFor="role-developer"
                        className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 ${field.value === 'developer' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border'}`}
                      >
                        <RadioGroupItem value="developer" id="role-developer" className="sr-only" />
                        <Code2 className="w-8 h-8 mb-3 text-primary" />
                        <h3 className="font-bold">Find Work</h3>
                        <p className="text-sm text-muted-foreground mt-1 font-normal">Browse jobs and build your career.</p>
                      </Label>
                    </RadioGroup>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        aria-label="Biography"
                        placeholder="Tell us a bit about yourself..."
                        className="resize-none h-32 text-base"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedRole === "developer" && (
                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Skills (comma separated)</FormLabel>
                      <FormControl>
                        <Input
                          aria-label="Skills"
                          placeholder="React, Node.js, TypeScript..."
                          onChange={(e) => field.onChange(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button type="submit" aria-label="Complete setup" className="w-full h-12 text-lg font-semibold rounded-xl" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  "Complete Setup"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
