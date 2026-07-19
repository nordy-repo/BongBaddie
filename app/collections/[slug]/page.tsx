import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollectionBySlug } from "@/lib/services/collections";
import { listPhotosForCollection } from "@/lib/services/photos";
import { CollectionGallery } from "./gallery";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return { title: "Collection" };
  return {
    title: collection.name,
    description: collection.description,
    openGraph: { title: collection.name, description: collection.description },
  };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const items = await listPhotosForCollection(collection.id);

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-12 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-300">Collection</p>
        <h1 className="mt-2 font-display text-4xl italic text-cream sm:text-5xl">{collection.name}</h1>
        <p className="mx-auto mt-4 max-w-lg text-cream/60">{collection.description}</p>
      </div>

      <CollectionGallery items={items} />
    </section>
  );
}
