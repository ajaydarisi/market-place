import { z } from 'zod';
import {
    insertProfileSchema,
    insertProjectSchema,
    insertUserSchema,
    logTypes,
    projectStatuses,
    type AdminAuditLog,
    type AdminStats,
    type Message,
    type Profile,
    type Project,
    type ProjectInterest,
    type ProjectLog,
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
      input: insertProfileSchema.partial(),
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
      }).optional(),
      responses: {
        200: z.array(z.custom<Project & { client: { id: string, email: string, firstName: string | null, lastName: string | null, profileImageUrl: string | null, createdAt?: Date } }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/projects/:id',
      responses: {
        200: z.custom<Project & { client: { id: string, email: string, firstName: string | null, lastName: string | null, profileImageUrl: string | null, createdAt?: Date } }>(),
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
      input: insertProjectSchema.partial().extend({ status: z.enum(["open", "in_progress", "completed", "cancelled"]).optional() }),
      responses: {
        200: z.custom<Project>(),
        401: errorSchemas.unauthorized,
        403: z.object({ message: z.string() }), // Forbidden (not owner)
        404: errorSchemas.notFound,
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
  },
  interests: {
    create: {
      method: 'POST' as const,
      path: '/api/projects/:projectId/interests',
      input: z.object({ message: z.string() }),
      responses: {
        201: z.custom<ProjectInterest>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    listByProject: {
      method: 'GET' as const,
      path: '/api/projects/:projectId/interests',
      responses: {
        200: z.array(z.custom<ProjectInterest & { developer: { id: string, email: string, firstName: string | null, lastName: string | null, profileImageUrl: string | null } }>()),
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
        200: z.array(z.any()),
        401: errorSchemas.unauthorized,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/projects/:projectId/messages',
      responses: {
        200: z.array(z.custom<Message & { sender: { id: string, firstName: string | null } }>()),
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
        input: insertProjectSchema.partial().extend({
          status: z.enum(projectStatuses).optional(),
        }),
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
