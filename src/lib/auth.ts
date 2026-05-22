import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createServerSupabase } from "@/lib/supabase";

export const getAuthUser = cache(async () => {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const requireAuth = cache(async () => {
  const user = await getAuthUser();
  if (!user) redirect("/login");
  return user;
});

export const getUserProfile = cache(async () => {
  const user = await requireAuth();
  let profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    const meta = user.user_metadata as { name?: string; grade?: number };
    if (meta.name && meta.grade) {
      profile = await prisma.userProfile.create({
        data: {
          userId: user.id,
          name: meta.name,
          grade: meta.grade,
        },
      });
    } else {
      redirect("/setup");
    }
  }

  return { user, profile };
});
