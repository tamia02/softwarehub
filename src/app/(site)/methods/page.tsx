import { ProductLanding } from "@/components/product/ProductLanding";
import { MethodsList } from "@/components/product/MethodsList";
import { MethodsTools } from "@/components/product/MethodsTools";
import { productBySlug } from "@/data/products";

const product = productBySlug["methods"];
export const metadata = { title: product.name, description: product.sub };

export default function MethodsPage() {
  return (
    <ProductLanding product={product}>
      <MethodsList />
      <MethodsTools />
    </ProductLanding>
  );
}
