import fs from 'fs';
import path from 'path';
import { FashionItem, UserProfile, WardrobeItem, SavedOutfit, SearchHistoryItem, ScheduledOutfit } from './types.ts';
import { FASHION_CATALOG } from './catalog.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

interface StoreData {
  users: UserProfile[];
  wardrobe: WardrobeItem[];
  outfits: SavedOutfit[];
  searchHistory: SearchHistoryItem[];
  schedule: ScheduledOutfit[];
}

const DEFAULT_USER: UserProfile = {
  id: 'user-demo-1',
  name: 'Alexandre Laurent',
  email: 'alex@elizeefashion.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  age: 27,
  gender: 'all',
  preferredStyle: 'Old Money',
  favouriteColours: ['Oatmeal Beige', 'Sage Mist', 'Charcoal Black', 'Classic White'],
  fashionPreferences: ['Comfort-first', 'Tailored/Sharp', 'Breathable Natural Linens'],
  preferredOccasions: ['Casual Day Out', 'Work/Office', 'Date Night'],
  comfortPreferences: 'Relaxed tailored fits with breathable natural fibers',
  bio: 'Creative consultant obsessed with quiet luxury, earthy palettes, and timeless silhouettes.',
  joinedDate: 'November 2026',
};

function getInitialStore(): StoreData {
  // Pre-seed 4 items in user's wardrobe
  const initialWardrobe: WardrobeItem[] = [
    {
      id: 'wb-1',
      userId: 'user-demo-1',
      product: FASHION_CATALOG.find((i) => i.id === 'm-sh-1') || FASHION_CATALOG[0],
      addedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      notes: 'Everyday holy grail shirt. Breathable and effortlessly relaxed.',
    },
    {
      id: 'wb-2',
      userId: 'user-demo-1',
      product: FASHION_CATALOG.find((i) => i.id === 'w-dr-1') || FASHION_CATALOG[14],
      addedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      notes: 'For dinners and evening art gallery openings.',
    },
    {
      id: 'wb-3',
      userId: 'user-demo-1',
      product: FASHION_CATALOG.find((i) => i.id === 'm-wa-1') || FASHION_CATALOG[10],
      addedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      notes: 'Heritage timepiece with emerald green dial.',
    },
    {
      id: 'wb-4',
      userId: 'user-demo-1',
      product: FASHION_CATALOG.find((i) => i.id === 'w-bg-1') || FASHION_CATALOG[19],
      addedAt: new Date().toISOString(),
      notes: 'Sculptural crescent bag in caramel toffee.',
    },
  ];

  const initialOutfits: SavedOutfit[] = [
    {
      id: 'outfit-demo-1',
      userId: 'user-demo-1',
      title: 'Riviera Sunset Minimalist',
      occasion: 'Casual Day Out',
      items: [
        FASHION_CATALOG.find((i) => i.id === 'm-sh-1') || FASHION_CATALOG[0],
        FASHION_CATALOG.find((i) => i.id === 'm-pa-1') || FASHION_CATALOG[3],
        FASHION_CATALOG.find((i) => i.id === 'm-sg-1') || FASHION_CATALOG[5],
        FASHION_CATALOG.find((i) => i.id === 'm-so-2') || FASHION_CATALOG[8],
      ],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      stylistNotes: 'Monochromatic warm beige tones with linen drape and clean leather contrast.',
    },
  ];

  const initialSearchHistory: SearchHistoryItem[] = [
    {
      id: 'sh-1',
      userId: 'user-demo-1',
      query: 'Linen Camp Shirt',
      categoryDetected: 'Shirts',
      type: 'text',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'sh-2',
      userId: 'user-demo-1',
      query: 'Pleated Trousers',
      categoryDetected: 'Pants',
      type: 'text',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'sh-3',
      userId: 'user-demo-1',
      query: 'Satin Slip Dress',
      categoryDetected: 'Dresses',
      type: 'text',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  // Format helper for today YYYY-MM-DD
  const today = new Date();
  const formatYMD = (d: Date) => d.toISOString().split('T')[0];
  const tomorrow = new Date(today.getTime() + 86400000);
  const saturday = new Date(today.getTime() + 86400000 * 2);

  const initialSchedule: ScheduledOutfit[] = [
    {
      id: 'sched-1',
      userId: 'user-demo-1',
      date: formatYMD(today),
      title: 'Boardroom Presentation & Client Lunch',
      occasion: 'Work/Office',
      items: [
        FASHION_CATALOG.find((i) => i.id === 'm-sh-2') || FASHION_CATALOG[1],
        FASHION_CATALOG.find((i) => i.id === 'm-pa-1') || FASHION_CATALOG[3],
        FASHION_CATALOG.find((i) => i.id === 'm-so-2') || FASHION_CATALOG[8],
        FASHION_CATALOG.find((i) => i.id === 'm-wa-1') || FASHION_CATALOG[10],
      ],
      notes: 'Clean Oxford cotton button-down with double-pleated sand trousers and heritage timepiece.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sched-2',
      userId: 'user-demo-1',
      date: formatYMD(tomorrow),
      title: 'Casual Art Gallery Evening',
      occasion: 'Date Night',
      items: [
        FASHION_CATALOG.find((i) => i.id === 'm-sh-1') || FASHION_CATALOG[0],
        FASHION_CATALOG.find((i) => i.id === 'm-je-1') || FASHION_CATALOG[4],
        FASHION_CATALOG.find((i) => i.id === 'm-so-1') || FASHION_CATALOG[7],
        FASHION_CATALOG.find((i) => i.id === 'w-bg-1') || FASHION_CATALOG[19],
      ],
      notes: 'Breezy French linen shirt with raw selvedge denim and suede Chelsea boots.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sched-3',
      userId: 'user-demo-1',
      date: formatYMD(saturday),
      title: 'Weekend Farmer Market & Cafe',
      occasion: 'Casual Day Out',
      items: [
        FASHION_CATALOG.find((i) => i.id === 'm-ts-1') || FASHION_CATALOG[2],
        FASHION_CATALOG.find((i) => i.id === 'm-shs-1') || FASHION_CATALOG[6],
        FASHION_CATALOG.find((i) => i.id === 'm-sg-1') || FASHION_CATALOG[5],
        FASHION_CATALOG.find((i) => i.id === 'm-sl-1') || FASHION_CATALOG[9],
      ],
      notes: 'Heavyweight chalk white drop-shoulder tee with tailored linen bermudas and leather slides.',
      createdAt: new Date().toISOString(),
    },
  ];

  return {
    users: [DEFAULT_USER],
    wardrobe: initialWardrobe,
    outfits: initialOutfits,
    searchHistory: initialSearchHistory,
    schedule: initialSchedule,
  };
}

class Store {
  private data: StoreData;

  constructor() {
    this.data = this.load();
  }

  private load(): StoreData {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed.schedule || parsed.schedule.length === 0) {
          const initial = getInitialStore();
          parsed.schedule = initial.schedule;
          this.saveData(parsed);
        }
        return parsed;
      }
    } catch (err) {
      console.error('Error loading store, using defaults:', err);
    }
    const initial = getInitialStore();
    this.saveData(initial);
    return initial;
  }

  private saveData(data: StoreData) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving store to disk:', err);
    }
  }

  private commit() {
    this.saveData(this.data);
  }

  // User methods
  getUser(id: string): UserProfile | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): UserProfile | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(name: string, email: string): UserProfile {
    const existing = this.getUserByEmail(email);
    if (existing) return existing;

    const newUser: UserProfile = {
      id: 'user-' + Date.now(),
      name,
      email,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + (this.data.users.length % 5)}?auto=format&fit=crop&w=400&q=80`,
      age: 25,
      gender: 'all',
      preferredStyle: 'Minimalist',
      favouriteColours: ['Classic White', 'Oatmeal Beige', 'Midnight Black'],
      fashionPreferences: ['Comfort-first', 'Tailored/Sharp'],
      preferredOccasions: ['Casual Day Out', 'Work/Office'],
      comfortPreferences: 'Relaxed breathable silhouettes',
      bio: 'Fashion enthusiast exploring modern personal styling with AI.',
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    };

    this.data.users.push(newUser);
    this.commit();
    return newUser;
  }

  updateUser(id: string, updates: Partial<UserProfile>): UserProfile | null {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.commit();
    return this.data.users[idx];
  }

  // Wardrobe methods
  getWardrobe(userId: string): WardrobeItem[] {
    return this.data.wardrobe.filter((w) => w.userId === userId);
  }

  addToWardrobe(userId: string, product: FashionItem, notes?: string): WardrobeItem {
    const existing = this.data.wardrobe.find((w) => w.userId === userId && w.product.id === product.id);
    if (existing) return existing;

    const item: WardrobeItem = {
      id: 'wb-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userId,
      product,
      addedAt: new Date().toISOString(),
      notes,
    };
    this.data.wardrobe.unshift(item);
    this.commit();
    return item;
  }

  removeFromWardrobe(userId: string, productId: string): boolean {
    const prevLen = this.data.wardrobe.length;
    this.data.wardrobe = this.data.wardrobe.filter(
      (w) => !(w.userId === userId && (w.product.id === productId || w.id === productId))
    );
    if (this.data.wardrobe.length !== prevLen) {
      this.commit();
      return true;
    }
    return false;
  }

  // Saved Outfits methods
  getOutfits(userId: string): SavedOutfit[] {
    return this.data.outfits.filter((o) => o.userId === userId);
  }

  saveOutfit(userId: string, title: string, occasion: string, items: FashionItem[], stylistNotes?: string): SavedOutfit {
    const outfit: SavedOutfit = {
      id: 'outfit-' + Date.now(),
      userId,
      title: title || 'Custom Wardrobe Ensemble',
      occasion: occasion || 'Casual Day Out',
      items,
      createdAt: new Date().toISOString(),
      stylistNotes,
    };
    this.data.outfits.unshift(outfit);
    this.commit();
    return outfit;
  }

  deleteOutfit(userId: string, outfitId: string): boolean {
    const prevLen = this.data.outfits.length;
    this.data.outfits = this.data.outfits.filter((o) => !(o.userId === userId && o.id === outfitId));
    if (this.data.outfits.length !== prevLen) {
      this.commit();
      return true;
    }
    return false;
  }

  // Search History methods
  getSearchHistory(userId: string): SearchHistoryItem[] {
    return this.data.searchHistory
      .filter((s) => s.userId === userId)
      .slice(0, 15);
  }

  addSearchHistory(userId: string, query: string, type: 'text' | 'image' | 'camera' = 'text', categoryDetected?: string): SearchHistoryItem {
    // Avoid immediate duplicate
    this.data.searchHistory = this.data.searchHistory.filter(
      (s) => !(s.userId === userId && s.query.toLowerCase() === query.toLowerCase())
    );

    const item: SearchHistoryItem = {
      id: 'sh-' + Date.now(),
      userId,
      query,
      type,
      categoryDetected,
      timestamp: new Date().toISOString(),
    };
    this.data.searchHistory.unshift(item);
    if (this.data.searchHistory.length > 50) {
      this.data.searchHistory = this.data.searchHistory.slice(0, 50);
    }
    this.commit();
    return item;
  }

  clearSearchHistory(userId: string): boolean {
    this.data.searchHistory = this.data.searchHistory.filter((s) => s.userId !== userId);
    this.commit();
    return true;
  }

  // Schedule & Calendar Styling methods
  getSchedule(userId: string): ScheduledOutfit[] {
    return (this.data.schedule || []).filter((s) => s.userId === userId);
  }

  getScheduledDay(userId: string, date: string): ScheduledOutfit | undefined {
    return (this.data.schedule || []).find((s) => s.userId === userId && s.date === date);
  }

  setSchedule(
    userId: string,
    date: string,
    title: string,
    occasion: string,
    items: FashionItem[],
    notes?: string
  ): ScheduledOutfit {
    if (!this.data.schedule) this.data.schedule = [];

    // Check if an outfit already exists for this date
    const existingIndex = this.data.schedule.findIndex(
      (s) => s.userId === userId && s.date === date
    );

    const scheduledOutfit: ScheduledOutfit = {
      id: existingIndex !== -1 ? this.data.schedule[existingIndex].id : 'sched-' + Date.now(),
      userId,
      date,
      title: title || 'Daily Styling Outfit',
      occasion: occasion || 'Casual Day Out',
      items,
      notes,
      createdAt: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      this.data.schedule[existingIndex] = scheduledOutfit;
    } else {
      this.data.schedule.push(scheduledOutfit);
    }

    this.commit();
    return scheduledOutfit;
  }

  deleteSchedule(userId: string, idOrDate: string): boolean {
    if (!this.data.schedule) return false;
    const prevLen = this.data.schedule.length;
    this.data.schedule = this.data.schedule.filter(
      (s) => !(s.userId === userId && (s.id === idOrDate || s.date === idOrDate))
    );
    if (this.data.schedule.length !== prevLen) {
      this.commit();
      return true;
    }
    return false;
  }
}


export const store = new Store();
