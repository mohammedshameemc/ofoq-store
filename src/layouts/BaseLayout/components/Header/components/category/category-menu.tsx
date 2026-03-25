import { trans } from "@mongez/localization";
import { useEffect, useState } from "react";
import { FaAngleDown } from "react-icons/fa";
import { ChevronRightIcon } from "@radix-ui/react-icons";

import { Button } from "design-system/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "design-system/components/ui/dropdown-menu";
import { cn } from "shared/lib/utils";
import { isLTR } from "shared/utils/helpers";
import { categoryService, CategoryWithChildren } from "services/supabase/category.service";

type CategoryMenuProps = {
  selectCategory: (value: string, id: string | null) => void;
};

export default function CategoryMenu({ selectCategory }: CategoryMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>(trans("allCategories"));

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

  const handleCategoryHover = (categoryId: string) => {
    setHoveredCategory(categoryId);
    const category = categories.find(c => c.id === categoryId);
    if (category && category.subcategories && category.subcategories.length > 0) {
      setShowSubcategories(true);
    } else {
      setShowSubcategories(false);
    }
  };

  const handleCategoryClick = (categoryName: string, categoryId: string) => {
    setSelectedCategoryName(categoryName);
    selectCategory(categoryName.toLowerCase().replace(/\s+/g, '-'), categoryId);
    setIsOpen(false);
  };

  const handleAllCategoriesClick = () => {
    setSelectedCategoryName(trans("allCategories"));
    selectCategory("", null);
    setIsOpen(false);
  };

  return (
    <DropdownMenu onOpenChange={changeStatus}>
      <DropdownMenuTrigger asChild>
        <div
          className="w-full max-w-[200px]"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}>
          <Button
            variant={"ghost"}
            className={cn(
              "flex items-center justify-between w-full max-w-[200px]",
              "rounded-none hover:bg-transparent font-semibold text-sm",
              isLTR() ? "xl:pl-6 border-r-2 border-slate-200" : "border-l-2 border-slate-200",
            )}>
            <span className="truncate">{selectedCategoryName}</span>
            <FaAngleDown className="w-4 h-4 text-slate-500 ml-2 flex-shrink-0" />
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
              {/* All Categories option */}
              <div
                onClick={handleAllCategoriesClick}
                className={cn(
                  "text-sm cursor-pointer font-medium py-[10px] px-2 rounded",
                  "text-black border-b-[1px] border-borderLight",
                  "hover:bg-blue/5 hover:text-blue transition-colors duration-200",
                  selectedCategoryName === trans("allCategories") && "bg-blue/5 text-blue",
                )}>
                <span>{trans("allCategories")}</span>
              </div>

              {categories.map((category, index: number) => {
                const hasSubcategories = category.subcategories && category.subcategories.length > 0;
                
                return (
                  <div
                    key={category.id}
                    onMouseEnter={() => handleCategoryHover(category.id)}
                    onClick={() => handleCategoryClick(category.name, category.id)}
                    className={cn(
                      "text-sm cursor-pointer font-medium py-[10px] px-2 rounded",
                      "text-black border-b-[1px] border-borderLight",
                      "hover:bg-blue/5 hover:text-blue transition-colors duration-200",
                      index === categories.length - 1 && "border-b-0",
                      hoveredCategory === category.id && "bg-blue/5 text-blue",
                    )}>
                    <div className="flex items-center justify-between">
                      <span>{category.name}</span>
                      {hasSubcategories && (
                        <ChevronRightIcon className="w-4 h-4" />
                      )}
                    </div>
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
                        <div
                          key={subcategory.id}
                          onClick={() => handleCategoryClick(subcategory.name, subcategory.id)}
                          className={cn(
                            "text-sm text-gray-700 hover:text-blue transition-all duration-200 py-1 cursor-pointer",
                            "animate-in fade-in slide-in-from-right-2"
                          )}
                          style={{
                            animationDelay: `${idx * 30}ms`,
                            animationDuration: "300ms"
                          }}>
                          {subcategory.name}
                        </div>
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
