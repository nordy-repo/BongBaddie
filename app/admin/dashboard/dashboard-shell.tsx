"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FolderPlus,
  KeyRound,
  History,
  LogOut,
  Copy,
  Check,
  Search,
  Download,
  Ban,
  CheckCircle2,
  UploadCloud,
  ImagePlus,
  Trash2,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { AdminStats, Collection } from "@/types";

type Tab = "overview" | "collections" | "upload" | "keys" | "history";

const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "collections", label: "Collections", icon: FolderPlus },
  { id: "upload", label: "Upload Photos", icon: UploadCloud },
  { id: "keys", label: "Keys", icon: KeyRound },
  { id: "history", label: "Unlock History", icon: History },
];

export function DashboardShell({ stats, adminEmail }: { stats: AdminStats; adminEmail: string }) {
  const [tab, setTab] = useState<Tab>("overview");
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-6 py-12">
      <aside className="hidden w-56 shrink-0 flex-col gap-1 md:flex">
        <p className="mb-4 px-3 text-xs text-cream/40">{adminEmail}</p>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
              tab === id ? "glass text-cream" : "text-cream/60 hover:text-cream hover:bg-white/5"
            }`}
          >
            <Icon className="h-4 w-4" strokeWidth={1.5} />
            {label}
          </button>
        ))}
        <button
          onClick={handleLogout}
          className="mt-6 flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-cream/50 hover:text-rose-200"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.5} />
          Sign out
        </button>
      </aside>

      <div className="flex-1">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-display text-3xl italic text-cream">Dashboard</h1>
          <div className="flex gap-2 md:hidden">
            {tabs.map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`rounded-full p-2 ${tab === id ? "glass text-cream" : "text-cream/50"}`}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        {tab === "overview" && <OverviewTab stats={stats} />}
        {tab === "collections" && <CollectionsTab />}
        {tab === "upload" && <UploadTab />}
        {tab === "keys" && <KeysTab />}
        {tab === "history" && <HistoryTab />}
      </div>
    </div>
  );
}

function OverviewTab({ stats }: { stats: AdminStats }) {
  const cards = [
    { label: "Collections", value: stats.totalCollections },
    { label: "Items", value: stats.totalItems },
    { label: "Active Keys", value: `${stats.activeKeys} / ${stats.totalKeys}` },
    { label: "Unlocks (7d)", value: stats.unlocksLast7Days },
    { label: "Total Unlocks", value: stats.totalUnlocks },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-wide text-cream/50">{c.label}</p>
            <p className="mt-2 font-display text-3xl text-cream">{c.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CollectionsTab() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [coverImagePath, setCoverImagePath] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/admin/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, name, description, coverImagePath }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(typeof data.error === "string" ? data.error : "Couldn't create the collection.");
      setStatus("error");
      return;
    }
    setMessage(`"${name}" created — publish it once its images are uploaded.`);
    setStatus("done");
    setName("");
    setSlug("");
    setDescription("");
    setCoverImagePath("");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardContent className="pt-6">
          <h2 className="font-display text-xl text-cream">New Collection</h2>
          <p className="mt-1 text-sm text-cream/50">
            Upload the cover image via the Storage tab in Supabase first, then paste its path below.
          </p>
          <form onSubmit={handleCreate} className="mt-6 flex flex-col gap-3">
            <Input placeholder="Collection name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input
              placeholder="url-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              pattern="[a-z0-9-]+"
              required
            />
            <Input
              placeholder="Short description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Input
              placeholder="previews/cover-path.jpg"
              value={coverImagePath}
              onChange={(e) => setCoverImagePath(e.target.value)}
              required
            />
            <Button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Creating…" : "Create Collection"}
            </Button>
          </form>
          {message && (
            <p className={`mt-4 text-sm ${status === "error" ? "text-rose-300" : "text-emerald-300"}`}>{message}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h2 className="font-display text-xl text-cream">Manage Existing</h2>
          <p className="mt-2 text-sm text-cream/50">
            Editing, publishing, and deleting collections uses the same <code className="text-rose-200">/api/admin/collections</code> endpoint
            (PATCH to publish/update, DELETE to remove) — wire up a table here against{" "}
            <code className="text-rose-200">GET /api/admin/collections</code> to list and manage them inline.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// One row = one photo to be created: a preview file, a full-res file, and metadata.
interface DraftItem {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  tags: string;
  previewFile: File | null;
  fullFile: File | null;
}

function emptyDraft(): DraftItem {
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    priceCents: 0,
    currency: "USD",
    tags: "",
    previewFile: null,
    fullFile: null,
  };
}

async function uploadFile(file: File, bucket: "previews" | "full"): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("bucket", bucket);
  const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Upload failed.");
  return data.path as string;
}

function UploadTab() {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [collectionId, setCollectionId] = useState("");
  const [drafts, setDrafts] = useState<DraftItem[]>([emptyDraft()]);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCollectionsLoading(true);
      try {
        const res = await fetch("/api/admin/collections");
        const data = await res.json();
        if (!cancelled && res.ok) {
          const list: Collection[] = (data.collections ?? []).map(
            (row: Record<string, unknown>) => ({
              id: row.id,
              slug: row.slug,
              name: row.name,
              description: row.description,
              coverImagePath: row.cover_image_path,
              itemCount: row.item_count,
              isPublished: row.is_published,
              createdAt: row.created_at,
            })
          );
          setCollections(list);
          if (list.length > 0) setCollectionId((prev) => prev || list[0]!.id);
        }
      } finally {
        if (!cancelled) setCollectionsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function updateDraft(id: string, patch: Partial<DraftItem>) {
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }

  function addDraft() {
    setDrafts((prev) => [...prev, emptyDraft()]);
  }

  function removeDraft(id: string) {
    setDrafts((prev) => (prev.length > 1 ? prev.filter((d) => d.id !== id) : prev));
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!collectionId) {
      setStatus("error");
      setMessage("Pick a collection first.");
      return;
    }

    const readyDrafts = drafts.filter((d) => d.previewFile && d.fullFile && d.title.trim());
    if (readyDrafts.length === 0) {
      setStatus("error");
      setMessage("Add at least one image with a title, preview image, and full-resolution image.");
      return;
    }

    setStatus("uploading");
    setProgress({ done: 0, total: readyDrafts.length });

    let successCount = 0;
    const errors: string[] = [];

    for (const draft of readyDrafts) {
      try {
        const [previewImagePath, fullImagePath] = await Promise.all([
          uploadFile(draft.previewFile as File, "previews"),
          uploadFile(draft.fullFile as File, "full"),
        ]);

        const res = await fetch("/api/admin/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            collectionId,
            title: draft.title,
            description: draft.description,
            previewImagePath,
            fullImagePath,
            priceCents: draft.priceCents,
            currency: draft.currency,
            tags: draft.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Failed to save item.");

        successCount += 1;
      } catch (err) {
        errors.push(`"${draft.title || "Untitled"}": ${err instanceof Error ? err.message : "unknown error"}`);
      } finally {
        setProgress((p) => ({ ...p, done: p.done + 1 }));
      }
    }

    if (errors.length === 0) {
      setStatus("done");
      setMessage(`Uploaded ${successCount} image${successCount === 1 ? "" : "s"} successfully.`);
      setDrafts([emptyDraft()]);
    } else {
      setStatus("error");
      setMessage(`${successCount} succeeded, ${errors.length} failed — ${errors.join("; ")}`);
    }

    // Refresh server components (gallery, item counts, overview stats) with fresh data.
    router.refresh();
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardContent className="pt-6">
          <h2 className="font-display text-xl text-cream">Upload Photos</h2>
          <p className="mt-1 text-sm text-cream/50">
            Pick a collection, add one or more images with their preview and full-resolution files, then upload.
            Files go straight to the <code className="text-rose-200">content</code> bucket and a row is created in{" "}
            <code className="text-rose-200">photo_items</code> for each — no Supabase dashboard needed.
          </p>

          <form onSubmit={handleUpload} className="mt-6 flex flex-col gap-6">
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-wide text-cream/50">Collection</label>
              <select
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                disabled={collectionsLoading || collections.length === 0}
                className="h-12 w-full rounded-full glass px-5 text-sm text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/50 disabled:opacity-50 [&>option]:bg-wine-900"
              >
                {collectionsLoading && <option>Loading collections…</option>}
                {!collectionsLoading && collections.length === 0 && (
                  <option>No collections yet — create one first</option>
                )}
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.isPublished ? "" : "(draft)"}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-4">
              {drafts.map((draft, idx) => (
                <div key={draft.id} className="rounded-2xl glass-strong p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-cream">Image {idx + 1}</p>
                    {drafts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDraft(draft.id)}
                        className="text-cream/50 hover:text-rose-300"
                        aria-label="Remove image"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      placeholder="Title"
                      value={draft.title}
                      onChange={(e) => updateDraft(draft.id, { title: e.target.value })}
                    />
                    <Input
                      placeholder="Tags (comma separated)"
                      value={draft.tags}
                      onChange={(e) => updateDraft(draft.id, { tags: e.target.value })}
                    />
                    <Input
                      className="sm:col-span-2"
                      placeholder="Description"
                      value={draft.description}
                      onChange={(e) => updateDraft(draft.id, { description: e.target.value })}
                    />
                    <Input
                      type="number"
                      min={0}
                      placeholder="Price (cents)"
                      value={draft.priceCents}
                      onChange={(e) => updateDraft(draft.id, { priceCents: Number(e.target.value) })}
                    />
                    <Input
                      placeholder="Currency"
                      value={draft.currency}
                      maxLength={3}
                      onChange={(e) => updateDraft(draft.id, { currency: e.target.value.toUpperCase() })}
                    />

                    <label className="flex h-12 cursor-pointer items-center justify-between rounded-full glass px-5 text-sm text-cream/70 hover:text-cream">
                      <span className="truncate">{draft.previewFile?.name ?? "Choose preview image"}</span>
                      <ImagePlus className="h-4 w-4 shrink-0" />
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => updateDraft(draft.id, { previewFile: e.target.files?.[0] ?? null })}
                      />
                    </label>
                    <label className="flex h-12 cursor-pointer items-center justify-between rounded-full glass px-5 text-sm text-cream/70 hover:text-cream">
                      <span className="truncate">{draft.fullFile?.name ?? "Choose full-resolution image"}</span>
                      <ImagePlus className="h-4 w-4 shrink-0" />
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => updateDraft(draft.id, { fullFile: e.target.files?.[0] ?? null })}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="secondary" onClick={addDraft}>
                <ImagePlus className="h-4 w-4" /> Add another image
              </Button>
              <Button type="submit" disabled={status === "uploading"}>
                {status === "uploading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading {progress.done}/{progress.total}…
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4" /> Upload
                  </>
                )}
              </Button>
            </div>

            {message && (
              <p className={`text-sm ${status === "error" ? "text-rose-300" : "text-emerald-300"}`}>{message}</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function KeysTab() {
  const [scopeType, setScopeType] = useState<"item" | "collection">("collection");
  const [scopeId, setScopeId] = useState("");
  const [maxUses, setMaxUses] = useState(1);
  const [note, setNote] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setGeneratedKey("");
    const res = await fetch("/api/admin/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scopeType, scopeId, maxUses, note: note || undefined }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage("Couldn't generate a key — check the scope ID is a valid UUID.");
      setStatus("error");
      return;
    }
    setGeneratedKey(data.key);
    setStatus("idle");
  }

  function handleCopy() {
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleExport() {
    const res = await fetch(`/api/admin/keys${search ? `?search=${encodeURIComponent(search)}` : ""}`);
    const data = await res.json();
    const rows = (data.keys ?? []).map((k: Record<string, unknown>) =>
      [k.key_prefix, k.scope_type, k.scope_id, k.is_active, k.use_count, k.max_uses, k.created_at].join(",")
    );
    const csv = ["prefix,scope_type,scope_id,active,uses,max_uses,created_at", ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "unlock-keys.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardContent className="pt-6">
          <h2 className="font-display text-xl text-cream">Generate a Key</h2>
          <form onSubmit={handleGenerate} className="mt-6 flex flex-col gap-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setScopeType("collection")}
                className={`flex-1 rounded-xl px-3 py-2 text-sm ${scopeType === "collection" ? "bg-gradient-rose-coral text-cream" : "glass text-cream/60"}`}
              >
                Whole Collection
              </button>
              <button
                type="button"
                onClick={() => setScopeType("item")}
                className={`flex-1 rounded-xl px-3 py-2 text-sm ${scopeType === "item" ? "bg-gradient-rose-coral text-cream" : "glass text-cream/60"}`}
              >
                Single Item
              </button>
            </div>
            <Input
              placeholder={`${scopeType === "item" ? "Item" : "Collection"} UUID`}
              value={scopeId}
              onChange={(e) => setScopeId(e.target.value)}
              required
            />
            <Input
              type="number"
              min={1}
              max={100}
              placeholder="Max uses"
              value={maxUses}
              onChange={(e) => setMaxUses(Number(e.target.value))}
            />
            <Input placeholder="Note (e.g. buyer email) — optional" value={note} onChange={(e) => setNote(e.target.value)} />
            <Button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Generating…" : "Generate Key"}
            </Button>
          </form>

          {message && status === "error" && <p className="mt-4 text-sm text-rose-300">{message}</p>}

          {generatedKey && (
            <div className="mt-5 flex items-center justify-between rounded-xl glass-strong px-4 py-3">
              <span className="font-utility text-lg tracking-widest text-rose-200">{generatedKey}</span>
              <button onClick={handleCopy} className="text-cream/60 hover:text-cream">
                {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          )}
          <p className="mt-2 text-xs text-cream/40">
            This is the only time the full key is shown — send it to the buyer now.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h2 className="font-display text-xl text-cream">Search &amp; Export</h2>
          <div className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/40" />
              <Input
                className="pl-11"
                placeholder="Search by key prefix"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="secondary" onClick={handleExport} type="button">
              <Download className="h-4 w-4" /> CSV
            </Button>
          </div>
          <p className="mt-3 text-xs text-cream/40">
            Full raw keys are never stored, so search matches the visible prefix only (e.g. &quot;AB9X&quot;).
          </p>

          <div className="mt-6 flex items-center gap-2 text-sm text-cream/60">
            <Badge variant="outline">
              <CheckCircle2 className="h-3 w-3" /> Activate
            </Badge>
            <Badge variant="locked">
              <Ban className="h-3 w-3" /> Deactivate
            </Badge>
            <span className="text-xs text-cream/40">via PATCH /api/admin/keys</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function HistoryTab() {
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="font-display text-xl text-cream">Unlock History</h2>
        <p className="mt-2 text-sm text-cream/50">
          Every attempt — successful or not — is logged to <code className="text-rose-200">unlock_events</code> with a
          hashed IP address, never the raw IP. Query it directly from the Supabase table editor, or extend this tab
          with a fetch against a new <code className="text-rose-200">GET /api/admin/history</code> route following the
          same pattern as <code className="text-rose-200">/api/admin/keys</code>.
        </p>
      </CardContent>
    </Card>
  );
}
