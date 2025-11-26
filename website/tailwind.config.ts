import type { Config } from "tailwindcss";
import {heroui} from "@heroui/react";


const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        sans: ['var(--font-poppins)'],
        mono: ['var(--font-kodemono)']
      },
      screens: {
        'desktop': '1125px'
      },
      colors:{
        'white': '#FFFFFF',
        'primary': '#49aee0'
      }

    },
  },
  darkMode: "class",
  plugins: [heroui()],
};
export default config;
