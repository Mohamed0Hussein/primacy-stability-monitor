// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBzHzBpctDuCmEIqszqcbjEdmEoZ5qu_jw",
  authDomain: "auth2-b643e.firebaseapp.com",
  databaseURL: "https://auth2-b643e.firebaseio.com",
  projectId: "auth2-b643e",
  storageBucket: "auth2-b643e.appspot.com",
  messagingSenderId: "1034164731547",
  appId: "1:1034164731547:web:f0dab6d3bbdf8e5882d03e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)


export { app, auth }