import { ProductLanding } from "@/components/product/ProductLanding";
import { MethodsList } from "@/components/product/MethodsList";
import { LabCatalogue } from "@/components/product/LabCatalogue";
import { productBySlug } from "@/data/products";

const product = productBySlug["methods"];
export const metadata = { title: product.name, description: product.sub };

export default function MethodsPage() {
  return (
    <ProductLanding product={product}>
      <MethodsList />
      <LabCatalogue />
    </ProductLanding>
  );
}
