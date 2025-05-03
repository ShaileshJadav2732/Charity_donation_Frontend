import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

console.log("API Key:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
const firebaseConfig = {
	apiKey: "AIzaSyA-PpYMbNbIny-qjg21SQO7umjqXSxMKOo",
	authDomain: "charity-donation-83eec.firebaseapp.com",
	projectId: "charity-donation-83eec",
	storageBucket: "charity-donation-83eec.appspot.com",
	messagingSenderId: "417531742246",
	appId: "1:417531742246:web:ec763179dfa4b3f9cd3ee7",
	measurementId: "G-R9GXMBZE9N",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
