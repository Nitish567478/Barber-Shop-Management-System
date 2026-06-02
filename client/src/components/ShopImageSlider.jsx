import React, { useEffect, useMemo, useState } from 'react';

/**
 * Simple image slider used by HomePage.
 *
 * Props:
 * - images: array of image URLs
 * - className: optional wrapper className
 */
const ShopImageSlider = ({ images = [], className = '' }) => {
  const normalizedImages = useMemo(() => (Array.isArray(images) ? images.filter(Boolean) : []), [images]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [normalizedImages.length]);

  useEffect(() => {
    if (normalizedImages.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % normalizedImages.length);
    }, 3500);
    return () => clearInterval(id);
  }, [normalizedImages.length]);

  if (!normalizedImages.length) return <div className={className} />;

  const goPrev = () => setIndex((i) => (i - 1 + normalizedImages.length) % normalizedImages.length);
  const goNext = () => setIndex((i) => (i + 1) % normalizedImages.length);

  return (
    <div className={`relative ${className}`.trim()}>
      <div className="h-full w-full">
        <img
          src={normalizedImages[index]}
          alt={`Shop image ${index + 1}`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      {normalizedImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-2 py-1 text-white backdrop-blur hover:bg-black/55"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-2 py-1 text-white backdrop-blur hover:bg-black/55"
          >
            ›
          </button>

          <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2">
            {normalizedImages.map((_, i) => (
              <span
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${i === index ? 'bg-amber-400' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ShopImageSlider;

