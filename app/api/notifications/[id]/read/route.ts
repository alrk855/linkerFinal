import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-guard";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { uuidSchema } from "@/lib/api/validate";

type RouteParams = {
  params: {
    id: string;
  };
};

function parseNotificationId(value: string): string {
  const parsed = uuidSchema.safeParse(value);
  if (!parsed.success) {
    throw new ApiError(400, "VALIDATION_ERROR", "Invalid notification ID.");
  }

  return parsed.data;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = params;
    const notificationId = parseNotificationId(id);

    const { user, supabase } = await requireAuth(request);

    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("recipient_id", user.id)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new ApiError(500, "DB_ERROR", "Failed to update notification.");
    }

    if (!data) {
      throw new ApiError(404, "NOT_FOUND", "Notification not found.");
    }

    return NextResponse.json({
      success: true,
      notification: data,
    });
  });
}
