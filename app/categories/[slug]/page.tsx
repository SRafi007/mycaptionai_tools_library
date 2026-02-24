import { permanentRedirect } from "next/navigation";

export default function OldCategoryPage({ params }: { params: { slug: string } }) {
    permanentRedirect(`/category/${params.slug}`);
}
