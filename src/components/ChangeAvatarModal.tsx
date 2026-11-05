import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  Link as LinkIcon,
  Sparkles,
  Check,
  RefreshCw,
  RotateCcw,
  AlertCircle,
  User,
} from 'lucide-react';

interface ChangeAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  onSaveAvatar: (newAvatarUrl: string) => Promise<void>;
}

const PRESET_AVATARS = [
  {
    id: 'preset-1',
    name: 'Alexandre',
    tag: 'Old Money',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'preset-2',
    name: 'Julian',
    tag: 'Sartorial Men',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'preset-3',
    name: 'Élise',
    tag: 'Minimalist Chic',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'preset-4',
    name: 'Mateo',
    tag: 'Street Chic',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'preset-5',
    name: 'Camille',
    tag: 'Parisian Glow',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'preset-6',
    name: 'Marcus',
    tag: 'Modern Classic',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'preset-7',
    name: 'Sophia',
    tag: 'Haute Studio',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'preset-8',
    name: 'Leo',
    tag: 'Urban Tailored',
    url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'preset-9',
    name: 'Clara',
    tag: 'Quiet Luxury',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'preset-10',
    name: 'David',
    tag: 'Monochrome',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'preset-11',
    name: 'Helena',
    tag: 'Executive',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'preset-12',
    name: 'Ethan',
    tag: 'Linen & Silk',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=500&q=80',
  },
];

type TabType = 'gallery' | 'upload' | 'camera' | 'url';

