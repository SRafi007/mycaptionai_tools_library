import { Metadata } from "next";
import { Suspense } from "react";
import AIClipsLayout from "@/components/ai-clips/ai-clips-layout";
import { absoluteUrl } from "@/lib/seo";
import "./ai-clips.css";

export const metadata: Metadata = {
    title: "AI Clips - High Retention Reels Feed",
    description: "Browse the sharpest, high-retention AI video shorts on the internet, integrated with MyCaptionAI dynamic karaoke subtitling.",
    alternates: {
        canonical: absoluteUrl("/ai-clips"),
    },
};

export default function AIClipsPage() {
    return (
        <Suspense 
            fallback={
                <div className="clips-root">
                    <div className="clips-loader">
                        <div className="clips-spinner" />
                        <p>Loading AI Clips Feed...</p>
                    </div>
                </div>
            }
        >
            <AIClipsLayout />
        </Suspense>
    );
}
