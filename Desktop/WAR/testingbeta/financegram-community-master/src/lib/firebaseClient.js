import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
let app = null;
let auth = null;
let db = null;
function ensureApp() {
    if (!app) {
        app = initializeApp(firebaseConfig);
    }
    if (!auth) {
        auth = getAuth(app);
        auth.useDeviceLanguage();
    }
    if (!db) {
        db = getFirestore(app);
    }
    return { app, auth, db };
}
export function getFirebaseApp() {
    return ensureApp().app;
}
export function getFirebaseAuth() {
    return ensureApp().auth;
}
export function getFirestoreDb() {
    return ensureApp().db;
}
export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
