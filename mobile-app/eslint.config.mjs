// eslint.config.js - ИСПРАВЛЕННАЯ версия для ESLint 9.x
import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactNative from 'eslint-plugin-react-native';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-plugin-prettier';

export default [
    js.configs.recommended,
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true
                }
            },
            globals: {
                console: 'readonly',
                global: 'writable',
                __DEV__: 'readonly',
                fetch: 'readonly',
                performance: 'readonly',
                require: 'readonly',
                module: 'readonly',
                process: 'readonly',
                React: 'readonly'
            }
        },
        plugins: {
            '@typescript-eslint': typescript,
            'react': react,
            'react-native': reactNative,
            'import': importPlugin,
            'prettier': prettier
        },
        settings: {
            react: {
                version: 'detect'
            }
        },
        rules: {
            // МЕТРИКИ СЛОЖНОСТИ для диплома
            'complexity': ['error', 15],
            'max-depth': ['error', 4],
            'max-lines-per-function': ['error', 150],
            'max-params': ['error', 4],

            // TypeScript
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_'
            }],
            '@typescript-eslint/no-explicit-any': 'warn',

            // React (БЕЗ react-hooks правил - они вызывают ошибку)
            'react/prop-types': 'off',
            'react/react-in-jsx-scope': 'off',
            'react/display-name': 'error',
            'react/jsx-key': 'error',
            'react/jsx-no-duplicate-props': 'error',
            'react/jsx-no-undef': 'error',
            'react/no-children-prop': 'error',
            'react/no-deprecated': 'error',
            'react/no-direct-mutation-state': 'error',
            'react/no-unescaped-entities': 'error',
            'react/require-render-return': 'error',
            'react/self-closing-comp': 'error',

            // React Native
            'react-native/no-unused-styles': 'off',
            'react-native/no-inline-styles': 'off',
            'react-native/split-platform-components': 'error',

            // Import/Export
            'import/no-unresolved': 'off', // Отключаем чтобы избежать проблем с путями
            'import/order': ['error', {
                groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
                'newlines-between': 'always'
            }],

            // Общие правила качества
            'no-console': 'off',
            'prefer-const': 'error',
            'no-var': 'error',
            'no-duplicate-imports': 'error',
            'no-unused-expressions': 'error',
            'object-shorthand': 'error',
            'prefer-template': 'error',

            // Стиль кода
            'eqeqeq': ['error', 'always'],
            'curly': ['error', 'all'],
            'quotes': ['error', 'single', { avoidEscape: true }],
            'semi': ['error', 'always'],

            // Prettier (должен быть последним)
            'prettier/prettier': ['error', {
                singleQuote: true,
                trailingComma: 'es5',
                tabWidth: 2,
                semi: true,
                printWidth: 100,
                bracketSpacing: true,
                bracketSameLine: false,
                arrowParens: 'avoid',
                endOfLine: 'auto'
            }]
        }
    },
    // Конфигурация для тестов
    {
        files: ['**/*.test.{js,jsx,ts,tsx}', '**/__tests__/**/*.{js,jsx,ts,tsx}'],
        rules: {
            'max-lines-per-function': ['error', { max: 150, skipBlankLines: true, skipComments: true }],
            'no-console': 'off',
            '@typescript-eslint/no-explicit-any': 'off'
        }
    },
    // Игнорировать файлы
    {
        ignores: [
            'node_modules/**',
            'dist/**',
            '.expo/**',
            'ios/**',
            'android/**',
            'build/**',
            'reports/**',
            '*.config.js',
            '*.config.mjs',
            'babel.config.js',
            'metro.config.js'
        ]
    }
];
