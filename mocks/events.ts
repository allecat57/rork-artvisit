import { Event, AccessLevel } from "@/types/event";

export const events: Event[] = [
  {
    id: "event-001",
    title: "Modern Art Exhibition Opening",
    description: "Join us for the opening night of our new modern art exhibition featuring works from emerging artists around the world.",
    image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
    date: "2023-06-15T18:00:00Z",
    endDate: "2023-06-15T21:00:00Z",
    location: "Main Gallery, Floor 2",
    price: 25,
    capacity: 150,
    remainingSpots: 42,
    accessLevel: AccessLevel.FREE,
    featured: true,
    tags: ["opening", "modern art", "emerging artists"],
    type: "exhibition_opening"
  },
  {
    id: "event-002",
    title: "Sculpture Workshop with Maria Chen",
    description: "Learn the basics of clay sculpture with renowned artist Maria Chen in this hands-on workshop suitable for beginners.",
    image: "https://images.unsplash.com/photo-1576699445826-88a0d1e9dfd5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
    date: "2023-06-18T10:00:00Z",
    endDate: "2023-06-18T13:00:00Z",
    location: "Workshop Space, Floor 1",
    price: 45,
    capacity: 20,
    remainingSpots: 5,
    accessLevel: AccessLevel.ESSENTIAL,
    featured: false,
    tags: ["workshop", "sculpture", "clay", "hands-on"],
    type: "workshop"
  },
  {
    id: "event-003",
    title: "Artist Talk: The Future of Digital Art",
    description: "Join digital artist James Wilson for a discussion on how technology is shaping the future of art creation and consumption.",
    image: "https://images.unsplash.com/photo-1540317580384-e5d43867caa6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
    date: "2023-06-20T19:00:00Z",
    endDate: "2023-06-20T20:30:00Z",
    location: "Auditorium",
    price: 15,
    capacity: 100,
    remainingSpots: 68,
    accessLevel: AccessLevel.FREE,
    featured: false,
    tags: ["talk", "digital art", "technology"],
    type: "artist_talk"
  },
  {
    id: "event-004",
    title: "Curator's Tour: Renaissance Masterpieces",
    description: "Our chief curator leads an exclusive tour of our Renaissance collection, offering insights into the techniques and stories behind these masterpieces.",
    image: "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2071&q=80",
    date: "2023-06-22T11:00:00Z",
    endDate: "2023-06-22T12:30:00Z",
    location: "Renaissance Gallery, Floor 3",
    price: 30,
    capacity: 15,
    remainingSpots: 3,
    accessLevel: AccessLevel.EXPLORER,
    featured: true,
    tags: ["tour", "renaissance", "masterpieces", "exclusive"],
    type: "curator_tour"
  },
  {
    id: "event-005",
    title: "Family Day: Art and Nature",
    description: "A day of art activities for the whole family inspired by nature. Create your own landscape paintings, nature sculptures, and more.",
    image: "https://images.unsplash.com/photo-1551966775-a4ddc8df052b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
    date: "2023-06-25T10:00:00Z",
    endDate: "2023-06-25T16:00:00Z",
    location: "Education Center",
    price: 20,
    capacity: 50,
    remainingSpots: 22,
    accessLevel: AccessLevel.FREE,
    featured: false,
    tags: ["family", "children", "activities", "nature"],
    type: "family_event"
  },
  {
    id: "event-006",
    title: "VIP Preview: Contemporary Collection",
    description: "An exclusive preview of our new contemporary art acquisitions before they open to the public. Includes champagne reception and meeting with the artists.",
    image: "https://images.unsplash.com/photo-1577720643272-265f09367456?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
    date: "2023-06-28T18:00:00Z",
    endDate: "2023-06-28T21:00:00Z",
    location: "Contemporary Gallery, Floor 4",
    price: 100,
    capacity: 30,
    remainingSpots: 10,
    accessLevel: AccessLevel.COLLECTOR,
    featured: true,
    tags: ["VIP", "preview", "contemporary", "exclusive"],
    type: "exhibition_opening"
  },
  {
    id: "event-007",
    title: "Photography Masterclass",
    description: "Improve your photography skills with this masterclass led by award-winning photographer Elena Gomez. Bring your own camera.",
    image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2074&q=80",
    date: "2023-07-02T14:00:00Z",
    endDate: "2023-07-02T17:00:00Z",
    location: "Workshop Space, Floor 1",
    price: 60,
    capacity: 15,
    remainingSpots: 8,
    accessLevel: AccessLevel.EXPLORER,
    featured: false,
    tags: ["photography", "masterclass", "skills"],
    type: "workshop"
  },
  {
    id: "event-008",
    title: "Art and Wine Evening",
    description: "Enjoy a guided tour of our Impressionist collection followed by a wine tasting featuring selections that complement the artwork.",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
    date: "2023-07-05T19:00:00Z",
    endDate: "2023-07-05T21:30:00Z",
    location: "Impressionist Gallery, Floor 3",
    price: 75,
    capacity: 25,
    remainingSpots: 15,
    accessLevel: AccessLevel.ESSENTIAL,
    featured: true,
    tags: ["wine", "impressionism", "tasting", "evening"],
    type: "curator_tour"
  },
  {
    id: "event-009",
    title: "Children's Art Class: Magical Creatures",
    description: "Children ages 6-12 will create their own magical creatures using various art materials. All supplies included.",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2072&q=80",
    date: "2023-07-08T10:00:00Z",
    endDate: "2023-07-08T12:00:00Z",
    location: "Education Center",
    price: 25,
    capacity: 20,
    remainingSpots: 12,
    accessLevel: AccessLevel.FREE,
    featured: false,
    tags: ["children", "class", "creatures", "imagination"],
    type: "family_event"
  },
  {
    id: "event-010",
    title: "Collector's Dinner with Artist Residence",
    description: "An intimate dinner with our current artist in residence, discussing their work and creative process. Exclusive to Collector level members.",
    image: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
    date: "2023-07-12T19:00:00Z",
    endDate: "2023-07-12T22:00:00Z",
    location: "Museum Restaurant",
    price: 150,
    capacity: 12,
    remainingSpots: 4,
    accessLevel: AccessLevel.COLLECTOR,
    featured: true,
    tags: ["dinner", "collector", "artist", "exclusive"],
    type: "artist_talk"
  }
];

// Helper function to filter events by access level
export const getEventsByAccessLevel = (accessLevel: AccessLevel): Event[] => {
  const accessLevels = Object.values(AccessLevel);
  const userLevelIndex = accessLevels.indexOf(accessLevel);
  
  return events.filter(event => {
    const eventLevelIndex = accessLevels.indexOf(event.accessLevel);
    return userLevelIndex >= eventLevelIndex;
  });
};

// Helper function to get featured events by access level
export const getFeaturedEventsByAccessLevel = (accessLevel: AccessLevel): Event[] => {
  return getEventsByAccessLevel(accessLevel).filter(event => event.featured);
};

// Helper function to get upcoming events by access level
export const getUpcomingEventsByAccessLevel = (accessLevel: AccessLevel): Event[] => {
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);
  
  return getEventsByAccessLevel(accessLevel)
    .filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= now && eventDate <= nextWeek;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};