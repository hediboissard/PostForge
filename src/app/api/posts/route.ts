import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 60);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = (await req.json()) as {
    title?: string;
    content?: string;
    imageUrl?: string | null;
  };

  if (!body.title || !body.content) {
    return NextResponse.json(
      { error: "Titre et contenu requis" },
      { status: 400 },
    );
  }

  const baseSlug = slugify(body.title);
  let slug = baseSlug;
  let i = 1;

  while (true) {
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (!existing) break;
    slug = `${baseSlug}-${i++}`;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Utilisateur introuvable" },
      { status: 400 },
    );
  }

  const post = await prisma.post.create({
    data: {
      title: body.title,
      content: body.content,
      imageUrl: body.imageUrl ?? null,
      authorId: user.id,
      slug,
    },
  });

  return NextResponse.json({ slug: post.slug });
}

