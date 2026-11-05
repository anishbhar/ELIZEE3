import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Bookmark,
  User,
  Menu,
  X,
  Compass,
  Camera,
  LogOut,
  ChevronRight,
  Heart,
} from 'lucide-react';
import { useFashion } from '../context/FashionContext.tsx';

interface NavItem {
  id: 'home' | 'search' | 'stylist' | 'wardrobe' | 'profile';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  highlight?: boolean;
  count?: number;
}

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    wardrobe,
    user,
    setIsAuthModalOpen,
    setSelectedCategoryFilter,
  } = useFashion();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'search', label: 'Search', icon: Search, badge: 'Smart' },
    { id: 'stylist', label: 'AI Stylist', icon: Sparkles, highlight: true },
    {
      id: 'wardrobe',
      label: 'My Wardrobe',
      icon: Bookmark,
      count: wardrobe.length,
    },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleNavClick = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#faf9f6]/90 backdrop-blur-md border-b border-[#ece6dc] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-[#22211e] flex items-center justify-center text-[#faf9f6] shadow-sm transition-transform duration-300 group-hover:scale-105">
              <span className="font-serif text-xl tracking-wider font-light">E</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl tracking-[0.2em] font-semibold text-[#1c1a17] leading-none uppercase">
                ELIZEE
              </span>
              <span className="text-[10px] tracking-[0.25em] text-[#8c8273] uppercase font-medium mt-1">
                Personal AI Stylist
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#22211e] text-[#faf9f6] shadow-sm'
                      : 'text-[#4a453e] hover:text-[#1c1a17] hover:bg-[#f0ebe1]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      item.highlight && !isActive ? 'text-[#a07855] animate-pulse' : ''
                    }`}
                  />
                  <span>{item.label}</span>

                  {item.badge && !isActive && (
                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#e8ded1] text-[#6b5847] font-semibold">
                      {item.badge}
                    </span>
                  )}

                  {typeof item.count === 'number' && item.count > 0 && (
                    <span
                      className={`text-xs px-1.5 py-0.2 rounded-full font-semibold ${
                        isActive
                          ? 'bg-[#a07855] text-white'
                          : 'bg-[#e4dcce] text-[#3d3830]'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls: Quick Search, User Account */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Search Shortcut */}
            <button
              onClick={() => {
                setSelectedCategoryFilter('All');
                handleNavClick('search');
              }}
              title="Search Fashion Catalog"
              className="p-2.5 rounded-full text-[#5e584f] hover:text-[#1c1a17] hover:bg-[#ede7dc] transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wardrobe Heart Shortcut */}
            <button
              onClick={() => handleNavClick('wardrobe')}
              title="My Wardrobe"
              className="relative p-2.5 rounded-full text-[#5e584f] hover:text-[#1c1a17] hover:bg-[#ede7dc] transition-colors"
            >
              <Heart className="w-5 h-5" />
              {wardrobe.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#a07855] rounded-full ring-2 ring-[#faf9f6]" />
              )}
            </button>

            {/* User Profile / Login status */}
            {user ? (
              <div
                onClick={() => handleNavClick('profile')}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-[#ded5c7] hover:border-[#b8ac9a] bg-[#faf8f4] cursor-pointer transition-all hover:shadow-sm"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-[#c9bcab]"
                />
                <span className="text-xs font-medium text-[#2f2b26] max-w-[100px] truncate">
                  {user.name.split(' ')[0]}
                </span>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-full bg-[#22211e] text-[#faf9f6] hover:bg-[#383530] transition-colors shadow-sm"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => handleNavClick('search')}
              className="p-2 text-[#4a453e] hover:text-[#1c1a17]"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#4a453e] hover:text-[#1c1a17]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#ede7dc] bg-[#faf9f6] px-4 pt-4 pb-6 space-y-2 animate-in slide-in-from-top duration-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#22211e] text-[#faf9f6]'
                    : 'text-[#4a453e] hover:bg-[#f0ebe1]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${item.highlight ? 'text-[#c2966e]' : ''}`} />
                  <span>{item.label}</span>
                </div>
                {typeof item.count === 'number' && item.count > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      isActive ? 'bg-[#a07855] text-white' : 'bg-[#e4dcce] text-[#3d3830]'
                    }`}
                  >
                    {item.count} items
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 border-t border-[#ede7dc] mt-4">
            {user ? (
              <div
                onClick={() => handleNavClick('profile')}
                className="flex items-center justify-between p-3 rounded-xl bg-[#f2ede4] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[#1c1a17]">{user.name}</p>
                    <p className="text-xs text-[#70675a]">{user.email}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#8a7f72]" />
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsAuthModalOpen(true);
                }}
                className="w-full py-3 rounded-xl bg-[#22211e] text-[#faf9f6] text-sm font-medium text-center"
              >
                Sign In / Create Account
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
