import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { isAdminAuthenticated } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Вход в админку | LEDVision",
  description: "Вход в административную панель.",
};

export default async function AdminLoginPage() {
  const isLoggedIn = await isAdminAuthenticated();

  if (isLoggedIn) {
    redirect("/admin");
  }

  return (
    <section className="container py-16">
      <div className="mx-auto max-w-md">
        <h1 className="mb-2 text-3xl font-semibold text-white">
          Вход в админ-панель
        </h1>
        <p className="mb-8 text-sm text-zinc-400">
          Используйте учетные данные администратора для управления товарами и
          заявками.
        </p>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <AdminLoginForm />
        </div>
      </div>
    </section>
  );
}
