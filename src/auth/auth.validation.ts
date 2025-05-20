import { z, ZodType } from 'zod';

export class AuthValidation {
  static readonly REGISTER: ZodType = z.object({
    email: z.string().email(),
    password: z.string().min(1).max(100),
    fullName: z.string().min(1).max(100),
    referralCodeUsed: z.string().optional(),
    profilePicture: z.string().min(1),
    phoneNumber: z
      .string()
      .regex(/^\d+$/, { message: 'please enter only number' }),
  });

  static readonly LOGIN: ZodType = z.object({
    email: z.string().email(),
    password: z.string().min(1).max(100),
  });

  // static readonly UPDATE: ZodType = z.object({
  //   name: z.string().min(1).max(100).optional(),
  //   password: z.string().min(1).max(100).optional(),
  // });
}
