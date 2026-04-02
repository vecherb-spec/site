"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAdminActionState } from "@/lib/actions";

const initialState = {
  success: false,
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-60"
    >
      {pending ? "Вход..." : "Войти"}
    </button>
  );
}

export function AdminLoginForm() {
  const [state, formAction] = useActionState(loginAdminActionState, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm text-zinc-300">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          name="email"
          required
          placeholder="admin@led-pro.ru"
          className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-500"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm text-zinc-300">
          Пароль
        </label>
        <input
          id="password"
          type="password"
          name="password"
          required
          className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-emerald-500"
        />
      </div>
      {state.message ? <p className="text-sm text-rose-300">{state.message}</p> : null}
      <SubmitButton />
    </form>
  );
}
