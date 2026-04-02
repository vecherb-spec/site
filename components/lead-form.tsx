"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitLeadActionState } from "@/lib/actions";

const initialState = {
  success: false,
  message: "",
};

type LeadFormProps = {
  source: string;
  productId?: string;
};

export function LeadForm({ source, productId }: LeadFormProps) {
  const [state, action] = useActionState(submitLeadActionState, initialState);

  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-white/15 bg-black/40 p-6">
      <input type="hidden" name="source" value={source} />
      {productId ? <input type="hidden" name="productId" value={productId} /> : null}
      <div className="grid gap-2">
        <label htmlFor="name" className="text-sm text-zinc-300">
          Имя
        </label>
        <input
          id="name"
          name="name"
          required
          className="rounded-xl border border-white/20 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none transition focus:border-cyan-400"
          placeholder="Например, Алексей"
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor="phone" className="text-sm text-zinc-300">
          Телефон
        </label>
        <input
          id="phone"
          name="phone"
          required
          className="rounded-xl border border-white/20 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none transition focus:border-cyan-400"
          placeholder="+7 (___) ___-__-__"
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor="company" className="text-sm text-zinc-300">
          Компания (необязательно)
        </label>
        <input
          id="company"
          name="company"
          className="rounded-xl border border-white/20 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none transition focus:border-cyan-400"
          placeholder="ООО Пример"
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor="message" className="text-sm text-zinc-300">
          Комментарий
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          className="rounded-xl border border-white/20 bg-zinc-950 px-4 py-3 text-zinc-100 outline-none transition focus:border-cyan-400"
          placeholder="Город, размеры экрана, сроки запуска"
        />
      </div>
      <LeadSubmitButton />
      {state.message ? (
        <p className={`text-sm ${state.success ? "text-emerald-300" : "text-rose-300"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}

function LeadSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Отправка..." : "Получить расчет"}
    </button>
  );
}
