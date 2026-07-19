import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-8xl italic text-gradient">404</p>
      <h1 className="mt-4 font-display text-2xl text-cream">This page slipped out of frame</h1>
      <p className="mt-2 max-w-sm text-cream/60">
        The page you&apos;re looking for doesn&apos;t exist, or has been moved.
      </p>
      <Button asChild size="lg" className="mt-8">
        <Link href="/">Back to Home</Link>
      </Button>
    </section>
  );
}
