"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  createProductActionState,
  updateProductActionState,
} from "@/lib/actions";
import { type ProductInput } from "@/lib/validators";
import { FormMessage, Input, Label, SubmitButton, Textarea } from "@/components/ui";

type ProductFormProps = {
  mode: "create" | "edit";
  initialValues?: ProductInput;
  productId?: string;
};

const emptyValues: ProductInput = {
  name: "",
  category: "",
  pixelPitch: "",
  brightness: 0,
  refreshRate: 0,
  cabinetSize: "",
  warranty: "",
  priceFrom: 0,
  description: "",
  imageUrl: "",
  isFeatured: false,
};

export function AdminProductForm({ mode, initialValues, productId }: ProductFormProps) {
  const submitAction =
    mode === "create"
      ? createProductActionState
      : async (_prevState: { error: string | null }, formData: FormData) => {
          if (!productId) {
            return { error: "Не передан ID товара." };
          }
          return updateProductActionState(productId, _prevState, formData);
        };

  const [state, formAction] = useActionState(submitAction, { error: null });
  const values = initialValues ?? emptyValues;

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-white/10 bg-zinc-950/70 p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field name="name" label="Название" defaultValue={values.name} required />
        <Field name="category" label="Категория" defaultValue={values.category} required />
        <Field name="pixelPitch" label="Шаг пикселя" defaultValue={values.pixelPitch} required />
        <Field
          name="brightness"
          label="Яркость (нит)"
          type="number"
          defaultValue={String(values.brightness)}
          required
        />
        <Field
          name="refreshRate"
          label="Частота (Гц)"
          type="number"
          defaultValue={String(values.refreshRate)}
          required
        />
        <Field name="cabinetSize" label="Размер кабинета" defaultValue={values.cabinetSize} required />
        <Field name="warranty" label="Гарантия" defaultValue={values.warranty} required />
        <Field name="priceFrom" label="Цена от (₽)" type="number" defaultValue={String(values.priceFrom)} required />
        <Field name="imageUrl" label="Ссылка на фото (опционально)" defaultValue={values.imageUrl ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Описание</Label>
        <Textarea id="description" name="description" defaultValue={values.description} required minLength={20} />
      </div>
      <label className="inline-flex items-center gap-2 text-sm text-zinc-200">
        <input
          type="checkbox"
          name="isFeatured"
          defaultChecked={Boolean(values.isFeatured)}
          className="h-4 w-4 rounded border-white/30 bg-zinc-900"
        />
        Показывать в блоке «Популярные решения»
      </label>
      {state.error ? <FormMessage>{state.error}</FormMessage> : null}
      <ProductSubmitButton mode={mode} />
    </form>
  );
}

type FieldProps = {
  name: string;
  label: string;
  defaultValue?: string;
  type?: "text" | "number";
  required?: boolean;
};

function Field({ name, label, defaultValue, type = "text", required }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} defaultValue={defaultValue} required={required} />
    </div>
  );
}

function ProductSubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  return (
    <SubmitButton pending={pending}>
      {mode === "create" ? "Создать товар" : "Сохранить изменения"}
    </SubmitButton>
  );
}
