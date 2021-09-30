import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyD1iqVgKDMj2wMhHZ3O1aQKPubqJgGkqAk",
    authDomain: "roi-takeoff-user38.firebaseapp.com",
};

const app = initializeApp(firebaseConfig)
const creds = {email: "testuser38@example.com",password: "12345678"}
const auth = getAuth(app);

function getAuthToken() {
    signInWithEmailAndPassword(auth, creds.email, creds.password)
    .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        console.log("Sign in Successful");
        console.log(userCredential)
        // ...
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorMessage);
    });
}

export {getAuthToken}