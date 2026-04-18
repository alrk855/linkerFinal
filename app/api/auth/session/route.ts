import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withErrorHandling } from "@/lib/api/errors";
import { getProfileById } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  return withErrorHandling(async () => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        user: null,
        role: "guest",
        is_verified_student: false,
        profile_completeness: 0,
      });
    }

    const profile = await getProfileById(supabase, user.id).catch(() => null);

    if (!profile) {
      return NextResponse.json({
        user: null,
        role: "guest",
        is_verified_student: false,
        profile_completeness: 0,
      });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: profile.username,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        role: profile.role,
        is_verified_student: profile.is_verified_student,
        profile_completeness: profile.profile_completeness,
      },
      role: profile.role,
      is_verified_student: profile.is_verified_student ?? false,
      profile_completeness: profile.profile_completeness ?? 0,
    });
  });
}
