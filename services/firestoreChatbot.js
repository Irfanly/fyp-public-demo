import { db } from "@/conf/firebase";
import { doc, deleteDoc, collection, addDoc, getDocs, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";

export class FirestoreChatbot {
    //Save user message to Firestore
    async saveUserMessage(userID, message) {
        try {
            const docRef = await addDoc(collection(db, `chats/${userID}/messages`), {
                message: message,
                timestamp: Timestamp.now(),
                type: "user"
            });
            console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }
    //Save bot message to Firestore
    async saveBotMessage(userID, message) {
        try {
            const docRef = await addDoc(collection(db, `chats/${userID}/messages`), {
                message: message,
                timestamp: Timestamp.now(),
                type: "bot"
            });
            console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }
    //Get all messages from Firestore
    async getMessages(userID) {
        console.log("Fetching messages for user: ", userID);
        const messagesRef = collection(db, `chats/${userID}/messages`);
        const q = query(messagesRef, orderBy("timestamp", "asc"));
        const querySnapshot = await getDocs(q);
        const messages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Messages: ", messages);
        return messages;
    }

    //Listen to messages from Firestore
    listenToMessages(userID, callback) {
        const messagesRef = collection(db, `chats/${userID}/messages`);
        const q = query(messagesRef, orderBy("timestamp", "asc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const messages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log("New message received: ", messages);
            callback(messages);
        });
        return unsubscribe;
    }
    //Delete message from Firestore
    async deleteMessage(userID) {
        try {
            const messagesRef = collection(db, `chats/${userID}/messages`);
            const querySnapshot = await getDocs(messagesRef);
            
            // Delete each document in the collection
            const deletePromises = querySnapshot.docs.map(doc => 
                deleteDoc(doc.ref)
            );
            
            await Promise.all(deletePromises);
            console.log("All messages deleted for user", userID);
        } catch (error) {
            console.error("Error deleting messages:", error);
            throw error;
        }
    }
}

export const firestoreChatbot = new FirestoreChatbot();
export default firestoreChatbot;