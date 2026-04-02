"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE_NAME, ADMIN_DASHBOARD_PATH } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import {
  leadSchema,
  loginSchema,
  productCreateSchema,
  productUpdateSchema,
} from "@/lib/validators";

export async function submitLeadAction(formData: FormData) {
  const parsed = leadSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    company: formData.get("company"),
    message: formData.get("message"),
    source: formData.get("source"),
    productId: formData.get("productId"),
  });

  if (!parsed.success) {
    return { success: false, message: "Проверьте корректность заполнения формы." };
  }

  await prisma.lead.create({
    data: {
      ...parsed.data,
      company: parsed.data.company || null,
      message: parsed.data.message || null,
      productId: parsed.data.productId || null,
    },
  });

  revalidatePath("/admin/leads");
  return { success: true, message: "Спасибо! Мы свяжемся с вами в ближайшее время." };
}

export async function submitLeadActionState(
  _prevState: { success: boolean; message: string },
  formData: FormData,
) {
  return submitLeadAction(formData);
}

export async function loginAdminAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, message: "Некорректные данные для входа." };
  }

  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedEmail || !expectedPassword) {
    return { success: false, message: "Админка не настроена. Добавьте переменные окружения." };
  }

  if (
    parsed.data.email.toLowerCase() !== expectedEmail.toLowerCase() ||
    parsed.data.password !== expectedPassword
  ) {
    return { success: false, message: "Неверный email или пароль." };
  }

  (await cookies()).set({
    name: AUTH_COOKIE_NAME,
    value: "ok",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
    secure: process.env.NODE_ENV === "production",
  });

  redirect(ADMIN_DASHBOARD_PATH);
}

export async function loginAdminActionState(
  _prevState: { success: boolean; message: string },
  formData: FormData,
) {
  return loginAdminAction(formData);
}

export async function logoutAdminAction() {
  (await cookies()).delete(AUTH_COOKIE_NAME);
  redirect("/admin/login");
}

export async function deleteLeadAndRedirect(formData: FormData): Promise<void> {
  await deleteLeadAction(formData);
}

export async function deleteProductAndRedirect(formData: FormData): Promise<void> {
  await deleteProductAction(formData);
}

export async function createProductAction(formData: FormData) {
  const parsed = productCreateSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    pixelPitch: formData.get("pixelPitch"),
    brightness: formData.get("brightness"),
    refreshRate: formData.get("refreshRate"),
    cabinetSize: formData.get("cabinetSize"),
    warranty: formData.get("warranty"),
    priceFrom: formData.get("priceFrom"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
    isFeatured: formData.get("isFeatured") === "on",
  });

  if (!parsed.success) {
    return { success: false, message: "Проверьте поля товара и попробуйте снова." };
  }

  const baseSlug = slugify(parsed.data.name);
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.product.findUnique({ where: { slug } })) {
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }

  await prisma.product.create({
    data: {
      ...parsed.data,
      slug,
      imageUrl: parsed.data.imageUrl || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/admin/products");
  return { success: true, message: "Товар добавлен." };
}

export async function createProductActionState(
  _prevState: { error: string | null },
  formData: FormData,
) {
  const result = await createProductAction(formData);
  return result.success ? { error: null } : { error: result.message };
}

export async function updateProductAction(productId: string, formData: FormData) {
  const parsed = productUpdateSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    pixelPitch: formData.get("pixelPitch"),
    brightness: formData.get("brightness"),
    refreshRate: formData.get("refreshRate"),
    cabinetSize: formData.get("cabinetSize"),
    warranty: formData.get("warranty"),
    priceFrom: formData.get("priceFrom"),
    description: formData.get("description"),
    imageUrl: formData.get("imageUrl"),
    isFeatured: formData.get("isFeatured") === "on",
  });

  if (!parsed.success) {
    return { success: false, message: "Проверьте поля товара и попробуйте снова." };
  }

  const existing = await prisma.product.findUnique({
    where: { id: productId },
    select: { slug: true },
  });

  if (!existing) {
    return { success: false, message: "Товар не найден." };
  }

  let slug = existing.slug;
  if (slugify(parsed.data.name) !== existing.slug) {
    const baseSlug = slugify(parsed.data.name);
    slug = baseSlug;
    let counter = 1;
    while (
      await prisma.product.findFirst({
        where: {
          slug,
          NOT: { id: productId },
        },
      })
    ) {
      counter += 1;
      slug = `${baseSlug}-${counter}`;
    }
  }

  await prisma.product.update({
    where: { id: productId },
    data: {
      ...parsed.data,
      slug,
      imageUrl: parsed.data.imageUrl || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath(`/catalog/${slug}`);
  revalidatePath("/admin/products");
  return { success: true, message: "Товар обновлен." };
}

export async function updateProductActionState(
  productId: string,
  _prevState: { error: string | null },
  formData: FormData,
) {
  const result = await updateProductAction(productId, formData);
  return result.success ? { error: null } : { error: result.message };
}

async function deleteProductInternal(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) {
    return { success: false, message: "Не удалось удалить товар." as const };
  }

  const product = await prisma.product.findUnique({
    where: { id },
    select: { slug: true },
  });

  if (!product) {
    return { success: false, message: "Товар уже удален." as const };
  }

  await prisma.product.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath(`/catalog/${product.slug}`);
  revalidatePath("/admin/products");
  return { success: true, message: "Товар удален." };
}

async function deleteLeadInternal(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) {
    return { success: false, message: "Не удалось удалить заявку." as const };
  }

  await prisma.lead.delete({ where: { id } });
  revalidatePath("/admin/leads");
  return { success: true, message: "Заявка удалена." };
}

export async function deleteProductAction(formData: FormData) {
  await deleteProductInternal(formData);
}

export async function deleteLeadAction(formData: FormData) {
  await deleteLeadInternal(formData);
}
