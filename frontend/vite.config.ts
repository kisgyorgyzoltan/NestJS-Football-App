import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      // ...
      "simple-peer": "simple-peer/simplepeer.min.js",
    },
  },
});
