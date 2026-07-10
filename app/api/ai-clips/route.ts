import { NextRequest, NextResponse } from "next/server";
import { getAllPublishedClipIds, getClipsByIds } from "@/lib/db/ai-clips";

// Stable seed-based shuffling algorithm (Linear Congruential Generator)
function shuffleWithSeed<T>(array: T[], seed: number): T[] {
    const shuffled = [...array];
    let m = shuffled.length;
    let t;
    let i;
    let currentSeed = seed;
    
    while (m) {
        currentSeed = (currentSeed * 9301 + 49297) % 233280;
        i = Math.floor((currentSeed / 233280) * m--);
        t = shuffled[m];
        shuffled[m] = shuffled[i];
        shuffled[i] = t;
    }
    return shuffled;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.max(1, parseInt(searchParams.get("limit") || "9", 10));
        const seed = parseInt(searchParams.get("seed") || "123456", 10);
        const clipId = searchParams.get("clipId");

        // 1. Fetch all published clip IDs
        const allClips = await getAllPublishedClipIds();
        if (allClips.length === 0) {
            return NextResponse.json({
                clips: [],
                total: 0,
                page,
                limit,
                hasMore: false,
            });
        }

        // 2. Extract requested clip if provided (for sharing)
        const requestedClip = clipId ? allClips.find(c => c.id === clipId) : null;
        const pool = requestedClip ? allClips.filter(c => c.id !== clipId) : allClips;

        // 3. Identify the K newest clips to pin them next
        const K = requestedClip ? 5 : 6;
        
        // Sort by created_at desc to find the newest ones
        const sortedByNewest = [...pool].sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA;
        });

        const newestSubset = sortedByNewest.slice(0, K);
        const newestIds = new Set(newestSubset.map(c => c.id));

        // 4. Shuffling the rest
        const remainingSubset = pool.filter(c => !newestIds.has(c.id));
        const shuffledRemaining = shuffleWithSeed(remainingSubset, seed);

        // 5. Combine: [Requested] + newest + shuffled rest
        const orderedClips = requestedClip 
            ? [requestedClip, ...newestSubset, ...shuffledRemaining]
            : [...newestSubset, ...shuffledRemaining];
            
        const total = orderedClips.length;

        // 5. Slice IDs for the requested page
        const startIndex = (page - 1) * limit;
        const pageClipsSubset = orderedClips.slice(startIndex, startIndex + limit);
        const pageIds = pageClipsSubset.map(x => x.id);

        // 6. Fetch full details of the paginated IDs (in order)
        const clips = await getClipsByIds(pageIds);
        const hasMore = startIndex + limit < total;

        return NextResponse.json({
            clips,
            total,
            page,
            limit,
            hasMore,
        });
    } catch (error) {
        console.error("Error in AI Clips pagination API:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
