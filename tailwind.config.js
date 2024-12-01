/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
    theme: {
            screens: {
              "sm": "480px",
              "md": "860px",
            },
        extend: {},
    },
    plugins: [],
};
