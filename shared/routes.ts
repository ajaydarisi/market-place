import { z } from 'zod';
import {
    insertProfileSchema,
    insertProjectSchema,
    insertUserSchema,
    type Message,
    type Profile,
    type Project,
    type ProjectInterest,
    type User
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
        200: z.array(z.custom<Project & { client: { id: string, email: string, firstName: string | null, lastName: string | null } }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/projects/:id',
      responses: {
        200: z.custom<Project & { client: { id: string, email: string, firstName: string | null, lastName: string | null } }>(),
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
        200: z.array(z.custom<ProjectInterest & { developer: { id: string, email: string, firstName: string | null, lastName: string | null } }>()),
        401: errorSchemas.unauthorized,
      },
    },
  },
  messages: {
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
