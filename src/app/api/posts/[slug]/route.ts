import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  const { slug } = await params;
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

  const post = await prisma.post.findUnique({
    where: { slug },
    include: { author: true },
  });

  if (!post) {
    return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  }

  if (post.author?.email !== session.user.email) {
    return NextResponse.json(
      { error: "Vous ne pouvez modifier que vos propres articles" },
      { status: 403 },
    );
  }

  const updated = await prisma.post.update({
    where: { id: post.id },
    data: {
      title: body.title,
      content: body.content,
      imageUrl: body.imageUrl ?? null,
    },
  });

  return NextResponse.json({ slug: updated.slug });
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const post = await prisma.post.findUnique({
    where: { slug },
    include: { author: true },
  });

  if (!post) {
    return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  }

  if (post.author?.email !== session.user.email) {
    return NextResponse.json(
      { error: "Vous ne pouvez supprimer que vos propres articles" },
      { status: 403 },
    );
  }

  await prisma.post.delete({ where: { id: post.id } });

  return NextResponse.json(null, { status: 204 });
}

