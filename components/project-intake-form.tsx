"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wand2, Loader2, Plus, Trash2, Sparkles } from "lucide-react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TagInput } from "@/components/ui/tag-input";
import { useGenerateProjectDraft } from "@/hooks/use-projects";
import { useImprovePost } from "@/hooks/use-ai";
import {
  communicationCadences,
  experienceLevels,
  insertProjectSchema,
  projectTypes,
  scopeSizes,
  teamPreferences,
  type InsertProject,
  type ProjectDraft,
  type ReferenceLink,
} from "@shared/schema";
import {
  calculateProjectCompletenessScore,
  COMMUNICATION_CADENCE_LABELS,
  ENGAGEMENT_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  PROJECT_CATEGORY_OPTIONS,
  PROJECT_TYPE_LABELS,
  SCOPE_SIZE_LABELS,
  TEAM_PREFERENCE_LABELS,
  TECHNOLOGY_TAG_GROUPS,
  TECHNOLOGY_TAG_LABELS,
} from "@shared/marketplace";

type ProjectIntakeFormValues = InsertProject;

interface ProjectIntakeFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<ProjectIntakeFormValues>;
  isPending?: boolean;
  onSubmit: (values: ProjectIntakeFormValues) => void;
}

const STEP_TITLES = [
  { key: "kickoff", label: "Kickoff" },
  { key: "scope", label: "Scope" },
  { key: "fit", label: "Stack & Fit" },
  { key: "timeline", label: "Timeline & Budget" },
  { key: "review", label: "Review & Publish" },
] as const;

function defaultReferenceLinks(links?: ReferenceLink[]) {
  return links && links.length > 0 ? links : [];
}

