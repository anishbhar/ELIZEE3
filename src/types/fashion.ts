export interface FashionItem {
  id: string;
  name: string;
  gender: 'men' | 'women' | 'unisex';
  category: string;
  subCategory?: string;
  price: number;
  color: string;
  colorHex: string;
  style: 'Minimalist' | 'Streetwear' | 'Casual' | 'Formal' | 'Old Money' | 'Traditional' | 'Party';
  occasion: 'College' | 'Work/Office' | 'Casual Day Out' | 'Date Night' | 'Wedding/Celebration' | 'Travel';
  image: string;
  description: string;
  material: string;
  pairingTips: string[];
  rating: number;
  isTrending?: boolean;
  isFeatured?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  age: number;
  gender: 'men' | 'women' | 'all';
  preferredStyle: string;
  favouriteColours: string[];
  fashionPreferences: string[];
  preferredOccasions: string[];
  comfortPreferences: string;
  bio: string;
  joinedDate: string;
}

export interface WardrobeItem {
  id: string;
  userId: string;
  product: FashionItem;
  addedAt: string;
  notes?: string;
}

export interface SavedOutfit {
  id: string;
  userId: string;
  title: string;
  occasion: string;
  items: FashionItem[];
  createdAt: string;
  stylistNotes?: string;
}

export interface SearchHistoryItem {
  id: string;
  userId: string;
  query: string;
  categoryDetected?: string;
  type: 'text' | 'image' | 'camera';
  timestamp: string;
}

export interface OutfitPieceRecommendation {
  category: string;
  description: string;
  suggestedColor?: string;
  matchingCatalogItem?: FashionItem;
}

export interface StylistOutfitSuggestion {
  name: string;
  occasion: string;
  vibe: string;
  explanation: string;
  pieces: OutfitPieceRecommendation[];
  stylingTips: string[];
  colorPalette: string[];
}

export interface CameraStylingResult {
  identifiedItems: string[];
  vibe: string;
  matchingItems: string[];
  suitableAccessories: string[];
  alternativeCombinations: string[];
  colorCombinations: string[];
  stylingImprovements: string[];
  catalogRecommendations: FashionItem[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'stylist';
  text: string;
  timestamp: string;
  outfits?: StylistOutfitSuggestion[];
  analysis?: CameraStylingResult;
  attachedImage?: string;
}

export interface ScheduledOutfit {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  title: string;
  occasion: string;
  items: FashionItem[];
  notes?: string;
  createdAt: string;
}

