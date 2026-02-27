// Configuration Prisma pour la base de chat (vigi_chat)
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/vigi-chat/schema.prisma",
  migrations: {
    path: "prisma/vigi-chat/migrations",
  },
  datasource: {
    url: env("DATABASE_CHAT_URL"),
  },
});