function toDateInputValue(value?: string | Date | null) {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

function createDefaultValues(initialValues?: Partial<ProjectIntakeFormValues>): ProjectIntakeFormValues {
  return {
    title: initialValues?.title ?? "",
    category: initialValues?.category ?? "",
    description: initialValues?.description ?? "",
    businessGoal: initialValues?.businessGoal ?? "",
    currentState: initialValues?.currentState ?? "",
    targetUsers: initialValues?.targetUsers ?? "",
    projectType: initialValues?.projectType ?? "one_time",
    scopeSize: initialValues?.scopeSize ?? "medium",
    budgetMin: initialValues?.budgetMin ?? 0,
    budgetMax: initialValues?.budgetMax ?? 0,
    requiredSkills: initialValues?.requiredSkills ?? [],
    preferredSkills: initialValues?.preferredSkills ?? [],
    technologyTags: initialValues?.technologyTags ?? [],
    deliverables: initialValues?.deliverables ?? [],
    mustHaves: initialValues?.mustHaves ?? [],
    niceToHaves: initialValues?.niceToHaves ?? [],
    successCriteria: initialValues?.successCriteria ?? [],
    preferredExperienceLevel: initialValues?.preferredExperienceLevel ?? null,
    engagementType: initialValues?.engagementType ?? "fixed",
    teamPreference: initialValues?.teamPreference ?? null,
    communicationCadence: initialValues?.communicationCadence ?? null,
    estimatedDurationWeeks: initialValues?.estimatedDurationWeeks ?? null,
    startDate: initialValues?.startDate ?? null,
    deadline: initialValues?.deadline ?? null,
    screeningQuestions: initialValues?.screeningQuestions ?? [],
    referenceLinks: defaultReferenceLinks(initialValues?.referenceLinks),
  };
}

function ReferenceLinksEditor({
  value,
  onChange,
}: {
  value: ReferenceLink[];
  onChange: (value: ReferenceLink[]) => void;
}) {
  const addRow = () => {
    onChange([...(value ?? []), { label: "", url: "" }]);
  };

  const updateRow = (index: number, key: keyof ReferenceLink, nextValue: string) => {
    const updated = [...(value ?? [])];
    updated[index] = { ...updated[index], [key]: nextValue };
    onChange(updated);
  };

  const removeRow = (index: number) => {
    onChange((value ?? []).filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <div className="space-y-3">
      {(value ?? []).map((link, index) => (
        <div key={`${link.url}-${index}`} className="grid gap-3 rounded-2xl border border-border/60 p-3 md:grid-cols-[0.8fr_1.4fr_auto]">
          <Input
            value={link.label}
            onChange={(event) => updateRow(index, "label", event.target.value)}
            placeholder="Link label"
          />
          <Input
            value={link.url}
            onChange={(event) => updateRow(index, "url", event.target.value)}
            placeholder="https://..."
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => removeRow(index)} aria-label="Remove link">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addRow} disabled={(value ?? []).length >= 5}>
        <Plus className="mr-2 h-4 w-4" />
        Add Reference Link
      </Button>
    </div>
  );
}

function TechnologyTagPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const selectedSet = new Set(value);

  const toggleTag = (tag: string) => {
    if (selectedSet.has(tag)) {
      onChange(value.filter((item) => item !== tag));
      return;
    }
    onChange([...value, tag]);
  };

  return (
    <div className="space-y-4">
      <TagInput
        value={value}
        onChange={onChange}
        placeholder="Add technology tags or pick from the catalog below..."
      />
      <div className="space-y-3">
        {TECHNOLOGY_TAG_GROUPS.map((group) => (
          <div key={group.label} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{group.label}</p>
            <div className="flex flex-wrap gap-2">
              {group.options.map((option) => {
                const isSelected = selectedSet.has(option.value);
                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => toggleTag(option.value)}
                    className={`rounded-full px-3 py-1.5 text-sm transition-colors h-auto ${
                      isSelected
                        ? "border-primary bg-primary/[0.1] text-primary hover:bg-primary/[0.15]"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-primary"
                    }`}
                  >
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProjectIntakeForm({
  mode,
  initialValues,
  isPending,
  onSubmit,
}: ProjectIntakeFormProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [rawBrief, setRawBrief] = useState("");
  const [draftFeedback, setDraftFeedback] = useState<{ missingFields: string[]; warnings: string[] } | null>(null);
  const { mutate: generateDraft, isPending: isGeneratingDraft } = useGenerateProjectDraft();
  const improvePost = useImprovePost();

  const form = useForm<ProjectIntakeFormValues>({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: createDefaultValues(initialValues),
  });

  useEffect(() => {
    form.reset(createDefaultValues(initialValues));
  }, [form, initialValues]);

  const values = form.watch();
  const completenessScore = useMemo(
    () =>
      calculateProjectCompletenessScore({
        ...values,
        startDate: values.startDate ?? undefined,
        deadline: values.deadline ?? undefined,
      }),
    [values],
  );

  const handleOptionalNumberChange =
    (onChange: (value: number | null) => void) => (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      onChange(nextValue === "" ? null : Number(nextValue));
    };

  const handleOptionalDateChange =
    (onChange: (value: string | null) => void) => (event: ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value || null);
    };

  const handleGenerateDraft = () => {
    if (rawBrief.trim().length < 20) return;
    generateDraft(rawBrief, {
      onSuccess: (response) => {
        form.reset({
          ...createDefaultValues(initialValues),
          ...response.draft,
          requiredSkills: response.draft.requiredSkills ?? form.getValues("requiredSkills"),
          preferredSkills: response.draft.preferredSkills ?? form.getValues("preferredSkills"),
          technologyTags: response.draft.technologyTags ?? form.getValues("technologyTags"),
          deliverables: response.draft.deliverables ?? form.getValues("deliverables"),
          mustHaves: response.draft.mustHaves ?? form.getValues("mustHaves"),
          niceToHaves: response.draft.niceToHaves ?? form.getValues("niceToHaves"),
          successCriteria: response.draft.successCriteria ?? form.getValues("successCriteria"),
          screeningQuestions: response.draft.screeningQuestions ?? form.getValues("screeningQuestions"),
          referenceLinks: response.draft.referenceLinks ?? form.getValues("referenceLinks"),
        });
        setDraftFeedback({
          missingFields: response.missingFields,
          warnings: response.warnings,
        });
        setStepIndex(1);
      },
    });
  };

  const nextStep = async () => {
    if (stepIndex === 0) {
      setStepIndex(1);
      return;
    }

    let fieldsToValidate: (keyof ProjectIntakeFormValues)[] = [];

    if (stepIndex === 1) {
      fieldsToValidate = ["title", "category", "businessGoal", "projectType", "scopeSize", "description"];
    } else if (stepIndex === 2) {
      fieldsToValidate = ["requiredSkills", "technologyTags"];
    } else if (stepIndex === 3) {
      fieldsToValidate = ["engagementType", "budgetMin", "budgetMax"];
    }

    const isValid = fieldsToValidate.length === 0 ? true : await form.trigger(fieldsToValidate);
    if (isValid) {
      setStepIndex((current) => Math.min(current + 1, STEP_TITLES.length - 1));
    }
  };

  const previousStep = () => {
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  return (
    <Card className="border-primary/10 shadow-xl">
      <CardHeader className="hero-grid border-b bg-secondary/20 pb-6 md:pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-display sm:text-2xl">
              {mode === "create" ? "Post a New Project" : "Edit Project Brief"}
            </CardTitle>
            <CardDescription className="mt-2">
              Build a structured project brief that improves matching, proposal quality, and discovery.
            </CardDescription>
          </div>
          <div className="rounded-2xl border border-primary/15 bg-background/70 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Brief completeness</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{completenessScore}%</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-5">
          {STEP_TITLES.map((step, index) => (
            <Button
              key={step.key}
              type="button"
              variant="ghost"
              className={`h-auto rounded-2xl border px-3 py-3 text-left transition-colors ${
                index === stepIndex
                  ? "border-primary bg-primary/[0.08] text-primary hover:bg-primary/[0.12]"
                  : index < stepIndex
                    ? "border-primary/30 bg-background text-foreground hover:bg-secondary/50"
                    : "border-border/60 bg-background/70 text-muted-foreground hover:bg-secondary/40"
              }`}
              onClick={() => setStepIndex(index)}
            >
              <p className="text-xs uppercase tracking-[0.2em]">Step {index + 1}</p>
              <p className="mt-1 text-sm font-semibold">{step.label}</p>
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-6 md:pt-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((submittedValues) => onSubmit(submittedValues))} className="space-y-6">
            {stepIndex === 0 ? (
              <div className="space-y-5">
                <div className="rounded-3xl border border-primary/15 bg-primary/[0.04] p-5">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <h3 className="text-lg font-semibold">Start from a rough brief</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Paste a messy client note, roadmap bullet list, or scope summary and we&apos;ll turn it into a structured project draft.
                      </p>
                    </div>
                  </div>
                  <Textarea
                    value={rawBrief}
                    onChange={(event) => setRawBrief(event.target.value)}
                    className="mt-4 min-h-[220px] resize-none"
                    placeholder="Example: We need a Next.js dashboard for our sales team, Supabase auth, role-based access, admin analytics, and an AI assistant for searching customer notes. Budget ₹1,50,000 to ₹3,00,000. Target timeline 6 weeks."
                  />
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                      Manual entry is always available if you want full control.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button type="button" variant="outline" onClick={() => setStepIndex(1)}>
                        Start Blank
                      </Button>
                      <Button type="button" onClick={handleGenerateDraft} disabled={isGeneratingDraft || rawBrief.trim().length < 20}>
                        {isGeneratingDraft ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Generate Draft
                      </Button>
                    </div>
                  </div>
                </div>

                {draftFeedback ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-border/60">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Still missing</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-wrap gap-2">
                        {draftFeedback.missingFields.length > 0 ? draftFeedback.missingFields.map((field) => (
                          <Badge key={field} variant="outline">{field}</Badge>
                        )) : <p className="text-sm text-muted-foreground">No required fields missing.</p>}
                      </CardContent>
                    </Card>
                    <Card className="border-border/60">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Warnings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {draftFeedback.warnings.length > 0 ? draftFeedback.warnings.map((warning) => (
                          <p key={warning} className="text-sm text-muted-foreground">{warning}</p>
                        )) : <p className="text-sm text-muted-foreground">No warnings.</p>}
                      </CardContent>
                    </Card>
                  </div>
                ) : null}
              </div>
            ) : null}

            {stepIndex === 1 ? (
              <div className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Project Title</FormLabel>
                        <FormControl>
                          <Input placeholder="AI-assisted CRM dashboard for sales ops" className="h-12 text-lg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PROJECT_CATEGORY_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
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
                    name="projectType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {projectTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {PROJECT_TYPE_LABELS[type]}
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
                    name="scopeSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scope Size</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {scopeSizes.map((size) => (
                              <SelectItem key={size} value={size}>
                                {SCOPE_SIZE_LABELS[size]}
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
                    name="businessGoal"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Business Goal</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What outcome should this project drive for the business?"
                            className="min-h-[110px] resize-none"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currentState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current State</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Existing app, team, constraints, or systems in place"
                            className="min-h-[120px] resize-none"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetUsers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Users</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Who will use this and what should become easier for them?"
                            className="min-h-[120px] resize-none"
                            {...field}
                            value={field.value ?? ""}
                          />
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
                      <FormLabel>Project Overview</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the scope, context, and important product constraints."
                          className="min-h-[220px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : null}

            {stepIndex === 2 ? (
              <div className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="requiredSkills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Required Skills</FormLabel>
                        <FormControl>
                          <TagInput value={field.value || []} onChange={field.onChange} placeholder="React, PostgreSQL, API design..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="preferredSkills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Skills</FormLabel>
                        <FormControl>
                          <TagInput value={field.value || []} onChange={field.onChange} placeholder="Nice-to-have experience" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="technologyTags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technology Tags</FormLabel>
                      <FormControl>
                        <TechnologyTagPicker value={field.value || []} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="mustHaves"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Must-haves</FormLabel>
                        <FormControl>
                          <TagInput value={field.value || []} onChange={field.onChange} placeholder="Non-negotiable constraints or expectations" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="niceToHaves"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nice-to-haves</FormLabel>
                        <FormControl>
                          <TagInput value={field.value || []} onChange={field.onChange} placeholder="Stretch skills or bonus capabilities" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="preferredExperienceLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Experience</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Open to all levels" />
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
                    name="teamPreference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Preference</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="No preference" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {teamPreferences.map((preference) => (
                              <SelectItem key={preference} value={preference}>
                                {TEAM_PREFERENCE_LABELS[preference]}
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
                    name="communicationCadence"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Communication Cadence</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="No preference" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {communicationCadences.map((cadence) => (
                              <SelectItem key={cadence} value={cadence}>
                                {COMMUNICATION_CADENCE_LABELS[cadence]}
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
            ) : null}

            {stepIndex === 3 ? (
              <div className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="engagementType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Engagement Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(ENGAGEMENT_TYPE_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="budgetMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min Budget (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              value={field.value ?? ""}
                              onChange={(event) => field.onChange(Number(event.target.value))}
                              className="h-12"
                            />
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
                            <Input
                              type="number"
                              value={field.value ?? ""}
                              onChange={(event) => field.onChange(Number(event.target.value))}
                              className="h-12"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" value={toDateInputValue(field.value)} onChange={handleOptionalDateChange(field.onChange)} className="h-12" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                  />
                  <FormField
                    control={form.control}
                    name="estimatedDurationWeeks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Duration (weeks)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            value={field.value ?? ""}
                            onChange={handleOptionalNumberChange(field.onChange)}
                            className="h-12"
                            placeholder="6"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deadline</FormLabel>
                          <FormControl>
                            <Input type="date" value={toDateInputValue(field.value)} onChange={handleOptionalDateChange(field.onChange)} className="h-12" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                  />
                </div>
              </div>
            ) : null}

            {stepIndex === 4 ? (
              <div className="space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="deliverables"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deliverables</FormLabel>
                        <FormControl>
                          <TagInput value={field.value || []} onChange={field.onChange} placeholder="Admin dashboard, analytics module, onboarding flow..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="successCriteria"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Success Criteria</FormLabel>
                        <FormControl>
                          <TagInput value={field.value || []} onChange={field.onChange} placeholder="Faster onboarding, cleaner reporting, higher conversion..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="screeningQuestions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Screening Questions</FormLabel>
                        <FormControl>
                          <TagInput value={field.value || []} onChange={field.onChange} placeholder="Up to 3 proposal questions" />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">Keep this to 3 focused questions maximum.</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="referenceLinks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reference Links</FormLabel>
                        <FormControl>
                          <ReferenceLinksEditor value={field.value || []} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="border-border/60">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Brief Snapshot</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Category</p>
                        <p className="mt-1">{PROJECT_CATEGORY_OPTIONS.find((option) => option.value === values.category)?.label || values.category}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Stack</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(values.technologyTags || []).map((tag) => (
                            <Badge key={tag} variant="secondary">{TECHNOLOGY_TAG_LABELS[tag] || tag}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Budget</p>
                        <p className="mt-1">₹{values.budgetMin?.toLocaleString("en-IN")} - ₹{values.budgetMax?.toLocaleString("en-IN")}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/60">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Publish checklist</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                      {[
                        values.title ? "Title ready" : "",
                        values.businessGoal ? "Goal defined" : "",
                        values.deliverables?.length ? "Deliverables added" : "",
                        values.requiredSkills?.length ? "Required skills added" : "",
                        values.technologyTags?.length ? "Tech stack tagged" : "",
                        values.estimatedDurationWeeks || values.deadline ? "Timeline set" : "",
                      ].filter(Boolean).map((item) => (
                        <Badge key={item} variant="outline">{item}</Badge>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-primary/15 bg-primary/[0.03]">
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Sparkles className="h-4 w-4 text-primary" />
                          AI Post Review
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Checks for missing details, unclear requirements, and unrealistic budget or timeline.
                        </CardDescription>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        data-testid="improve-post-button"
                        disabled={improvePost.isPending}
                        onClick={() => improvePost.mutate(form.getValues() as ProjectDraft)}
                      >
                        {improvePost.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Improve this post
                      </Button>
                    </div>
                  </CardHeader>
                  {improvePost.data || improvePost.isError ? (
                    <CardContent className="space-y-3">
                      {improvePost.isError ? (
                        <p className="text-sm text-muted-foreground">
                          {improvePost.error instanceof Error ? improvePost.error.message : "AI review failed."}
                        </p>
                      ) : null}
                      {improvePost.data?.budgetAssessment ? (
                        <p className="text-sm"><span className="font-semibold">Budget:</span> {improvePost.data.budgetAssessment}</p>
                      ) : null}
                      {improvePost.data?.timelineAssessment ? (
                        <p className="text-sm"><span className="font-semibold">Timeline:</span> {improvePost.data.timelineAssessment}</p>
                      ) : null}
                      {improvePost.data?.suggestions.map((suggestion, index) => (
                        <div key={index} className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3">
                          {suggestion.field ? <Badge variant="outline" className="mb-2">{suggestion.field}</Badge> : null}
                          <p className="text-sm font-medium">{suggestion.issue}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{suggestion.recommendation}</p>
                        </div>
                      ))}
                      {improvePost.data && improvePost.data.suggestions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">This post already looks strong — nothing to fix.</p>
                      ) : null}
                    </CardContent>
                  ) : null}
                </Card>
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-between">
              <Button type="button" variant="outline" onClick={previousStep} disabled={stepIndex === 0}>
                Back
              </Button>
              <div className="flex flex-col gap-3 sm:flex-row">
                {stepIndex < STEP_TITLES.length - 1 ? (
                  <Button type="button" onClick={nextStep}>
                    Continue
                  </Button>
                ) : (
                  <Button type="submit" disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {mode === "create" ? "Post Project" : "Save Project"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
