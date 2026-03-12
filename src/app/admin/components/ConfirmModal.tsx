import { useEffect, useRef } from "react";
import {
  AiOutlineClose,
  AiOutlineDelete,
  AiOutlineLoading3Quarters,
  AiOutlineStar,
  AiOutlineWarning,
} from "react-icons/ai";

export type ConfirmVariant = "danger" | "warning" | "star" | "unstar";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const variantConfig: Record<
  ConfirmVariant,
  {
    icon: React.ReactNode;
    iconBg: string;
    btnClass: string;
  }
> = {
  danger: {
    icon: <AiOutlineDelete className="h-6 w-6 text-red-600" />,
    iconBg: "bg-red-100",
    btnClass: "bg-[#2b38d1] hover:bg-[#2330b0] shadow-[#2b38d1]/20",
  },
  warning: {
    icon: <AiOutlineWarning className="h-6 w-6 text-amber-600" />,
    iconBg: "bg-amber-100",
    btnClass: "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20",
  },
  star: {
    icon: <AiOutlineStar className="h-6 w-6 text-amber-500" />,
    iconBg: "bg-amber-50",
    btnClass: "bg-[#2b38d1] hover:bg-[#2330b0] shadow-[#2b38d1]/20",
  },
  unstar: {
    icon: <AiOutlineStar className="h-6 w-6 text-gray-500" />,
    iconBg: "bg-gray-100",
    btnClass: "bg-[#2b38d1] hover:bg-[#2330b0] shadow-[#2b38d1]/20",
  },
};

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const cfg = variantConfig[variant];

  // Focus cancel button on open
  useEffect(() => {
    if (open) cancelBtnRef.current?.focus();
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={e => {
        if (e.target === overlayRef.current && !loading) onCancel();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in"
      style={{ animation: "fadeIn 150ms ease-out" }}>
      <div
        className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: "scaleIn 200ms ease-out" }}>
        {/* Header */}
        <div className="flex items-start gap-4 p-6 pb-2">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.iconBg}`}>
            {cfg.icon}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              {message}
            </p>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all flex-shrink-0 disabled:opacity-40"
            aria-label="Close">
            <AiOutlineClose className="h-4 w-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4">
          <button
            ref={cancelBtnRef}
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2 ${cfg.btnClass}`}>
            {loading && (
              <AiOutlineLoading3Quarters className="h-3.5 w-3.5 animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
