import Helmet from "@mongez/react-helmet";
import { Product } from "shared/utils/types";
import { translateText } from "shared/utils/translate-text";

interface ProductMetaTagsProps {
  product: Product;
  productUrl: string;
}

export default function ProductMetaTags({
  product,
  productUrl,
}: ProductMetaTagsProps) {
  const productName = translateText(product.name);
  const productDescription =
    translateText(product.shortDescription) ||
    translateText(product.description) ||
    productName;
  const productImage = product.images[0]?.url || "";
  const price = product.salePrice || product.price;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{productName} - Ofoq Store</title>
      <meta name="description" content={productDescription} />

      {/* Open Graph Meta Tags for Facebook, WhatsApp, etc. */}
      <meta property="og:type" content="product" />
      <meta property="og:title" content={productName} />
      <meta property="og:description" content={productDescription} />
      <meta property="og:image" content={productImage} />
      <meta property="og:url" content={productUrl} />
      <meta property="og:site_name" content="Ofoq Store" />

      {/* Product specific OG tags */}
      {price && (
        <>
          <meta property="product:price:amount" content={price.toString()} />
          <meta property="product:price:currency" content="SAR" />
        </>
      )}
      {product.inStock !== undefined && (
        <meta
          property="product:availability"
          content={product.inStock ? "in stock" : "out of stock"}
        />
      )}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={productName} />
      <meta name="twitter:description" content={productDescription} />
      <meta name="twitter:image" content={productImage} />

      {/* WhatsApp specific (uses Open Graph) */}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
    </Helmet>
  );
}
