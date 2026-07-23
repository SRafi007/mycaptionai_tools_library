"use server";

import { incrementToolUpvotes } from "@/lib/db/tools";
import { revalidatePath } from "next/cache";

export async function upvoteToolAction(toolId: string, slug?: string, revalidatePaths: string[] = []) {
    if (!toolId) return { success: false, upvotes: null };

    const newCount = await incrementToolUpvotes(toolId);

    if (newCount !== null) {
        if (slug) {
            revalidatePath(`/tools/${slug}`);
        }
        revalidatePath("/top-rated");
        for (const path of revalidatePaths) {
            if (path.startsWith("/")) {
                revalidatePath(path);
            }
        }
    }

    return {
        success: newCount !== null,
        upvotes: newCount,
    };
}
