import { trans } from "@mongez/localization";
import { debounce } from "@mongez/reinforcements";
import { useEffect, useState } from "react";
import { LuX } from "react-icons/lu";
import { ChevronRightIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { cn } from "shared/lib/utils";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "design-system/components/ui/accordion";
import { FaMinus } from "react-icons/fa6";
import { Filters } from "shared/hooks/use-filters";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { categoryService, CategoryWithChildren } from "services/supabase/category.service";
import { tagService, Tag } from "services/supabase/tag.service";

interface FiltersSectionProps {
  updateCategory: (categoryId: string) => void;
  updateInStock: (inStock: boolean) => void;
  updateMinPrice: (minPrice: number) => void;
  updateMaxPrice: (maxPrice: number) => void;
  updateTags: (tags: string[]) => void;
  resetFiltersExceptQuery: () => void;
  filters: Filters;
}

export default function FiltersSection({
  updateCategory,
  updateInStock,
  filters,
  updateMinPrice,
  updateMaxPrice,
  updateTags,
  resetFiltersExceptQuery,
}: FiltersSectionProps) {
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice || 0);
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice || 0);

  // Initialize expanded categories based on selected category/subcategory
  useEffect(() => {
    if (filters.category && categories.length > 0) {
      const newExpanded = new Set<string>();
      
      // Check if the selected category is a subcategory
      for (const category of categories) {
        if (category.subcategories) {
          const hasSelectedSubcategory = category.subcategories.some(
            sub => sub.id === filters.category
          );
          if (hasSelectedSubcategory) {
            newExpanded.add(category.id);
            break;
          }
        }
      }
      
      if (newExpanded.size > 0) {
        setExpandedCategories(newExpanded);
      }
    }
  }, [filters.category, categories]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await categoryService.getCategoriesWithChildren({
          status: "active",
          perPage: 50,
        });
        setCategories(result.data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchTags = async () => {
      try {
        const result = await tagService.getTags();
        setTags(result.data);
      } catch (error) {
        console.error("Failed to load tags:", error);
      }
    };

    fetchCategories();
    fetchTags();
  }, []);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleTag = (tagId: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(id => id !== tagId)
      : [...currentTags, tagId];
    updateTags(newTags);
  };

  const debouncedUpdateMinPrice = debounce((newMinPrice: number) => {
    updateMinPrice(newMinPrice);
  }, 500);

  const debouncedUpdateMaxPrice = debounce((newMaxPrice: number) => {
    updateMaxPrice(newMaxPrice);
  }, 500);

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinPrice = Number(e.target.value);
    setLocalMinPrice(newMinPrice);
    debouncedUpdateMinPrice(newMinPrice);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMaxPrice = Number(e.target.value);
    setLocalMaxPrice(newMaxPrice);
    debouncedUpdateMaxPrice(newMaxPrice);
  };

  const removeAllFilters = () => {
    resetFiltersExceptQuery();
    setLocalMinPrice(0);
    setLocalMaxPrice(0);
  };

  return (
    <Accordion
      type="multiple"
      className="w-full"
      defaultValue={["categories", "price", "availability", "tags"]}>
      <div className="col-span-1 p-4 bg-white flex flex-col items-start gap-8 rounded-md w-full">
        <div className="flex flex-col items-start gap-5 w-full">
          {(filters.category ||
            filters.inStock ||
            filters.maxPrice ||
            filters.minPrice ||
            (filters.tags && filters.tags.length > 0)) && (
            <Button
              className="bg-red/10 text-red hover:bg-red/20"
              size={"sm"}
              onClick={removeAllFilters}>
              <LuX className="w-3 h-3 mr-1" />
              {trans("Remove Filters")}
            </Button>
          )}
          <AccordionItem value="categories" className=" w-full">
            <AccordionTrigger
              icon={FaMinus}
              className="w-full uppercase text-sm md:text-xs xl:text-sm text-primary font-bold">
              {trans("Product Categories")}
            </AccordionTrigger>
            <AccordionContent className="flex flex-col items-start gap-2">
              {loading ? (
                <p className="text-sm text-gray-500">{trans("Loading...")}</p>
              ) : (
                categories.map(category => {
                  const hasSubcategories = category.subcategories && category.subcategories.length > 0;
                  const isExpanded = expandedCategories.has(category.id);
                  const isSelected = category.id === filters.category;
                  
                  // Check if any subcategory is selected
                  const hasSelectedSubcategory = hasSubcategories && category.subcategories.some(
                    sub => sub.id === filters.category
                  );
                  
                  return (
                    <div key={category.id} className="w-full">
                      <div className="flex items-center gap-2 w-full">
                        {hasSubcategories ? (
                          <button
                            onClick={() => toggleCategory(category.id)}
                            className="p-0 hover:bg-transparent flex-shrink-0">
                            {isExpanded ? (
                              <ChevronDownIcon className="w-4 h-4 text-gray-600" />
                            ) : (
                              <ChevronRightIcon className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        ) : (
                          <div className="w-4" />
                        )}
                        <div
                          onClick={() => updateCategory(category.id)}
                          className={cn(
                            "flex items-center gap-2 flex-1 cursor-pointer py-1 px-2 rounded transition-colors",
                            isSelected 
                              ? "bg-blue/10 text-blue font-semibold" 
                              : "hover:bg-gray-100 text-primary"
                          )}>
                          <p className="text-sm md:text-xs 2xl:text-sm">
                            {category.name}
                          </p>
                        </div>
                      </div>
                      
                      {/* Subcategories */}
                      {hasSubcategories && isExpanded && (
                        <div className="ml-6 mt-1 flex flex-col gap-1 border-l-2 border-borderLight pl-3">
                          {category.subcategories.map(subcategory => {
                            const isSubSelected = subcategory.id === filters.category;
                            
                            return (
                              <div
                                key={subcategory.id}
                                onClick={() => updateCategory(subcategory.id)}
                                className={cn(
                                  "cursor-pointer py-1 px-2 rounded transition-colors",
                                  isSubSelected
                                    ? "bg-blue/10 text-blue font-semibold"
                                    : "hover:bg-gray-100 text-gray-700"
                                )}>
                                <p className="text-sm md:text-xs 2xl:text-sm">
                                  {subcategory.name}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </AccordionContent>
          </AccordionItem>
        </div>
        <AccordionItem value="price" className="w-full">
          <AccordionTrigger
            icon={FaMinus}
            className="uppercase text-sm md:text-xs xl:text-sm text-primary font-bold w-full">
            {trans("Product Price")}
          </AccordionTrigger>
          <AccordionContent className="flex items-center gap-2 w-full flex-nowrap md:flex-wrap xl:flex-nowrap">
            <p className="text-base text-primary">$</p>
            <Input
              id="minPrice"
              type="number"
              onChange={handleMinPriceChange}
              placeholder="From"
              value={localMinPrice?.toString()}
            />
            <Input
              id="maxPrice"
              type="number"
              onChange={handleMaxPriceChange}
              placeholder="To"
              value={localMaxPrice?.toString()}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="availability" className="w-full">
          <AccordionTrigger
            icon={FaMinus}
            className="uppercase text-sm md:text-xs xl:text-sm text-primary font-bold w-full ">
            {trans("Product Availability")}
          </AccordionTrigger>
          <AccordionContent className="flex flex-col items-start gap-3 w-full">
            <li
              onClick={() => updateInStock(true)}
              className="flex items-center gap-2 flex-wrap">
              <Checkbox
                id="inStock"
                className="border-darkGray w-4 h-4 md:w-3 md:h-3 2xl:w-4 2xl:h-4
                 data-[state=checked]:bg-blue data-[state=checked]:border-blue"
                checked={filters.inStock === true}
              />
              <p className="text-sm md:text-xs 2xl:text-sm font-medium text-primary cursor-pointer">
                {trans("In Stock")}
              </p>
            </li>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="tags" className="w-full">
          <AccordionTrigger
            icon={FaMinus}
            className="uppercase text-sm md:text-xs xl:text-sm text-primary font-bold w-full ">
            {trans("Tags")}
          </AccordionTrigger>
          <AccordionContent className="flex flex-col items-start gap-3 w-full">
            {tags.map(tag => (
              <li
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className="flex items-center gap-2 flex-wrap">
                <Checkbox
                  id={`tag-${tag.id}`}
                  className="border-darkGray w-4 h-4 md:w-3 md:h-3 2xl:w-4 2xl:h-4
                   data-[state=checked]:bg-blue data-[state=checked]:border-blue"
                  checked={filters.tags?.includes(tag.id) || false}
                />
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer"
                  style={{
                    backgroundColor: tag.color || "#e5e7eb",
                    color: "#ffffff",
                  }}>
                  {tag.name}
                </span>
              </li>
            ))}
          </AccordionContent>
        </AccordionItem>
      </div>
    </Accordion>
  );
}
