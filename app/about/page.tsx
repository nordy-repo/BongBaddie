import type { Metadata } from "next";
import Image from "next/image";
import { Instagram, Twitter, Globe, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About",
  description: "The story behind BongBaddie.",
};

const socials = [
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Twitter, label: "Twitter / X", href: "#" },
  { icon: Globe, label: "Website", href: "#" },
  { icon: Mail, label: "Email", href: "mailto:hello@example.com" },
];

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <div className="grid gap-12 md:grid-cols-[320px_1fr] md:items-start">
        <div className="relative mx-auto aspect-square w-64 overflow-hidden rounded-3xl shadow-glow md:w-full">
          <Image
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80"
            alt="Creator portrait"
            fill
            className="object-cover"
          />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-300">About Me</p>
          <h1 className="mt-2 font-display text-4xl italic text-cream sm:text-5xl">Hi, I&apos;m the artist behind it all.</h1>

          <div className="mt-6 space-y-4 text-cream/70">
            <p>
              BongBaddie started as a way to share my most personal, unfiltered work directly with the
              people who value it most — no algorithms, no subscriptions, just collections released on my own
              terms.
            </p>
            <p>
              Every set is shot, edited, and curated by hand. Free previews are always open to browse; premium
              pieces unlock the moment you have a key from a purchase.
            </p>
          </div>

          <Card className="mt-8">
            <CardContent className="flex flex-wrap items-center gap-6 py-6">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="flex items-center gap-2 text-sm text-cream/70 transition-colors hover:text-rose-200"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                  {label}
                </a>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
