"use client";

import { useFormStatus } from "react-dom";
import { startTransition, useOptimistic } from "react";

interface Props {
  isLiked: boolean;
  likesCount: number;
}

type OptimisticState = {
  liked: boolean;
  count: number;
};

export default function LikeButton({ isLiked, likesCount }: Props) {
  const { pending } = useFormStatus();

  const [optimisticState, toggleOptimistic] = useOptimistic<
    OptimisticState,
    "toggle"
  >(
    { liked: isLiked, count: likesCount },
    (state, _action) => ({
      liked: !state.liked,
      count: state.liked ? state.count - 1 : state.count + 1,
    }),
  );

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={() => {
        startTransition(() => {
          toggleOptimistic("toggle");
        });
      }}
      className={`inline-flex items-center gap-2 rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-transform duration-150 hover:bg-zinc-100 active:scale-95 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900 ${
        pending ? "scale-95 opacity-80" : ""
      }`}
    >
      <span>
        {optimisticState.liked ? "💔 Retirer le like" : "❤️ Liker"}
      </span>
      <span className="text-zinc-500">{optimisticState.count}</span>
    </button>
  );
}


