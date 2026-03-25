import { Link } from "@mongez/react-router";
import { FaChevronRight } from "react-icons/fa";
import { useEffect, useState } from "react";

import { trans } from "@mongez/localization";
import { FaChevronLeft } from "react-icons/fa6";
import { isLTR } from "shared/utils/helpers";
import URLS from "shared/utils/urls";
import { CarouselProducts } from "./CarouselProducts";
import Heading from "./heading";
import { productService } from "services/supabase/product.service";

export default function TopSellingRow() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        // Fetch featured products from Supabase
        const result = await productService.getProducts({
          featured: true,
          excludeInactive: true,
          perPage: 10,
        });

        // Transform to match expected format
        const transformedProducts = result.data.map((product: any) => ({
          id: product.id,
          name: [
            { localeCode: 'en', value: product.name },
            { localeCode: 'ar', value: product.name }
          ],
          slug: product.name.toLowerCase().replace(/\s+/g, '-'),
          price: product.price,
          salePrice: product.sale_price,
          discount: product.discount || 0,
          inStock: product.status === 'active' && product.stock > 0,
          stock: product.stock,
          images: product.product_images?.length > 0
            ? product.product_images.map((img: any) => ({
                id: img.id,
                url: img.image_url,
                alt: product.name,
              }))
            : [
                { id: '1', url: product.image_url || '/placeholder.png', alt: product.name },
                { id: '2', url: product.image_url || '/placeholder.png', alt: product.name }
              ],
          category: {
            id: product.category_id,
            name: [
              { localeCode: 'en', value: product.categories?.name || 'Uncategorized' },
              { localeCode: 'ar', value: product.categories?.name || 'غير مصنف' }
            ],
            slug: product.categories?.name?.toLowerCase().replace(/\s+/g, '-') || 'uncategorized',
            isActive: true,
            image: { url: '', alt: '' },
            totalProducts: 0,
          },
          brand: {
            id: 1,
            name: 'Generic',
            slug: 'generic',
            image: { url: '', alt: '' },
          },
          inCart: false,
          inWishlist: false,
          inCompare: false,
        }));

        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error fetching top products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-start gap-y-1 w-full">
        <div className="w-full p-3 bg-white">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
        </div>
        <div className="w-full bg-white p-4">
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="min-w-[230px] h-[400px] bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-start gap-y-1 w-full">
      <div className="w-full p-3 bg-white flex items-center justify-between">
        <Heading title={[
          { localeCode: 'en', value: 'Top Selling Products' },
          { localeCode: 'ar', value: 'المنتجات الأكثر مبيعاً' }
        ]} />
        <Link
          to={URLS.shop.products}
          className="flex items-center gap-1 text-xs md:text-sm text-gray">
          {trans("View All Products")}{" "}
          {isLTR() ? (
            <FaChevronRight className="w-3 h-3" />
          ) : (
            <FaChevronLeft className="w-3 h-3" />
          )}
        </Link>
      </div>
      <div className="w-full">
        <CarouselProducts products={products} />
      </div>
    </div>
  );
}
