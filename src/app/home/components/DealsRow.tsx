import { useEffect, useState } from "react";
import { CarouselProducts } from "./CarouselProducts";
import { productService } from "services/supabase/product.service";

export default function DealsRow() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        // Fetch latest products from Supabase (ordered by created_at desc)
        const result = await productService.getProducts({
          excludeInactive: true,
          page: 1,
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
        console.error('Error fetching latest products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-start gap-y-1 w-full">
        <div className="flex flex-col md:flex-row items-start gap-y-2 w-full">
          <div className="w-full md:w-[33%] md:h-[400px] bg-gray-200 animate-pulse rounded" />
          <div className="w-full md:w-[67%] bg-white p-4">
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3].map((i) => (
                <div key={i} className="min-w-[230px] h-[400px] bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
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
      <div className="flex flex-col md:flex-row items-start gap-y-2 w-full">
        <div className="w-full md:w-[33%] md:h-[400px] object-cover bg-[#2b38d1] rounded-lg flex items-center justify-center">
          <div className="text-white text-center p-8">
            <h2 className="text-3xl font-bold mb-2">Latest Products</h2>
            <p className="text-lg">Check out our newest arrivals</p>
          </div>
        </div>
        <div className="w-full md:w-[67%]">
          <CarouselProducts products={products} />
        </div>
      </div>
    </div>
  );
}
