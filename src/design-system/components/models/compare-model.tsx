import { trans } from "@mongez/localization";
import { useState } from "react";

import { modalAtom } from "design-system/atoms/model-atom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "design-system/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "design-system/components/ui/table";
import { translateText } from "shared/utils/translate-text";
import CompareTableHead from "../../../layouts/BaseLayout/components/Header/components/compare/compare-table-head";
import { Product } from "../../../shared/utils/types";
import { compareAtom } from "../../atoms/compare-atom";

export default function CompareModel() {
  const data = modalAtom.useValue();
  const [_, setTicks] = useState(0);
  const compareProducts = compareAtom.useValue();

  const updateState = () => {
    setTicks(prevTicks => prevTicks + 1);
  };

  const isModalOpen = data.isOpen && data.type === "compare";
  if (!isModalOpen) {
    return null;
  }

  const handleClose = () => {
    modalAtom.onClose();
  };

  return (
    <Dialog open={data.isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="flex flex-col gap-5 items-center justify-start p-0
       max-h-[650px] max-w-full md:w-[750px]">
        <DialogHeader className="w-full bg-slate-100 py-3">
          <DialogTitle className="text-black text-center">
            {trans("compare")}
          </DialogTitle>
        </DialogHeader>
        {compareProducts.length > 0 ? (
          <Table className="border border-borderLight m-5 scrollbar shadow-sm rounded-lg overflow-hidden">
            <TableHeader>
              <TableRow>
                <TableHead
                  className="border-r-[.5px] border-borderLight text-base
                 font-normal text-primary">
                  {trans("Products")}
                </TableHead>
                {compareProducts.map((product: Product) => (
                  <TableHead key={product.id} className="py-4 relative">
                    <CompareTableHead
                      compareItem={product}
                      updateState={updateState}
                    />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell
                  className="table-cell
                 text-base font-normal text-primary">
                  {trans("Description")}
                </TableCell>
                {compareProducts.map((product: Product) => (
                  <TableCell
                    key={product.id}
                    className="table-cell
                     text-center py-8 text-gray ">
                    {product.shortDescription.length > 0
                      ? translateText(product.shortDescription)
                      : "no Description"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell
                  className="table-cell
                 text-base font-normal text-primary">
                  {trans("Category")}
                </TableCell>
                {compareProducts.map((product: Product) => (
                  <TableCell
                    key={product.id}
                    className="table-cell
                     text-center py-8 text-gray">
                    {translateText(product.category.name)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell
                  className="table-cell
                 text-base font-normal text-primary">
                  {trans("Availability")}
                </TableCell>
                {compareProducts.map((product: Product) => (
                  <TableCell
                    key={product.id}
                    className="table-cell 
                    text-center 
                     py-8 text-gray">
                    {product.inStock ? (
                      <span className="text-emerald-600">
                        {trans("In Stock")}
                      </span>
                    ) : (
                      <span className="text-red">{trans("Out Of Stock")}</span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell
                  className="table-cell
                  text-base font-normal text-primary">
                  {trans("Specifications")}
                </TableCell>
                {compareProducts.map((product: Product) => (
                  <TableCell
                    key={product.id}
                    className="table-cell 
                    text-center py-8 text-gray">
                    {product.specifications && product.specifications.length > 0 ? (
                      <ul className="text-left space-y-1 text-sm">
                        {product.specifications.map((spec, index) => (
                          <li key={index}>
                            <span className="font-semibold text-gray-800">
                              {spec.label || `Spec ${index + 1}`}
                            </span>
                            <span className="mx-1">-</span>
                            <span className="text-primary font-medium">
                              {spec.value}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-400">
                        {trans("No Specifications")}
                      </span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell
                  className="table-cell
                  text-base font-normal text-primary">
                  {trans("Discount")}
                </TableCell>
                {compareProducts.map((product: Product) => {
                  // Calculate discount if not stored
                  let discountPercentage = 0;
                  if (product.discount?.percentage) {
                    discountPercentage = product.discount.percentage;
                  } else if (
                    product.price &&
                    product.salePrice &&
                    product.price > product.salePrice
                  ) {
                    discountPercentage = Math.round(
                      ((product.price - product.salePrice) / product.price) *
                        100,
                    );
                  }

                  return (
                    <TableCell
                      key={product.id}
                      className="table-cell 
                    text-center py-8 text-gray">
                      {discountPercentage > 0
                        ? `${discountPercentage}% off`
                        : trans("No Discount")}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        ) : (
          <div className="w-full h-full mt-auto py-3 text-center">
            {trans("emptyCompareList")}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
