import { Timestamp } from "firebase/firestore";

type users = {
    userID?: string; // Unique identifier for the user
    name: string;
    email: string;
    profilePicture: string;
    role: string;
};

type students = {
    userID: string;
    matricNo: string;
    programme: string;
    year: string;
    phone: string;
    registeredEvents: string[];
    attendedEvents: string[];
    organizationMemberships: string[];
    followedOrganizations: string[];
};

type studentOrganizations = {
    userID: string;
    descriptions: string;
    hostedEvents: string[];
}

type tasks = {
    taskID?: string; // Unique identifier for the task
    eventID: string;
    createdBy: string;
    title: string;
    description: string;
    assignedTo: string;
    status: string;
};

type teamMembers = {
    eventID: string;
    studentID: string[];
};

type registeredParticipants = {
    eventID: string;
    studentID: string [];
};

type attendeesList = {
    eventID: string;
    studentID: string[];
};

type userDetailsList = {
    userID: string;
    name: string;
    email: string;
    matricNo: string;
    programme: string;
    photoURL: string;
    year?: string;
};

type studentOrganizationsDetails = {
    userID: string;
    name: string;
    description: string;
    photoURL: string;
    hostedEvents: string[];
}

type registeredLog = {
    eventID: string;
    studentID: string;
    registeredOn: Timestamp;
}

type events = {
    eventID: string; // Unique identifier for the event
    organizerID?: string; // ID of the user or organization hosting the event
    status?: string; // Status of the event (e.g., upcoming, ongoing, completed)
    title: string; // Event title
    shortDescription: string; // Brief description for the event
    longDescription: string; // Detailed event description
    eventDate: string; // Date of the event
    eventTime: string; // Time of the event
    eventLocation: string; // Location of the event 
    eventType: string; // Type of event (e.g., virtual, in-person)
    category: string; // MyCSD Cores (e.g., technology, sports)
    eventLevel: string; // Event level (e.g., university, state, international)
    MyCSDPoints?: number; // Points awarded for participation based on event level
    maxParticipants: number; // Maximum number of participants allowed
    organizer: string; // Organizer or organization hosting the event
    attendancePassword: string; // Password for attendance verification
    poster: string; // URL or path to the event poster (optional)
  };

type school = {
    schoolID: string;
    name: string;
};

type chatbot = {
    sender : string; // "user" or "bot"
    message : string; // Message content
    timestamp : Date; // Timestamp of the message
}

type chatMessage = {
    messageID?: string; // Unique identifier for the message
    senderID: string; // ID of the user who sent the message
    content: string; // Content of the message
    timestamp: Date; // Timestamp of when the message was sent
};

type chatroom = {
    chatroomID?: string; // Unique identifier for the chatroom
    organizerID: string; // ID of the user or organization that created the chatroom
    eventID: string; // ID of the event associated with the chatroom
    title: string; // Title of the chatroom
    participants: string[]; // Array of user IDs participating in the chatroom
    messages: chatMessage[]; // Array of messages in the chatroom
    createdAt: Date; // Timestamp of when the chatroom was created
    updatedAt: Date; // Timestamp of when the chatroom was last updated
};




export const USER_ROLES = ["Student", "Organization", ""] as const;

export const EVENT_CATEGORIES = [
    "Technology",
    "Sports",
    "Environment",
    "Arts",
    "Culture",
    "Business",
    "Health",
    "Community",
  ] as const;
  
export const EVENT_TYPES = [
    "Physical",
    "Virtual",
    "Hybrid",
  ] as const;

export const MYCSD_CORES = [
    "Reka Cipta & Inovasi",
    "Khidmat Masyrakat",
    "Pengucapan Awam",
    "Kesukarelawanan",
    "Keusahawanan",
    "Kepimpinan",
    "Kebudayaan",
    "Sukan"
  ] as const;

export const EVENT_LEVELS = {
    "Pusat Pengajian/Desasiwa/Persatuan/Kelab": 2,
    "Negeri/Universiti": 4,
    "Antarabangsa": 8,
} as const;

export type { 
    users, 
    students, 
    studentOrganizations, 
    tasks, 
    teamMembers, 
    registeredParticipants, 
    attendeesList, 
    events,
    userDetailsList,
    studentOrganizationsDetails,
    registeredLog,
    school,
    chatbot,
    chatMessage,
    chatroom
};