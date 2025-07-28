/** @type {import('tailwindcss').Config} */
export default {
  // Vertelt Tailwind welke bestanden gescand moeten worden op class names.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  // Hier breiden we het standaard thema van Tailwind uit met onze eigen toevoegingen.
  theme: {
    extend: {
      // We voegen onze eigen, unieke merkkleuren toe.
      colors: {
        'prntgo-primary': '#1567ebff',        // Jouw primaire blauwe kleur
        'prntgo-primary-darker': '#2563EB', // Een donkerdere variant voor hover-effecten
      },
      // Je kunt hier in de toekomst ook eigen lettertypes, schaduws, etc. toevoegen.
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Zorgt ervoor dat Inter het standaard lettertype is.
      },
    },
  },

  // Hier laden we de plugins die we willen gebruiken.
  plugins: [
    require("daisyui")
  ],

  // Optionele configuratie voor DaisyUI. We hebben de thema's hier niet meer nodig,
  // maar je kunt het laten staan voor eventuele toekomstige aanpassingen.
  daisyui: {
    themes: false, // We gebruiken ons eigen systeem, geen DaisyUI thema's.
    logs: false, // Verbergt de DaisyUI logs in de console.
  },
}
