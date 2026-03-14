"use client";

import { useFormStatus } from "react-dom";
import { toast } from "sonner";

interface Props {
  action: (formData: FormData) => Promise<void> | void;
}

export default function CommentFormClient({ action }: Props) {
  const { pending } = useFormStatus();

  return (
    <form
      action={async (formData) => {
        await action(formData);
        toast.success("Commentaire publié ✨");
      }}
      className="space-y-2"
    >
      <textarea
        name="content"
        rows={3}
        placeholder="Écrire un commentaire..."
        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
      >
        {pending ? "Publication..." : "Publier un commentaire"}
      </button>
    </form>
  );
}

