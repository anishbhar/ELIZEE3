/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FashionProvider, useFashion } from './context/FashionContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { SearchPage } from './pages/SearchPage.tsx';
import { StylistPage } from './pages/StylistPage.tsx';
import { WardrobePage } from './pages/WardrobePage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { Sparkles, Heart, Compass, Search, Bookmark, User, Shield } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab } = useFashion();

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-[#1c1a17]">
      {/* Sticky Haute Navigation Bar */}
      <Navbar />

      {/* Main Page Content */}
      <main className="flex-1">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'search' && <SearchPage />}
        {activeTab === 'stylist' && <StylistPage />}
        {activeTab === 'wardrobe' && <WardrobePage />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>

      {/* Global Interactive Modals */}
      <AuthModal />
      <ProductDetailModal />

      {/* Elegant Luxury Footer */}
      <footer className="border-t border-[#ede6da] bg-[#faf8f5] text-[#5e5345] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Col 1: Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#22211e] text-white flex items-center justify-center font-serif text-base">
                  E
                </div>
                <span className="font-serif text-2xl tracking-[0.2em] font-semibold text-[#1c1a17] uppercase">
                  ELIZEE
                </span>
              </div>
              <p className="text-xs text-[#7d7162] leading-relaxed">
                Personal AI fashion and styling intelligence for Men and Women. Crafting intentional silhouettes with high-low balance and real-time color theory.
              </p>
            </div>

            {/* Col 2: Navigation */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1c1a17] mb-3">
                Experience
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => {
                      setActiveTab('home');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#1c1a17] transition-colors"
                  >
                    Home & Editorial
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTab('search');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#1c1a17] transition-colors"
                  >
                    Smart Search & Camera
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTab('stylist');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#1c1a17] transition-colors"
                  >
                    Personal AI Stylist
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTab('wardrobe');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#1c1a17] transition-colors"
                  >
                    Digital Wardrobe
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Curated Categories */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1c1a17] mb-3">
                Curations
              </h4>
              <ul className="space-y-2 text-xs text-[#7d7162]">
                <li>Men's French Linen & Oxford Tailoring</li>
                <li>Women's Bias-Cut Silk Slips & Knit Tops</li>
                <li>Indo-Western & Traditional Fusion</li>
                <li>Cellulose Acetate Shades & Heritage Timepieces</li>
                <li>Full-Grain Leather Luggage & Crescent Moon Bags</li>
              </ul>
            </div>

            {/* Col 4: AI Architecture */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1c1a17] mb-3">
                AI Architecture
              </h4>
              <p className="text-xs text-[#7d7162] leading-relaxed">
                Powered by Gemini 3.8 Flash multimodal vision and reasoning. Real-time persistent state synchronization across all sessions.
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0e8dc] text-[#5e4f3f] text-[10px] font-semibold">
                <Sparkles className="w-3 h-3 text-[#a07855]" />
                <span>Multimodal Vision Ready</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#ede6da] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8a7f72]">
            <p>© 2026 ELIZEE Haute Styling & Fashion Intelligence. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Minimalist Design</span>
              <span>•</span>
              <span>Private Digital Wardrobe</span>
              <span>•</span>
              <span>Camera Vision Enabled</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <FashionProvider>
      <AppContent />
    </FashionProvider>
  );
}
