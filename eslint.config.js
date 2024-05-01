const stylistic = require("@stylistic/eslint-plugin");
const typescript = require("@typescript-eslint/eslint-plugin");
const next = require("@next/eslint-plugin-next");
const parser = require("@typescript-eslint/parser");

module.exports = [
  {
    ignores: ["dist/**", "lib/**", "node_modules/**", "target/**", ".vercel/**", ".next/**", "target/**", ".yarn/**", ".anchor/**"],
  },
  {
    plugins: {
      "@stylistic": stylistic,
    },
    languageOptions: {
      parser,
    },
    files: ["**/*.json"],
    rules: {
      "@stylistic/indent": ["error", 2],
      "@stylistic/linebreak-style": ["error", "unix"],
      "@stylistic/quotes": ["error", "double"],
    },
  },
  {
    plugins: {
      "@stylistic": stylistic,
    },
    languageOptions: {
      parser,
    },
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    rules: {
      ...stylistic.configs["all-flat"].rules,
      "@stylistic/array-bracket-newline": ["error", "consistent"],
      "@stylistic/comma-dangle": ["error", "always-multiline"],
      "@stylistic/arrow-parens": ["error", "as-needed"],
      "@stylistic/dot-location": ["error", "property"],
      "@stylistic/brace-style": ["error", "1tbs", { allowSingleLine: true }],
      "@stylistic/function-paren-newline": ["error", "consistent"],
      "@stylistic/multiline-ternary": ["error", "always-multiline"],
      "@stylistic/no-confusing-arrow": ["error", { onlyOneSimpleParam: true }],
      "@stylistic/no-extra-parens": ["error", "all", { ignoreJSX: "multi-line" }],
      "@stylistic/indent": ["error", 2],
      "@stylistic/linebreak-style": ["error", "unix"],
      "@stylistic/quotes": ["error", "double"],
      "@stylistic/semi": ["error", "always"],
      "@stylistic/quote-props": ["error", "consistent-as-needed"],
      "@stylistic/function-call-argument-newline": ["error", "consistent"],
      "@stylistic/space-before-function-paren": ["error", { anonymous: "always", named: "never", asyncArrow: "always" }],
      "@stylistic/object-curly-spacing": ["error", "always"],
      "@stylistic/object-curly-newline": ["error", { consistent: true }],
      "@stylistic/object-property-newline": ["error", { allowAllPropertiesOnSameLine: true }],
      "@stylistic/member-delimiter-style": ["error", { multiline: { delimiter: "semi", requireLast: true }, singleline: { delimiter: "comma", requireLast: false } }],
      "@stylistic/jsx-wrap-multilines": ["error", { declaration: "parens-new-line" }],
      "@stylistic/no-confusing-arrow": ["error", { onlyOneSimpleParam: true }],
      "@stylistic/array-element-newline": "off",
      "@stylistic/padded-blocks": "off",
      "@stylistic/lines-between-class-members": "off",
    },
  },
  {
    plugins: {
      "@typescript-eslint": typescript,
    },
    languageOptions: {
      parser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      ...typescript.configs["all"].rules,
      "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false }],
      "@typescript-eslint/no-use-before-define": ["error", "nofunc"],
      "@typescript-eslint/no-confusing-void-expression": ["error", { ignoreArrowShorthand: true }],
      "@typescript-eslint/explicit-function-return-type": ["error", { allowExpressions: true }],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }],
      "@typescript-eslint/array-type": ["error", { default: "generic", readonly: "generic" }],
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/naming-convention": "off",
      "@typescript-eslint/space-before-function-paren": "off",
      "@typescript-eslint/member-ordering": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-magic-numbers": "off",
      "@typescript-eslint/prefer-readonly-parameter-types": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/brace-style": "off",
      "@typescript-eslint/sort-type-constituents": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/lines-between-class-members": "off",
      "@typescript-eslint/max-params": "off",
      "@typescript-eslint/prefer-destructuring": "off",
      "@typescript-eslint/use-unknown-in-catch-callback-variable": "off",
      "@typescript-eslint/init-declarations": "off",
      "@typescript-eslint/parameter-properties": "off",
    },
  },
  // {
  //   plugins: {
  //     "@next/next": next,
  //   },
  //   languageOptions: {
  //     parser,
  //   },
  //   files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
  //   rules: {
  //     ...next.configs["recommended"].rules,
  //   },
  // },
];
