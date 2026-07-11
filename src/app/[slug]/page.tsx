import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Phone, Globe, ArrowRight, Clock } from "lucide-react";
import { db } from "@/lib/db";
import { Metadata } from "next";
import { cache } from "react";

// Memoize the database fetch for the duration of a single request cycle
const getRestaurant = cache(async (slug: string) => {
  return db.restaurant.findUnique({
    where: { slug, status: "ACTIVE" },
  });
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getRestaurant(slug);

  if (!restaurant) {
    return {
      title: "Restaurant Not Found",
    };
  }

  return {
    title: restaurant.name,
    description: restaurant.description ?? `Welcome to ${restaurant.name}`,
  };
}

export default async function RestaurantProfile({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const restaurant = await getRestaurant(slug);

  if (!restaurant) {
    notFound();
  }

  const initial = restaurant.name.charAt(0).toUpperCase();

  // Parse JSON fields safely
  const openingHours = restaurant.openingHours as Record<string, string> | null;

  return (
    <main className="min-h-screen bg-[#f8f7f2] px-5 py-8 text-[#1d2521] sm:py-16">
      <section className="mx-auto max-w-2xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-stone-200/70">
        <div className="h-52 bg-[linear-gradient(135deg,#915435,#e7b275_55%,#4f6348)]" />
        <div className="p-6 sm:p-9">
          <div className="-mt-18 grid h-24 w-24 place-items-center rounded-3xl border-4 border-white bg-[#dd5b3d] text-4xl font-black text-white shadow-md">
            {initial}
          </div>
          
          <p className="mt-5 text-sm font-black uppercase tracking-[.15em] text-[#dd5b3d]">Restaurant</p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight">{restaurant.name}</h1>
          
          {restaurant.description && (
            <p className="mt-4 max-w-lg leading-7 text-[#66736e]">{restaurant.description}</p>
          )}

          <div className="mt-8 border-t border-[#edf0ed] pt-6 space-y-4 text-sm text-[#52635f]">
            {restaurant.address && (
              <p className="flex items-start gap-3">
                <MapPin className="mt-0.5 shrink-0 text-[#dd5b3d]" size={17} />
                <span>{restaurant.address}</span>
              </p>
            )}
            
            {restaurant.phone && (
              <p className="flex items-center gap-3">
                <Phone className="shrink-0 text-[#dd5b3d]" size={17} />
                <span>{restaurant.phone}</span>
              </p>
            )}
            
            {restaurant.website && (
              <p className="flex items-center gap-3">
                <Globe className="shrink-0 text-[#dd5b3d]" size={17} />
                <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-[#1d2521] font-medium">
                  {restaurant.website.replace(/^https?:\/\//, "")}
                </a>
              </p>
            )}
          </div>

          {openingHours && Object.keys(openingHours).length > 0 && (
            <div className="mt-6 border-t border-[#edf0ed] pt-6">
              <h2 className="flex items-center gap-2 text-sm font-bold text-[#1d2521]">
                <Clock size={16} className="text-[#dd5b3d]" /> Opening Hours
              </h2>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-[#66736e]">
                {Object.entries(openingHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between border-b border-stone-50 py-1">
                    <span className="capitalize font-semibold">{day}</span>
                    <span>{hours}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 border-t border-[#edf0ed] pt-6">
            <Link 
              href={`/menu/${slug}`} 
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#14211f] px-6 py-4 font-bold text-white shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] sm:w-auto"
            >
              View Menu <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
