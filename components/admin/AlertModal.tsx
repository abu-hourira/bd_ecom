"use client";

import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "success" | "error" | "info" | "warning";
}

export default function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
}: AlertModalProps) {
  if (!isOpen) return null;

  const icons = {
    success: <CheckCircle2 className="w-8 h-8 text-emerald-500" />,
    error: <XCircle className="w-8 h-8 text-rose-500" />,
    warning: <AlertTriangle className="w-8 h-8 text-amber-500" />,
    info: <Info className="w-8 h-8 text-blue-500" />,
  };

  const bgStyles = {
    success: "bg-emerald-50 text-emerald-900 border-emerald-200",
    error: "bg-rose-50 text-rose-900 border-rose-200",
    warning: "bg-amber-50 text-amber-900 border-amber-200",
    info: "bg-blue-50 text-blue-900 border-blue-200",
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {icons[type]}
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className={`p-4 rounded-2xl border text-sm font-medium ${bgStyles[type]}`}>
          {message}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
