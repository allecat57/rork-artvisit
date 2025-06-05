import { Event, EventType, AccessLevel } from "@/types/event";

// Mock data for events
export const events: Event[] = [
  {
    id: "event1",
    title: "Modern Art Exhibition Opening",
    description: "Be among the first to experience our new modern art exhibition featuring works from emerging artists around the world.",
    date: "2023-11-15T18:00:00",
    endDate: "2023-11-15T21:00:00",
    location: "Metropolitan Gallery",
    address: "123 Art Avenue, New York, NY",
    image: "https://images.unsplash.com/photo-1594784237741-f9db8e1d3d65?q=80&w=1000&auto=format&fit=crop",
    type: EventType.EXHIBITION_OPENING,
    accessLevel: AccessLevel.ESSENTIAL,
    capacity: 150,
    remainingSpots: 42,
    price: 0,
    featured: true,
    artists: ["Jane Smith", "Robert Chen", "Maria Garcia"],
    tags: ["modern", "contemporary", "emerging artists"]
  },
  {
    id: "event2",
    title: "Sculpture Workshop with Thomas Moore",
    description: "Join renowned sculptor Thomas Moore for an interactive workshop on contemporary sculpture techniques.",
    date: "2023-11-20T10:00:00",
    endDate: "2023-11-20T15:00:00",
    location: "Artisan Studio",
    address: "456 Craft Street, Brooklyn, NY",
    image: "https://images.unsplash.com/photo-1576769267415-9642010a4f34?q=80&w=1000&auto=format&fit=crop",
    type: EventType.WORKSHOP,
    accessLevel: AccessLevel.EXPLORER,
    capacity: 25,
    remainingSpots: 8,
    price: 75,
    featured: false,
    artists: ["Thomas Moore"],
    tags: ["sculpture", "workshop", "hands-on"]
  },
  {
    id: "event3",
    title: "VIP Preview: Renaissance Masters Collection",
    description: "An exclusive preview of our Renaissance Masters Collection before it opens to the general public. Includes wine reception and curator's tour.",
    date: "2023-11-25T19:00:00",
    endDate: "2023-11-25T22:00:00",
    location: "Heritage Museum",
    address: "789 History Boulevard, Manhattan, NY",
    image: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?q=80&w=1000&auto=format&fit=crop",
    type: EventType.VIP_PREVIEW,
    accessLevel: AccessLevel.COLLECTOR,
    capacity: 50,
    remainingSpots: 15,
    price: 0,
    featured: true,
    artists: ["Various Renaissance Masters"],
    tags: ["renaissance", "classical", "exclusive"]
  },
  {
    id: "event4",
    title: "Artist Talk: Contemporary Photography",
    description: "Join us for an evening with award-winning photographers discussing their work and the future of photography as an art form.",
    date: "2023-12-05T18:30:00",
    endDate: "2023-12-05T20:30:00",
    location: "Lens Gallery",
    address: "321 Shutter Street, Queens, NY",
    image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?q=80&w=1000&auto=format&fit=crop",
    type: EventType.ARTIST_TALK,
    accessLevel: AccessLevel.ESSENTIAL,
    capacity: 100,
    remainingSpots: 68,
    price: 15,
    featured: false,
    artists: ["Elena Petrova", "James Wilson"],
    tags: ["photography", "discussion", "contemporary"]
  },
  {
    id: "event5",
    title: "Auction Preview: Modern Masters",
    description: "Preview the upcoming auction of modern masterpieces. Art specialists will be available to answer questions.",
    date: "2023-12-10T11:00:00",
    endDate: "2023-12-10T16:00:00",
    location: "Prestige Auction House",
    address: "555 Luxury Lane, Manhattan, NY",
    image: "https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?q=80&w=1000&auto=format&fit=crop",
    type: EventType.AUCTION_PREVIEW,
    accessLevel: AccessLevel.EXPLORER,
    capacity: 75,
    remainingSpots: 30,
    price: 0,
    featured: true,
    artists: ["Various Modern Masters"],
    tags: ["auction", "modern", "investment"]
  },
  {
    id: "event6",
    title: "Private Gallery Opening: Abstract Expressions",
    description: "An intimate evening with the artists behind our new abstract expressionism exhibition. Includes champagne reception and private tour.",
    date: "2023-12-15T20:00:00",
    endDate: "2023-12-15T23:00:00",
    location: "Elite Gallery",
    address: "888 Exclusive Avenue, Manhattan, NY",
    image: "https://images.unsplash.com/photo-1577720643272-265f09367456?q=80&w=1000&auto=format&fit=crop",
    type: EventType.PRIVATE_OPENING,
    accessLevel: AccessLevel.COLLECTOR,
    capacity: 30,
    remainingSpots: 5,
    price: 0,
    featured: true,
    artists: ["Alexandra Kim", "David Okafor", "Luisa Mendez"],
    tags: ["abstract", "expressionism", "exclusive"]
  },
  {
    id: "event7",
    title: "Family Art Day: Create Together",
    description: "A fun-filled day of art activities for the whole family. Create collaborative art pieces and learn new techniques.",
    date: "2023-12-17T10:00:00",
    endDate: "2023-12-17T15:00:00",
    location: "Community Art Center",
    address: "123 Family Street, Brooklyn, NY",
    image: "https://images.unsplash.com/photo-1607457561901-e6ec3a6d16cf?q=80&w=1000&auto=format&fit=crop",
    type: EventType.FAMILY_EVENT,
    accessLevel: AccessLevel.ESSENTIAL,
    capacity: 200,
    remainingSpots: 120,
    price: 25,
    featured: false,
    artists: ["Various Teaching Artists"],
    tags: ["family", "interactive", "education"]
  },
  {
    id: "event8",
    title: "Curator's Tour: Impressionist Collection",
    description: "Join our head curator for an in-depth tour of our impressionist collection, with insights into the artists' techniques and inspirations.",
    date: "2023-12-20T14:00:00",
    endDate: "2023-12-20T16:00:00",
    location: "National Gallery",
    address: "456 Museum Row, Manhattan, NY",
    image: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=1000&auto=format&fit=crop",
    type: EventType.CURATOR_TOUR,
    accessLevel: AccessLevel.EXPLORER,
    capacity: 20,
    remainingSpots: 8,
    price: 30,
    featured: false,
    artists: ["Impressionist Masters"],
    tags: ["impressionism", "tour", "educational"]
  },
  {
    id: "event9",
    title: "Collectors' Dinner with Featured Artist",
    description: "An exclusive dinner with our featured artist of the month. Discuss their work in an intimate setting and get first access to new pieces.",
    date: "2023-12-22T19:00:00",
    endDate: "2023-12-22T22:00:00",
    location: "Gourmet Gallery Restaurant",
    address: "777 Fine Dining Street, Manhattan, NY",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop",
    type: EventType.COLLECTOR_DINNER,
    accessLevel: AccessLevel.COLLECTOR,
    capacity: 12,
    remainingSpots: 2,
    price: 250,
    featured: true,
    artists: ["Isabella Montenegro"],
    tags: ["exclusive", "dinner", "networking"]
  },
  {
    id: "event10",
    title: "New Year's Art Gala",
    description: "Ring in the New Year surrounded by art and fellow art enthusiasts. Featuring live performances, art installations, and champagne toast.",
    date: "2023-12-31T21:00:00",
    endDate: "2024-01-01T01:00:00",
    location: "Grand Art Hall",
    address: "999 Celebration Plaza, Manhattan, NY",
    image: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=1000&auto=format&fit=crop",
    type: EventType.GALA,
    accessLevel: AccessLevel.EXPLORER,
    capacity: 300,
    remainingSpots: 75,
    price: 150,
    featured: true,
    artists: ["Various Artists and Performers"],
    tags: ["gala", "celebration", "new year"]
  },
  {
    id: "event11",
    title: "Art Acquisition Committee Meeting",
    description: "Join the museum's acquisition committee to review and discuss potential new additions to our permanent collection.",
    date: "2024-01-10T10:00:00",
    endDate: "2024-01-10T12:00:00",
    location: "Museum Board Room",
    address: "111 Museum Drive, Manhattan, NY",
    image: "https://images.unsplash.com/photo-1551966775-a4ddc8df052b?q=80&w=1000&auto=format&fit=crop",
    type: EventType.COMMITTEE_MEETING,
    accessLevel: AccessLevel.COLLECTOR,
    capacity: 15,
    remainingSpots: 3,
    price: 0,
    featured: false,
    artists: ["N/A"],
    tags: ["acquisition", "committee", "exclusive"]
  },
  {
    id: "event12",
    title: "Street Art Walking Tour",
    description: "Explore the vibrant street art scene with our expert guide. Learn about the artists, techniques, and stories behind the murals.",
    date: "2024-01-15T13:00:00",
    endDate: "2024-01-15T15:30:00",
    location: "Urban Art District",
    address: "Start at 222 Graffiti Street, Brooklyn, NY",
    image: "https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?q=80&w=1000&auto=format&fit=crop",
    type: EventType.WALKING_TOUR,
    accessLevel: AccessLevel.ESSENTIAL,
    capacity: 30,
    remainingSpots: 22,
    price: 25,
    featured: false,
    artists: ["Various Street Artists"],
    tags: ["street art", "walking tour", "urban"]
  }
];

