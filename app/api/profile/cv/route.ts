import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-guard";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
export const dynamic = "force-dynamic";

const CV_MAX_SIZE = 10 * 1024 * 1024;
const CV_MIME_TYPE = "application/pdf";

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const { user, supabase } = await requireAuth(request);

    const formData = await request.formData();
    const uploaded = formData.get("file");

    if (!(uploaded instanceof File)) {
      throw new ApiError(400, "VALIDATION_ERROR", "CV file is required.");
    }

    if (uploaded.type !== CV_MIME_TYPE) {
      throw new ApiError(400, "VALIDATION_ERROR", "CV must be a PDF file.");
    }

    if (uploaded.size > CV_MAX_SIZE) {
      throw new ApiError(400, "VALIDATION_ERROR", "CV must be at most 10MB.");
    }

    const objectPath = `${user.id}/cv.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("cvs")
      .upload(objectPath, uploaded, {
        contentType: uploaded.type,
        upsert: true,
      });

    if (uploadError) {
      throw new ApiError(500, "STORAGE_ERROR", "Failed to upload CV.");
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ cv_url: objectPath })
      .eq("id", user.id);

    if (updateError) {
      throw new ApiError(500, "DB_ERROR", "Failed to update CV URL.");
    }

    const { data: signedUrlData } = await supabase.storage
      .from("cvs")
      .createSignedUrl(objectPath, 60 * 60);

    return NextResponse.json({
      success: true,
      cv_url: signedUrlData?.signedUrl || objectPath,
      storage_path: objectPath,
    });
  });
}
