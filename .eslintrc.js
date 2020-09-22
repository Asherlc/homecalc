module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "plugin:react/recommended",
    "standard",
    "plugin:prettier/recommended",
    "prettier/react",
    "prettier/standard",
  ],
  parser: "babel-eslint",
  plugins: ["json", "react", "@typescript-eslint", "prettier", "react-hooks"],
  rules: {
    "prettier/prettier": "error",
    "react/react-in-jsx-scope": "off",
    "react-hooks/rules-of-hooks": "error", // Checks rules of Hooks
    "react-hooks/exhaustive-deps": "error", // Checks effect dependencies
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
