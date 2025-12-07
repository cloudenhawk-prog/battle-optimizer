import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      "no-trailing-spaces": "warn",     // catches extra spaces at end of line
      "semi": ["warn", "never"],        // disallow semicolons
      "quotes": ["warn", "double"],     // enforce double quotes (optional)
      "@typescript-eslint/no-explicit-any": "off", // allow use of 'any' type
      "react-hooks/exhaustive-deps": "off"
    },
  },
])
