import type { Metadata } from "next";
import { CollectionCard } from "@/components/collection-card";
import { listPublishedCollections } from "@/lib/services/collections";

export const metadata: Metadata = {
  title: "Collections",
  description: "Browse every published collection.",
};

export default async function CollectionsPage() {
  const collections = await listPublishedCollections();

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-12 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-300">Browse</p>
        <h1 className="mt-2 font-display text-4xl italic text-cream sm:text-5xl">Collections</h1>
        <p className="mx-auto mt-4 max-w-lg text-cream/60">
          Every set, free previews and all. Premium pieces unlock with a key after purchase.
        </p>
      </div>

      {collections.length === 0 ? (
        <div className="rounded-2xl glass p-16 text-center">
          <p className="font-display text-xl text-cream">No collections published yet</p>
          <p className="mt-2 text-sm text-cream/60">Check back soon — new drops are on the way.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection, i) => (
            <CollectionCard key={collection.id} collection={collection} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
