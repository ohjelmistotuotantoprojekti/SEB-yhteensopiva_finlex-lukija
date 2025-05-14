import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";


export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,ts}"], languageOptions: { globals: globals.node } },
  tseslint.configs.recommended,
  { "rules": {
    // Ei välilyöntiä ja tabia sekaisin
    "no-mixed-spaces-and-tabs": "error",

    // Kahden välilyönnin sisennys
    "indent": ["error", 2],

    // Ei tyhjää rivin lopussa
    "no-trailing-spaces": "error",

    // Rivinvaihto lopussa
    "eol-last": ["error", "always"],

    // Ei tyhjää väliä ennen ja jälkeen sulkujen
    "space-in-parens": ["error", "never"],

    // Välilyönnit operaattoreiden ympärillä
    "space-infix-ops": "error"
  }}
]);
