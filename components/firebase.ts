import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ER MAKİNA FIREBASE AYARLARI
const firebaseConfig = {
  apiKey: "AIzaSyBuHsbjV3q0uzn4_v6LorpYljy3ghtAkbI",
  authDomain: "ermakina-fikstur.firebaseapp.com",
  projectId: "ermakina-fikstur",
  storageBucket: "ermakina-fikstur.firebasestorage.app",
  messagingSenderId: "233609660130",
  appId: "1:233609660130:web:5ac68bda675f1b81cf00bb"
};

// Uygulamayı Başlat
const app = initializeApp(firebaseConfig);

// Servisleri Dışa Aktar
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
