import { useEffect, useState } from "react";
import { categoryService } from "services/supabase/category.service";
import { productService } from "services/supabase/product.service";
import CategoryCard from "./CategoryCard";

interface Category {
  id: string;
  name: string;
  image_url: string | null;
  status: string;
}

export default function CategoriesRow() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const parentCategories = await categoryService.getParentCategories();
        // Filter only active categories
        const activeCategories = parentCategories.filter((cat: any) => cat.status === 'active');
        setCategories(activeCategories);

        // Fetch product counts for each category
        const counts: Record<string, number> = {};
        await Promise.all(
          activeCategories.map(async (category: any) => {
            try {
              const result = await productService.getProducts({
                category: category.id,
                excludeInactive: true,
                perPage: 1, // We only need the count, not the actual products
              });
              counts[category.id] = result.total;
            } catch (error) {
              console.error(`Error fetching count for category ${category.id}:`, error);
              counts[category.id] = 0;
            }
          })
        );
        setProductCounts(counts);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="w-full overflow-x-auto py-5">
        <div className="flex items-center justify-start gap-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="min-w-[150px]">
              <div className="bg-gray-200 rounded-full w-[100px] h-[100px] animate-pulse mx-auto" />
              <div className="mt-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mx-auto" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-16 mx-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-x-auto py-5">
      <div className="flex items-center justify-start gap-5">
        {categories.map(category => {
          // Transform Supabase category to match expected format
          const transformedCategory = {
            id: category.id,
            name: [
              { localeCode: 'en', value: category.name },
              { localeCode: 'ar', value: category.name }
            ],
            image: {
              url: category.image_url || '/placeholder.png',
              alt: category.name
            },
            slug: category.name.toLowerCase().replace(/\s+/g, '-'),
            isActive: true,
            totalProducts: productCounts[category.id] || 0
          };

          return (
            <div key={category.id} className="min-w-[150px]">
              <CategoryCard category={transformedCategory} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
