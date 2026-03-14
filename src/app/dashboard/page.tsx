import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

type UserWithPosts = NonNullable<
  Awaited<
    ReturnType<
      typeof prisma.user.findUnique<{
        include: {
          posts: {
            orderBy: { createdAt: "desc" };
            include: { likes: true; comments: true };
          };
        };
      }>
    >
  >
>;

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      posts: {
        orderBy: { createdAt: "desc" },
        include: {
          likes: true,
          comments: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const typedUser = user as UserWithPosts;

  const totalPosts = typedUser.posts.length;
  const totalLikes = typedUser.posts.reduce(
    (acc: number, post: UserWithPosts["posts"][number]) =>
      acc + post.likes.length,
    0,
  );
  const totalComments = typedUser.posts.reduce(
    (acc: number, post: UserWithPosts["posts"][number]) =>
      acc + post.comments.length,
    0,
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-100 px-4 py-10 font-sans text-zinc-900 dark:from-black dark:via-zinc-950 dark:to-black dark:text-zinc-50">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <header className="flex items-center justify-between gap-4 rounded-3xl border border-zinc-200 bg-white/90 p-5 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-violet-500 text-sm font-semibold text-white">
              {(user.name ?? user.email ?? "?")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-500">
                Tableau de bord
              </p>
              <h1 className="text-xl font-semibold sm:text-2xl">
                Salut, {user.name ?? user.email}
              </h1>
              <p className="text-xs text-zinc-500">
                {totalPosts} article
                {totalPosts > 1 ? "s" : ""} publié
                {totalPosts > 1 ? "s" : ""} jusqu&apos;ici.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 text-xs sm:flex-row sm:items-center sm:gap-3">
            <Link
              href="/"
              className="rounded-full border border-zinc-300 px-3 py-1.5 font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              ← Accueil
            </Link>
            <Link
              href="/posts/new"
              className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              + Nouvel article
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white/90 p-4 dark:border-zinc-800 dark:bg-zinc-900/90">
            <p className="text-xs text-zinc-500">Articles publiés</p>
            <p className="mt-1 text-xl font-semibold">{totalPosts}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white/90 p-4 dark:border-zinc-800 dark:bg-zinc-900/90">
            <p className="text-xs text-zinc-500">Likes reçus</p>
            <p className="mt-1 text-xl font-semibold">{totalLikes}</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white/90 p-4 dark:border-zinc-800 dark:bg-zinc-900/90">
            <p className="text-xs text-zinc-500">Commentaires</p>
            <p className="mt-1 text-xl font-semibold">{totalComments}</p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Mes articles
          </h2>
          {typedUser.posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/80 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/80">
              Tu n&apos;as pas encore publié d&apos;article. Clique sur{" "}
              <span className="font-medium">“+ Nouvel article”</span> pour
              commencer à écrire.
            </div>
          ) : (
            <ul className="space-y-3 text-sm">
              {typedUser.posts.map((post: UserWithPosts["posts"][number]) => (
                <li
                  key={post.id}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-zinc-200 bg-white/90 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90"
                >
                  <div className="space-y-2">
                    <Link
                      href={`/posts/${post.slug}`}
                      className="font-medium hover:underline"
                    >
                      {post.title}
                    </Link>
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                      {post.content}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      <Link
                        href={`/posts/${post.slug}/edit`}
                        className="inline-flex items-center rounded-full border border-zinc-300 px-2.5 py-1 font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
                      >
                        Modifier
                      </Link>
                      <Link
                        href={`/posts/${post.slug}`}
                        className="inline-flex items-center rounded-full border border-zinc-200 px-2.5 py-1 font-medium text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                      >
                        Voir
                      </Link>
                    </div>
                  </div>
                  <div className="flex flex-row items-center gap-3 text-xs text-zinc-500">
                    <span>❤️ {post.likes.length}</span>
                    <span>💬 {post.comments.length}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

