"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Drumstick, Leaf, MapPin, Moon, Search, Sun, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PublicItem {
  id: string;
  name: string;
  description: string;
  price: string;
  diet: "VEG" | "NON_VEG";
  isAvailable: boolean;
  isFeatured: boolean;
  image: string;
}

interface PublicCategory {
  id: string;
  name: string;
  items: PublicItem[];
}

interface RestaurantData {
  name: string;
  slug: string;
  description: string;
  address: string;
  categories: PublicCategory[];
}

export default function MenuClient({ restaurant }: { restaurant: RestaurantData }) {
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const qr = new URLSearchParams(window.location.search).get("qr");
    if (qr) {
      void fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr }),
      });
    }
  }, []);

  const filteredCategories = useMemo(() => {
    return restaurant.categories
      .map((category) => ({
        ...category,
        items: category.items.filter((item) =>
          `${item.name} ${item.description}`.toLowerCase().includes(query.toLowerCase())
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [restaurant.categories, query]);

  return (
    <div
      data-restaurant={restaurant.slug}
      className={cn(
        "min-h-screen transition-colors duration-200",
        dark ? "bg-[#141715] text-[#f7f5ef]" : "bg-[#f8f7f2] text-[#1d2521]"
      )}
    >
      <header
        className={cn(
          "sticky top-0 z-30 border-b backdrop-blur-xl transition-colors duration-200",
          dark ? "border-white/10 bg-[#141715]/90" : "border-black/5 bg-[#f8f7f2]/90"
        )}
      >
        <div className="mx-auto max-w-2xl px-4 pb-3 pt-4">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#dd5b3d] text-lg font-black text-white shadow-md">
                {restaurant.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight">
                  {restaurant.name}
                </h1>
                {restaurant.address && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs opacity-60">
                    <MapPin size={12} className="text-[#dd5b3d]" />
                    {restaurant.address}
                  </p>
                )}
              </div>
            </div>
            <button
              aria-label="Toggle color theme"
              onClick={() => setDark(!dark)}
              className={cn(
                "grid h-10 w-10 place-items-center rounded-xl border transition-colors",
                dark ? "border-white/10 hover:bg-white/5" : "border-black/10 hover:bg-black/5"
              )}
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>

          <label
            className={cn(
              "mt-4 flex h-12 items-center gap-3 rounded-xl px-3 border transition-all duration-200",
              dark ? "bg-white/10 border-transparent focus-within:bg-white/15" : "bg-white border-stone-200/60 shadow-sm focus-within:border-stone-300"
            )}
          >
            <Search size={19} className="opacity-50" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search the menu..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:opacity-45"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="hover:opacity-80"
              >
                <X size={16} />
              </button>
            )}
          </label>
        </div>

        <nav
          aria-label="Menu categories"
          className="mx-auto flex max-w-2xl gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none]"
        >
          {restaurant.categories.map((category) => (
            <a
              key={category.id}
              href={`#${category.id}`}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-bold shadow-sm transition-transform active:scale-[0.97]",
                dark ? "bg-white/10 text-white" : "bg-white text-stone-700 hover:bg-stone-50"
              )}
            >
              {category.name}
            </a>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-16">
        {restaurant.description && (
          <section className="py-7 border-b border-current/5">
            <p className="text-sm leading-6 opacity-65 italic">{restaurant.description}</p>
          </section>
        )}

        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <section id={category.id} key={category.id} className="scroll-mt-44 py-5">
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
                {category.name}
              </h2>
              <div className="mt-4 space-y-3">
                {category.items.map((item) => (
                  <article
                    key={item.id}
                    className={cn(
                      "flex gap-3 rounded-2xl p-3 transition-opacity",
                      dark ? "bg-white/5" : "bg-white shadow-sm border border-stone-100",
                      !item.isAvailable && "opacity-55"
                    )}
                  >
                    {item.image && (
                      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1 py-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold leading-5 tracking-tight">{item.name}</h3>
                        <span className="shrink-0 font-black text-sm">{item.price}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 opacity-60">
                        {item.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.diet === "VEG" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                            <Leaf size={11} />
                            Veg
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500">
                            <Drumstick size={11} />
                            Non-veg
                          </span>
                        )}
                        {item.isFeatured && (
                          <span className="rounded-full bg-[#f9e4aa] px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-[#795813]">
                            Popular
                          </span>
                        )}
                        {!item.isAvailable && (
                          <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-zinc-600">
                            Sold out
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="py-20 text-center">
            <p className="text-xl font-bold">No items found</p>
            <p className="mt-1 text-sm opacity-60">Try searching for another dish or ingredient.</p>
          </div>
        )}
      </main>
    </div>
  );
}
