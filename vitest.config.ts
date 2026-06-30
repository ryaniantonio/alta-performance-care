import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// Kept separate from vite.config.ts on purpose: that config uses
// @lovable.dev/vite-tanstack-config, which bundles the TanStack Start / Nitro
// plugins. Loading those under Vitest is unnecessary and slow, so here we wire
// only the React transform and the @/* alias (via vite-tsconfig-paths).
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: false,
  },
});
