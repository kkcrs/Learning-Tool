import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/setup",
    "/dashboard/:path*",
    "/study/:path*",
    "/quiz/:path*",
    "/plan/:path*",
  ],
};
