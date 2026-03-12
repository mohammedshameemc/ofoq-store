import { Database, supabase } from "../../config/supabase";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];

/** Category row with nested subcategories (client-side assembled). */
export interface CategoryWithChildren extends Category {
  subcategories: Category[];
}

class CategoryService {
  /**
   * Get all categories (flat list) with optional filters.
   */
  async getCategories(filters?: {
    search?: string;
    status?: string;
    parentOnly?: boolean;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase.from("categories").select("*", { count: "exact" });

    if (filters?.search) {
      query = query.ilike("name", `%${filters.search}%`);
    }

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    if (filters?.parentOnly) {
      query = query.is("parent_id", null);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 10) - 1,
      );
    }

    const { data, error, count } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw new Error(error.message);
    return { data: data as Category[], count };
  }

  /**
   * Get top-level categories with their subcategories assembled.
   * Supports server-side pagination on parent categories.
   */
  async getCategoriesWithChildren(filters?: {
    search?: string;
    status?: string;
    page?: number;
    perPage?: number;
  }): Promise<{ data: CategoryWithChildren[]; totalParents: number }> {
    const page = filters?.page ?? 1;
    const perPage = filters?.perPage ?? 10;
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    // 1) Count & fetch paginated parent categories
    let parentQuery = supabase
      .from("categories")
      .select("*", { count: "exact" })
      .is("parent_id", null);

    if (filters?.search) {
      parentQuery = parentQuery.ilike("name", `%${filters.search}%`);
    }
    if (filters?.status && filters.status !== "all") {
      parentQuery = parentQuery.eq("status", filters.status);
    }

    const {
      data: parents,
      error: pErr,
      count,
    } = await parentQuery
      .order("created_at", { ascending: false })
      .range(from, to);

    if (pErr) throw new Error(pErr.message);

    const parentIds = (parents as Category[]).map(p => p.id);

    // 2) Fetch all children for those parents in one query
    let children: Category[] = [];
    if (parentIds.length > 0) {
      let childQuery = supabase
        .from("categories")
        .select("*")
        .in("parent_id", parentIds);

      if (filters?.status && filters.status !== "all") {
        childQuery = childQuery.eq("status", filters.status);
      }

      const { data: childData, error: cErr } = await childQuery.order(
        "created_at",
        { ascending: false },
      );
      if (cErr) throw new Error(cErr.message);
      children = childData as Category[];
    }

    // 3) Assemble
    const assembled: CategoryWithChildren[] = (parents as Category[]).map(
      p => ({
        ...p,
        subcategories: children.filter(c => c.parent_id === p.id),
      }),
    );

    return { data: assembled, totalParents: count ?? 0 };
  }

  /**
   * Get only top-level categories (for parent selector dropdown).
   */
  async getParentCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .is("parent_id", null)
      .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    return data as Pick<Category, "id" | "name">[];
  }

  /**
   * Get category by ID.
   */
  async getCategoryById(id: string) {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);
    return data as Category;
  }

  /**
   * Create new category.
   */
  async createCategory(category: CategoryInsert) {
    const { data, error } = await supabase
      .from("categories")
      .insert(category)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Category;
  }

  /**
   * Update category.
   */
  async updateCategory(id: string, updates: CategoryUpdate) {
    const { data, error } = await supabase
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Category;
  }

  /**
   * Delete category (cascades to subcategories via DB FK).
   */
  async deleteCategory(id: string) {
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) throw new Error(error.message);
  }

  /**
   * Upload category image to Supabase Storage.
   * Bucket: "category-images"
   */
  async uploadImage(file: File): Promise<string> {
    const ext = file.name.split(".").pop();
    const filePath = `${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("category-images")
      .upload(filePath, file);

    if (error) throw new Error(error.message);

    const { data: urlData } = supabase.storage
      .from("category-images")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }

  /**
   * Delete image from storage by its public URL.
   */
  async deleteImage(publicUrl: string) {
    // Extract path after the bucket name
    const parts = publicUrl.split("/category-images/");
    if (parts.length < 2) return;
    const filePath = parts[1];

    const { error } = await supabase.storage
      .from("category-images")
      .remove([filePath]);

    if (error) throw new Error(error.message);
  }

  // ─── Top Categories ──────────────────────────────────

  /**
   * Get paginated top categories (joined with category data).
   */
  async getTopCategoriesPaginated(filters?: {
    search?: string;
    status?: string;
    page?: number;
    perPage?: number;
  }): Promise<{ data: (Category & { top_id: string })[]; total: number }> {
    const page = filters?.page ?? 1;
    const perPage = filters?.perPage ?? 10;
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    // First get total count with filters
    let countQuery = supabase
      .from("top_categories")
      .select("id, category_id, categories!inner(name, status)", {
        count: "exact",
        head: true,
      });

    if (filters?.search) {
      countQuery = countQuery.ilike("categories.name", `%${filters.search}%`);
    }
    if (filters?.status && filters.status !== "all") {
      countQuery = countQuery.eq("categories.status", filters.status);
    }

    const { count, error: countErr } = await countQuery;
    if (countErr) throw new Error(countErr.message);

    // Fetch paginated top categories
    let query = supabase
      .from("top_categories")
      .select("id, category_id, sort_order, categories!inner(*)")
      .order("sort_order", { ascending: true })
      .range(from, to);

    if (filters?.search) {
      query = query.ilike("categories.name", `%${filters.search}%`);
    }
    if (filters?.status && filters.status !== "all") {
      query = query.eq("categories.status", filters.status);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    // Flatten the joined data
    const result = (data ?? []).map((row: any) => ({
      ...row.categories,
      top_id: row.id,
    })) as (Category & { top_id: string })[];

    return { data: result, total: count ?? 0 };
  }

  /**
   * Get all top category IDs (for quick lookup in CategoriesPage).
   */
  async getTopCategoryIds(): Promise<Set<string>> {
    const { data, error } = await supabase
      .from("top_categories")
      .select("category_id");

    if (error) throw new Error(error.message);
    return new Set((data ?? []).map(r => r.category_id));
  }

  /**
   * Add a category to the top categories list.
   */
  async addToTopCategories(categoryId: string) {
    // Get the current max sort_order
    const { data: existing } = await supabase
      .from("top_categories")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1);

    const nextSort =
      existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

    const { error } = await supabase
      .from("top_categories")
      .insert({ category_id: categoryId, sort_order: nextSort });

    if (error) throw new Error(error.message);
  }

  /**
   * Remove a category from top categories by **category_id**.
   */
  async removeFromTopCategories(categoryId: string) {
    const { error } = await supabase
      .from("top_categories")
      .delete()
      .eq("category_id", categoryId);

    if (error) throw new Error(error.message);
  }

  /**
   * Remove from top categories by the **top_categories.id** row.
   */
  async removeTopCategoryById(topId: string) {
    const { error } = await supabase
      .from("top_categories")
      .delete()
      .eq("id", topId);

    if (error) throw new Error(error.message);
  }
}

export const categoryService = new CategoryService();
