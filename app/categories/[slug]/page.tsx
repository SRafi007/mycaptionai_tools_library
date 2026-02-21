import { redirect } from "next/navigation";

export default function OldCategoryPage({ params }: { params: { slug: string } }) {
    redirect(`/category/${params.slug}`);
}
