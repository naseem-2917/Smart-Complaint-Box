import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
    rating: number;
    onChange?: (rating: number) => void;
    readonly?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const StarRating: React.FC<StarRatingProps> = ({
    rating,
    onChange,
    readonly = false,
    size = 'md'
}) => {
    const [hoverRating, setHoverRating] = React.useState(0);

    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    const gaps = {
        sm: 'gap-0.5',
        md: 'gap-1',
        lg: 'gap-2'
    };

    const handleClick = (value: number) => {
        if (!readonly && onChange) {
            onChange(value);
        }
    };

    return (
        <div className={`flex items-center ${gaps[size]}`}>
            {[1, 2, 3, 4, 5].map((value) => {
                const filled = (hoverRating || rating) >= value;
                return (
                    <button
                        key={value}
                        type="button"
                        disabled={readonly}
                        onClick={() => handleClick(value)}
                        onMouseEnter={() => !readonly && setHoverRating(value)}
                        onMouseLeave={() => !readonly && setHoverRating(0)}
                        className={`
              ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
              transition-transform duration-150
            `}
                    >
                        <Star
                            className={`
                ${sizes[size]}
                ${filled
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-gray-200 dark:fill-gray-700 text-gray-300 dark:text-gray-600'
                                }
                transition-colors duration-150
              `}
                        />
                    </button>
                );
            })}
        </div>
    );
};

export default StarRating;
