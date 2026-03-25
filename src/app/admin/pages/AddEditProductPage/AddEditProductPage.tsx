import { navigateTo } from "@mongez/react-router";
import { useEffect, useRef, useState } from "react";
import {
  AiOutlineArrowLeft,
  AiOutlineCloudUpload,
  AiOutlineDelete,
  AiOutlineLoading3Quarters,
  AiOutlinePlus,
  AiOutlineSave,
} from "react-icons/ai";
import { categoryService, productService } from "services/supabase";
import { useTags } from "shared/hooks/use-tags";
import URLS from "shared/utils/urls";

interface ProductImage {
  id: string;
  url: string;
  file?: File;
  sort_order: number;
}

interface SelectedTag {
  id: string; // tag UUID from DB
  name: string;
  sort_order: number;
}

interface Props {
  params?: { id?: string };
}

export default function AddEditProductPage({ params }: Props) {
  const productId = params?.id;
  const isEditing = Boolean(productId);

  // ─── Form state ──────────────────────────────────
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [status, setStatus] = useState("active");
  const [featured, setFeatured] = useState(false);

  // Specs
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);

  const MAX_SPECS = 5;
  const addSpec = () => setSpecs(prev => [...prev, { key: '', value: '' }]);

  const updateSpec = (index: number, field: 'key' | 'value', val: string) =>
    setSpecs(prev => prev.map((s, i) => i === index ? { ...s, [field]: val } : s));

  const removeSpec = (index: number) =>
    setSpecs(prev => prev.filter((_, i) => i !== index));


  // Tags
  const [selectedTags, setSelectedTags] = useState<SelectedTag[]>([]);
  const [tagsOpen, setTagsOpen] = useState(false);
  const tagsRef = useRef<HTMLDivElement>(null);
  const MAX_TAGS = 5;

  // Images
  const [images, setImages] = useState<ProductImage[]>([]);
  const MAX_IMAGES = 5;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Categories from DB
  const [categories, setCategories] = useState<
    { id: string; name: string; children: { id: string; name: string }[] }[]
  >([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tags from DB
  const { tags: availableTags, isLoading: tagsLoading } = useTags();

  // ─── Load categories ─────────────────────────────
  useEffect(() => {
    categoryService
      .getCategoriesWithChildren()
      .then(result => {
        const cats = result.data;
        const mapped = cats.map((c: any) => ({
          id: c.id,
          name: c.name,
          children: (c.subcategories || []).map((s: any) => ({
            id: s.id,
            name: s.name,
          })),
        }));
        setCategories(mapped);
      })
      .catch(console.error);
  }, []);

  // ─── Load product when editing ───────────────────
  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    productService
      .getProductById(productId)
      .then(p => {
        setName(p.name);
        setDescription(p.description || "");
        setShortDescription(p.short_description || "");
        setPrice(String(p.price));
        setSalePrice(p.sale_price ? String(p.sale_price) : "");
        setStock(String(p.stock));
        setCategory(p.category_id || "");
        setSubcategory(p.subcategory_id || "");
        setStatus(p.status);
        setFeatured(p.featured);
        // Map tags
        if (p.product_tags) {
          setSelectedTags(
            p.product_tags
              .sort((a, b) => a.sort_order - b.sort_order)
              .map(pt => ({
                id: pt.tags.id,
                name: pt.tags.name,
                sort_order: pt.sort_order,
              }))
          );
        }
        // Map images
        if (p.product_images) {
          setImages(
            p.product_images
              .sort((a, b) => a.sort_order - b.sort_order)
              .map(pi => ({
                id: pi.id,
                url: pi.image_url,
                sort_order: pi.sort_order,
              }))
          );
        }
        // Map specs
        if (p.specifications) {
          setSpecs(
            [...p.specifications]
              .sort((a, b) => a.sort_order - b.sort_order)
              .map(s => ({ key: s.key, value: s.value }))
          );
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [productId]);

  // ─── Close tags dropdown on outside click ────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tagsRef.current && !tagsRef.current.contains(e.target as Node)) {
        setTagsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ─── Tag helpers ─────────────────────────────────
  const getTagColor = (tagName: string) =>
    availableTags.find(t => t.name === tagName)?.color ?? "#2b38d1";

  const getTagId = (tagName: string) =>
    availableTags.find(t => t.name === tagName)?.id ?? "";

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev => {
      if (prev.find(t => t.name === tagName)) {
        return prev
          .filter(t => t.name !== tagName)
          .map((t, i) => ({ ...t, sort_order: i }));
      }
      if (prev.length >= MAX_TAGS) return prev;
      return [
        ...prev,
        { id: getTagId(tagName), name: tagName, sort_order: prev.length },
      ];
    });
  };

  const removeTag = (tagName: string) => {
    setSelectedTags(prev =>
      prev
        .filter(t => t.name !== tagName)
        .map((t, i) => ({ ...t, sort_order: i }))
    );
  };

  // ─── Image helpers ───────────────────────────────
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    addImageFiles(Array.from(files));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addImageFiles = (files: File[]) => {
    const newImages: ProductImage[] = [];
    const currentCount = images.length;
    for (let i = 0; i < files.length && currentCount + newImages.length < MAX_IMAGES; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      newImages.push({
        id: `new-${Date.now()}-${i}`,
        url: URL.createObjectURL(file),
        file,
        sort_order: currentCount + newImages.length,
      });
    }
    setImages(prev => [...prev, ...newImages]);
  };

  const handleDropImages = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    addImageFiles(files);
  };

  const removeImage = (id: string) => {
    setImages(prev =>
      prev
        .filter(img => img.id !== id)
        .map((img, i) => ({ ...img, sort_order: i }))
    );
  };

  // ─── Derived state ──────────────────────────────
  const selectedCategory = categories.find(c => c.id === category);
  const subcategories = selectedCategory?.children || [];

  const discount =
    price && salePrice && Number(salePrice) < Number(price)
      ? Math.round((1 - Number(salePrice) / Number(price)) * 100)
      : 0;

  // ─── Save handler ───────────────────────────────
  const handleSave = async () => {
    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (!price || Number(price) <= 0) {
      setError("Price must be greater than 0.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // 1. Upload any new image files
      const uploadedImages: { image_url: string; sort_order: number }[] = [];
      for (const img of images) {
        if (img.file) {
          const url = await productService.uploadProductImage(img.file);
          uploadedImages.push({ image_url: url, sort_order: img.sort_order });
        } else if (img.url) {
          uploadedImages.push({
            image_url: img.url,
            sort_order: img.sort_order,
          });
        }
      }

      // 2. Build payload
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        short_description: shortDescription.trim() || undefined,
        price: Number(price),
        sale_price: salePrice ? Number(salePrice) : null,
        discount,
        stock: stock ? Number(stock) : 0,
        category_id: category || null,
        subcategory_id: subcategory || null,
        image_url: uploadedImages[0]?.image_url || null,
        featured,
        status: status as any,
        tags: selectedTags.map(t => ({
          tag_id: t.id,
          sort_order: t.sort_order,
        })),
        images: uploadedImages,
        specifications: specs
          .filter(s => s.key.trim())
          .map((s, i) => ({ key: s.key.trim(), value: s.value.trim(), sort_order: i })),
      };

      if (isEditing && productId) {
        await productService.updateFullProduct(productId, payload);
      } else {
        await productService.createFullProduct(payload);
      }

      navigateTo(URLS.admin.products);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // ─── Loading state ──────────────────────────────
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <AiOutlineLoading3Quarters className="h-8 w-8 animate-spin text-[#2b38d1]" />
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────
  return (
    <div className="h-full bg-gray-50 overflow-auto">
      {/* Header */}
      <div className="bg-[#2b38d1] px-8 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateTo(URLS.admin.products)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/80">
              <AiOutlineArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {isEditing ? "Edit Product" : "Add Product"}
              </h1>
              <p className="text-sm text-white/70 mt-1">
                {isEditing
                  ? "Update product information"
                  : "Create a new product for your store"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo(URLS.admin.products)}
              className="px-4 py-2.5 border border-white/30 text-white rounded-lg hover:bg-white/10 transition-colors font-medium shadow-md">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2.5 bg-white text-[#2b38d1] rounded-lg hover:bg-white/90 transition-colors flex items-center gap-2 font-medium disabled:opacity-60 shadow-lg shadow-black/10">
              {saving ? (
                <AiOutlineLoading3Quarters className="h-5 w-5 animate-spin" />
              ) : (
                <AiOutlineSave className="h-5 w-5" />
              )}
              {isEditing ? "Update Product" : "Save Product"}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Error banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-[#2b38d1] px-6 py-4">
              <h2 className="text-base font-semibold text-white">
                Basic Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Sony WH-1000XM5 Headphones"
                    className="w-full px-4 py-2.5 border border-borderLight rounded-lg focus:ring-2 focus:ring-[#2b38d1] focus:border-transparent outline-none"
                  />
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={shortDescription}
                    onChange={e => setShortDescription(e.target.value)}
                    placeholder="Brief summary of the product"
                    className="w-full px-4 py-2.5 border border-borderLight rounded-lg focus:ring-2 focus:ring-[#2b38d1] focus:border-transparent outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Detailed product description..."
                    rows={4}
                    className="w-full px-4 py-2.5 border border-borderLight rounded-lg focus:ring-2 focus:ring-[#2b38d1] focus:border-transparent outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-[#2b38d1] px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Specifications</h2>
              <span className={`text-xs font-medium ${specs.length >= MAX_SPECS ? 'text-red-300' : 'text-white/60'}`}>
                {specs.length}/{MAX_SPECS}
              </span>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {specs.map((spec, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={spec.key}
                      onChange={e => updateSpec(i, 'key', e.target.value)}
                      placeholder="e.g. Screen Size"
                      className="flex-1 px-4 py-2.5 border border-borderLight rounded-lg focus:ring-2 focus:ring-[#2b38d1] focus:border-transparent outline-none text-sm"
                    />
                    <span className="text-gray-400 font-medium text-sm flex-shrink-0">—</span>
                    <input
                      type="text"
                      value={spec.value}
                      onChange={e => updateSpec(i, 'value', e.target.value)}
                      placeholder="e.g. 10.9 inch"
                      className="flex-1 px-4 py-2.5 border border-borderLight rounded-lg focus:ring-2 focus:ring-[#2b38d1] focus:border-transparent outline-none text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeSpec(i)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}

                {specs.length < MAX_SPECS && (
                  <button
                    type="button"
                    onClick={addSpec}
                    className="mt-1 flex items-center gap-2 text-sm text-[#2b38d1] hover:text-[#2330b0] font-medium transition-colors">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                    Add Specification
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-[#2b38d1] px-6 py-4">
              <h2 className="text-base font-semibold text-white">Pricing </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                      QAR
                    </span>
                    <input
                      type="number"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-14 pr-4 py-2.5 border border-borderLight rounded-lg focus:ring-2 focus:ring-[#2b38d1] focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Sale Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sale Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                      QAR
                    </span>
                    <input
                      type="number"
                      value={salePrice}
                      onChange={e => setSalePrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-14 pr-4 py-2.5 border border-borderLight rounded-lg focus:ring-2 focus:ring-[#2b38d1] focus:border-transparent outline-none"
                    />
                  </div>
                  {discount > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      {discount}% discount
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Category & Organization */}
          <div className="bg-white rounded-xl shadow-xl">
            <div className="bg-[#2b38d1] px-6 py-4 rounded-t-xl">
              <h2 className="text-base font-semibold text-white">
                Category & Organization
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={e => {
                      setCategory(e.target.value);
                      setSubcategory("");
                    }}
                    className="w-full px-4 py-2.5 border border-borderLight rounded-lg focus:ring-2 focus:ring-[#2b38d1] focus:border-transparent outline-none bg-white">
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory
                  </label>
                  <select
                    value={subcategory}
                    onChange={e => setSubcategory(e.target.value)}
                    disabled={!category || subcategories.length === 0}
                    className="w-full px-4 py-2.5 border border-borderLight rounded-lg focus:ring-2 focus:ring-[#2b38d1] focus:border-transparent outline-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed">
                    <option value="">
                      {!category
                        ? "Select a category first"
                        : subcategories.length === 0
                          ? "No subcategories"
                          : "Select a subcategory"}
                    </option>
                    {subcategories.map(sub => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div className="md:col-span-2" ref={tagsRef}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Tags
                    </label>
                    <span className={`text-xs font-medium ${selectedTags.length >= MAX_TAGS ? 'text-red-500' : 'text-gray-400'}`}>
                      {selectedTags.length}/{MAX_TAGS}
                    </span>
                  </div>
                  <div className="relative">
                    {/* Selected chips + trigger */}
                    <div
                      onClick={() => setTagsOpen(o => !o)}
                      className="min-h-[44px] w-full px-3 py-2 border border-borderLight rounded-lg cursor-pointer focus-within:ring-2 focus-within:ring-[#2b38d1] focus-within:border-transparent flex flex-wrap gap-2 items-center bg-white">
                      {selectedTags.length === 0 && (
                        <span className="text-gray-400 text-sm select-none">
                          Select up to {MAX_TAGS} tags…
                        </span>
                      )}
                      {selectedTags.map(tag => {
                        const color = getTagColor(tag.name);
                        return (
                          <span
                            key={tag.name}
                            style={{ backgroundColor: color + '18', color, borderColor: color + '55' }}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded border">
                            {tag.name.toUpperCase()}
                            <button
                              type="button"
                              onClick={e => { e.stopPropagation(); removeTag(tag.name); }}
                              style={{ backgroundColor: color }}
                              className="w-4 h-4 rounded-full text-white flex items-center justify-center hover:opacity-80 transition-opacity flex-shrink-0">
                              <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="currentColor">
                                <path d="M6.41 5l2.3-2.29a1 1 0 00-1.42-1.42L5 3.59 2.71 1.29A1 1 0 001.29 2.71L3.59 5 1.29 7.29a1 1 0 101.42 1.42L5 6.41l2.29 2.3a1 1 0 001.42-1.42z"/>
                              </svg>
                            </button>
                          </span>
                        );
                      })}
                      <span className="ml-auto text-gray-400">
                        <svg viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 transition-transform ${tagsOpen ? 'rotate-180' : ''}`}>
                          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd"/>
                        </svg>
                      </span>
                    </div>

                    {/* Dropdown list */}
                    {tagsOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-borderLight rounded-lg shadow-lg max-h-52 overflow-auto">
                        {tagsLoading && (
                          <div className="flex items-center justify-center gap-2 px-4 py-4 text-sm text-gray-400">
                            <AiOutlineLoading3Quarters className="animate-spin h-4 w-4" />
                            Loading tags…
                          </div>
                        )}
                        {!tagsLoading && selectedTags.length >= MAX_TAGS && (
                          <p className="px-4 py-2.5 text-xs text-amber-600 bg-amber-50 border-b border-amber-100">
                            Maximum {MAX_TAGS} tags reached. Remove a tag to add another.
                          </p>
                        )}
                        {!tagsLoading && availableTags
                          .filter(t => !selectedTags.find(s => s.name === t.name))
                          .map(tag => (
                            <button
                              key={tag.name}
                              type="button"
                              disabled={selectedTags.length >= MAX_TAGS}
                              onClick={() => toggleTag(tag.name)}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed">
                              <span
                                style={{ backgroundColor: tag.color }}
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0" />
                              {tag.name}
                            </button>
                          ))}
                        {!tagsLoading && availableTags.filter(t => !selectedTags.find(s => s.name === t.name)).length === 0 && (
                          <p className="px-4 py-3 text-sm text-gray-400">All tags selected</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full px-4 py-2.5 border border-borderLight rounded-lg focus:ring-2 focus:ring-[#2b38d1] focus:border-transparent outline-none bg-white">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>

                {/* Featured */}
                <div className="flex items-center mt-8">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={featured}
                        onChange={e => setFeatured(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-[#2b38d1] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-borderLight after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2b38d1]"></div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Top Product
                      </span>
                      <p className="text-xs text-gray-400">
                        Display this product in top products section
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-[#2b38d1] px-6 py-4">
              <h2 className="text-base font-semibold text-white">
                Product Images
              </h2>
            </div>

            <div className="p-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleImageSelect}
              />
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {/* Existing images */}
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    className="relative aspect-square border-2 border-borderLight rounded-xl overflow-hidden group bg-gray-50 shadow-md">
                    {img.url ? (
                      <img
                        src={img.url}
                        alt={`Product ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <AiOutlineCloudUpload className="h-10 w-10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => removeImage(img.id)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                        <AiOutlineDelete className="h-5 w-5" />
                      </button>
                    </div>
                    <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                  </div>
                ))}

                {/* Upload button — hidden when limit reached */}
                {images.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDropImages}
                    className={`aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      isDragOver
                        ? "border-[#2b38d1] bg-[#2b38d1]/5 text-[#2b38d1] scale-[1.02] shadow-lg"
                        : "border-borderLight text-gray-400 hover:text-[#2b38d1] hover:border-[#2b38d1] hover:shadow-md"
                    }`}>
                    <AiOutlinePlus className="h-8 w-8" />
                    <span className="text-xs font-medium text-center leading-tight">
                      {isDragOver ? "Drop here" : "Add Image"}
                    </span>
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Upload up to {MAX_IMAGES} images. Recommended size: 800x800px. Supported
                formats: JPG, PNG, WebP
              </p>
            </div>
          </div>

          {/* Bottom actions */}
          <div className="flex items-center justify-end gap-3 pb-4">
            <button
              onClick={() => navigateTo(URLS.admin.products)}
              className="px-6 py-2.5 border border-borderLight text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-md">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-[#2b38d1] text-white rounded-lg hover:bg-[#2330b0] transition-colors flex items-center gap-2 font-medium disabled:opacity-60 shadow-lg shadow-[#2b38d1]/30">
              {saving ? (
                <AiOutlineLoading3Quarters className="h-5 w-5 animate-spin" />
              ) : (
                <AiOutlineSave className="h-5 w-5" />
              )}
              {isEditing ? "Update Product" : "Save Product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
