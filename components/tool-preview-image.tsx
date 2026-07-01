"use client";

import { useState } from "react";

interface ToolPreviewImageProps {
    name: string;
    imageUrl: string | null | undefined;
}

export default function ToolPreviewImage({ name, imageUrl }: ToolPreviewImageProps) {
    const [hasError, setHasError] = useState(false);

    function getInitials(toolName: string): string {
        const parts = toolName
            .split(/\s+/)
            .map((part) => part.trim())
            .filter(Boolean);

        if (parts.length === 0) return "?";
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    if (imageUrl && !hasError) {
        return (
            <img
                src={imageUrl}
                alt={`${name} screenshot preview`}
                className="w-full h-full object-cover"
                onError={() => setHasError(true)}
            />
        );
    }

    return (
        <div 
            className="flex flex-col items-center justify-center p-6 text-center h-full w-full dot-grid relative" 
            style={{ 
                minHeight: "100%", 
                background: "var(--bg-secondary)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            <div 
                className="flex items-center justify-center rounded-xl" 
                style={{ 
                    width: "56px", 
                    height: "56px", 
                    marginBottom: "12px", 
                    zIndex: 2,
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-default)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "var(--shadow-soft)"
                }}
            >
                <span style={{ fontSize: "20px", fontWeight: "bold", color: "var(--brand)" }}>
                    {getInitials(name)}
                </span>
            </div>
            <div style={{ zIndex: 2 }}>
                <span style={{ display: "block", fontSize: "14px", fontWeight: "bold", color: "var(--text-primary)" }}>{name}</span>
                <span style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>Live preview unavailable</span>
            </div>
        </div>
    );
}
