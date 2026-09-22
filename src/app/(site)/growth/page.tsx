import { ProductLanding } from "@/components/product/ProductLanding";
import { productBySlug } from "@/data/products";

const product = productBySlug["growth"];
export const metadata = { title: product.name, description: product.sub };

export default function GrowthPage() {
  return <ProductLanding product={product} />;
}
