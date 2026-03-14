import { trans } from "@mongez/localization";
import { useEffect, useState } from "react";
import { FiMenu } from "react-icons/fi";
import { ChevronRightIcon } from "@radix-ui/react-icons";

import { Button } from "design-system/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "design-system/components/ui/dropdown-menu";
import { Separator } from "design-system/components/ui/separator";
import { cn } from "shared/lib/utils";
import { isLTR } from "shared/utils/helpers";
import URLS from "shared/utils/urls";
import { categoryService, CategoryWithChildren } from "services/supabase/category.service";

export default function CategoryLists() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const [showSubcategories, setShowSubcategories] = useState(false);

  useEffect(() => {
    if (isOpen || isHovered) {
      loadCategories();
    }
  }, [isOpen, isHovered]);

  const loadCategories = async () => {
    if (categories.length > 0) return;
    
    setLoading(true);
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

  const changeStatus = () => {
    setIsOpen(prev => !prev);
    if (!isOpen) {
      setShowSubcategories(false);
      setHoveredCategory(null);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowSubcategories(false);
    setHoveredCategory(null);
  };

  const handleCategoryHover = (categoryId: number) => {
    setHoveredCategory(categoryId);
    const category = categories.find(c => c.id === categoryId);
    if (category && category.subcategories && category.subcategories.length > 0) {
      setShowSubcategories(true);
    } else {
      setShowSubcategories(false);
    }
  };

  const handleCategoryLeave = () => {
    // Don't immediately hide - let the mouse move to subcategories
  };

  return (
    <DropdownMenu onOpenChange={changeStatus}>
      <DropdownMenuTrigger asChild>
        <div
          className="w-full max-w-[270px]"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}>
          {(isOpen || isHovered) && (
            <Separator className="bg-blue transition-all h-[1px] absolute top-0 w-full max-w-[270px]" />
          )}
          <Button
            variant={"ghost"}
            className={cn(
              "flex items-center justify-start w-full max-w-[270px]",
              "rounded-none pl-0 hover:bg-transparent",
              isLTR()
                ? "border-r-[2px] border-slate-200 "
                : "border-l-[2px] border-slate-200 ",
            )}>
            <FiMenu className="w-5 h-5 mx-2" />
            <span className="text-md font-semibold text-black">
              {trans("browse")}
            </span>
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align={isLTR() ? "start" : "end"}
        className={cn(
          "shadow-lg pt-4 px-0 rounded-none overflow-hidden",
          "transition-all duration-300 ease-in-out",
          showSubcategories ? "w-[900px]" : "w-[270px]"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}>
        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            {trans("Loading categories...")}
          </div>
        ) : (
          <div className="flex relative">
            {/* Categories list */}
            <div className={cn(
              "px-4 flex-shrink-0",
              showSubcategories ? "w-[270px] border-r border-borderLight" : "w-full"
            )}>
              {categories.map((category, index: number) => {
                const hasSubcategories = category.subcategories && category.subcategories.length > 0;
                
                return (
                  <div
                    key={category.id}
                    onMouseEnter={() => handleCategoryHover(category.id)}
                    onMouseLeave={handleCategoryLeave}
                    className={cn(
                      "text-sm cursor-pointer font-medium py-[10px] px-2 rounded",
                      "text-black border-b-[1px] border-borderLight",
                      "hover:bg-blue/5 hover:text-blue transition-colors duration-200",
                      index === categories.length - 1 && "border-b-0",
                      hoveredCategory === category.id && "bg-blue/5 text-blue",
                    )}>
                    <a
                      href={`${URLS.shop.products}?category=${category.id}&page=1`}
                      className="flex items-center justify-between">
                      <span>{category.name}</span>
                      {hasSubcategories && (
                        <ChevronRightIcon className="w-4 h-4" />
                      )}
                    </a>
                  </div>
                );
              })}
            </div>

            {/* Subcategories panel - slides in from right */}
            <div className={cn(
              "flex-1 px-6 py-2 transition-all duration-300 ease-in-out",
              showSubcategories && hoveredCategory 
                ? "opacity-100 translate-x-0" 
                : "opacity-0 translate-x-8 pointer-events-none"
            )}>
              {hoveredCategory && (() => {
                const activeCategory = categories.find(c => c.id === hoveredCategory);
                if (!activeCategory || !activeCategory.subcategories || activeCategory.subcategories.length === 0) {
                  return null;
                }

                return (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <h3 className="text-lg font-semibold text-blue mb-4">
                      {activeCategory.name}
                    </h3>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                      {activeCategory.subcategories.map((subcategory, idx) => (
                        <a
                          key={subcategory.id}
                          href={`${URLS.shop.products}?category=${subcategory.id}&page=1`}
                          className={cn(
                            "text-sm text-gray-700 hover:text-blue transition-all duration-200 py-1",
                            "animate-in fade-in slide-in-from-right-2"
                          )}
                          style={{
                            animationDelay: `${idx * 30}ms`,
                            animationDuration: "300ms"
                          }}>
                          {subcategory.name}
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
