import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  initializeFirestore, 
  doc, 
  getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(
  app, 
  {
    experimentalAutoDetectLongPolling: true,
  }, 
  firebaseConfig.firestoreDatabaseId
);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('the client is offline') || error.message.includes('Could not reach Cloud Firestore backend')) {
        console.warn("Firestore connection check: client is offline or connecting in background.");
      }
    }
  }
}

// Automatically test connection on boot
testConnection();

// Lock to prevent multiple concurrent popup requests
let isSigningIn = false;

export async function signInWithGoogle(): Promise<{ user: FirebaseUser | null; error?: string; code?: string }> {
  if (isSigningIn) {
    return { user: null, error: 'Sign-in already in progress. Please check your open windows.', code: 'auth/cancelled-popup-request' };
  }

  isSigningIn = true;
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user };
  } catch (error: any) {
    const code = error?.code || 'auth/unknown';
    if (code === 'auth/popup-blocked') {
      console.warn('Google Sign-in popup was blocked by browser iframe security.');
      return { user: null, error: 'The sign-in popup was blocked by your browser. Please allow popups or use instant sign-in.', code };
    }
    if (code === 'auth/cancelled-popup-request' || code === 'auth/popup-closed-by-user') {
      console.warn('Sign-in popup was closed or cancelled.');
      return { user: null, error: 'Sign-in popup was closed before completion.', code };
    }
    console.warn('Google Sign-in non-fatal error:', error?.message);
    return { user: null, error: error?.message || 'Failed to complete Google Sign-in', code };
  } finally {
    isSigningIn = false;
  }
}

export async function logoutUser() {
  return signOut(auth);
}

export { onAuthStateChanged };
export type { FirebaseUser };
