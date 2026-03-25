import ProductsContainer from "design-system/components/Products/ProductsContainer";
import Breadcrumbs from "design-system/components/Breadcrumbs";
import React from "react";

function _ProductsPage() {
  return (
    <div className="w-full h-full bg-lightGray">
      <Breadcrumbs title="Products" image />
      <ProductsContainer title="Products Page" />
    </div>
  );
}

const ProductsPage = React.memo(_ProductsPage);
export default ProductsPage;
