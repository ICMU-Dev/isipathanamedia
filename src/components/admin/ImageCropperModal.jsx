import React, { useState, useRef } from "react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { X, Crop, Check } from "lucide-react";

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
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);

  if (!isOpen || !imageSrc) return null;

  const currentRatio = aspectRatio || 16 / 9;
  const isPortrait = Math.abs(currentRatio - 3 / 4) < 0.05;
  const defaultLabel = isPortrait
    ? "3:4 Portrait Ratio (Quick Update)"
    : "16:9 Widescreen Ratio (Article)";
  const label = aspectRatioLabel || defaultLabel;

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, currentRatio));
  };

  const generateCroppedImage = async () => {
    if (!completedCrop || !imgRef.current) return;

    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error("Canvas is empty");
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
    });
  };

  const handleSave = async () => {
    const croppedFile = await generateCroppedImage();
    if (croppedFile) {
      onCropComplete(croppedFile);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[var(--admin-input-bg)] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl max-w-3xl w-full flex flex-col max-h-[90vh]">
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
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-auto bg-black flex items-center justify-center min-h-[300px]">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={currentRatio}
            className="max-h-[60vh]">
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop preview"
              onLoad={onImageLoad}
              className="max-h-[60vh] object-contain"
              crossOrigin="anonymous"
            />
          </ReactCrop>
        </div>

        <div className="p-4 md:p-6 border-t border-white/[0.06] flex items-center justify-end gap-3 bg-[var(--admin-input-bg)]">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-2xl border border-white/[0.06] text-white/70 hover:text-white hover:bg-white/[0.05] text-xs font-bold uppercase tracking-widest transition-all">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-8 py-3 rounded-2xl bg-theme-accent text-black hover:bg-[#00cc00] shadow-[0_0_15px_rgba(0,255,0,0.2)] text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2">
            <Check size={16} /> Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;
