"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

interface Props {
  slug: string;
  isOwner: boolean;
}

export default function PostOwnerActions({ slug, isOwner }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!isOwner) return null;

  async function handleDelete() {
    const res = await fetch(`/api/posts/${slug}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      toast.error("Impossible de supprimer l'article.");
      return;
    }

    toast.success("Article supprimé.");
    router.push("/dashboard");
    setOpen(false);
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Link
          href={`/posts/${slug}/edit`}
          className="inline-flex items-center gap-1 rounded-full border border-zinc-300 px-3 py-1.5 font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
        >
          Modifier l&apos;article
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 font-medium text-red-600 hover:bg-red-50 dark:border-red-700/60 dark:text-red-400 dark:hover:bg-red-900/30"
        >
          Supprimer
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-sm text-zinc-100 shadow-xl">
            <h2 className="text-base font-semibold">Supprimer cet article ?</h2>
            <p className="mt-2 text-xs text-zinc-400">
              Cette action est irréversible. Le post, ses likes et ses
              commentaires seront définitivement supprimés.
            </p>
            <div className="mt-4 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-zinc-700 px-3 py-1.5 font-medium text-zinc-200 hover:bg-zinc-800"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-full border border-red-500 bg-red-600 px-3 py-1.5 font-medium text-white hover:bg-red-500"
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

