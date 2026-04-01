// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyASZoCid7uh5o1qk3WuXdk1DWdo9k6Axio",
  authDomain: "juswareact.firebaseapp.com",
  projectId: "juswareact",
  storageBucket: "juswareact.firebasestorage.app",
  messagingSenderId: "785397887287",
  appId: "1:785397887287:web:783546d45f09a11cc8eab2",
  measurementId: "G-P1BSDK7K0P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);