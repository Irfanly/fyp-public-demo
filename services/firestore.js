import { db } from '@/conf/firebase';
import { auth } from '@/conf/firebase';
import { collection, setDoc, doc , addDoc, getDocs, getDoc, query, where, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import fireauth  from '@/services/fireauth';
import firestorage from '@/services/firestorage';

export class Firestore {

    //Fetch schools list
    async getSchoolList() {
        try {
            const schools = [];
            const querySnapshot = await getDocs(collection(db, "school"));
            querySnapshot.forEach((doc) => {
                schools.push({
                    schoolID: doc.id,
                    ...doc.data()
                });
            });
            return schools;
        } catch (error) {
            throw error;
        }
    }

    // Add new user to the database
    async addUserToDatabase(role) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("No user is currently signed in.");
            }
            console.log(user);
            await setDoc(doc(db, "users", user.uid), {
                name: user.displayName || "",
                email: user.email,
                profilePicture: user.photoURL || "",
                role: role
            });
            console.log("Document written with ID: ", user.uid);
            return user.uid;
        } catch (error) {
            console.error("Error adding user to database:", error);
            throw error;
        }
    }

    //if user role is student, add user to student collection
    async addStudentToDatabase(userID) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("No user is currently signed in.");
            }
            console.log(user);
            await addDoc(collection(db, "students"), {
                userID: userID,
                matricNo: "", // Placeholder, should be updated with actual matric number
                programme: "", // Placeholder, should be updated with actual programme
                year: "", // Placeholder, should be updated with actual year
                phone: "", // Placeholder, should be updated with actual phone number
                registeredEvents: [],
                attendedEvents: [],
                organizationMemberships: [],
                followedOrganizations: []
            });
            console.log("Student added to database!");
        } catch (error) {
            console.error("Error adding student to database:", error);
            throw error;
        }
    }

    //If user role is student Organization, add user to student organization collection
    async addStudentOrganizationToDatabase(userID) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("No user is currently signed in.");
            }
            console.log(user);
            await addDoc(collection(db, "studentOrganizations"), {
                userID: userID,
                descriptions: "", // Placeholder, should be updated with actual description
                hostedEvents: [] // Initialize as empty array
            });
            console.log("Student Organization added to database!");
        } catch (error) {
            console.error("Error adding student organization to database:", error);
            throw error;
        }
    }

    //read user database
    async readUserDatabase() {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("No user is currently signed in.");
            }
            const docSnap = await getDoc(doc(db, "users", user.uid));
            if (docSnap.exists()) {
                //console.log("Document data:", docSnap.data());
                return docSnap.data();
            } else {
                console.log("No such document!");
            }
        } catch (error) {
            throw error;
        }
    }

    //read student database
    async readStudentDatabase() {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("No user is currently signed in.");
            }
            const querySnapshot = await getDocs(query(collection(db, "students"), where("userID", "==", user.uid)));
            if (!querySnapshot.empty) {
                const docSnap = querySnapshot.docs[0];
                //console.log("Document data:", docSnap.data());
                return docSnap.data();
            } else {
                console.log("No such document!");
            }
        } catch (error) {
            throw error;
        }
    }

    //read user database by user ID
    async readUserDatabaseByUserID(userID) {
        try {
            const docSnap = await getDoc(doc(db, "users", userID));
            if (docSnap.exists()) {
                //console.log("Document data:", docSnap.data());
                return docSnap.data();
            } else {
                console.log("No such document!");
            }
        } catch (error) {
            throw error;
        }
    }

    //Read student organization database
    async readStudentOrganizationDatabase() {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("No user is currently signed in.");
            }
            const querySnapshot = await getDocs(query(collection(db, "studentOrganizations"), where("userID", "==", user.uid)));
            if (!querySnapshot.empty) {
                const docSnap = querySnapshot.docs[0];
                //console.log("Document data:", docSnap.data());
                return docSnap.data();
            } else {
                console.log("No such document!");
            }
        } catch (error) {
            throw error;
        }
    }

    //read student database by user ID
    async readStudentDatabaseByUserID(userID) {
        try {
            const querySnapshot = await getDocs(query(collection(db, "students"), where("userID", "==", userID)));
            if (!querySnapshot.empty) {
                const docSnap = querySnapshot.docs[0];
                //console.log("Document data:", docSnap.data());
                return docSnap;
            } else {
                console.log("No such document!");
            }
        } catch (error) {
            throw error;
        }
    }

    //read student organization database by user ID
    async readStudentOrganizationDatabaseByUserID(userID) {
        try {
            const querySnapshot = await getDocs(query(collection(db, "studentOrganizations"), where("userID", "==", userID)));
            if (!querySnapshot.empty) {
                const docSnap = querySnapshot.docs[0];
                //console.log("Document data:", docSnap.data());
                return docSnap.data();
            } else {
                console.log("No such document!");
            }
        } catch (error) {
            throw error;
        }
    }

    //update user database
    async updateUserDatabase(data) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("No user is currently signed in.");
            }
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                name: data.name,
                email: data.email

            });
            await fireauth.updateDisplayName(data.name);
            console.log("Document successfully updated!");
        } catch (error) {
            throw error;
        }
    }

    //update user picture
    async updateUserPicture(data) {
        console.log(data);
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("No user is currently signed in.");
            }
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                profilePicture: data
            });
            console.log("Document successfully updated!");
        } catch (error) {
            throw error;
        }
    }

    //update student database
    async updateStudentDatabase(data) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("No user is currently signed in.");
            }
            const queryRef = query(collection(db, "students"), where("userID", "==", user.uid));
            const querySnapshot = await getDocs(queryRef);
            if (!querySnapshot.empty) {
                const docSnap = querySnapshot.docs[0];
                const studentRef = doc(db, "students", docSnap.id);
                await updateDoc(studentRef, {
                    matricNo: data.matricNo,
                    programme: data.programme,
                    year: data.year,
                    phone: data.phone
                });
                console.log("Document successfully updated!");
            } else {
                console.log("No such document!");
            }
            console.log("Document successfully updated!");
        } catch (error) {
            throw error;
        }
    }

    //Update student organization database
    async updateStudentOrganizationDatabase(data) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("No user is currently signed in.");
            }
            const queryRef = query(collection(db, "studentOrganizations"), where("userID", "==", user.uid));
            const querySnapshot = await getDocs(queryRef);
            if (!querySnapshot.empty) {
                const docSnap = querySnapshot.docs[0];
                const studentOrgRef = doc(db, "studentOrganizations", docSnap.id);
                await updateDoc(studentOrgRef, {
                    descriptions: data.descriptions
                });
                console.log("Document successfully updated!");
            } else {
                console.log("No such document!");
            }
        } catch (error) {
            throw error;
        }
    }

    //get event by id
    async getEventByID(eventID) {
        try {
            const docRef = await getDoc(doc(db, "events", eventID));
            if (docRef.exists()) {
                //console.log("Document data:", docRef.data());
                return {
                    eventID: docRef.id,
                    ...docRef.data()
                };
            } else {
                console.log("No such document!");
                //The event does not exist
                //Remove the event from the registered events list
                this.removeRegisteredEvents(eventID);
            }
        } catch (error) {
            throw error;
        }
    }

    //register event new event
    async registeredEvents(eventID) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("No user is currently signed in.");
            }
            const queryRef = query(collection(db, "students"), where("userID", "==", user.uid));
            const querySnapshot = await getDocs(queryRef);
            if (!querySnapshot.empty) {
                const docSnap = querySnapshot.docs[0];
                const studentRef = doc(db, "students", docSnap.id);
                await updateDoc(studentRef, {
                    registeredEvents: arrayUnion(eventID)
            });
            //update registered list
            const registeredRef = query(collection(db, "registeredList"), where("eventID", "==", eventID));
            const registeredSnapshot = await getDocs(registeredRef);
            if (!registeredSnapshot.empty) {
                const registeredDoc = registeredSnapshot.docs[0];
                const registeredListRef = doc(db, "registeredList", registeredDoc.id);
                await updateDoc(registeredListRef, {
                    studentID: arrayUnion(user.uid)
                });
                console.log("Document successfully updated!");
            } else {
                const docRef = await addDoc(collection(db, "registeredList"), {
                    eventID: eventID,
                    studentID: arrayUnion(user.uid)
                });
                console.log("Registered list updated with ID: ", docRef.id);
            }
            //Update registered log
            await this.updateRegistrationLog(eventID, user.uid);
            console.log("Document successfully updated!");
            } else {
                console.log("No such document!");
            }
        } catch (error) {
            throw error;
        }
    }

    //remove registered event
    async removeRegisteredEvents(eventID) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("No user is currently signed in.");
            }
            const queryRef = query(collection(db, "students"), where("userID", "==", user.uid));
            const querySnapshot = await getDocs(queryRef);
            if (!querySnapshot.empty) {
                const docSnap = querySnapshot.docs[0];
                const studentRef = doc(db, "students", docSnap.id);
                await updateDoc(studentRef, {
                    registeredEvents: arrayRemove(eventID)
            });
                //update registered list
                const registeredRef = query(collection(db, "registeredList"), where("eventID", "==", eventID));
                const registeredSnapshot = await getDocs(registeredRef);
                if (!registeredSnapshot.empty) {
                    const registeredDoc = registeredSnapshot.docs[0];
                    const registeredListRef = doc(db, "registeredList", registeredDoc.id);
                    await updateDoc(registeredListRef, {
                        studentID: arrayRemove(user.uid)
                    });
                }
                //Remove registration log
                await this.removeRegisteredLog(eventID, user.uid);
                console.log("Document successfully updated!");
            } else {
                console.log("No such document!");
            }
        } catch (error) {
            throw error;
        }
    }

    //Update registration log
    async updateRegistrationLog(eventID, studentID) {
        try {
            const registeredRef = query(collection(db, "registeredLog"), where("eventID", "==", eventID) && where("studentID", "==", studentID));
            const registeredSnapshot = await getDocs(registeredRef);
            if (!registeredSnapshot.empty) {
                const registeredDoc = registeredSnapshot.docs[0];
                const registeredLogRef = doc(db, "registeredLog", registeredDoc.id);
                await updateDoc(registeredLogRef, {
                    studentID: studentID,
                    registeredOn: new Date()
                });
                console.log("Document successfully updated!");
            } else {
                const docRef = await addDoc(collection(db, "registeredLog"), {
                    eventID: eventID,
                    studentID: studentID,
                    registeredOn: new Date()
                });
                console.log("Registered log updated with ID: ", docRef.id);
            }
        } catch (error) {
            throw error;
        }
    }

    //Remove registration log
    async removeRegisteredLog(eventID, studentID) {
        try {
            const registeredRef = query(collection(db, "registeredLog"), where("eventID", "==", eventID) && where("studentID", "==", studentID));
            const registeredSnapshot = await getDocs(registeredRef);
            if (!registeredSnapshot.empty) {
                const registeredDoc = registeredSnapshot.docs[0];
                const registeredLogRef = doc(db, "registeredLog", registeredDoc.id);
                await deleteDoc(registeredLogRef);
                console.log("Document successfully deleted!");
            } else {
                console.log("No such document!");
            }
        } catch (error) {
            throw error;
        }
    }

    //Get registration log
    async getRegistrationLog(eventID) {
        try {
            const querySnapshot = await getDocs(query(collection(db, "registeredLog"), where("eventID", "==", eventID)));
            if (!querySnapshot.empty) {
                const registeredData = querySnapshot.docs.map(doc => doc.data());
                return registeredData;
            } else {
                console.log("No registration log!");
                return [];
            }
        } catch (error) {
            throw error;
        }
    }


    //Record attendance
    async recordAttendance(eventID) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("No user is currently signed in.");
            }
            const queryRef = query(collection(db, "students"), where("userID", "==", user.uid));
            const querySnapshot = await getDocs(queryRef);
            if (!querySnapshot.empty) {
                const docSnap = querySnapshot.docs[0];
                const studentRef = doc(db, "students", docSnap.id);
                await updateDoc(studentRef, {
                    attendedEvents: arrayUnion(eventID)
                });

                //update attendance list
                const attendanceRef = query(collection(db, "attendeesList"), where("eventID", "==", eventID));
                const attendanceSnapshot = await getDocs(attendanceRef);
                if (!attendanceSnapshot.empty) {
                    const attendanceDoc = attendanceSnapshot.docs[0];
                    const attendanceListRef = doc(db, "attendeesList", attendanceDoc.id);
                    await updateDoc(attendanceListRef, {
                        studentID: arrayUnion(user.uid)
                    });
                    console.log("Document successfully updated!");
                } else {
                    const docRef = await addDoc(collection(db, "attendeesList"), {
                        eventID: eventID,
                        studentID: arrayUnion(user.uid)
                    });
                    console.log("Attendance list updated with ID: ", docRef.id);
                }
                console.log("Document successfully updated!");
            } else {
                console.log("No such document!");
            }
        } catch (error) {
            throw error;
        }
    }

    //Read a document
    async readDocument(collection, docId) {
        try {
            const docRef = await db.collection(collection).doc(docId).get();
            if (docRef.exists()) {
                console.log("Document data:", docRef.data());
            } else {
                console.log("No such document!");
            }
        } catch (error) {
            throw error;
        }
    }

    //Update a document
    async updateDocument(collection, docId, data) {
        try {
            await db.collection(collection).doc(docId).update(data);
            console.log("Document successfully updated!");
        } catch (error) {
            throw error;
        }
    }

    //Delete a document
    async deleteDocument(collection, docId) {
        try {
            await db.collection(collection).doc(docId).delete();
            console.log("Document successfully deleted!");
        } catch (error) {
            throw error;
        }
    }

    //Import events data to the database
    //Only run once to import data
    async importEventsData() {
        const events = require('@/data/events.json').events;
        for (const key in events) {
            if (events.hasOwnProperty(key)) {
                const event = events[key];
                try {
                    const docRef = await addDoc(collection(db, "events"), event);
                    console.log("Document written with ID: ", docRef.id);
                }
                catch (error) {
                    throw error;
                }
            }
        }
        
        console.log("Events data imported to database!");

    }

    //read event list 
    async getEvents() {
        try {
            const events = [];
            const querySnapshot = await getDocs(collection(db, "events"));
            console.log(querySnapshot);
            querySnapshot.forEach((doc) => {
                events.push({
                    eventID: doc.id,
                    ...doc.data()
                });
            });
            console.log(events);
            return events;
        } catch (error) {
            throw error;
        }
    }

    //read event list for students
    async getActiveEvents() {
        try {
            const events = [];
            const querySnapshot = await getDocs(query(collection(db, "events"), where("status", "==", "Active")));
            console.log(querySnapshot);
            querySnapshot.forEach((doc) => {
                events.push({
                    eventID: doc.id,
                    ...doc.data()
                });
            });
            console.log(events);
            return events;
        } catch (error) {
            throw error;
        }
    }

    //Read event based on user ID
    async getEventsByUserID() {
        //read curent user
        const user = auth.currentUser;
        console.log(user);
        if (!user) {
            throw new Error("No user is currently signed in.");
        }
        const querySnapshot = await getDocs(query(collection(db, "events"), where("organizerID", "==", user.uid)));
        const events = [];
        querySnapshot.forEach((doc) => {
            events.push({
                eventID: doc.id,
                ...doc.data()
            });
        });
        return events;
    }

    

    //Create participants list (not needed)
    // async createParticipantsList(eventID) {
    //     try {
    //         const docRef = await addDoc(collection(db, "participants"), {
    //             eventID: eventID,
    //             studentID: []
    //         });
    //         console.log("Participants list created with ID: ", docRef.id);
    //         return docRef;
    //     } catch (error) {
    //         throw error;
    //     }
    // }


    //Create new Events
    async createEvent(data, file) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("No user is currently signed in.");
            }

            const organizer = await firestore.readUserDatabase();

            const event = {
                organizerID: user.uid,
                title: data.title,
                shortDescription: data.shortDescription,
                longDescription: data.longDescription,
                eventLocation: data.eventLocation,
                eventDate: data.eventDate,
                eventTime: data.eventTime,
                eventType: data.eventType,
                category: data.category,
                organizer: organizer.name,
                maxParticipants: data.maxParticipants,
                attendancePassword: data.attendancePassword,
                poster: "",
                status: "Planning",
                eventLevel: data.eventLevel,
                MyCSDPoints: data.MyCSDPoints
            };

            const docRef = await addDoc(collection(db, "events"), event);
            console.log("Document written with ID: ", docRef.id);
            
            // Update the organizer's hostedEvents list
            console.log("Updating organizer's hosted events list...");
            const organizerRef = query(collection(db,"studentOrganizations"), where("userID", "==", user.uid));
            const organizerSnapshot = await getDocs(organizerRef);
            if (!organizerSnapshot.empty) {
                const organizerDoc = organizerSnapshot.docs[0];
                const organizerListRef = doc(db, "studentOrganizations", organizerDoc.id);
                await updateDoc(organizerListRef, {
                    hostedEvents: arrayUnion(docRef.id)
                });
                console.log("Document successfully updated!");
            }

            console.log("Updating registered list...");

            // Upload the event poster if provided
            if (file) {
                const posterURL = await firestorage.uploadEventPicture(file, docRef.id);
                await updateDoc(doc(db, "events", docRef.id), { poster: posterURL });
                console.log("Event poster updated!");
            }

            return docRef.id;
        } catch (error) {
            throw error;
        }
    }

    //Update event
    async updateEvent(eventID, data, file) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("No user is currently signed in.");
            }
            const organizer = await firestore.readUserDatabase();

            const event = {
                organizerID: user.uid,
                title: data.title,
                shortDescription: data.shortDescription,
                longDescription: data.longDescription,
                eventLocation: data.eventLocation,
                eventDate: data.eventDate,
                eventTime: data.eventTime,
                eventType: data.eventType,
                category: data.category,
                organizer: organizer.name,
                maxParticipants: data.maxParticipants,
                attendancePassword: data.attendancePassword,
                poster: data.poster,
                eventLevel: data.eventLevel,
                MyCSDPoints: data.MyCSDPoints
            };

            console.log(event);
            if(data.poster){
                event.poster = data.poster;
            }
            await updateDoc(doc(db, "events", eventID), event);

            // Upload the event poster if provided
            if (file) {
                const posterURL = await firestorage.uploadEventPicture(file, eventID);
                await updateDoc(doc(db, "events", eventID), { poster: posterURL });
                console.log("Event poster updated!");
            }

        } catch (error) {
            throw error;
        }
    }

    async updateEventStatus(eventID, status) {
        try {
            await updateDoc(doc(db, "events", eventID), {
                status: status
            });
            console.log("Event status updated!");
        } catch (error) {
            throw error;
        }
    }
    
    //update event picture
    async updateEventPicture(eventID, data) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("No user is currently signed in.");
            }
            const eventRef = doc(db, "events", eventID);
            await updateDoc(eventRef, {
                poster: data
            });
            console.log("Document successfully updated!");
        }
        catch (error) {
            throw error;
        }
    }

    //delete event
    async deleteEvent(eventID) {
        try{
            await firestorage.deleteEventPicture(eventID);
            console.log("Event picture deleted!");
            await deleteDoc(doc(db, "events", eventID));
            console.log("Document successfully deleted!");
            // remove event from hosted events list
            const user = auth.currentUser;
            if (!user) {
                throw new Error("No user is currently signed in.");
            }
            const organizerRef = query(collection(db,"studentOrganizations"), where("userID", "==", user.uid));
            const organizerSnapshot = await getDocs(organizerRef);
            if (!organizerSnapshot.empty) {
                const organizerDoc = organizerSnapshot.docs[0];
                const organizerListRef = doc(db, "studentOrganizations", organizerDoc.id);
                await updateDoc(organizerListRef, {
                    hostedEvents: arrayRemove(eventID)
                });
                console.log("Document successfully updated!");
            }
        }
        catch (error) {
            console.error("Error deleting document:", error);
            throw error;
        }
    }

    //get Participants list
    async getParticipantsList(eventID) {
        try {
            const querySnapshot = await getDocs(query(collection(db, "registeredList"), where("eventID", "==", eventID)));
            console.log(querySnapshot);
            if (!querySnapshot.empty) {
                const docSnap = querySnapshot.docs[0];
                const participantData = docSnap.data();

                // Loop through the studentID array and fetch the student details
                if (!participantData.studentID || participantData.studentID.length === 0) return [];

                const participantDetails = [];

                for (const studentID of participantData.studentID) {
                    const studentSnap = await this.readStudentDatabaseByUserID(studentID);

                    if (!studentSnap.exists()) continue;
                    const studentData = studentSnap.data();

                    const userRef = doc(db, "users", studentData.userID);
                    const userSnap = await getDoc(userRef);

                    if (!userSnap.exists()) continue;
                    const userData = userSnap.data();

                    participantDetails.push({
                        userID: studentID,
                        name: userData.name,
                        email: userData.email,
                        matricNo: studentData.matricNo,
                        programme: studentData.programme,
                        photoURL: userData.profilePicture || "",
                        year: studentData.year
                    });
                }

                return participantDetails;

            } else {
                console.log("No participants found!");
                return [];
            }
        } catch (error) {
            console.error("Error fetching participants:", error);
            return [];
        }
    }
    
    //get attendees list
    async getAttendanceList(eventID) {
        try {
            const querySnapshot = await getDocs(query(collection(db, "attendeesList"), where("eventID", "==", eventID)));
            console.log(querySnapshot);
            if (!querySnapshot.empty) {
                const docSnap = querySnapshot.docs[0];
                const attendanceData = docSnap.data();

                // Loop through the studentID array and fetch the student details
                if (!attendanceData.studentID || attendanceData.studentID.length === 0) return [];

                const attendanceDetails = [];

                for (const studentID of attendanceData.studentID) {
                    const studentSnap = await this.readStudentDatabaseByUserID(studentID);

                    if (!studentSnap.exists()) continue;
                    const studentData = studentSnap.data();

                    const userRef = doc(db, "users", studentData.userID);
                    const userSnap = await getDoc(userRef);

                    if (!userSnap.exists()) continue;
                    const userData = userSnap.data();

                    attendanceDetails.push({
                        userID: studentID,
                        name: userData.name,
                        email: userData.email,
                        matricNo: studentData.matricNo,
                        programme: studentData.programme,
                        photoURL: userData.profilePicture || "",
                        year: studentData.year
                    });
                }

                return attendanceDetails;

            } else {
                console.log("No attendees found!");
                return [];
            }
        } catch (error) {
            console.error("Error fetching attendance:", error);
            return [];
        }
    }

    //Fetch total students registered for an event
    async getTotalRegisteredStudents(eventID) {
        try {
            const querySnapshot = await getDocs(query(collection(db, "registeredList"), where("eventID", "==", eventID)));
            if (!querySnapshot.empty) {
                const docSnap = querySnapshot.docs[0];
                const participantData = docSnap.data();
                return participantData.studentID.length;
            } else {
                console.log("No participants found!");
                return 0;
            }
        } catch (error) {
            console.error("Error fetching participants:", error);
            return 0;
        }
    }

    //Get team members based on event ID
    async getTeamMembers(eventID) {
        try {
            const querySnapshot = await getDocs(query(collection(db, "teamMembers"), where("eventID", "==", eventID)));
    
            if (!querySnapshot.empty) {
                const docSnap = querySnapshot.docs[0];
                const teamData = docSnap.data();
                
                if (!teamData.studentID || teamData.studentID.length === 0) return [];
    
                const teamDetails = await Promise.all(
                    teamData.studentID.map(async (studentID) => {
                        const studentSnap = await this.readStudentDatabaseByUserID(studentID);
    
                        if (!studentSnap.exists()) return null;
                        const studentData = studentSnap.data();
    
                        const userRef = doc(db, "users", studentData.userID);
                        const userSnap = await getDoc(userRef);
    
                        if (!userSnap.exists()) return null;
                        const userData = userSnap.data();
    
                        return {
                            userID: studentID,
                            name: userData.name,
                            email: userData.email,
                            matricNo: studentData.matricNo,
                            programme: studentData.programme,
                            photoURL: userData.profilePicture || "",
                        };
                    })
                );
                return teamDetails.filter(Boolean);
            } else {
                console.log("No team members found!");
                return [];
            }
        } catch (error) {
            console.error("Error fetching team members:", error);
            return [];
        }
    }

    //Get students based on event ID for team members
    async getEventsDataForTeamMembers(eventID) {
        try {
            const user = auth.currentUser;
            if (user) {
                const querySnapshot = await getDocs(query(collection(db, "teamMembers"), where("eventID", "==", eventID)));
                //check if current user is a member of the team members list
                //it is possible for a user to be a member of multiple teams
                if (!querySnapshot.empty) {
                    const docSnap = querySnapshot.docs[0];
                    const teamData = docSnap.data();
                    if (teamData.studentID.includes(user.uid)) {
                        const eventData = await this.getEventByID(eventID);
                        return eventData;
                    }
                } else {
                    console.log("No such document!");
                }
            }
        } catch (error) {
            console.log("Error fetching students for team members:", error);
        }
    }

    //Get events list based on user ID for team members
    async getEventsByUserIDForTeamMembers() {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("User is not authenticated");
            }
    
            // Query the teamMembers collection for events where user is a participant
            const teamMembersRef = collection(db, "teamMembers");
            const q = query(teamMembersRef, where("studentID", "array-contains", user.uid));
            const querySnapshot = await getDocs(q);
    
            // Extract event IDs from the query results
            const eventIDs = querySnapshot.docs.map(doc => doc.data().eventID);
    
            if (eventIDs.length === 0) return []; // Return early if no events found
            
            // Fetch all event details and push it togother with its eventID
            
            // Fetch all event details concurrently
            const eventDetails = await Promise.all(eventIDs.map(eventID => this.getEventByID(eventID)));
    
            return eventDetails;
        } catch (error) {
            console.error("Error fetching events for team members:", error);
            throw error; // Re-throw to let the caller handle it
        }
    }

    //Search users based on name or matric no
    async searchUsers(searchQuery) {
        try {
            //search users only have student role
            const querySnapshot = await getDocs(query(collection(db, "users"), where("role", "==", "student")));
    
            // Process documents using Promise.all
            const users = await Promise.all(
                querySnapshot.docs.map(async (doc) => {
                    const userData = doc.data();
                    const studentSnap = await this.readStudentDatabaseByUserID(doc.id);
                    
                    if (!studentSnap.exists()) return null;
    
                    const studentData = studentSnap.data();
    
                    // Check if the user's name or matric no contains the query
                    if (
                        userData.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        studentData.matricNo.toLowerCase().includes(searchQuery.toLowerCase())
                    ) {
                        return {
                            userID: doc.id,
                            name: userData.name,
                            email: userData.email,
                            matricNo: studentData.matricNo,
                            programme: studentData.programme,
                            photoURL: userData.profilePicture || "",
                        };
                    }
                    return null;
                })
            );
    
            // Filter out null values
            const filteredUsers = users.filter(user => user !== null);
            return filteredUsers;
        } catch (error) {
            console.error("Error searching users:", error);
            throw error;
        }
    }

    //Add team members
    async addTeamMembers(eventID, studentID) {
        try {
            const querySnapshot = await getDocs(query(collection(db, "teamMembers"), where("eventID", "==", eventID)));
            if (!querySnapshot.empty) {
                const docSnap = querySnapshot.docs[0];
                const teamRef = doc(db, "teamMembers", docSnap.id);
                await updateDoc(teamRef, {
                    studentID: arrayUnion(studentID)
                });
                console.log("Document successfully updated!");
            } else {
                const docRef = await addDoc(collection(db, "teamMembers"), {
                    eventID: eventID,
                    studentID: arrayUnion(studentID)
                });
                console.log("Team members updated with ID: ", docRef.id);
            }
        } catch (error) {
            throw error;
        }
    }
    //Remove team members
    async removeTeamMembers(eventID, studentID) {
        try {
            const querySnapshot = await getDocs(query(collection(db, "teamMembers"), where("eventID", "==", eventID)));
            if (!querySnapshot.empty) {
                const docSnap = querySnapshot.docs[0];
                const teamRef = doc(db, "teamMembers", docSnap.id);
                await updateDoc(teamRef, {
                    studentID: arrayRemove(studentID)
                });
                console.log("Document successfully updated!");
            } else {
                console.log("No such document!");
            }
        } catch (error) {
            throw error;
        }
    }
    
    //Create task
    async createTask(eventID, data) {
        const user = auth.currentUser;
        try {
            const docRef = await addDoc(collection(db, "tasks"), {
                eventID: eventID,
                createdBy: user.uid,
                title: data.title,
                description: data.description,
                assignedTo: "",
                status: "New"
            });
            console.log("Task created with ID: ", docRef.id);
        } catch (error) {
            throw error;
        }
    }

    //Get Task
    async getTasks(eventID) {
        try {
            const tasks = [];
            const querySnapshot = await getDocs(query(collection(db, "tasks"), where("eventID", "==", eventID)));
            querySnapshot.forEach((doc) => {
                tasks.push({
                    taskID: doc.id,
                    ...doc.data()
                });
            });
            return tasks;
        } catch (error) {
            throw error;
        }
    }

    //update task status
    async updateTaskStatus(taskID, status) {
        try {
            await updateDoc(doc(db, "tasks", taskID), {
                status: status
            });
            console.log("Task status updated!");
        } catch (error) {
            throw error;
        }
    }

    //Edit task
    async editTask(taskID, data) {
        try {
            await updateDoc(doc(db, "tasks", taskID), {
                title: data.title,
                description: data.description || "",
                assignedTo: data.assignedTo || "",
                status: data.status
            });
            console.log("Task successfully updated!");
        } catch (error) {
            throw error;
        }
    }

    //Delete task
    async deleteTask(taskID) {
        try {
            await deleteDoc(doc(db, "tasks", taskID));
            console.log("Task successfully deleted!");
        } catch (error) {
            throw error;
        }
    }

    async getAllOrganizations() {
    try {
        const organizations = [];
        const querySnapshot = await getDocs(collection(db, "studentOrganizations"));
        
        for (const document of querySnapshot.docs) {
            const orgData = document.data();
            
            // Get user details for the organization
            const userDoc = await getDoc(doc(db, "users", orgData.userID));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                
                organizations.push({
                    userID: orgData.userID,
                    name: userData.name || "Unknown Organization",
                    description: orgData.descriptions || "",
                    photoURL: userData.profilePicture || "",
                    hostedEvents: orgData.hostedEvents || []
                });
            }
        }
        
        return organizations;
    } catch (error) {
            console.error("Error fetching organizations:", error);
            throw error;
        }
    }

    async searchOrganizations(searchQuery) {
        try {
            const organizations = await this.getAllOrganizations();
            return organizations.filter(org => 
                org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                org.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        } catch (error) {
            console.error("Error searching organizations:", error);
            throw error;
        }
    }

    listenForNewEvents(callback) {
        const eventsRef = collection(db, "events");
        const q = query(eventsRef, orderBy("eventDate", "asc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const events = [];
            querySnapshot.forEach((doc) => {
                events.push({
                    eventID: doc.id,
                    ...doc.data()
                });
            });
            console.log("New events received: ", events);
            callback(events);
        });
        return unsubscribe;
    }
}

const firestore = new Firestore();

export default firestore;