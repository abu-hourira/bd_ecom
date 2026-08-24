// components/ui/ConfirmModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Trash2,
  CheckCircle2,
  Info,
  X,
  Lock,
  Loader2,
} from "lucide-react";

export type ModalType = "danger" | "warning" | "info" | "success";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: ModalType;
  isLoading?: boolean;
  requireTypedConfirmation?: string; // If provided, user must type this exact string to confirm
  requireSafetyDelay?: boolean; // If true, disables confirm button for 2 seconds
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm Action",
  cancelText = "Keep it",
  type = "warning",
  isLoading = false,
  requireTypedConfirmation,
  requireSafetyDelay = false,
}: ConfirmModalProps) {
  const [typedValue, setTypedValue] = useState("");
  const [safetyDelayActive, setSafetyDelayActive] = useState(requireSafetyDelay);
  const [countdown, setCountdown] = useState(2);

  useEffect(() => {
    if (isOpen) {
      setTypedValue("");
      if (requireSafetyDelay) {
        setSafetyDelayActive(true);
        setCountdown(2);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              setSafetyDelayActive(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        return () => clearInterval(timer);
      }
    }
  }, [isOpen, requireSafetyDelay]);

  if (!isOpen) return null;

  const isTypeValid =
    !requireTypedConfirmation ||
    typedValue.trim().toLowerCase() === requireTypedConfirmation.trim().toLowerCase();
  const isConfirmDisabled = isLoading || safetyDelayActive || !isTypeValid;

  const getIcon = () => {
    switch (type) {
      case "danger":
        return <Trash2 className="w-6 h-6 text-rose-600" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-amber-600" />;
      case "success":
        return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
      case "info":
      default:
        return <Info className="w-6 h-6 text-forest" />;
    }
  };

  const getHeaderBg = () => {
    switch (type) {
      case "danger":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "warning":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "success":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "info":
      default:
        return "bg-forest-soft text-forest border-forest/20";
    }
  };

  const getConfirmButtonClasses = () => {
    if (type === "danger") {
      return "bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus:ring-rose-500";
    }
    if (type === "warning") {
      return "bg-amber-600 hover:bg-amber-700 text-white shadow-xs focus:ring-amber-500";
    }
    return "bg-forest hover:bg-forest-deep text-white shadow-xs focus:ring-forest";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-paper rounded-3xl border border-line shadow-2xl p-6 sm:p-7 max-w-md w-full space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header with Icon */}
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
                Action Confirmation
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-xl text-ink-soft hover:text-ink hover:bg-bg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Body */}
        <p className="text-xs text-ink/80 leading-relaxed bg-bg p-3.5 rounded-2xl border border-line whitespace-pre-line">
          {message}
        </p>

        {/* Strong Safeguard: Typed Confirmation */}
        {requireTypedConfirmation && (
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-semibold text-ink">
              To proceed, please type <span className="font-mono font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">{requireTypedConfirmation}</span> below:
            </label>
            <input
              type="text"
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              placeholder={`Type "${requireTypedConfirmation}" to confirm`}
              className="w-full px-4 py-2 rounded-xl bg-bg border border-line text-xs font-mono text-ink focus:outline-none focus:border-forest"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-line">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-line text-xs font-semibold text-ink-soft hover:bg-bg hover:text-ink transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirmDisabled}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${getConfirmButtonClasses()}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : safetyDelayActive ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Wait ({countdown}s)</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
