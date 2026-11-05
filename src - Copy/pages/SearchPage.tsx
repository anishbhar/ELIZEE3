import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Camera,
  Upload,
  X,
  Clock,
  Trash2,
  Filter,
  Sparkles,
  Heart,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  Check,
} from 'lucide-react';
import { useFashion } from '../context/FashionContext.tsx';
import { FashionItem, SearchHistoryItem } from '../types/fashion.ts';
import { api } from '../services/api.ts';
import { CameraCaptureModal } from '../components/CameraCaptureModal.tsx';

const ALL_CATEGORIES = [
  'All',
  'Shirts',
  'T-Shirts',
  'Tops',
  'Dresses',
  'Pants',
  'Jeans',
  'Shorts',
  'Sunglasses',
  'Bags',
  'Shoes',
  'Heels',
  'Slippers',
  'Accessories',
  'Watches',
  'Necklaces',
  'Earrings',
  'Bracelets',
];

const STYLES = ['All', 'Minimalist', 'Streetwear', 'Casual', 'Formal', 'Old Money', 'Traditional', 'Party'];
const OCCASIONS = ['All', 'College', 'Work/Office', 'Casual Day Out', 'Date Night', 'Wedding/Celebration', 'Travel'];
const COLORS = [
  { name: 'All', hex: '' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Beige', hex: '#D8CBB9' },
  { name: 'Black', hex: '#1C1A17' },
  { name: 'Navy', hex: '#1B263B' },
  { name: 'Olive', hex: '#556B2F' },
  { name: 'Terracotta', hex: '#C86D51' },
  { name: 'Gold', hex: '#E5C158' },
  { name: 'Silver', hex: '#E0E0E0' },
];

export const SearchPage: React.FC = () => {
  const {
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    selectedGenderFilter,
    setSelectedGenderFilter,
    toggleWardrobe,
    isItemInWardrobe,
    setSelectedProductDetail,
    setStylistPreloadItem,
    setActiveTab,
  } = useFashion();

  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<FashionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [selectedStyle, setSelectedStyle] = useState('All');
  const [selectedOccasion, setSelectedOccasion] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Camera & Image search states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [detectedCategoryBadge, setDetectedCategoryBadge] = useState<string | null>(null);
  const fileUploadInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch initial catalog & history
  useEffect(() => {
    loadProducts();
    loadHistory();
  }, []);

  // Category auto-isolation when typing in search bar
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setDetectedCategoryBadge(null);
      return;
    }

    // Explicit automatic category identification:
    // Searching "Shirt" displays only shirts.
    // Searching "Pants" displays only pants.
    // Searching "Shoes" displays only shoes.
    // Searching "Sunglasses" displays only sunglasses.
    // Searching "Necklace" displays only necklaces.
    if (q.includes('shirt') && !q.includes('t-shirt') && !q.includes('tshirt')) {
      setSelectedCategoryFilter('Shirts');
      setDetectedCategoryBadge('Shirts');
    } else if (q.includes('t-shirt') || q.includes('tshirt') || q.includes('tee')) {
      setSelectedCategoryFilter('T-Shirts');
      setDetectedCategoryBadge('T-Shirts');
    } else if (q.includes('pant') || q.includes('trouser') || q.includes('chino')) {
      setSelectedCategoryFilter('Pants');
      setDetectedCategoryBadge('Pants');
    } else if (q.includes('jean') || q.includes('denim')) {
      setSelectedCategoryFilter('Jeans');
      setDetectedCategoryBadge('Jeans');
    } else if (q.includes('short')) {
      setSelectedCategoryFilter('Shorts');
      setDetectedCategoryBadge('Shorts');
    } else if (q.includes('dress') || q.includes('gown') || q.includes('anarkali')) {
      setSelectedCategoryFilter('Dresses');
      setDetectedCategoryBadge('Dresses');
    } else if (q.includes('top') || q.includes('cami') || q.includes('blouse')) {
      setSelectedCategoryFilter('Tops');
      setDetectedCategoryBadge('Tops');
    } else if (q.includes('sunglasses') || q.includes('glasses') || q.includes('shades')) {
      setSelectedCategoryFilter('Sunglasses');
      setDetectedCategoryBadge('Sunglasses');
    } else if (q.includes('bag') || q.includes('tote') || q.includes('duffle')) {
      setSelectedCategoryFilter('Bags');
      setDetectedCategoryBadge('Bags');
    } else if (q.includes('heel') || q.includes('stiletto') || q.includes('pump')) {
      setSelectedCategoryFilter('Heels');
      setDetectedCategoryBadge('Heels');
    } else if (q.includes('slipper') || q.includes('slide') || q.includes('mule')) {
      setSelectedCategoryFilter('Slippers');
      setDetectedCategoryBadge('Slippers');
    } else if (q.includes('shoe') || q.includes('sneaker') || q.includes('boot') || q.includes('loafer')) {
      setSelectedCategoryFilter('Shoes');
      setDetectedCategoryBadge('Shoes');
    } else if (q.includes('necklace') || q.includes('choker') || q.includes('chain')) {
      setSelectedCategoryFilter('Necklaces');
      setDetectedCategoryBadge('Necklaces');
    } else if (q.includes('earring') || q.includes('hoop')) {
      setSelectedCategoryFilter('Earrings');
      setDetectedCategoryBadge('Earrings');
    } else if (q.includes('bracelet') || q.includes('bangle') || q.includes('cuff')) {
      setSelectedCategoryFilter('Bracelets');
      setDetectedCategoryBadge('Bracelets');
    } else if (q.includes('watch') || q.includes('timepiece')) {
      setSelectedCategoryFilter('Watches');
      setDetectedCategoryBadge('Watches');
    } else if (q.includes('accessory') || q.includes('belt') || q.includes('scarf')) {
      setSelectedCategoryFilter('Accessories');
      setDetectedCategoryBadge('Accessories');
    }
  }, [searchQuery]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const items = await api.getProducts();
      setProducts(items);
    } catch (e) {
      console.error('Failed to load products:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const hist = await api.getSearchHistory();
      setHistory(hist);
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  };

  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const saved = await api.addSearchHistory(searchQuery.trim(), 'text', detectedCategoryBadge || undefined);
      setHistory((prev) => [saved, ...prev.filter((h) => h.query !== searchQuery.trim())]);
    } catch (e) {
      console.error('Failed to record search history:', e);
    }
  };

  const handleClearHistory = async () => {
    try {
      await api.clearSearchHistory();
      setHistory([]);
    } catch (e) {
      console.error('Failed to clear search history:', e);
    }
  };

  const handleHistoryItemClick = (item: SearchHistoryItem) => {
    setSearchQuery(item.query);
    if (item.categoryDetected) {
      setSelectedCategoryFilter(item.categoryDetected);
      setDetectedCategoryBadge(item.categoryDetected);
    }
  };

  const handleCameraCapture = async (base64Image: string, mimeType: string) => {
    setAnalyzingImage(true);
    try {
      const result = await api.detectCategory(undefined, base64Image);
      if (result) {
        if (result.category) {
          setSelectedCategoryFilter(result.category);
          setDetectedCategoryBadge(result.category);
        }
        if (result.gender && (result.gender === 'men' || result.gender === 'women')) {
          setSelectedGenderFilter(result.gender);
        }
        if (result.keywords && result.keywords.length > 0) {
          setSearchQuery(result.keywords[0]);
        }
        await api.addSearchHistory(
          result.category || 'Visual Camera Search',
          'camera',
          result.category
        );
        loadHistory();
      }
    } catch (err) {
      console.error('Camera visual search error:', err);
    } finally {
      setAnalyzingImage(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      handleCameraCapture(base64, file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  // Filtered & Sorted items
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Gender filter
      if (selectedGenderFilter !== 'all') {
        if (item.gender !== selectedGenderFilter && item.gender !== 'unisex') {
          return false;
        }
      }

      // Category filter
      if (selectedCategoryFilter !== 'All') {
        if (item.category.toLowerCase() !== selectedCategoryFilter.toLowerCase()) {
          return false;
        }
      }

      // Style filter
      if (selectedStyle !== 'All') {
        if (item.style !== selectedStyle) return false;
      }

      // Occasion filter
      if (selectedOccasion !== 'All') {
        if (item.occasion !== selectedOccasion) return false;
      }

      // Color filter
      if (selectedColor !== 'All') {
        if (!item.color.toLowerCase().includes(selectedColor.toLowerCase())) return false;
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesColor = item.color.toLowerCase().includes(q);
        const matchesStyle = item.style.toLowerCase().includes(q);
        const matchesOccasion = item.occasion.toLowerCase().includes(q);
        const matchesMaterial = item.material.toLowerCase().includes(q);

        // If category is detected, the category filter already strictly applies.
        if (detectedCategoryBadge) {
          return item.category.toLowerCase() === detectedCategoryBadge.toLowerCase();
        }

        return (
          matchesName ||
          matchesCategory ||
          matchesDesc ||
          matchesColor ||
          matchesStyle ||
          matchesOccasion ||
          matchesMaterial
        );
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [
    products,
    selectedGenderFilter,
    selectedCategoryFilter,
    selectedStyle,
    selectedOccasion,
    selectedColor,
    searchQuery,
    detectedCategoryBadge,
    sortBy,
  ]);

  const resetAllFilters = () => {
    setSelectedCategoryFilter('All');
    setSelectedGenderFilter('all');
    setSelectedStyle('All');
    setSelectedOccasion('All');
    setSelectedColor('All');
    setSearchQuery('');
    setDetectedCategoryBadge(null);
  };

  const handleStyleWithAi = (item: FashionItem) => {
    setStylistPreloadItem(item);
    setActiveTab('stylist');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#1c1a17]">
      {/* Header title */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs uppercase tracking-[0.25em] text-[#a07855] font-semibold">
          Visual & Semantic Intelligence
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-[#1c1a17] mt-1">
          Smart Fashion Search
        </h1>
        <p className="text-xs sm:text-sm text-[#736859] mt-2">
          Search with natural keywords, isolate categories automatically, or scan your garments using the AI camera.
        </p>
      </div>

      {/* ================= SMART SEARCH BAR & ACTIONS ================= */}
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <div className="absolute left-4 text-[#8a7e70]">
            <Search className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Try typing "Shirt", "Pants", "Shoes", "Sunglasses", "Necklace", or "Linen"...'
            className="w-full pl-12 pr-28 py-4 bg-[#faf8f5] border border-[#d6ccbd] rounded-2xl text-sm sm:text-base text-[#1c1a17] placeholder-[#998e80] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#22211e] transition-all"
          />

          {/* Right action icons inside input */}
          <div className="absolute right-3 flex items-center gap-1.5">
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setDetectedCategoryBadge(null);
                }}
                className="p-1.5 text-[#8a7e70] hover:text-[#1c1a17] rounded-full hover:bg-[#ede5d8] transition-colors"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Camera Search Button */}
            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              title="Camera visual search"
              className="p-2 text-[#574d42] hover:text-[#1c1a17] bg-[#ede7dc] hover:bg-[#e2d8cb] rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
            >
              <Camera className="w-4 h-4 text-[#a07855]" />
              <span className="hidden sm:inline">Camera</span>
            </button>

            {/* Upload Image Button */}
            <button
              type="button"
              onClick={() => fileUploadInputRef.current?.click()}
              title="Upload photo from device"
              className="p-2 text-[#574d42] hover:text-[#1c1a17] bg-[#ede7dc] hover:bg-[#e2d8cb] rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
            >
              <Upload className="w-4 h-4 text-[#756857]" />
            </button>
          </div>
        </form>

        {/* Hidden device upload input */}
        <input
          ref={fileUploadInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* AI Category Detected notification pill */}
        {detectedCategoryBadge && (
          <div className="mt-2.5 flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-[#f0e8dc] text-[#5e4f3f] text-xs font-medium animate-in fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#a07855]" />
              <span>
                Smart Category Identified: <strong>{detectedCategoryBadge}</strong>
              </span>
            </div>
            <button
              onClick={() => {
                setDetectedCategoryBadge(null);
                setSelectedCategoryFilter('All');
              }}
              className="text-[11px] underline hover:text-[#1c1a17]"
            >
              Show All Categories
            </button>
          </div>
        )}

        {analyzingImage && (
          <div className="mt-3 p-3 rounded-xl bg-[#22211e] text-white text-xs flex items-center justify-center gap-2 animate-pulse">
            <Sparkles className="w-4 h-4 text-[#d9a87d] animate-spin" />
            <span>AI analyzing photo and matching catalog categories...</span>
          </div>
        )}

        {/* ================= SEARCH HISTORY CHIPS ================= */}
        {history.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[#eee7db]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7a6f61] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Recent Searches</span>
              </span>
              <button
                onClick={handleClearHistory}
                className="text-[11px] text-[#8a7e70] hover:text-red-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear History</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {history.slice(0, 8).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleHistoryItemClick(item)}
                  className="px-3 py-1 rounded-full bg-[#f2ece2] hover:bg-[#e6decf] text-[#423b32] text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {item.type === 'camera' ? (
                    <Camera className="w-3 h-3 text-[#a07855]" />
                  ) : (
                    <Search className="w-3 h-3 text-[#786c5f]" />
                  )}
                  <span>{item.query}</span>
                  {item.categoryDetected && (
                    <span className="text-[9px] px-1.5 py-0.2 bg-[#ded5c6] rounded-md font-semibold text-[#54483b]">
                      {item.categoryDetected}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================= GENDER TOGGLE BAR ================= */}
      <div className="flex items-center justify-center">
        <div className="p-1 bg-[#ede6da] rounded-full inline-flex gap-1 border border-[#ded5c7]">
          {(['all', 'men', 'women'] as const).map((gender) => (
            <button
              key={gender}
              onClick={() => setSelectedGenderFilter(gender)}
              className={`px-6 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                selectedGenderFilter === gender
                  ? 'bg-[#22211e] text-[#faf9f6] shadow-sm'
                  : 'text-[#5e5345] hover:text-[#1c1a17]'
              }`}
            >
              {gender === 'all' ? 'All Collections' : `${gender}'s Fashion`}
            </button>
          ))}
        </div>
      </div>

      {/* ================= HORIZONTAL CATEGORY SCROLLER ================= */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          {ALL_CATEGORIES.map((cat) => {
            const isSelected = selectedCategoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#22211e] text-[#faf9f6] shadow-sm'
                    : 'bg-[#f2ece2] hover:bg-[#e8e0d2] text-[#473f35]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= SECONDARY FILTER BAR (Style, Occasion, Color, Sort) ================= */}
      <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#ded5c7] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Style Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] uppercase tracking-wider text-[#736859] font-semibold">
              Style:
            </span>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="bg-white border border-[#d6ccbd] rounded-xl px-2.5 py-1.5 text-xs text-[#2b2722] focus:outline-none focus:ring-1 focus:ring-[#22211e]"
            >
              {STYLES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Occasion Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] uppercase tracking-wider text-[#736859] font-semibold">
              Occasion:
            </span>
            <select
              value={selectedOccasion}
              onChange={(e) => setSelectedOccasion(e.target.value)}
              className="bg-white border border-[#d6ccbd] rounded-xl px-2.5 py-1.5 text-xs text-[#2b2722] focus:outline-none focus:ring-1 focus:ring-[#22211e]"
            >
              {OCCASIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          {/* Color Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] uppercase tracking-wider text-[#736859] font-semibold">
              Colour:
            </span>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="bg-white border border-[#d6ccbd] rounded-xl px-2.5 py-1.5 text-xs text-[#2b2722] focus:outline-none focus:ring-1 focus:ring-[#22211e]"
            >
              {COLORS.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort & Reset */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] uppercase tracking-wider text-[#736859] font-semibold">
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-[#d6ccbd] rounded-xl px-2.5 py-1.5 text-xs text-[#2b2722] focus:outline-none focus:ring-1 focus:ring-[#22211e]"
            >
              <option value="featured">Featured Picks</option>
              <option value="rating">Highest Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          <button
            onClick={resetAllFilters}
            className="p-1.5 text-[#736859] hover:text-[#1c1a17] hover:bg-[#ede5d8] rounded-xl transition-colors cursor-pointer text-xs flex items-center gap-1"
            title="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* ================= RESULTS SUMMARY & PRODUCT GRID ================= */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs text-[#6e6355]">
            Showing <strong>{filteredProducts.length}</strong> fashion items
            {selectedCategoryFilter !== 'All' && ` in ${selectedCategoryFilter}`}
            {selectedGenderFilter !== 'all' && ` (${selectedGenderFilter})`}
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center bg-[#faf8f5] rounded-3xl border border-[#ded5c7] max-w-lg mx-auto p-8">
            <Search className="w-12 h-12 text-[#9e9282] mx-auto mb-3" />
            <h3 className="font-serif text-2xl font-semibold text-[#1c1a17]">
              No Matching Products Found
            </h3>
            <p className="text-xs text-[#786e61] mt-2 mb-6">
              We couldn't find any products matching your specific combination of filters or search query.
            </p>
            <button
              onClick={resetAllFilters}
              className="px-6 py-2.5 bg-[#22211e] text-white text-xs uppercase tracking-wider font-semibold rounded-full hover:bg-[#38342e] transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((item) => {
              const inWardrobe = isItemInWardrobe(item.id);

              return (
                <div
                  key={item.id}
                  className="group bg-[#faf8f5] rounded-3xl overflow-hidden border border-[#ded5c7] hover:border-[#bdae9c] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Image container */}
                  <div
                    onClick={() => setSelectedProductDetail(item)}
                    className="relative aspect-4/5 overflow-hidden bg-[#e8e1d5] cursor-pointer"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      <span className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[9px] font-semibold uppercase tracking-wider text-[#1c1a17]">
                        {item.category}
                      </span>
                      {item.isTrending && (
                        <span className="px-2 py-0.5 rounded-full bg-[#22211e]/90 text-white text-[9px] font-medium tracking-wide">
                          Trending
                        </span>
                      )}
                    </div>

                    {/* Wardrobe Heart button overlay */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWardrobe(item);
                      }}
                      title={inWardrobe ? 'Remove from Wardrobe' : 'Save to Wardrobe'}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-[#22211e] transition-all shadow-sm cursor-pointer"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          inWardrobe ? 'fill-[#853434] text-[#853434]' : 'text-[#473f35]'
                        }`}
                      />
                    </button>

                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded-full text-white text-[10px]">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/60"
                        style={{ backgroundColor: item.colorHex }}
                      />
                      <span>{item.color}</span>
                    </div>
                  </div>

                  {/* Item Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div onClick={() => setSelectedProductDetail(item)} className="cursor-pointer">
                      <div className="flex items-center justify-between text-[11px] text-[#736859] mb-1">
                        <span>{item.gender === 'men' ? 'Men' : item.gender === 'women' ? 'Women' : 'Unisex'}</span>
                        <span className="text-[#a07855] font-semibold">★ {item.rating}</span>
                      </div>
                      <h3 className="font-serif text-lg font-semibold text-[#1c1a17] leading-tight line-clamp-1 group-hover:text-[#a07855] transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[#63594e] mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#ede5d8] flex items-center justify-between">
                      <span className="font-serif text-xl font-medium text-[#1c1a17]">
                        ${item.price}
                      </span>

                      {/* Style with AI button */}
                      <button
                        onClick={() => handleStyleWithAi(item)}
                        title="Ask AI Stylist how to pair this"
                        className="px-3 py-1.5 rounded-xl bg-[#ede6da] hover:bg-[#e0d6c6] text-[#2c2721] text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#a07855]" />
                        <span>Style</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        title="Visual Fashion Search"
        subtitle="Capture or upload a photo to identify category and discover matching items."
      />
    </div>
  );
};
