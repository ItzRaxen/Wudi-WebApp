import { z } from 'zod';
import { PRIORITIES } from '../constants/app.js';

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(120, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional().or(z.literal('')),
  priority: z.enum(PRIORITIES),
  deadline: z.string().optional().or(z.literal('')),
  teamId: z.string().optional().or(z.number()).or(z.literal('')),
  assignedEmails: z.array(z.string().email()).optional().default([]),
  isCompleted: z.boolean().optional().default(false),
});
