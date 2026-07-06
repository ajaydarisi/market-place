import { z } from 'zod';
import {
    codeReviewResponseSchema,
    conversationSummarySchema,
    engagementTypes,
    experienceLevels,
    insertProfileSchema,
    updateProfileSchema,
    insertProjectSchema,
    insertReviewSchema,
    insertUserSchema,
    logTypes,
    matchRationaleResponseSchema,
    postImprovementResponseSchema,
    profileOptimizationResponseSchema,
    projectDraftResponseSchema,
    projectDraftSchema,
    projectTypes,
    proposalDraftResponseSchema,
    scopeOfWorkResponseSchema,
    stackAdviceResponseSchema,
    proposalSortOptions,
    proposalScreeningAnswerSchema,
    scopeSizes,
    projectStatuses,
    reviewWithUsersSchema,
    teamPreferences,
    updateProjectSchema,
    type AdminAuditLog,
    type AdminStats,
    type ConversationSummary,
    type Message,
    type Notification,
    type Profile,
    type Project,
    type ProjectInterest,
    type ProjectLog,
    type ReviewWithUsers,
    type User,
    type UserWithProfile
} from './schema';

// Export all types from schema for client usage
export * from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  users: {
    get: {
      method: 'GET' as const,
      path: '/api/users/:userId',
      responses: {
        200: z.custom<User>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/users', // Updates current user's data
      input: insertUserSchema.partial(),
      responses: {
        200: z.custom<User>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  profiles: {
    get: {
      method: 'GET' as const,
      path: '/api/profiles/:userId',
      responses: {
        200: z.custom<Profile>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/profiles', // Updates current user's profile
      input: updateProfileSchema,
      responses: {
        200: z.custom<Profile>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  projects: {
    list: {
      method: 'GET' as const,
      path: '/api/projects',
      input: z.object({
        category: z.string().optional(),
        minBudget: z.coerce.number().optional(),
        maxBudget: z.coerce.number().optional(),
        search: z.string().optional(),
        status: z.enum(projectStatuses).optional(),
        requiredSkills: z.array(z.string()).optional(),
        technologyTags: z.array(z.string()).optional(),
        preferredExperienceLevel: z.enum(experienceLevels).optional(),
        projectType: z.enum(projectTypes).optional(),
        scopeSize: z.enum(scopeSizes).optional(),
        teamPreference: z.enum(teamPreferences).optional(),
        sort: z.enum(["newest", "oldest", "budget_high", "budget_low", "recommended"]).optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<Project & { client: User }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/projects/:id',
      responses: {
        200: z.custom<Project & { client: User }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/projects',
      input: insertProjectSchema,
      responses: {
        201: z.custom<Project>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/projects/:id',
      input: updateProjectSchema,
      responses: {
        200: z.custom<Project>(),
        401: errorSchemas.unauthorized,
        403: z.object({ message: z.string() }), // Forbidden (not owner)
        404: errorSchemas.notFound,
      },
    },
    draft: {
      method: 'POST' as const,
      path: '/api/projects/draft',
      input: z.object({
        rawBrief: z.string().min(20),
      }),
      responses: {
        200: projectDraftResponseSchema,
        401: errorSchemas.unauthorized,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/projects/:id',
      responses: {
        200: z.object({ message: z.string() }),
        401: errorSchemas.unauthorized,
        403: z.object({ message: z.string() }),
        404: errorSchemas.notFound,
      },
    },
    requestCompletion: {
      method: 'POST' as const,
      path: '/api/projects/:id/request-completion',
      responses: {
        200: z.object({ message: z.string() }),
        401: errorSchemas.unauthorized,
        403: z.object({ message: z.string() }),
        404: errorSchemas.notFound,
        409: z.object({ message: z.string() }),
      },
    },
  },
  interests: {
    create: {
      method: 'POST' as const,
      path: '/api/projects/:projectId/interests',
      input: z.object({
        message: z.string().min(1),
        proposedBudget: z.coerce.number().positive().optional(),
        estimatedDurationDays: z.coerce.number().int().positive().optional(),
        relevantSkills: z.array(z.string()).optional(),
        screeningAnswers: z.array(proposalScreeningAnswerSchema).optional(),
      }),
      responses: {
        201: z.custom<ProjectInterest>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        409: z.object({ message: z.string() }),
      },
    },
    listByProject: {
      method: 'GET' as const,
      path: '/api/projects/:projectId/interests',
      input: z.object({
        sort: z.enum(proposalSortOptions).optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<ProjectInterest & { developer: User }>()),
        401: errorSchemas.unauthorized,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/projects/:projectId/interests/:interestId',
      input: z.object({ status: z.enum(["accepted", "rejected"]) }),
      responses: {
        200: z.custom<ProjectInterest>(),
        401: errorSchemas.unauthorized,
        403: z.object({ message: z.string() }),
        404: errorSchemas.notFound,
      },
    },
    withdraw: {
      method: 'DELETE' as const,
      path: '/api/projects/:projectId/interests/:interestId',
      responses: {
        200: z.object({ message: z.string() }),
        401: errorSchemas.unauthorized,
        403: z.object({ message: z.string() }),
        404: errorSchemas.notFound,
      },
    },
  },
  projectLogs: {
    list: {
      method: 'GET' as const,
      path: '/api/projects/:projectId/logs',
      responses: {
        200: z.array(z.custom<ProjectLog & { author: User }>()),
        401: errorSchemas.unauthorized,
        403: z.object({ message: z.string() }),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/projects/:projectId/logs',
      input: z.object({
        content: z.string().min(1),
        logType: z.enum(logTypes).optional(),
      }),
      responses: {
        201: z.custom<ProjectLog>(),
        401: errorSchemas.unauthorized,
        403: z.object({ message: z.string() }),
      },
    },
  },
  developer: {
    assignedProjects: {
      method: 'GET' as const,
      path: '/api/developer/projects',
      responses: {
        200: z.array(z.custom<Project & { client: User }>()),
        401: errorSchemas.unauthorized,
      },
    },
  },
  messages: {
    conversations: {
      method: 'GET' as const,
      path: '/api/messages',
      responses: {
        200: z.array(z.custom<ConversationSummary>()).or(z.array(conversationSummarySchema)),
        401: errorSchemas.unauthorized,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/projects/:projectId/messages',
      responses: {
        200: z.array(z.custom<Message & { sender: User }>()),
        401: errorSchemas.unauthorized,
      },
    },
    send: {
      method: 'POST' as const,
      path: '/api/projects/:projectId/messages',
      input: z.object({ content: z.string(), receiverId: z.string() }),
      responses: {
        201: z.custom<Message>(),
        401: errorSchemas.unauthorized,
      },
    },
    markRead: {
      method: 'PATCH' as const,
      path: '/api/projects/:projectId/messages/read',
      responses: {
        200: z.object({ updated: z.number() }),
        401: errorSchemas.unauthorized,
      },
    },
  },
  reviews: {
    listByProject: {
      method: 'GET' as const,
      path: '/api/projects/:projectId/reviews',
      responses: {
        200: z.array(z.custom<ReviewWithUsers>()).or(z.array(reviewWithUsersSchema)),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/projects/:projectId/reviews',
      input: insertReviewSchema.omit({ projectId: true, revieweeId: true }),
      responses: {
        201: z.custom<ReviewWithUsers>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        403: z.object({ message: z.string() }),
        409: z.object({ message: z.string() }),
      },
    },
  },
  notifications: {
    list: {
      method: 'GET' as const,
      path: '/api/notifications',
      responses: {
        200: z.array(z.custom<Notification>()),
        401: errorSchemas.unauthorized,
      },
    },
    markAllRead: {
      method: 'PATCH' as const,
      path: '/api/notifications/read',
      responses: {
        200: z.object({ updated: z.number() }),
        401: errorSchemas.unauthorized,
      },
    },
  },
  // AI features (all require a configured provider; 503 when unavailable)
  ai: {
    improvePost: {
      method: 'POST' as const,
      path: '/api/projects/improve',
      input: projectDraftSchema,
      responses: {
        200: postImprovementResponseSchema,
        401: errorSchemas.unauthorized,
        503: z.object({ message: z.string() }),
      },
    },
    matchRationale: {
      method: 'GET' as const,
      path: '/api/projects/:projectId/match-rationale',
      responses: {
        200: matchRationaleResponseSchema,
        401: errorSchemas.unauthorized,
        503: z.object({ message: z.string() }),
      },
    },
    proposalDraft: {
      method: 'POST' as const,
      path: '/api/projects/:projectId/interests/draft',
      responses: {
        200: proposalDraftResponseSchema,
        401: errorSchemas.unauthorized,
        503: z.object({ message: z.string() }),
      },
    },
    scopeOfWork: {
      method: 'POST' as const,
      path: '/api/projects/:projectId/scope',
      responses: {
        200: scopeOfWorkResponseSchema,
        401: errorSchemas.unauthorized,
        403: z.object({ message: z.string() }),
        503: z.object({ message: z.string() }),
      },
    },
    stackAdvice: {
      method: 'POST' as const,
      path: '/api/projects/:projectId/stack-advice',
      responses: {
        200: stackAdviceResponseSchema,
        401: errorSchemas.unauthorized,
        503: z.object({ message: z.string() }),
      },
    },
    optimizeProfile: {
      method: 'POST' as const,
      path: '/api/profiles/optimize',
      responses: {
        200: profileOptimizationResponseSchema,
        401: errorSchemas.unauthorized,
        503: z.object({ message: z.string() }),
      },
    },
    codeReview: {
      method: 'POST' as const,
      path: '/api/projects/:projectId/review-check',
      input: z.object({ submission: z.string().min(20, "Describe the work or paste a link/diff (min 20 chars)") }),
      responses: {
        200: codeReviewResponseSchema,
        401: errorSchemas.unauthorized,
        403: z.object({ message: z.string() }),
        503: z.object({ message: z.string() }),
      },
    },
  },
  // Admin routes
  admin: {
    stats: {
      method: 'GET' as const,
      path: '/api/admin/stats',
      responses: {
        200: z.custom<AdminStats>(),
        401: errorSchemas.unauthorized,
        403: z.object({ message: z.string() }),
      },
    },
    users: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/users',
        input: z.object({
          role: z.string().optional(),
          search: z.string().optional(),
          page: z.number().optional(),
          pageSize: z.number().optional(),
          includeDeleted: z.boolean().optional(),
        }).optional(),
        responses: {
          200: z.object({
            items: z.array(z.custom<UserWithProfile>()),
            total: z.number(),
          }),
          401: errorSchemas.unauthorized,
          403: z.object({ message: z.string() }),
        },
      },
      get: {
        method: 'GET' as const,
        path: '/api/admin/users/:userId',
        responses: {
          200: z.custom<UserWithProfile>(),
          401: errorSchemas.unauthorized,
          403: z.object({ message: z.string() }),
          404: errorSchemas.notFound,
        },
      },
      update: {
        method: 'PATCH' as const,
        path: '/api/admin/users/:userId',
        input: insertUserSchema.partial(),
        responses: {
          200: z.custom<User>(),
          400: errorSchemas.validation,
          401: errorSchemas.unauthorized,
          403: z.object({ message: z.string() }),
          404: errorSchemas.notFound,
        },
      },
      delete: {
        method: 'DELETE' as const,
        path: '/api/admin/users/:userId',
        responses: {
          200: z.object({ message: z.string() }),
          400: errorSchemas.validation,
          401: errorSchemas.unauthorized,
          403: z.object({ message: z.string() }),
          404: errorSchemas.notFound,
        },
      },
    },
    profiles: {
      get: {
        method: 'GET' as const,
        path: '/api/admin/profiles/:userId',
        responses: {
          200: z.custom<Profile>(),
          401: errorSchemas.unauthorized,
          403: z.object({ message: z.string() }),
          404: errorSchemas.notFound,
        },
      },
      update: {
        method: 'PATCH' as const,
        path: '/api/admin/profiles/:userId',
        input: insertProfileSchema.partial(),
        responses: {
          200: z.custom<Profile>(),
          400: errorSchemas.validation,
          401: errorSchemas.unauthorized,
          403: z.object({ message: z.string() }),
          404: errorSchemas.notFound,
        },
      },
    },
    projects: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/projects',
        input: z.object({
          status: z.string().optional(),
          search: z.string().optional(),
          page: z.number().optional(),
          pageSize: z.number().optional(),
          includeDeleted: z.boolean().optional(),
        }).optional(),
        responses: {
          200: z.object({
            items: z.array(z.custom<Project & { client: User }>()),
            total: z.number(),
          }),
          401: errorSchemas.unauthorized,
          403: z.object({ message: z.string() }),
        },
      },
      get: {
        method: 'GET' as const,
        path: '/api/admin/projects/:id',
        responses: {
          200: z.custom<Project & { client: User }>(),
          401: errorSchemas.unauthorized,
          403: z.object({ message: z.string() }),
          404: errorSchemas.notFound,
        },
      },
      update: {
        method: 'PATCH' as const,
        path: '/api/admin/projects/:id',
        input: updateProjectSchema,
        responses: {
          200: z.custom<Project>(),
          400: errorSchemas.validation,
          401: errorSchemas.unauthorized,
          403: z.object({ message: z.string() }),
          404: errorSchemas.notFound,
        },
      },
      delete: {
        method: 'DELETE' as const,
        path: '/api/admin/projects/:id',
        responses: {
          200: z.object({ message: z.string() }),
          401: errorSchemas.unauthorized,
          403: z.object({ message: z.string() }),
          404: errorSchemas.notFound,
        },
      },
    },
    auditLogs: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/audit-logs',
        input: z.object({
          adminId: z.string().optional(),
          action: z.string().optional(),
          page: z.number().optional(),
          pageSize: z.number().optional(),
        }).optional(),
        responses: {
          200: z.object({
            items: z.array(z.custom<AdminAuditLog>()),
            total: z.number(),
          }),
          401: errorSchemas.unauthorized,
          403: z.object({ message: z.string() }),
        },
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
