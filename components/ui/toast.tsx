"use client";

import React, { useState, useEffect } from "react";

export interface ToastMessage {
    id: string;
    message: string;
    type?: "success" | "info" | "error";
}

type ToastListener = (toast: ToastMessage) => void;
const listeners = new Set<ToastListener>();

/**
 * Trigger a toast notification from anywhere in client components.
 */
export function showToast(message: string, type: ToastMessage["type"] = "success") {
    const toast: ToastMessage = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        message,
        type,
    };
    listeners.forEach((listener) => listener(toast));
}

export function ToastContainer() {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        const handler: ToastListener = (newToast) => {
            setToasts((prev) => [...prev.slice(-3), newToast]); // keep max 4 toasts

            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
            }, 3000);
        };

        listeners.add(handler);
        return () => {
            listeners.delete(handler);
        };
    }, []);

    if (toasts.length === 0) return null;

    return (
        <div
            style={{
                position: "fixed",
                bottom: "24px",
                right: "24px",
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                pointerEvents: "none",
            }}
        >
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`toast-banner toast-${toast.type || "success"}`}
                    style={{
                        padding: "10px 16px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#fff",
                        backgroundColor:
                            toast.type === "error"
                                ? "rgba(225, 29, 72, 0.95)"
                                : toast.type === "info"
                                ? "rgba(99, 102, 241, 0.95)"
                                : "rgba(16, 185, 129, 0.95)",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        backdropFilter: "blur(8px)",
                        pointerEvents: "auto",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        animation: "toast-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                >
                    <span>
                        {toast.type === "error" ? "❌" : toast.type === "info" ? "ℹ️" : "✓"}
                    </span>
                    <span>{toast.message}</span>
                </div>
            ))}
        </div>
    );
}
