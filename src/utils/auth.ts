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
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  try {
    const user = await RegisterUser({ fullName, email, phone, password });
    return user;
  } catch (error) {
    await credential.user.delete();
    throw error;
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