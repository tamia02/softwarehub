import { ProductLanding } from "@/components/product/ProductLanding";
import { LabCatalogue } from "@/components/product/LabCatalogue";
import { productBySlug } from "@/data/products";

const product = productBySlug["lab"];
export const metadata = { title: product.name, description: product.sub };

export default function LabPage() {
  return (
    <ProductLanding product={product}>
      <LabCatalogue />
    </ProductLanding>
  );
}
