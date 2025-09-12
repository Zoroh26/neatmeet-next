import { z } from 'zod';

export const bookingSchema = z
  .object({
    roomId: z.string().min(1, 'Room is required'),
    startTime: z.date(),
    endTime: z.date(),
    description: z.string().min(1, 'Purpose is required'),
  })
  .superRefine((data, ctx) => {
    if (data.endTime <= data.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End time must be after start time',
        path: ['endTime'],
      });
    }
  });

export type BookingFormType = z.infer<typeof bookingSchema>;
