import React, { useState } from 'react';
import {
  User,
  Mail,
  Calendar,
  Sparkles,
  Bookmark,
  Clock,
  LogOut,
  Edit3,
  Check,
  Trash2,
  ShieldCheck,
  Palette,
  Layers,
  ArrowRight,
  Camera,
  CheckCircle2,
} from 'lucide-react';
import { useFashion } from '../context/FashionContext.tsx';
import { api } from '../services/api.ts';
import { ChangeAvatarModal } from '../components/ChangeAvatarModal.tsx';

export const ProfilePage: React.FC = () => {
  const {
    user,
    wardrobe,
    savedOutfits,
    logoutUser,
    updateUserProfile,
    setActiveTab,
    setIsAuthModalOpen,
  } = useFashion();

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(user?.bio || '');
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  React.useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const h = await api.getSearchHistory();
      setSearchHistory(h);
    } catch (e) {
      console.error('Failed to load search history:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await api.clearSearchHistory();
      setSearchHistory([]);
    } catch (e) {
      console.error('Failed to clear search history:', e);
    }
  };

  const handleSaveBio = async () => {
    await updateUserProfile({ bio: bioInput, name: nameInput });
    setIsEditingBio(false);
  };

  const [isChangeAvatarModalOpen, setIsChangeAvatarModalOpen] = useState(false);
  const [avatarUpdateSuccess, setAvatarUpdateSuccess] = useState(false);

  const handleSaveAvatar = async (newAvatarUrl: string) => {
    await updateUserProfile({ avatar: newAvatarUrl });
    setAvatarUpdateSuccess(true);
    setTimeout(() => setAvatarUpdateSuccess(false), 4000);
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-24 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-[#22211e] text-white flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-[#d9a87d]" />
        </div>
        <h2 className="font-serif text-3xl font-semibold text-[#1c1a17]">
          Guest Stylist Session
        </h2>
        <p className="text-xs text-[#706659] mt-2 mb-6">
          Sign in or create an account to persist your digital wardrobe and AI style preferences indefinitely.
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="px-8 py-3 bg-[#22211e] text-white text-xs uppercase tracking-widest font-semibold rounded-full hover:bg-[#38332c] transition-colors"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#1c1a17]">
      {/* Success Notification */}
      {avatarUpdateSuccess && (
        <div className="p-4 rounded-2xl bg-[#f2f8f0] border border-[#cbe3c5] text-[#2c5324] text-xs font-medium flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile picture updated successfully across your ELIZEE atelier session.</span>
          </div>
          <button
            onClick={() => setAvatarUpdateSuccess(false)}
            className="text-[#2c5324] hover:text-black font-semibold text-xs px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* ================= PROFILE HEADER BANNER ================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#faf8f5] border border-[#ded5c7] shadow-sm flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          {/* Interactive Avatar with Hover & Camera Badge */}
          <div className="relative group cursor-pointer" onClick={() => setIsChangeAvatarModalOpen(true)}>
            <img
              src={user.avatar}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-[#ded5c7] group-hover:ring-[#a07855] shadow-md transition-all duration-200"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200 backdrop-blur-[1px]">
              <Camera className="w-5 h-5 text-[#f4ede4]" />
              <span className="text-[9px] font-semibold uppercase tracking-wider mt-0.5">Change</span>
            </div>
            {/* Corner Camera Button Badge */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsChangeAvatarModalOpen(true);
              }}
              title="Change Profile Picture"
              className="absolute bottom-0 right-0 p-2 rounded-full bg-[#22211e] text-white hover:bg-[#38332c] shadow-md ring-2 ring-[#faf8f5] transition-transform hover:scale-110 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-[#d9a87d]" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1c1a17]">
                {user.name}
              </h2>
              <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#eee5d8] text-[#524739] font-bold">
                Haute Member
              </span>
            </div>

            <p className="text-xs text-[#706659] flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{user.email}</span>
            </p>

            <p className="text-[11px] text-[#8a7f72] flex items-center justify-center sm:justify-start gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Member since {user.joinedDate}</span>
            </p>

            <div className="pt-2 flex items-center justify-center sm:justify-start gap-1.5 text-[11px] text-[#5e7d58]">
              <ShieldCheck className="w-4 h-4" />
              <span>One-Time Login Active (Persistent across browser reloads)</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
          <button
            onClick={() => setIsChangeAvatarModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-white border border-[#c9bead] hover:bg-[#ede5d8] text-xs font-semibold uppercase tracking-wider text-[#3d3830] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Camera className="w-3.5 h-3.5 text-[#a07855]" />
            <span>Change Photo</span>
          </button>

          <button
            onClick={() => {
              setIsEditingBio(!isEditingBio);
              setBioInput(user.bio);
              setNameInput(user.name);
            }}
            className="px-4 py-2 rounded-xl border border-[#c9bead] hover:bg-[#ede5d8] text-xs font-semibold uppercase tracking-wider text-[#3d3830] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditingBio ? 'Cancel' : 'Edit Profile'}</span>
          </button>

          <button
            onClick={logoutUser}
            className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Inline Bio & Info Editor */}
      {isEditingBio && (
        <div className="p-6 rounded-3xl bg-white border border-[#ded5c7] shadow-sm space-y-4 animate-in fade-in">
          <h3 className="font-serif text-lg font-semibold text-[#1c1a17]">
            Edit Basic Information & Bio
          </h3>

          {/* Dedicated Profile Picture Row */}
          <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#d6ccbd] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-[#ded5c7]"
              />
              <div>
                <p className="text-xs font-semibold text-[#1c1a17]">Profile Picture</p>
                <p className="text-[11px] text-[#706659]">
                  Upload from device, take live camera photo, or choose from haute portraits
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsChangeAvatarModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#22211e] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#38332c] flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Camera className="w-3.5 h-3.5 text-[#d9a87d]" />
              <span>Change Photo</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#524b42] mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6ccbd] rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#524b42] mb-1">
              Personal Bio / Style Manifesto
            </label>
            <textarea
              rows={3}
              value={bioInput}
              onChange={(e) => setBioInput(e.target.value)}
              className="w-full px-3 py-2 bg-[#faf8f5] border border-[#d6ccbd] rounded-xl text-xs sm:text-sm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditingBio(false)}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#695f53]"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveBio}
              className="px-5 py-2 bg-[#22211e] text-white text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-[#38332c]"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* ================= BIO & CORE PREFERENCES GRID ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Style Identity Card */}
        <div className="p-6 rounded-3xl bg-[#faf8f5] border border-[#ded5c7] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#eee7db]">
            <h3 className="font-serif text-xl font-semibold text-[#1c1a17] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#a07855]" />
              <span>AI Stylist Preferences</span>
            </h3>
            <button
              onClick={() => setActiveTab('stylist')}
              className="text-xs font-semibold text-[#a07855] hover:underline"
            >
              Update in Stylist
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-[#eee7db]">
              <span className="text-[#73695d]">Age:</span>
              <span className="font-medium text-[#1c1a17]">{user.age} years old</span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#eee7db]">
              <span className="text-[#73695d]">Gender Preference:</span>
              <span className="font-medium text-[#1c1a17] capitalize">{user.gender}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#eee7db]">
              <span className="text-[#73695d]">Preferred Style:</span>
              <span className="font-medium text-[#1c1a17]">{user.preferredStyle}</span>
            </div>

            <div className="py-1 border-b border-[#eee7db]">
              <span className="text-[#73695d] block mb-1">Favourite Colour Palette:</span>
              <div className="flex flex-wrap gap-1.5">
                {(user.favouriteColours || []).map((col, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-full bg-white border border-[#ded5c7] text-[#3d362e] text-[11px]"
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>

            <div className="py-1 border-b border-[#eee7db]">
              <span className="text-[#73695d] block mb-1">Fashion Priorities:</span>
              <div className="flex flex-wrap gap-1.5">
                {(user.fashionPreferences || []).map((fav, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-full bg-[#f2ece2] text-[#524739] text-[11px]"
                  >
                    ✓ {fav}
                  </span>
                ))}
              </div>
            </div>

            <div className="py-1">
              <span className="text-[#73695d] block mb-0.5">Comfort Preference:</span>
              <p className="font-medium text-[#26231f] italic">{user.comfortPreferences}</p>
            </div>
          </div>
        </div>

        {/* Digital Wardrobe Summary Card */}
        <div className="p-6 rounded-3xl bg-[#faf8f5] border border-[#ded5c7] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#eee7db]">
            <h3 className="font-serif text-xl font-semibold text-[#1c1a17] flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[#a07855]" />
              <span>Digital Wardrobe Overview</span>
            </h3>
            <button
              onClick={() => setActiveTab('wardrobe')}
              className="text-xs font-semibold text-[#a07855] hover:underline flex items-center gap-1"
            >
              <span>Open Wardrobe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-white rounded-2xl border border-[#ded5c7]">
              <span className="font-serif text-3xl font-semibold text-[#1c1a17]">
                {wardrobe.length}
              </span>
              <p className="text-[11px] uppercase tracking-wider text-[#736859] font-medium mt-1">
                Saved Garments
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#ded5c7]">
              <span className="font-serif text-3xl font-semibold text-[#1c1a17]">
                {savedOutfits.length}
              </span>
              <p className="text-[11px] uppercase tracking-wider text-[#736859] font-medium mt-1">
                Outfit Ensembles
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#544a3e] uppercase tracking-wider">
              Recently Saved Pieces:
            </p>
            <div className="grid grid-cols-4 gap-2">
              {wardrobe.slice(0, 4).map((w) => (
                <div key={w.id} className="relative aspect-square rounded-xl overflow-hidden bg-[#e8dfd3]">
                  <img
                    src={w.product.image}
                    alt={w.product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-1 text-white text-[9px] font-semibold text-center opacity-0 hover:opacity-100 transition-opacity">
                    {w.product.category}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= SEARCH HISTORY SECTION ================= */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#faf8f5] border border-[#ded5c7] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#eee7db]">
          <h3 className="font-serif text-xl font-semibold text-[#1c1a17] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#a07855]" />
            <span>Search History & AI Query Activity</span>
          </h3>

          {searchHistory.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-xs text-[#8a7f72] hover:text-red-700 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {searchHistory.length === 0 ? (
          <p className="text-xs text-[#8a7f72] py-4 text-center">No search history recorded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {searchHistory.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-white rounded-xl border border-[#ded5c7] flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-medium text-[#1c1a17]">{item.query}</p>
                  <p className="text-[10px] text-[#8a7f72]">
                    {new Date(item.timestamp).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {item.categoryDetected && (
                  <span className="text-[9px] px-2 py-0.5 rounded-md bg-[#eee5d8] text-[#5e5143] font-semibold">
                    {item.categoryDetected}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Change Avatar Modal */}
      <ChangeAvatarModal
        isOpen={isChangeAvatarModalOpen}
        onClose={() => setIsChangeAvatarModalOpen(false)}
        currentAvatar={user.avatar}
        onSaveAvatar={handleSaveAvatar}
      />
    </div>
  );
};
