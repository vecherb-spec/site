import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().min(2, "Укажите имя"),
  phone: z.string().min(7, "Укажите телефон"),
  company: z.string().optional(),
  message: z.string().optional(),
  source: z.string().min(2).default("site"),
  productId: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.email("Введите корректный email"),
  password: z.string().min(1, "Введите пароль"),
});

const productBaseSchema = z.object({
  name: z.string().min(3, "Минимум 3 символа"),
  category: z.string().min(2, "Укажите категорию"),
  pixelPitch: z.string().min(2, "Укажите шаг пикселя"),
  brightness: z.coerce.number().int().min(100),
  refreshRate: z.coerce.number().int().min(1200),
  cabinetSize: z.string().min(3, "Укажите размер кабинета"),
  warranty: z.string().min(2, "Укажите гарантию"),
  priceFrom: z.coerce.number().int().min(1),
  description: z.string().min(20, "Добавьте описание"),
  imageUrl: z.string().url("Неверный URL").or(z.literal("")).optional(),
  isFeatured: z.coerce.boolean().default(false),
});

export const productCreateSchema = productBaseSchema;
export const productUpdateSchema = productBaseSchema;

export type LeadInput = z.infer<typeof leadSchema>;
export type ProductInput = z.infer<typeof productBaseSchema>;
