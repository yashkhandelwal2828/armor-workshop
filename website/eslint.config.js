import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "test-results/**",
      "playwright-report/**",
      "public/**",
    ],
  },
  js.configs.recommended,
  { files: ["src/**/*.js"], languageOptions: { globals: globals.browser } },
  {
    files: ["tests/**/*.{js,mjs}", "scripts/**/*.mjs", "*.js"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  {
    rules: {
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];
