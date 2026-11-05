import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Camera,
  Upload,
  User,
  Sliders,
  Heart,
  Bookmark,
  Check,
  ArrowRight,
  Info,
  Palette,
  Lightbulb,
  RefreshCw,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useFashion } from '../context/FashionContext.tsx';
import { api } from '../services/api.ts';
import {
  ChatMessage,
  StylistOutfitSuggestion,
  CameraStylingResult,
  FashionItem,
  UserProfile,
} from '../types/fashion.ts';
import { CameraCaptureModal } from '../components/CameraCaptureModal.tsx';

const QUICK_PROMPTS = [
  'What should I wear for a college event?',
  'Suggest a casual outfit for me.',
  'Which shoes match this outfit?',
  'Suggest a traditional Indian outfit.',
  'How can I style a white shirt?',
  'Formal interview outfit for summer.',
];

const STYLE_OPTIONS = [
  'Minimalist',
  'Old Money',
  'Streetwear',
  'Casual',
  'Formal',
  'Traditional',
  'Party',
];

const COLOR_OPTIONS = [
  'Classic White',
  'Oatmeal Beige',
  'Midnight Black',
  'Sage Mist',
  'Olive Green',
  'Navy Blue',
  'Terracotta',
  'Champagne Pearl',
  'Warm Gold',
  'Charcoal Black',
];

const PREFERENCE_OPTIONS = [
  'Comfort-first',
  'Tailored/Sharp',
  'Breathable Natural Linens',
  'Oversized Silhouettes',
  'Timeless Classic',
  'Eco-conscious',
];

const OCCASION_OPTIONS = [
  'Casual Day Out',
  'Work/Office',
  'College',
  'Date Night',
  'Wedding/Celebration',
  'Travel',
];

