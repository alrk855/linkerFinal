import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/auth-guard";
import { ApiError, withErrorHandling } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { supabase } = await requireAuth(request);

    const { data, error } = await supabase
      .from("skills")
      .select("id, name, slug, sort_order, category_id, skill_categories(id, name, slug, sort_order)")
      .order("sort_order", { ascending: true });

    if (error) {
      throw new ApiError(500, "DB_ERROR", "Failed to load skills.");
    }

    const groups = new Map<
      string,
      {
        id: string;
        name: string;
        slug: string;
        sort_order: number;
        skills: Array<{ id: string; name: string; slug: string }>;
      }
    >();

    for (const row of data || []) {
      const category = Array.isArray(row.skill_categories)
        ? row.skill_categories[0]
        : row.skill_categories;

      if (!category) {
        continue;
      }

      if (!groups.has(category.id)) {
        groups.set(category.id, {
          id: category.id,
          name: category.name,
          slug: category.slug,
          sort_order: category.sort_order || 0,
          skills: [],
        });
      }

      groups.get(category.id)!.skills.push({
        id: row.id,
        name: row.name,
        slug: row.slug,
      });
    }

    const categories = Array.from(groups.values())
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        skills: category.skills.sort((a, b) => a.name.localeCompare(b.name)),
      }));

    return NextResponse.json({ categories });
  });
}
