import Link from "next/link";
import { signInAction, signInAsUserAction } from "../auth-actions";
import { UtensilsCrossed, UserCheck } from "lucide-react";
import { db } from "@/lib/db";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  let errorMessage = "";
  if (error === "missing_email") {
    errorMessage = "Please enter your email address.";
  } else if (error === "user_not_found") {
    errorMessage = "No registered user was found with that email address.";
  }

  // Fetch existing users in database for quick dev login selection
  const existingUsers = await db.user.findMany({
    select: {
      clerkId: true,
      email: true,
      name: true,
      role: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-[#f8f7f4] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-[#1d2521]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-2xl bg-[#dd5b3d] flex items-center justify-center text-white shadow-md">
            <UtensilsCrossed size={24} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-black tracking-tight font-[family-name:var(--font-display)]">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-[#52635f]">
          Access your tabletap restaurant menu panel.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md space-y-6">
        <div className="bg-white py-8 px-4 shadow-xl shadow-stone-200/50 rounded-3xl sm:px-10 border border-stone-100">
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-55/10 border border-red-200/30 text-red-500 rounded-2xl text-xs font-bold">
              {errorMessage}
            </div>
          )}
          <form action={signInAction} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-stone-700">
                Email address
              </label>
              <div className="mt-1.5">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="e.g. owner@tabletap.com"
                  className="block w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm focus:border-[#dd5b3d] focus:outline-none focus:ring-1 focus:ring-[#dd5b3d]"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-full bg-[#14211f] px-4 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99]"
              >
                Sign In to Dashboard
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-stone-100 pt-6 text-center text-xs text-stone-500">
            Don&apos;t have an account yet?{" "}
            <Link href="/sign-up" className="font-bold text-[#dd5b3d] hover:underline">
              Create an account
            </Link>
          </div>
        </div>

        {/* Quick Developer Selection Box */}
        {existingUsers.length > 0 && (
          <div className="bg-white p-6 shadow-md rounded-3xl border border-stone-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-1.5">
              <UserCheck size={14} /> Quick Local Login Accounts
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {existingUsers.map((user) => (
                <form key={user.clerkId} action={signInAsUserAction.bind(null, user.clerkId)}>
                  <button
                    type="submit"
                    className="w-full text-left p-3 rounded-2xl border border-stone-100 hover:border-[#dd5b3d] hover:bg-stone-50 flex items-center justify-between text-xs transition-colors group"
                  >
                    <div>
                      <span className="font-bold text-stone-850 group-hover:text-[#dd5b3d]">
                        {user.name || "Unnamed"}
                      </span>
                      <span className="block text-stone-500 font-medium mt-0.5">{user.email}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-semibold group-hover:bg-orange-50 group-hover:text-[#dd5b3d]">
                      {user.role}
                    </span>
                  </button>
                </form>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