export const StylistPage: React.FC = () => {
  const {
    user,
    wardrobe,
    updateUserProfile,
    stylistPreloadItem,
    setStylistPreloadItem,
    toggleWardrobe,
    isItemInWardrobe,
    setSelectedProductDetail,
  } = useFashion();

  // Mode: consultation chat vs camera styling
  const [activeMode, setActiveMode] = useState<'chat' | 'camera'>('chat');

  // Chat states
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isConsulting, setIsConsulting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Preference editor modal
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [tempProfile, setTempProfile] = useState<Partial<UserProfile>>({});

  // Camera styling states
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraImage, setCameraImage] = useState<string | null>(null);
  const [cameraAnalysis, setCameraAnalysis] = useState<CameraStylingResult | null>(null);
  const [isAnalyzingCamera, setIsAnalyzingCamera] = useState(false);
  const [cameraUserNotes, setCameraUserNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize with personalized welcome message or preloaded item question
  useEffect(() => {
    if (messages.length === 0) {
      if (stylistPreloadItem) {
        const item = stylistPreloadItem;
        const initialText = `I'd love your advice on styling this piece: "${item.name}" (${item.category} in ${item.color}). What complete outfit combinations and footwear do you recommend for it?`;
        handleSendMessage(initialText);
        setStylistPreloadItem(null);
      } else {
        setMessages([
          {
            id: 'msg-welcome',
            sender: 'stylist',
            text: `Bonjour ${
              user?.name ? user.name.split(' ')[0] : ''
            }! I am your ELIZEE Personal Fashion & Styling Consultant. I combine aesthetic color harmony, silhouette proportions, and your saved wardrobe pieces to craft elevated head-to-toe outfits. What occasion or garment are we styling today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    }
  }, [stylistPreloadItem]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isConsulting]);

  const handleSendMessage = async (promptToSend?: string) => {
    const text = (promptToSend || inputValue).trim();
    if (!text || isConsulting) return;

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!promptToSend) setInputValue('');
    setIsConsulting(true);

    try {
      const response = await api.consultStylist(text, user || undefined);
      const assistantMessage: ChatMessage = {
        id: 'msg-resp-' + Date.now(),
        sender: 'stylist',
        text: response.consultationText,
        outfits: response.outfits,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Stylist consultation error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'msg-err-' + Date.now(),
          sender: 'stylist',
          text: 'I encountered a brief connection delay. However, remember that pairing relaxed textures like linen with clean leather shoes creates an effortless high-low aesthetic. Please ask again!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsConsulting(false);
    }
  };

  // Preference Profile handlers
  const handleOpenPreferenceEditor = () => {
    if (user) {
      setTempProfile({
        age: user.age,
        gender: user.gender,
        preferredStyle: user.preferredStyle,
        favouriteColours: user.favouriteColours ? [...user.favouriteColours] : [],
        fashionPreferences: user.fashionPreferences ? [...user.fashionPreferences] : [],
        preferredOccasions: user.preferredOccasions ? [...user.preferredOccasions] : [],
        comfortPreferences: user.comfortPreferences,
      });
    }
    setIsEditingPreferences(true);
  };

  const handleSavePreferences = async () => {
    if (user) {
      await updateUserProfile(tempProfile);
    }
    setIsEditingPreferences(false);
  };

  const toggleColorPreference = (col: string) => {
    setTempProfile((prev) => {
      const current = prev.favouriteColours || [];
      if (current.includes(col)) {
        return { ...prev, favouriteColours: current.filter((c) => c !== col) };
      }
      return { ...prev, favouriteColours: [...current, col] };
    });
  };

  const toggleFashionPriority = (item: string) => {
    setTempProfile((prev) => {
      const current = prev.fashionPreferences || [];
      if (current.includes(item)) {
        return { ...prev, fashionPreferences: current.filter((c) => c !== item) };
      }
      return { ...prev, fashionPreferences: [...current, item] };
    });
  };

  const toggleOccasionPreference = (occ: string) => {
    setTempProfile((prev) => {
      const current = prev.preferredOccasions || [];
      if (current.includes(occ)) {
        return { ...prev, preferredOccasions: current.filter((c) => c !== occ) };
      }
      return { ...prev, preferredOccasions: [...current, occ] };
    });
  };

  // Camera Outfit Analysis
  const handleCameraCapture = async (base64Image: string) => {
    setCameraImage(base64Image);
    setIsAnalyzingCamera(true);
    try {
      const analysis = await api.analyzeOutfit(base64Image, cameraUserNotes);
      setCameraAnalysis(analysis);
    } catch (err) {
      console.error('Failed to analyze camera image:', err);
    } finally {
      setIsAnalyzingCamera(false);
    }
  };

  const handleDeviceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      handleCameraCapture(base64);
    };
    reader.readAsDataURL(file);
  };

  // Add all pieces of an outfit recommendation to wardrobe
  const handleAddOutfitToWardrobe = async (outfit: StylistOutfitSuggestion) => {
    for (const piece of outfit.pieces) {
      if (piece.matchingCatalogItem) {
        await toggleWardrobe(piece.matchingCatalogItem);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#1c1a17]">
      {/* ================= USER PROFILE PREFERENCES BAR ================= */}
      <div className="p-5 rounded-3xl bg-[#faf8f5] border border-[#ded5c7] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#22211e] text-[#faf9f6] flex items-center justify-center font-serif text-lg font-bold shadow-sm">
            {user?.name ? user.name[0] : 'A'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg font-semibold text-[#1c1a17]">
                Styling Profile for {user?.name || 'Guest Stylist'}
              </h3>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#eee5d8] text-[#5c5042] font-semibold">
                Active Preferences
              </span>
            </div>
            <p className="text-xs text-[#706659] mt-0.5">
              Age: <strong>{user?.age || '26'}</strong> • Style:{' '}
              <strong>{user?.preferredStyle || 'Old Money'}</strong> • Palette:{' '}
              <strong>{(user?.favouriteColours || ['Oatmeal', 'Navy', 'Olive']).slice(0, 3).join(', ')}</strong> • Comfort:{' '}
              <span className="italic">{user?.comfortPreferences || 'Relaxed tailored fits'}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenPreferenceEditor}
          className="px-4 py-2 rounded-xl border border-[#c9bead] hover:bg-[#ede5d8] text-xs font-semibold uppercase tracking-wider text-[#3d3830] transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 text-[#a07855]" />
          <span>Edit Style Preferences</span>
        </button>
      </div>

      {/* ================= MODE TOGGLE (Chat vs Camera) ================= */}
      <div className="flex justify-center">
        <div className="p-1 bg-[#ede6da] rounded-full inline-flex border border-[#ded5c7]">
          <button
            onClick={() => setActiveMode('chat')}
            className={`px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeMode === 'chat'
                ? 'bg-[#22211e] text-[#faf9f6] shadow-sm'
                : 'text-[#5c5144] hover:text-[#1c1a17]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#d9a87d]" />
            <span>AI Stylist Consultation</span>
          </button>

          <button
            onClick={() => setActiveMode('camera')}
            className={`px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeMode === 'camera'
                ? 'bg-[#22211e] text-[#faf9f6] shadow-sm'
                : 'text-[#5c5144] hover:text-[#1c1a17]'
            }`}
          >
            <Camera className="w-4 h-4 text-[#d9a87d]" />
            <span>AI Camera Styling</span>
          </button>
        </div>
      </div>

      {/* ================= MODE A: CHAT CONSULTATION ================= */}
      {activeMode === 'chat' && (
        <div className="max-w-4xl mx-auto bg-[#faf8f5] rounded-3xl border border-[#ded5c7] shadow-md overflow-hidden flex flex-col h-[750px]">
          {/* Chat Header */}
          <div className="p-4 px-6 border-b border-[#eee7db] bg-[#faf8f5] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-[#22211e] text-white flex items-center justify-center font-serif text-sm">
                  ✦
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#faf8f5]" />
              </div>
              <div>
                <h4 className="font-serif text-base font-semibold leading-tight text-[#1c1a17]">
                  ELIZEE Haute Stylist
                </h4>
                <p className="text-[10px] text-[#706659]">
                  Informed by your age ({user?.age || '26'}), palette, and {wardrobe.length} saved wardrobe garments
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setMessages([]);
                handleSendMessage('Suggest a fresh seasonal outfit for my profile.');
              }}
              className="text-xs text-[#706659] hover:text-[#1c1a17] flex items-center gap-1 transition-colors"
              title="Start fresh consultation"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Session</span>
            </button>
          </div>

          {/* Quick Prompt Pills */}
          <div className="px-6 py-2.5 bg-[#f5efe6] border-b border-[#eee7db] overflow-x-auto scrollbar-none flex items-center gap-2 min-w-max">
            <span className="text-[10px] uppercase tracking-wider text-[#8a7f72] font-semibold shrink-0">
              Popular Questions:
            </span>
            {QUICK_PROMPTS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                disabled={isConsulting}
                className="text-xs px-3 py-1 rounded-full bg-white hover:bg-[#ede5d8] border border-[#d6ccbd] text-[#3d3830] transition-colors shrink-0 cursor-pointer disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Thread */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'stylist' && (
                  <div className="w-8 h-8 rounded-full bg-[#22211e] text-white flex items-center justify-center font-serif text-xs shrink-0 mt-1">
                    ✦
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-5 ${
                    msg.sender === 'user'
                      ? 'bg-[#22211e] text-[#faf9f6] rounded-tr-none'
                      : 'bg-white border border-[#ded5c7] text-[#1c1a17] shadow-sm rounded-tl-none'
                  }`}
                >
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                    {msg.text}
                  </p>

                  {/* Render Outfits if returned by AI */}
                  {msg.outfits && msg.outfits.length > 0 && (
                    <div className="mt-5 space-y-5">
                      {msg.outfits.map((outfit, oIdx) => (
                        <div
                          key={oIdx}
                          className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e3dacd] text-[#1c1a17] space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eee7db] pb-2.5">
                            <div>
                              <span className="text-[10px] uppercase tracking-wider text-[#a07855] font-bold">
                                Look #{oIdx + 1} • {outfit.vibe}
                              </span>
                              <h5 className="font-serif text-lg font-semibold text-[#1c1a17] leading-tight">
                                {outfit.name}
                              </h5>
                            </div>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#eee5d8] text-[#524739] font-medium">
                              {outfit.occasion}
                            </span>
                          </div>

                          {/* Why this combination works */}
                          <div className="p-3 rounded-xl bg-[#f2ece2] border border-[#ded5c7] text-xs">
                            <p className="font-semibold text-[#665b4f] uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1.5">
                              <Lightbulb className="w-3.5 h-3.5 text-[#a07855]" />
                              Why This Combination Works
                            </p>
                            <p className="text-[#3b352e] leading-relaxed">
                              {outfit.explanation}
                            </p>
                          </div>

                          {/* Pieces Breakdown */}
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#73685a] mb-2">
                              Head-to-Toe Garment Pieces:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {outfit.pieces.map((piece, pIdx) => (
                                <div
                                  key={pIdx}
                                  className="p-2.5 rounded-xl bg-white border border-[#e8dfd3] flex items-start gap-2.5"
                                >
                                  {piece.matchingCatalogItem && (
                                    <img
                                      src={piece.matchingCatalogItem.image}
                                      alt={piece.category}
                                      className="w-12 h-12 rounded-lg object-cover shrink-0 cursor-pointer"
                                      onClick={() => setSelectedProductDetail(piece.matchingCatalogItem!)}
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#a07855]">
                                      {piece.category}
                                    </span>
                                    <p className="text-xs font-medium text-[#1c1a17] line-clamp-2 leading-tight">
                                      {piece.description}
                                    </p>
                                    {piece.matchingCatalogItem && (
                                      <button
                                        onClick={() => toggleWardrobe(piece.matchingCatalogItem!)}
                                        className="mt-1 text-[10px] font-semibold text-[#665b4f] hover:text-[#1c1a17] flex items-center gap-1"
                                      >
                                        <Heart
                                          className={`w-3 h-3 ${
                                            isItemInWardrobe(piece.matchingCatalogItem.id)
                                              ? 'fill-[#853434] text-[#853434]'
                                              : ''
                                          }`}
                                        />
                                        <span>
                                          {isItemInWardrobe(piece.matchingCatalogItem.id)
                                            ? 'In Wardrobe'
                                            : 'Save Piece'}
                                        </span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Color Palette & Micro-Styling Tips */}
                          <div className="pt-2 border-t border-[#eee7db] flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] uppercase font-semibold text-[#73685a]">
                                Palette:
                              </span>
                              <div className="flex items-center gap-1">
                                {outfit.colorPalette.map((col, cIdx) => (
                                  <span
                                    key={cIdx}
                                    title={col}
                                    className="w-4 h-4 rounded-full border border-gray-300 shadow-inner"
                                    style={{
                                      backgroundColor: col.startsWith('#')
                                        ? col
                                        : '#c5b49f',
                                    }}
                                  />
                                ))}
                              </div>
                            </div>

                            <button
                              onClick={() => handleAddOutfitToWardrobe(outfit)}
                              className="px-3 py-1.5 rounded-xl bg-[#22211e] text-[#faf9f6] text-[11px] font-semibold uppercase tracking-wider hover:bg-[#38332c] transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Bookmark className="w-3.5 h-3.5 text-[#d9a87d]" />
                              <span>Save Complete Look</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <span
                    className={`block text-[10px] mt-2 ${
                      msg.sender === 'user' ? 'text-gray-300 text-right' : 'text-[#8a7f72]'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isConsulting && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#22211e] text-white flex items-center justify-center font-serif text-xs">
                  ✦
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#ded5c7] shadow-sm flex items-center gap-2 text-xs text-[#524a40]">
                  <Sparkles className="w-4 h-4 text-[#a07855] animate-spin" />
                  <span>ELIZEE Haute Stylist is tailoring outfit combinations for your silhouette...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-4 bg-white border-t border-[#ded5c7]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about college events, shoes for a look, traditional Indian wear, or white shirt styling..."
                disabled={isConsulting}
                className="flex-1 py-3 px-4 bg-[#faf8f5] border border-[#d6ccbd] rounded-xl text-xs sm:text-sm text-[#1c1a17] placeholder-[#8a7f72] focus:outline-none focus:ring-2 focus:ring-[#22211e]"
              />

              <button
                type="button"
                onClick={() => setIsCameraModalOpen(true)}
                title="Attach outfit photo"
                className="p-3 bg-[#f0ebe1] hover:bg-[#e4dcce] text-[#3d362d] rounded-xl transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4 text-[#a07855]" />
              </button>

              <button
                type="submit"
                disabled={!inputValue.trim() || isConsulting}
                className="p-3 bg-[#22211e] hover:bg-[#38332c] text-white rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODE B: AI CAMERA STYLING & ANALYSIS ================= */}
      {activeMode === 'camera' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="p-6 rounded-3xl bg-[#faf8f5] border border-[#ded5c7] shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-[#22211e] text-white flex items-center justify-center mx-auto mb-3">
              <Camera className="w-6 h-6 text-[#d9a87d]" />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-[#1c1a17]">
              AI Camera Outfit Styling
            </h3>
            <p className="text-xs text-[#706659] max-w-md mx-auto mt-1">
              Capture or upload any clothing piece from your physical wardrobe. Gemini 3.8 Flash will analyze its colors, recommend matching items, suggest jewelry & shoes, and explain how to improve your styling.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setIsCameraModalOpen(true)}
                className="px-6 py-3 bg-[#22211e] hover:bg-[#38332c] text-[#faf9f6] text-xs uppercase tracking-widest font-semibold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-[#d9a87d]" />
                <span>Open Live Camera</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 border border-[#c9bead] hover:bg-[#f0ebe1] text-[#3d362d] text-xs uppercase tracking-wider font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload From Gallery</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleDeviceUpload}
              />
            </div>
          </div>

          {/* Analyzing state */}
          {isAnalyzingCamera && (
            <div className="p-8 text-center bg-white rounded-3xl border border-[#ded5c7] shadow-sm">
              <Sparkles className="w-8 h-8 text-[#a07855] animate-spin mx-auto mb-2" />
              <h4 className="font-serif text-lg font-semibold text-[#1c1a17]">
                Analyzing Garment & Color Harmonies...
              </h4>
              <p className="text-xs text-[#786e61] mt-1">
                Evaluating silhouette rules, matching shoes, suitable jewelry, and day-to-night transitions.
              </p>
            </div>
          )}

          {/* Camera Analysis Results */}
          {cameraAnalysis && !isAnalyzingCamera && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#ded5c7] shadow-md space-y-6">
              {/* Snapshot & Overview */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {cameraImage && (
                  <div className="w-full md:w-56 aspect-square rounded-2xl overflow-hidden bg-[#eee7dc] border border-[#d6ccbd] shrink-0">
                    <img
                      src={cameraImage}
                      alt="Captured piece"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#eee5d8] text-[#524739] font-bold">
                      {cameraAnalysis.vibe}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-semibold text-[#1c1a17]">
                    Outfit Analysis & Styling Blueprint
                  </h3>

                  <div className="flex flex-wrap gap-1.5">
                    {cameraAnalysis.identifiedItems.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-lg bg-[#f5efe6] text-[#4a4237] font-medium"
                      >
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 1. Matching Fashion Items */}
              <div className="p-5 rounded-2xl bg-[#faf8f5] border border-[#e8dfd3]">
                <h4 className="font-serif text-lg font-semibold text-[#1c1a17] mb-2">
                  1. Matching Fashion Items
                </h4>
                <p className="text-xs text-[#706659] mb-3">
                  Complementary shirts, trousers, and foundation layers that pair harmoniously with this piece:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {cameraAnalysis.matchingItems.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-xl border border-[#ded5c7] text-xs text-[#2b2722] flex items-center gap-2"
                    >
                      <span className="text-[#a07855] font-bold">•</span>
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Suitable Accessories (Jewelry, Watches, Bags, Glasses) */}
              <div className="p-5 rounded-2xl bg-[#faf8f5] border border-[#e8dfd3]">
                <h4 className="font-serif text-lg font-semibold text-[#1c1a17] mb-2">
                  2. Suitable Accessories & Accents
                </h4>
                <p className="text-xs text-[#706659] mb-3">
                  Selected eyewear, timepieces, bags, and metallic jewelry to finish the aesthetic:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {cameraAnalysis.suitableAccessories.map((acc, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-xl border border-[#ded5c7] text-xs text-[#2b2722] flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#a07855] shrink-0" />
                      <span>{acc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Alternative Outfit Combinations */}
              <div className="p-5 rounded-2xl bg-[#faf8f5] border border-[#e8dfd3]">
                <h4 className="font-serif text-lg font-semibold text-[#1c1a17] mb-2">
                  3. Alternative Outfit Combinations
                </h4>
                <p className="text-xs text-[#706659] mb-3">
                  How to shift this piece across different occasions and seasons:
                </p>
                <div className="space-y-2">
                  {cameraAnalysis.alternativeCombinations.map((alt, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-xl border border-[#ded5c7] text-xs text-[#2b2722] leading-relaxed"
                    >
                      {alt}
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Color Combinations & Theory */}
              <div className="p-5 rounded-2xl bg-[#faf8f5] border border-[#e8dfd3]">
                <h4 className="font-serif text-lg font-semibold text-[#1c1a17] mb-2 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#a07855]" />
                  <span>4. Color Combinations & Harmony</span>
                </h4>
                <div className="space-y-2">
                  {cameraAnalysis.colorCombinations.map((col, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-xl border border-[#ded5c7] text-xs text-[#2b2722]"
                    >
                      🎨 {col}
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Styling Improvements */}
              <div className="p-5 rounded-2xl bg-[#f2ede4] border border-[#d6ccbd]">
                <h4 className="font-serif text-lg font-semibold text-[#1c1a17] mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-[#a07855]" />
                  <span>5. Styling Improvements & Pro Tips</span>
                </h4>
                <div className="space-y-2">
                  {cameraAnalysis.stylingImprovements.map((tip, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white/90 rounded-xl border border-[#ded5c7] text-xs text-[#2b2722] leading-relaxed"
                    >
                      💡 {tip}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Catalog Items */}
              {cameraAnalysis.catalogRecommendations && cameraAnalysis.catalogRecommendations.length > 0 && (
                <div>
                  <h4 className="font-serif text-lg font-semibold text-[#1c1a17] mb-3">
                    Matching Pieces From ELIZEE Catalog:
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {cameraAnalysis.catalogRecommendations.map((prod) => (
                      <div
                        key={prod.id}
                        className="p-3 bg-[#faf8f5] rounded-2xl border border-[#ded5c7] flex flex-col justify-between"
                      >
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full aspect-square rounded-xl object-cover cursor-pointer"
                          onClick={() => setSelectedProductDetail(prod)}
                        />
                        <div className="mt-2">
                          <p className="text-[10px] uppercase font-bold text-[#a07855]">
                            {prod.category}
                          </p>
                          <p className="text-xs font-semibold text-[#1c1a17] line-clamp-1">
                            {prod.name}
                          </p>
                          <p className="text-xs text-[#6e6355] mt-0.5">${prod.price}</p>
                        </div>
                        <button
                          onClick={() => toggleWardrobe(prod)}
                          className="mt-2 w-full py-1.5 rounded-lg bg-[#22211e] text-white text-[10px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Heart
                            className={`w-3 h-3 ${
                              isItemInWardrobe(prod.id) ? 'fill-[#853434] text-[#853434]' : ''
                            }`}
                          />
                          <span>{isItemInWardrobe(prod.id) ? 'Saved' : 'Save'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================= PREFERENCES CUSTOMIZATION MODAL ================= */}
      {isEditingPreferences && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#faf8f5] rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-[#ded5c7] shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-[#eee7db] pb-4">
              <div>
                <h3 className="font-serif text-2xl font-semibold text-[#1c1a17]">
                  Style Identity & Preferences
                </h3>
                <p className="text-xs text-[#706659]">
                  Personalize the parameters ELIZEE Stylist uses to generate recommendations.
                </p>
              </div>
              <button
                onClick={() => setIsEditingPreferences(false)}
                className="text-[#7a7165] hover:text-[#1c1a17]"
              >
                ✕
              </button>
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#524b42] mb-1.5">
                  Age
                </label>
                <input
                  type="number"
                  min="16"
                  max="100"
                  value={tempProfile.age || 26}
                  onChange={(e) =>
                    setTempProfile({ ...tempProfile, age: parseInt(e.target.value, 10) || 26 })
                  }
                  className="w-full px-3 py-2 bg-white border border-[#d6ccbd] rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#524b42] mb-1.5">
                  Gender Preference
                </label>
                <select
                  value={tempProfile.gender || 'all'}
                  onChange={(e) =>
                    setTempProfile({ ...tempProfile, gender: e.target.value as any })
                  }
                  className="w-full px-3 py-2 bg-white border border-[#d6ccbd] rounded-xl text-sm"
                >
                  <option value="all">All / Unisex</option>
                  <option value="men">Men's Fashion</option>
                  <option value="women">Women's Fashion</option>
                </select>
              </div>
            </div>

            {/* Preferred Clothing Style */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#524b42] mb-2">
                Preferred Clothing Style
              </label>
              <div className="flex flex-wrap gap-2">
                {STYLE_OPTIONS.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setTempProfile({ ...tempProfile, preferredStyle: style })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      tempProfile.preferredStyle === style
                        ? 'bg-[#22211e] text-white'
                        : 'bg-white border border-[#ded5c7] text-[#473f35]'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Favourite Colours */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#524b42] mb-2">
                Favourite Colours (Select multiple)
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((col) => {
                  const isSelected = tempProfile.favouriteColours?.includes(col);
                  return (
                    <button
                      key={col}
                      type="button"
                      onClick={() => toggleColorPreference(col)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#22211e] text-white'
                          : 'bg-white border border-[#ded5c7] text-[#473f35]'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      <span>{col}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferred Occasions */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#524b42] mb-2">
                Preferred Occasions
              </label>
              <div className="flex flex-wrap gap-2">
                {OCCASION_OPTIONS.map((occ) => {
                  const isSelected = tempProfile.preferredOccasions?.includes(occ);
                  return (
                    <button
                      key={occ}
                      type="button"
                      onClick={() => toggleOccasionPreference(occ)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#22211e] text-white'
                          : 'bg-white border border-[#ded5c7] text-[#473f35]'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      <span>{occ}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Clothing Comfort Preferences */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#524b42] mb-1.5">
                Clothing Comfort Preferences
              </label>
              <input
                type="text"
                value={tempProfile.comfortPreferences || ''}
                onChange={(e) =>
                  setTempProfile({ ...tempProfile, comfortPreferences: e.target.value })
                }
                placeholder="e.g. Relaxed silhouettes, soft breathable linen, non-constricting waistbands"
                className="w-full px-3 py-2 bg-white border border-[#d6ccbd] rounded-xl text-xs sm:text-sm"
              />
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-[#eee7db] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditingPreferences(false)}
                className="px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-semibold text-[#5c5144] hover:bg-[#ede5d8]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                className="px-6 py-2.5 bg-[#22211e] text-[#faf9f6] text-xs uppercase tracking-wider font-semibold rounded-xl hover:bg-[#38332c] shadow-sm"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={(base64) => {
          setActiveMode('camera');
          handleCameraCapture(base64);
        }}
        title="AI Camera Outfit Styling"
        subtitle="Capture any garment to evaluate color theory, complementary pieces, and styling tips."
      />
    </div>
  );
};
