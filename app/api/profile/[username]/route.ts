import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { username: string } }) {
  // Mock fallback route
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
