import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: process.env.OPENAPI_URL ?? "http://localhost:3000/swagger-json",
    output: {
      target: "./src/api/generated.ts",
      client: "axios-functions",
      override: {
        mutator: {
          path: "./src/api/client.ts",
          name: "apiRequest",
        },
      },
    },
  },
});
