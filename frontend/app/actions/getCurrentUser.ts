// app/actions/getUser.ts
"use server";

import { cookies } from "next/headers";
import { apiFetch } from "@/lib/api";
import { MOCK_CURRENT_USER } from "@/lib/mock-data";

export async function getCurrentUserFromServer() {
  /* ORIGINAL BACKEND CALL:
  const res = await apiFetch("/user", {}, true);
  if (!res.ok) return null;
  return res.json();
  */

  return {
    ...MOCK_CURRENT_USER,
    id: String(MOCK_CURRENT_USER.id),
  };
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('auth_user')?.value;

  if (!userCookie) {
    return {
      ...MOCK_CURRENT_USER,
      id: String(MOCK_CURRENT_USER.id),
    };
  }

  try {
    const user = JSON.parse(userCookie);
    return {
      id: String(user.id || MOCK_CURRENT_USER.id),
      name: String(user.name || MOCK_CURRENT_USER.name),
      email: String(user.email || MOCK_CURRENT_USER.email),
      avatar_url: user.avatar_url || MOCK_CURRENT_USER.avatar_url,
    };
  } catch (error) {
    console.error('Failed to parse auth_user cookie:', error);
    return {
      ...MOCK_CURRENT_USER,
      id: String(MOCK_CURRENT_USER.id),
    };
  }
}
