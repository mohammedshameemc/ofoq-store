import { navigateTo } from "@mongez/react-router";
import ConfirmModal from "app/admin/components/ConfirmModal";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlineLeft,
  AiOutlineLoading3Quarters,
  AiOutlineRight,
  AiOutlineSearch,
  AiOutlineStar,
} from "react-icons/ai";
import { BiCategory } from "react-icons/bi";
import { categoryService } from "services/supabase/category.service";
import URLS from "shared/utils/urls";

type TopCategory = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  status: "active" | "inactive";
  product_count: number;
  created_at: string;
  updated_at: string;
  top_id: string;
};

const PER_PAGE_OPTIONS = [5, 10, 20, 50];

export default function TopCategoriesPage() {
  /* ── state ─────────────────────────────────────────── */
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categories, setCategories] = useState<TopCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [modal, setModal] = useState<{
    open: boolean;
    topId: string;
    name: string;
  }>({ open: false, topId: "", name: "" });
  const [modalLoading, setModalLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── debounced search ──────────────────────────────── */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  /* ── fetch top categories ──────────────────────────── */
  const loadTopCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await categoryService.getTopCategoriesPaginated({
        search: debouncedSearch || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        page,
        perPage,
      });
      setCategories(res.data as TopCategory[]);
      setTotal(res.total);
    } catch (err) {
      console.error("Failed to load top categories:", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, page, perPage]);

  useEffect(() => {
    loadTopCategories();
  }, [loadTopCategories]);

  /* ── pagination helpers ────────────────────────────── */
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      )
        pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [page, totalPages]);

  /* ── remove from top ───────────────────────────────── */
  const handleRemove = (cat: TopCategory) => {
    setModal({ open: true, topId: cat.top_id, name: cat.name });
  };

  const handleModalConfirm = async () => {
    setModalLoading(true);
    setRemoving(modal.topId);
    try {
      await categoryService.removeTopCategoryById(modal.topId);
      setModal(m => ({ ...m, open: false }));
      await loadTopCategories();
    } catch (err) {
      console.error("Failed to remove:", err);
    } finally {
      setRemoving(null);
      setModalLoading(false);
    }
  };

  /* ── derived ───────────────────────────────────────── */
  const fromItem = total === 0 ? 0 : (page - 1) * perPage + 1;
  const toItem = Math.min(page * perPage, total);

  /* ── render ────────────────────────────────────────── */
  return (
    <div className="h-full bg-gray-50 overflow-auto">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="bg-[#2b38d1] px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Top Categories</h1>
            <p className="text-sm text-white/70 mt-1">
              <AiOutlineStar className="inline h-3.5 w-3.5 text-amber-300 -mt-0.5 mr-1" />
              {total} featured categor{total === 1 ? "y" : "ies"}
            </p>
          </div>
          <button
            onClick={() => navigateTo(URLS.admin.categories)}
            className="px-5 py-2.5 bg-white text-[#2b38d1] rounded-lg hover:bg-white/90 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-black/10">
            <BiCategory className="h-5 w-5" />
            Manage Categories
          </button>
        </div>
      </div>

      <div className="p-8">
        <div className="bg-white rounded-2xl shadow-xl border border-borderLight/80 overflow-hidden">
          {/* ── Toolbar ──────────────────────────────────── */}
          <div className="px-6 py-4 border-b border-borderLight bg-gray-50/40">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="flex-1 min-w-[260px] max-w-md">
                <div className="relative">
                  <AiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search top categories..."
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-borderLight rounded-xl focus:ring-2 focus:ring-[#2b38d1]/20 focus:border-[#2b38d1] outline-none transition-all placeholder:text-gray-400 shadow-sm focus:shadow-md"
                  />
                </div>
              </div>

              {/* Status filter pills */}
              <div className="flex items-center bg-white border border-borderLight rounded-xl p-1 gap-0.5">
                {["all", "active", "inactive"].map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      setStatusFilter(s);
                      setPage(1);
                    }}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all capitalize ${
                      statusFilter === s
                        ? "bg-[#2b38d1] text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}>
                    {s === "all" ? "All" : s}
                  </button>
                ))}
              </div>

              {/* Per-page selector */}
              <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
                <span>Show</span>
                <select
                  value={perPage}
                  onChange={e => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="px-2 py-1.5 border border-borderLight rounded-lg bg-white text-xs focus:ring-2 focus:ring-[#2b38d1]/20 focus:border-[#2b38d1] outline-none shadow-sm">
                  {PER_PAGE_OPTIONS.map(n => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <span>per page</span>
              </div>
            </div>
          </div>

          {/* ── Content ──────────────────────────────────── */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-3">
                <AiOutlineLoading3Quarters className="h-8 w-8 animate-spin text-[#2b38d1]" />
                <span className="text-xs text-gray-400">
                  Loading top categories…
                </span>
              </div>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
                <AiOutlineStar className="h-8 w-8 text-amber-400" />
              </div>
              <p className="text-sm font-medium text-gray-500">
                No top categories yet
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {debouncedSearch
                  ? "Try a different search term"
                  : "Go to Categories and mark some as top categories"}
              </p>
            </div>
          ) : (
            <>
              {/* ── Table ──────────────────────────────────── */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-borderLight">
                      <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                        Category
                      </th>
                      <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                        Description
                      </th>
                      <th className="text-center px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                        Products
                      </th>
                      <th className="text-center px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                        Status
                      </th>
                      <th className="text-center px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-borderLight">
                    {categories.map(cat => (
                      <tr
                        key={cat.top_id}
                        className="group bg-white hover:bg-gray-50/60 transition-colors">
                        {/* Category name + image */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 ring-1 ring-gray-200/60">
                              {cat.image_url ? (
                                <img
                                  src={cat.image_url}
                                  alt={cat.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <BiCategory className="h-4.5 w-4.5 text-gray-400" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900 group-hover:text-[#2b38d1] transition-colors">
                                {cat.name}
                              </span>
                              <AiOutlineStar className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                            </div>
                          </div>
                        </td>

                        {/* Description */}
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500 line-clamp-1 max-w-[220px]">
                            {cat.description || (
                              <span className="text-gray-300">—</span>
                            )}
                          </span>
                        </td>

                        {/* Products */}
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 text-xs font-semibold rounded-md bg-gray-100 text-gray-700">
                            {cat.product_count}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                              cat.status === "active"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-gray-100 text-gray-500"
                            }`}>
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                cat.status === "active"
                                  ? "bg-emerald-500"
                                  : "bg-gray-400"
                              }`}
                            />
                            {cat.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() =>
                                navigateTo(URLS.admin.viewEditCategory(cat.id))
                              }
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#2b38d1] hover:bg-[#2b38d1]/10 transition-all"
                              title="Edit">
                              <AiOutlineEdit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRemove(cat)}
                              disabled={removing === cat.top_id}
                              className="h-8 px-2.5 flex items-center justify-center gap-1.5 rounded-lg text-red-500 bg-red-50 hover:bg-red-100 transition-all text-xs font-medium disabled:opacity-40"
                              title="Remove from top categories">
                              {removing === cat.top_id ? (
                                <AiOutlineLoading3Quarters className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <AiOutlineDelete className="h-3.5 w-3.5" />
                              )}
                              <span className="hidden sm:inline">Remove</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Pagination ──────────────────────────────── */}
              <div className="px-6 py-4 border-t border-borderLight flex items-center justify-between bg-gray-50/30">
                {/* Info text */}
                <p className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-gray-700">
                    {fromItem}–{toItem}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-700">{total}</span>{" "}
                  top categories
                </p>

                {/* Page controls */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    {/* Prev */}
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                      className="w-9 h-9 flex items-center justify-center border border-borderLight rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white">
                      <AiOutlineLeft className="h-3.5 w-3.5 text-gray-600" />
                    </button>

                    {/* Page numbers */}
                    {pageNumbers.map((n, i) =>
                      n === "..." ? (
                        <span
                          key={`dots-${i}`}
                          className="w-9 h-9 flex items-center justify-center text-xs text-gray-400">
                          …
                        </span>
                      ) : (
                        <button
                          key={n}
                          onClick={() => setPage(n as number)}
                          className={`min-w-[36px] h-9 px-1 rounded-xl text-sm font-medium transition-all ${
                            page === n
                              ? "bg-[#2b38d1] text-white shadow-sm shadow-[#2b38d1]/25"
                              : "bg-white border border-borderLight text-gray-600 hover:bg-gray-50"
                          }`}>
                          {n}
                        </button>
                      ),
                    )}

                    {/* Next */}
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage(p => p + 1)}
                      className="w-9 h-9 flex items-center justify-center border border-borderLight rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white">
                      <AiOutlineRight className="h-3.5 w-3.5 text-gray-600" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Confirm Modal ──────────────────────────────── */}
      <ConfirmModal
        open={modal.open}
        variant="unstar"
        title="Remove from Top Categories"
        message={`Remove "${modal.name}" from top categories? It will no longer be featured.`}
        confirmLabel="Remove"
        loading={modalLoading}
        onConfirm={handleModalConfirm}
        onCancel={() => setModal(m => ({ ...m, open: false }))}
      />
    </div>
  );
}
