import { BankName } from '@prisma/client';
import { z, ZodType } from 'zod';

export class AuthValidation {
  static readonly combinationMsg =
    'The password is combination of uppercase, lowercase, number, and special character';

  static readonly passwordValidation = z
    .string()
    .min(8, { message: 'The password must be at least 8 characters long' })
    .max(32, { message: 'The password must be a maximun 32 characters' })
    .refine((password) => /[A-Z]/.test(password), {
      message: this.combinationMsg,
    })
    .refine((password) => /[a-z]/.test(password), {
      message: this.combinationMsg,
    })
    .refine((password) => /[0-9]/.test(password), {
      message: this.combinationMsg,
    })
    .refine((password) => /[!@#$%^&*]/.test(password), {
      message: this.combinationMsg,
    });

  static readonly emailValidation = z
    .string()
    .min(8, { message: 'The email must be at least 8 characters long' })
    .max(32, { message: 'The email must be a maximun 32 characters' })
    .email({ message: 'Please enter email only' });

  static readonly numberValidation = z
    .string()
    .regex(/^\d+$/, { message: 'Please enter only number' });

  static readonly REGISTER: ZodType = z.object({
    email: this.emailValidation,
    password: this.passwordValidation,
    fullName: z.string().min(1).max(100),
    referralCodeUsed: z.string().optional(),
    profilePicture: z.string().optional(),
    phoneNumber: this.numberValidation,
  });

  static readonly REGISTER_ORGANIZER: ZodType = z.object({
    email: this.emailValidation,
    password: this.passwordValidation,
    name: z.string().min(1).max(100),
    referralCodeUsed: z.string().optional(),
    profilePicture: z.string().optional(),
    phoneNumber: this.numberValidation,
    npwp: this.numberValidation,
    norek: this.numberValidation,
    bankName: z.nativeEnum(BankName, { message: 'Bank name not valid' }),
  });

  static readonly LOGIN: ZodType = z.object({
    email: this.emailValidation,
    password: this.passwordValidation,
  });

  static readonly FORGOT_PASSWORD: ZodType = z.object({
    email: this.emailValidation,
  });

  static readonly RESET_PASSWORD: ZodType = z.object({
    email: this.emailValidation,
  });

  static readonly CHANGE_PASSWORD: ZodType = z.object({
    oldPassword: this.passwordValidation,
    newPassword: this.passwordValidation,
  });
}
