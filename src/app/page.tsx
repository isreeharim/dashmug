import Link from "next/link";
import { ArrowRight, QrCode, ScanLine, UtensilsCrossed } from "lucide-react";

const features = [
  ["Digital menus", "A beautiful, always-current menu for every guest.", UtensilsCrossed],
  ["Dynamic QR", "Print once. Update menus and destinations whenever needed.", QrCode],
  ["Scan insight", "See how often guests discover your menu.", ScanLine],
];

export default function MarketingHome() {
  return <main className="min-h-screen overflow-hidden bg-[#f8f7f4] text-[#14211f]">
    <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
      <Link href="/" className="text-xl font-black tracking-tight">table<span className="text-[#e85432]">tap</span></Link>
      <div className="flex items-center gap-3 text-sm font-semibold"><Link href="/dashboard" className="hidden sm:block">Sign in</Link><Link href="/dashboard" className="rounded-full bg-[#14211f] px-4 py-2.5 text-white">Start free</Link></div>
    </nav>
    <section className="relative mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:pb-32 lg:pt-24">
      <div className="absolute -left-48 top-12 h-80 w-80 rounded-full bg-[#d9e9c6] blur-3xl" />
      <div className="relative">
        <p className="mb-5 inline-flex rounded-full border border-[#b8c9bd] bg-white/70 px-3 py-1 text-xs font-bold uppercase tracking-[.16em] text-[#426059]">Menus made memorable</p>
        <h1 className="max-w-3xl text-5xl font-black leading-[.95] tracking-[-.06em] sm:text-7xl">Your menu, <span className="text-[#e85432]">one tap</span> away.</h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-[#52635f]">Give every table a fast, branded digital menu. No app downloads. No reprints. Just a better first taste.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-[#e85432] px-5 py-3.5 font-bold text-white shadow-lg shadow-orange-200">Create your menu <ArrowRight size={17}/></Link><a href="#how-it-works" className="rounded-full border border-[#b8c9bd] bg-white px-5 py-3.5 font-bold">See how it works</a></div>
        <p className="mt-5 text-sm text-[#65736f]">Free to start. Built for independent restaurants.</p>
      </div>
      <div className="relative mx-auto w-full max-w-sm rotate-3 rounded-[2.2rem] bg-[#14211f] p-3 shadow-2xl lg:rotate-6">
        <div className="overflow-hidden rounded-[1.65rem] bg-[#fbf2e6] p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-[#e85432]">Cedar & Salt</p><h2 className="mt-1 text-2xl font-black">Today&apos;s menu</h2></div><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e85432] text-white"><UtensilsCrossed size={22}/></div></div><div className="mt-5 h-44 rounded-2xl bg-[linear-gradient(135deg,#d97745,#f2bd78_55%,#697d4d)]"/><div className="mt-4 flex items-start justify-between"><div><p className="font-bold">Wild mushroom toast</p><p className="mt-1 text-sm text-[#7b746b]">Herbs, ricotta, sourdough</p></div><p className="font-black">$14</p></div><div className="mt-5 flex gap-2 overflow-hidden"><span className="rounded-full bg-[#14211f] px-3 py-1.5 text-xs font-bold text-white">Popular</span><span className="rounded-full border border-[#d7cabb] px-3 py-1.5 text-xs font-bold">Mains</span><span className="rounded-full border border-[#d7cabb] px-3 py-1.5 text-xs font-bold">Drinks</span></div></div>
      </div>
    </section>
    <section id="how-it-works" className="border-y border-[#dce2db] bg-white/50"><div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:grid-cols-3 sm:px-8">{features.map(([title, body, Icon], index) => { const FeatureIcon = Icon as typeof QrCode; return <article key={title as string} className="relative"><span className="text-sm font-black text-[#e85432]">0{index + 1}</span><FeatureIcon className="mb-4 mt-7" size={28}/><h2 className="text-xl font-black">{title as string}</h2><p className="mt-2 max-w-xs leading-7 text-[#65736f]">{body as string}</p></article>})}</div></section>
  </main>;
}
