import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { withLogging } from "@/lib/api-logger";
import { prismaMesure } from "@/lib/prisma";

/**
 * GET /api/journal/comments
 * Récupère les commentaires depuis tm_journal_code
 */
export const GET = withLogging(async (req: NextRequest) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    // Récupérer les codes de journal avec leurs commentaires depuis tm_journal_code
    const codes = await prismaMesure.tm_journal_code.findMany({
      orderBy: { Code_Journal: "asc" },
    });

    // Transformer en format attendu par le composant
    const formattedComments = codes.map((code, index) => ({
      id: index + 1,
      type: code.Code_Journal || "",
      text: code.Commentaire || "",
    }));

    return NextResponse.json(formattedComments);
  } catch (error) {
    console.error("Error fetching journal comments:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des commentaires" },
      { status: 500 }
    );
  }
});

/**
 * POST /api/journal/comments
 * Crée ou met à jour un commentaire dans tm_journal_code
 */
export const POST = withLogging(async (req: NextRequest) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const { type, text } = await req.json();

    if (!type || !text) {
      return NextResponse.json(
        { error: "Type et commentaire requis" },
        { status: 400 }
      );
    }

    // Créer ou mettre à jour dans tm_journal_code
    const comment = await prismaMesure.tm_journal_code.upsert({
      where: { Code_Journal: type },
      update: { Commentaire: text },
      create: {
        Code_Journal: type,
        Commentaire: text,
      },
    });

    return NextResponse.json({
      type: comment.Code_Journal,
      text: comment.Commentaire,
    });
  } catch (error) {
    console.error("Error creating/updating journal comment:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création/mise à jour du commentaire" },
      { status: 500 }
    );
  }
});

/**
 * PATCH /api/journal/comments
 * Met à jour un commentaire dans tm_journal_code
 */
export const PATCH = withLogging(async (req: NextRequest) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const { type, text } = await req.json();

    if (!type || !text) {
      return NextResponse.json(
        { error: "Type et commentaire requis" },
        { status: 400 }
      );
    }

    // Mettre à jour dans tm_journal_code
    const comment = await prismaMesure.tm_journal_code.update({
      where: { Code_Journal: type },
      data: { Commentaire: text },
    });

    return NextResponse.json({
      type: comment.Code_Journal,
      text: comment.Commentaire,
    });
  } catch (error) {
    console.error("Error updating journal comment:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du commentaire" },
      { status: 500 }
    );
  }
});

