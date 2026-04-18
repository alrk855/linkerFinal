import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // We don't have session route yet, returning dummy structure until backend sets it or we configure it.
  return NextResponse.json({
    user: null,
    role: 'guest',
    is_verified_student: false,
    profile_completeness: 0
  });
}
