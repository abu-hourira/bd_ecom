// components/ui/AlertModal.tsx
"use client";

import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  X,
} from "lucide-react";

export type AlertType = "success" | "error" | "warning" | "info";

export interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: AlertType;
  buttonText?: string;
}

export default function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  buttonText = "Understood",
}: AlertModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
      case "error":
        return <XCircle className="w-6 h-6 text-rose-600" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-amber-600" />;
      case "info":
      default:
        return <Info className="w-6 h-6 text-forest" />;
    }
  };

  const getHeaderBg = () => {
    switch (type) {
      case "success":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "error":
        return "bg-rose-50 text-rose-800 border-rose-200";
      case "warning":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "info":
      default:
        return "bg-forest-soft text-forest border-forest/20";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-paper rounded-3xl border border-line shadow-2xl p-6 sm:p-7 max-w-md w-full space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${getHeaderBg()}`}>
              {getIcon()}
            </div>
            <div>
              <h3 className="font-bold font-display text-lg text-ink leading-tight">
                {title}
              </h3>
              <span className="text-[11px] font-mono uppercase tracking-wider text-ink-soft">
                Notification
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-ink-soft hover:text-ink hover:bg-bg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message */}
        <p className="text-xs text-ink/80 leading-relaxed bg-bg p-3.5 rounded-2xl border border-line whitespace-pre-line">
          {message}
        </p>

        {/* Action Button */}
        <div className="flex items-center justify-end pt-2 border-t border-line">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-forest hover:bg-forest-deep text-white text-xs font-bold shadow-premium transition-all cursor-pointer active:scale-95"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
