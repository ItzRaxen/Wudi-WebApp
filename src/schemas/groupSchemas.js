import { z } from 'zod';

export const groupSchema = z.object({
  name: z.string().min(2, 'Group name is required').max(80, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').optional().or(z.literal('')),
  maxMembers: z.coerce.number().min(2).max(100).optional(),
  memberEmailsText: z.string().optional().or(z.literal('')),
});
