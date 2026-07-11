"use client";

import { useState, useTransition } from "react";
import { ArrowRight, QrCode } from "lucide-react";
import { createRestaurantAction } from "./actions";

export default function OnboardingClient() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");

  // Auto-slugifier helper
  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // remove non-alphanumeric chars (excluding spaces/hyphens)
      .replace(/[\s_]+/g, "-") // replace spaces/underscores with hyphens
      .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
    setSlug(generatedSlug);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    setError(null);
    startTransition(async () => {
      try {
        await createRestaurantAction({
          name,
          slug,
          description: description || undefined,
          address: address || undefined,
          phone: phone || undefined,
          email: email || undefined,
          website: website || undefined,
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong. The slug might already be in use.");
      }
    });
  };

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#14211f] flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e85432] text-white shadow-lg">
          <QrCode size={26} />
        </div>
        <h2 className="mt-6 text-3xl font-black tracking-tight font-[family-name:var(--font-display)]">
          Welcome to tabletap
        </h2>
        <p className="mt-2 text-sm text-[#52635f]">
          Let&apos;s create a digital space for your restaurant.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-xl shadow-stone-200/50 rounded-3xl border border-stone-100 sm:px-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cedar & Salt"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm outline-none focus:border-stone-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                  URL Custom Slug
                </label>
                <div className="flex rounded-xl border border-stone-200 overflow-hidden focus-within:border-stone-400">
                  <span className="bg-stone-50 border-r border-stone-200 px-3 py-2.5 text-xs text-stone-400 flex items-center">
                    /menu/
                  </span>
                  <input
                    type="text"
                    required
                    pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                    placeholder="cedar-salt"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase())}
                    className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                Tagline / Description (Optional)
              </label>
              <textarea
                placeholder="e.g. Seasonal plates, slow mornings, and good company."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm outline-none focus:border-stone-400 resize-none h-20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                Address (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 18 Garden Lane, Bengaluru"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm outline-none focus:border-stone-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="+91 80 5555 0190"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm outline-none focus:border-stone-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="hello@cedarsalt.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm outline-none focus:border-stone-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                Website (Optional)
              </label>
              <input
                type="url"
                placeholder="https://cedarsalt.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm outline-none focus:border-stone-400"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#e85432] hover:bg-[#d64726] disabled:opacity-50 text-white font-bold py-3.5 px-6 shadow-lg shadow-orange-100 transition-transform active:scale-[0.98]"
            >
              {isPending ? "Setting up..." : "Create Restaurant Menu"}
              {!isPending && <ArrowRight size={17} />}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
