import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/hero";
import { CollectionCard } from "@/components/collection-card";
import { listPublishedCollections } from "@/lib/services/collections";

export default async function HomePage() {
  const collections = await listPublishedCollections();
  const heroPreviews = collections.slice(0, 4).map((c) => c.coverImagePath);
  const featured = collections.slice(0, 3);
  const latest = [...collections].slice(0, 6);

  return (
    <>
      <Hero previewImages={heroPreviews} />

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-300">Featured</p>
            <h2 className="mt-2 font-display text-3xl italic text-cream sm:text-4xl">Featured Collections</h2>
          </div>
          <Link href="/collections" className="hidden items-center gap-1.5 text-sm text-cream/70 hover:text-cream sm:flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {featured.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((collection, i) => (
              <CollectionCard key={collection.id} collection={collection} index={i} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-300">Latest Drop</p>
          <h2 className="mt-2 font-display text-3xl italic text-cream sm:text-4xl">Latest Uploads</h2>
        </div>

        {latest.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((collection, i) => (
              <CollectionCard key={collection.id} collection={collection} index={i} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl glass p-16 text-center">
      <p className="font-display text-xl text-cream">Nothing published yet</p>
      <p className="mt-2 text-sm text-cream/60">New collections will appear here as soon as they go live.</p>
    </div>
  );
}
