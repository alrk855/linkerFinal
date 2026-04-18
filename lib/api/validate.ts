import { z } from "zod";
import { ApiError } from "@/lib/api/errors";

const optionalTrimmedString = (max: number) =>
  z.preprocess(
    (value) => {
      if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed === "" ? null : trimmed;
      }
      return value;
    },
    z.string().max(max).nullable().optional()
  );

const optionalUrl = z.preprocess(
  (value) => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed === "" ? null : trimmed;
    }
    return value;
  },
  z.string().url().nullable().optional()
);

export const usernameSchema = z
  .string()
  .trim()
  .regex(/^[a-zA-Z0-9_]{3,20}$/, "Username must be 3-20 chars and contain only letters, numbers, underscores.");

export const emailSchema = z.string().trim().email();
export const passwordSchema = z.string().min(8);
export const uuidSchema = z.string().uuid();

export const profileRoleSchema = z.enum(["student", "company"]);
export const experienceLevelSchema = z.enum([
  "no_experience",
  "junior",
  "mid",
  "senior",
]);
export const focusAreaSchema = z.enum([
  "frontend",
  "backend",
  "fullstack",
  "mobile",
  "devops",
  "data",
  "other",
]);
export const listingTypeSchema = z.enum([
  "internship",
  "part_time",
  "full_time",
]);
export const degreeTypeSchema = z.enum(["bachelor", "master", "phd"]);
export const companySizeRangeSchema = z.enum([
  "1-10",
  "11-50",
  "51-200",
  "201-1000",
  "1000+",
]);

export const signupBodySchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: profileRoleSchema,
  full_name: z.string().trim().min(2).max(120),
});

export const signinBodySchema = z.object({
  identifier: z.string().trim().min(3).max(120),
  password: passwordSchema,
});

export const verifyStudentInitiateSchema = z.object({
  redirect_to: z.string().url().optional(),
});

export const profileUpdateBodySchema = z
  .object({
    full_name: optionalTrimmedString(120),
    bio: optionalTrimmedString(2000),
    github_url: optionalUrl,
    linkedin_url: optionalUrl,
    portfolio_url: optionalUrl,
    website_url: optionalUrl,
    phone: optionalTrimmedString(40),

    faculty: optionalTrimmedString(150),
    year_of_study: z.number().int().min(1).max(7).nullable().optional(),
    degree_type: degreeTypeSchema.nullable().optional(),
    graduation_year: z.number().int().min(2000).max(2100).nullable().optional(),
    experience_level: experienceLevelSchema.nullable().optional(),
    focus_area: focusAreaSchema.nullable().optional(),
    short_description: optionalTrimmedString(500),

    company_name: optionalTrimmedString(150),
    company_description: optionalTrimmedString(5000),
    company_website: optionalUrl,
    industry: optionalTrimmedString(120),
    size_range: companySizeRangeSchema.nullable().optional(),
    location: optionalTrimmedString(150),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided.",
  });

export const profileSkillsBodySchema = z.object({
  skill_ids: z.array(uuidSchema).max(20),
});

export const listingCreateBodySchema = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(10).max(5000),
  listing_type: listingTypeSchema,
  focus_area: focusAreaSchema.nullable().optional(),
  experience_level: experienceLevelSchema.nullable().optional(),
  total_slots: z.number().int().min(1).max(20),
  skill_ids: z.array(uuidSchema).max(30).default([]),
});

export const listingUpdateBodySchema = z
  .object({
    title: z.string().trim().min(3).max(150).optional(),
    description: z.string().trim().min(10).max(5000).optional(),
    is_active: z.boolean().optional(),
    skill_ids: z.array(uuidSchema).max(30).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided.",
  });

export const acknowledgmentsCreateBodySchema = z.object({
  listing_id: uuidSchema,
  student_profile_id: uuidSchema,
});

export const acknowledgmentsUpdateBodySchema = z.object({
  status: z.enum(["accepted", "declined"]),
});

export const applicationsCreateBodySchema = z.object({
  listing_id: uuidSchema,
  cover_note: z.string().trim().max(5000).optional(),
});

export const applicationsUpdateBodySchema = z.object({
  status: z.enum(["reviewed", "acknowledged", "rejected"]),
});

export const subscriptionsCreateBodySchema = z.object({
  company_profile_id: uuidSchema,
});

export const adminAuthBodySchema = z.object({
  master_password: z.string().min(1),
  google_id_token: z.string().min(1),
});

export const adminRejectBodySchema = z.object({
  reason: z.string().trim().min(3).max(1000),
});

export const listingFiltersQuerySchema = z.object({
  focus_area: focusAreaSchema.optional(),
  experience_level: experienceLevelSchema.optional(),
  skill_slugs: z.string().optional(),
  type: listingTypeSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const discoverStudentsQuerySchema = z.object({
  focus_area: focusAreaSchema.optional(),
  experience_level: experienceLevelSchema.optional(),
  skill_slugs: z.string().optional(),
  faculty: z.string().trim().max(150).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export function parseQuery<T extends z.ZodTypeAny>(
  request: Request,
  schema: T
): z.infer<T> {
  const url = new URL(request.url);
  const rawQuery = Object.fromEntries(url.searchParams.entries());
  const parsed = schema.safeParse(rawQuery);

  if (!parsed.success) {
    throw new ApiError(400, "VALIDATION_ERROR", "Invalid query parameters.", {
      issues: parsed.error.flatten(),
    });
  }

  return parsed.data;
}

export async function parseJsonBody<T extends z.ZodTypeAny>(
  request: Request,
  schema: T
): Promise<z.infer<T>> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    throw new ApiError(400, "VALIDATION_ERROR", "Invalid JSON body.");
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body.", {
      issues: parsed.error.flatten(),
    });
  }

  return parsed.data;
}
