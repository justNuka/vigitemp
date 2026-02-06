// Configuration Prisma pour la base de mesures (vigi_mesures)
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/db-mesures/schema.prisma",
  migrations: {
    path: "prisma/db-mesures/migrations",
  },
  datasource: {
    url: env("DATABASE_MESURES_URL"),
  },
});
