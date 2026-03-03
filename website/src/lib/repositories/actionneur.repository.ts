import { prisma } from "@/lib/prisma"

export type ActionneurWithLieu = {
  Id_Actionneur: number
  Num_Serie: string | null
  Type: number | null
  Commentaire: string | null
  Est_Etat: boolean | null
  Est_Archive: boolean | null
  Id_Lieu: number | null
}

export const ActionneurRepository = {
  /**
   * Returns all non-archived actionneurs with their associated lieu ID.
   * Uses a batch lookup to avoid N+1 queries.
   */
  async findAllWithLieu(): Promise<ActionneurWithLieu[]> {
    const actionneurs = await prisma.t_actionneur.findMany({
      select: {
        Id_Actionneur: true,
        Num_Serie: true,
        Type: true,
        Commentaire: true,
        Est_Etat: true,
        Est_Archive: true,
      },
      where: { Est_Archive: false },
      orderBy: { Num_Serie: "asc" },
    })

    const lieux = await prisma.t_lieu.findMany({
      where: {
        Id_Actionneur: { in: actionneurs.map((a) => a.Id_Actionneur) },
      },
      select: { Id_Actionneur: true, Id_Lieu: true },
    })
    const lieuByActionneur = new Map(
      lieux.map((l) => [l.Id_Actionneur, l.Id_Lieu])
    )

    return actionneurs.map((a) => ({
      ...a,
      Id_Lieu: lieuByActionneur.get(a.Id_Actionneur) ?? null,
    }))
  },

  async create(data: {
    type?: number
    serie?: string | null
    commentaire?: string | null
    lieuId?: number | null
  }) {
    const actionneur = await prisma.t_actionneur.create({
      data: {
        Type: data.type,
        Num_Serie: data.serie ?? null,
        Commentaire: data.commentaire ?? null,
      },
    })

    if (data.lieuId) {
      await prisma.t_lieu.update({
        where: { Id_Lieu: data.lieuId },
        data: { Id_Actionneur: actionneur.Id_Actionneur },
      })
    }

    return actionneur
  },
}
