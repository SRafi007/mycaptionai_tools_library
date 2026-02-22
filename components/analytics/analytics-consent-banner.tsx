"use client";

import { useEffect, useState } from "react";

const CONSENT_KEY = "mc_analytics_consent";

type ConsentState = "granted" | "denied" | "unknown";

function readConsent(): ConsentState {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (raw === "granted" || raw === "denied") return raw;
    return "unknown";
}

export default function AnalyticsConsentBanner() {
    const [consent, setConsent] = useState<ConsentState>("unknown");

    useEffect(() => {
        setConsent(readConsent());
    }, []);

    if (consent !== "unknown") return null;

    function setChoice(value: "granted" | "denied") {
        window.localStorage.setItem(CONSENT_KEY, value);
        setConsent(value);
    }

    return (
        <div
            role="dialog"
            aria-live="polite"
            aria-label="Analytics consent"
            style={{
                position: "fixed",
                left: 16,
                right: 16,
                bottom: 16,
                zIndex: 1000,
                background: "#111",
                color: "#fff",
                borderRadius: 12,
                padding: "12px 14px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                alignItems: "center",
                justifyContent: "space-between",
            }}
        >
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.4 }}>
                We use privacy-safe analytics to improve the site. You can accept or decline.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
                <button
                    type="button"
                    onClick={() => setChoice("denied")}
                    style={{
                        border: "1px solid #666",
                        background: "transparent",
                        color: "#fff",
                        borderRadius: 8,
                        padding: "7px 12px",
                        cursor: "pointer",
                    }}
                >
                    Decline
                </button>
                <button
                    type="button"
                    onClick={() => setChoice("granted")}
                    style={{
                        border: "1px solid #fff",
                        background: "#fff",
                        color: "#111",
                        borderRadius: 8,
                        padding: "7px 12px",
                        cursor: "pointer",
                        fontWeight: 600,
                    }}
                >
                    Accept Analytics
                </button>
            </div>
        </div>
    );
}

