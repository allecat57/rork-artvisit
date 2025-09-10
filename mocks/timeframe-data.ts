// Mock data that simulates what the TIMEFRAME API would return
// This helps with development and testing when the API is not available

export const mockTimeFrameGalleries = [
  {
    id: 1,
    name: "Modern Art Collective",
    description: "Contemporary art gallery featuring emerging artists",
    location: "New York, NY",
    coordinates: {
      latitude: 40.7128,
      longitude: -74.0060
    },
    address: "123 Broadway, New York, NY 10001",
    city: "New York",
    state: "NY",
    country: "USA",
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
    coordinates: {
      latitude: 42.3601,
      longitude: -71.0589
    },
    address: "456 Newbury Street, Boston, MA 02115",
    city: "Boston",
    state: "MA",
    country: "USA",
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
    coordinates: {
      latitude: 34.0522,
      longitude: -118.2437
    },
    address: "789 Melrose Avenue, Los Angeles, CA 90046",
    city: "Los Angeles",
    state: "CA",
    country: "USA",
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
  },
  {
    id: 4,
    name: "Classical Arts Museum",
    description: "Dedicated to preserving and showcasing classical art from ancient civilizations",
    location: "Washington, DC",
    coordinates: {
      latitude: 38.9072,
      longitude: -77.0369
    },
    address: "1000 Constitution Ave NW, Washington, DC 20560",
    city: "Washington",
    state: "DC",
    country: "USA",
    established: 1962,
    artworks: [
      {
        id: 401,
        name: "Ancient Greek Vase",
        description: "Authentic ancient Greek pottery with intricate geometric patterns",
        price: 5000,
        image_url: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        artist_name: "Unknown Ancient Artist",
        medium: "Ceramic",
        year: -450,
        dimensions: "12 x 8 inches",
        category: "Ancient Art",
        tags: ["ancient", "greek", "pottery"],
        available: true
      },
      {
        id: 402,
        name: "Roman Marble Sculpture",
        description: "Classical Roman sculpture depicting mythological figures",
        price: 8500,
        image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        artist_name: "Roman Artisan",
        medium: "Marble",
        year: 150,
        dimensions: "36 x 18 x 12 inches",
        category: "Classical Sculpture",
        tags: ["roman", "marble", "sculpture"],
        available: true
      }
    ]
  },
  {
    id: 5,
    name: "Photography Center",
    description: "Contemporary photography gallery featuring both emerging and established photographers",
    location: "San Francisco, CA",
    coordinates: {
      latitude: 37.7749,
      longitude: -122.4194
    },
    address: "555 Mission Street, San Francisco, CA 94105",
    city: "San Francisco",
    state: "CA",
    country: "USA",
    established: 2015,
    artworks: [
      {
        id: 501,
        name: "Urban Landscapes Series",
        description: "Black and white photography capturing the essence of modern city life",
        price: 750,
        image_url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        artist_name: "Jennifer Walsh",
        medium: "Digital Photography",
        year: 2024,
        dimensions: "16 x 20 inches",
        category: "Photography",
        tags: ["photography", "urban", "black and white"],
        available: true
      },
      {
        id: 502,
        name: "Nature's Patterns",
        description: "Macro photography exploring the intricate patterns found in nature",
        price: 650,
        image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        artist_name: "Michael Torres",
        medium: "Color Photography",
        year: 2024,
        dimensions: "12 x 18 inches",
        category: "Nature Photography",
        tags: ["photography", "nature", "macro"],
        available: true
      }
    ]
  },
  {
    id: 6,
    name: "Sculpture Garden Gallery",
    description: "Indoor and outdoor gallery space dedicated to contemporary sculpture",
    location: "Seattle, WA",
    coordinates: {
      latitude: 47.6062,
      longitude: -122.3321
    },
    address: "200 Pine Street, Seattle, WA 98101",
    city: "Seattle",
    state: "WA",
    country: "USA",
    established: 2010,
    artworks: [
      {
        id: 601,
        name: "Metal Flow",
        description: "Large-scale metal sculpture exploring movement and fluidity",
        price: 12000,
        image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        artist_name: "Carlos Mendez",
        medium: "Steel and Bronze",
        year: 2023,
        dimensions: "72 x 48 x 36 inches",
        category: "Contemporary Sculpture",
        tags: ["sculpture", "metal", "contemporary"],
        available: true
      },
      {
        id: 602,
        name: "Organic Forms",
        description: "Wood sculpture inspired by natural growth patterns",
        price: 3500,
        image_url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        artist_name: "Lisa Park",
        medium: "Reclaimed Wood",
        year: 2024,
        dimensions: "48 x 24 x 18 inches",
        category: "Wood Sculpture",
        tags: ["sculpture", "wood", "organic"],
        available: true
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