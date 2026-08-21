import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextCoreWebVitals,
  {
    ignores: ["src/generated/**"],
  },
  {
    rules: {
      "react/no-unescaped-entities": "off",
      // React Compiler n'est pas activé dans next.config.js. Garder ses
      // diagnostics visibles sans bloquer le lint tant que l'application
      // ne l'utilise pas réellement.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/incompatible-library": "warn",
    },
  },
];

export default config;
