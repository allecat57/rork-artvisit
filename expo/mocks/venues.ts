import { Venue } from "@/types/venue";

// Mock venues removed - using only TimeFrame API data
export const venues: Venue[] = [];

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