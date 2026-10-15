import { z } from 'zod';

const emailSchema = z.string().trim().email();
const passwordSchema = z.string().min(6).max(100);

const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1).max(100),
  }),
});

const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1).optional(),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1).max(100),
    newPassword: passwordSchema,
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    newPassword: passwordSchema,
  }),
});

export const authValidation = {
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
