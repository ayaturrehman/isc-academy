import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    db: {
      provider: "postgresql",
      url: { fromEnvVar: "DATABASE_URL" },
      directUrl: { fromEnvVar: "DIRECT_URL" },
    },
  },
  generators: {
    client: {
      engineType: "dataproxy",
    },
  },
});
