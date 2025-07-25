import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";


export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.node } },
  { ignores: ["dist/**", "src/frontend/**", "playwright-report/**", "test-results/**", "e2etest/**"] },
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
