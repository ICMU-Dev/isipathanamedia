import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import ReactCrop, { centerCrop, makeAspectCrop, convertToPixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { X, Crop, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

const ASPECT_RATIO = 16 / 9;

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

const ImageCropperModal = ({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
  aspectRatio = 16 / 9,
  aspectRatioLabel,
}) => {
  const [mounted, setMounted] = useState(false);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [safeImageSrc, setSafeImageSrc] = useState(null);
  const [isLoadingSrc, setIsLoadingSrc] = useState(false);
  const imgRef = useRef(null);
  const objectUrlRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ensure remote images are converted to local blob URLs to prevent tainted canvas SecurityError
  useEffect(() => {
    if (!isOpen || !imageSrc) {
      setSafeImageSrc(null);
      return;
    }

    if (imageSrc.startsWith("blob:") || imageSrc.startsWith("data:")) {
      setSafeImageSrc(imageSrc);
      return;
    }

    let isCancelled = false;
    setIsLoadingSrc(true);

    const loadAsBlob = async () => {
      try {
        let blob = null;

        // Attempt 1: Direct CORS fetch
        try {
          const res = await fetch(imageSrc, { mode: "cors" });
          if (res.ok) {
            blob = await res.blob();
          }
        } catch (_) {}

        // Attempt 2: Netlify proxy-image endpoint
        if (!blob) {
          try {
            const proxyRes = await fetch(`/api/proxy-image?url=${encodeURIComponent(imageSrc)}`);
            if (proxyRes.ok) {
              blob = await proxyRes.blob();
            }
          } catch (_) {}
        }

        // Attempt 3: AllOrigins proxy fallback
        if (!blob) {
          try {
            const allOriginsRes = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(imageSrc)}`);
            if (allOriginsRes.ok) {
              blob = await allOriginsRes.blob();
            }
          } catch (_) {}
        }

        if (isCancelled) return;

        if (blob && blob.type && blob.type.startsWith("image")) {
          const localUrl = URL.createObjectURL(blob);
          if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
          }
          objectUrlRef.current = localUrl;
          setSafeImageSrc(localUrl);
        } else {
          setSafeImageSrc(imageSrc);
        }
      } catch (err) {
        if (!isCancelled) {
          console.warn("Could not load image as blob, using original src:", err);
          setSafeImageSrc(imageSrc);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingSrc(false);
        }
      }
    };

    loadAsBlob();

    return () => {
      isCancelled = true;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [isOpen, imageSrc]);

  if (!isOpen || !imageSrc || !mounted) return null;

  const currentRatio = aspectRatio || 16 / 9;
  const isPortrait = Math.abs(currentRatio - 3 / 4) < 0.05;
  const defaultLabel = isPortrait
    ? "3:4 Portrait Ratio (Quick Update)"
    : "16:9 Widescreen Ratio (Article)";
  const label = aspectRatioLabel || defaultLabel;

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const initialCrop = centerAspectCrop(width, height, currentRatio);
    setCrop(initialCrop);
    setCompletedCrop(convertToPixelCrop(initialCrop, width, height));
  };

  const generateCroppedImage = async () => {
    const image = imgRef.current;
    if (!image) return null;

    let targetCrop = completedCrop;
    if (!targetCrop && crop) {
      targetCrop = convertToPixelCrop(crop, image.width, image.height);
    }
    if (!targetCrop || !targetCrop.width || !targetCrop.height) {
      const initial = centerAspectCrop(image.width, image.height, currentRatio);
      targetCrop = convertToPixelCrop(initial, image.width, image.height);
    }
    if (!targetCrop || !targetCrop.width || !targetCrop.height) return null;

    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = targetCrop.width * scaleX;
    canvas.height = targetCrop.height * scaleY;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(
      image,
      targetCrop.x * scaleX,
      targetCrop.y * scaleY,
      targetCrop.width * scaleX,
      targetCrop.height * scaleY,
      0,
      0,
      targetCrop.width * scaleX,
      targetCrop.height * scaleY,
    );

    return new Promise((resolve) => {
      try {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              console.error("Canvas is empty");
              resolve(null);
              return;
            }
            blob.name = "cropped.jpeg";
            const file = new File([blob], "cropped-cover.jpeg", {
              type: "image/jpeg",
            });
            resolve(file);
          },
          "image/jpeg",
          0.95,
        );
      } catch (err) {
        console.error("Failed to crop image blob:", err);
        resolve(null);
      }
    });
  };

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      const croppedFile = await generateCroppedImage();
      if (croppedFile) {
        onCropComplete(croppedFile);
      } else {
        toast.error("Failed to crop image. The image could not be processed.");
      }
    } catch (err) {
      console.error("Failed to crop image:", err);
      toast.error("Cropping failed: " + (err?.message || "Unknown error"));
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isProcessing) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isProcessing, onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[260] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) onClose();
      }}
    >
      <div
        className="bg-[var(--admin-input-bg)] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl max-w-3xl w-full flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-theme-accent/10 flex items-center justify-center text-theme-accent">
              <Crop size={18} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Crop Cover Image</h3>
              <p className="text-white/50 text-[11px] font-mono tracking-wider">
                {label}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cropper"
            className="p-2 text-white/50 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] rounded-full transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-auto bg-black flex items-center justify-center min-h-[300px]">
          {isLoadingSrc ? (
            <div className="flex flex-col items-center justify-center gap-3 p-8 text-white/60">
              <Loader2 size={32} className="animate-spin text-theme-accent" />
              <p className="text-xs font-medium tracking-wide">Preparing image for editing...</p>
            </div>
          ) : (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={currentRatio}
              className="max-h-[60vh]">
              <img
                ref={imgRef}
                src={safeImageSrc || imageSrc}
                alt="Crop preview"
                onLoad={onImageLoad}
                className="max-h-[60vh] object-contain"
              />
            </ReactCrop>
          )}
        </div>

        <div className="p-4 md:p-6 border-t border-white/[0.06] flex items-center justify-end gap-3 bg-[var(--admin-input-bg)]">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-2xl border border-white/[0.06] text-white/70 hover:text-white hover:bg-white/[0.05] text-xs font-bold uppercase tracking-widest transition-all cursor-pointer">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isProcessing}
            className="px-8 py-3 rounded-2xl bg-theme-accent text-black hover:bg-[#00cc00] shadow-[0_0_15px_rgba(0,255,0,0.2)] text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Cropping...
              </>
            ) : (
              <>
                <Check size={16} /> Apply Crop
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ImageCropperModal;
