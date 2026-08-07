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
  await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
  await signInWithEmailAndPassword(auth, email, password);
  const user = await LoginUser(email, password);
  return user;
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}