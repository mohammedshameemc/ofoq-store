import { navigateTo } from "@mongez/react-router";
import { useEffect, useState } from "react";
import {
  AiOutlineEdit,
  AiOutlineLoading3Quarters,
  AiOutlineStar,
} from "react-icons/ai";
import { productService } from "services/supabase";
import URLS from "shared/utils/urls";

interface TopProduct {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  status: string;
  image_url: string | null;
  categories: { name: string } | null;
}

export default function TopProductsPage() {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService
      .getProducts({ featured: true, perPage: 50 })
      .then(res => setProducts(res.data as TopProduct[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusColor = (s: string) => {
    switch (s) {
      case "active": return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20";
      case "low_stock": return "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20";
      case "out_of_stock": return "bg-red-50 text-red-700 ring-1 ring-red-600/20";
      default: return "bg-gray-50 text-gray-600 ring-1 ring-gray-400/20";
    }
  };

  const statusLabel = (s: string) => {
    switch (s) {
      case "active": return "Active";
      case "low_stock": return "Low Stock";
      case "out_of_stock": return "Out of Stock";
      case "draft": return "Draft";
      default: return s;
    }
  };

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      {/* Header */}
      <div className="bg-[#2b38d1] px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Top Products</h1>
            <p className="text-sm text-white/70 mt-1">
              Products marked as Top Product
            </p>
          </div>
          <button
            onClick={() => navigateTo(URLS.admin.addProduct)}
            className="px-4 py-2.5 bg-white text-[#2b38d1] rounded-lg hover:bg-white/90 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-black/10">
            <AiOutlineStar className="h-5 w-5" />
            Add Product
          </button>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <AiOutlineLoading3Quarters className="h-8 w-8 animate-spin text-[#2b38d1]" />
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-xl flex flex-col items-center justify-center py-24 text-center">
            <AiOutlineStar className="h-12 w-12 text-gray-200 mb-4" />
            <p className="text-lg font-semibold text-gray-500">No top products yet</p>
            <p className="text-sm text-gray-400 mt-1 mb-6">Toggle "Top Product" on any product to feature it here</p>
            <button
              onClick={() => navigateTo(URLS.admin.products)}
              className="px-5 py-2.5 bg-[#2b38d1] text-white rounded-lg hover:bg-[#2330b0] transition-colors font-medium shadow-lg shadow-[#2b38d1]/30">
              Go to Products
            </button>
          </div>
        ) : (
          <>
            {/* Full table */}
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="bg-[#2b38d1] px-6 py-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-white">
                  All Top Products
                </h2>
                <span className="text-xs text-white/60 font-medium">
                  {products.length} product{products.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-borderLight">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, idx) => (
                      <tr
                        key={product.id}
                        className={`border-b border-borderLight hover:bg-[#2b38d1]/[0.03] transition-colors ${
                          idx % 2 === 1 ? "bg-gray-50/40" : "bg-white"
                        }`}>
                        <td className="px-6 py-3.5">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            idx < 3 ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"
                          }`}>
                            {idx + 1}
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                              {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-gray-300 text-xs">IMG</span>
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-sm text-gray-600">
                          {product.categories?.name ?? "—"}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <span className="text-sm font-semibold text-gray-900">
                            {product.price?.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-400 ml-1">QAR</span>
                          {product.sale_price !== null && product.sale_price < product.price && (
                            <p className="text-xs text-green-600">
                              Sale: {product.sale_price?.toLocaleString()} QAR
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-md ${statusColor(product.status)}`}>
                            {statusLabel(product.status)}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <button
                            onClick={() => navigateTo(URLS.admin.viewEditProduct(product.id))}
                            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-gray-700"
                            title="Edit">
                            <AiOutlineEdit className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
