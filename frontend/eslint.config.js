import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
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
    },
  },
)
