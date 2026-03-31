import { trans } from "@mongez/localization";
import Helmet from "@mongez/react-helmet";
import React from "react";

import ProductsList from "design-system/components/Products/ProductsList";
import { useFilters } from "shared/hooks/use-filters";
import { useProduct } from "shared/hooks/use-products";

interface ProductsContainerProps {
  title: string;
  additionalTitle?: boolean;
}

const ProductsContainer: React.FC<ProductsContainerProps> = ({
  title,
  additionalTitle,
}) => {
  const {
    filters,
    params,
    updateCategory,
    updateMinPrice,
    updateMaxPrice,
    updateSortOptions,
    updateInStock,
    updateTags,
    resetFiltersExceptQuery,
    updatePageNumber,
  } = useFilters();

  const { data, isLoading, error } = useProduct(params);

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
            products={data?.products || []}
            updateCategory={updateCategory}
            updateInStock={updateInStock}
            updateMaxPrice={updateMaxPrice}
            updateMinPrice={updateMinPrice}
            updateSortOptions={updateSortOptions}
            updateTags={updateTags}
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
