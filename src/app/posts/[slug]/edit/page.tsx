import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EditPostForm from "./post-edit-form";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/login");
  }

  const post = await prisma.post.findUnique({
    where: { slug },
    include: { author: true },
  });

  if (!post) {
    redirect("/");
  }

  if (post.author?.email !== session.user.email) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-10">
      <div className="flex items-center gap-3">
        <Link
          href={`/posts/${slug}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Modifier l&apos;article
          </h1>
          <p className="text-xs text-zinc-500">
            Tu es en train d&apos;éditer :{" "}
            <span className="font-medium">{post.title}</span>
          </p>
        </div>
      </div>

      <EditPostForm
        slug={post.slug}
        initialTitle={post.title}
        initialContent={post.content}
        initialImageUrl={post.imageUrl ?? ""}
      />
    </main>
  );
}

