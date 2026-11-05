import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FashionItem, UserProfile, WardrobeItem, SavedOutfit, ScheduledOutfit } from '../types/fashion.ts';
import { api, getStoredUserId, clearStoredUser } from '../services/api.ts';

interface FashionContextType {
  user: UserProfile | null;
  wardrobe: WardrobeItem[];
  savedOutfits: SavedOutfit[];
  schedule: ScheduledOutfit[];
  activeTab: 'home' | 'search' | 'stylist' | 'wardrobe' | 'profile';
  setActiveTab: (tab: 'home' | 'search' | 'stylist' | 'wardrobe' | 'profile') => void;
  selectedCategoryFilter: string;
  setSelectedCategoryFilter: (cat: string) => void;
  selectedGenderFilter: 'all' | 'men' | 'women';
  setSelectedGenderFilter: (gender: 'all' | 'men' | 'women') => void;
  stylistPreloadItem: FashionItem | null;
  setStylistPreloadItem: (item: FashionItem | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  selectedProductDetail: FashionItem | null;
  setSelectedProductDetail: (item: FashionItem | null) => void;
  isCameraModalOpen: boolean;
  setIsCameraModalOpen: (open: boolean) => void;
  toggleWardrobe: (item: FashionItem) => Promise<boolean>;
  isItemInWardrobe: (productId: string) => boolean;
  refreshWardrobe: () => Promise<void>;
  refreshOutfits: () => Promise<void>;
  refreshSchedule: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setScheduleDay: (payload: {
    date: string;
    title: string;
    occasion: string;
    itemIds: string[];
    notes?: string;
  }) => Promise<ScheduledOutfit>;
  deleteScheduleDay: (idOrDate: string) => Promise<boolean>;
  autoPlanWeekSchedule: (startDate?: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  logoutUser: () => Promise<void>;
  loginUser: (email: string, name?: string) => Promise<void>;
}

const FashionContext = createContext<FashionContextType | undefined>(undefined);

export const FashionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [schedule, setSchedule] = useState<ScheduledOutfit[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'stylist' | 'wardrobe' | 'profile'>('home');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedGenderFilter, setSelectedGenderFilter] = useState<'all' | 'men' | 'women'>('all');
  const [stylistPreloadItem, setStylistPreloadItem] = useState<FashionItem | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<FashionItem | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);

  // Initialize user & wardrobe
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const u = await api.getMe();
      setUser(u);
      const [wb, ofs, sched] = await Promise.all([
        api.getWardrobe(),
        api.getOutfits(),
        api.getSchedule(),
      ]);
      setWardrobe(wb);
      setSavedOutfits(ofs);
      setSchedule(sched);
    } catch (e) {
      console.error('Failed to load initial user data:', e);
    }
  };

  const refreshWardrobe = async () => {
    try {
      const wb = await api.getWardrobe();
      setWardrobe(wb);
    } catch (e) {
      console.error('Failed to refresh wardrobe:', e);
    }
  };

  const refreshOutfits = async () => {
    try {
      const ofs = await api.getOutfits();
      setSavedOutfits(ofs);
    } catch (e) {
      console.error('Failed to refresh outfits:', e);
    }
  };

  const refreshSchedule = async () => {
    try {
      const sched = await api.getSchedule();
      setSchedule(sched);
    } catch (e) {
      console.error('Failed to refresh schedule:', e);
    }
  };

  const refreshUser = async () => {
    try {
      const u = await api.getMe();
      setUser(u);
    } catch (e) {
      console.error('Failed to refresh user:', e);
    }
  };

  const setScheduleDay = async (payload: {
    date: string;
    title: string;
    occasion: string;
    itemIds: string[];
    notes?: string;
  }) => {
    const scheduled = await api.setSchedule(payload);
    setSchedule((prev) => {
      const filtered = prev.filter((s) => s.date !== payload.date);
      return [...filtered, scheduled].sort((a, b) => a.date.localeCompare(b.date));
    });
    return scheduled;
  };

  const deleteScheduleDay = async (idOrDate: string) => {
    const success = await api.deleteSchedule(idOrDate);
    if (success) {
      setSchedule((prev) => prev.filter((s) => s.id !== idOrDate && s.date !== idOrDate));
    }
    return success;
  };

  const autoPlanWeekSchedule = async (startDate?: string) => {
    const res = await api.autoPlanWeek(startDate);
    setSchedule(res.schedule);
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    const updated = await api.updateProfile(data);
    setUser(updated);
  };

  const isItemInWardrobe = (productId: string) => {
    return wardrobe.some((w) => w.product.id === productId || w.id === productId);
  };

  const toggleWardrobe = async (item: FashionItem): Promise<boolean> => {
    const exists = isItemInWardrobe(item.id);
    if (exists) {
      await api.removeFromWardrobe(item.id);
      setWardrobe((prev) => prev.filter((w) => w.product.id !== item.id && w.id !== item.id));
      return false;
    } else {
      const added = await api.addToWardrobe(item.id);
      setWardrobe((prev) => [added, ...prev]);
      return true;
    }
  };

  const logoutUser = async () => {
    await api.logout();
    clearStoredUser();
    setUser(null);
    setWardrobe([]);
    setSavedOutfits([]);
    setSchedule([]);
    setActiveTab('home');
  };

  const loginUser = async (email: string, name?: string) => {
    const res = await api.login(email, name);
    setUser(res.user);
    await Promise.all([refreshWardrobe(), refreshOutfits(), refreshSchedule()]);
    setIsAuthModalOpen(false);
  };

  return (
    <FashionContext.Provider
      value={{
        user,
        wardrobe,
        savedOutfits,
        schedule,
        activeTab,
        setActiveTab,
        selectedCategoryFilter,
        setSelectedCategoryFilter,
        selectedGenderFilter,
        setSelectedGenderFilter,
        stylistPreloadItem,
        setStylistPreloadItem,
        isAuthModalOpen,
        setIsAuthModalOpen,
        selectedProductDetail,
        setSelectedProductDetail,
        isCameraModalOpen,
        setIsCameraModalOpen,
        toggleWardrobe,
        isItemInWardrobe,
        refreshWardrobe,
        refreshOutfits,
        refreshSchedule,
        refreshUser,
        setScheduleDay,
        deleteScheduleDay,
        autoPlanWeekSchedule,
        updateUserProfile,
        logoutUser,
        loginUser,
      }}
    >
      {children}
    </FashionContext.Provider>
  );
};

export const useFashion = () => {
  const context = useContext(FashionContext);
  if (!context) {
    throw new Error('useFashion must be used within a FashionProvider');
  }
  return context;
};
