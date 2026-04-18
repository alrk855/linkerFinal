import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-guard";
import { ApiError, withErrorHandling } from "@/lib/api/errors";

const AVATAR_MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function extensionFromMimeType(mimeType: string): string {
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  throw new ApiError(400, "VALIDATION_ERROR", "Unsupported avatar file type.");
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const { user, supabase } = await requireAuth(request);

    const formData = await request.formData();
    const uploaded = formData.get("file");

    if (!(uploaded instanceof File)) {
      throw new ApiError(400, "VALIDATION_ERROR", "Avatar file is required.");
    }

    if (!ALLOWED_AVATAR_TYPES.has(uploaded.type)) {
      throw new ApiError(
        400,
        "VALIDATION_ERROR",
        "Avatar must be jpeg, png, or webp."
      );
    }

    if (uploaded.size > AVATAR_MAX_SIZE) {
      throw new ApiError(400, "VALIDATION_ERROR", "Avatar must be at most 5MB.");
    }

    const extension = extensionFromMimeType(uploaded.type);
    const objectPath = `${user.id}/avatar.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(objectPath, uploaded, {
        contentType: uploaded.type,
        upsert: true,
      });

    if (uploadError) {
      throw new ApiError(500, "STORAGE_ERROR", "Failed to upload avatar.");
    }

    const { data: publicData } = supabase.storage.from("avatars").getPublicUrl(objectPath);
    const avatarUrl = publicData.publicUrl;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", user.id);

    if (updateError) {
      throw new ApiError(500, "DB_ERROR", "Failed to update avatar URL.");
    }

    return NextResponse.json({
      success: true,
      avatar_url: avatarUrl,
    });
  });
}
