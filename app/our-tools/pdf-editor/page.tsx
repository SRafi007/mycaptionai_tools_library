import OurToolDetailPage, { generateMetadata as getMetadata } from "../[slug]/page";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return getMetadata({ params: Promise.resolve({ slug: "pdf-editor" }) });
}

export default async function PdfEditorPage() {
  return <OurToolDetailPage params={Promise.resolve({ slug: "pdf-editor" })} />;
}
