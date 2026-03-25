import { supabase, Database } from '../../config/supabase';

type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];

export type { Product };

/** Data shape for creating/updating a full product (with tags + images). */
export interface FullProductData {
  name: string;
  description?: string;
  short_description?: string;
  price: number;
  sale_price?: number | null;
  discount?: number;
  stock: number;
  category_id: string | null;
  subcategory_id?: string | null;
  image_url?: string | null;
  featured?: boolean;
  status: Product['status'];
  /** Array of { tag_id, sort_order } */
  tags?: { tag_id: string; sort_order: number }[];
  /** Array of { image_url, sort_order } */
  images?: { image_url: string; sort_order: number }[];
  /** Array of { key, value, sort_order } */
  specifications?: { key: string; value: string; sort_order: number }[] | null;
}

export interface ProductWithRelations extends Product {
  categories: { name: string } | null;
  product_tags: {
    id: string;
    tag_id: string;
    sort_order: number;
    tags: { id: string; name: string; color: string };
  }[];
  product_images: {
    id: string;
    image_url: string;
    sort_order: number;
  }[];
}

class ProductService {
  // ─── LIST ────────────────────────────────────────────

  async getProducts(filters?: {
    search?: string;
    category?: string;
    status?: string;
    featured?: boolean;
    excludeInactive?: boolean;
    page?: number;
    perPage?: number;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<{ data: any[]; total: number }> {
    const page = filters?.page ?? 1;
    const perPage = filters?.perPage ?? 10;
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = supabase
      .from('products')
      .select('*, categories!products_category_id_fkey(name), subcategories:categories!products_subcategory_id_fkey(name), product_images(id, image_url, sort_order)', { count: 'exact' });

    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
    if (filters?.category && filters.category !== 'all') {
      // Check both category_id and subcategory_id to support filtering by parent category or subcategory
      query = query.or(`category_id.eq.${filters.category},subcategory_id.eq.${filters.category}`);
    }
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters?.featured !== undefined) {
      query = query.eq('featured', filters.featured);
    }
    // Exclude inactive products on user side (show only active and out_of_stock)
    if (filters?.excludeInactive) {
      query = query.in('status', ['active', 'out_of_stock']);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    // Apply price filtering on the client side to handle sale_price vs price logic
    let filteredData = data ?? [];
    
    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      filteredData = filteredData.filter((product: any) => {
        // Use sale_price if available, otherwise use price
        const effectivePrice = product.sale_price ?? product.price;
        
        if (filters.minPrice !== undefined && effectivePrice < filters.minPrice) {
          return false;
        }
        if (filters.maxPrice !== undefined && effectivePrice > filters.maxPrice) {
          return false;
        }
        return true;
      });
    }

    // Apply pagination after filtering
    const total = filteredData.length;
    const paginatedData = filteredData.slice(from, to + 1);

    return { data: paginatedData, total };
  }

  // ─── GET BY ID (WITH RELATIONS) ─────────────────────

  async getProductById(id: string): Promise<ProductWithRelations> {
    const { data, error } = await supabase
      .from('products')
      .select(
        `*,
         categories!products_category_id_fkey(name),
         product_tags(id, tag_id, sort_order, tags(id, name, color)),
         product_images(id, image_url, sort_order)`
      )
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data as unknown as ProductWithRelations;
  }

  // ─── CREATE FULL PRODUCT ────────────────────────────

  async createFullProduct(input: FullProductData): Promise<Product> {
    // 1. Insert the product row
    const productRow: ProductInsert = {
      name: input.name,
      description: input.description ?? null,
      short_description: input.short_description ?? null,
      price: input.price,
      sale_price: input.sale_price ?? null,
      discount: input.discount ?? 0,
      stock: input.stock,
      category_id: input.category_id,
      subcategory_id: input.subcategory_id ?? null,
      image_url: input.image_url ?? null,
      featured: input.featured ?? false,
      status: input.status,
      specifications: input.specifications ?? null,
    };

    const { data: product, error } = await supabase
      .from('products')
      .insert(productRow)
      .select()
      .single();

    if (error) throw new Error(error.message);

    const productId = (product as Product).id;

    // 2. Insert tags
    if (input.tags && input.tags.length > 0) {
      const tagRows = input.tags.map(t => ({
        product_id: productId,
        tag_id: t.tag_id,
        sort_order: t.sort_order,
      }));
      const { error: tagErr } = await supabase
        .from('product_tags')
        .insert(tagRows);
      if (tagErr) throw new Error(tagErr.message);
    }

    // 3. Insert images
    if (input.images && input.images.length > 0) {
      const imgRows = input.images.map(img => ({
        product_id: productId,
        image_url: img.image_url,
        sort_order: img.sort_order,
      }));
      const { error: imgErr } = await supabase
        .from('product_images')
        .insert(imgRows);
      if (imgErr) throw new Error(imgErr.message);
    }

    return product as Product;
  }

  // ─── UPDATE FULL PRODUCT ────────────────────────────

  async updateFullProduct(id: string, input: FullProductData): Promise<Product> {
    // 1. Update the product row
    const updates: ProductUpdate = {
      name: input.name,
      description: input.description ?? null,
      short_description: input.short_description ?? null,
      price: input.price,
      sale_price: input.sale_price ?? null,
      discount: input.discount ?? 0,
      stock: input.stock,
      category_id: input.category_id,
      subcategory_id: input.subcategory_id ?? null,
      image_url: input.image_url ?? null,
      featured: input.featured ?? false,
      status: input.status,
      specifications: input.specifications ?? null,
    };

    const { data: product, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // 2. Replace tags: delete all, then re-insert
    const { error: delTagErr } = await supabase
      .from('product_tags')
      .delete()
      .eq('product_id', id);
    if (delTagErr) throw new Error(delTagErr.message);

    if (input.tags && input.tags.length > 0) {
      const tagRows = input.tags.map(t => ({
        product_id: id,
        tag_id: t.tag_id,
        sort_order: t.sort_order,
      }));
      const { error: tagErr } = await supabase
        .from('product_tags')
        .insert(tagRows);
      if (tagErr) throw new Error(tagErr.message);
    }

    // 3. Replace images: delete all, then re-insert
    const { error: delImgErr } = await supabase
      .from('product_images')
      .delete()
      .eq('product_id', id);
    if (delImgErr) throw new Error(delImgErr.message);

    if (input.images && input.images.length > 0) {
      const imgRows = input.images.map(img => ({
        product_id: id,
        image_url: img.image_url,
        sort_order: img.sort_order,
      }));
      const { error: imgErr } = await supabase
        .from('product_images')
        .insert(imgRows);
      if (imgErr) throw new Error(imgErr.message);
    }

    return product as Product;
  }

  // ─── DELETE ─────────────────────────────────────────

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  async deleteProducts(ids: string[]): Promise<void> {
    const { error } = await supabase.from('products').delete().in('id', ids);
    if (error) throw new Error(error.message);
  }

  // ─── IMAGE UPLOAD ───────────────────────────────────

  async uploadProductImage(file: File): Promise<string> {
    const ext = file.name.split('.').pop();
    const filePath = `${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (error) throw new Error(error.message);

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }

  async deleteProductImage(publicUrl: string): Promise<void> {
    const parts = publicUrl.split('/product-images/');
    if (parts.length < 2) return;
    const filePath = parts[1];

    const { error } = await supabase.storage
      .from('product-images')
      .remove([filePath]);

    if (error) throw new Error(error.message);
  }

  // ─── UTILITY QUERIES ───────────────────────────────

  async getTopProducts(limit: number = 10) {
    const { data, error } = await supabase
      .from('products')
      .select('*, order_items(quantity)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return data;
  }

  async getLowStockProducts(threshold: number = 10) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .lte('stock', threshold)
      .order('stock', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  }

  // ─── FEATURED (TOP PRODUCT) ────────────────────────
  async setFeatured(id: string, featured: boolean): Promise<void> {
    const { error } = await supabase
      .from('products')
      .update({ featured })
      .eq('id', id);
    if (error) throw new Error(error.message);
  }
}

export const productService = new ProductService();
