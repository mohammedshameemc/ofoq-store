import { navigateTo } from "@mongez/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlineLeft,
  AiOutlineLoading3Quarters,
  AiOutlinePlus,
  AiOutlineRight,
  AiOutlineSearch,
  AiOutlineStar,
} from "react-icons/ai";
import { categoryService, productService } from "services/supabase";
import URLS from "shared/utils/urls";

interface ProductRow {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  status: string;
  image_url: string | null;
  categories: { name: string } | null;
  subcategory_id: string | null;
  subcategories: { name: string } | null;
  featured: boolean;
}

const PER_PAGE = 10;

// ─── Confirmation Modal ──────────────────────────────────
interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass: string;
  icon: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  confirmClass,
  icon,
  onConfirm,
  onCancel,
  loading,
}: ConfirmModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fadeIn">
        <div className="flex flex-col items-center text-center gap-4">
          {/* Icon circle */}
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl" style={{ background: "inherit" }}>
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{message}</p>
          </div>
          <div className="flex gap-3 w-full mt-2">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${confirmClass}`}>
              {loading && (
                <AiOutlineLoading3Quarters className="h-4 w-4 animate-spin" />
              )}
              {loading ? "Please wait..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [topping, setTopping] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );

  // Modal state
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    id: string | null;
    isBulk: boolean;
  }>({ open: false, id: null, isBulk: false });

  const [topModal, setTopModal] = useState<{
    open: boolean;
    id: string | null;
    name: string;
  }>({ open: false, id: null, name: "" });

  // ─── Fetch categories for filter dropdown ────────
  useEffect(() => {
    categoryService
      .getParentCategories()
      .then(setCategories)
      .catch(console.error);
  }, []);

  // ─── Fetch products ──────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await productService.getProducts({
        search: searchQuery || undefined,
        category: categoryFilter,
        status: statusFilter,
        page,
        perPage: PER_PAGE,
      });
      setProducts(result.data as ProductRow[]);
      setTotal(result.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, categoryFilter, statusFilter, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    setSelectedRows([]);
  }, [searchQuery, categoryFilter, statusFilter]);

  // ─── Selection helpers ───────────────────────────
  const toggleRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelectedRows(prev =>
      prev.length === products.length ? [] : products.map(p => p.id)
    );
  };

  // ─── Delete helpers ──────────────────────────────
  const confirmDeleteSingle = (id: string) => {
    setDeleteModal({ open: true, id, isBulk: false });
  };

  const confirmBulkDelete = () => {
    setDeleteModal({ open: true, id: null, isBulk: true });
  };

  const handleDeleteConfirmed = async () => {
    setDeleting(true);
    try {
      if (deleteModal.isBulk) {
        await productService.deleteProducts(selectedRows);
        setSelectedRows([]);
      } else if (deleteModal.id) {
        await productService.deleteProduct(deleteModal.id);
        setSelectedRows(prev => prev.filter(r => r !== deleteModal.id));
      }
      await fetchProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
      setDeleteModal({ open: false, id: null, isBulk: false });
    }
  };

  // ─── Make Top Product helper ─────────────────────
  const confirmMakeTop = (product: ProductRow) => {
    setTopModal({ open: true, id: product.id, name: product.name });
  };

  const handleMakeTopConfirmed = async () => {
    if (!topModal.id) return;
    setTopping(true);
    try {
      const product = products.find(p => p.id === topModal.id);
      const newFeatured = !product?.featured;
      await productService.setFeatured(topModal.id, newFeatured);
      await fetchProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setTopping(false);
      setTopModal({ open: false, id: null, name: "" });
    }
  };

  // ─── Pagination helpers ──────────────────────────
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const from = (page - 1) * PER_PAGE + 1;
  const to = Math.min(page * PER_PAGE, total);

  const statusLabel = (s: string) => {
    switch (s) {
      case "active":
        return "Active";
      case "inactive":
        return "Inactive";
      case "draft":
        return "Draft";
      case "low_stock":
        return "Low Stock";
      case "out_of_stock":
        return "Out of Stock";
      default:
        return s;
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "active":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20";
      case "low_stock":
        return "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20";
      case "out_of_stock":
        return "bg-red-50 text-red-700 ring-1 ring-red-600/20";
      case "draft":
        return "bg-gray-50 text-gray-600 ring-1 ring-gray-400/20";
      default:
        return "bg-gray-50 text-gray-600 ring-1 ring-gray-400/20";
    }
  };

  const deleteTarget = deleteModal.isBulk
    ? `${selectedRows.length} product(s)`
    : (products.find(p => p.id === deleteModal.id)?.name ?? "this product");

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      {/* Confirmation Modals */}
      <ConfirmModal
        open={deleteModal.open}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmClass="bg-[#2b38d1] hover:bg-[#222fb5]"
        icon={
          <span className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-2xl">
            <AiOutlineDelete />
          </span>
        }
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleteModal({ open: false, id: null, isBulk: false })}
        loading={deleting}
      />

      <ConfirmModal
        open={topModal.open}
        title={
          products.find(p => p.id === topModal.id)?.featured
            ? "Remove from Top Products"
            : "Make Top Product"
        }
        message={
          products.find(p => p.id === topModal.id)?.featured
            ? `Remove "${topModal.name}" from top products?`
            : `Mark "${topModal.name}" as a top product? It will be highlighted in the store.`
        }
        confirmLabel={
          products.find(p => p.id === topModal.id)?.featured
            ? "Remove"
            : "Make Top"
        }
        confirmClass="bg-[#2b38d1] hover:bg-[#222fb5]"
        icon={
          <span className="w-14 h-14 rounded-full bg-[#2b38d1]/10 flex items-center justify-center text-[#2b38d1] text-2xl">
            <AiOutlineStar />
          </span>
        }
        onConfirm={handleMakeTopConfirmed}
        onCancel={() => setTopModal({ open: false, id: null, name: "" })}
        loading={topping}
      />

      {/* Header */}
      <div className="bg-[#2b38d1] px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Products</h1>
            <p className="text-sm text-white/70 mt-1">
              Manage your product catalog
            </p>
          </div>
          <button
            onClick={() => navigateTo(URLS.admin.addProduct)}
            className="px-5 py-2.5 bg-white text-[#2b38d1] rounded-lg hover:bg-white/90 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-black/10">
            <AiOutlinePlus className="h-5 w-5" />
            Add Product
          </button>
        </div>
      </div>

      <div className="p-8">
        <div className="bg-white rounded-xl shadow-xl border border-borderLight">
          {/* Filters */}
          <div className="p-5 border-b border-borderLight">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[280px]">
                <div className="relative">
                  <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-borderLight rounded-lg focus:ring-2 focus:ring-[#2b38d1]/20 focus:border-[#2b38d1] outline-none transition-all shadow-sm focus:shadow-md"
                  />
                </div>
              </div>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-borderLight rounded-lg focus:ring-2 focus:ring-[#2b38d1]/20 focus:border-[#2b38d1] outline-none bg-white transition-all shadow-sm">
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-borderLight rounded-lg focus:ring-2 focus:ring-[#2b38d1]/20 focus:border-[#2b38d1] outline-none bg-white transition-all shadow-sm">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Selected actions bar */}
          {selectedRows.length > 0 && (
            <div className="px-5 py-2.5 bg-[#2b38d1]/5 border-b border-[#2b38d1]/10 flex items-center gap-4 shadow-sm">
              <span className="text-sm font-medium text-[#2b38d1]">
                {selectedRows.length} selected
              </span>
              <button
                onClick={confirmBulkDelete}
                disabled={deleting}
                className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50">
                {deleting ? "Deleting..." : "Delete"}
              </button>
              <button
                className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                onClick={() => setSelectedRows([])}>
                Clear
              </button>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <AiOutlineLoading3Quarters className="h-8 w-8 animate-spin text-[#2b38d1]" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-lg font-medium">No products found</p>
                <p className="text-sm mt-1">
                  Try adjusting your filters or add a new product
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-borderLight">
                    <th className="w-12 px-5 py-3">
                      <input
                        type="checkbox"
                        checked={
                          selectedRows.length === products.length &&
                          products.length > 0
                        }
                        onChange={toggleAll}
                        className="h-4 w-4 rounded border-borderLight text-[#2b38d1] focus:ring-[#2b38d1]/20"
                      />
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Subcategory
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, idx) => {
                    const isSelected = selectedRows.includes(product.id);
                    return (
                      <tr
                        key={product.id}
                        className={`border-b border-borderLight transition-colors ${
                          isSelected
                            ? "bg-[#2b38d1]/[0.03]"
                            : idx % 2 === 1
                              ? "bg-gray-50/40"
                              : "bg-white"
                        } hover:bg-[#2b38d1]/[0.04]`}>
                        <td className="w-12 px-5 py-3.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRow(product.id)}
                            className="h-4 w-4 rounded border-borderLight text-[#2b38d1] focus:ring-[#2b38d1]/20"
                          />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-gray-300 text-xs">
                                  IMG
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                {product.name}
                              </span>
                              {product.featured && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-amber-100 text-amber-700">
                                  <AiOutlineStar className="h-3 w-3" />
                                  Top
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm text-gray-600">
                            {product.categories?.name || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm text-gray-600">
                            {product.subcategories?.name || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div>
                            <span className="text-sm font-semibold text-gray-900">
                              {product.price?.toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-400 ml-1">
                              QAR
                            </span>
                          </div>
                          {product.sale_price !== null &&
                            product.sale_price < product.price && (
                              <p className="text-xs text-green-600">
                                Sale: {product.sale_price?.toLocaleString()} QAR
                              </p>
                            )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-md ${statusColor(product.status)}`}>
                            {statusLabel(product.status)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-center gap-1">
                            {/* Make Top Product */}
                            <button
                              onClick={() => confirmMakeTop(product)}
                              className={`p-1.5 rounded-md transition-colors ${
                                product.featured
                                  ? "bg-amber-50 text-amber-500 hover:bg-amber-100 hover:text-amber-600"
                                  : "hover:bg-amber-50 text-gray-400 hover:text-amber-500"
                              }`}
                              title={
                                product.featured
                                  ? "Remove from Top Products"
                                  : "Make Top Product"
                              }>
                              <AiOutlineStar className="h-4 w-4" />
                            </button>
                            {/* Edit */}
                            <button
                              onClick={() =>
                                navigateTo(
                                  URLS.admin.viewEditProduct(product.id)
                                )
                              }
                              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-gray-700"
                              title="Edit">
                              <AiOutlineEdit className="h-4 w-4" />
                            </button>
                            {/* Delete */}
                            <button
                              onClick={() => confirmDeleteSingle(product.id)}
                              disabled={deleting}
                              className="p-1.5 hover:bg-red-50 rounded-md transition-colors text-gray-400 hover:text-red-600 disabled:opacity-50"
                              title="Delete">
                              <AiOutlineDelete className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loading && total > 0 && (
            <div className="px-5 py-4 border-t border-borderLight flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-medium text-gray-700">
                  {from}-{to}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-700">{total}</span>{" "}
                products
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-2 border border-borderLight rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <AiOutlineLeft className="h-4 w-4 text-gray-600" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    p =>
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - page) <= 1
                  )
                  .map((p, idx, arr) => (
                    <span key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-1 text-gray-400">…</span>
                      )}
                      <button
                        onClick={() => setPage(p)}
                        className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${
                          p === page
                            ? "bg-[#2b38d1] text-white"
                            : "border border-borderLight hover:bg-gray-50 text-gray-600"
                        }`}>
                        {p}
                      </button>
                    </span>
                  ))}
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="p-2 border border-borderLight rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <AiOutlineRight className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
