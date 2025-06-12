import { db } from "@/conf/firebase";
import { 
  doc, 
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  orderBy, 
  onSnapshot, 
  Timestamp,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";

export class FirestoreChatroom {
  // Create a new chatroom following the schema
  async createChatroom(chatroomData) {
    try {
      // Check required fields as per schema
      if (!chatroomData.organizerID) {
        throw new Error("organizerID is required for creating a chatroom");
      }
      if (!chatroomData.eventID) {
        throw new Error("eventID is required for creating a chatroom");
      }
      if (!chatroomData.title) {
        throw new Error("title is required for creating a chatroom");
      }
      
      // Ensure required fields from schema
      const newChatroomData = {
        organizerID: chatroomData.organizerID,
        eventID: chatroomData.eventID,
        title: chatroomData.title,
        participants: chatroomData.participants || [],
        messages: chatroomData.messages || [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      // Add a document with auto-generated ID to the chatrooms collection
      const docRef = await addDoc(collection(db, "chatrooms"), newChatroomData);
      
      console.log("Chatroom created with ID: ", docRef.id);
      return docRef.id;
    } catch (e) {
      console.error("Error creating chatroom: ", e);
      throw e;
    }
  }

  // Get chatroom list based on userID - Using separate queries
  async getChatrooms(userID) {
    try {
      // Step 1: First get all chatrooms where the user is a participant
      const chatroomsRef = collection(db, "chatrooms");
      const participantQuery = query(
        chatroomsRef, 
        where("participants", "array-contains", userID)
      );
      
      const querySnapshot = await getDocs(participantQuery);
      const chatroomIds = querySnapshot.docs.map(doc => doc.id);
      
      // Step 2: If no chatrooms found, return empty array
      if (chatroomIds.length === 0) {
        return [];
      }
      
      // Step 3: Now get detailed data for these chatrooms
      const chatrooms = [];
      
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        chatrooms.push({
          chatroomID: doc.id,
          organizerID: data.organizerID,
          eventID: data.eventID,
          title: data.title,
          participants: data.participants || [],
          messages: data.messages || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      }
      
      // Sort by updated time manually
      chatrooms.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      
      console.log("Chatrooms fetched for user:", userID);
      return chatrooms;
    } catch (e) {
      console.error("Error getting chatrooms: ", e);
      return [];
    }
  }

  // Get chatrooms for a specific event - Using separate queries
  async getEventChatrooms(eventID) {
    try {
      // Step 1: First get all chatrooms for this event
      const chatroomsRef = collection(db, "chatrooms");
      const eventQuery = query(
        chatroomsRef, 
        where("eventID", "==", eventID)
      );
      
      const querySnapshot = await getDocs(eventQuery);
      
      // Step 2: Process and return the data
      const chatrooms = [];
      
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        chatrooms.push({
          chatroomID: doc.id,
          organizerID: data.organizerID,
          eventID: data.eventID,
          title: data.title,
          participants: data.participants || [],
          messages: data.messages || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      }
      
      // Sort by updated time manually
      chatrooms.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      
      console.log("Chatrooms fetched for event:", eventID);
      return chatrooms;
    } catch (e) {
      console.error("Error getting event chatrooms: ", e);
      return [];
    }
  }

  // Add a participant to a chatroom using eventID to find the chatroom
  async addChatroomParticipantByEventID(eventID, userID) {
    try {
      // Get chatroom by eventID
      const chatroomsRef = collection(db, "chatrooms");
      const chatroomQuery = query(
        chatroomsRef,
        where("eventID", "==", eventID)
      );
      const querySnapshot = await getDocs(chatroomQuery);
      
      if (querySnapshot.empty) {
        console.error("No chatroom found for event: ", eventID);
        return false;
      }
      
      // Get the first chatroom (there should normally be only one per event)
      const chatroomDoc = querySnapshot.docs[0];
      const chatroomID = chatroomDoc.id;
      
      // Use arrayUnion to add the participant without duplicates
      await updateDoc(doc(db, "chatrooms", chatroomID), {
        participants: arrayUnion(userID),
        updatedAt: Timestamp.now()
      });
      
      console.log("Participant added to chatroom for event: ", eventID);
      return true;
    } catch (e) {
      console.error("Error adding participant: ", e);
      throw e;
    }
  }

  // Remove a participant from a chatroom using eventID to find the chatroom
  async removeChatroomParticipantByEventID(eventID, userID) {
    try {
      // Get chatroom by eventID
      const chatroomsRef = collection(db, "chatrooms");
      const chatroomQuery = query(
        chatroomsRef,
        where("eventID", "==", eventID)
      );
      const querySnapshot = await getDocs(chatroomQuery);
      
      if (querySnapshot.empty) {
        console.error("No chatroom found for event: ", eventID);
        return false;
      }
      
      // Get the first chatroom (there should normally be only one per event)
      const chatroomDoc = querySnapshot.docs[0];
      const chatroomID = chatroomDoc.id;
      
      // Use arrayRemove to safely remove the participant
      await updateDoc(doc(db, "chatrooms", chatroomID), {
        participants: arrayRemove(userID),
        updatedAt: Timestamp.now()
      });
      
      console.log("Participant removed from chatroom for event: ", eventID);
      return true;
    } catch (e) {
      console.error("Error removing participant from chatroom: ", e);
      throw e;
    }
  }

  // Get chatroom details by ID
  async getChatroom(chatroomID) {
    try {
      const chatroomRef = doc(db, "chatrooms", chatroomID);
      const chatroomSnapshot = await getDoc(chatroomRef);
      
      if (chatroomSnapshot.exists()) {
        const data = chatroomSnapshot.data();
        
        // Format according to schema
        const chatroomData = {
          chatroomID: chatroomSnapshot.id,
          organizerID: data.organizerID,
          eventID: data.eventID,
          title: data.title,
          participants: data.participants || [],
          messages: data.messages || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
        
        console.log("Chatroom details retrieved for: ", chatroomID);
        return chatroomData;
      } else {
        console.error("Chatroom does not exist: ", chatroomID);
        return null;
      }
    } catch (e) {
      console.error("Error getting chatroom: ", e);
      return null;
    }
  }

  // Remove a participant from a chatroom
  async removeChatroomParticipant(chatroomID, userID) {
    try {
      const chatroomRef = doc(db, "chatrooms", chatroomID);
      const chatroomSnapshot = await getDoc(chatroomRef);
      
      if (chatroomSnapshot.exists()) {
        // Use arrayRemove to safely remove the participant
        await updateDoc(chatroomRef, {
          participants: arrayRemove(userID),
          updatedAt: Timestamp.now(),
        });
        
        console.log("Participant removed from chatroom: ", userID);
        return true;
      } else {
        console.error("Chatroom does not exist: ", chatroomID);
        return false;
      }
    } catch (e) {
      console.error("Error removing participant: ", e);
      throw e;
    }
  }

  // Send a message to a chatroom
  async sendMessage(chatroomID, messageData) {
    try {
      const chatroomRef = doc(db, "chatrooms", chatroomID);
      const chatroomSnapshot = await getDoc(chatroomRef);
      
      if (!chatroomSnapshot.exists()) {
        throw new Error(`Chatroom with ID ${chatroomID} not found`);
      }
      
      // Create new message following the schema
      const newMessage = {
        messageID: Date.now().toString(), // Generate unique ID
        senderID: messageData.senderID,
        content: messageData.content,
        timestamp: Timestamp.now(),
      };
      
      // Add message to the chatroom's messages array
      await updateDoc(chatroomRef, {
        messages: arrayUnion(newMessage),
        updatedAt: Timestamp.now(),
      });
      
      console.log("Message sent to chatroom: ", chatroomID);
      return {
        ...newMessage,
        timestamp: new Date() // Return a JS Date object
      };
    } catch (e) {
      console.error("Error sending message: ", e);
      throw e;
    }
  }
  
  // Get all messages from a chatroom
  async getMessages(chatroomID) {
    try {
      const chatroomRef = doc(db, "chatrooms", chatroomID);
      const chatroomSnapshot = await getDoc(chatroomRef);
      
      if (!chatroomSnapshot.exists()) {
        throw new Error(`Chatroom with ID ${chatroomID} not found`);
      }
      
      const data = chatroomSnapshot.data();
      const messages = data.messages || [];
      
      // Convert timestamps to Date objects
      return messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp?.toDate() || new Date()
      }));
    } catch (e) {
      console.error("Error getting messages: ", e);
      return [];
    }
  }

  // Listen to a specific chatroom for changes
  listenToChatroom(chatroomID, callback) {
    const chatroomRef = doc(db, "chatrooms", chatroomID);
    
    const unsubscribe = onSnapshot(chatroomRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        
        // Format according to schema
        const chatroom = {
          chatroomID: doc.id,
          organizerID: data.organizerID,
          eventID: data.eventID,
          title: data.title,
          participants: data.participants || [],
          messages: (data.messages || []).map(msg => ({
            ...msg,
            timestamp: msg.timestamp?.toDate() || new Date()
          })),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
        
        callback(chatroom);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error("Error listening to chatroom:", error);
    });
    
    return unsubscribe;
  }
  
  // Get all chatrooms (for admin purposes)
  async getAllChatrooms() {
    try {
      const chatroomsRef = collection(db, "chatrooms");
      const querySnapshot = await getDocs(chatroomsRef);
      
      const chatrooms = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          chatroomID: doc.id,
          organizerID: data.organizerID,
          eventID: data.eventID,
          title: data.title,
          participants: data.participants || [],
          messages: data.messages || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      });
      
      // Sort by updated time manually
      chatrooms.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      
      return chatrooms;
    } catch (e) {
      console.error("Error getting all chatrooms: ", e);
      return [];
    }
  }
  
  // Delete a chatroom
  async deleteChatroom(chatroomID) {
    try {
      const chatroomRef = doc(db, "chatrooms", chatroomID);
      await deleteDoc(chatroomRef);
      
      console.log("Chatroom deleted with ID: ", chatroomID);
      return true;
    } catch (e) {
      console.error("Error deleting chatroom: ", e);
      throw e;
    }
  }
  
  // Delete a specific message from a chatroom
  async deleteMessage(chatroomID, messageID) {
    try {
      const chatroomRef = doc(db, "chatrooms", chatroomID);
      const chatroomSnapshot = await getDoc(chatroomRef);
      
      if (!chatroomSnapshot.exists()) {
        throw new Error(`Chatroom with ID ${chatroomID} not found`);
      }
      
      const data = chatroomSnapshot.data();
      const messages = data.messages || [];
      
      // Filter out the message to delete
      const updatedMessages = messages.filter(msg => msg.messageID !== messageID);
      
      // Update the chatroom with the filtered messages
      await updateDoc(chatroomRef, {
        messages: updatedMessages,
        updatedAt: Timestamp.now(),
      });
      
      console.log("Message deleted with ID: ", messageID);
      return true;
    } catch (e) {
      console.error("Error deleting message: ", e);
      throw e;
    }
  }
}

export const firestoreChatroom = new FirestoreChatroom();
export default firestoreChatroom;