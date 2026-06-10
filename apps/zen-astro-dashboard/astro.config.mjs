import { defineConfig } from "astro/config"
import partytown from "@astrojs/partytown"
import preact from "@astrojs/preact"
import node from "@astrojs/node"
import { fileURLToPath } from "node:url"

const preactOpts = fileURLToPath(new URL("./src/lib/preact-opts.js", import.meta.url))

export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
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
    optimizeDeps: {
      exclude: ["@astrojs/preact/server.js"],
    },
    ssr: {
      noExternal: ["@astrojs/preact"],
    },
    resolve: {
      alias: {
        "astro:preact:opts": preactOpts,
      },
    },
    server: {
      watch: {
        usePolling: true,
        interval: 500,
      },
    },
  },
})
