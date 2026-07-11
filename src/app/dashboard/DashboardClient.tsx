"use client";

import { useState, useTransition } from "react";
import { 
  ExternalLink, 
  LayoutDashboard, 
  QrCode, 
  UtensilsCrossed, 
  ArrowUpRight, 
  Plus, 
  Trash, 
  Edit3, 
  X, 
  Leaf, 
  Drumstick
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  createCategoryAction, 
  deleteCategoryAction, 
  createMenuItemAction, 
  updateMenuItemAction, 
  deleteMenuItemAction 
} from "./actions";

interface DashboardClientProps {
  restaurant: {
    id: string;
    name: string;
    slug: string;
    description: string;
    address: string;
    qrCodes: {
      publicId: string;
      isActive: boolean;
    }[];
    categories: {
      id: string;
      name: string;
      description: string | null;
      items: {
        id: string;
        name: string;
        description: string | null;
        price: number;
        diet: "VEG" | "NON_VEG";
        isAvailable: boolean;
        isFeatured: boolean;
        imageUrl: string | null;
      }[];
    }[];
  };
  stats: {
    totalScans: number;
    monthScans: number;
    totalItems: number;
    featuredItems: number;
    scansLast7Days: { day: string; count: number }[];
  };
  ownerName: string;
}

export default function DashboardClient({ restaurant, stats, ownerName }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "menu" | "qr">("overview");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Modals / Form States
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");

  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemDiet, setNewItemDiet] = useState<"VEG" | "NON_VEG">("VEG");
  const [newItemFeatured, setNewItemFeatured] = useState(false);
  const [newItemAvailable, setNewItemAvailable] = useState(true);
  const [newItemImageUrl, setNewItemImageUrl] = useState("");

  const [editingItem, setEditingItem] = useState<{
    id: string;
    name: string;
    description: string;
    price: string;
    categoryId: string;
    diet: "VEG" | "NON_VEG";
    isAvailable: boolean;
    isFeatured: boolean;
    imageUrl: string;
  } | null>(null);

  const activeQrCode = restaurant.qrCodes[0];

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;

    setError(null);
    startTransition(async () => {
      try {
        await createCategoryAction(restaurant.id, {
          name: newCategoryName,
          description: newCategoryDesc,
        });
        setNewCategoryName("");
        setNewCategoryDesc("");
        setShowAddCategoryModal(false);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to create category");
      }
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category and all its menu items?")) return;

    setError(null);
    startTransition(async () => {
      try {
        await deleteCategoryAction(categoryId);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to delete category");
      }
    });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice || !selectedCategoryId) return;

    setError(null);
    startTransition(async () => {
      try {
        await createMenuItemAction({
          name: newItemName,
          description: newItemDesc,
          price: parseFloat(newItemPrice),
          categoryId: selectedCategoryId,
          diet: newItemDiet,
          isAvailable: newItemAvailable,
          isFeatured: newItemFeatured,
          imageUrl: newItemImageUrl || undefined,
        });
        setNewItemName("");
        setNewItemDesc("");
        setNewItemPrice("");
        setNewItemImageUrl("");
        setShowAddItemModal(false);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to create menu item");
      }
    });
  };

  const handleEditItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.name || !editingItem.price) return;

    setError(null);
    startTransition(async () => {
      try {
        await updateMenuItemAction(editingItem.id, {
          name: editingItem.name,
          description: editingItem.description,
          price: parseFloat(editingItem.price),
          categoryId: editingItem.categoryId,
          diet: editingItem.diet,
          isAvailable: editingItem.isAvailable,
          isFeatured: editingItem.isFeatured,
          imageUrl: editingItem.imageUrl || undefined,
        });
        setEditingItem(null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to update menu item");
      }
    });
  };

  const handleDeleteItem = (itemId: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;

    setError(null);
    startTransition(async () => {
      try {
        await deleteMenuItemAction(itemId);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to delete item");
      }
    });
  };

  const maxScanValue = Math.max(...stats.scansLast7Days.map(d => d.count), 1);

  return (
    <div className="min-h-screen bg-[#f7f8f6] text-[#17241f] flex">
      {/* Sidebar Navigation */}
      <aside className="fixed inset-y-0 hidden w-64 border-r border-[#dfe5dd] bg-white p-5 lg:block">
        <div className="text-xl font-black tracking-tight">
          table<span className="text-[#e85432]">tap</span>
        </div>
        <p className="mt-8 px-3 text-xs font-black uppercase tracking-widest text-[#8a9690]">
          {restaurant.name}
        </p>
        <nav className="mt-3 space-y-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
              activeTab === "overview" ? "bg-[#e8f3d9] text-[#29483a]" : "text-[#68766f] hover:bg-[#f5f6f3]"
            )}
          >
            <LayoutDashboard size={18} />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("menu")}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
              activeTab === "menu" ? "bg-[#e8f3d9] text-[#29483a]" : "text-[#68766f] hover:bg-[#f5f6f3]"
            )}
          >
            <UtensilsCrossed size={18} />
            Menu
          </button>
          <button
            onClick={() => setActiveTab("qr")}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
              activeTab === "qr" ? "bg-[#e8f3d9] text-[#29483a]" : "text-[#68766f] hover:bg-[#f5f6f3]"
            )}
          >
            <QrCode size={18} />
            QR code
          </button>
        </nav>

        <div className="absolute bottom-5 left-5 right-5 rounded-xl bg-[#17241f] p-4 text-white">
          <p className="text-sm font-bold">TableTap Pro</p>
          <p className="mt-1 text-xs leading-5 text-white/60">
            Analytics & live updates active.
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 px-5 py-6 lg:px-10 max-w-6xl">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Good afternoon, {ownerName}
            </h1>
            <p className="text-sm font-medium text-[#738078] mt-1">
              Managing <span className="font-semibold text-[#17241f]">{restaurant.name}</span>
            </p>
          </div>
          <a
            href={`/menu/${restaurant.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-[#dbe2db] bg-white px-4 py-2.5 text-sm font-bold shadow-sm transition-transform active:scale-[0.98]"
          >
            View Live Menu <ExternalLink size={15} />
          </a>
        </header>

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 font-medium">
            {error}
          </div>
        )}

        {/* --- OVERVIEW TAB --- */}
        {activeTab === "overview" && (
          <div className="mt-8 space-y-6 animate-in fade-in duration-200">
            {/* Stats Cards */}
            <section className="grid gap-4 md:grid-cols-3">
              <article className="rounded-2xl bg-white p-5 shadow-sm border border-stone-100">
                <p className="text-sm font-bold text-[#718077]">Total QR scans</p>
                <p className="mt-4 text-3xl font-black">{stats.totalScans}</p>
                <p className="mt-2 flex items-center gap-1 text-xs font-bold text-[#4d9167]">
                  <ArrowUpRight size={14} /> Scans recorded
                </p>
              </article>
              <article className="rounded-2xl bg-white p-5 shadow-sm border border-stone-100">
                <p className="text-sm font-bold text-[#718077]">Scans this month</p>
                <p className="mt-4 text-3xl font-black">{stats.monthScans}</p>
                <p className="mt-2 flex items-center gap-1 text-xs font-bold text-[#4d9167]">
                  <ArrowUpRight size={14} /> Active tracking
                </p>
              </article>
              <article className="rounded-2xl bg-white p-5 shadow-sm border border-stone-100">
                <p className="text-sm font-bold text-[#718077]">Menu items</p>
                <p className="mt-4 text-3xl font-black">{stats.totalItems}</p>
                <p className="mt-2 text-xs font-bold text-stone-500">
                  {stats.featuredItems} popular items starred
                </p>
              </article>
            </section>

            {/* Performance Chart & QR Preview */}
            <section className="grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
              <article className="rounded-2xl bg-white p-6 shadow-sm border border-stone-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-black text-lg">Menu performance</h2>
                    <p className="mt-1 text-sm text-[#758079]">QR scans over the last 7 days</p>
                  </div>
                </div>
                <div className="mt-9 flex h-44 items-end justify-between gap-3">
                  {stats.scansLast7Days.map((d, i) => {
                    const heightPercent = Math.max((d.count / maxScanValue) * 100, 5);
                    return (
                      <div key={i} className="flex flex-1 flex-col items-center gap-2 h-full justify-end">
                        <div 
                          className="w-full max-w-[2.5rem] rounded-t-md bg-[#d9e9c6] hover:bg-[#cbe0b4] transition-colors relative group cursor-pointer" 
                          style={{ height: `${heightPercent}%` }}
                        >
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 bg-[#17241f] text-white text-[10px] font-bold px-1.5 py-0.5 rounded transition-transform shadow-md">
                            {d.count}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-[#93a099]">{d.day}</span>
                      </div>
                    );
                  })}
                </div>
              </article>

              <article className="rounded-2xl bg-[#17241f] p-6 text-white flex flex-col justify-between shadow-xl">
                <div>
                  <QrCode size={24} className="text-[#e9c46a]" />
                  <h2 className="mt-6 text-xl font-black">Your menu QR</h2>
                  <p className="mt-2 text-sm leading-6 text-white/65">
                    Print it once. Changes to your menu reflect instantly when guests scan the QR code.
                  </p>
                </div>
                {activeQrCode && (
                  <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-white p-3 text-[#17241f]">
                    <div className="h-16 w-16 bg-[#f7f8f6] rounded border border-stone-200 p-1 flex items-center justify-center">
                      {/* Generates live qr code buffer preview via API */}
                      <img 
                        src={`/api/qr/${activeQrCode.publicId}?format=png`} 
                        alt="Menu QR code" 
                        className="h-14 w-14 object-contain" 
                      />
                    </div>
                    <div className="flex gap-2">
                      <a 
                        href={`/api/qr/${activeQrCode.publicId}?format=svg`} 
                        download 
                        className="rounded-lg bg-stone-100 hover:bg-stone-200 px-3 py-2 text-xs font-bold text-[#17241f]"
                      >
                        SVG
                      </a>
                      <a 
                        href={`/api/qr/${activeQrCode.publicId}?format=png`} 
                        download
                        className="rounded-lg bg-[#e85432] hover:bg-[#d64726] px-3 py-2 text-xs font-bold text-white shadow"
                      >
                        PNG
                      </a>
                    </div>
                  </div>
                )}
              </article>
            </section>
          </div>
        )}

        {/* --- MENU TAB --- */}
        {activeTab === "menu" && (
          <div className="mt-8 space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black">Menu categories</h2>
                <p className="text-sm text-[#758079]">Create sections and dishes on your menu.</p>
              </div>
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#17241f] hover:bg-[#253630] px-4 py-2.5 text-sm font-bold text-white transition-colors"
              >
                <Plus size={16} /> Category
              </button>
            </div>

            <div className="space-y-6">
              {restaurant.categories.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-stone-150 shadow-sm">
                  <p className="font-bold text-lg">No categories yet</p>
                  <p className="text-sm opacity-60 mt-1 mb-4">Create your first category (e.g. Starters) to begin.</p>
                  <button
                    onClick={() => setShowAddCategoryModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#e85432] px-3.5 py-2 text-sm font-bold text-white"
                  >
                    Create Category
                  </button>
                </div>
              ) : (
                restaurant.categories.map((category) => (
                  <article key={category.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                    <header className="flex items-center justify-between bg-stone-50/70 border-b border-stone-100 px-5 py-4">
                      <div>
                        <h3 className="font-black text-stone-800 text-lg">{category.name}</h3>
                        {category.description && (
                          <p className="text-xs text-stone-500">{category.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedCategoryId(category.id);
                            setShowAddItemModal(true);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#e85432] hover:bg-orange-50 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <Plus size={14} /> Add Item
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete category"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </header>

                    <div className="divide-y divide-stone-100">
                      {category.items.length === 0 ? (
                        <div className="text-center py-8 text-sm text-stone-400 italic">
                          No items in this category yet.
                        </div>
                      ) : (
                        category.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-4 sm:p-5 hover:bg-stone-50/30 transition-colors">
                            <div className="flex gap-3 items-center min-w-0 flex-1">
                              {item.imageUrl && (
                                <img 
                                  src={item.imageUrl} 
                                  alt="" 
                                  className="h-12 w-12 rounded-lg object-cover bg-stone-100 border border-stone-200" 
                                />
                              )}
                              <div className="min-w-0">
                                <h4 className="font-bold text-stone-800 flex items-center gap-2">
                                  {item.name}
                                  {item.diet === "VEG" ? (
                                    <Leaf size={12} className="text-emerald-600" />
                                  ) : (
                                    <Drumstick size={12} className="text-red-500" />
                                  )}
                                  {item.isFeatured && (
                                    <span className="rounded bg-[#f9e4aa] px-1.5 py-0.5 text-[9px] font-black uppercase text-[#795813]">
                                      Popular
                                    </span>
                                  )}
                                </h4>
                                <p className="text-xs text-stone-500 truncate max-w-md mt-0.5">
                                  {item.description || "No description provided."}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 ml-4">
                              <span className="font-black text-stone-800 text-sm">₹{item.price}</span>
                              <div className="flex items-center gap-1 border-l border-stone-200 pl-3">
                                <button
                                  onClick={() => {
                                    setEditingItem({
                                      id: item.id,
                                      name: item.name,
                                      description: item.description || "",
                                      price: item.price.toString(),
                                      categoryId: category.id,
                                      diet: item.diet,
                                      isAvailable: item.isAvailable,
                                      isFeatured: item.isFeatured,
                                      imageUrl: item.imageUrl || "",
                                    });
                                  }}
                                  className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
                                  title="Edit item"
                                >
                                  <Edit3 size={15} />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                                  title="Delete item"
                                >
                                  <Trash size={15} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        )}

        {/* --- QR TAB --- */}
        {activeTab === "qr" && activeQrCode && (
          <div className="mt-8 space-y-6 animate-in fade-in duration-200">
            <h2 className="text-xl font-black">Dynamic QR Code</h2>
            <p className="text-sm text-[#758079]">
              This QR code maps statically to your restaurant URL. Even if you edit items or slugs later, the redirect publicId remains stable.
            </p>

            <div className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm flex flex-col items-center">
              <div className="h-64 w-64 bg-white border border-stone-200 p-4 rounded-2xl flex items-center justify-center shadow-inner">
                <img 
                  src={`/api/qr/${activeQrCode.publicId}?format=png`} 
                  alt="Menu QR" 
                  className="h-full w-full object-contain" 
                />
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <a
                  href={`/api/qr/${activeQrCode.publicId}?format=svg`}
                  download
                  className="rounded-full bg-stone-100 hover:bg-stone-200 px-6 py-3 font-bold text-stone-700 transition-transform active:scale-[0.98]"
                >
                  Download SVG
                </a>
                <a
                  href={`/api/qr/${activeQrCode.publicId}?format=png`}
                  download
                  className="rounded-full bg-[#17241f] hover:bg-[#253630] px-6 py-3 font-bold text-white shadow transition-transform active:scale-[0.98]"
                >
                  Download PNG (High-Res)
                </a>
              </div>

              <div className="mt-8 border-t border-stone-100 pt-6 w-full max-w-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-stone-800">Direct Menu Link</h3>
                    <p className="text-xs text-stone-400 mt-0.5">Copy link for social media profiles.</p>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/menu/${restaurant.slug}`);
                      alert("Link copied!");
                    }}
                    className="text-xs font-bold text-[#e85432] hover:underline"
                  >
                    Copy link
                  </button>
                </div>
                <div className="mt-3 bg-stone-50 border border-stone-150 p-2.5 rounded-lg text-xs text-stone-600 break-all select-all font-mono">
                  {typeof window !== "undefined" && `${window.location.origin}/menu/${restaurant.slug}`}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- ADD CATEGORY MODAL --- */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <header className="flex justify-between items-center px-6 py-4 border-b border-stone-100">
              <h3 className="font-black text-[#17241f] text-lg">Add Category</h3>
              <button onClick={() => setShowAddCategoryModal(false)} className="text-stone-400 hover:text-stone-600">
                <X size={20} />
              </button>
            </header>
            <form onSubmit={handleAddCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Category Name</label>
                <input 
                  type="text" 
                  value={newCategoryName} 
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Starters, Mains, Drinks"
                  required
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-stone-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Description (Optional)</label>
                <textarea 
                  value={newCategoryDesc} 
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                  placeholder="e.g. Small plates to share"
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-stone-400 resize-none h-20"
                />
              </div>
              <button 
                type="submit" 
                disabled={isPending}
                className="w-full bg-[#17241f] hover:bg-[#253630] disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-[0.98]"
              >
                {isPending ? "Creating..." : "Create Category"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD ITEM MODAL --- */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-150">
            <header className="flex justify-between items-center px-6 py-4 border-b border-stone-100">
              <h3 className="font-black text-[#17241f] text-lg">Add Menu Item</h3>
              <button onClick={() => setShowAddItemModal(false)} className="text-stone-400 hover:text-stone-600">
                <X size={20} />
              </button>
            </header>
            <form onSubmit={handleAddItem} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Item Name</label>
                <input 
                  type="text" 
                  value={newItemName} 
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Wild mushroom toast"
                  required
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-stone-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Description (Optional)</label>
                <textarea 
                  value={newItemDesc} 
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  placeholder="e.g. Whipped ricotta, roasted mushrooms, herb oil"
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-stone-400 resize-none h-20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Price (₹)</label>
                  <input 
                    type="number" 
                    value={newItemPrice} 
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    placeholder="380"
                    required
                    min="0"
                    step="0.01"
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-stone-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Diet Label</label>
                  <select 
                    value={newItemDiet} 
                    onChange={(e) => setNewItemDiet(e.target.value as "VEG" | "NON_VEG")}
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-stone-400"
                  >
                    <option value="VEG">Vegetarian</option>
                    <option value="NON_VEG">Non-Vegetarian</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Image URL (Optional)</label>
                <input 
                  type="url" 
                  value={newItemImageUrl} 
                  onChange={(e) => setNewItemImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo..."
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-stone-400"
                />
              </div>
              <div className="flex gap-4 border-t border-stone-100 pt-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={newItemFeatured} 
                    onChange={(e) => setNewItemFeatured(e.target.checked)}
                    className="rounded text-[#e85432] focus:ring-0"
                  />
                  <span className="text-xs font-bold text-stone-600">Featured / Popular</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={newItemAvailable} 
                    onChange={(e) => setNewItemAvailable(e.target.checked)}
                    className="rounded text-[#e85432] focus:ring-0"
                  />
                  <span className="text-xs font-bold text-stone-600">In Stock / Available</span>
                </label>
              </div>
              <button 
                type="submit" 
                disabled={isPending}
                className="w-full bg-[#17241f] hover:bg-[#253630] disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-[0.98]"
              >
                {isPending ? "Creating..." : "Create Menu Item"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT ITEM MODAL --- */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-150">
            <header className="flex justify-between items-center px-6 py-4 border-b border-stone-100">
              <h3 className="font-black text-[#17241f] text-lg">Edit Menu Item</h3>
              <button onClick={() => setEditingItem(null)} className="text-stone-400 hover:text-stone-600">
                <X size={20} />
              </button>
            </header>
            <form onSubmit={handleEditItem} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Item Name</label>
                <input 
                  type="text" 
                  value={editingItem.name} 
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="e.g. Wild mushroom toast"
                  required
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-stone-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Description (Optional)</label>
                <textarea 
                  value={editingItem.description} 
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="e.g. Sourdough toast, roasted chanterelles..."
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-stone-400 resize-none h-20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Price (₹)</label>
                  <input 
                    type="number" 
                    value={editingItem.price} 
                    onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                    placeholder="380"
                    required
                    min="0"
                    step="0.01"
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-stone-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Diet Label</label>
                  <select 
                    value={editingItem.diet} 
                    onChange={(e) => setEditingItem({ ...editingItem, diet: e.target.value as "VEG" | "NON_VEG" })}
                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-stone-400"
                  >
                    <option value="VEG">Vegetarian</option>
                    <option value="NON_VEG">Non-Vegetarian</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Image URL (Optional)</label>
                <input 
                  type="url" 
                  value={editingItem.imageUrl} 
                  onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo..."
                  className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-stone-400"
                />
              </div>
              <div className="flex gap-4 border-t border-stone-100 pt-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={editingItem.isFeatured} 
                    onChange={(e) => setEditingItem({ ...editingItem, isFeatured: e.target.checked })}
                    className="rounded text-[#e85432] focus:ring-0"
                  />
                  <span className="text-xs font-bold text-stone-600">Featured / Popular</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={editingItem.isAvailable} 
                    onChange={(e) => setEditingItem({ ...editingItem, isAvailable: e.target.checked })}
                    className="rounded text-[#e85432] focus:ring-0"
                  />
                  <span className="text-xs font-bold text-stone-600">In Stock / Available</span>
                </label>
              </div>
              <button 
                type="submit" 
                disabled={isPending}
                className="w-full bg-[#17241f] hover:bg-[#253630] disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-[0.98]"
              >
                {isPending ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
