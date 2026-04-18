import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-guard";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
  return withErrorHandling(async () => {
    const { user, supabase } = await requireAuth(request);

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("recipient_id", user.id)
      .eq("is_read", false);

    if (error) {
      throw new ApiError(500, "DB_ERROR", "Failed to update notifications.");
    }

    return NextResponse.json({ success: true });
  });
}
