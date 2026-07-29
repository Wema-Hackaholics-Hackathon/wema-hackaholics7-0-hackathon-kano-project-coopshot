import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const userCookie = cookieStore.get("auth_user")?.value;

  if (!token || !userCookie) {
    return NextResponse.json(null, { status: 401 });
  }

  try {
    const user = JSON.parse(userCookie);
    return NextResponse.json(user);
  } catch {
    return NextResponse.json(null, { status: 401 });
  }
}
