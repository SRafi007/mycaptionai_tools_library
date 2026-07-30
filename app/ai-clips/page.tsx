import { Metadata } from "next";
import { Suspense } from "react";
import AIClipsLayout from "@/components/ai-clips/ai-clips-layout";
import AIClipsSkeleton from "@/components/ai-clips/ai-clips-skeleton";
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
        <Suspense fallback={<AIClipsSkeleton />}>
            <AIClipsLayout />
        </Suspense>
    );
}

