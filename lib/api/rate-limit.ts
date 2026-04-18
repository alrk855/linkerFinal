import type { NextRequest } from "next/server";
import { ApiError } from "@/lib/api/errors";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitBucket>();

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}

export function enforceRateLimit(options: {
  key: string;
  limit: number;
  windowMs: number;
  code?: string;
  message?: string;
}): void {
  const now = Date.now();
  const existing = rateLimitStore.get(options.key);

  if (!existing || now > existing.resetAt) {
    rateLimitStore.set(options.key, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return;
  }

  if (existing.count >= options.limit) {
    throw new ApiError(
      429,
      options.code || "RATE_LIMITED",
      options.message || "Too many requests. Please try again later."
    );
  }

  existing.count += 1;
  rateLimitStore.set(options.key, existing);
}
