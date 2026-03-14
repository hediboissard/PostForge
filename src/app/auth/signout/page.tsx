"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function SignOutPage() {
  const router = useRouter();
  const { data: session } = useSession();

  async function handleSignOut() {
    await signOut({ callbackUrl: "/" });
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-100 px-4 py-10 font-sans text-zinc-900 dark:from-black dark:via-zinc-950 dark:to-black dark:text-zinc-50">
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <div className="rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-500">
              PostForge
            </p>
            <h1 className="text-xl font-semibold tracking-tight">
              Se déconnecter ?
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {session?.user?.email
                ? `Tu es actuellement connecté en tant que ${session.user.email}.`
                : "Tu es actuellement connecté."}
              {" "}Tu peux revenir à l&apos;accueil à tout moment.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 text-sm">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              Oui, me déconnecter
            </button>
            <Link
              href="/"
              className="w-full rounded-full border border-zinc-300 px-4 py-2 text-center text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Non, retourner à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

