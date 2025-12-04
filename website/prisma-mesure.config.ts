// Configuration Prisma pour la base de mesures (vigitemp_mesure)
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/db-mesure/schema.prisma",
  migrations: {
    path: "prisma/db-mesure/migrations",
  },
  datasource: {
    url: env("DATABASE_MESURE_URL"),
  },
});
