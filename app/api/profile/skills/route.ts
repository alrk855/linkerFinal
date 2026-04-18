import { NextRequest, NextResponse } from "next/server";
import { requireVerifiedStudent } from "@/lib/api/auth-guard";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { parseJsonBody, profileSkillsBodySchema } from "@/lib/api/validate";
import { getStudentSkillsDetailed, validateSkillIds } from "@/lib/supabase/queries";

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const { user, supabase } = await requireVerifiedStudent(request);
    const payload = await parseJsonBody(request, profileSkillsBodySchema);

    const uniqueSkillIds = Array.from(new Set(payload.skill_ids));
    await validateSkillIds(supabase, uniqueSkillIds);

    const { error: deleteError } = await supabase
      .from("student_skills")
      .delete()
      .eq("profile_id", user.id);

    if (deleteError) {
      throw new ApiError(500, "DB_ERROR", "Failed to replace skill set.");
    }

    if (uniqueSkillIds.length > 0) {
      const { error: insertError } = await supabase.from("student_skills").insert(
        uniqueSkillIds.map((skillId) => ({
          profile_id: user.id,
          skill_id: skillId,
        }))
      );

      if (insertError) {
        throw new ApiError(500, "DB_ERROR", "Failed to save student skills.");
      }
    }

    const skills = await getStudentSkillsDetailed(supabase, user.id);
    return NextResponse.json({
      success: true,
      skills: skills || [],
    });
  });
}
