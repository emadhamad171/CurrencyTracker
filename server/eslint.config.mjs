import js from "@eslint/js";

export default [
  // Базовая конфигурация
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        global: "writable",
        module: "readonly",
        require: "readonly",
        exports: "writable",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearTimeout: "readonly",
        clearInterval: "readonly",
      },
    },
    rules: {
      // ========== МЕТРИКИ СЛОЖНОСТИ для диплома ==========
      complexity: ["error", { max: 15 }],
      "max-depth": ["error", 4],
      "max-lines-per-function": [
        "error",
        { max: 100, skipBlankLines: true, skipComments: true },
      ],
      "max-params": ["error", 5],
      "max-statements": ["error", 30],
      "max-nested-callbacks": ["error", 4],

      // ========== NODE.JS ПРАВИЛА ==========
      "consistent-return": "error",
      "no-implicit-globals": "error",
      "no-throw-literal": "error",
      "prefer-promise-reject-errors": "error",
      "require-await": "error",
      "no-return-await": "error",

      // ========== ОБЩИЕ ПРАВИЛА КАЧЕСТВА ==========
      "no-console": "off", // В Node.js console допустим
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",
      "prefer-template": "error",
      "no-duplicate-imports": "error",
      "no-unused-expressions": [
        "error",
        {
          allowShortCircuit: true,
          allowTernary: true,
        },
      ],

      // ========== БЕЗОПАСНОСТЬ ==========
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",

      // ========== СТИЛЬ КОДА ==========
      "brace-style": ["error", "1tbs"],
      "comma-dangle": ["error", "always-multiline"],
      quotes: ["error", "single", { avoidEscape: true }],
      semi: ["error", "always"],
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
    },
  },
  // Конфигурация для тестов
  {
    files: [
      "**/*.test.{js,mjs}",
      "**/tests/**/*.{js,mjs}",
      "**/__tests__/**/*.{js,mjs}",
    ],
    rules: {
      "max-lines-per-function": ["error", { max: 200 }],
      "no-console": "off",
    },
  },
  // Игнорировать файлы
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "reports/**",
      "*.config.js",
      "*.config.mjs",
    ],
  },
];
