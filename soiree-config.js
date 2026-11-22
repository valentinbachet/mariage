/* =====================================================================
   JEUX DU SOIR · configuration Firebase
   Collez ici l'objet « firebaseConfig » donné par la console Firebase
   (Paramètres du projet > Général > Vos applications > Web).
   Laissez firebase: null pour le mode démo local (deux onglets du même navigateur).
   ===================================================================== */
window.SOIREE_CONFIG = {
  firebase: {
    apiKey: "AIzaSyAUyE0vKLaZwCAKbDdk0_J3TDfzz0gxEwI",
    authDomain: "mariage-agathe-valentin.firebaseapp.com",
    databaseURL: "https://mariage-agathe-valentin-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "mariage-agathe-valentin",
    appId: "1:613266253138:web:04dd4ca829c826c2aa868b"
  },
  /* exemple :
  firebase: {
    apiKey: "AIza...",
    authDomain: "mariage-av.firebaseapp.com",
    databaseURL: "https://mariage-av-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "mariage-av",
    appId: "1:123:web:abc"
  },
  */

  /* Grand écran : les points de la partie sont multipliés par ce nombre, puis ajoutés à l'équipe en retard à la Carrera */
  BIG_MULT: 5,

  /* Adresse publique du site, pour le QR code de l'écran (laisser vide = déduite automatiquement) */
  SITE_URL: ""
};
