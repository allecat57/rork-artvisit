import { Product } from "@/types/product";

export const products: Product[] = [
  {
    id: "p1",
    title: "Abstract Harmony",
    artist: "Elena Mikhailova",
    description: "A vibrant exploration of color and form, this abstract piece invites viewers to find their own meaning within its dynamic composition. Layers of acrylic paint create depth and texture, while bold brushstrokes convey a sense of movement and energy.",
    price: 1200,
    imageUrl: "https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?q=80&w=1000",
    gallery: "Metropolitan Museum of Art",
    medium: "Acrylic on Canvas",
    dimensions: "36\" x 48\"",
    year: "2023",
    inStock: true,
    category: "Abstract",
    featured: true
  },
  {
    id: "p2",
    title: "Urban Reflections",
    artist: "Marcus Chen",
    description: "This cityscape captures the essence of urban life through reflections in rain-soaked streets. The interplay of light and shadow creates a moody atmosphere, while careful attention to architectural details grounds the piece in reality.",
    price: 950,
    imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1000",
    gallery: "Museum of Modern Art",
    medium: "Oil on Canvas",
    dimensions: "24\" x 36\"",
    year: "2022",
    inStock: true,
    category: "Landscape",
    featured: false
  },
  {
    id: "p3",
    title: "Serenity in Blue",
    artist: "Sophia Williams",
    description: "A meditative seascape that evokes a sense of calm and tranquility. The artist's masterful use of blue tones creates depth and movement in the water, while the minimal horizon line draws the viewer's gaze into the distance.",
    price: 850,
    imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=1000",
    gallery: "Guggenheim Museum",
    medium: "Watercolor on Paper",
    dimensions: "18\" x 24\"",
    year: "2023",
    inStock: true,
    category: "Seascape",
    featured: true
  },
  {
    id: "p4",
    title: "Fragmented Memory",
    artist: "David Alvarez",
    description: "This mixed media piece explores the nature of memory through fragmented images and textures. Layers of collage, paint, and photographic elements create a rich tapestry of visual information that rewards repeated viewing.",
    price: 1400,
    imageUrl: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=1000",
    gallery: "Whitney Museum of American Art",
    medium: "Mixed Media",
    dimensions: "30\" x 40\"",
    year: "2021",
    inStock: false,
    category: "Mixed Media",
    featured: false
  },
  {
    id: "p5",
    title: "Golden Autumn",
    artist: "Emma Thompson",
    description: "A celebration of autumn's golden hues, this landscape captures the warmth and richness of the season. Impressionistic brushwork creates a sense of movement in the foliage, while careful composition guides the viewer through the scene.",
    price: 1100,
    imageUrl: "https://images.unsplash.com/photo-1579762593175-20226054cad0?q=80&w=1000",
    gallery: "National Gallery of Art",
    medium: "Oil on Canvas",
    dimensions: "24\" x 30\"",
    year: "2022",
    inStock: true,
    category: "Landscape",
    featured: false
  },
  {
    id: "p6",
    title: "Geometric Tension",
    artist: "Robert Kim",
    description: "This bold geometric abstraction explores the tension between order and chaos. Precise lines and shapes create a structured composition, while unexpected color relationships and subtle texture variations add complexity and interest.",
    price: 1300,
    imageUrl: "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=1000",
    gallery: "Museum of Modern Art",
    medium: "Acrylic on Canvas",
    dimensions: "36\" x 36\"",
    year: "2023",
    inStock: true,
    category: "Abstract",
    featured: true
  },
  {
    id: "p7",
    title: "Whispers of Light",
    artist: "Nadia Johnson",
    description: "This ethereal landscape captures the magical quality of light filtering through morning mist. Soft edges and a limited palette create a dreamlike atmosphere, inviting the viewer to pause and contemplate the quiet beauty of nature.",
    price: 980,
    imageUrl: "https://images.unsplash.com/photo-1578301978018-3c2583353a69?q=80&w=1000",
    gallery: "The Art Institute of Chicago",
    medium: "Oil on Linen",
    dimensions: "20\" x 30\"",
    year: "2022",
    inStock: true,
    category: "Landscape",
    featured: false
  },
  {
    id: "p8",
    title: "Urban Rhythm",
    artist: "James Wilson",
    description: "A dynamic street scene that captures the energy and rhythm of city life. Bold colors and gestural brushwork convey movement and sound, while architectural elements provide structure and context.",
    price: 1150,
    imageUrl: "https://images.unsplash.com/photo-1578301978018-b4e9d3001ea9?q=80&w=1000",
    gallery: "Museum of Fine Arts",
    medium: "Acrylic on Canvas",
    dimensions: "30\" x 40\"",
    year: "2023",
    inStock: true,
    category: "Urban",
    featured: false
  },
  {
    id: "p9",
    title: "Botanical Study No. 3",
    artist: "Clara Martinez",
    description: "Part of a series exploring botanical forms, this detailed study combines scientific observation with artistic interpretation. Delicate linework and subtle washes of color highlight the intricate structures and patterns found in nature.",
    price: 750,
    imageUrl: "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=1000",
    gallery: "Metropolitan Museum of Art",
    medium: "Ink and Watercolor on Paper",
    dimensions: "16\" x 20\"",
    year: "2022",
    inStock: true,
    category: "Botanical",
    featured: false
  },
  {
    id: "p10",
    title: "Celestial Dreams",
    artist: "Michael Zhang",
    description: "This cosmic-inspired abstract piece explores the vastness of space and the human imagination. Deep blues and purples create a sense of infinite depth, while metallic accents suggest distant stars and celestial bodies.",
    price: 1500,
    imageUrl: "https://images.unsplash.com/photo-1578301978162-38d0ec0363ae?q=80&w=1000",
    gallery: "The Getty Center",
    medium: "Mixed Media on Canvas",
    dimensions: "40\" x 60\"",
    year: "2023",
    inStock: true,
    category: "Abstract",
    featured: true
  }
];

export const productCategories = [
  "All",
  "Abstract",
  "Landscape",
  "Seascape",
  "Urban",
  "Botanical",
  "Mixed Media"
];

export const getProductsByCategory = (category: string) => {
  if (category === "All") return products;
  return products.filter(product => product.category === category);
};

export const searchProducts = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(
    product => 
      product.title.toLowerCase().includes(lowercaseQuery) ||
      product.artist.toLowerCase().includes(lowercaseQuery) ||
      product.gallery.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery)
  );
};

// Export as part of mocks object to match import in shop.tsx
export const mocks = {
  products,
  productCategories,
  getProductsByCategory,
  searchProducts
};