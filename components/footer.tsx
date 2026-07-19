import Link from "next/link";
import { Instagram, Twitter, Globe, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 mt-24">
      <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-lg text-cream">BongBaddie</p>
          <p className="mt-1 text-sm text-cream/50">Premium creator content, unlocked one key at a time.</p>
        </div>

        <div className="flex items-center gap-5">
          <a href="#" aria-label="Instagram" className="text-cream/60 hover:text-rose-300 transition-colors">
            <Instagram className="h-5 w-5" strokeWidth={1.5} />
          </a>
          <a href="#" aria-label="Twitter / X" className="text-cream/60 hover:text-rose-300 transition-colors">
            <Twitter className="h-5 w-5" strokeWidth={1.5} />
          </a>
          <a href="#" aria-label="Website" className="text-cream/60 hover:text-rose-300 transition-colors">
            <Globe className="h-5 w-5" strokeWidth={1.5} />
          </a>
          <a href="mailto:hello@example.com" aria-label="Email" className="text-cream/60 hover:text-rose-300 transition-colors">
            <Mail className="h-5 w-5" strokeWidth={1.5} />
          </a>
        </div>

        <div className="flex gap-6 text-sm text-cream/50">
          <Link href="/unlock" className="hover:text-cream">Unlock a key</Link>
          <Link href="/admin/login" className="hover:text-cream">Creator login</Link>
        </div>
      </div>
    </footer>
  );
}
