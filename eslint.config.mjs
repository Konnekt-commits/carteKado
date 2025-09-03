// @ts-check

import url from 'node:url';

import { FlatCompat } from '@eslint/eslintrc';
import eslint from '@eslint/js';
// import tseslintInternalPlugin from '@typescript-eslint/eslint-plugin-internal';
import deprecationPlugin from 'eslint-plugin-deprecation';
import eslintCommentsPlugin from 'eslint-plugin-eslint-comments';
import eslintPluginPlugin from 'eslint-plugin-eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import jestPlugin from 'eslint-plugin-jest';
import jsdocPlugin from 'eslint-plugin-jsdoc';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import unicornPlugin from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });
export default tseslint.config(
    {
        plugins: {},

    },
    {
        // config with just ignores is the replacement for `.eslintignore`
        ignores: [
            '**/jest.config.js',
            '**/node_modules/**',
            '**/dist/**',
            '**/fixtures/**',
            '**/coverage/**',
            '**/__snapshots__/**',
            '**/.docusaurus/**',
            '**/build/**',
            // Files copied as part of the build
            'packages/types/src/generated/**/*.ts',
            // Playground types downloaded from the web
            'packages/website/src/vendor',
            // see the file header in eslint-base.test.js for more info
            'packages/rule-tester/tests/eslint-base',
        ]
    },
    // extends ...
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    jsdocPlugin.configs['flat/recommended-typescript-error'],

    // base config
    {
        languageOptions: {
            globals: {
                ...globals.es2020,
                ...globals.node,
            },
            parserOptions:{
                allowAutomaticSingleRunInference: true,
                cacheLifetime: {
                    // we pretty well never create/change tsconfig structure - so no need to ever evict the cache
                    // in the rare case that we do - just need to manually restart their IDE.
                    glob: 'Infinity',
                },
                project: [
                    'tsconfig.json'
                ]
            }
        },
        rules: {
            "@typescript-eslint/restrict-template-expressions": ["off"],
            "@typescript-eslint/no-explicit-any": "off",
            "semi": ["error", "never"],
            "@typescript-eslint/semi": "off",
            "no-unexpected-multiline": "error",
            "eol-last": 1,
            "no-multiple-empty-lines": ["error", { "max": 1, "maxEOF": 0 }],
            "space-before-blocks": "off",
            "@typescript-eslint/space-before-blocks": "error",
            "block-spacing": "off",
            "@typescript-eslint/block-spacing": "error"
        }
    }
)
