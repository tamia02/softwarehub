import { ProductLanding } from "@/components/product/ProductLanding";
import { productBySlug } from "@/data/products";

const product = productBySlug["community"];
export const metadata = { title: product.name, description: product.sub };

export default function CommunityPage() {
  return <ProductLanding product={product} />;
}
