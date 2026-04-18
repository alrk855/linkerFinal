import { NextRequest, NextResponse } from "next/server";
import { requireApprovedCompany, requireAuth } from "@/lib/api/auth-guard";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import {
  parseJsonBody,
  parseQuery,
  listingCreateBodySchema,
  listingFiltersQuerySchema,
} from "@/lib/api/validate";
import { getListingWithSkills, validateSkillIds } from "@/lib/supabase/queries";

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { supabase } = await requireAuth(request);
    const filters = parseQuery(request, listingFiltersQuerySchema);

    const skillSlugs = (filters.skill_slugs || "")
      .split(",")
      .map((slug) => slug.trim())
      .filter(Boolean);

    let listingIdsBySkill: string[] | null = null;
    if (skillSlugs.length > 0) {
      const { data: matchingSkills, error: skillError } = await supabase
        .from("skills")
        .select("id")
        .in("slug", skillSlugs);

      if (skillError) {
        throw new ApiError(500, "DB_ERROR", "Failed to resolve skill filters.");
      }

      const skillIds = (matchingSkills || []).map((skill) => skill.id);
      if (skillIds.length === 0) {
        return NextResponse.json({ listings: [], page: filters.page, limit: filters.limit, total: 0 });
      }

      const { data: listingSkills, error: listingSkillError } = await supabase
        .from("listing_skills")
        .select("listing_id")
        .in("skill_id", skillIds);

      if (listingSkillError) {
        throw new ApiError(500, "DB_ERROR", "Failed to resolve listing skill matches.");
      }

      listingIdsBySkill = Array.from(new Set((listingSkills || []).map((row) => row.listing_id)));
      if (listingIdsBySkill.length === 0) {
        return NextResponse.json({ listings: [], page: filters.page, limit: filters.limit, total: 0 });
      }
    }

    const offset = (filters.page - 1) * filters.limit;

    let query = supabase
      .from("listings")
      .select(
        "id, company_profile_id, title, description, listing_type, focus_area, experience_level, total_slots, slots_remaining, is_active, is_deleted, created_at, updated_at, company_profiles(id, company_name, logo_url, approval_status), listing_skills(skill_id, skills(id, name, slug))",
        { count: "exact" }
      )
      .eq("is_active", true)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .range(offset, offset + filters.limit - 1);

    if (filters.focus_area) {
      query = query.eq("focus_area", filters.focus_area);
    }

    if (filters.experience_level) {
      query = query.eq("experience_level", filters.experience_level);
    }

    if (filters.type) {
      query = query.eq("listing_type", filters.type);
    }

    if (listingIdsBySkill) {
      query = query.in("id", listingIdsBySkill);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new ApiError(500, "DB_ERROR", "Failed to load listings.");
    }

    const listings = (data || []).filter((listing) => {
      const company = Array.isArray(listing.company_profiles)
        ? listing.company_profiles[0]
        : listing.company_profiles;
      return company?.approval_status === "approved";
    });

    return NextResponse.json({
      listings,
      page: filters.page,
      limit: filters.limit,
      total: count || 0,
    });
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const { supabase, companyProfile } = await requireApprovedCompany(request);
    const payload = await parseJsonBody(request, listingCreateBodySchema);

    const uniqueSkillIds = Array.from(new Set(payload.skill_ids));
    await validateSkillIds(supabase, uniqueSkillIds);

    const { count: activeCount, error: countError } = await supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("company_profile_id", companyProfile.id)
      .eq("is_active", true)
      .eq("is_deleted", false);

    if (countError) {
      throw new ApiError(500, "DB_ERROR", "Failed to validate listing quota.");
    }

    if ((activeCount || 0) >= 3) {
      throw new ApiError(
        400,
        "BUSINESS_RULE_VIOLATION",
        "A company can have at most 3 active listings."
      );
    }

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .insert({
        company_profile_id: companyProfile.id,
        title: payload.title,
        description: payload.description,
        listing_type: payload.listing_type,
        focus_area: payload.focus_area || null,
        experience_level: payload.experience_level || null,
        total_slots: payload.total_slots,
        slots_remaining: payload.total_slots,
      })
      .select("id")
      .single();

    if (listingError || !listing) {
      throw new ApiError(500, "DB_ERROR", "Failed to create listing.");
    }

    if (uniqueSkillIds.length > 0) {
      const { error: skillInsertError } = await supabase.from("listing_skills").insert(
        uniqueSkillIds.map((skillId) => ({
          listing_id: listing.id,
          skill_id: skillId,
        }))
      );

      if (skillInsertError) {
        throw new ApiError(500, "DB_ERROR", "Failed to attach listing skills.");
      }
    }

    const createdListing = await getListingWithSkills(supabase, listing.id);

    return NextResponse.json(
      {
        listing: createdListing,
      },
      { status: 201 }
    );
  });
}
