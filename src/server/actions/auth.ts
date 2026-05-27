"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createServerSupabase } from "@/lib/supabase";
import { decryptFromClient } from "@/lib/crypto-server";
import { registerSchema } from "@/lib/validators";

/**
 * Secure login — password is RSA-encrypted on the client,
 * decrypted here, then forwarded to Supabase.
 * Plaintext password never appears in the Network tab.
 */
export async function loginSecure(data: {
  email: string;
  encryptedPassword: string;
}) {
  let password: string;
  try {
    password = await decryptFromClient(data.encryptedPassword);
  } catch (e) {
    console.error("[loginSecure] Decryption failed:", e);
    return { error: "认证数据无效，请刷新页面重试" };
  }

  const email = data.email?.trim();
  if (!email || !password || password.length < 6) {
    return { error: "邮箱或密码格式不正确" };
  }

  const supabase = createServerSupabase();
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("Email not confirmed")) {
      return {
        error: "邮箱尚未验证，请先到 QQ 邮箱（含垃圾箱）点击验证链接",
        unconfirmed: true,
      };
    }
    if (error.message.includes("Invalid login credentials")) {
      return { error: "邮箱或密码错误" };
    }
    if (error.message.includes("rate") || error.message.includes("limit")) {
      return { error: "请求过于频繁，请稍后再试" };
    }
    return { error: "登录失败，请稍后重试" };
  }

  // Ensure user profile exists
  const user = authData.user;
  const meta = user.user_metadata as { name?: string; grade?: number };
  const existing = await prisma.userProfile.findUnique({
    where: { userId: user.id },
  });

  if (!existing) {
    if (meta.name && meta.grade) {
      await prisma.userProfile.upsert({
        where: { userId: user.id },
        update: { name: meta.name, grade: meta.grade },
        create: { userId: user.id, name: meta.name, grade: meta.grade },
      });
    } else {
      return { success: true as const, redirect: "/setup" };
    }
  }

  return { success: true as const, redirect: "/dashboard" };
}

/**
 * Secure register — password is RSA-encrypted on the client,
 * decrypted here, then forwarded to Supabase.
 */
export async function registerSecure(data: {
  email: string;
  encryptedPassword: string;
  name: string;
  grade: number;
}) {
  let password: string;
  try {
    password = await decryptFromClient(data.encryptedPassword);
  } catch (e) {
    console.error("[registerSecure] Decryption failed:", e);
    return { error: "认证数据无效，请刷新页面重试" };
  }

  const email = data.email?.trim();
  const name = data.name?.trim();
  const grade = data.grade;

  if (
    !email ||
    !password ||
    password.length < 6 ||
    !name ||
    !grade ||
    grade < 1 ||
    grade > 6
  ) {
    return { error: "请检查表单填写" };
  }

  const supabase = createServerSupabase();
  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, grade } },
  });

  if (error) {
    if (
      error.message.includes("already registered") ||
      error.message.includes("already been registered")
    ) {
      return { error: "该邮箱已注册，请直接登录" };
    }
    if (error.message.includes("rate") || error.message.includes("limit")) {
      return { error: "请求过于频繁，请稍后再试" };
    }
    return { error: "注册失败，请稍后重试" };
  }

  // Supabase anti-enumeration: existing email may return user=null with no error
  if (!authData.user) {
    return {
      error: "该邮箱可能已注册，请直接登录；若刚注册请查收邮箱验证邮件",
    };
  }

  // Session exists → email confirmation not required
  if (authData.session) {
    try {
      await prisma.userProfile.upsert({
        where: { userId: authData.user.id },
        update: { name, grade },
        create: { userId: authData.user.id, name, grade },
      });
    } catch {
      return { error: "账号已创建，但资料保存失败，请联系管理员" };
    }
    return { success: true as const, redirect: "/dashboard" };
  }

  // Email confirmation required
  return {
    success: true as const,
    redirect: "/login",
    info: "注册成功！请查收邮箱验证邮件，点击链接后再登录",
  };
}

/**
 * Sync user profile to database (no password involved).
 */
export async function syncProfile(data: { name: string; grade: number }) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "未登录" };
  }

  const name = data.name?.trim();
  const grade = data.grade;
  if (!name || name.length < 1 || !grade || grade < 1 || grade > 6) {
    return { error: "姓名或年级无效" };
  }

  try {
    await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: { name, grade },
      create: { userId: user.id, name, grade },
    });
    return { success: true as const };
  } catch {
    return { error: "资料保存失败，请稍后重试" };
  }
}

/** 已登录但缺少学习资料时补全 */
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

  await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: { name: parsed.data.name, grade: parsed.data.grade },
    create: { userId: user.id, name: parsed.data.name, grade: parsed.data.grade },
  });

  await supabase.auth.updateUser({
    data: { name: parsed.data.name, grade: parsed.data.grade },
  });

  redirect("/dashboard");
}

export async function resendConfirmationEmail(email: string) {
  if (!email || typeof email !== "string") {
    return { error: "请填写邮箱" };
  }

  const supabase = createServerSupabase();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
  });

  if (error) {
    if (error.message.includes("rate") || error.message.includes("limit")) {
      return { error: "请求过于频繁，请稍后再试" };
    }
    return { error: "发送失败，请稍后重试" };
  }

  return { success: true as const };
}

export async function logout() {
  const supabase = createServerSupabase();
  await supabase.auth.signOut();
  redirect("/login");
}
