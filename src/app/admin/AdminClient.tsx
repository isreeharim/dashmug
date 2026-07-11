"use client";

import { useState, useTransition } from "react";
import { Building2, ShieldCheck, Users, Search } from "lucide-react";
import { toggleRestaurantStatusAction } from "./actions";
import { RestaurantStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

interface AdminClientProps {
  restaurants: {
    id: string;
    name: string;
    slug: string;
    status: RestaurantStatus;
    createdAt: string;
    owner: {
      name: string | null;
      email: string;
    };
  }[];
  stats: {
    totalRestaurants: number;
    activeOwners: number;
  };
}

export default function AdminClient({ restaurants, stats }: AdminClientProps) {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const filteredRestaurants = restaurants.filter((r) =>
    `${r.name} ${r.slug} ${r.owner.email} ${r.owner.name || ""}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const handleToggleStatus = (id: string, currentStatus: RestaurantStatus) => {
    const actionName = currentStatus === RestaurantStatus.ACTIVE ? "suspend" : "activate";
    if (!confirm(`Are you sure you want to ${actionName} this restaurant?`)) return;

    setError(null);
    startTransition(async () => {
      try {
        await toggleRestaurantStatusAction(id, currentStatus);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to update restaurant status");
      }
    });
  };

  return (
    <main className="min-h-screen bg-[#f7f8f6] p-6 text-[#17241f] sm:p-10 max-w-6xl mx-auto animate-in fade-in duration-200">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[.16em] text-[#e85432]">
            Platform administration
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight font-[family-name:var(--font-display)]">
            Command Center
          </h1>
        </div>
      </header>

      {error && (
        <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 font-medium">
          {error}
        </div>
      )}

      {/* Overview Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl bg-white p-5 shadow-sm border border-stone-100 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-orange-50 text-[#e85432] flex items-center justify-center">
            <Building2 size={20} />
          </div>
          <div>
            <p className="text-2xl font-black">{stats.totalRestaurants}</p>
            <p className="text-xs font-bold text-[#748078] uppercase tracking-wider">Restaurants</p>
          </div>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm border border-stone-100 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-orange-50 text-[#e85432] flex items-center justify-center">
            <Users size={20} />
          </div>
          <div>
            <p className="text-2xl font-black">{stats.activeOwners}</p>
            <p className="text-xs font-bold text-[#748078] uppercase tracking-wider">Active Owners</p>
          </div>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm border border-stone-100 flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-orange-50 text-[#e85432] flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-2xl font-black">99.99%</p>
            <p className="text-xs font-bold text-[#748078] uppercase tracking-wider">System Health</p>
          </div>
        </article>
      </div>

      {/* Tenants Table */}
      <section className="mt-7 overflow-hidden rounded-2xl bg-white shadow-sm border border-stone-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 border-b border-stone-100">
          <div>
            <h2 className="font-black text-lg">Tenant Restaurants</h2>
            <p className="mt-1 text-sm text-[#748078]">Manage accounts, suspend access, and audit status.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
            <input
              placeholder="Search by name, slug, email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="rounded-lg border border-[#e0e5df] bg-stone-50/50 pl-9 pr-3 py-2 text-sm outline-none focus:border-stone-400 w-full sm:w-64"
            />
          </div>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="py-12 text-center text-sm text-stone-400 italic">
            No restaurant tenants found matching that query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-stone-50 text-[#748078] font-bold border-b border-stone-100">
                  <th className="p-4 pl-6">Restaurant</th>
                  <th className="p-4">Owner Info</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredRestaurants.map((restaurant) => (
                  <tr key={restaurant.id} className="hover:bg-stone-50/30 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-stone-800">{restaurant.name}</div>
                      <div className="text-xs text-stone-400">/menu/{restaurant.slug}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-stone-700">{restaurant.owner.name || "N/A"}</div>
                      <div className="text-xs text-stone-400">{restaurant.owner.email}</div>
                    </td>
                    <td className="p-4 text-stone-600">
                      {new Date(restaurant.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="p-4">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide",
                          restaurant.status === RestaurantStatus.ACTIVE
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-red-50 text-red-700 border border-red-100"
                        )}
                      >
                        {restaurant.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={() => handleToggleStatus(restaurant.id, restaurant.status)}
                        disabled={isPending}
                        className={cn(
                          "rounded-lg px-3 py-1.5 text-xs font-bold transition-all disabled:opacity-50",
                          restaurant.status === RestaurantStatus.ACTIVE
                            ? "bg-red-50 hover:bg-red-100 text-red-700"
                            : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                        )}
                      >
                        {restaurant.status === RestaurantStatus.ACTIVE ? "Suspend" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
