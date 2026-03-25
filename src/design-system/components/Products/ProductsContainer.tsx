import { trans } from "@mongez/localization";
import Helmet from "@mongez/react-helmet";
import React, { useEffect, useState } from "react";
import { LuLoader2 } from "react-icons/lu";

import Breadcrumbs from "design-system/components/Breadcrumbs";
import ProductsList from "design-system/components/Products/ProductsList";
import { useFilters } from "shared/hooks/use-filters";
import { useProduct } from "shared/hooks/use-products";
import { Product } from "shared/utils/types";

interface ProductsContainerProps {
  title: string;
  additionalTitle?: boolean;
}

const ProductsContainer: React.FC<ProductsContainerProps> = ({
  title,
  additionalTitle,
}) => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const {
    filters,
    params,
    updateCategory,
    updateMinPrice,
    updateMaxPrice,
    updateSortOptions,
    updateInStock,
    resetFiltersExceptQuery,
    updatePageNumber,
  } = useFilters();

  const { data, isLoading, error } = useProduct(params);

  useEffect(() => {
    if (data?.products) {
      const products = [...data.products];
      if (filters.sort === "price_asc") {
        products.sort((a, b) => a.price - b.price);
      } else if (filters.sort === "price_dsc") {
        products.sort((a, b) => b.price - a.price);
      }

      // Apply category filter if present (already filtered by Supabase)
      setFilteredProducts(products);
    }
  }, [data, filters]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center pt-16">
        <h1 className="text-center text-red text-lg font-semibold">
          {trans("Something went wrong, Try Again Later.")}
        </h1>
      </div>
    );
  }

  return (
    <div>
      <Helmet title={title} />
      <div className="w-full h-full bg-lightGray">
        <div className="max-w-[1400px] mx-auto py-10 px-4 flex flex-col items-center justify-center gap-1">
          {additionalTitle && (
            <h1 className="text-primary text-[28px] font-semibold text-center uppercase">
              {data?.paginationInfo?.total || 0} {trans("Results")}{" "}
              {filters.q && `For "${filters.q}"`}
            </h1>
          )}
          <ProductsList
            products={filteredProducts}
            updateCategory={updateCategory}
            updateInStock={updateInStock}
            updateMaxPrice={updateMaxPrice}
            updateMinPrice={updateMinPrice}
            updateSortOptions={updateSortOptions}
            filters={filters}
            paginationInfo={data?.paginationInfo}
            resetFiltersExceptQuery={resetFiltersExceptQuery}
            updatePageNumber={updatePageNumber}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductsContainer;
