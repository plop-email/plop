import baseConfig from "@plop/ui/tailwind.config";
import type { Config } from "tailwindcss";

export default {
  presets: [baseConfig],
  content: [
    "./src/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
} satisfies Config;
