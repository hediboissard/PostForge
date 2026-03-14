import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import PostComments from "./post-comments";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PostOwnerActions from "./post-owner-actions";
import LikeButton from "./LikeButton";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: true,
      comments: {
        orderBy: { createdAt: "desc" },
        include: { author: true },
      },
      likes: true,
    },
  });

  if (!post) {
    notFound();
  }

  const postId = post.id;
  const postSlug = post.slug;
  const session = await getServerSession(authOptions);

  async function handleLike() {
    "use server";

    const currentSession = await getServerSession(authOptions);
    if (!currentSession || !currentSession.user?.email) {
      redirect("/login");
    }

    const user = await prisma.user.findUnique({
      where: { email: currentSession.user.email! },
    });

    if (!user) return;

    const existing = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId,
        },
      },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
    } else {
      await prisma.like.create({
        data: {
          userId: user.id,
          postId,
        },
      });
    }

    revalidatePath(`/posts/${postSlug}`);
  }

  const isLiked =
    !!session &&
    !!post.likes.find((like) => like.userId === (session.user as any)?.id);

  const isOwner =
    !!session && (session.user as any)?.id && post.authorId === (session.user as any).id;

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-100 px-4 py-10 font-sans text-zinc-900 dark:from-black dark:via-zinc-950 dark:to-black dark:text-zinc-50">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <article className="space-y-5 rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90">
          <header className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <div className="space-y-1">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-500">
                    Article · PostForge
                  </p>
                  <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 sm:text-2xl">
                    {post.title}
                  </h1>
                </div>
              </div>
              <div className="hidden text-right text-[11px] text-zinc-500 sm:block">
                <p>
                  Par{" "}
                  <span className="font-medium">
                    {post.author?.name ?? post.author?.email ?? "Auteur"}
                  </span>
                </p>
                <p>
                  ❤️ {post.likes.length} • 💬 {post.comments.length}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-500 sm:hidden">
              <p>
                Par{" "}
                <span className="font-medium">
                  {post.author?.name ?? post.author?.email ?? "Auteur"}
                </span>
              </p>
              <p>
                ❤️ {post.likes.length} • 💬 {post.comments.length}
              </p>
            </div>
          </header>

          {post.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.imageUrl}
              alt={post.title}
              className="max-h-80 w-full rounded-2xl object-cover"
            />
          )}

          <div className="article-scroll prose prose-sm max-w-none whitespace-pre-line text-sm leading-relaxed text-zinc-800 dark:prose-invert dark:text-zinc-100 max-h-80 overflow-y-auto pr-2">
            {post.content}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <form action={handleLike}>
              <LikeButton isLiked={isLiked} likesCount={post.likes.length} />
            </form>
            <PostOwnerActions slug={post.slug} isOwner={isOwner} />
          </div>
        </article>

        <PostComments postId={post.id} postAuthorId={post.authorId} />
      </div>
    </main>
  );
}

