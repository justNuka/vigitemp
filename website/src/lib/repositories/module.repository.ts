import { prisma } from "@/lib/prisma"

export type ModuleWithDetails = {
  Id_Module: number
  Module_Numero_Serie: string | null
  Type_Module: number | null
  Libelle_Type_Module: string | null
  Port_Serie: string | null
  Emplacement: string | null
  Id_Serveur: number | null
  sondes_count: number
  Est_Module_GSO: boolean
  Archive: number | null
}

export const ModuleRepository = {
  /**
   * Returns all modules with sonde count and type label.
   * Uses batch queries to avoid N+1 (1 groupBy + 1 findMany instead of 2N queries).
   */
  async findAllWithDetails(): Promise<ModuleWithDetails[]> {
    const modulesRaw = await prisma.t_module.findMany({
      select: {
        Id_Module: true,
        Module_Numero_Serie: true,
        Type_Module: true,
        Port_Serie: true,
        Emplacement: true,
        Id_Serveur: true,
        Archive: true,
        Est_Module_GSO: true,
      } as any,
      orderBy: { Module_Numero_Serie: "asc" },
    })

    const moduleIds = modulesRaw.map((m: any) => m.Id_Module)
    const typeIds = modulesRaw
      .map((m: any) => m.Type_Module)
      .filter((t: unknown): t is number => t !== null && t !== undefined)

    const [sondeCounts, moduleTypes] = await Promise.all([
      prisma.t_sonde.groupBy({
        by: ["Id_Module"],
        where: { Id_Module: { in: moduleIds } },
        _count: { _all: true },
      }),
      prisma.t_module_type.findMany({
        where: { Id_Module_Type: { in: typeIds } },
        select: { Id_Module_Type: true, Libelle_Type_Module: true },
      }),
    ])

    const countByModule = new Map(
      sondeCounts.map((g) => [g.Id_Module, g._count._all])
    )
    const typeById = new Map(
      moduleTypes.map((t) => [t.Id_Module_Type, t.Libelle_Type_Module])
    )

    return modulesRaw.map((module: any) => ({
      Id_Module: module.Id_Module,
      Module_Numero_Serie: module.Module_Numero_Serie,
      Type_Module: module.Type_Module,
      Libelle_Type_Module: module.Type_Module
        ? (typeById.get(module.Type_Module) ?? null)
        : null,
      Port_Serie: module.Port_Serie,
      Emplacement: module.Emplacement,
      Id_Serveur: module.Id_Serveur,
      sondes_count: countByModule.get(module.Id_Module) ?? 0,
      Est_Module_GSO: module.Est_Module_GSO ?? false,
      Archive: module.Archive ?? 0,
    }))
  },

  async isDuplicateSerialNumber(serialNumber: string): Promise<boolean> {
    const existing = await prisma.t_module.findFirst({
      where: { Module_Numero_Serie: serialNumber },
    })
    return !!existing
  },

  async create(data: {
    Module_Numero_Serie: string
    Type_Module: number
    Port_Serie: string
    Emplacement: string
    Adresse_IP?: string | null
    Id_Serveur?: number | null
    Delai_Reseau?: number | null
    Est_Module_GSO?: boolean
  }) {
    return prisma.t_module.create({
      data: {
        Module_Numero_Serie: data.Module_Numero_Serie,
        Type_Module: data.Type_Module,
        Port_Serie: data.Port_Serie,
        Emplacement: data.Emplacement,
        Adresse_IP: data.Adresse_IP,
        Id_Serveur: data.Id_Serveur,
        Delai_Reseau: data.Delai_Reseau,
        Est_Module_GSO: data.Est_Module_GSO ?? false,
        Archive: 0,
      } as any,
    })
  },
}
