"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <section className="flex min-h-[80vh] items-center justify-center px-6 py-20">
      <Card className="w-full max-w-sm p-2">
        <CardContent className="pt-8">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-rose-coral shadow-glow">
            <Lock className="h-6 w-6 text-cream" strokeWidth={1.5} />
          </div>
          <h1 className="text-center font-display text-2xl text-cream">Creator Login</h1>
          <p className="mt-2 text-center text-sm text-cream/60">Sign in to manage your collections and keys.</p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
            </Button>
          </form>

          {error && (
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-soft-red/10 border border-soft-red/30 px-4 py-3 text-sm text-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
