import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { RegisterUser, LoginUser } from "./user";

export async function registerUser(
  fullName: string,
  email: string,
  password: string,
  phone: string
) {
  let credential;
  let justCreated = false;

  try {
    credential = await createUserWithEmailAndPassword(auth, email, password);
    justCreated = true;
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code !== "auth/email-already-in-use") throw error;

    // Could be someone else's account, or an orphan left behind by a
    // previously-failed signup (Firebase account created, but the backend
    // call after it never completed — e.g. a DB outage). If these exact
    // credentials sign in, it's the latter: recover by finishing the
    // backend registration instead of leaving the user stuck forever.
    try {
      credential = await signInWithEmailAndPassword(auth, email, password);
    } catch {
      throw error; // not their account — surface the original "in use" error
    }
  }

  try {
    const user = await RegisterUser({ fullName, email, phone, password });
    return user;
  } catch (backendError) {
    if (justCreated) {
      // Roll back the Firebase account we just created so a retry isn't
      // permanently blocked by "email already in use". Best-effort: if this
      // itself fails, the recovery path above picks it up on the next attempt.
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          await credential.user.delete();
          break;
        } catch {
          // swallow — never let a rollback failure mask the real error below
        }
      }
    }
    throw backendError;
  }
}

export async function loginUser(email: string, password: string, rememberMe = false) {
  // Backend login must resolve (and store the token) BEFORE the Firebase sign-in below —
  // Firebase's onAuthStateChanged fires almost immediately after signInWithEmailAndPassword
  // and triggers navigation to the dashboard, which fires an authenticated request. If that
  // happens before the token is stored, it 401s and gets treated as a logout.
  const user = await LoginUser(email, password);
  await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
  await signInWithEmailAndPassword(auth, email, password);
  return user;
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}