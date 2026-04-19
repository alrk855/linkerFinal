import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-guard";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import {
  getProfileByUsername,
  getStudentProfileByProfileId,
  getStudentSkillsDetailed,
  getCompanyByProfileId,
} from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  return withErrorHandling(async () => {
    const { username } = params;
    const { user, profile: viewerProfile, supabase } = await requireAuth(request);

    const profile = await getProfileByUsername(supabase, username);
    if (!profile) {
      throw new ApiError(404, "NOT_FOUND", "Profile not found.");
    }

    const isOwner = profile.id === user.id;
    const viewerIsCompany = viewerProfile.role === "company";

    if (profile.role === "student") {
      const studentProfile = await getStudentProfileByProfileId(supabase, profile.id);
      const skills = await getStudentSkillsDetailed(supabase, profile.id);

      // Check if viewer's company has an accepted acknowledgment for this student
      let emailRevealed = isOwner;
      if (!isOwner && viewerIsCompany) {
        const { data: ack } = await supabase
          .from("acknowledgments")
          .select("id")
          .eq("student_profile_id", profile.id)
          .eq("status", "accepted")
          .maybeSingle();
        emailRevealed = Boolean(ack);
      }

      return NextResponse.json({
        profile: {
          id: profile.id,
          username: emailRevealed ? profile.username : null,
          full_name: emailRevealed ? profile.full_name : null,
          avatar_url: emailRevealed ? profile.avatar_url : null,
          bio: profile.bio,
          role: profile.role,
          is_verified_student: profile.is_verified_student,
          profile_completeness: profile.profile_completeness,
          github_url: emailRevealed ? profile.github_url : null,
          linkedin_url: emailRevealed ? profile.linkedin_url : null,
          portfolio_url: emailRevealed ? profile.portfolio_url : null,
          student_profile: studentProfile,
          skills: (skills || []).map((s: any) => ({
            id: s.skills?.id,
            name: s.skills?.name,
            slug: s.skills?.slug,
          })),
          email_revealed: emailRevealed,
          is_owner: isOwner,
        },
      });
    }

    if (profile.role === "company") {
      const companyProfile = await getCompanyByProfileId(supabase, profile.id);

      const { data: activeListings } = await supabase
        .from("listings")
        .select("id, title, listing_type, focus_area, experience_level, slots_remaining, created_at, listing_skills(skill_id, skills(id, name, slug))")
        .eq("company_profile_id", companyProfile?.id || "")
        .eq("is_active", true)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(10);

      return NextResponse.json({
        profile: {
          id: profile.id,
          username: profile.username,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          role: profile.role,
          website_url: profile.website_url,
          company_profile: companyProfile,
          active_listings: activeListings || [],
          is_owner: isOwner,
        },
      });
    }

    return NextResponse.json({ profile: { ...profile, is_owner: isOwner } });
  });
}
