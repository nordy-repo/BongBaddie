import type { Metadata } from "next";
import { UnlockCard } from "@/components/unlock-card";

export const metadata: Metadata = {
  title: "Unlock",
  description: "Enter your unlock key to reveal purchased content.",
};

export default function UnlockPage() {
  return (
    <section className="relative flex min-h-[80vh] items-center justify-center px-6 py-20">
      <div className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-rose-400/10 blur-3xl animate-float" />
      <div
        className="pointer-events-none absolute -right-24 bottom-1/4 h-72 w-72 rounded-full bg-lavender/10 blur-3xl animate-float"
        style={{ animationDelay: "1.2s" }}
      />
      <UnlockCard />
    </section>
  );
}
