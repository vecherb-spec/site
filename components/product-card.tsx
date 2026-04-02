import Link from "next/link";
import type { Product } from "@prisma/client";
import { formatPrice } from "@/lib/utils";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="card flex h-full flex-col p-6">
      <div className="mb-4 text-xs text-[var(--muted)]">{product.category}</div>
      <h3 className="mb-3 text-xl font-semibold text-white">{product.name}</h3>
      <ul className="mb-6 space-y-2 text-sm text-[var(--muted)]">
        <li>Шаг пикселя: {product.pixelPitch}</li>
        <li>Яркость: {product.brightness.toLocaleString("ru-RU")} нит</li>
        <li>Частота: {product.refreshRate.toLocaleString("ru-RU")} Гц</li>
      </ul>
      <div className="mt-auto flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--muted)]">Цена от</p>
          <p className="text-lg font-semibold text-white">
            {formatPrice(product.priceFrom)}
          </p>
        </div>
        <Link className="btn-primary px-4 py-2 text-sm" href={`/catalog/${product.slug}`}>
          Подробнее
        </Link>
      </div>
    </article>
  );
}
