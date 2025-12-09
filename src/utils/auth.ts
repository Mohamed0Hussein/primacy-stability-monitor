import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
  } from "firebase/auth";
  import { auth } from "../services/firebaseConfig";
  
  import {
    RegisterUser,
    LoginUser,
  } from "./user";
  
  export async function registerUser(
    fullName: string,
    email: string,
    password: string,
    phone: string
  ) {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
  
      const user = await RegisterUser({
        fullName,
        email,
        phone,
        password,
      });
  
      return user;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  export async function loginUser(email: string, password: string) {
    try {

      await signInWithEmailAndPassword(auth, email, password);

      const user = await LoginUser(email,password);
  
      return user;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }  