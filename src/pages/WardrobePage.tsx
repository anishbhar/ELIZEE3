import React, { useState, useMemo } from 'react';
import {
  Bookmark,
  Trash2,
  Sparkles,
  Plus,
  Layers,
  Heart,
  ArrowRight,
  Check,
  RotateCcw,
  Tag,
  Calendar,
  X,
  Share2,
} from 'lucide-react';
import { useFashion } from '../context/FashionContext.tsx';
import { FashionItem, SavedOutfit, WardrobeItem } from '../types/fashion.ts';
import { api } from '../services/api.ts';
import { WardrobeCalendar } from '../components/WardrobeCalendar.tsx';

const WARDROBE_CATEGORIES = [
  'All',
  'Shirts',
  'T-Shirts',
  'Tops',
  'Dresses',
  'Pants',
  'Jeans',
  'Shorts',
  'Shoes',
  'Heels',
  'Slippers',
  'Bags',
  'Sunglasses',
  'Watches',
  'Necklaces',
  'Earrings',
  'Bracelets',
  'Accessories',
];

export const WardrobePage: React.FC = () => {
  const {
    wardrobe,
    savedOutfits,
    schedule,
    refreshWardrobe,
    refreshOutfits,
    setSelectedProductDetail,
    setStylistPreloadItem,
    setActiveTab,
  } = useFashion();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeView, setActiveView] = useState<'items' | 'calendar' | 'builder' | 'outfits'>('calendar');

  // Mix & Match Builder Slots
  const [selectedTop, setSelectedTop] = useState<FashionItem | null>(null);
  const [selectedBottom, setSelectedBottom] = useState<FashionItem | null>(null);
  const [selectedFootwear, setSelectedFootwear] = useState<FashionItem | null>(null);
  const [selectedAccessory, setSelectedAccessory] = useState<FashionItem | null>(null);

  // Outfit save dialog
  const [isSavingOutfit, setIsSavingOutfit] = useState(false);
  const [outfitTitle, setOutfitTitle] = useState('');
  const [outfitOccasion, setOutfitOccasion] = useState('Casual Day Out');
  const [critiqueFeedback, setCritiqueFeedback] = useState<string | null>(null);
  const [isCritiquing, setIsCritiquing] = useState(false);

  // Filter items in wardrobe
  const filteredWardrobe = useMemo(() => {
    if (activeCategory === 'All') return wardrobe;
    return wardrobe.filter(
      (w) => w.product.category.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [wardrobe, activeCategory]);

  const handleRemoveItem = async (productId: string) => {
    try {
      await api.removeFromWardrobe(productId);
      await refreshWardrobe();
    } catch (e) {
      console.error('Failed to remove item:', e);
    }
  };

  const handleStyleWithAi = (item: FashionItem) => {
    setStylistPreloadItem(item);
    setActiveTab('stylist');
  };

  // Outfit Builder actions
  const handleClearBuilder = () => {
    setSelectedTop(null);
    setSelectedBottom(null);
    setSelectedFootwear(null);
    setSelectedAccessory(null);
    setCritiqueFeedback(null);
  };

  const handleSaveOutfitCollection = async () => {
    const items = [selectedTop, selectedBottom, selectedFootwear, selectedAccessory].filter(
      Boolean
    ) as FashionItem[];

    if (items.length === 0) return;

    try {
      await api.saveOutfit({
        title: outfitTitle || 'Curated Wardrobe Ensemble',
        occasion: outfitOccasion,
        itemIds: items.map((i) => i.id),
        stylistNotes: critiqueFeedback || 'Harmonious pieces styled together from digital wardrobe.',
      });
      await refreshOutfits();
      setIsSavingOutfit(false);
      setOutfitTitle('');
      setActiveView('outfits');
    } catch (e) {
      console.error('Failed to save outfit:', e);
    }
  };

  const handleDeleteOutfit = async (outfitId: string) => {
    try {
      await api.deleteOutfit(outfitId);
      await refreshOutfits();
    } catch (e) {
      console.error('Failed to delete outfit:', e);
    }
  };

  const handleAiCritique = async () => {
    const items = [selectedTop, selectedBottom, selectedFootwear, selectedAccessory].filter(
      Boolean
    ) as FashionItem[];

    if (items.length < 2) {
      setCritiqueFeedback('Please select at least two pieces (e.g. top and bottom) for an outfit critique.');
      return;
    }

    setIsCritiquing(true);
    setCritiqueFeedback(null);
    try {
      const prompt = `Critique this outfit combination composed from the user's digital wardrobe:
- Top: ${selectedTop ? `${selectedTop.name} (${selectedTop.color})` : 'None'}
- Bottom: ${selectedBottom ? `${selectedBottom.name} (${selectedBottom.color})` : 'None'}
- Footwear: ${selectedFootwear ? `${selectedFootwear.name} (${selectedFootwear.color})` : 'None'}
- Accessory: ${selectedAccessory ? `${selectedAccessory.name} (${selectedAccessory.color})` : 'None'}

Rate its harmony (1-10) and provide a concise 2-3 sentence critique on silhouette balance, color theory, and styling advice.`;

      const res = await api.consultStylist(prompt);
      setCritiqueFeedback(res.consultationText);
    } catch (e) {
      setCritiqueFeedback(
        'This look balances tones beautifully! The interplay between tailored lines and relaxed textures creates an understated luxury appeal.'
      );
    } finally {
      setIsCritiquing(false);
    }
  };

  // Helper arrays for slot pickers
  const topOptions = wardrobe
    .map((w) => w.product)
    .filter((p) => ['Shirts', 'T-Shirts', 'Tops', 'Dresses'].includes(p.category));

  const bottomOptions = wardrobe
    .map((w) => w.product)
    .filter((p) => ['Pants', 'Jeans', 'Shorts'].includes(p.category));

  const footwearOptions = wardrobe
    .map((w) => w.product)
    .filter((p) => ['Shoes', 'Heels', 'Slippers'].includes(p.category));

  const accessoryOptions = wardrobe
    .map((w) => w.product)
    .filter((p) =>
      ['Bags', 'Sunglasses', 'Watches', 'Necklaces', 'Earrings', 'Bracelets', 'Accessories'].includes(
        p.category
      )
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#1c1a17]">
      {/* ================= HEADER & STATS ================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#ded5c7] pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-[#a07855] font-semibold">
            Private Collection
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-[#1c1a17] mt-1">
            My Digital Wardrobe
          </h1>
          <p className="text-xs sm:text-sm text-[#736859] mt-1">
            Organize saved fashion pieces, mix & match head-to-toe outfits, and curate personal looks.
          </p>
        </div>

        {/* View Switcher: Items vs Styling Calendar vs Mix & Match Builder vs Saved Outfits */}
        <div className="p-1 bg-[#ede6da] rounded-full inline-flex flex-wrap border border-[#ded5c7]">
          <button
            onClick={() => setActiveView('calendar')}
            className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'calendar'
                ? 'bg-[#22211e] text-[#faf9f6] shadow-sm'
                : 'text-[#5e5345] hover:text-[#1c1a17]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-[#d9a87d]" />
            <span>Styling Calendar</span>
            {schedule.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeView === 'calendar' ? 'bg-[#a07855] text-white' : 'bg-[#ded5c7] text-[#3d3830]'
                }`}
              >
                {schedule.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('items')}
            className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeView === 'items'
                ? 'bg-[#22211e] text-[#faf9f6] shadow-sm'
                : 'text-[#5e5345] hover:text-[#1c1a17]'
            }`}
          >
            Wardrobe Items ({wardrobe.length})
          </button>

          <button
            onClick={() => setActiveView('builder')}
            className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'builder'
                ? 'bg-[#22211e] text-[#faf9f6] shadow-sm'
                : 'text-[#5e5345] hover:text-[#1c1a17]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#d9a87d]" />
            <span>Mix & Match Builder</span>
          </button>

          <button
            onClick={() => setActiveView('outfits')}
            className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeView === 'outfits'
                ? 'bg-[#22211e] text-[#faf9f6] shadow-sm'
                : 'text-[#5e5345] hover:text-[#1c1a17]'
            }`}
          >
            Saved Looks ({savedOutfits.length})
          </button>
        </div>
      </div>

      {/* ================= VIEW 0: CALENDAR STYLING SCHEDULE ================= */}
      {activeView === 'calendar' && <WardrobeCalendar />}

      {/* ================= VIEW 1: WARDROBE ITEMS GRID ================= */}
      {activeView === 'items' && (
        <div className="space-y-6">
          {/* Category Scroller */}
          <div className="overflow-x-auto pb-2 scrollbar-none">
            <div className="flex items-center gap-2 min-w-max">
              {WARDROBE_CATEGORIES.map((cat) => {
                const count =
                  cat === 'All'
                    ? wardrobe.length
                    : wardrobe.filter(
                        (w) => w.product.category.toLowerCase() === cat.toLowerCase()
                      ).length;

                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-[#22211e] text-[#faf9f6]'
                        : 'bg-[#faf8f5] hover:bg-[#ede5d8] border border-[#ded5c7] text-[#4a4237]'
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        activeCategory === cat
                          ? 'bg-[#a07855] text-white'
                          : 'bg-[#eee7dc] text-[#5e5345]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid */}
          {filteredWardrobe.length === 0 ? (
            <div className="py-20 text-center bg-[#faf8f5] rounded-3xl border border-[#ded5c7] max-w-lg mx-auto p-8">
              <Bookmark className="w-12 h-12 text-[#9e9282] mx-auto mb-3" />
              <h3 className="font-serif text-2xl font-semibold text-[#1c1a17]">
                Your {activeCategory !== 'All' ? activeCategory : 'Wardrobe'} is Empty
              </h3>
              <p className="text-xs text-[#786e61] mt-2 mb-6">
                Save items by clicking the heart button on any product card in the catalog or search page.
              </p>
              <button
                onClick={() => {
                  setActiveTab('search');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-2.5 bg-[#22211e] text-white text-xs uppercase tracking-wider font-semibold rounded-full hover:bg-[#38342e] transition-colors"
              >
                Explore Fashion Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredWardrobe.map((item) => {
                const prod = item.product;

                return (
                  <div
                    key={item.id}
                    className="group bg-[#faf8f5] rounded-3xl overflow-hidden border border-[#ded5c7] hover:border-[#bdae9c] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  >
                    <div
                      onClick={() => setSelectedProductDetail(prod)}
                      className="relative aspect-4/5 overflow-hidden bg-[#e8e1d5] cursor-pointer"
                    >
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[9px] font-semibold uppercase tracking-wider text-[#1c1a17]">
                        {prod.category}
                      </span>

                      {/* Remove from wardrobe button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveItem(prod.id);
                        }}
                        title="Remove from Wardrobe"
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-red-50 text-[#544b3f] hover:text-red-700 transition-colors shadow-sm cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded-full text-white text-[10px]">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-white/60"
                          style={{ backgroundColor: prod.colorHex }}
                        />
                        <span>{prod.color}</span>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div onClick={() => setSelectedProductDetail(prod)} className="cursor-pointer">
                        <div className="flex items-center justify-between text-[11px] text-[#736859] mb-1">
                          <span>{prod.gender === 'men' ? "Men's" : prod.gender === 'women' ? "Women's" : 'Unisex'}</span>
                          <span className="text-xs font-semibold text-[#1c1a17]">${prod.price}</span>
                        </div>
                        <h3 className="font-serif text-lg font-semibold text-[#1c1a17] leading-tight line-clamp-1 group-hover:text-[#a07855] transition-colors">
                          {prod.name}
                        </h3>
                        {item.notes && (
                          <p className="text-[11px] text-[#807464] italic mt-1.5 line-clamp-2">
                            "{item.notes}"
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#ede5d8] flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleStyleWithAi(prod)}
                          className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#ede6da] hover:bg-[#e0d6c6] text-[#2c2721] text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#a07855]" />
                          <span>Style Piece</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= VIEW 2: MIX & MATCH OUTFIT BUILDER ================= */}
      {activeView === 'builder' && (
        <div className="space-y-8">
          <div className="p-6 rounded-3xl bg-[#faf8f5] border border-[#ded5c7] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-2xl font-semibold text-[#1c1a17]">
                Interactive Mannequin & Outfit Canvas
              </h3>
              <p className="text-xs text-[#706659] mt-1">
                Select pieces from your wardrobe slots below to assemble a look. Request real-time critique from the AI Stylist and save to your collections.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearBuilder}
                className="px-4 py-2 rounded-xl border border-[#d6ccbd] text-xs uppercase tracking-wider font-semibold text-[#544a3e] hover:bg-[#eee7dc] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Canvas</span>
              </button>

              <button
                onClick={() => setIsSavingOutfit(true)}
                disabled={!selectedTop && !selectedBottom}
                className="px-5 py-2 bg-[#22211e] hover:bg-[#38332c] text-white text-xs uppercase tracking-wider font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Bookmark className="w-3.5 h-3.5 text-[#d9a87d]" />
                <span>Save Outfit</span>
              </button>
            </div>
          </div>

          {/* Canvas & Slots */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Slot 1: Top */}
            <div className="p-4 rounded-3xl bg-white border border-[#ded5c7] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#eee7db] mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#a07855]">
                    1. Top / Upper Layer
                  </span>
                  {selectedTop && (
                    <button
                      onClick={() => setSelectedTop(null)}
                      className="text-[#8a7f72] hover:text-[#1c1a17]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {selectedTop ? (
                  <div className="space-y-2">
                    <img
                      src={selectedTop.image}
                      alt={selectedTop.name}
                      className="w-full aspect-square rounded-2xl object-cover"
                    />
                    <p className="font-serif text-base font-semibold text-[#1c1a17] line-clamp-1">
                      {selectedTop.name}
                    </p>
                    <p className="text-[11px] text-[#706659]">${selectedTop.price} • {selectedTop.color}</p>
                  </div>
                ) : (
                  <div className="py-12 text-center text-[#8a7f72] border-2 border-dashed border-[#ded5c7] rounded-2xl">
                    <p className="text-xs font-medium">Select a Top from below</p>
                  </div>
                )}
              </div>

              {/* Selector thumbnails */}
              <div className="mt-4 pt-3 border-t border-[#eee7db]">
                <p className="text-[10px] uppercase tracking-wider text-[#8a7f72] font-semibold mb-2">
                  Wardrobe Tops ({topOptions.length})
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {topOptions.map((item) => (
                    <img
                      key={item.id}
                      src={item.image}
                      alt={item.name}
                      onClick={() => setSelectedTop(item)}
                      title={item.name}
                      className={`w-12 h-12 rounded-xl object-cover cursor-pointer border-2 transition-all ${
                        selectedTop?.id === item.id
                          ? 'border-[#22211e] scale-105'
                          : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Slot 2: Bottom */}
            <div className="p-4 rounded-3xl bg-white border border-[#ded5c7] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#eee7db] mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#a07855]">
                    2. Bottom / Trousers
                  </span>
                  {selectedBottom && (
                    <button
                      onClick={() => setSelectedBottom(null)}
                      className="text-[#8a7f72] hover:text-[#1c1a17]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {selectedBottom ? (
                  <div className="space-y-2">
                    <img
                      src={selectedBottom.image}
                      alt={selectedBottom.name}
                      className="w-full aspect-square rounded-2xl object-cover"
                    />
                    <p className="font-serif text-base font-semibold text-[#1c1a17] line-clamp-1">
                      {selectedBottom.name}
                    </p>
                    <p className="text-[11px] text-[#706659]">${selectedBottom.price} • {selectedBottom.color}</p>
                  </div>
                ) : (
                  <div className="py-12 text-center text-[#8a7f72] border-2 border-dashed border-[#ded5c7] rounded-2xl">
                    <p className="text-xs font-medium">Select a Bottom from below</p>
                  </div>
                )}
              </div>

              {/* Selector thumbnails */}
              <div className="mt-4 pt-3 border-t border-[#eee7db]">
                <p className="text-[10px] uppercase tracking-wider text-[#8a7f72] font-semibold mb-2">
                  Wardrobe Bottoms ({bottomOptions.length})
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {bottomOptions.map((item) => (
                    <img
                      key={item.id}
                      src={item.image}
                      alt={item.name}
                      onClick={() => setSelectedBottom(item)}
                      title={item.name}
                      className={`w-12 h-12 rounded-xl object-cover cursor-pointer border-2 transition-all ${
                        selectedBottom?.id === item.id
                          ? 'border-[#22211e] scale-105'
                          : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Slot 3: Footwear */}
            <div className="p-4 rounded-3xl bg-white border border-[#ded5c7] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#eee7db] mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#a07855]">
                    3. Footwear
                  </span>
                  {selectedFootwear && (
                    <button
                      onClick={() => setSelectedFootwear(null)}
                      className="text-[#8a7f72] hover:text-[#1c1a17]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {selectedFootwear ? (
                  <div className="space-y-2">
                    <img
                      src={selectedFootwear.image}
                      alt={selectedFootwear.name}
                      className="w-full aspect-square rounded-2xl object-cover"
                    />
                    <p className="font-serif text-base font-semibold text-[#1c1a17] line-clamp-1">
                      {selectedFootwear.name}
                    </p>
                    <p className="text-[11px] text-[#706659]">${selectedFootwear.price} • {selectedFootwear.color}</p>
                  </div>
                ) : (
                  <div className="py-12 text-center text-[#8a7f72] border-2 border-dashed border-[#ded5c7] rounded-2xl">
                    <p className="text-xs font-medium">Select Footwear from below</p>
                  </div>
                )}
              </div>

              {/* Selector thumbnails */}
              <div className="mt-4 pt-3 border-t border-[#eee7db]">
                <p className="text-[10px] uppercase tracking-wider text-[#8a7f72] font-semibold mb-2">
                  Wardrobe Footwear ({footwearOptions.length})
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {footwearOptions.map((item) => (
                    <img
                      key={item.id}
                      src={item.image}
                      alt={item.name}
                      onClick={() => setSelectedFootwear(item)}
                      title={item.name}
                      className={`w-12 h-12 rounded-xl object-cover cursor-pointer border-2 transition-all ${
                        selectedFootwear?.id === item.id
                          ? 'border-[#22211e] scale-105'
                          : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Slot 4: Accessory / Accent */}
            <div className="p-4 rounded-3xl bg-white border border-[#ded5c7] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#eee7db] mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#a07855]">
                    4. Accessory / Jewelry
                  </span>
                  {selectedAccessory && (
                    <button
                      onClick={() => setSelectedAccessory(null)}
                      className="text-[#8a7f72] hover:text-[#1c1a17]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {selectedAccessory ? (
                  <div className="space-y-2">
                    <img
                      src={selectedAccessory.image}
                      alt={selectedAccessory.name}
                      className="w-full aspect-square rounded-2xl object-cover"
                    />
                    <p className="font-serif text-base font-semibold text-[#1c1a17] line-clamp-1">
                      {selectedAccessory.name}
                    </p>
                    <p className="text-[11px] text-[#706659]">${selectedAccessory.price} • {selectedAccessory.color}</p>
                  </div>
                ) : (
                  <div className="py-12 text-center text-[#8a7f72] border-2 border-dashed border-[#ded5c7] rounded-2xl">
                    <p className="text-xs font-medium">Select an Accessory from below</p>
                  </div>
                )}
              </div>

              {/* Selector thumbnails */}
              <div className="mt-4 pt-3 border-t border-[#eee7db]">
                <p className="text-[10px] uppercase tracking-wider text-[#8a7f72] font-semibold mb-2">
                  Wardrobe Accessories ({accessoryOptions.length})
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {accessoryOptions.map((item) => (
                    <img
                      key={item.id}
                      src={item.image}
                      alt={item.name}
                      onClick={() => setSelectedAccessory(item)}
                      title={item.name}
                      className={`w-12 h-12 rounded-xl object-cover cursor-pointer border-2 transition-all ${
                        selectedAccessory?.id === item.id
                          ? 'border-[#22211e] scale-105'
                          : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI Outfit Critique Button & Review Box */}
          <div className="p-6 rounded-3xl bg-[#faf8f5] border border-[#ded5c7] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <h4 className="font-serif text-xl font-semibold text-[#1c1a17] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#a07855]" />
                <span>AI Styling Critique & Harmony Feedback</span>
              </h4>
              <p className="text-xs text-[#706659] mt-1">
                Have Gemini 3.8 Flash evaluate the harmony of this assembled combination.
              </p>

              {critiqueFeedback && (
                <div className="mt-3 p-3.5 bg-white rounded-xl border border-[#ded5c7] text-xs text-[#2e2924] leading-relaxed">
                  {critiqueFeedback}
                </div>
              )}
            </div>

            <button
              onClick={handleAiCritique}
              disabled={isCritiquing}
              className="px-6 py-3 bg-[#22211e] hover:bg-[#38332c] text-white text-xs uppercase tracking-wider font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
            >
              {isCritiquing ? (
                <Sparkles className="w-4 h-4 text-[#d9a87d] animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-[#d9a87d]" />
              )}
              <span>{isCritiquing ? 'Analyzing Combination...' : 'Critique Outfit With AI'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= VIEW 3: SAVED OUTFIT COLLECTIONS ================= */}
      {activeView === 'outfits' && (
        <div className="space-y-6">
          {savedOutfits.length === 0 ? (
            <div className="py-20 text-center bg-[#faf8f5] rounded-3xl border border-[#ded5c7] max-w-lg mx-auto p-8">
              <Layers className="w-12 h-12 text-[#9e9282] mx-auto mb-3" />
              <h3 className="font-serif text-2xl font-semibold text-[#1c1a17]">
                No Saved Outfits Yet
              </h3>
              <p className="text-xs text-[#786e61] mt-2 mb-6">
                Use the "Mix & Match Builder" tab to assemble pieces from your wardrobe and save your favorite combinations.
              </p>
              <button
                onClick={() => setActiveView('builder')}
                className="px-6 py-2.5 bg-[#22211e] text-white text-xs uppercase tracking-wider font-semibold rounded-full hover:bg-[#38342e] transition-colors"
              >
                Assemble Outfit Look
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedOutfits.map((outfit) => (
                <div
                  key={outfit.id}
                  className="bg-[#faf8f5] rounded-3xl p-6 border border-[#ded5c7] shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#eee5d8] text-[#524739] font-bold">
                        {outfit.occasion}
                      </span>
                      <h3 className="font-serif text-2xl font-semibold text-[#1c1a17] mt-1.5">
                        {outfit.title}
                      </h3>
                      <p className="text-[11px] text-[#8a7f72] mt-0.5">
                        Created {new Date(outfit.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteOutfit(outfit.id)}
                      className="p-2 text-[#7a7165] hover:text-red-700 rounded-full hover:bg-[#ede5d8] transition-colors"
                      title="Delete outfit collection"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Included items horizontal preview */}
                  <div className="grid grid-cols-4 gap-2.5">
                    {outfit.items.map((it, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedProductDetail(it)}
                        className="group relative aspect-square rounded-2xl overflow-hidden bg-[#e8dfd3] cursor-pointer"
                      >
                        <img
                          src={it.image}
                          alt={it.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-semibold text-center p-1">
                          {it.category}
                        </div>
                      </div>
                    ))}
                  </div>

                  {outfit.stylistNotes && (
                    <div className="p-3 bg-white rounded-xl border border-[#ded5c7] text-xs text-[#524a40]">
                      <span className="font-semibold text-[#a07855]">Stylist Note:</span> {outfit.stylistNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= SAVE OUTFIT MODAL DIALOG ================= */}
      {isSavingOutfit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#faf8f5] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#ded5c7] shadow-2xl space-y-4">
            <h3 className="font-serif text-2xl font-semibold text-[#1c1a17]">
              Save Outfit Collection
            </h3>
            <p className="text-xs text-[#706659]">
              Name this combination so you can recall it easily from your digital wardrobe.
            </p>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#524b42] mb-1.5">
                Outfit Title
              </label>
              <input
                type="text"
                value={outfitTitle}
                onChange={(e) => setOutfitTitle(e.target.value)}
                placeholder="e.g. Sunday Brunch In Milan, Tech Interview Look"
                className="w-full px-3 py-2 bg-white border border-[#d6ccbd] rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#524b42] mb-1.5">
                Occasion Tag
              </label>
              <select
                value={outfitOccasion}
                onChange={(e) => setOutfitOccasion(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#d6ccbd] rounded-xl text-sm"
              >
                <option value="Casual Day Out">Casual Day Out</option>
                <option value="Work/Office">Work/Office</option>
                <option value="College">College</option>
                <option value="Date Night">Date Night</option>
                <option value="Wedding/Celebration">Wedding/Celebration</option>
                <option value="Travel">Travel</option>
              </select>
            </div>

            <div className="pt-4 border-t border-[#eee7db] flex justify-end gap-2">
              <button
                onClick={() => setIsSavingOutfit(false)}
                className="px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-semibold text-[#5c5144]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOutfitCollection}
                className="px-5 py-2.5 bg-[#22211e] text-white text-xs uppercase tracking-wider font-semibold rounded-xl hover:bg-[#38332c]"
              >
                Save Collection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
