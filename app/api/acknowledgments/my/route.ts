import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-guard";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { getCompanyByProfileId } from "@/lib/supabase/queries";

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { user, profile, supabase } = await requireAuth(request);

    if (profile.role === "student") {
      const { data, error } = await supabase
        .from("acknowledgments")
        .select(
          "*, listings(id, title, listing_type, focus_area, experience_level), company_profiles(id, company_name, logo_url)"
        )
        .eq("student_profile_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw new ApiError(500, "DB_ERROR", "Failed to load acknowledgments.");
      }

      return NextResponse.json({
        role: "student",
        acknowledgments: data || [],
      });
    }

    if (profile.role === "company") {
      const companyProfile = await getCompanyByProfileId(supabase, user.id);
      if (!companyProfile) {
        throw new ApiError(404, "NOT_FOUND", "Company profile not found.");
      }

      const { data, error } = await supabase
        .from("acknowledgments")
        .select(
          "*, listings(id, title, listing_type, focus_area, experience_level), profiles!acknowledgments_student_profile_id_fkey(id, username, full_name, avatar_url)"
        )
        .eq("company_profile_id", companyProfile.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw new ApiError(500, "DB_ERROR", "Failed to load company acknowledgments.");
      }

      const acknowledgmentRows = (data || []) as Array<
        { listing_id: string; listings: unknown } & Record<string, unknown>
      >;

      const grouped = Object.values(
        acknowledgmentRows.reduce<Record<string, { listing: unknown; items: unknown[] }>>(
          (acc, row) => {
            const key = row.listing_id;
            if (!acc[key]) {
              acc[key] = {
                listing: row.listings,
                items: [],
              };
            }

            acc[key].items.push(row);
            return acc;
          },
          {}
        )
      );

      return NextResponse.json({
        role: "company",
        grouped_acknowledgments: grouped,
      });
    }

    return NextResponse.json({
      role: profile.role,
      acknowledgments: [],
    });
  });
}
