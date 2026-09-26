import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Support both embedded json config and Vercel/Vite environment variables
const resolvedConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId,
  firestoreDatabaseId:
    import.meta.env.VITE_FIREBASE_DATABASE_ID ||
    firebaseConfigJson.firestoreDatabaseId ||
    '(default)',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId,
};

const app = getApps().length > 0 ? getApps()[0] : initializeApp(resolvedConfig);

// Initialize with forced long-polling so WebChannel proxy buffering issues in preview/iframe environments are completely avoided
try {
  initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
    },
    resolvedConfig.firestoreDatabaseId
  );
} catch {
  // Instance may already be initialized
}

export const db = getFirestore(app, resolvedConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Ensure account selector is always presented cleanly
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('the client is offline') ||
        error.message.includes('unavailable') ||
        (error as { code?: string }).code === 'unavailable')
    ) {
      console.warn('Firestore notice: Connection is initializing or operating in offline mode.');
    } else {
      console.error('Firestore connection check:', error);
    }
  }
}

// Test connection on boot per Firebase guidelines
testConnection();
