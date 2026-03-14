import { navigateTo } from "@mongez/react-router";
import ConfirmModal, {
  type ConfirmVariant,
} from "app/admin/components/ConfirmModal";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AiOutlineCheck,
  AiOutlineDelete,
  AiOutlineDown,
  AiOutlineEdit,
  AiOutlineLeft,
  AiOutlineLoading3Quarters,
  AiOutlinePlus,
  AiOutlineRight,
  AiOutlineSearch,
  AiOutlineStar,
} from "react-icons/ai";
import { BiCategory } from "react-icons/bi";
import {
  categoryService,
  type CategoryWithChildren,
} from "services/supabase/category.service";
import URLS from "shared/utils/urls";

const PER_PAGE_OPTIONS = [5, 10, 20, 50];

export default function CategoriesPage() {
  /* ── state ─────────────────────────────────────────── */
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [topCategoryIds, setTopCategoryIds] = useState<Set<string>>(new Set());
  const [togglingTop, setTogglingTop] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalParents, setTotalParents] = useState(0);
  const [modal, setModal] = useState<{
    open: boolean;
    id: string;
    name: string;
    action: "delete" | "add-top" | "remove-top";
  }>({ open: false, id: "", name: "", action: "delete" });
  const [modalLoading, setModalLoading] = useState(false);
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

  /* ── fetch categories ──────────────────────────────── */
  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const [res, topIds] = await Promise.all([
        categoryService.getCategoriesWithChildren({
          search: debouncedSearch || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          page,
          perPage,
        }),
        categoryService.getTopCategoryIds(),
      ]);
      setCategories(res.data);
      setTotalParents(res.totalParents);
      setTopCategoryIds(topIds);
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, page, perPage]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  /* ── pagination helpers ────────────────────────────── */
  const totalPages = Math.max(1, Math.ceil(totalParents / perPage));

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

  /* ── expand / collapse ─────────────────────────────── */
  const toggleExpand = (id: string) =>
    setExpandedRows(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id],
    );

  const allExpandable = categories.filter(c => c.subcategories.length > 0);
  const allExpanded =
    allExpandable.length > 0 &&
    allExpandable.every(c => expandedRows.includes(c.id));

  /* ── delete ────────────────────────────────────────── */
  const handleDelete = async (id: string, name: string) => {
    setModal({ open: true, id, name, action: "delete" });
  };

  /* ── toggle top category ────────────────────────────── */
  const handleToggleTop = (id: string, name: string) => {
    const isTop = topCategoryIds.has(id);
    setModal({
      open: true,
      id,
      name,
      action: isTop ? "remove-top" : "add-top",
    });
  };

  /* ── modal confirm handler ──────────────────────────── */
  const handleModalConfirm = async () => {
    const { id, action } = modal;
    setModalLoading(true);
    try {
      if (action === "delete") {
        setDeleting(id);
        await categoryService.deleteCategory(id);
        await loadCategories();
      } else if (action === "add-top") {
        setTogglingTop(id);
        await categoryService.addToTopCategories(id);
        setTopCategoryIds(prev => new Set(prev).add(id));
      } else if (action === "remove-top") {
        setTogglingTop(id);
        await categoryService.removeFromTopCategories(id);
        setTopCategoryIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    } catch (err) {
      console.error(`Failed to ${action}:`, err);
    } finally {
      setModalLoading(false);
      setDeleting(null);
      setTogglingTop(null);
      setModal(m => ({ ...m, open: false }));
    }
  };

  /* ── derived ───────────────────────────────────────── */
  const totalSub = categories.reduce(
    (sum, c) => sum + c.subcategories.length,
    0,
  );

  const fromItem = totalParents === 0 ? 0 : (page - 1) * perPage + 1;
  const toItem = Math.min(page * perPage, totalParents);

  /* ── render ────────────────────────────────────────── */
  return (
    <div className="h-full bg-gray-50 overflow-auto">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="bg-[#2b38d1] px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Categories</h1>
            <p className="text-sm text-white/70 mt-1">
              {totalParents} categories &middot; {totalSub} subcategories
            </p>
          </div>
          <button
            onClick={() => navigateTo(URLS.admin.addCategory)}
            className="px-5 py-2.5 bg-white text-[#2b38d1] rounded-lg hover:bg-white/90 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-black/10">
            <AiOutlinePlus className="h-5 w-5" />
            Add Category
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
                    placeholder="Search categories..."
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

              {/* Expand / Collapse */}
              {allExpandable.length > 0 && (
                <button
                  onClick={() =>
                    setExpandedRows(
                      allExpanded ? [] : allExpandable.map(c => c.id),
                    )
                  }
                  className="px-3.5 py-2 text-xs font-medium border-0 rounded-xl hover:bg-[#2330b0] transition-colors text-white bg-[#2b38d1] shadow-md hover:shadow-lg">
                  {allExpanded ? "Collapse All" : "Expand All"}
                </button>
              )}

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
                  Loading categories…
                </span>
              </div>
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <BiCategory className="h-8 w-8" />
              </div>
              <p className="text-sm font-medium text-gray-500">
                No categories found
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {debouncedSearch
                  ? "Try a different search term"
                  : "Create your first category to get started"}
              </p>
            </div>
          ) : (
            <>
              {/* ── Table ──────────────────────────────────── */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-borderLight">
                      <th className="w-12 px-6 py-3.5" />
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
                        Children
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
                    {categories.map(category => {
                      const isExpanded = expandedRows.includes(category.id);
                      const hasSubs = category.subcategories.length > 0;
                      return (
                        <>
                          {/* ── Parent row ──────────────────── */}
                          <tr
                            key={category.id}
                            className="group bg-white hover:bg-gray-50/60 transition-colors">
                            {/* Expand toggle */}
                            <td className="px-6 py-4">
                              {hasSubs ? (
                                <button
                                  onClick={() => toggleExpand(category.id)}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#2b38d1]/10 transition-colors text-gray-400 hover:text-[#2b38d1]">
                                  <AiOutlineDown
                                    className={`h-3.5 w-3.5 transition-transform duration-300 ${isExpanded ? "rotate-0" : "-rotate-90"}`}
                                  />
                                </button>
                              ) : (
                                <span className="block w-7" />
                              )}
                            </td>

                            {/* Category name + image */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 ring-1 ring-gray-200/60">
                                  {category.image_url ? (
                                    <img
                                      src={category.image_url}
                                      alt={category.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <BiCategory className="h-4.5 w-4.5 text-gray-400" />
                                  )}
                                </div>
                                <div>
                                  <span className="text-sm font-semibold text-gray-900 group-hover:text-[#2b38d1] transition-colors">
                                    {category.name}
                                  </span>
                                  {hasSubs && (
                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                      {category.subcategories.length} subcategor
                                      {category.subcategories.length === 1
                                        ? "y"
                                        : "ies"}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Description */}
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-500 line-clamp-1 max-w-[220px]">
                                {category.description || (
                                  <span className="text-gray-300">—</span>
                                )}
                              </span>
                            </td>

                            {/* Products */}
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 text-xs font-semibold rounded-md bg-gray-100 text-gray-700">
                                {category.product_count}
                              </span>
                            </td>

                            {/* Subcategory count */}
                            <td className="px-6 py-4 text-center">
                              {hasSubs ? (
                                <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 text-xs font-semibold rounded-md bg-[#2b38d1]/8 text-[#2b38d1]">
                                  {category.subcategories.length}
                                </span>
                              ) : (
                                <span className="text-gray-300 text-xs">
                                  &mdash;
                                </span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4 text-center">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                                  category.status === "active"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-gray-100 text-gray-500"
                                }`}>
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    category.status === "active"
                                      ? "bg-emerald-500"
                                      : "bg-gray-400"
                                  }`}
                                />
                                {category.status === "active"
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-1">
                                {/* Top category toggle */}
                                <button
                                  onClick={() =>
                                    handleToggleTop(category.id, category.name)
                                  }
                                  disabled={togglingTop === category.id}
                                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all disabled:opacity-40 ${
                                    topCategoryIds.has(category.id)
                                      ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
                                      : "text-gray-400 hover:text-amber-500 hover:bg-amber-50"
                                  }`}
                                  title={
                                    topCategoryIds.has(category.id)
                                      ? "Already a top category — click to remove"
                                      : "Make top category"
                                  }>
                                  {togglingTop === category.id ? (
                                    <AiOutlineLoading3Quarters className="h-4 w-4 animate-spin" />
                                  ) : topCategoryIds.has(category.id) ? (
                                    <AiOutlineCheck className="h-4 w-4" />
                                  ) : (
                                    <AiOutlineStar className="h-4 w-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() =>
                                    navigateTo(
                                      URLS.admin.viewEditCategory(category.id),
                                    )
                                  }
                                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#2b38d1] hover:bg-[#2b38d1]/10 transition-all"
                                  title="Edit">
                                  <AiOutlineEdit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDelete(category.id, category.name)
                                  }
                                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-40"
                                  title="Delete">
                                  {deleting === category.id ? (
                                    <AiOutlineLoading3Quarters className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <AiOutlineDelete className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* ── Subcategory rows ────────────── */}
                          {isExpanded &&
                            category.subcategories.map((sub, subIdx) => {
                              const isLast =
                                subIdx === category.subcategories.length - 1;
                              return (
                                <tr
                                  key={sub.id}
                                  className={`bg-[#f8faff] hover:bg-[#eef1ff] transition-colors ${!isLast ? "border-b border-borderLight" : ""}`}>
                                  {/* Connector line */}
                                  <td className="px-6 py-3">
                                    <div className="flex justify-center">
                                      <div
                                        className={`w-px bg-[#2b38d1]/15 ${isLast ? "h-3" : "h-full"} relative`}>
                                        <div className="absolute bottom-0 left-0 w-3 h-px bg-[#2b38d1]/15" />
                                      </div>
                                    </div>
                                  </td>

                                  {/* Sub name + image */}
                                  <td className="px-6 py-3">
                                    <div className="flex items-center gap-3 pl-4">
                                      <div className="w-1.5 h-1.5 rounded-full bg-[#2b38d1]/25 flex-shrink-0" />
                                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 ring-1 ring-[#2b38d1]/10">
                                        {sub.image_url ? (
                                          <img
                                            src={sub.image_url}
                                            alt={sub.name}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <BiCategory className="h-3.5 w-3.5 text-[#2b38d1]/40" />
                                        )}
                                      </div>
                                      <span className="text-sm text-gray-700 font-medium">
                                        {sub.name}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Description */}
                                  <td className="px-6 py-3">
                                    <span className="text-sm text-gray-500 line-clamp-1 max-w-[220px]">
                                      {sub.description || (
                                        <span className="text-gray-300">—</span>
                                      )}
                                    </span>
                                  </td>

                                  {/* Products */}
                                  <td className="px-6 py-3 text-center">
                                    <span className="text-xs font-medium text-gray-500">
                                      {sub.product_count}
                                    </span>
                                  </td>

                                  {/* Children (always empty for subs) */}
                                  <td className="px-6 py-3 text-center">
                                    <span className="text-gray-300 text-xs">
                                      &mdash;
                                    </span>
                                  </td>

                                  {/* Status */}
                                  <td className="px-6 py-3 text-center">
                                    <span
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                                        sub.status === "active"
                                          ? "bg-emerald-50 text-emerald-700"
                                          : "bg-gray-100 text-gray-500"
                                      }`}>
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          sub.status === "active"
                                            ? "bg-emerald-500"
                                            : "bg-gray-400"
                                        }`}
                                      />
                                      {sub.status === "active"
                                        ? "Active"
                                        : "Inactive"}
                                    </span>
                                  </td>

                                  {/* Actions */}
                                  <td className="px-6 py-3">
                                    <div className="flex items-center justify-center gap-1">
                                      {/* Top category toggle for sub */}
                                      <button
                                        onClick={() =>
                                          handleToggleTop(sub.id, sub.name)
                                        }
                                        className={`w-7 h-7 flex items-center justify-center rounded-md transition-all disabled:opacity-40 ${
                                          topCategoryIds.has(sub.id)
                                            ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
                                            : "text-gray-400 hover:text-amber-500 hover:bg-amber-50"
                                        }`}
                                        title={
                                          topCategoryIds.has(sub.id)
                                            ? "Already a top category — click to remove"
                                            : "Make top category"
                                        }>
                                        {togglingTop === sub.id ? (
                                          <AiOutlineLoading3Quarters className="h-3.5 w-3.5 animate-spin" />
                                        ) : topCategoryIds.has(sub.id) ? (
                                          <AiOutlineCheck className="h-3.5 w-3.5" />
                                        ) : (
                                          <AiOutlineStar className="h-3.5 w-3.5" />
                                        )}
                                      </button>
                                      <button
                                        onClick={() =>
                                          navigateTo(
                                            URLS.admin.viewEditCategory(sub.id),
                                          )
                                        }
                                        className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-[#2b38d1] hover:bg-[#2b38d1]/10 transition-all"
                                        title="Edit">
                                        <AiOutlineEdit className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDelete(sub.id, sub.name)
                                        }
                                        className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-40"
                                        title="Delete">
                                        {deleting === sub.id ? (
                                          <AiOutlineLoading3Quarters className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                          <AiOutlineDelete className="h-3.5 w-3.5" />
                                        )}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </>
                      );
                    })}
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
                  <span className="font-semibold text-gray-700">
                    {totalParents}
                  </span>{" "}
                  categories
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
        loading={modalLoading}
        onCancel={() => setModal(m => ({ ...m, open: false }))}
        onConfirm={handleModalConfirm}
        {...(modal.action === "delete"
          ? {
              variant: "danger" as ConfirmVariant,
              title: "Delete Category",
              message: `Are you sure you want to delete "${modal.name}"? This action cannot be undone and all subcategories will be removed.`,
              confirmLabel: "Delete",
            }
          : modal.action === "add-top"
            ? {
                variant: "star" as ConfirmVariant,
                title: "Add to Top Categories",
                message: `Make "${modal.name}" a featured top category? It will appear on the Top Categories page.`,
                confirmLabel: "Add to Top",
              }
            : {
                variant: "unstar" as ConfirmVariant,
                title: "Remove from Top Categories",
                message: `Remove "${modal.name}" from top categories? It will no longer be featured.`,
                confirmLabel: "Remove",
              })}
      />
    </div>
  );
}
