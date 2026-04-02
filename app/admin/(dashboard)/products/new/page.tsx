import { AdminProductForm } from "@/components/admin-product-form";
import { requireAdmin } from "@/lib/auth";

export default async function NewProductPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Новый экран</h1>
      <AdminProductForm mode="create" />
    </div>
  );
}
