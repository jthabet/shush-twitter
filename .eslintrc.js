// eslint-disable-next-line no-undef
module.exports = {
  env: {
    browser: true,
    es2021: true,
    webextensions: true,
    node: true,
  },
  extends: [
    "plugin:prettier/recommended",
    "react-app",
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@tanstack/eslint-plugin-query/recommended",
  ],
  overrides: [],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["prettier", "@typescript-eslint", "react", "@tanstack/query"],
  rules: {
    "prettier/prettier": "error",
    "no-unused-vars": "off",
  },
};
