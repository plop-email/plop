"use client";

import { useEffect, useState } from "react";

type Toast = {
  id: string;
  title?: string;
  description?: string;
  duration?: number;
};

type ToastState = {
  toasts: Toast[];
};

const listeners = new Set<(state: ToastState) => void>();
let memoryState: ToastState = { toasts: [] };
let toastCount = 0;

const notify = () => {
  for (const listener of listeners) {
    listener(memoryState);
  }
};

const addToast = (toast: Toast) => {
  memoryState = { toasts: [toast, ...memoryState.toasts].slice(0, 5) };
  notify();
};

const dismissToast = (toastId: string) => {
  memoryState = {
    toasts: memoryState.toasts.filter((toast) => toast.id !== toastId),
  };
  notify();
};

const toast = (payload: Omit<Toast, "id">) => {
  const id = `${++toastCount}`;
  const duration = payload.duration ?? 3000;

  addToast({ id, ...payload, duration });

  if (duration > 0) {
    setTimeout(() => dismissToast(id), duration);
  }

  return { id, dismiss: () => dismissToast(id) };
};

export function useToast() {
  const [state, setState] = useState<ToastState>(memoryState);

  useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: dismissToast,
  };
}

export type { Toast };
