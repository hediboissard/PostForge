import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import CommentFormClient from "./CommentFormClient";
import CommentDeleteButton from "./CommentDeleteButton";

interface Props {
  postId: string;
  postAuthorId: string;
}

export default async function PostComments({ postId, postAuthorId }: Props) {
  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as any)?.id as string | undefined;

  async function addComment(formData: FormData) {
    "use server";

    const currentSession = await getServerSession(authOptions);
    if (!currentSession || !currentSession.user?.email) {
      redirect("/login");
    }

    const content = formData.get("content");
    if (!content || typeof content !== "string" || !content.trim()) {
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: currentSession.user.email! },
    });

    if (!user) return;

    await prisma.comment.create({
      data: {
        content: content.trim(),
        authorId: user.id,
        postId,
      },
    });
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (post) {
      revalidatePath(`/posts/${post.slug}`);
    }
  }

  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "desc" },
    include: { author: true, post: true },
  });

  async function deleteComment(formData: FormData) {
    "use server";

    const commentId = formData.get("commentId");
    if (!commentId || typeof commentId !== "string") {
      return;
    }

    const currentSession = await getServerSession(authOptions);
    if (!currentSession || !currentSession.user?.email) {
      redirect("/login");
    }

    const user = await prisma.user.findUnique({
      where: { email: currentSession.user.email! },
    });

    if (!user) return;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { post: true },
    });

    if (!comment) return;

    const isAuthor = comment.authorId === user.id;
    const isPostAuthor = comment.post.authorId === user.id;

    if (!isAuthor && !isPostAuthor) {
      return;
    }

    await prisma.comment.delete({ where: { id: commentId } });
    revalidatePath(`/posts/${comment.post.slug}`);
  }

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        Commentaires ({comments.length})
      </h2>

      {session ? (
        <CommentFormClient action={addComment} />
      ) : (
        <p className="text-xs text-zinc-500">
          Connecte-toi pour commenter cet article.
        </p>
      )}

      <ul className="space-y-3">
        {comments.map((comment) => {
          const canDelete =
            !!currentUserId &&
            (comment.authorId === currentUserId ||
              postAuthorId === currentUserId);

          return (
            <li
              key={comment.id}
              className="rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-zinc-500">
                    <span className="font-medium">
                      {comment.author?.name ??
                        comment.author?.email ??
                        "Utilisateur"}
                    </span>
                  </p>
                  <p className="mt-1 text-sm">{comment.content}</p>
                </div>
                {canDelete && (
                  <CommentDeleteButton
                    action={deleteComment}
                    commentId={comment.id}
                  />
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

