import { auth } from "@/conf/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";

export class Fireauth {

    //Listen for user authentication state
    //this supposed to run automatically when the app 
    //detect any changes in the user authentication state
    async checkAuthState() {
        return new Promise((resolve, reject) => {
            auth.onAuthStateChanged((user) => {
                if (user) {
                    console.log(user.email + " is signed in");
                    resolve(user); // Return user object
                } else {
                    console.log("User is signed out");
                    resolve(null); // Explicitly return null for signed-out state
                }
            }, (error) => reject(error)); // Handle any errors
        });
    }
    
    //Sign Up new user
    async signUp(email, password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const user = userCredential.user;
            console.log(user);
        } catch (error) {
            throw error;
        }
    }

    //Sign In existing user
    async signIn(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log(user);
        } catch (error) {
            throw error;
        }
    }

    //Update display name
    async updateDisplayName(displayName) {
        try {
            await updateProfile(auth.currentUser, { displayName: displayName });
            console.log("Display name updated!");
        } catch (error) {
            throw error;
        }
    }

    //Check if user is logged in
    async isUserLoggedIn() {
        return auth.currentUser ? true : false;
    }
    
    //Sign Out current user
    async signOut() {
        auth.onAuthStateChanged((user) => {

            if (user) {
                console.log(user.email + " is signed in");
                auth.signOut();
            }
            //Ensure user is signed out
            if (!user) {
                console.log("User is signed out");
            }
            //display user
            console.log(user);
        });
    }

    //sign in user
    async signIn(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log(user);
        } catch (error) {
            console.log(error);
        }
    }

    //get current user
    async getCurrentUser() {
        const user = auth.currentUser
        console.log("Current user: ", user);
        return user;
    }
}

const fireauth = new Fireauth();

export default fireauth;