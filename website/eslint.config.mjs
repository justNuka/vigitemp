import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextCoreWebVitals,
  {
    ignores: ["src/generated/**"],
  },
  {
    rules: {
      "react/no-unescaped-entities": "off",
      // React Compiler n'est pas activé dans next.config.js. On conserve ces
      // diagnostics visibles sans bloquer le lint tant que le compilateur
      // n'est pas utilisé par l'application.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/incompatible-library": "warn",
    },
  },
];

export default config;
