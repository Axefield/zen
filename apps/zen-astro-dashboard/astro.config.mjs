import { defineConfig } from "astro/config"
import partytown from "@astrojs/partytown"

export default defineConfig({
  output: "server",
  server: {
    host: "0.0.0.0",
    port: 4321,
  },
  trailingSlash: "never",
  integrations: [
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