export const ChangeAvatarModal: React.FC<ChangeAvatarModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  onSaveAvatar,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('gallery');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatar);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [urlError, setUrlError] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Camera stream refs & states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setSelectedAvatar(currentAvatar);
      setCustomUrl('');
      setUrlError('');
    } else {
      stopCamera();
    }
  }, [isOpen, currentAvatar]);

  useEffect(() => {
    if (activeTab === 'camera' && isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, isOpen]);

  const startCamera = async () => {
    stopCamera();
    setCameraError('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera is not supported on this browser.');
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });
      setStream(mediaStream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      setCameraError(
        err.message || 'Camera permission denied or camera device unavailable.'
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const size = Math.min(video.videoWidth || 640, video.videoHeight || 640);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Crop center square
    const sx = ((video.videoWidth || size) - size) / 2;
    const sy = ((video.videoHeight || size) - size) / 2;

    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setSelectedAvatar(dataUrl);
    stopCamera();
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setSelectedAvatar(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    const trimmed = customUrl.trim();
    if (!trimmed) {
      setUrlError('Please enter a valid image URL');
      return;
    }
    // Basic test
    const img = new Image();
    img.onload = () => {
      setSelectedAvatar(trimmed);
      setUrlError('');
    };
    img.onerror = () => {
      setUrlError('Could not load image from this URL. Please verify the link.');
    };
    img.src = trimmed;
  };

  const handleSave = async () => {
    if (!selectedAvatar) return;
    setIsSaving(true);
    try {
      await onSaveAvatar(selectedAvatar);
      stopCamera();
      onClose();
    } catch (err) {
      console.error('Failed to update avatar:', err);
      alert('Failed to save profile picture. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#faf8f5] rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-[#ded5c7] shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#eee7db] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#22211e] text-[#faf9f6] flex items-center justify-center">
              <Camera className="w-5 h-5 text-[#d9a87d]" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-semibold text-[#1c1a17]">
                Change Profile Picture
              </h3>
              <p className="text-xs text-[#706659]">
                Choose an haute editorial portrait, upload from your device, or take a live photo
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-full hover:bg-[#ede5d8] text-[#7a7165] hover:text-[#1c1a17] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Circular Preview Banner */}
        <div className="p-4 rounded-2xl bg-white border border-[#ded5c7] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={selectedAvatar || currentAvatar}
                alt="Selected Profile Preview"
                className="w-20 h-20 rounded-full object-cover ring-4 ring-[#ded5c7] shadow-md bg-[#eee7db]"
              />
              <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 rounded-full ring-2 ring-white flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-[#a07855]">
                Active Preview
              </p>
              <h4 className="font-serif text-base font-semibold text-[#1c1a17]">
                Ready to Apply to Your Profile
              </h4>
              <p className="text-[11px] text-[#706659]">
                Visible in your ELIZEE navigation bar, atelier account, and styling sessions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedAvatar(PRESET_AVATARS[0].url)}
              title="Reset to default portrait"
              className="px-3 py-1.5 rounded-xl border border-[#ded5c7] hover:bg-[#faf8f5] text-[11px] font-semibold text-[#524a40] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Default</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-[#22211e] hover:bg-[#38332c] text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Save Picture</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-[#eee7db] pb-3">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'gallery'
                ? 'bg-[#22211e] text-white shadow-sm'
                : 'bg-white border border-[#ded5c7] text-[#524a40] hover:bg-[#ede5d8]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Haute Portraits</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-[#22211e] text-white shadow-sm'
                : 'bg-white border border-[#ded5c7] text-[#524a40] hover:bg-[#ede5d8]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>

          <button
            onClick={() => setActiveTab('camera')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-[#22211e] text-white shadow-sm'
                : 'bg-white border border-[#ded5c7] text-[#524a40] hover:bg-[#ede5d8]'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Camera</span>
          </button>

          <button
            onClick={() => setActiveTab('url')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'url'
                ? 'bg-[#22211e] text-white shadow-sm'
                : 'bg-white border border-[#ded5c7] text-[#524a40] hover:bg-[#ede5d8]'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Image URL</span>
          </button>
        </div>

        {/* Tab 1: Haute Curated Gallery */}
        {activeTab === 'gallery' && (
          <div className="space-y-4">
            <p className="text-xs text-[#706659]">
              Select from curated haute fashion editorial portraits crafted for ELIZEE members:
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
              {PRESET_AVATARS.map((preset) => {
                const isSelected = selectedAvatar === preset.url;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedAvatar(preset.url)}
                    className={`group relative p-2 rounded-2xl border transition-all text-center flex flex-col items-center cursor-pointer ${
                      isSelected
                        ? 'border-[#22211e] bg-white ring-2 ring-[#22211e] shadow-md scale-102'
                        : 'border-[#ded5c7] bg-[#faf8f5] hover:border-[#a07855] hover:bg-white'
                    }`}
                  >
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden ring-2 ring-[#eee7db]">
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-108"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-xs font-semibold text-[#1c1a17] line-clamp-1">
                      {preset.name}
                    </p>
                    <span className="text-[9px] uppercase tracking-wider text-[#a07855] font-semibold">
                      {preset.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Upload from Device */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className={`p-8 border-2 border-dashed rounded-3xl text-center transition-colors flex flex-col items-center justify-center cursor-pointer ${
                dragActive
                  ? 'border-[#22211e] bg-[#f0eae1]'
                  : 'border-[#ded5c7] bg-white hover:bg-[#faf8f5]'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-14 h-14 rounded-full bg-[#f4ede4] flex items-center justify-center text-[#706659] mb-3">
                <Upload className="w-6 h-6 text-[#a07855]" />
              </div>
              <h4 className="font-serif text-base font-semibold text-[#1c1a17]">
                Click or Drag & Drop Image Here
              </h4>
              <p className="text-xs text-[#706659] mt-1 max-w-sm">
                Supports JPG, PNG, WebP up to 10MB. We automatically center and optimize it for your profile.
              </p>
              <button
                type="button"
                className="mt-4 px-5 py-2 rounded-xl bg-[#22211e] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#38332c]"
              >
                Browse Photos
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Tab 3: Take Live Camera Photo */}
        {activeTab === 'camera' && (
          <div className="space-y-4">
            {cameraError ? (
              <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
                <p className="text-xs font-medium">{cameraError}</p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 bg-amber-800 text-white text-xs font-semibold uppercase tracking-wider rounded-xl"
                  >
                    Retry Camera
                  </button>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="px-4 py-2 bg-white border border-amber-300 text-amber-900 text-xs font-semibold uppercase tracking-wider rounded-xl"
                  >
                    Upload Photo Instead
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden bg-black flex flex-col items-center justify-center aspect-square max-w-sm mx-auto border border-[#ded5c7] shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />

                {/* Target circular framing guide */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full border-2 border-dashed border-white/70 shadow-2xl" />
                </div>

                <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3">
                  <button
                    onClick={capturePhoto}
                    className="px-6 py-2.5 rounded-full bg-white text-[#1c1a17] font-semibold text-xs uppercase tracking-wider shadow-lg hover:bg-neutral-100 flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                  >
                    <Camera className="w-4 h-4 text-[#a07855]" />
                    <span>Capture Snapshot</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Direct URL */}
        {activeTab === 'url' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#524b42] mb-1.5">
                Paste Image Link (Web URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/my-photo.jpg"
                  value={customUrl}
                  onChange={(e) => {
                    setCustomUrl(e.target.value);
                    setUrlError('');
                  }}
                  className="flex-1 px-4 py-2.5 bg-white border border-[#ded5c7] rounded-xl text-xs sm:text-sm text-[#1c1a17] placeholder:text-[#a89d91]"
                />
                <button
                  onClick={handleApplyUrl}
                  className="px-5 py-2.5 bg-[#22211e] hover:bg-[#38332c] text-white text-xs font-semibold uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Preview
                </button>
              </div>
              {urlError && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{urlError}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#eee7db]">
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl border border-[#ded5c7] hover:bg-[#ede5d8] text-xs font-semibold uppercase tracking-wider text-[#524a40] transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-[#22211e] hover:bg-[#38332c] text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Picture...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Apply as Profile Picture</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
