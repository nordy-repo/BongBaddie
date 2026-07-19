"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Collection } from "@/types";

export function CollectionCard({ collection, index = 0 }: { collection: Collection; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
    >
      <Link
        href={`/collections/${collection.slug}`}
        className="group block overflow-hidden rounded-2xl glass shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow"
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={collection.coverImagePath}
            alt={collection.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-wine-950/90 via-wine-950/10 to-transparent" />
          <Badge variant="preview" className="absolute left-4 top-4">
            <ImageIcon className="h-3 w-3" /> {collection.itemCount} images
          </Badge>
        </div>

        <div className="p-5">
          <h3 className="font-display text-xl text-cream">{collection.name}</h3>
          <p className="mt-1.5 line-clamp-2 text-sm text-cream/60">{collection.description}</p>
        </div>
      </Link>
    </motion.div>
  );
}
