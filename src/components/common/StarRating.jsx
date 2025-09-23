import { useState } from 'react';
import { FiStar } from 'react-icons/fi';

function StarRating({ value = 3, onChange, readonly = false, size = 'medium' }) {
  const [hoverValue, setHoverValue] = useState(0);

  const sizeClasses = {
    small: 'star-small',
    medium: 'star-medium',
    large: 'star-large'
  };

  const handleClick = (rating) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating) => {
    if (!readonly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(0);
    }
  };

  return (
    <div className={`star-rating ${readonly ? 'readonly' : ''}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star ${sizeClasses[size]} ${
            star <= (hoverValue || value) ? 'filled' : 'empty'
          }`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          disabled={readonly}
          aria-label={`${star}점`}
        >
          <FiStar />
        </button>
      ))}
      {!readonly && (
        <span className="rating-label">
          {hoverValue || value}점
        </span>
      )}
    </div>
  );
}

export default StarRating;