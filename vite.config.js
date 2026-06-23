import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { worldlineEditorApiPlugin } from "./scripts/worldline-editor-api.mjs";

export default defineConfig(({ command, mode }) => ({
  plugins: [
    vue(),
    ...(command === "serve" ? [worldlineEditorApiPlugin()] : [])
  ],
  base:
    mode === "dev"
      ? "/timeline/dev/"
      : "/timeline/"
}));
