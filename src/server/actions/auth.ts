"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createServerSupabase } from "@/lib/supabase";
import { loginSchema, registerSchema } from "@/lib/validators";

function formatAuthError(message: string) {
  if (message.includes("Email not confirmed")) {
    return "邮箱尚未验证，请先到 QQ 邮箱（含垃圾箱）点击 Supabase 验证链接";
  }
  if (message.includes("Invalid login credentials")) {
    return "邮箱或密码错误";
  }
  return message;
}

async function ensureUserProfile(
  userId: string,
  name: string,
  grade: number
) {
  await prisma.userProfile.upsert({
    where: { userId },
    update: { name, grade },
    create: { userId, name, grade },
  });
}

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    redirect("/login?error=" + encodeURIComponent("邮箱或密码格式不正确"));
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    const msg = formatAuthError(error.message);
    const params = new URLSearchParams({ error: msg, email: parsed.data.email });
    if (error.message.includes("Email not confirmed")) {
      params.set("unconfirmed", "1");
    }
    redirect("/login?" + params.toString());
  }

  const user = data.user;
  const meta = user.user_metadata as { name?: string; grade?: number };
  const existing = await prisma.userProfile.findUnique({
    where: { userId: user.id },
  });
  if (!existing) {
    if (meta.name && meta.grade) {
      await ensureUserProfile(user.id, meta.name, meta.grade);
    } else {
      redirect("/setup");
    }
  }

  redirect("/dashboard");
}

/** 已登录但缺少学习资料时补全（不再走注册） */
export async function completeProfile(formData: FormData) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = registerSchema
    .pick({ name: true, grade: true })
    .safeParse({
      name: formData.get("name"),
      grade: formData.get("grade"),
    });

  if (!parsed.success) {
    redirect("/setup?error=" + encodeURIComponent("请填写姓名和年级"));
  }

  await ensureUserProfile(user.id, parsed.data.name, parsed.data.grade);

  await supabase.auth.updateUser({
    data: { name: parsed.data.name, grade: parsed.data.grade },
  });

  redirect("/dashboard");
}

export async function register(formData: FormData) {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
    grade: formData.get("grade"),
  });
  if (!parsed.success) {
    redirect("/register?error=" + encodeURIComponent("请检查表单填写"));
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        name: parsed.data.name,
        grade: parsed.data.grade,
      },
    },
  });

  if (error) {
    redirect("/register?error=" + encodeURIComponent(error.message));
  }

  // Supabase 防邮箱枚举：邮箱已注册时可能返回 user=null 且无 error
  if (!data.user) {
    redirect(
      "/login?error=" +
        encodeURIComponent(
          "该邮箱可能已注册，请直接登录；若刚注册请查收邮箱验证邮件"
        )
    );
  }

  try {
    await ensureUserProfile(
      data.user.id,
      parsed.data.name,
      parsed.data.grade
    );
  } catch {
    redirect(
      "/register?error=" +
        encodeURIComponent("账号已创建，但资料保存失败，请联系管理员")
    );
  }

  // 已开启邮箱验证时 session 为空，需先验证再登录
  if (!data.session) {
    redirect(
      "/login?info=" +
        encodeURIComponent(
          "注册成功！请查收邮箱验证邮件，点击链接后再登录"
        )
    );
  }

  redirect("/dashboard");
}

export async function resendConfirmationEmail(formData: FormData) {
  const email = formData.get("email");
  if (!email || typeof email !== "string") {
    redirect("/login?error=" + encodeURIComponent("请填写邮箱"));
  }

  const supabase = createServerSupabase();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
  });

  if (error) {
    redirect(
      "/login?error=" +
        encodeURIComponent(formatAuthError(error.message)) +
        "&email=" +
        encodeURIComponent(email) +
        "&unconfirmed=1"
    );
  }

  redirect(
    "/login?info=" +
      encodeURIComponent("验证邮件已重新发送，请查收 QQ 邮箱（含垃圾箱）") +
      "&email=" +
      encodeURIComponent(email)
  );
}

export async function logout() {
  const supabase = createServerSupabase();
  await supabase.auth.signOut();
  redirect("/login");
}
