import { Venue } from "@/types/venue";

export const venues: Venue[] = [
  {
    id: "1",
    name: "Metropolitan Museum of Art",
    type: "Art Museum",
    description: "One of the world's largest and most comprehensive art museums, featuring works spanning 5,000 years of art from every part of the globe.",
    imageUrl: "https://images.unsplash.com/photo-1566127992631-137a642a90f4?w=800&h=600&fit=crop",
    location: "New York, NY",
    distance: "0.5 miles",
    rating: 4.8,
    openingHours: "10:00 AM - 5:30 PM",
    admission: "$30",
    featured: true,
    category: "art",
    tags: ["art", "history", "culture", "paintings", "sculptures"],
    phone: "+1 (212) 535-7710",
    website: "https://www.metmuseum.org",
    address: "1000 Fifth Avenue, New York, NY 10028",
    cost: "$30 per person",
    coordinates: {
      latitude: 40.7794,
      longitude: -73.9632
    }
  },
  {
    id: "2", 
    name: "Museum of Modern Art",
    type: "Modern Art Museum",
    description: "The Museum of Modern Art (MoMA) is an art museum located in Midtown Manhattan, New York City, on 53rd Street between Fifth and Sixth Avenues.",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
    location: "New York, NY",
    distance: "1.2 miles",
    rating: 4.7,
    openingHours: "10:30 AM - 5:30 PM",
    admission: "$25",
    featured: false,
    category: "art",
    tags: ["modern art", "contemporary", "paintings", "design"],
    phone: "+1 (212) 708-9400",
    website: "https://www.moma.org",
    address: "11 W 53rd St, New York, NY 10019",
    cost: "$25 per person",
    coordinates: {
      latitude: 40.7614,
      longitude: -73.9776
    }
  },
  {
    id: "3",
    name: "Natural History Museum",
    type: "Natural History Museum", 
    description: "The American Museum of Natural History is a natural history museum on the Upper West Side of Manhattan in New York City.",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
    location: "New York, NY",
    distance: "2.1 miles",
    rating: 4.6,
    openingHours: "10:00 AM - 5:45 PM",
    admission: "$28",
    featured: true,
    category: "science",
    tags: ["natural history", "dinosaurs", "science", "planetarium"],
    phone: "+1 (212) 769-5100",
    website: "https://www.amnh.org",
    address: "200 Central Park West, New York, NY 10024",
    cost: "$28 per person",
    coordinates: {
      latitude: 40.7813,
      longitude: -73.9740
    }
  },
  {
    id: "4",
    name: "Guggenheim Museum",
    type: "Art Museum",
    description: "The Solomon R. Guggenheim Museum, often referred to as The Guggenheim, is an art museum located on the Upper East Side of Manhattan.",
    imageUrl: "https://images.unsplash.com/photo-1566127992631-137a642a90f4?w=800&h=600&fit=crop",
    location: "New York, NY", 
    distance: "0.8 miles",
    rating: 4.5,
    openingHours: "11:00 AM - 6:00 PM",
    admission: "$25",
    featured: false,
    category: "art",
    tags: ["art", "architecture", "modern", "spiral"],
    phone: "+1 (212) 423-3500",
    website: "https://www.guggenheim.org",
    address: "1071 5th Ave, New York, NY 10128",
    cost: "$25 per person",
    coordinates: {
      latitude: 40.7829,
      longitude: -73.9589
    }
  },
  {
    id: "5",
    name: "Brooklyn Museum",
    type: "Art Museum",
    description: "The Brooklyn Museum is an art museum located in the New York City borough of Brooklyn. At 560,000 square feet, the museum is New York City's second largest.",
    imageUrl: "https://images.unsplash.com/photo-1566127992631-137a642a90f4?w=800&h=600&fit=crop",
    location: "Brooklyn, NY",
    distance: "5.2 miles", 
    rating: 4.4,
    openingHours: "11:00 AM - 6:00 PM",
    admission: "$20",
    featured: false,
    category: "art",
    tags: ["art", "culture", "brooklyn", "diverse"],
    phone: "+1 (718) 638-5000",
    website: "https://www.brooklynmuseum.org",
    address: "200 Eastern Pkwy, Brooklyn, NY 11238",
    cost: "$20 per person",
    coordinates: {
      latitude: 40.6712,
      longitude: -73.9636
    }
  },
  {
    id: "6",
    name: "Whitney Museum",
    type: "American Art Museum",
    description: "The Whitney Museum of American Art, known informally as the Whitney, is an art museum in the Meatpacking District and West Village neighborhoods of Manhattan.",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
    location: "New York, NY",
    distance: "3.1 miles",
    rating: 4.3,
    openingHours: "10:30 AM - 6:00 PM", 
    admission: "$25",
    featured: false,
    category: "art",
    tags: ["american art", "contemporary", "whitney biennial"],
    phone: "+1 (212) 570-3600",
    website: "https://whitney.org",
    address: "99 Gansevoort St, New York, NY 10014",
    cost: "$25 per person",
    coordinates: {
      latitude: 40.7396,
      longitude: -74.0089
    }
  }
];

export const featuredVenues = venues.filter(venue => venue.featured);

export const getVenueById = (id: string): Venue | undefined => {
  return venues.find(venue => venue.id === id);
};

export const getVenuesByCategory = (category: string): Venue[] => {
  return venues.filter(venue => venue.category === category);
};

export const searchVenues = (query: string): Venue[] => {
  const lowercaseQuery = query.toLowerCase();
  return venues.filter(venue => 
    venue.name.toLowerCase().includes(lowercaseQuery) ||
    venue.type.toLowerCase().includes(lowercaseQuery) ||
    venue.description.toLowerCase().includes(lowercaseQuery) ||
    venue.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};