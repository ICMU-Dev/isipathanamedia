import React, { useState, useEffect } from "react";
import iconLogo from "../../../public/apple-touch-icon.png";

// Session-level memory cache for loaded image URLs to prevent re-render flickering
const loadedImageCache = new Set();

/**
 * ImageWithLoader
 * A wrapper for images that displays a pulsing placeholder logo while the main image
 * is loading. If the image fails to load (e.g. broken/expired URL) or is missing,
 * it universally displays the preloading placeholder logo.
 * Uses a memory cache to ensure already-loaded images display instantaneously without flashing.
 */
const ImageWithLoader = ({
  src,
  alt,
  className = "",
  imageClassName = "w-64 sm:w-40 h-32 sm:h-40 object-cover scale-125",
  fallbackIconClassName = "w-64 sm:w-40 h-32 sm:h-40 opacity-40 object-contain grayscale scale-125",
  fallbackContainerClassName = "bg-white/[0.02]",
}) => {
  const [isLoaded, setIsLoaded] = useState(() => (src ? loadedImageCache.has(src) : false));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (src && loadedImageCache.has(src)) {
      setIsLoaded(true);
      setHasError(false);
    } else {
      setIsLoaded(false);
      setHasError(false);
    }
  }, [src]);

  const handleLoad = () => {
    if (src) loadedImageCache.add(src);
    setIsLoaded(true);
  };

  const handleError = () => {
    if (src) loadedImageCache.delete(src);
    setHasError(true);
  };

  return (
    <div className={`relative w-full h-full overflow-hidden bg-black/40  ${className}`}>
      {/* 
        PRELOADING & FALLBACK PLACEHOLDER LOGO 
        Universally displays the media unit logo watermark.
      */}
      <div
        className={`absolute inset-0 flex items-center justify-center ${fallbackContainerClassName} transition-opacity duration-300 ${
          isLoaded && !hasError ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <img
          src={iconLogo}
          alt="Loading placeholder"
          className={`${fallbackIconClassName} ${!hasError && src && !isLoaded ? "animate-pulse" : "opacity-20"}`}
        />
      </div>

      {/* The Actual Image */}
      {src && !hasError && (
        <img
          src={src}
          alt={alt || "Media"}
          className={`${imageClassName} ${
            isLoaded ? "opacity-100" : "opacity-0"
          } transition-opacity duration-500`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default React.memo(ImageWithLoader);
