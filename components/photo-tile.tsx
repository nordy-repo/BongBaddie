"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PublicPhotoItem } from "@/types";

export function PhotoTile({
  item,
  onSelect,
  index = 0,
}: {
  item: PublicPhotoItem;
  onSelect: (item: PublicPhotoItem) => void;
  index?: number;
}) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(item)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: (index % 6) * 0.05 }}
      className="group relative block w-full overflow-hidden rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/60"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src={item.previewUrl}
          alt={item.locked ? "Locked premium image" : item.title}
          fill
          className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
            item.locked ? "blur-md scale-105" : ""
          }`}
          sizes="(max-width: 768px) 50vw, 25vw"
        />

        {item.locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-wine-950/40">
            <div className="rounded-full glass-strong p-3 shimmer-lock">
              <Lock className="h-5 w-5 text-rose-gold" strokeWidth={1.5} />
            </div>
            <span className="rounded-full bg-wine-950/70 px-3 py-1 text-xs font-semibold text-cream/90">
              {item.price}
            </span>
          </div>
        )}

        {!item.locked && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-wine-950/85 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
            <p className="text-sm font-medium text-cream">{item.title}</p>
          </div>
        )}

        <Badge variant={item.locked ? "locked" : "preview"} className="absolute right-3 top-3">
          {item.locked ? "Premium" : "Preview"}
        </Badge>
      </div>
    </motion.button>
  );
}
