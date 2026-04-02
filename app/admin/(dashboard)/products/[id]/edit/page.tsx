import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { AdminProductForm } from "@/components/admin-product-form";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  await requireAdmin();
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-slate-100">Редактировать товар</h1>
      <p className="mt-2 text-slate-400">Изменения сразу публикуются на витрине каталога.</p>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <AdminProductForm
          mode="edit"
          productId={product.id}
          initialValues={{
            name: product.name,
            category: product.category,
            pixelPitch: product.pixelPitch,
            brightness: product.brightness,
            refreshRate: product.refreshRate,
            cabinetSize: product.cabinetSize,
            warranty: product.warranty,
            priceFrom: product.priceFrom,
            description: product.description,
            imageUrl: product.imageUrl ?? "",
            isFeatured: product.isFeatured,
          }}
        />
      </div>
    </section>
  );
}
