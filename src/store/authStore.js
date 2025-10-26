import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

// Dit is onze 'kluis'. create() maakt een nieuwe store.
const useAuthStore = create((set) => ({
  // De data in de kluis: currentUser, begint als null.
  currentUser: null,
  
  // Een 'actie' om de gebruiker in te stellen.
  // We slaan de token op en decoderen hem om de user-data in de state te zetten.
  setCurrentUser: (token) => {
    if (token) {
      localStorage.setItem('token', token);
      const decodedUser = jwtDecode(token);
      set({ currentUser: decodedUser });
    }
  },

  // Een 'actie' om de gebruiker uit te loggen.
  clearCurrentUser: () => {
    localStorage.removeItem('token');
    set({ currentUser: null });
  },

  // Een actie om de gebruiker te initialiseren bij het laden van de app.
  initializeUser: () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          set({ currentUser: decoded });
        } else {
          localStorage.removeItem('token');
          set({ currentUser: null });
        }
      } catch (e) {
        localStorage.removeItem('token');
        set({ currentUser: null });
      }
    }
  }
}));

export default useAuthStore;