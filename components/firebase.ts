import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// 🔴 CANLI SİSTEM
const prodConfig = {
  apiKey: "AIzaSyBuHsbjV3q0uzn4_v6LorpYljy3ghtAkbI",
  authDomain: "ermakina-fikstur.firebaseapp.com",
  projectId: "ermakina-fikstur",
  storageBucket: "ermakina-fikstur.firebasestorage.app",
  messagingSenderId: "233609660130",
  appId: "1:233609660130:web:5ac68bda675f1b81cf00bb",
};

// 🧪 TEST SİSTEMİ
const testConfig = {
  apiKey: "AIzaSyBjAWtB0QUwfrNCdu1hCQ6V3Squg8gb1-Q",
  authDomain: "ermakina-test.firebaseapp.com",
  projectId: "ermakina-test",
  storageBucket: "ermakina-test.firebasestorage.app",
  messagingSenderId: "512043214085",
  appId: "1:512043214085:web:dad5a253fbb3a6787d436c",
};

const appEnv = import.meta.env.VITE_APP_ENV || "prod";

const firebaseConfig = appEnv === "test" ? testConfig : prodConfig;

console.log("Bağlı Firebase ortamı:", appEnv);
console.log("Bağlı Firebase projectId:", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
