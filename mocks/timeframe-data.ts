// Mock data that simulates what the TIMEFRAME API would return
// This helps with development and testing when the API is not available

export const mockTimeFrameGalleries = [
  {
    id: 1,
    name: "Modern Art Collective",
    description: "Contemporary art gallery featuring emerging artists",
    location: "New York, NY",
    established: 2020,
    artworks: [
      {
        id: 101,
        name: "Digital Dreams",
        description: "A vibrant digital artwork exploring the intersection of technology and human emotion",
        price: 1200,
        image_url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        artist_name: "Alex Chen",
        medium: "Digital Art on Canvas",
        year: 2024,
        dimensions: "24 x 36 inches",
        category: "Digital Art",
        tags: ["digital", "contemporary", "technology"],
        available: true
      },
      {
        id: 102,
        name: "Urban Reflections",
        description: "Mixed media piece capturing the essence of city life",
        price: 850,
        image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        artist_name: "Maria Rodriguez",
        medium: "Mixed Media",
        year: 2024,
        dimensions: "20 x 30 inches",
        category: "Contemporary Art",
        tags: ["urban", "mixed media", "city"],
        available: true
      }
    ]
  },
  {
    id: 2,
    name: "Heritage Gallery",
    description: "Showcasing traditional and classical art forms",
    location: "Boston, MA",
    established: 1985,
    artworks: [
      {
        id: 201,
        name: "Classical Portrait Study",
        description: "Oil painting in the tradition of Renaissance masters",
        price: 2500,
        image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        artist_name: "Robert Thompson",
        medium: "Oil on Canvas",
        year: 2023,
        dimensions: "18 x 24 inches",
        category: "Renaissance",
        tags: ["classical", "portrait", "oil painting"],
        available: true
      },
      {
        id: 202,
        name: "Geometric Harmony",
        description: "Abstract geometric composition with bold colors",
        price: 1800,
        image_url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        artist_name: "Sarah Kim",
        medium: "Acrylic on Canvas",
        year: 2024,
        dimensions: "30 x 40 inches",
        category: "Abstract Art",
        tags: ["geometric", "abstract", "colorful"],
        available: true
      }
    ]
  },
  {
    id: 3,
    name: "Avant-Garde Studio",
    description: "Experimental and cutting-edge contemporary art",
    location: "Los Angeles, CA",
    established: 2018,
    artworks: [
      {
        id: 301,
        name: "Surreal Landscape",
        description: "Dreamlike landscape exploring subconscious imagery",
        price: 1500,
        image_url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        artist_name: "David Park",
        medium: "Digital Print",
        year: 2024,
        dimensions: "22 x 28 inches",
        category: "Surrealism",
        tags: ["surreal", "landscape", "dreams"],
        available: true
      },
      {
        id: 302,
        name: "Cubist Still Life",
        description: "Deconstructed still life in cubist style",
        price: 1100,
        image_url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        artist_name: "Elena Vasquez",
        medium: "Oil on Canvas",
        year: 2023,
        dimensions: "16 x 20 inches",
        category: "Cubism",
        tags: ["cubist", "still life", "geometric"],
        available: false // This one is sold
      }
    ]
  }
];

// Mock API responses
export const mockApiResponses = {
  galleries: {
    success: true,
    data: mockTimeFrameGalleries,
    count: mockTimeFrameGalleries.length
  },
  
  getGalleryArtworks: (galleryId: number) => {
    const gallery = mockTimeFrameGalleries.find(g => g.id === galleryId);
    return {
      success: true,
      data: gallery?.artworks || [],
      count: gallery?.artworks.length || 0
    };
  }
};