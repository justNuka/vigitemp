import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { withLogging } from "@/lib/api-logger";
import { z } from "zod";
import { log } from "@/lib/logger";

// Schéma de validation pour la modification de module
const updateModuleSchema = z.object({
  Module_Numero_Serie: z
    .string()
    .min(1, "Le numéro de série est requis")
    .max(50, "Le numéro de série ne peut pas dépasser 50 caractères"),
  Type_Module: z
    .number()
    .int("Le type doit être un nombre entier")
    .min(1, "Le type est requis"),
  Port_Serie: z
    .string()
    .max(10, "Le port ne peut pas dépasser 10 caractères")
    .optional()
    .nullable(),
  Emplacement: z
    .string()
    .max(50, "L'emplacement ne peut pas dépasser 50 caractères")
    .optional()
    .nullable(),
  Adresse_IP: z
    .string()
    .max(50, "L'adresse IP ne peut pas dépasser 50 caractères")
    .optional()
    .nullable(),
  Id_Serveur: z
    .number()
    .int()
    .optional()
    .nullable(),
  Delai_Reseau: z
    .number()
    .int()
    .optional()
    .nullable(),
});

export const PATCH = withLogging(async (req: NextRequest) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json(
      { error: "Non authentifié" },
      { status: 401 }
    );
  }

  // Extraire l'ID des paramètres
  const params = await (req as any).params;
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json(
      { error: "ID invalide" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();

    // Valider les données
    const validatedData = updateModuleSchema.parse(body);

    // Vérifier que le module existe
    const existingModule = await prisma.t_module.findUnique({
      where: { Id_Module: id },
    });

    if (!existingModule) {
      return NextResponse.json(
        { error: "Module non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier l'unicité de la combinaison (Type_Module, Module_Numero_Serie)
    // SAUF si on garde les mêmes valeurs que le module existant
    if (
      validatedData.Type_Module !== existingModule.Type_Module ||
      validatedData.Module_Numero_Serie !== existingModule.Module_Numero_Serie
    ) {
      const duplicate = await prisma.t_module.findFirst({
        where: {
          Type_Module: validatedData.Type_Module,
          Module_Numero_Serie: validatedData.Module_Numero_Serie,
          Id_Module: { not: id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: "Un module avec ce type et ce numéro de série existe déjà" },
          { status: 400 }
        );
      }
    }

    // Mettre à jour le module
    const updatedModule = await prisma.t_module.update({
      where: { Id_Module: id },
      data: {
        ...validatedData,
        // S'assurer que les champs null sont bien null
        Port_Serie: validatedData.Port_Serie || null,
        Emplacement: validatedData.Emplacement || null,
        Adresse_IP: validatedData.Adresse_IP || null,
        Id_Serveur: validatedData.Id_Serveur || null,
        Delai_Reseau: validatedData.Delai_Reseau || null,
      },
    });

    // Compter les sondes associées à ce module
    const sondesCount = await prisma.t_sonde.count({
      where: { Id_Module: id },
    });

    // Logger l'action
    log.data.update("Module", id.toString(), user.username, user.userId, 
      req.headers.get("x-forwarded-for") || "unknown",
      {
        Module_Numero_Serie: validatedData.Module_Numero_Serie,
        Type_Module: validatedData.Type_Module,
        Port_Serie: validatedData.Port_Serie,
        Emplacement: validatedData.Emplacement,
      }
    );

    // Récupérer le type pour l'affichage dans la réponse
    const moduleType = await prisma.t_module_type.findUnique({
      where: { Id_Module_Type: validatedData.Type_Module },
    });

    return NextResponse.json(
      {
        ...updatedModule,
        type_label: moduleType?.Libelle_Type_Module || "",
        sondes_count: sondesCount,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", issues: error.issues },
        { status: 400 }
      );
    }

    console.error("[PATCH /api/modules/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification du module" },
      { status: 500 }
    );
  }
});

export const DELETE = withLogging(async (req: NextRequest) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json(
      { error: "Non authentifié" },
      { status: 401 }
    );
  }

  // Extraire l'ID des paramètres
  const params = await (req as any).params;
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json(
      { error: "ID invalide" },
      { status: 400 }
    );
  }

  try {
    // Vérifier que le module existe
    const existingModule = await prisma.t_module.findUnique({
      where: { Id_Module: id },
    });

    if (!existingModule) {
      return NextResponse.json(
        { error: "Module non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier s'il y a des sondes associées
    const sondesCount = await prisma.t_sonde.count({
      where: { Id_Module: id },
    });

    if (sondesCount > 0) {
      return NextResponse.json(
        { error: "Impossible de supprimer un module avec du matériel associé" },
        { status: 400 }
      );
    }

    // Supprimer le module
    await prisma.t_module.delete({
      where: { Id_Module: id },
    });

    // Logger l'action
    log.data.delete("Module", id.toString(), user.username, user.userId,
      req.headers.get("x-forwarded-for") || "unknown",
      `Module supprimé: ${existingModule.Module_Numero_Serie}`
    );

    return NextResponse.json(
      { success: true, message: "Module supprimé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[DELETE /api/modules/[id]] Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du module" },
      { status: 500 }
    );
  }
});
