import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, X, RefreshCw, AlertCircle, Sparkles, Check } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string, mimeType: string) => void;
  title?: string;
  subtitle?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'AI Camera Fashion Scanner',
  subtitle = 'Point your camera at any outfit or clothing item, or upload a photo from your gallery.',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  useEffect(() => {
    if (isOpen && !previewImage) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setCameraError('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera device access is not supported on this browser.');
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      setStream(mediaStream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera permission or availability notice:', err);
      setCameraError(
        err.message || 'Camera permission denied or unavailable. You can easily upload a photo below!'
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
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setPreviewImage(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreviewImage(result);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (previewImage) {
      const mimeType = previewImage.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
      onCapture(previewImage, mimeType);
      handleClose();
    }
  };

  const handleRetake = () => {
    setPreviewImage(null);
    startCamera();
  };

  const handleClose = () => {
    stopCamera();
    setPreviewImage(null);
    setCameraError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#faf8f5] rounded-3xl overflow-hidden border border-[#ded5c7] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#ece4d6] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#22211e] text-white flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#1c1a17] leading-tight">
                {title}
              </h3>
              <p className="text-[11px] text-[#786e61]">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full text-[#7a7165] hover:text-[#1c1a17] hover:bg-[#eee7dc] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport / Live Stream / Preview */}
        <div className="relative bg-[#1a1917] aspect-4/3 flex items-center justify-center overflow-hidden">
          {previewImage ? (
            <div className="relative w-full h-full">
              <img
                src={previewImage}
                alt="Captured fashion piece"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md text-white text-xs rounded-full flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Photo Ready for AI Analysis</span>
              </div>
            </div>
          ) : cameraActive ? (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Modern viewfinder overlay */}
              <div className="absolute inset-8 border border-white/40 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-t-2 border-l-2 border-white" />
                  <div className="w-4 h-4 border-t-2 border-r-2 border-white" />
                </div>
                <div className="text-center text-[11px] font-medium text-white/90 bg-black/40 backdrop-blur-sm py-1 px-3 rounded-full mx-auto">
                  Center clothing item inside frame
                </div>
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-b-2 border-l-2 border-white" />
                  <div className="w-4 h-4 border-b-2 border-r-2 border-white" />
                </div>
              </div>

              {/* Flip camera control */}
              <button
                type="button"
                onClick={() =>
                  setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
                }
                title="Switch camera"
                className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-8 text-center max-w-sm text-[#d4cbbf]">
              <AlertCircle className="w-10 h-10 mx-auto text-[#a07855] mb-2" />
              <p className="text-xs leading-relaxed mb-4 text-[#e0d8cd]">
                {cameraError || 'Camera feed paused.'}
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 bg-[#f0ebe1] hover:bg-white text-[#22211e] rounded-xl text-xs font-semibold uppercase tracking-wider transition-all inline-flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload From Device</span>
              </button>
            </div>
          )}
        </div>

        {/* Hidden input for gallery upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Action Controls */}
        <div className="p-5 bg-[#faf8f5] flex items-center justify-between gap-3">
          {previewImage ? (
            <>
              <button
                onClick={handleRetake}
                className="px-4 py-2.5 rounded-xl border border-[#d6cbba] hover:bg-[#eee6da] text-[#423c34] text-xs font-medium uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>

              <button
                onClick={handleConfirm}
                className="flex-1 py-3 px-5 rounded-xl bg-[#22211e] hover:bg-[#3b3731] text-[#faf9f6] text-xs uppercase tracking-widest font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#d9a87d]" />
                <span>Analyze with AI</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl border border-[#d6cbba] hover:bg-[#eee6da] text-[#423c34] text-xs font-medium uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload Photo</span>
              </button>

              {cameraActive && (
                <button
                  onClick={capturePhoto}
                  className="flex-1 py-3 px-5 rounded-xl bg-[#22211e] hover:bg-[#3b3731] text-[#faf9f6] text-xs uppercase tracking-widest font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Snapshot</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
