"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { homeForRole } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult, UserRole } from "@/lib/types";
import { checkPassword, str, validateEmail, validateShop, type FieldErrors } from "@/lib/validation";

const NOT_CONFIGURED = "Supabase тохируулагдаагүй тул нэвтрэх боломжгүй байна.";

/** Only allow same-site relative redirects ("/dashboard", not "//evil.com"). */
function safeNext(value: string) {
  return value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\") ? value : null;
}

async function siteOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) return `${h.get("x-forwarded-proto") ?? "https"}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export async function signIn(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { ok: false, error: NOT_CONFIGURED };

  const email = str(formData.get("email")).toLowerCase();
  const password = typeof formData.get("password") === "string" ? (formData.get("password") as string) : "";
  if (!validateEmail(email) || !password) {
    return { ok: false, error: "Имэйл болон нууц үгээ оруулна уу." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.code === "email_not_confirmed") {
      return { ok: false, error: "Имэйл хаягаа баталгаажуулаагүй байна. Ирсэн захидлын холбоос дээр дарна уу." };
    }
    return { ok: false, error: "Имэйл эсвэл нууц үг буруу байна." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();
  const role = (profile?.role ?? "customer") as UserRole;

  redirect(safeNext(str(formData.get("next"))) ?? homeForRole(role));
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}

export async function registerShop(
  _prev: ActionResult<{ userId: string; signedIn: boolean }> | null,
  formData: FormData,
): Promise<ActionResult<{ userId: string; signedIn: boolean }>> {
  if (!isSupabaseConfigured) return { ok: false, error: NOT_CONFIGURED };

  const fullName = str(formData.get("full_name"));
  const email = str(formData.get("email")).toLowerCase();
  const password = typeof formData.get("password") === "string" ? (formData.get("password") as string) : "";

  const { errors: shopErrors, values } = validateShop({
    name: str(formData.get("name")),
    description: str(formData.get("description")),
    phone: str(formData.get("phone")),
    instagram_url: str(formData.get("instagram_url")),
    facebook_url: str(formData.get("facebook_url")),
    address: str(formData.get("address")),
    district: str(formData.get("district")),
  });

  const fieldErrors: FieldErrors = { ...shopErrors };
  if (fullName.length < 2 || fullName.length > 120) fieldErrors.full_name = "Нэрээ бичнэ үү.";
  if (!validateEmail(email)) fieldErrors.email = "Имэйл хаяг буруу байна.";
  const passwordError = checkPassword(password);
  if (passwordError) fieldErrors.password = passwordError;
  if (!values.instagram_url && !values.facebook_url && !values.phone)
    fieldErrors.phone = fieldErrors.phone ?? "Дор хаяж нэг холбоо барих хаяг оруулна уу.";

  if (Object.keys(fieldErrors).length) {
    return { ok: false, error: "Талбаруудаа шалгаад дахин оролдоно уу.", fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${await siteOrigin()}/auth/callback?next=/dashboard`,
      // Read by the handle_new_user() trigger, which creates the profile and
      // a *pending* shop. The trigger never grants the admin role.
      data: {
        account_type: "shop_owner",
        full_name: fullName,
        shop_name: values.name,
        shop_description: values.description,
        phone: values.phone,
        instagram_url: values.instagram_url ?? "",
        facebook_url: values.facebook_url ?? "",
        address: values.address,
        district: values.district ?? "",
      },
    },
  });

  if (error) {
    if (error.code === "user_already_exists" || /already registered/i.test(error.message)) {
      return { ok: false, error: "Энэ имэйл хаягаар бүртгэл үүссэн байна. Нэвтэрч орно уу.", fieldErrors: { email: "Бүртгэлтэй имэйл." } };
    }
    if (error.code === "weak_password") {
      return { ok: false, error: "Нууц үг хэт энгийн байна.", fieldErrors: { password: "Илүү хүчтэй нууц үг сонгоно уу." } };
    }
    if (error.status === 429 || error.code === "over_email_send_rate_limit" || error.code === "over_request_rate_limit") {
      return { ok: false, error: "Хэт олон оролдлого хийлээ. Хэсэг хугацааны дараа дахин оролдоно уу." };
    }
    if (error.code === "email_address_invalid" || error.code === "validation_failed") {
      return { ok: false, error: "Энэ имэйл хаягийг хүлээн авахгүй байна. Жинхэнэ имэйл хаягаа оруулна уу.", fieldErrors: { email: "Жинхэнэ имэйл хаяг оруулна уу." } };
    }
    if (error.code === "email_address_not_authorized") {
      return { ok: false, error: "Баталгаажуулах имэйл илгээж чадсангүй. ThriftUB-ийн багтай холбогдоно уу. (код: email_not_authorized)" };
    }
    if (error.code === "signup_disabled") {
      return { ok: false, error: "Шинэ бүртгэл түр хаалттай байна. ThriftUB-ийн багтай холбогдоно уу." };
    }
    console.error("[registerShop]", error.code, error.status, error.message);
    // Show a short code so problems can be diagnosed without server logs.
    const code = error.code ?? (/database error/i.test(error.message) ? "database_error" : `status_${error.status ?? "unknown"}`);
    return { ok: false, error: `Бүртгэл үүсгэхэд алдаа гарлаа. Дахин оролдоно уу. (код: ${code})` };
  }

  // With email confirmation on, Supabase hides existing accounts by
  // returning a user with no identities.
  if (data.user && data.user.identities?.length === 0) {
    return { ok: false, error: "Энэ имэйл хаягаар бүртгэл үүссэн байна. Нэвтэрч орно уу.", fieldErrors: { email: "Бүртгэлтэй имэйл." } };
  }
  if (!data.user) return { ok: false, error: "Бүртгэл үүсгэхэд алдаа гарлаа. Дахин оролдоно уу." };

  return { ok: true, data: { userId: data.user.id, signedIn: Boolean(data.session) } };
}
