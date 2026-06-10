import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const require = createRequire(import.meta.url);
const xdgConfigHome = process.env.XDG_CONFIG_HOME ?? join(root, ".tmp", "xdg-config");
const xdgCacheHome = process.env.XDG_CACHE_HOME ?? join(root, ".tmp", "xdg-cache");

mkdirSync(xdgConfigHome, { recursive: true });
mkdirSync(xdgCacheHome, { recursive: true });

const strapiPackageRoot = dirname(require.resolve("@strapi/strapi/package.json"));
const strapiBin = join(strapiPackageRoot, "bin", "strapi.js");

const child = spawn(process.execPath, [strapiBin, "build", ...process.argv.slice(2)], {
  stdio: "inherit",
  env: {
    ...process.env,
    XDG_CONFIG_HOME: xdgConfigHome,
    XDG_CACHE_HOME: xdgCacheHome
  }
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
