import { navigateTo } from "@mongez/react-router";
import { useEffect, useRef, useState } from "react";
import {
  AiOutlineArrowLeft,
  AiOutlineCloudUpload,
  AiOutlineDelete,
  AiOutlineLoading3Quarters,
  AiOutlineSave,
} from "react-icons/ai";
import { categoryService } from "services/supabase";
import URLS from "shared/utils/urls";

interface Props {
  params?: { id?: string };
}

export default function AddEditCategoryPage({ params }: Props) {
  const categoryId = params?.id;
  const isEditing = Boolean(categoryId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentCategory, setParentCategory] = useState("");
  const [status, setStatus] = useState("active");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [parentCategories, setParentCategories] = useState<
    { id: string; name: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Load parent categories for dropdown
  useEffect(() => {
    categoryService
      .getParentCategories()
      .then(setParentCategories)
      .catch(console.error);
  }, []);

  // Load existing category when editing
  useEffect(() => {
    if (!categoryId) return;
    setLoading(true);
    categoryService
      .getCategoryById(categoryId)
      .then(cat => {
        setName(cat.name);
        setDescription(cat.description || "");
        setParentCategory(cat.parent_id || "");
        setStatus(cat.status);
        setExistingImageUrl(cat.image_url);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [categoryId]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      let imageUrl = existingImageUrl;

      // Upload new image if selected
      if (imageFile) {
        imageUrl = await categoryService.uploadImage(imageFile);
      }

      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        parent_id: parentCategory || null,
        status: status as "active" | "inactive",
        image_url: imageUrl,
      };

      if (isEditing && categoryId) {
        await categoryService.updateCategory(categoryId, payload);
      } else {
        await categoryService.createCategory(payload);
      }
      navigateTo(URLS.admin.categories);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const isSubcategory = parentCategory !== "";
  const currentImageSrc = imagePreview || existingImageUrl;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <AiOutlineLoading3Quarters className="h-8 w-8 animate-spin text-[#2b38d1]" />
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      {/* Header */}
      <div className="bg-[#2b38d1] px-8 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateTo(URLS.admin.categories)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/80">
              <AiOutlineArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {isEditing ? "Edit Category" : "Add Category"}
              </h1>
              <p className="text-sm text-white/70 mt-1">
                {isEditing
                  ? "Update category information"
                  : "Create a new category or subcategory"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo(URLS.admin.categories)}
              className="px-4 py-2.5 border border-white/30 text-white rounded-lg hover:bg-white/10 transition-colors font-medium shadow-md">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2.5 bg-white text-[#2b38d1] rounded-lg hover:bg-white/90 transition-colors flex items-center gap-2 font-medium disabled:opacity-60 shadow-lg shadow-black/15">
              {saving ? (
                <AiOutlineLoading3Quarters className="h-5 w-5 animate-spin" />
              ) : (
                <AiOutlineSave className="h-5 w-5" />
              )}
              {isEditing ? "Update Category" : "Save Category"}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Error banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Parent Category (determines if this is a subcategory) */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-[#2b38d1] px-6 py-4">
              <h2 className="text-lg font-semibold text-white">
                Category Type
              </h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-6">
                Select a parent category to create a subcategory, or leave it
                empty to create a top-level category.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Category
                </label>
                <select
                  value={parentCategory}
                  onChange={e => setParentCategory(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2b38d1] focus:border-transparent outline-none bg-white">
                  <option value="">None (Top-level Category)</option>
                  {parentCategories
                    .filter(c => c.id !== categoryId)
                    .map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Subcategory indicator */}
              {isSubcategory && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <span className="font-medium">Subcategory mode:</span> This
                    category will appear under{" "}
                    <span className="font-semibold">
                      {
                        parentCategories.find(c => c.id === parentCategory)
                          ?.name
                      }
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-[#2b38d1] px-6 py-4">
              <h2 className="text-lg font-semibold text-white">
                Basic Information
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Category Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isSubcategory ? "Subcategory" : "Category"} Name{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={
                      isSubcategory ? "e.g. True Wireless Earbuds" : "e.g. Audio"
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2b38d1] focus:border-transparent outline-none"
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
                    placeholder="Describe this category..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2b38d1] focus:border-transparent outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Category Image */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-[#2b38d1] px-6 py-4">
              <h2 className="text-lg font-semibold text-white">
                Category Image
              </h2>
            </div>
            <div className="p-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageSelect}
              />
              {currentImageSrc ? (
                <div
                  className="relative w-48 h-48 border-2 rounded-xl overflow-hidden group bg-gray-50 cursor-pointer transition-all"
                  style={{ borderColor: isDragOver ? "#2b38d1" : "#e5e7eb" }}
                  onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}>
                  <img
                    src={currentImageSrc}
                    alt="Category"
                    className="w-full h-full object-cover"
                  />
                  {/* Normal hover overlay */}
                  <div className={`absolute inset-0 transition-opacity flex items-center justify-center gap-2 ${isDragOver ? "opacity-0" : "bg-black/40 opacity-0 group-hover:opacity-100"}`}>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 bg-white text-gray-700 rounded-full hover:bg-gray-100 transition-colors">
                      <AiOutlineCloudUpload className="h-5 w-5" />
                    </button>
                    <button
                      onClick={removeImage}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                      <AiOutlineDelete className="h-5 w-5" />
                    </button>
                  </div>
                  {/* Drag-over overlay */}
                  {isDragOver && (
                    <div className="absolute inset-0 bg-[#2b38d1]/70 flex flex-col items-center justify-center gap-2 text-white">
                      <AiOutlineCloudUpload className="h-8 w-8" />
                      <span className="text-xs font-semibold">Drop to replace</span>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={`w-48 h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    isDragOver
                      ? "border-[#2b38d1] bg-[#2b38d1]/5 text-[#2b38d1] scale-[1.02]"
                      : "border-gray-300 text-gray-400 hover:text-[#2b38d1] hover:border-[#2b38d1]"
                  }`}>
                  <AiOutlineCloudUpload className="h-10 w-10" />
                  <span className="text-xs font-medium">{isDragOver ? "Drop to upload" : "Upload or drag image"}</span>
                </button>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Recommended size: 400×400px. Supported formats: JPG, PNG, WebP
              </p>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-[#2b38d1] px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Settings</h2>
            </div>
            <div className="p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={status === "active"}
                      onChange={e => setStatus(e.target.value)}
                      className="w-4 h-4 text-[#2b38d1] focus:ring-[#2b38d1] border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                    <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Visible
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={status === "inactive"}
                      onChange={e => setStatus(e.target.value)}
                      className="w-4 h-4 text-[#2b38d1] focus:ring-[#2b38d1] border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Inactive</span>
                    <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                      Hidden
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Card */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-[#2b38d1] px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Preview</h2>
            </div>
            <div className="p-6">
              <div className="max-w-xs">
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <div className="w-full h-36 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {currentImageSrc ? (
                      <img
                        src={currentImageSrc}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <AiOutlineCloudUpload className="h-10 w-10 text-gray-300" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-semibold text-gray-900">
                        {name || "Category Name"}
                      </h3>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                          status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                        {status === "active" ? "Active" : "Inactive"}
                      </span>
                    </div>
                    {isSubcategory && (
                      <p className="text-xs text-[#2b38d1] font-medium mb-1">
                        ↳ under{" "}
                        {
                          parentCategories.find(c => c.id === parentCategory)
                            ?.name
                        }
                      </p>
                    )}
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {description || "Category description will appear here."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom actions */}
          <div className="flex items-center justify-end gap-3 pb-4">
            <button
              onClick={() => navigateTo(URLS.admin.categories)}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-md">
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
              {isEditing ? "Update Category" : "Save Category"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
