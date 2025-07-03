import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import {defineConfig} from "eslint/config";
import pluginPrettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";

export default defineConfig([
    {files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], plugins: {js}, extends: ["js/recommended"]},
    {files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], languageOptions: {globals: globals.browser}},
    tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    {
        plugins: {
            prettier: pluginPrettier
        },
        rules: {
            "react/react-in-jsx-scope": "off",
            "@typescript-eslint/no-require-imports": "off",
            "prettier/prettier": "error"
        },
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.es2025,
                ...globals.jest
            }
        },
        settings: {
            react: {
                version: "detect"
            }
        },
    },
    eslintConfigPrettier
]);
