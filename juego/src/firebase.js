import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDmWy87_hQKzdpsaupE_QVPoWMfm9YsY_M",
    authDomain: "aaaaa-d6657.firebaseapp.com",
    projectId: "aaaaa-d6657",
    storageBucket: "aaaaa-d6657.firebasestorage.app",
    messagingSenderId: "599417595528",
    appId: "1:599417595528:web:39d5e05640742f441da13d",
    measurementId: "G-DKF7LNZ9ST",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export { app }; // 👈 necesario para getFunctions
