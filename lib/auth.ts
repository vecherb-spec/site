import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE_NAME, ADMIN_LOGIN_PATH } from "@/lib/constants";

export async function isAdminAuthenticated() {
  const cookieValue = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  const secret = process.env.ADMIN_COOKIE_SECRET;

  return Boolean(cookieValue && secret && cookieValue === secret);
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect(ADMIN_LOGIN_PATH);
  }
}
