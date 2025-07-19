import React, { useState } from 'react';

const StarRating = ({ rating, setRating }) => {
    const [hover, setHover] = useState(0);
    const isClickable = !!setRating; // Controleer of setRating een functie is

    return (
        <div className="star-rating">
            {[...Array(5)].map((star, index) => {
                index += 1;
                return (
                    <button
                        type="button"
                        key={index}
                        className={`star ${index <= (hover || rating) ? 'selected' : ''}`}
                        onClick={() => isClickable && setRating(index)}
                        onMouseEnter={() => isClickable && setHover(index)}
                        onMouseLeave={() => isClickable && setHover(rating)}
                        disabled={!isClickable}
                        style={{ cursor: isClickable ? 'pointer' : 'default' }}
                    >
                        <span className="star-inner">&#9733;</span>
                    </button>
                );
            })}
        </div>
    );
};

export default StarRating;