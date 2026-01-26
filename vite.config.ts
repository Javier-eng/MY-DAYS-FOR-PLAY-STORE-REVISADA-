import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import { netlifyPlugin } from "@netlify/remix-adapter/plugin";
 
export default defineConfig({
  plugins: [
    remix({
      // ESTA ES LA LÍNEA CLAVE:
      buildDirectory: "public",
      future: {
        v3_fetcherPersist: true,
        v3_relativeRoutingByFile: true,
        v3_throwAbortReason: true,
      },
    }),
    netlifyPlugin(),
  ],
});
