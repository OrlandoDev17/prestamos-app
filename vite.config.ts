import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import compression from "vite-plugin-compression";
import { VitePWA } from "vite-plugin-pwa";

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	plugins: [
		devtools(),
		nitro({ rollupConfig: { external: [/^@sentry\//] } }),
		tailwindcss(),
		tanstackStart({
			spa: {
				enabled: true,
				prerender: {
					outputPath: "index",
				},
			},
		}),
		viteReact(),
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: ["favicon.svg", "fonts/*.woff2"],
			manifest: false,
			workbox: {
				globPatterns: ["**/*.{js,css,html,svg,woff2,png,txt}"],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
						handler: "NetworkFirst",
						options: {
							cacheName: "supabase-cache",
							expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
							cacheableResponse: { statuses: [0, 200] },
						},
					},
				],
			},
		}),
		compression({ algorithm: "gzip" }),
		compression({ algorithm: "brotliCompress" }),
	],
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
						return "react-vendor";
					}
					if (id.includes("node_modules/@supabase")) {
						return "supabase";
					}
					if (id.includes("node_modules/jspdf")) {
						return "pdf";
					}
					if (id.includes("node_modules/motion")) {
						return "motion";
					}
				},
			},
		},
	},
});

export default config;
