import Link from "next/link";
import { signUpAction } from "../auth-actions";
import { UtensilsCrossed } from "lucide-react";

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  let errorMessage = "";
  if (error === "missing_fields") {
    errorMessage = "Name and email are required fields.";
  } else if (error === "user_exists") {
    errorMessage = "A user with this email address already exists.";
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-[#1d2521]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-2xl bg-[#dd5b3d] flex items-center justify-center text-white shadow-md">
            <UtensilsCrossed size={24} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-black tracking-tight font-[family-name:var(--font-display)]">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-[#52635f]">
          Start building your interactive QR menu today.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-stone-200/50 rounded-3xl sm:px-10 border border-stone-100">
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-55/10 border border-red-200/30 text-red-500 rounded-2xl text-xs font-bold">
              {errorMessage}
            </div>
          )}
          <form action={signUpAction} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-stone-700">
                Restaurant Owner Name
              </label>
              <div className="mt-1.5">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  className="block w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm focus:border-[#dd5b3d] focus:outline-none focus:ring-1 focus:ring-[#dd5b3d]"
                />
              </div>
            </div>

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
                  placeholder="e.g. priya@restaurant.com"
                  className="block w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm focus:border-[#dd5b3d] focus:outline-none focus:ring-1 focus:ring-[#dd5b3d]"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-full bg-[#14211f] px-4 py-3.5 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99]"
              >
                Register & Go to Dashboard
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-stone-100 pt-6 text-center text-xs text-stone-500">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-bold text-[#dd5b3d] hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
