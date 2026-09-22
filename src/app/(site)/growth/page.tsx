import { ProductLanding } from "@/components/product/ProductLanding";
import { SmmCatalogue } from "@/components/product/SmmCatalogue";
import { productBySlug } from "@/data/products";

const product = productBySlug["growth"];
export const metadata = { title: product.name, description: product.sub };

export default function GrowthPage() {
  return (
    <ProductLanding product={product}>
      <SmmCatalogue />
    </ProductLanding>
  );
}
