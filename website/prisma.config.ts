// Configuration Prisma pour la base principale (vigitemp)
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/db-main/schema.prisma",
  migrations: {
    path: "prisma/db-main/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
