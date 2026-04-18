import { NextRequest, NextResponse } from "next/server";
import { requireApprovedCompany } from "@/lib/api/auth-guard";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { parseQuery, discoverStudentsQuerySchema } from "@/lib/api/validate";
import { getAnonymousStudentCard } from "@/lib/supabase/queries";

function computeSkillMatchScore(skillSlugs: string[], studentSkillSlugs: string[]): number {
  if (skillSlugs.length === 0) {
    return 0;
  }

  const normalizedStudentSkills = new Set(studentSkillSlugs.map((slug) => slug.toLowerCase()));
  const matchedCount = skillSlugs.filter((slug) => normalizedStudentSkills.has(slug.toLowerCase())).length;

  return Math.round((matchedCount / skillSlugs.length) * 100);
}

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { supabase, companyProfile } = await requireApprovedCompany(request);
    const filters = parseQuery(request, discoverStudentsQuerySchema);

    const skillSlugs = (filters.skill_slugs || "")
      .split(",")
      .map((slug) => slug.trim())
      .filter(Boolean);

    const { data: alreadyAcknowledged, error: acknowledgedError } = await supabase
      .from("acknowledgments")
      .select("student_profile_id")
      .eq("company_profile_id", companyProfile.id);

    if (acknowledgedError) {
      throw new ApiError(500, "DB_ERROR", "Failed to load acknowledged students.");
    }

    const excludedStudentIds = new Set(
      (alreadyAcknowledged || []).map((row) => row.student_profile_id)
    );

    const { data: candidateProfiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, created_at, profile_completeness")
      .eq("role", "student")
      .eq("is_verified_student", true)
      .gte("profile_completeness", 40);

    if (profileError) {
      throw new ApiError(500, "DB_ERROR", "Failed to load candidate profiles.");
    }

    const candidateIds = (candidateProfiles || [])
      .map((profile) => profile.id)
      .filter((profileId) => !excludedStudentIds.has(profileId));

    if (candidateIds.length === 0) {
      return NextResponse.json({
        students: [],
        page: filters.page,
        limit: filters.limit,
        total: 0,
      });
    }

    let studentQuery = supabase
      .from("student_profiles")
      .select(
        "profile_id, faculty, year_of_study, degree_type, experience_level, focus_area, short_description, created_at"
      )
      .in("profile_id", candidateIds);

    if (filters.focus_area) {
      studentQuery = studentQuery.eq("focus_area", filters.focus_area);
    }

    if (filters.experience_level) {
      studentQuery = studentQuery.eq("experience_level", filters.experience_level);
    }

    if (filters.faculty) {
      studentQuery = studentQuery.eq("faculty", filters.faculty);
    }

    const { data: studentRows, error: studentError } = await studentQuery;

    if (studentError) {
      throw new ApiError(500, "DB_ERROR", "Failed to load student profile filters.");
    }

    const filteredStudentIds = (studentRows || []).map((row) => row.profile_id);
    if (filteredStudentIds.length === 0) {
      return NextResponse.json({
        students: [],
        page: filters.page,
        limit: filters.limit,
        total: 0,
      });
    }

    const { data: studentSkillRows, error: studentSkillError } = await supabase
      .from("student_skills")
      .select("profile_id, skills!inner(slug)")
      .in("profile_id", filteredStudentIds);

    if (studentSkillError) {
      throw new ApiError(500, "DB_ERROR", "Failed to load student skill filters.");
    }

    const skillMap = new Map<string, string[]>();
    for (const row of studentSkillRows || []) {
      const existing = skillMap.get(row.profile_id) || [];
      const skill = Array.isArray(row.skills) ? row.skills[0] : row.skills;
      if (skill?.slug) {
        existing.push(skill.slug);
      }
      skillMap.set(row.profile_id, existing);
    }

    const profileMap = new Map((candidateProfiles || []).map((profile) => [profile.id, profile]));

    const scored = (studentRows || [])
      .map((row) => {
        const profile = profileMap.get(row.profile_id);
        const studentSkills = skillMap.get(row.profile_id) || [];
        const skillMatchScore = computeSkillMatchScore(skillSlugs, studentSkills);

        return {
          row,
          profile,
          skillMatchScore,
        };
      })
      .filter((entry) => {
        if (skillSlugs.length === 0) {
          return true;
        }

        return entry.skillMatchScore > 0;
      });

    scored.sort((a, b) => {
      if (skillSlugs.length > 0) {
        return b.skillMatchScore - a.skillMatchScore;
      }

      const aCreatedAt = a.profile?.created_at ? new Date(a.profile.created_at).getTime() : 0;
      const bCreatedAt = b.profile?.created_at ? new Date(b.profile.created_at).getTime() : 0;
      return bCreatedAt - aCreatedAt;
    });

    const total = scored.length;
    const offset = (filters.page - 1) * filters.limit;
    const pageSlice = scored.slice(offset, offset + filters.limit);

    const students = await Promise.all(
      pageSlice.map(async (entry) => {
        const card = await getAnonymousStudentCard(supabase, entry.row.profile_id);

        return {
          profile_id: entry.row.profile_id,
          skill_match_score: skillSlugs.length > 0 ? entry.skillMatchScore : null,
          card,
        };
      })
    );

    return NextResponse.json({
      students,
      page: filters.page,
      limit: filters.limit,
      total,
    });
  });
}
