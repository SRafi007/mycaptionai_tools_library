import OurToolDetailPage, { generateMetadata as getMetadata } from "../[slug]/page";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return getMetadata({ params: Promise.resolve({ slug: "markdown-editor" }) });
}

export default async function MarkdownEditorPage() {
  return <OurToolDetailPage params={Promise.resolve({ slug: "markdown-editor" })} />;
}
