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
  budgetMin: z.coerce.number().min(1, "Budget must be at least $1"),
  budgetMax: z.coerce.number().min(1, "Budget must be at least $1"),
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
    <div className="min-h-screen bg-background pb-12">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Link href="/client/projects" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Projects
        </Link>

        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-primary/10">
            <CardHeader className="border-b bg-secondary/20 pb-8">
              <CardTitle className="text-2xl font-display">Post a New Project</CardTitle>
              <CardDescription>Fill out the details below to reach thousands of developers.</CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. E-commerce Platform Development" className="h-12 text-lg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12">
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

                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="budgetMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min Budget ($)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="1000" className="h-12" {...field} />
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
                          <FormLabel>Max Budget ($)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="5000" className="h-12" {...field} />
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
                            placeholder="Describe your project requirements in detail..."
                            className="min-h-[200px] resize-none text-base leading-relaxed"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4 flex justify-end gap-4">
                    <Link href="/client/projects">
                      <Button type="button" variant="outline" size="lg" className="rounded-xl">Cancel</Button>
                    </Link>
                    <Button type="submit" size="lg" className="rounded-xl px-8" disabled={isPending}>
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
