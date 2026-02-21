import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

import { getSearchSuggestions } from "@/lib/db/tools";

export async function GET(request: NextRequest) {
    const q = request.nextUrl.searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
        return NextResponse.json([]);
    }

    const suggestions = await getSearchSuggestions(q, 5);
    return NextResponse.json(suggestions);
}
