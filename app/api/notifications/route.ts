import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-guard";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { user, supabase } = await requireAuth(request);

    const [{ data: notifications, error: notificationsError }, { count: unreadCount, error: unreadError }] =
      await Promise.all([
        supabase
          .from("notifications")
          .select("*")
          .eq("recipient_id", user.id)
          .order("created_at", { ascending: false })
          .limit(30),
        supabase
          .from("notifications")
          .select("id", { head: true, count: "exact" })
          .eq("recipient_id", user.id)
          .eq("is_read", false),
      ]);

    if (notificationsError || unreadError) {
      throw new ApiError(500, "DB_ERROR", "Failed to load notifications.");
    }

    return NextResponse.json({
      notifications: notifications || [],
      unread_count: unreadCount || 0,
    });
  });
}
