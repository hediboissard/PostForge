"use client";

import { useFormStatus } from "react-dom";
import { toast } from "sonner";

interface Props {
  action: (formData: FormData) => Promise<void> | void;
  commentId: string;
}

export default function CommentDeleteButton({ action, commentId }: Props) {
  const { pending } = useFormStatus();

  return (
    <form
      action={async (formData) => {
        await action(formData);
        toast.success("Commentaire supprimé.");
      }}
    >
      <input type="hidden" name="commentId" value={commentId} />
      <button
        type="submit"
        disabled={pending}
        className="text-[11px] text-zinc-400 hover:text-red-500 disabled:opacity-60"
      >
        Supprimer
      </button>
    </form>
  );
}

