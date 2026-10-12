import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["node_modules/", ".vercel/"] },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.node },
    },
    rules: {
      "no-unused-vars": [
        "error",
        {
          // Express error handlers must declare all 4 arguments even when
          // `next` is unused, and a leading underscore marks an
          // intentionally unused value.
          argsIgnorePattern: "^(_|next$)",
          varsIgnorePattern: "^_",
          caughtErrors: "none",
        },
      ],
    },
  },
];