"use client";

import Image from "next/image";
import Link from "next/link";
import { Lock, KeyRound } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { PublicPhotoItem } from "@/types";

export function LockedModal({
  item,
  open,
  onOpenChange,
}: {
  item: PublicPhotoItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-xl">
          <Image src={item.previewUrl} alt="" fill className="object-cover blur-lg scale-105" />
          <div className="absolute inset-0 flex items-center justify-center bg-wine-950/50">
            <div className="rounded-full glass-strong p-4">
              <Lock className="h-7 w-7 text-rose-gold" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        <DialogTitle>Premium Content</DialogTitle>
        <DialogDescription>
          Purchase this item to receive an unlock key from the creator.
        </DialogDescription>

        <div className="mt-6 flex items-center justify-between rounded-xl glass px-5 py-4">
          <span className="text-sm text-cream/60">{item.title}</span>
          <span className="font-display text-lg text-rose-200">{item.price}</span>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button size="lg" asChild>
            <a href="mailto:hello@example.com?subject=Purchase inquiry">Contact Creator</a>
          </Button>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/unlock" className="flex items-center justify-center gap-2">
              <KeyRound className="h-4 w-4" /> Already have a key?
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
