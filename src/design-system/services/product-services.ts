import endpoint from "shared/endpoint";
import { productService } from "services/supabase/product.service";

export async function getProducts(query: string) {
  // Parse query string to extract filters
  const params = new URLSearchParams(query);
  const page = parseInt(params.get("page") || "1");
  const perPage = parseInt(params.get("limit") || "15");
  const search = params.get("q") || undefined;
  const category = params.get("category") || undefined;
  const inStock = params.get("inStock");
  const sort = params.get("sort") || "none";
  const minPrice = params.get("minPrice")
    ? parseFloat(params.get("minPrice")!)
    : undefined;
  const maxPrice = params.get("maxPrice")
    ? parseFloat(params.get("maxPrice")!)
    : undefined;
  const tagsParam = params.get("tags");
  const tags = tagsParam ? tagsParam.split(",") : undefined;

  try {
    // Fetch from Supabase - exclude inactive products on user side
    const { data: products, total } = await productService.getProducts({
      search,
      category,
      excludeInactive: true, // Only show active and out_of_stock products
      page,
      perPage,
      minPrice,
      maxPrice,
      tags,
      sort,
    });

    // Transform Supabase data to match expected format
    const transformedProducts = products.map((product: any) => ({
      id: product.id,
      name: [
        { localeCode: 'en', value: product.name },
        { localeCode: 'ar', value: product.name }
      ],
      slug: product.name.toLowerCase().replace(/\s+/g, '-'),
      price: product.price,
      salePrice: product.sale_price,
      discount: product.discount || 0,
      inStock: product.status === 'active',
      stock: product.stock,
      description: product.description || '',
      shortDescription: product.short_description || '',
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

    // Filter by stock if needed
    const filteredProducts = inStock === 'true' 
      ? transformedProducts.filter((p: any) => p.inStock)
      : transformedProducts;

    // Calculate pagination
    const totalPages = Math.ceil(total / perPage);

    return {
      data: {
        products: filteredProducts,
        paginationInfo: {
          total,
          limit: perPage,
          page,
          pages: totalPages,
          result: filteredProducts.length,
        },
      },
    };
  } catch (error) {
    console.error('Error fetching products from Supabase:', error);
    // Fallback to original endpoint if Supabase fails
    return endpoint.get(`/products?` + query);
  }
}

