import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Search,
  Camera,
  Heart,
  Bookmark,
  ShieldCheck,
  TrendingUp,
  Layers,
  Star,
  ExternalLink,
} from 'lucide-react';
import { useFashion } from '../context/FashionContext.tsx';
import {
  MEN_CATEGORIES,
  WOMEN_CATEGORIES,
  INITIAL_FEATURED_OUTFITS,
} from '../data/fashionCatalog.ts';

export const HomePage: React.FC = () => {
  const {
    setActiveTab,
    setSelectedCategoryFilter,
    setSelectedGenderFilter,
    setSelectedProductDetail,
    setIsCameraModalOpen,
  } = useFashion();

  const handleCategoryClick = (categoryName: string, gender: 'men' | 'women') => {
    setSelectedCategoryFilter(categoryName);
    setSelectedGenderFilter(gender);
    setActiveTab('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-20 pb-24 text-[#1c1a17]">
      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-8">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0 overflow-hidden mx-4 sm:mx-8 rounded-3xl sm:rounded-[2.5rem]">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85"
            alt="Editorial Haute Fashion"
            className="w-full h-full object-cover object-top scale-105 transition-transform duration-1000 ease-out"
          />
          {/* Subtle gradient overlays for high legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141210]/85 via-[#141210]/45 to-transparent" />
          <div className="absolute inset-0 bg-[#29221b]/20" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 py-20 text-[#faf9f6]">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs uppercase tracking-[0.25em] font-medium mb-6 border border-white/20 shadow-sm animate-in fade-in duration-700">
            <Sparkles className="w-3.5 h-3.5 text-[#e8cbb1]" />
            <span>AI-Driven Personal Haute Styling</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-light tracking-tight leading-[1.08] mb-6 drop-shadow-md">
            Dress with Intention. <br />
            <span className="font-serif italic font-normal text-[#f4e2d2]">
              Styled by Intelligence.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-[#eae3db] font-light leading-relaxed mb-10">
            A minimalist digital wardrobe and personalized AI stylist for Men and Women.
            Explore curated garments, visual camera searches, and cohesive outfit pairings.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                setActiveTab('stylist');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#faf9f6] text-[#1c1a17] hover:bg-[#ece5da] text-xs uppercase tracking-widest font-semibold transition-all duration-300 shadow-xl flex items-center justify-center gap-3 group cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#a07855]" />
              <span>Consult AI Stylist</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => {
                setSelectedCategoryFilter('All');
                setSelectedGenderFilter('all');
                setActiveTab('search');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-[#faf9f6] border border-white/30 text-xs uppercase tracking-widest font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Explore Collections</span>
            </button>

            <button
              onClick={() => {
                setIsCameraModalOpen(true);
              }}
              className="w-full sm:w-auto px-6 py-4 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-[#faf9f6] border border-white/20 text-xs uppercase tracking-widest font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4 text-[#e8cbb1]" />
              <span>Visual Search</span>
            </button>
          </div>
        </div>
      </section>

      {/* ================= VALUE PROPOSITION BANNER ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-3xl bg-[#f5efe6] border border-[#e8dfd2]">
          <div className="flex flex-col items-center text-center p-3">
            <span className="font-serif text-3xl font-semibold text-[#1c1a17]">65+</span>
            <span className="text-xs uppercase tracking-wider text-[#695f52] font-medium mt-1">
              Curated Garments
            </span>
            <p className="text-[11px] text-[#8a7e6f] mt-1">Linen, silk, denim & tailored essentials</p>
          </div>

          <div className="flex flex-col items-center text-center p-3">
            <span className="font-serif text-3xl font-semibold text-[#1c1a17]">24/7</span>
            <span className="text-xs uppercase tracking-wider text-[#695f52] font-medium mt-1">
              Personal AI Stylist
            </span>
            <p className="text-[11px] text-[#8a7e6f] mt-1">Powered by Gemini 3.8 Flash intelligence</p>
          </div>

          <div className="flex flex-col items-center text-center p-3">
            <span className="font-serif text-3xl font-semibold text-[#1c1a17]">Smart</span>
            <span className="text-xs uppercase tracking-wider text-[#695f52] font-medium mt-1">
              Camera Recognition
            </span>
            <p className="text-[11px] text-[#8a7e6f] mt-1">Upload photos to find matching styles</p>
          </div>

          <div className="flex flex-col items-center text-center p-3">
            <span className="font-serif text-3xl font-semibold text-[#1c1a17]">1-Click</span>
            <span className="text-xs uppercase tracking-wider text-[#695f52] font-medium mt-1">
              Digital Wardrobe
            </span>
            <p className="text-[11px] text-[#8a7e6f] mt-1">Mix & match saved outfits effortlessly</p>
          </div>
        </div>
      </section>

      {/* ================= TRENDING COLLECTIONS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#a07855] font-semibold mb-2">
              <TrendingUp className="w-4 h-4" />
              <span>Curated Edit</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1c1a17]">
              Trending Fashion Collections
            </h2>
          </div>
          <button
            onClick={() => {
              setSelectedCategoryFilter('All');
              setActiveTab('search');
            }}
            className="mt-4 md:mt-0 text-xs uppercase tracking-widest font-semibold text-[#665b4f] hover:text-[#1c1a17] flex items-center gap-1.5 transition-colors group cursor-pointer"
          >
            <span>View All Catalog Items</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => {
              setSelectedCategoryFilter('All');
              setSelectedGenderFilter('all');
              setActiveTab('search');
            }}
            className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer shadow-sm border border-[#e4dbce]"
          >
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80"
              alt="Quiet Luxury Capsule"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#f1d8c2]">
                Capsule Edit
              </span>
              <h3 className="font-serif text-2xl font-semibold mt-1">Quiet Luxury & Earthy Linens</h3>
              <p className="text-xs text-white/80 mt-1 line-clamp-2">
                Effortless double-pleated wool trousers, French linen camp shirts, and understated leather goods.
              </p>
            </div>
          </div>

          <div
            onClick={() => {
              setSelectedCategoryFilter('Dresses');
              setSelectedGenderFilter('women');
              setActiveTab('search');
            }}
            className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer shadow-sm border border-[#e4dbce]"
          >
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80"
              alt="Monochrome Soirée"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#f1d8c2]">
                Evening & Party
              </span>
              <h3 className="font-serif text-2xl font-semibold mt-1">Monochrome Silk & Satin Soirée</h3>
              <p className="text-xs text-white/80 mt-1 line-clamp-2">
                Bias-cut slip dresses, sculptural kitten heels, and fluid tops designed for luminous twilight nights.
              </p>
            </div>
          </div>

          <div
            onClick={() => {
              setSelectedCategoryFilter('Pants');
              setSelectedGenderFilter('men');
              setActiveTab('search');
            }}
            className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer shadow-sm border border-[#e4dbce]"
          >
            <img
              src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80"
              alt="Architectural Tailoring"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#f1d8c2]">
                Contemporary Office
              </span>
              <h3 className="font-serif text-2xl font-semibold mt-1">Architectural Tailoring</h3>
              <p className="text-xs text-white/80 mt-1 line-clamp-2">
                Structured blazers, relaxed chinos, Supima cotton button-downs, and heritage timepieces.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURED OUTFITS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.2em] text-[#a07855] font-semibold">
            Stylist Curations
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1c1a17] mt-1">
            Featured Outfits & Popular Styles
          </h2>
          <p className="text-xs sm:text-sm text-[#736859] mt-2">
            Complete head-to-toe combinations curated for specific occasions and aesthetics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {INITIAL_FEATURED_OUTFITS.map((outfit) => (
            <div
              key={outfit.id}
              className="group bg-[#faf8f5] rounded-3xl overflow-hidden border border-[#ded5c7] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-4/5 overflow-hidden bg-[#e8e1d5]">
                <img
                  src={outfit.image}
                  alt={outfit.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-semibold uppercase tracking-wider text-[#1c1a17]">
                    {outfit.occasion}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-[#22211e]/80 text-white text-[10px] font-medium backdrop-blur-sm">
                  {outfit.itemsCount} Pieces
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#997e68] font-bold">
                    {outfit.vibe}
                  </span>
                  <h4 className="font-serif text-lg font-semibold text-[#1c1a17] leading-snug mt-1">
                    {outfit.title}
                  </h4>
                  <p className="text-xs text-[#695f52] mt-2 line-clamp-2 leading-relaxed">
                    {outfit.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#eee7db] flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {outfit.tags.slice(0, 2).map((t, i) => (
                      <span
                        key={i}
                        className="text-[9px] px-2 py-0.5 rounded-md bg-[#eee7db] text-[#5c5244]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('stylist');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-semibold text-[#1c1a17] hover:text-[#a07855] flex items-center gap-1 cursor-pointer"
                  >
                    <span>Style Look</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= MEN'S FASHION CATEGORIES SECTION ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#e6ded2] pb-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eee5d8] text-[#5e5345] text-[11px] font-semibold uppercase tracking-wider mb-2">
              <span>Section 01</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1c1a17]">
              Men's Fashion Categories
            </h2>
            <p className="text-xs sm:text-sm text-[#736859] mt-1">
              Explore 12 dedicated categories tailored for modern masculine elegance.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedCategoryFilter('All');
              setSelectedGenderFilter('men');
              setActiveTab('search');
            }}
            className="mt-4 sm:mt-0 text-xs font-semibold uppercase tracking-wider text-[#695e51] hover:text-[#1c1a17] flex items-center gap-1.5 cursor-pointer"
          >
            <span>Browse All Men's Fashion</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 12 Men's Category Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {MEN_CATEGORIES.map((cat) => (
            <div
              key={cat.name}
              onClick={() => handleCategoryClick(cat.name, 'men')}
              className="group relative bg-[#faf8f5] rounded-2xl overflow-hidden border border-[#ded5c7] hover:border-[#b8aa96] cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md"
            >
              <div className="aspect-square w-full overflow-hidden bg-[#e8e0d4] relative">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <h4 className="font-serif text-base sm:text-lg font-semibold leading-tight">
                    {cat.name}
                  </h4>
                </div>
              </div>
              <div className="p-2.5 bg-[#faf8f5] flex items-center justify-between">
                <span className="text-[10px] text-[#786e61] truncate font-medium">
                  {cat.tagline}
                </span>
                <ArrowRight className="w-3 h-3 text-[#a07855] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= WOMEN'S FASHION CATEGORIES SECTION ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#e6ded2] pb-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0e3d5] text-[#6e4d3a] text-[11px] font-semibold uppercase tracking-wider mb-2">
              <span>Section 02</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#1c1a17]">
              Women's Fashion Categories
            </h2>
            <p className="text-xs sm:text-sm text-[#736859] mt-1">
              Explore 16 dedicated categories spanning fluid silks, sculptural accessories, dresses, and heels.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedCategoryFilter('All');
              setSelectedGenderFilter('women');
              setActiveTab('search');
            }}
            className="mt-4 sm:mt-0 text-xs font-semibold uppercase tracking-wider text-[#695e51] hover:text-[#1c1a17] flex items-center gap-1.5 cursor-pointer"
          >
            <span>Browse All Women's Fashion</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 16 Women's Category Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-4">
          {WOMEN_CATEGORIES.map((cat) => (
            <div
              key={cat.name}
              onClick={() => handleCategoryClick(cat.name, 'women')}
              className="group relative bg-[#faf8f5] rounded-2xl overflow-hidden border border-[#ded5c7] hover:border-[#b8aa96] cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md"
            >
              <div className="aspect-square w-full overflow-hidden bg-[#e8e0d4] relative">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <h4 className="font-serif text-base sm:text-lg font-semibold leading-tight">
                    {cat.name}
                  </h4>
                </div>
              </div>
              <div className="p-2 bg-[#faf8f5] flex items-center justify-between">
                <span className="text-[9px] text-[#786e61] truncate font-medium">
                  {cat.tagline}
                </span>
                <ArrowRight className="w-3 h-3 text-[#a07855] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= AI STYLIST CALLOUT BANNER ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="relative rounded-3xl overflow-hidden bg-[#22211e] text-[#faf9f6] p-8 sm:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="max-w-xl z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#d9a87d] text-xs font-semibold uppercase tracking-wider mb-4 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Intelligent Couture Assistant</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-light leading-tight">
              Unsure what to wear for your next event?
            </h2>
            <p className="text-xs sm:text-sm text-[#c9bea9] font-light mt-4 leading-relaxed">
              Ask our Personal AI Stylist. Get customized head-to-toe suggestions, Indian traditional or Indo-Western attire, collegiate casuals, and learn the color theory behind every piece.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => {
                  setActiveTab('stylist');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-7 py-3.5 rounded-full bg-[#faf9f6] text-[#1c1a17] text-xs uppercase tracking-widest font-semibold hover:bg-[#e4dcce] transition-colors shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#a07855]" />
                <span>Open AI Stylist</span>
              </button>
              <button
                onClick={() => {
                  setIsCameraModalOpen(true);
                }}
                className="px-6 py-3.5 rounded-full border border-white/30 text-white hover:bg-white/10 text-xs uppercase tracking-widest font-semibold transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-[#d9a87d]" />
                <span>Analyze Outfit With Camera</span>
              </button>
            </div>
          </div>

          <div className="relative z-10 w-full md:w-80 h-72 rounded-2xl overflow-hidden shadow-2xl border border-white/20">
            <img
              src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80"
              alt="Haute Stylist portrait"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
              <div className="text-white">
                <p className="text-xs font-semibold">Haute Fashion Consultant</p>
                <p className="text-[10px] text-white/80">Active now • Personalized advice</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
