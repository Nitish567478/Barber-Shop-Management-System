import React, { useState, useEffect } from 'react';

const ShopImageSlider = ({ images = [], alt = 'Shop image', className = '' }) => {
  const imgs = Array.isArray(images) && images.length > 0 ? images : [];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [images]);

  if (!imgs.length) {
    return (
      <div className={`bg-slate-800/20 rounded-md overflow-hidden ${className}`}>
        <img
          src="https://i.ibb.co/rGmYkXb/barber-placeholder.jpg"
          alt={alt}
          className="w-full h-40 object-cover"
        />
      </div>
    );
  }

  const prev = () => setIndex((i) => (i - 1 + imgs.length) % imgs.length);
  const next = () => setIndex((i) => (i + 1) % imgs.length);

  return (
    <div className={`relative rounded-md overflow-hidden ${className}`}>
      <img src={imgs[index]} alt={`${alt} ${index + 1}`} className="w-full h-40 object-cover" />

      {imgs.length > 1 && (
        <>
          <button
            aria-label="Previous image"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white"
          >
            ‹
          </button>

          <button
            aria-label="Next image"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white"
          >
            ›
          </button>

          <div className="absolute left-1/2 bottom-2 -translate-x-1/2 flex gap-2">
            {imgs.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-2 w-8 rounded-full ${i === index ? 'bg-amber-400' : 'bg-white/40'}`}
                aria-label={`Show image ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ShopImageSlider;
