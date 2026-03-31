import Helmet from "@mongez/react-helmet";
import { useEffect } from "react";
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

  useEffect(() => {
    // Add Open Graph meta tags dynamically
    const metaTags = [
      { property: "og:type", content: "product" },
      { property: "og:title", content: productName },
      { property: "og:description", content: productDescription },
      { property: "og:image", content: productImage },
      { property: "og:url", content: productUrl },
      { property: "og:site_name", content: "Ofoq Store" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: productName },
      { name: "twitter:description", content: productDescription },
      { name: "twitter:image", content: productImage },
    ];

    if (price) {
      metaTags.push(
        { property: "product:price:amount", content: price.toString() },
        { property: "product:price:currency", content: "SAR" },
      );
    }

    if (product.inStock !== undefined) {
      metaTags.push({
        property: "product:availability",
        content: product.inStock ? "in stock" : "out of stock",
      });
    }

    // Create and append meta tags
    const createdTags: HTMLMetaElement[] = [];
    metaTags.forEach(tag => {
      const meta = document.createElement("meta");
      if ("property" in tag && tag.property) {
        meta.setAttribute("property", tag.property);
      }
      if ("name" in tag && tag.name) {
        meta.setAttribute("name", tag.name);
      }
      meta.setAttribute("content", tag.content);
      document.head.appendChild(meta);
      createdTags.push(meta);
    });

    // Cleanup function to remove tags when component unmounts
    return () => {
      createdTags.forEach(tag => {
        if (tag.parentNode) {
          tag.parentNode.removeChild(tag);
        }
      });
    };
  }, [productName, productDescription, productImage, productUrl, price, product.inStock]);

  return (
    <Helmet
      title={`${productName} - Ofoq Store`}
      description={productDescription}
      image={productImage}
      url={productUrl}
    />
  );
}
