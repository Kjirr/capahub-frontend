/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  
  plugins: [require("daisyui")],

  // DaisyUI configuratie
  daisyui: {
    themes: [
      {
        capaprint: { // De naam van ons custom thema
          // DE FIX: Een helderdere, minder paarse blauwkleur
          "primary": "#3b82f6", 
          
          // We definiëren ook de hover/focus kleur expliciet
          "primary-focus": "#1d4ed8", 

          "secondary": "#f6d860",
          "accent": "#37cdbe",
          "neutral": "#3d4451",
          "base-100": "#ffffff",
        },
      },
    ],
  },
}
