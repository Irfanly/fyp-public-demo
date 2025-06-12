export interface Event {
    id: number;
    title: string;
    date: string;
    time: string;
    location: string;
    type: 'Online' | 'Physical';
    organization: string;
    category: string;
  }
  
  export const mockEvents: Event[] = [
    {
      id: 1,
      title: "Tech Innovation Workshop",
      date: "2024-11-15",
      time: "14:00-16:00",
      location: "Engineering Building Room 301",
      type: "Physical",
      organization: "Computer Science Society",
      category: "Workshop"
    },
    {
      id: 2,
      title: "Virtual Career Fair",
      date: "2024-11-20",
      time: "10:00-15:00",
      location: "Zoom",
      type: "Online",
      organization: "Career Development Club",
      category: "Career"
    },
    {
      id: 3,
      title: "Cultural Night Festival",
      date: "2024-11-25",
      time: "18:00-22:00",
      location: "Student Center",
      type: "Physical",
      organization: "International Students Association",
      category: "Cultural"
    },
    {
      id: 4,
      title: "Research Symposium",
      date: "2024-11-30",
      time: "09:00-17:00",
      location: "Science Complex",
      type: "Physical",
      organization: "Research Society",
      category: "Academic"
    },
    {
      id: 5,
      title: "Online Game Tournament",
      date: "2024-12-01",
      time: "20:00-23:00",
      location: "Discord",
      type: "Online",
      organization: "Gaming Club",
      category: "Social"
    }
  ];
  
  // You can also export constants for categories and types
  export const EVENT_CATEGORIES = [
    "Workshop",
    "Career",
    "Cultural",
    "Academic",
    "Social"
  ] as const;
  
  export const EVENT_TYPES = ["Physical", "Online"] as const;