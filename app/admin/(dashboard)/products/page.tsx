import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteProductAction } from "@/lib/actions";
import { formatPrice, formatDate } from "@/lib/utils";

export const metadata = {
  title: "Товары | LEDVision",
};

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Товары</h1>
        <Link className="btn-primary" href="/admin/products/new">
          Добавить товар
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/30 text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-medium">Название</th>
              <th className="px-4 py-3 font-medium">Категория</th>
              <th className="px-4 py-3 font-medium">Цена от</th>
              <th className="px-4 py-3 font-medium">Создан</th>
              <th className="px-4 py-3 font-medium text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-white/10 text-zinc-200">
                <td className="px-4 py-3">
                  {product.name}
                  {product.isFeatured ? (
                    <span className="ml-2 rounded-full bg-cyan-500/15 px-2 py-1 text-xs text-cyan-300">
                      Хит
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3">{product.category}</td>
                <td className="px-4 py-3">{formatPrice(product.priceFrom)}</td>
                <td className="px-4 py-3 text-zinc-400">{formatDate(product.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="rounded-md border border-white/20 px-3 py-1.5 text-xs text-zinc-200 transition hover:border-cyan-300 hover:text-white"
                    >
                      Изменить
                    </Link>
                    <form action={deleteProductAction}>
                      <input type="hidden" name="id" value={product.id} />
                      <button
                        className="rounded-md border border-red-400/40 px-3 py-1.5 text-xs text-red-300 transition hover:border-red-300 hover:text-red-200"
                        type="submit"
                      >
                        Удалить
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
