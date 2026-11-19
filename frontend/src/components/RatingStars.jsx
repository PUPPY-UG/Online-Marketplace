import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function RatingStars({ rating = 5, onChange = null, size = 'md', interactive = false }) {
  const [hoverRating, setHoverRating] = useState(0);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const currentSize = starSizes[size] || starSizes.md;

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const activeRating = hoverRating || rating;
        const isFilled = star <= activeRating;

        return (
          <button
            type="button"
            key={star}
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
          >
            <Star
              className={`${currentSize} ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-slate-100 text-slate-300'
              } transition-colors`}
            />
          </button>
        );
      })}
    </div>
  );
}
