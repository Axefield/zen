import { defineConfig } from "astro/config"
import partytown from "@astrojs/partytown"
import preact from "@astrojs/preact"

export default defineConfig({
  output: "server",
  server: {
    host: "0.0.0.0",
    port: 4321,
  },
  trailingSlash: "never",
  integrations: [
    preact(),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
  ],
  vite: {
    server: {
      watch: {
        usePolling: true,
        interval: 500,
      },
    },
  },
})
