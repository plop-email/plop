"use client";

import { useToast } from "@/hooks/use-toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-4"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <output
          key={toast.id}
          className="pointer-events-auto w-full max-w-sm border border-white/12 bg-[#111418] px-4 py-3 text-white shadow-lg"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              {toast.title && (
                <p className="text-sm font-semibold text-white">
                  {toast.title}
                </p>
              )}
              {toast.description && (
                <p className="text-sm text-[#A3A7AE]">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              className="text-xs text-[#A3A7AE] hover:text-white"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              Close
            </button>
          </div>
        </output>
      ))}
    </div>
  );
}
