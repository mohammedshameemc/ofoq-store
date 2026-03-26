import { navigateTo } from "@mongez/react-router";
import { useEffect, useState } from "react";
import {
  AiOutlineAppstore,
  AiOutlineArrowRight,
  AiOutlineEdit,
  AiOutlineLoading3Quarters,
  AiOutlinePlus,
  AiOutlineStar,
} from "react-icons/ai";
import { BiCategory, BiPackage } from "react-icons/bi";
import { categoryService, productService } from "services/supabase";
import URLS from "shared/utils/urls";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState([
    {
      title: "Total Products",
      value: "-",
      description: "Active in catalog",
      icon: <BiPackage className="h-8 w-8" />,
      color: "bg-blue-500",
      link: URLS.admin.products,
    },
    {
      title: "Total Categories",
      value: "-",
      description: "All categories",
      icon: <BiCategory className="h-8 w-8" />,
      color: "bg-purple-500",
      link: URLS.admin.categories,
    },
    {
      title: "Top Products",
      value: "-",
      description: "Featured products",
      icon: <AiOutlineStar className="h-8 w-8" />,
      color: "bg-amber-500",
      link: URLS.admin.topProducts,
    },
    {
      title: "Top Categories",
      value: "-",
      description: "Featured categories",
      icon: <AiOutlineAppstore className="h-8 w-8" />,
      color: "bg-green-500",
      link: URLS.admin.topCategories,
    },
  ]);

  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [recentCategories, setRecentCategories] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productService.getProducts({ perPage: 5 }), // Recent 5 products
      categoryService.getCategoriesWithChildren(), // Categories
      productService.getProducts({ featured: true, perPage: 1 }), // Just for count
      categoryService.getTopCategoriesPaginated({ perPage: 1 }), // Top categories count
      productService.getProducts({ status: "low_stock", perPage: 5 }), // Low stock
    ])
      .then(([productsRes, catsRes, featuredRes, topCatsRes, lowStockRes]) => {
        const topProductsCount = featuredRes.total;
        const totalCats = catsRes.totalParents;
        const totalProducts = productsRes.total;
        const topCatsCount = topCatsRes.total;

        setStats(prev => [
          { ...prev[0], value: totalProducts.toString() },
          { ...prev[1], value: totalCats.toString() },
          { ...prev[2], value: topProductsCount.toString() },
          { ...prev[3], value: topCatsCount.toString() },
        ]);

        setRecentProducts(productsRes.data);
        // Sort categories by created_at DESC to get recent ones
        const sortedCats = [...catsRes.data].sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        setRecentCategories(sortedCats.slice(0, 5));
        setLowStockProducts(lowStockRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      {/* Header */}
      <div className="bg-[#2b38d1] px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Catalog Dashboard</h1>
            <p className="text-sm text-white/70 mt-1">
              Manage your product catalog and categories
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo(URLS.admin.addCategory)}
              className="px-4 py-2.5 border border-white/30 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2 font-medium">
              <AiOutlinePlus className="h-4 w-4" />
              Add Category
            </button>
            <button
              onClick={() => navigateTo(URLS.admin.addProduct)}
              className="px-4 py-2.5 bg-white text-[#2b38d1] rounded-lg hover:bg-white/90 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-black/10">
              <AiOutlinePlus className="h-4 w-4" />
              Add Product
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-14">
          {stats.map((stat, index) => (
            <button
              key={index}
              onClick={() => navigateTo(stat.link)}
              className="bg-white rounded-xl shadow-lg shadow-gray-200/60 p-6 hover:shadow-xl hover:-translate-y-0.5 transition-all text-left border border-borderLight">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {stat.description}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg text-white`}>
                  {stat.icon}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg shadow-gray-200/60 border border-borderLight overflow-hidden mt-6 mb-6">
          <div className="bg-[#2b38d1] px-6 py-4">
            <h2 className="text-base font-semibold text-white">
              Quick Actions
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => navigateTo(URLS.admin.addProduct)}
                className="flex items-center gap-3 p-4 border border-borderLight rounded-xl bg-white shadow-sm hover:shadow-md hover:border-[#2b38d1] hover:bg-[#2b38d1]/5 transition-all text-left">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <BiPackage className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Add Product
                  </p>
                  <p className="text-xs text-gray-500">
                    Create a new catalog item
                  </p>
                </div>
              </button>
              <button
                onClick={() => navigateTo(URLS.admin.addCategory)}
                className="flex items-center gap-3 p-4 border border-borderLight rounded-xl bg-white shadow-sm hover:shadow-md hover:border-[#2b38d1] hover:bg-[#2b38d1]/5 transition-all text-left">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                  <BiCategory className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Add Category
                  </p>
                  <p className="text-xs text-gray-500">Organize your catalog</p>
                </div>
              </button>
              <button
                onClick={() => navigateTo(URLS.admin.topProducts)}
                className="flex items-center gap-3 p-4 border border-borderLight rounded-xl bg-white shadow-sm hover:shadow-md hover:border-[#2b38d1] hover:bg-[#2b38d1]/5 transition-all text-left">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                  <AiOutlineStar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Top Products
                  </p>
                  <p className="text-xs text-gray-500">
                    Manage featured products
                  </p>
                </div>
              </button>
              <button
                onClick={() => navigateTo(URLS.admin.topCategories)}
                className="flex items-center gap-3 p-4 border border-borderLight rounded-xl bg-white shadow-sm hover:shadow-md hover:border-[#2b38d1] hover:bg-[#2b38d1]/5 transition-all text-left">
                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                  <AiOutlineAppstore className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Top Categories
                  </p>
                  <p className="text-xs text-gray-500">
                    Manage featured categories
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
           <div className="flex items-center justify-center py-24">
             <AiOutlineLoading3Quarters className="h-8 w-8 animate-spin text-[#2b38d1]" />
           </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recently Added Products */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg shadow-gray-200/60 border border-borderLight overflow-hidden">
              <div className="px-5 py-4 bg-[#2b38d1] rounded-t-xl flex items-center justify-between">
                <h2 className="text-base font-semibold text-white">
                  Recent Products
                </h2>
                <button
                  onClick={() => navigateTo(URLS.admin.products)}
                  className="text-sm text-white/80 hover:text-white flex items-center gap-1 font-medium transition-colors">
                  View All
                  <AiOutlineArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-borderLight">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProducts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500">No products yet</td>
                      </tr>
                    ) : recentProducts.map((product, idx) => (
                      <tr
                        key={product.id}
                        className={`border-b border-borderLight transition-colors ${idx % 2 === 1 ? "bg-gray-50/40" : "bg-white"} hover:bg-[#2b38d1]/[0.04]`}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                                {product.image_url ? (
                                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-gray-300 text-xs">IMG</span>
                                )}
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {product.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-600">
                          {product.categories?.name ?? "—"}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-gray-900">
                          <div className="flex flex-col">
                            <span className="text-sm">
                              {product.price?.toLocaleString()} <span className="text-xs text-gray-400 font-normal">QAR</span>
                            </span>
                            {product.sale_price !== null && product.sale_price < product.price && (
                              <span className="text-xs text-green-600 block">
                                Sale: {product.sale_price?.toLocaleString()} QAR
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <button
                            onClick={() =>
                              navigateTo(URLS.admin.viewEditProduct(product.id))
                            }
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

            {/* Right sidebar */}
            <div className="space-y-6">
              {/* Recent Categories */}
              <div className="bg-white rounded-xl shadow-lg shadow-gray-200/60 border border-borderLight overflow-hidden">
                <div className="px-6 py-4 bg-[#2b38d1] rounded-t-xl flex items-center justify-between">
                  <h2 className="text-base font-semibold text-white">
                    Recent Categories
                  </h2>
                  <button
                    onClick={() => navigateTo(URLS.admin.categories)}
                    className="text-sm text-white/80 hover:text-white flex items-center gap-1 font-medium transition-colors">
                    View All
                    <AiOutlineArrowRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  {recentCategories.length === 0 ? (
                    <div className="py-4 text-center text-gray-500">No categories left</div>
                  ) : recentCategories.map((cat, index) => (
                    <div
                      key={cat.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                        {cat.image_url ? (
                            <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-gray-300 text-xs text-center border p-1 rounded">IMG</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {cat.name}
                        </p>
                        <p className="text-xs text-emerald-600 font-medium mt-0.5">
                          {cat.status === 'active' ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <button
                        onClick={() => navigateTo(URLS.admin.viewEditCategory(cat.id))}
                        className="text-gray-400 hover:text-[#2b38d1] transition-colors p-2">
                         <AiOutlineArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
