import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
    video: true,
    retries: { runMode: 1, openMode: 0 },
  },

  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
});
