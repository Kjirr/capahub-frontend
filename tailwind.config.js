/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
  	  extend: {
          // Deze extend sectie is nu minder belangrijk, omdat DaisyUI de kleuren regelt.
          // We laten hem staan voor eventuele specifieke custom classes.
  	  }
    },
    plugins: [
      require("daisyui"),
      require("tailwindcss-animate")
    ],
    daisyui: {
        themes: [
            {
                prntgo: { // De naam van ons custom thema
                    "primary": "#1567eb",
                    "secondary": "#f6d860",
                    "accent": "#37cdbe",
                    "neutral": "#3d4451",
                    "base-100": "#ffffff", // Witte achtergrond voor kaarten etc.
                    "base-200": "#f9fafb", // Iets donkerder grijs
                    "base-300": "#f3f4f6", // Achtergrondkleur van de pagina
                    "info": "#3abff8",
                    "success": "#36d399",
                    "warning": "#fbbd23",
                    "error": "#f87272",
                },
            },
        ],
        logs: false,
    },
}