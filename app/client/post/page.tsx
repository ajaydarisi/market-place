"use client";

import { Navigation } from "@/components/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema } from "@shared/schema";
import { useCreateProject } from "@/hooks/use-projects";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const formSchema = insertProjectSchema.extend({
  budgetMin: z.coerce.number().min(1, "Budget must be at least ₹1"),
  budgetMax: z.coerce.number().min(1, "Budget must be at least ₹1"),
});

type FormValues = z.infer<typeof formSchema>;

export default function PostProject() {
  const { user } = useAuth();
  const { mutate: createProject, isPending } = useCreateProject();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      budgetMin: undefined,
      budgetMax: undefined,
    },
  });

  const onSubmit = (data: FormValues) => {
    createProject(data, {
      onSuccess: () => {
        router.push("/client/projects");
      },
    });
  };

  return (
    <div className="page-shell min-h-screen bg-background pb-12">
      <Navigation />
      <div className="container mx-auto mobile-page">
        <Link href="/client/projects" aria-label="Back to projects" className="surface-glass mb-4 inline-flex items-center rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-primary md:mb-6">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Projects
        </Link>

        <div className="max-w-2xl mx-auto">
          <Card className="border-primary/10 shadow-xl">
            <CardHeader className="hero-grid border-b bg-secondary/20 pb-6 md:pb-8">
              <CardTitle className="text-xl font-display sm:text-2xl">Post a New Project</CardTitle>
              <CardDescription>Fill out the details below to reach thousands of developers.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 md:pt-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 md:space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Title</FormLabel>
                        <FormControl>
                          <Input aria-label="Project title" placeholder="e.g. E-commerce Platform Development" className="h-12 text-lg" data-testid="create-project-title-input" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-5 sm:grid-cols-2 md:gap-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger aria-label="Project category" className="h-12" data-testid="create-project-category-select">
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
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6">
                    <FormField
                      control={form.control}
                      name="budgetMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min Budget (₹)</FormLabel>
                          <FormControl>
                            <Input aria-label="Minimum budget" type="number" placeholder="1000" className="h-12" data-testid="create-project-budget-min-input" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="budgetMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Budget (₹)</FormLabel>
                          <FormControl>
                            <Input aria-label="Maximum budget" type="number" placeholder="5000" className="h-12" data-testid="create-project-budget-max-input" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Description</FormLabel>
                        <FormControl>
                          <Textarea
                            aria-label="Project description"
                            placeholder="Describe your project requirements in detail..."
                            className="min-h-[200px] resize-none text-base leading-relaxed"
                            data-testid="create-project-description-textarea"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end sm:gap-4">
                    <Link href="/client/projects" aria-label="Cancel and go back">
                      <Button type="button" aria-label="Cancel" variant="outline" size="lg" className="w-full rounded-2xl sm:w-auto" data-testid="create-project-cancel-button">Cancel</Button>
                    </Link>
                    <Button type="submit" aria-label="Post project" size="lg" className="w-full rounded-2xl px-8 sm:w-auto" disabled={isPending} data-testid="create-project-submit-button">
                      {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                      Post Project
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
