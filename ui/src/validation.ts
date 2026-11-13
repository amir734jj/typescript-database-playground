import { z } from "zod";

function requiredText(label: string, maximum: number) {
  return z
    .string({ error: `${label} is required.` })
    .trim()
    .min(1, `${label} is required.`)
    .refine((value) => [...value].length <= maximum, {
      error: `${label} must be ${maximum} characters or fewer.`,
    });
}

const email = z
  .string({ error: "Email is required." })
  .trim()
  .toLowerCase()
  .max(254, "Email must be 254 characters or fewer.")
  .pipe(z.email({ error: "Enter a valid email address." }));

const password = z
  .string({ error: "Password is required." })
  .refine((value) => [...value].length >= 12, {
    error: "Password must contain at least 12 characters.",
  })
  .refine((value) => new TextEncoder().encode(value).length <= 72, {
    error: "Password must not exceed 72 UTF-8 bytes.",
  });

const age = z
  .string({ error: "Age is required." })
  .trim()
  .min(1, "Age is required.")
  .pipe(
    z.coerce
      .number<string>({ error: "Enter a valid age." })
      .int("Age must be a whole number.")
      .min(0, "Age must be between 0 and 130.")
      .max(130, "Age must be between 0 and 130."),
  );

export const loginSchema = z.object({ email, password });

export const profileSchema = z.object({
  name: requiredText("Name", 100),
  age,
  email,
});

export const registerSchema = profileSchema.extend({ password });

export const projectSchema = z.object({
  name: requiredText("Project name", 200),
  description: z
    .string()
    .trim()
    .refine((value) => [...value].length <= 2000, {
      error: "Description must be 2000 characters or fewer.",
    })
    .transform((value) => value || null),
});
