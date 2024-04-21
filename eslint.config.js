const stylistic = require("@stylistic/eslint-plugin");
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
      "@stylistic/array-element-newline": ["off"],
      "@stylistic/array-bracket-newline": ["error", "consistent"],
      "@stylistic/comma-dangle": ["error", "always-multiline"],
      "@stylistic/arrow-parens": ["error", "as-needed"],
      "@stylistic/dot-location": ["error", "property"],
      "@stylistic/brace-style": ["error", "1tbs", { allowSingleLine: true }],
      "@stylistic/function-paren-newline": ["error", "consistent"],
      "@stylistic/multiline-ternary": ["error", "always-multiline"],
      "@stylistic/no-confusing-arrow": ["error", { onlyOneSimpleParam: true }],
      "@stylistic/indent": ["error", 2],
      "@stylistic/linebreak-style": ["error", "unix"],
      "@stylistic/quotes": ["error", "double"],
      "@stylistic/semi": ["error", "always"],
      "@stylistic/quote-props": ["error", "consistent-as-needed"],
      "@stylistic/function-call-argument-newline": ["error", "consistent"],
      "@stylistic/space-before-function-paren": ["error", { anonymous: "always", named: "never", asyncArrow: "always" }],
      "@stylistic/padded-blocks": ["off"],
      "@stylistic/object-curly-spacing": ["error", "always"],
      "@stylistic/object-curly-newline": ["error", { consistent: true }],
      "@stylistic/object-property-newline": ["error", { allowAllPropertiesOnSameLine: true }],
      "@stylistic/member-delimiter-style": ["error", { multiline: { delimiter: "semi", requireLast: true }, singleline: { delimiter: "comma", requireLast: false } }],
    },
  },
];