// Helper function to get events by access level
export const getEventsByAccessLevel = (accessLevel: AccessLevel): Event[] => {
  // If access level is COLLECTOR, return all events
  if (accessLevel === AccessLevel.COLLECTOR) {
    return events;
  }
  
  // If access level is EXPLORER, return EXPLORER and ESSENTIAL events
  if (accessLevel === AccessLevel.EXPLORER) {
    return events.filter(event => 
      event.accessLevel === AccessLevel.EXPLORER || 
      event.accessLevel === AccessLevel.ESSENTIAL
    );
  }
  
  // If access level is ESSENTIAL, return only ESSENTIAL events
  if (accessLevel === AccessLevel.ESSENTIAL) {
    return events.filter(event => event.accessLevel === AccessLevel.ESSENTIAL);
  }
  
  // If no subscription (FREE), return no events
  return [];
};

// Helper function to get featured events by access level
export const getFeaturedEventsByAccessLevel = (accessLevel: AccessLevel): Event[] => {
  const accessibleEvents = getEventsByAccessLevel(accessLevel);
  return accessibleEvents.filter(event => event.featured);
};

// Helper function to get upcoming events by access level
export const getUpcomingEventsByAccessLevel = (accessLevel: AccessLevel): Event[] => {
  const accessibleEvents = getEventsByAccessLevel(accessLevel);
  const now = new Date();
  
  return accessibleEvents
    .filter(event => new Date(event.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};