"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UnlockResponse {
  success: boolean;
  scopeName?: string;
  imageUrls?: string[];
  error?: string;
}

export function UnlockCard() {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<UnlockResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim()) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const data: UnlockResponse = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error ?? "That key didn't work. Double-check and try again.");
        setStatus("error");
        return;
      }

      setResult(data);
      setStatus("success");
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md p-2">
      <CardContent className="pt-8">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-rose-coral shadow-glow">
          <KeyRound className="h-6 w-6 text-cream" strokeWidth={1.5} />
        </div>

        <h2 className="text-center font-display text-2xl text-cream">Enter Unlock Key</h2>
        <p className="mt-2 text-center text-sm text-cream/60">
          Paste the key your creator sent you after purchase.
        </p>

        <form onSubmit={handleUnlock} className="mt-8 flex flex-col gap-4">
          <Input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="AB9X-4PKL-72QM"
            className="text-center font-utility tracking-widest"
            maxLength={32}
            autoCapitalize="characters"
            disabled={status === "loading"}
          />
          <Button type="submit" size="lg" disabled={status === "loading" || !key.trim()}>
            {status === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Unlocking…
              </>
            ) : (
              "Unlock"
            )}
          </Button>
        </form>

        <AnimatePresence mode="wait">
          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-5 flex items-center gap-2 rounded-xl bg-soft-red/10 border border-soft-red/30 px-4 py-3 text-sm text-rose-200"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorMessage}
            </motion.div>
          )}

          {status === "success" && result && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-400/30 px-4 py-3 text-sm text-emerald-200">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Unlocked — enjoy “{result.scopeName}”.
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {result.imageUrls?.map((url) => (
                  <div key={url} className="relative aspect-square overflow-hidden rounded-xl">
                    <Image src={url} alt={result.scopeName ?? "Unlocked image"} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
