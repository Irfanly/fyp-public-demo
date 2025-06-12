import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/conf/firebase';

export class Firestorage{
    //upload and update profile picture
    async uploadProfilePicture(file, userID) {
        try {
            console.log("Uploading profile picture...");
            const pictureRef = ref(storage, `profile-pictures/${userID}`);
            await uploadBytes(pictureRef, file);
            //get download url
            const downloadURL = await getDownloadURL(pictureRef);
            console.log("Profile picture uploaded! with url:", downloadURL);
            return downloadURL;
        } catch (error) {
            console.error("Error uploading profile picture:", error);
            throw error;
        }
    }
    //upload and update event picture
    async uploadEventPicture(file, eventID) {
        try {
            const pictureRef = ref(storage, `event-pictures/${eventID}`);
            await uploadBytes(pictureRef, file);
            //get download url
            const downloadURL = await getDownloadURL(pictureRef);
            console.log("Event Picture Uploaded! with url:", downloadURL);
            return downloadURL;
        } catch (error) {
            console.error("Error uploading event picture:", error);
            throw error;
        }
    }

    //delete profile picture
    async deleteProfilePicture(userID) {
        try {
            const pictureRef = ref(storage, `profile-pictures/${userID}`);
            pictureRef.delete();
            console.log("Profile picture deleted!");
        } catch (error) {
            console.error("Error deleting profile picture:", error);
            throw error;
        }
    }

    //delete event picture
    async deleteEventPicture(eventID) {
        try {
            const pictureRef = ref(storage, `event-pictures/${eventID}`);
            if(pictureRef)
            {
                deleteObject(pictureRef);
                console.log("Event picture deleted!");
            }
            else
                console.log("No picture to delete!");

        } catch (error) {
            console.error("Error deleting event picture:", error);
            throw error;
        }
    }
}

const firestorage = new Firestorage();

export default firestorage;