import { z } from 'zod';

// Mirrors the server rules so the user is corrected before a request is sent.
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

const nameField = (label: string) =>
  z
    .string()
    .trim()
    .min(2, `${label} must be at least 2 characters`)
    .max(80, `${label} must be 80 characters or fewer`)
    .regex(/^[\p{L}][\p{L}\s'-]*$/u, `${label} can only contain letters`);

export const registerSchema = z
  .object({
    firstName: nameField('First name'),
    lastName: nameField('Last name'),
    email: z
      .string()
      .trim()
      .min(1, 'Email address is required')
      .email('Enter a valid email address'),
    countryCode: z.string().regex(/^[A-Z]{2}$/, 'Select a country'),
    phoneNumber: z
      .string()
      .trim()
      .regex(/^\+?[0-9]{6,19}$/, 'Enter a valid phone number'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be 72 characters or fewer')
      .regex(/[A-Za-z]/, 'Password must contain at least one letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
