import { z } from 'zod';

// import { isValidPhoneNumber } from 'react-phone-number-input';

// export const phoneSchema = z
//   .string()
//   .refine((val) => !val || isValidPhoneNumber(val), {
//     message: 'Invalid phone number',
//   });

export const userProfileSchema = z.object({
  username: z.string(),
  email: z.string().email({ message: 'Invalid email address' }),
  first_name: z.string().min(1, 'First name is required'),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, 'Last name is required'),
//   phone_number: phoneSchema.optional(),
//   profile_image: z.any().optional(),
});

export type UserProfileForm = z.infer<typeof userProfileSchema>;

export const ChangePasswordSchema = z
  .object({
    oldPassword: z.string().nonempty('Current password is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().nonempty('Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ChangePasswordForm = z.infer<typeof ChangePasswordSchema>;

