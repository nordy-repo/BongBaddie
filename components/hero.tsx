"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroProps {
  previewImages: string[];
}

export function Hero({ previewImages }: HeroProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (previewImages.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % previewImages.length), 4500);
    return () => clearInterval(id);
  }, [previewImages.length]);

  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden">
      {/* Animated preview carousel, dimmed behind a gradient */}
      <div className="absolute inset-0">
        <AnimatePresence mode="sync">
          {previewImages[index] && (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <Image
                src={previewImages[index]}
                alt=""
                fill
                priority={index === 0}
                className="object-cover opacity-40"
              />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-wine opacity-90" />
        <div className="absolute inset-0 bg-gradient-glow" />
      </div>

      {/* Floating pastel shapes */}
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-lavender/20 blur-3xl animate-float" />
      <div
        className="pointer-events-none absolute -right-16 bottom-32 h-96 w-96 rounded-full bg-coral/20 blur-3xl animate-float"
        style={{ animationDelay: "1.5s" }}
      />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-block rounded-full glass px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-rose-200"
        >
          Creator Collection
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-5xl italic leading-[1.05] text-cream sm:text-6xl md:text-7xl"
        >
          Exclusive <span className="text-gradient not-italic">Collection</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mx-auto mt-6 max-w-xl text-base text-cream/70 sm:text-lg"
        >
          Premium collections available exclusively through this website.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button size="lg" asChild>
            <Link href="/collections">Browse Collections</Link>
          </Button>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/about">About Me</Link>
          </Button>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-cream/50"
      >
        <ChevronDown className="h-6 w-6" strokeWidth={1.5} />
      </motion.div>
    </section>
  );
}
