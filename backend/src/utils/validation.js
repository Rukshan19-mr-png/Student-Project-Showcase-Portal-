import { z } from 'zod';

export const uuidSchema = z.uuid();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const validateParams = (schema, params) => {
  const result = schema.safeParse(params);
  if (!result.success) {
    const error = new Error('Invalid request parameters.');
    error.statusCode = 400;
    error.details = formatZodIssues(result.error);
    throw error;
  }
  return result.data;
};

export const validateBody = (schema, body) => {
  const result = schema.safeParse(body);
  if (!result.success) {
    const error = new Error('Validation failed.');
    error.statusCode = 400;
    error.details = formatZodIssues(result.error);
    throw error;
  }
  return result.data;
};

export const formatZodIssues = (error) => error.issues.map((issue) => ({
  field: issue.path.join('.'),
  message: issue.message,
}));
