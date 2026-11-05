import React from 'react';
import { X, Heart, Sparkles, Check, Tag, Shield, RotateCcw } from 'lucide-react';
import { useFashion } from '../context/FashionContext.tsx';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProductDetail,
    setSelectedProductDetail,
    toggleWardrobe,
    isItemInWardrobe,
    setActiveTab,
    setStylistPreloadItem,
  } = useFashion();

  if (!selectedProductDetail) return null;

  const item = selectedProductDetail;
  const inWardrobe = isItemInWardrobe(item.id);

  const handleConsultStylist = () => {
    setStylistPreloadItem(item);
    setSelectedProductDetail(null);
    setActiveTab('stylist');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#faf8f5] rounded-3xl overflow-hidden border border-[#ded5c7] shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={() => setSelectedProductDetail(null)}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/80 md:bg-[#f0ebe1] text-[#332f2a] hover:bg-white transition-colors shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image */}
        <div className="md:w-1/2 relative bg-[#eee8de] min-h-[320px] md:min-h-full">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 flex flex-col gap-1.5">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-[#1c1a17] text-[11px] font-semibold uppercase tracking-wider rounded-full shadow-sm">
              {item.gender === 'men' ? "Men's Collection" : item.gender === 'women' ? "Women's Collection" : 'Unisex'}
            </span>
            <span className="px-3 py-1 bg-[#22211e]/90 text-white text-[11px] font-medium tracking-wide rounded-full shadow-sm">
              {item.style}
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="md:w-1/2 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#7d7366] uppercase tracking-wider mb-1">
              <span>{item.category}</span>
              <span className="flex items-center gap-1 text-[#b58d3d] font-semibold">
                ★ {item.rating.toFixed(1)} / 5.0
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1c1a17] leading-snug">
              {item.name}
            </h2>

            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-2xl font-light text-[#1c1a17]">${item.price}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#eee7db] text-[#595044] font-medium">
                {item.occasion}
              </span>
            </div>

            {/* Color swatch */}
            <div className="mt-4 flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-full border border-gray-300 shadow-inner"
                style={{ backgroundColor: item.colorHex }}
              />
              <span className="text-xs text-[#524b42] font-medium">{item.color}</span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#595147] mt-3 leading-relaxed">
              {item.description}
            </p>

            {/* Material */}
            <div className="mt-4 p-3 rounded-2xl bg-[#f2ece2] border border-[#e3dacf]">
              <p className="text-[11px] uppercase tracking-wider text-[#736859] font-semibold">
                Fabric & Composition
              </p>
              <p className="text-xs text-[#24211d] font-medium mt-0.5">{item.material}</p>
            </div>

            {/* Pairing Tips */}
            {item.pairingTips && item.pairingTips.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#574e43] mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#a07855]" />
                  Stylist Pairing Notes
                </p>
                <ul className="space-y-1.5">
                  {item.pairingTips.map((tip, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-[#5c5348] flex items-start gap-2 bg-[#f7f4ed] p-2 rounded-xl"
                    >
                      <span className="text-[#a07855] font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-[#ede6da] flex flex-col gap-2.5">
            <button
              onClick={() => toggleWardrobe(item)}
              className={`w-full py-3 px-4 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                inWardrobe
                  ? 'bg-[#ded6c8] text-[#3d3830] hover:bg-[#d1c7b5]'
                  : 'bg-[#22211e] hover:bg-[#3b3731] text-[#faf9f6]'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${inWardrobe ? 'fill-[#853434] text-[#853434]' : ''}`}
              />
              <span>{inWardrobe ? 'Saved in My Wardrobe' : 'Add to My Wardrobe'}</span>
            </button>

            <button
              onClick={handleConsultStylist}
              className="w-full py-2.5 px-4 rounded-xl border border-[#c4b7a4] hover:bg-[#f2ece2] text-[#2c2823] text-xs font-medium uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#a07855]" />
              <span>Ask AI Stylist: How To Style This?</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
