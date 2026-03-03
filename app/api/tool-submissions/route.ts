import { NextRequest, NextResponse } from "next/server";

import { createToolSubmission } from "@/lib/db/tool-submissions";

function normalizeFormValue(formData: FormData, key: string): string {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeHttpUrl(rawUrl: string): string | null {
    try {
        const parsed = new URL(rawUrl);

        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            return null;
        }

        return parsed.toString();
    } catch {
        return null;
    }
}

function redirectToSubmit(request: NextRequest, query: string) {
    return NextResponse.redirect(new URL(`/submit?${query}`, request.url), 303);
}

export async function POST(request: NextRequest) {
    const formData = await request.formData();

    const toolName = normalizeFormValue(formData, "name");
    const submitterEmail = normalizeFormValue(formData, "email");
    const rawOfficialUrl = normalizeFormValue(formData, "url");
    const officialUrl = normalizeHttpUrl(rawOfficialUrl);

    if (!toolName || !submitterEmail || !officialUrl || !isValidEmail(submitterEmail)) {
        return redirectToSubmit(request, "error=invalid");
    }

    const created = await createToolSubmission({
        toolName,
        submitterEmail,
        officialUrl,
    });

    if (!created) {
        return redirectToSubmit(request, "error=save");
    }

    return redirectToSubmit(request, "submitted=1");
}
