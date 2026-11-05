import {
  FashionItem,
  UserProfile,
  WardrobeItem,
  SavedOutfit,
  SearchHistoryItem,
  StylistOutfitSuggestion,
  CameraStylingResult,
  ScheduledOutfit,
} from '../types/fashion.ts';

const USER_ID_KEY = 'elizee_user_id';
const TOKEN_KEY = 'elizee_auth_token';

export function getStoredUserId(): string {
  let uid = localStorage.getItem(USER_ID_KEY);
  if (!uid) {
    uid = 'user-demo-1';
    localStorage.setItem(USER_ID_KEY, uid);
  }
  return uid;
}

export function setStoredUser(userId: string, token?: string) {
  localStorage.setItem(USER_ID_KEY, userId);
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredUser() {
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

function getHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-user-id': getStoredUserId(),
  };
}

export const api = {
  // Auth
  async login(email: string, name?: string): Promise<{ user: UserProfile; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    setStoredUser(data.user.id, data.token);
    return data;
  },

  async register(name: string, email: string): Promise<{ user: UserProfile; token: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    setStoredUser(data.user.id, data.token);
    return data;
  },

  async getMe(): Promise<UserProfile> {
    const res = await fetch('/api/auth/me', { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch user');
    return data.user;
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update profile');
    return data.user;
  },

  async logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST', headers: getHeaders() });
    clearStoredUser();
  },

  // Products
  async getProducts(params?: {
    gender?: string;
    category?: string;
    style?: string;
    occasion?: string;
    search?: string;
    color?: string;
  }): Promise<FashionItem[]> {
    const query = new URLSearchParams();
    if (params?.gender) query.set('gender', params.gender);
    if (params?.category) query.set('category', params.category);
    if (params?.style) query.set('style', params.style);
    if (params?.occasion) query.set('occasion', params.occasion);
    if (params?.search) query.set('search', params.search);
    if (params?.color) query.set('color', params.color);

    const res = await fetch(`/api/products?${query.toString()}`);
    const data = await res.json();
    return data.products || [];
  },

  async getProduct(id: string): Promise<FashionItem> {
    const res = await fetch(`/api/products/${id}`);
    const data = await res.json();
    return data.product;
  },

  // Wardrobe
  async getWardrobe(): Promise<WardrobeItem[]> {
    const res = await fetch('/api/wardrobe', { headers: getHeaders() });
    const data = await res.json();
    return data.wardrobe || [];
  },

  async addToWardrobe(productId: string, notes?: string): Promise<WardrobeItem> {
    const res = await fetch('/api/wardrobe', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ productId, notes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add item to wardrobe');
    return data.item;
  },

  async removeFromWardrobe(productIdOrWardrobeId: string): Promise<boolean> {
    const res = await fetch(`/api/wardrobe/${productIdOrWardrobeId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    return data.success;
  },

  // Saved Outfits
  async getOutfits(): Promise<SavedOutfit[]> {
    const res = await fetch('/api/outfits', { headers: getHeaders() });
    const data = await res.json();
    return data.outfits || [];
  },

  async saveOutfit(outfitData: {
    title: string;
    occasion: string;
    itemIds: string[];
    stylistNotes?: string;
  }): Promise<SavedOutfit> {
    const res = await fetch('/api/outfits', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(outfitData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save outfit');
    return data.outfit;
  },

  async deleteOutfit(outfitId: string): Promise<boolean> {
    const res = await fetch(`/api/outfits/${outfitId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    return data.success;
  },

  // Calendar Styling Schedule
  async getSchedule(): Promise<ScheduledOutfit[]> {
    const res = await fetch('/api/schedule', { headers: getHeaders() });
    const data = await res.json();
    return data.schedule || [];
  },

  async getScheduledDay(date: string): Promise<ScheduledOutfit | null> {
    const res = await fetch(`/api/schedule/${date}`, { headers: getHeaders() });
    const data = await res.json();
    return data.scheduledOutfit || null;
  },

  async setSchedule(payload: {
    date: string;
    title: string;
    occasion: string;
    itemIds: string[];
    notes?: string;
  }): Promise<ScheduledOutfit> {
    const res = await fetch('/api/schedule', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update schedule');
    return data.scheduledOutfit;
  },

  async deleteSchedule(idOrDate: string): Promise<boolean> {
    const res = await fetch(`/api/schedule/${idOrDate}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    return data.success;
  },

  async autoPlanWeek(startDate?: string): Promise<{ schedule: ScheduledOutfit[]; planned: ScheduledOutfit[] }> {
    const res = await fetch('/api/schedule/ai-auto-plan', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ startDate }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to auto-plan week');
    return data;
  },

  // Search History
  async getSearchHistory(): Promise<SearchHistoryItem[]> {
    const res = await fetch('/api/search/history', { headers: getHeaders() });
    const data = await res.json();
    return data.history || [];
  },

  async addSearchHistory(
    query: string,
    type: 'text' | 'image' | 'camera' = 'text',
    categoryDetected?: string
  ): Promise<SearchHistoryItem> {
    const res = await fetch('/api/search/history', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ query, type, categoryDetected }),
    });
    const data = await res.json();
    return data.item;
  },

  async clearSearchHistory(): Promise<boolean> {
    const res = await fetch('/api/search/history', {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    return data.success;
  },

  // AI Stylist
  async consultStylist(
    prompt: string,
    customProfile?: Partial<UserProfile>
  ): Promise<{
    consultationText: string;
    outfits: StylistOutfitSuggestion[];
  }> {
    const res = await fetch('/api/ai/stylist', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ prompt, customProfile }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Stylist consultation failed');
    return data;
  },

  async analyzeOutfit(
    imageBase64: string,
    userNotes?: string
  ): Promise<CameraStylingResult> {
    const res = await fetch('/api/ai/analyze-outfit', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ imageBase64, userNotes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Outfit camera analysis failed');
    return data;
  },

  async detectCategory(
    query?: string,
    imageBase64?: string
  ): Promise<string | any> {
    const res = await fetch('/api/ai/detect-category', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ query, imageBase64 }),
    });
    const data = await res.json();
    return data.category;
  },
};
