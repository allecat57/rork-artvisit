import { Venue } from "@/types/venue";

export const venues: Venue[] = [
  {
    id: "v1",
    name: "Metropolitan Museum of Art",
    type: "Art Museum",
    description: "One of the world's largest and finest art museums, with a collection spanning 5,000 years of world culture, from prehistory to the present.",
    imageUrl: "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "New York, NY",
    distance: "2.3 mi",
    rating: 4.8,
    openingHours: "10:00 AM - 5:30 PM",
    admission: "$25",
    featured: true,
    category: "museums",
    tags: ["art", "culture", "history", "paintings", "sculptures"],
    coordinates: {
      latitude: 40.7794,
      longitude: -73.9632
    }
  },
  {
    id: "v2",
    name: "Museum of Modern Art",
    type: "Art Museum",
    description: "The Museum of Modern Art (MoMA) is a place that fuels creativity, ignites minds, and provides inspiration with extraordinary exhibitions and collections.",
    imageUrl: "https://images.unsplash.com/photo-1626121496373-8dcc285d8e20?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "New York, NY",
    distance: "3.1 mi",
    rating: 4.7,
    openingHours: "10:30 AM - 5:30 PM",
    admission: "$25",
    featured: true,
    category: "museums",
    tags: ["modern art", "contemporary", "paintings", "design", "architecture"],
    coordinates: {
      latitude: 40.7614,
      longitude: -73.9776
    }
  },
  {
    id: "v3",
    name: "Guggenheim Museum",
    type: "Art Museum",
    description: "An internationally renowned art museum and one of the most significant architectural icons of the 20th century.",
    imageUrl: "https://images.unsplash.com/photo-1626121496373-8dcc285d8e20?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "New York, NY",
    distance: "2.8 mi",
    rating: 4.6,
    openingHours: "11:00 AM - 6:00 PM",
    admission: "$25",
    category: "museums",
    tags: ["art", "architecture", "spiral", "modern", "exhibitions"],
    coordinates: {
      latitude: 40.7829,
      longitude: -73.9589
    }
  },
  {
    id: "v4",
    name: "Whitney Museum of American Art",
    type: "Art Museum",
    description: "The Whitney is dedicated to collecting, preserving, interpreting, and exhibiting American art.",
    imageUrl: "https://images.unsplash.com/photo-1577720580479-7d839d829c73?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "New York, NY",
    distance: "4.2 mi",
    rating: 4.5,
    openingHours: "10:30 AM - 6:00 PM",
    admission: "$25",
    category: "museums",
    tags: ["american art", "contemporary", "whitney biennial", "exhibitions"],
    coordinates: {
      latitude: 40.7396,
      longitude: -74.0089
    }
  },
  {
    id: "v5",
    name: "American Museum of Natural History",
    type: "Natural History Museum",
    description: "One of the world's preeminent scientific and cultural institutions, renowned for its exhibitions and scientific collections.",
    imageUrl: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "New York, NY",
    distance: "1.5 mi",
    rating: 4.7,
    openingHours: "10:00 AM - 5:30 PM",
    admission: "$23",
    featured: true,
    category: "museums",
    tags: ["natural history", "dinosaurs", "planetarium", "science", "fossils"],
    coordinates: {
      latitude: 40.7813,
      longitude: -73.9739
    }
  },
  {
    id: "v6",
    name: "Pace Gallery",
    type: "Art Gallery",
    description: "A leading contemporary art gallery representing many of the most significant international artists and estates of the 20th and 21st centuries.",
    imageUrl: "https://images.unsplash.com/photo-1577720580479-7d839d829c73?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "New York, NY",
    distance: "3.7 mi",
    rating: 4.5,
    openingHours: "10:00 AM - 6:00 PM",
    admission: "Free",
    category: "galleries",
    tags: ["contemporary art", "gallery", "exhibitions", "artists", "free"],
    coordinates: {
      latitude: 40.7478,
      longitude: -74.0047
    }
  },
  {
    id: "v7",
    name: "Gagosian Gallery",
    type: "Art Gallery",
    description: "A global network of art galleries specializing in modern and contemporary art with seventeen exhibition spaces.",
    imageUrl: "https://images.unsplash.com/photo-1577720580479-7d839d829c73?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "New York, NY",
    distance: "3.9 mi",
    rating: 4.6,
    openingHours: "10:00 AM - 6:00 PM",
    admission: "Free",
    featured: true,
    category: "galleries",
    tags: ["contemporary art", "modern art", "gallery", "exhibitions", "free"],
    coordinates: {
      latitude: 40.7731,
      longitude: -73.9712
    }
  },
  {
    id: "v8",
    name: "The Frick Collection",
    type: "Art Museum",
    description: "An art museum housed in the former residence of industrialist Henry Clay Frick, featuring Old Master paintings and European decorative arts.",
    imageUrl: "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "New York, NY",
    distance: "2.6 mi",
    rating: 4.8,
    openingHours: "10:00 AM - 6:00 PM",
    admission: "$22",
    category: "museums",
    tags: ["old masters", "european art", "decorative arts", "mansion", "historic"],
    coordinates: {
      latitude: 40.7713,
      longitude: -73.9672
    }
  },
  {
    id: "v9",
    name: "Brooklyn Museum",
    type: "Art Museum",
    description: "One of the oldest and largest art museums in the United States, with a collection including ancient Egyptian masterpieces and contemporary art.",
    imageUrl: "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "Brooklyn, NY",
    distance: "7.8 mi",
    rating: 4.6,
    openingHours: "11:00 AM - 6:00 PM",
    admission: "$16",
    category: "museums",
    tags: ["egyptian art", "contemporary art", "brooklyn", "diverse collection"],
    coordinates: {
      latitude: 40.6712,
      longitude: -73.9636
    }
  },
  {
    id: "v10",
    name: "The Morgan Library & Museum",
    type: "Library & Museum",
    description: "A museum and research library that houses an extraordinary collection of rare books and manuscripts.",
    imageUrl: "https://images.unsplash.com/photo-1558424087-896a99907152?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "New York, NY",
    distance: "3.2 mi",
    rating: 4.7,
    openingHours: "10:30 AM - 5:00 PM",
    admission: "$22",
    category: "historical",
    tags: ["rare books", "manuscripts", "library", "historical", "literature"],
    coordinates: {
      latitude: 40.7492,
      longitude: -73.9819
    }
  },
  {
    id: "v11",
    name: "New Museum",
    type: "Contemporary Art Museum",
    description: "A leading destination for new art and new ideas, dedicated to presenting contemporary art from around the world.",
    imageUrl: "https://images.unsplash.com/photo-1626121496373-8dcc285d8e20?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "New York, NY",
    distance: "4.5 mi",
    rating: 4.4,
    openingHours: "11:00 AM - 6:00 PM",
    admission: "$18",
    category: "museums",
    tags: ["contemporary art", "new art", "emerging artists", "innovative"],
    coordinates: {
      latitude: 40.7223,
      longitude: -73.9928
    }
  },
  {
    id: "v12",
    name: "The Cloisters",
    type: "Medieval Art Museum",
    description: "A branch of The Metropolitan Museum of Art devoted to the art and architecture of medieval Europe.",
    imageUrl: "https://images.unsplash.com/photo-1558424087-896a99907152?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "New York, NY",
    distance: "9.2 mi",
    rating: 4.8,
    openingHours: "10:00 AM - 5:15 PM",
    admission: "$25",
    category: "historical",
    tags: ["medieval art", "architecture", "gardens", "manuscripts", "tapestries"],
    coordinates: {
      latitude: 40.8648,
      longitude: -73.9317
    }
  },
  {
    id: "v13",
    name: "International Center of Photography",
    type: "Photography Museum",
    description: "The world's leading institution dedicated to photography and visual culture.",
    imageUrl: "https://images.unsplash.com/photo-1545033131-485ea67fd7c3?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "New York, NY",
    distance: "4.1 mi",
    rating: 4.5,
    openingHours: "11:00 AM - 7:00 PM",
    admission: "$14",
    category: "exhibitions",
    tags: ["photography", "visual culture", "exhibitions", "contemporary"],
    coordinates: {
      latitude: 40.7182,
      longitude: -73.9962
    }
  },
  {
    id: "v14",
    name: "The Jewish Museum",
    type: "Cultural Museum",
    description: "An art museum and cultural institution dedicated to the enjoyment, understanding, and preservation of Jewish art and culture.",
    imageUrl: "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "New York, NY",
    distance: "2.4 mi",
    rating: 4.6,
    openingHours: "11:00 AM - 5:30 PM",
    admission: "$18",
    category: "cultural",
    tags: ["jewish culture", "art", "history", "cultural heritage", "exhibitions"],
    coordinates: {
      latitude: 40.7852,
      longitude: -73.9573
    }
  },
  {
    id: "v15",
    name: "Cooper Hewitt, Smithsonian Design Museum",
    type: "Design Museum",
    description: "The only museum in the United States devoted exclusively to historical and contemporary design.",
    imageUrl: "https://images.unsplash.com/photo-1545033131-485ea67fd7c3?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "New York, NY",
    distance: "2.1 mi",
    rating: 4.5,
    openingHours: "10:00 AM - 6:00 PM",
    admission: "$16",
    category: "exhibitions",
    tags: ["design", "smithsonian", "contemporary design", "historical design"],
    coordinates: {
      latitude: 40.7841,
      longitude: -73.9582
    }
  }
];