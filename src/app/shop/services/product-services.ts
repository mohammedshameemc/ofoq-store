import endpoint from "shared/endpoint";
import { productService } from "services/supabase/product.service";

export async function getProduct(id: string | number) {
  try {
    // Fetch product with relations from Supabase
    const productData = await productService.getProductById(String(id));

    // Transform to match expected format
    const transformedProduct = {
      id: productData.id,
      name: [
        { localeCode: 'en', value: productData.name },
        { localeCode: 'ar', value: productData.name }
      ],
      slug: productData.name.toLowerCase().replace(/\s+/g, '-'),
      price: productData.price,
      salePrice: productData.sale_price,
      discount: productData.discount || 0,
      inStock: productData.status === 'active' && productData.stock > 0,
      stock: productData.stock,
      description: [
        { localeCode: 'en', value: productData.description || '' },
        { localeCode: 'ar', value: productData.description || '' }
      ],
      shortDescription: [
        { localeCode: 'en', value: productData.short_description || '' },
        { localeCode: 'ar', value: productData.short_description || '' }
      ],
      images: productData.product_images?.length > 0
        ? productData.product_images
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((img) => ({
              id: img.id,
              url: img.image_url,
              alt: productData.name,
            }))
        : [
            { id: '1', url: productData.image_url || '/placeholder.png', alt: productData.name },
            { id: '2', url: productData.image_url || '/placeholder.png', alt: productData.name }
          ],
      category: {
        id: productData.category_id,
        name: [
          { localeCode: 'en', value: productData.categories?.name || 'Uncategorized' },
          { localeCode: 'ar', value: productData.categories?.name || 'غير مصنف' }
        ],
        slug: productData.categories?.name?.toLowerCase().replace(/\s+/g, '-') || 'uncategorized',
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
      tags: productData.product_tags?.map((pt) => ({
        id: pt.tags.id,
        name: pt.tags.name,
        color: pt.tags.color,
      })) || [],
      specifications: productData.specifications || [],
      inCart: false,
      inWishlist: false,
      inCompare: false,
      relatedProducts: [] as any[], // Will be populated separately if needed
    };

    // Fetch related products from same category
    if (productData.category_id) {
      try {
        const { data: relatedData } = await productService.getProducts({
          category: productData.category_id,
          excludeInactive: true,
          perPage: 8,
        });

        // Transform related products and exclude current product
        const relatedProducts = relatedData
          .filter((p: any) => p.id !== productData.id)
          .slice(0, 4)
          .map((product: any) => ({
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
            images: [
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

        transformedProduct.relatedProducts = relatedProducts;
      } catch (err) {
        console.error('Error fetching related products:', err);
      }
    }

    return {
      data: {
        product: transformedProduct,
      },
    };
  } catch (error) {
    console.error('Error fetching product from Supabase:', error);
    // Fallback to original endpoint
    return endpoint.get("/products/" + id);
  }
}
