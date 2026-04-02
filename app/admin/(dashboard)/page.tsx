import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Админка | LED Screens",
};

export default async function AdminHomePage() {
  await requireAdmin();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [productsCount, leadsCount, newLeadsCount, featuredProductsCount] =
    await Promise.all([
      prisma.product.count(),
      prisma.lead.count(),
      prisma.lead.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      }),
      prisma.product.count({ where: { isFeatured: true } }),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Панель управления</h1>
        <p className="mt-2 text-zinc-400">
          Управляйте каталогом экранов и обрабатывайте заявки клиентов.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Товаров в каталоге" value={productsCount} />
        <StatCard label="Всего заявок" value={leadsCount} />
        <StatCard label="Новые за 7 дней" value={newLeadsCount} />
        <StatCard label="Флагманских моделей" value={featuredProductsCount} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/products"
          className="rounded-2xl border border-white/10 bg-zinc-900 p-6 transition hover:border-cyan-400/40"
        >
          <h2 className="text-xl font-semibold">Каталог товаров</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Добавляйте и редактируйте модели LED-экранов.
          </p>
        </Link>
        <Link
          href="/admin/leads"
          className="rounded-2xl border border-white/10 bg-zinc-900 p-6 transition hover:border-cyan-400/40"
        >
          <h2 className="text-xl font-semibold">Заявки</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Просматривайте обращения и удаляйте обработанные лиды.
          </p>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
