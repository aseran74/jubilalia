import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { environment } from "../config/environment";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: environment.firebase.apiKey,
  authDomain: environment.firebase.authDomain,
  projectId: environment.firebase.projectId,
  storageBucket: environment.firebase.storageBucket,
  messagingSenderId: environment.firebase.messagingSenderId,
  appId: environment.firebase.appId,
  measurementId: environment.firebase.measurementId
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Analytics (solo en producción)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Inicializar Auth
export const auth = getAuth(app);

// Configurar persistencia de la sesión
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('✅ Firebase Auth configurado para persistir sesión');
  })
  .catch((error) => {
    console.error('❌ Error configurando persistencia de Firebase Auth:', error);
  });

// Inicializar Firestore
export const db = getFirestore(app);

// Proveedores de autenticación
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Configurar idioma para Google Auth
googleProvider.setCustomParameters({
  prompt: 'select_account',
  hd: 'jubilalia.com'
});

export { app, analytics };
export default app;
