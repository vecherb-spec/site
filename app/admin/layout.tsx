import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutAdminAction } from "@/lib/actions";
import { isAdminAuthenticated } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAuthed = await isAdminAuthenticated();

  if (!isAuthed) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/90">
        <div className="container flex h-16 items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Панель управления</p>
            <h1 className="text-lg font-semibold">LED Vision — Админка</h1>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/admin/products" className="text-slate-200 hover:text-white">
              Товары
            </Link>
            <Link href="/admin/leads" className="text-slate-200 hover:text-white">
              Заявки
            </Link>
            <form action={logoutAdminAction}>
              <button type="submit" className="rounded-md border border-white/20 px-3 py-1.5 hover:bg-white/10">
                Выйти
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="container py-10">{children}</main>
    </div>
  );
}
