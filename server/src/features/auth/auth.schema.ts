import { z } from 'zod';

const name = (label: string) =>
  z
    .string()
    .trim()
    .min(2, `${label} must be at least 2 characters`)
    .max(80, `${label} must be 80 characters or fewer`)
    .regex(/^[\p{L}][\p{L}\s'-]*$/u, `${label} can only contain letters, spaces, ' and -`);

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Email address is required')
  .max(255, 'Email address is too long')
  .email('Enter a valid email address');

// bcrypt silently ignores anything past 72 bytes, so cap the length rather than
// letting a longer password be truncated without the user knowing.
const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be 72 characters or fewer')
  .regex(/[A-Za-z]/, 'Password must contain at least one letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const registerSchema = z
  .object({
    firstName: name('First name'),
    lastName: name('Last name'),
    email,
    countryCode: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{2}$/, 'Select a country'),
    phoneNumber: z
      .string()
      .trim()
      .regex(/^\+?[0-9]{6,19}$/, 'Enter a valid phone number'),
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
