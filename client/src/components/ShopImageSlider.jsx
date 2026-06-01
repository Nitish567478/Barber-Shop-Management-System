import React, { useEffect, useMemo, useState } from 'react';

const ShopImageSlider = ({
  images = [],
  fallbackImage,
  alt = 'Barber shop',
  className = 'h-full w-full object-cover',
  intervalMs = 3500,
  showDots = true,
}) => {
  const normalizedImages = useMemo(
    () =>
      [...new Set(images.map((image) => String(image || '').trim()).filter(Boolean))]
        .slice(0, 5),
    [images]
  );
  const sliderImages = normalizedImages.length > 0 ? normalizedImages : [fallbackImage].filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [sliderImages.join('|')]);

  useEffect(() => {
    if (sliderImages.length < 2) return undefined;

    const timerId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % sliderImages.length);
    }, intervalMs);

    return () => window.clearInterval(timerId);
  }, [intervalMs, sliderImages.length]);

  if (sliderImages.length === 0) return null;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <img
        src={sliderImages[activeIndex]}
        alt={alt}
        className={className}
        loading="lazy"
        decoding="async"
        onError={(event) => {
          if (fallbackImage && event.currentTarget.src !== fallbackImage) {
            event.currentTarget.src = fallbackImage;
          }
        }}
      />
      {showDots && sliderImages.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-slate-950/60 px-3 py-2 backdrop-blur">
          {sliderImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              aria-label={`Show shop image ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`h-2 w-2 rounded-full transition ${
                index === activeIndex ? 'bg-amber-300' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopImageSlider;
