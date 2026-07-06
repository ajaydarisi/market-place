"use client";

import { useMutation } from "@tanstack/react-query";

import { api, buildUrl } from "@shared/routes";
import type {
  CodeReviewResponse,
  MatchRationaleResponse,
  PostImprovementResponse,
  ProfileOptimizationResponse,
  ProjectDraft,
  ProposalDraftResponse,
  ScopeOfWorkResponse,
  StackAdviceResponse,
} from "@shared/schema";
import { authFetch } from "@/lib/api";

async function parseOrThrow<T>(res: Response, parse: (data: unknown) => T): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "AI request failed");
  }
  return parse(await res.json());
}

export function useImprovePost() {
  return useMutation({
    // These render their own inline error UI; opt out of the global error toast.
    meta: { suppressGlobalError: true },
    mutationFn: async (post: ProjectDraft): Promise<PostImprovementResponse> => {
      const res = await authFetch(api.ai.improvePost.path, {
        method: api.ai.improvePost.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post),
      });
      return parseOrThrow(res, (data) => api.ai.improvePost.responses[200].parse(data));
    },
  });
}

export function useMatchRationale() {
  return useMutation({
    // These render their own inline error UI; opt out of the global error toast.
    meta: { suppressGlobalError: true },
    mutationFn: async ({ projectId, interestId }: { projectId: number; interestId?: number }): Promise<MatchRationaleResponse> => {
      const url = buildUrl(api.ai.matchRationale.path, { projectId })
        + (interestId ? `?interestId=${interestId}` : "");
      const res = await authFetch(url);
      return parseOrThrow(res, (data) => api.ai.matchRationale.responses[200].parse(data));
    },
  });
}

export function useProposalDraft() {
  return useMutation({
    // These render their own inline error UI; opt out of the global error toast.
    meta: { suppressGlobalError: true },
    mutationFn: async (projectId: number): Promise<ProposalDraftResponse> => {
      const res = await authFetch(buildUrl(api.ai.proposalDraft.path, { projectId }), {
        method: api.ai.proposalDraft.method,
      });
      return parseOrThrow(res, (data) => api.ai.proposalDraft.responses[200].parse(data));
    },
  });
}

export function useScopeOfWork() {
  return useMutation({
    // These render their own inline error UI; opt out of the global error toast.
    meta: { suppressGlobalError: true },
    mutationFn: async (projectId: number): Promise<ScopeOfWorkResponse> => {
      const res = await authFetch(buildUrl(api.ai.scopeOfWork.path, { projectId }), {
        method: api.ai.scopeOfWork.method,
      });
      return parseOrThrow(res, (data) => api.ai.scopeOfWork.responses[200].parse(data));
    },
  });
}

export function useStackAdvice() {
  return useMutation({
    // These render their own inline error UI; opt out of the global error toast.
    meta: { suppressGlobalError: true },
    mutationFn: async (projectId: number): Promise<StackAdviceResponse> => {
      const res = await authFetch(buildUrl(api.ai.stackAdvice.path, { projectId }), {
        method: api.ai.stackAdvice.method,
      });
      return parseOrThrow(res, (data) => api.ai.stackAdvice.responses[200].parse(data));
    },
  });
}

export function useOptimizeProfile() {
  return useMutation({
    // These render their own inline error UI; opt out of the global error toast.
    meta: { suppressGlobalError: true },
    mutationFn: async (): Promise<ProfileOptimizationResponse> => {
      const res = await authFetch(api.ai.optimizeProfile.path, {
        method: api.ai.optimizeProfile.method,
      });
      return parseOrThrow(res, (data) => api.ai.optimizeProfile.responses[200].parse(data));
    },
  });
}

export function useCodeReview() {
  return useMutation({
    // These render their own inline error UI; opt out of the global error toast.
    meta: { suppressGlobalError: true },
    mutationFn: async ({ projectId, submission }: { projectId: number; submission: string }): Promise<CodeReviewResponse> => {
      const res = await authFetch(buildUrl(api.ai.codeReview.path, { projectId }), {
        method: api.ai.codeReview.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submission }),
      });
      return parseOrThrow(res, (data) => api.ai.codeReview.responses[200].parse(data));
    },
  });
}
