"use client";

import { useState } from "react";
import { PhotoTile } from "@/components/photo-tile";
import { LockedModal } from "@/components/locked-modal";
import type { PublicPhotoItem } from "@/types";

export function CollectionGallery({ items }: { items: PublicPhotoItem[] }) {
  const [selected, setSelected] = useState<PublicPhotoItem | null>(null);
  const [open, setOpen] = useState(false);

  function handleSelect(item: PublicPhotoItem) {
    if (!item.locked) return;
    setSelected(item);
    setOpen(true);
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl glass p-16 text-center">
        <p className="font-display text-xl text-cream">No images in this collection yet</p>
        <p className="mt-2 text-sm text-cream/60">The creator hasn&apos;t uploaded anything here yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
        {items.map((item, i) => (
          <PhotoTile key={item.id} item={item} onSelect={handleSelect} index={i} />
        ))}
      </div>

      <LockedModal item={selected} open={open} onOpenChange={setOpen} />
    </>
  );
}
