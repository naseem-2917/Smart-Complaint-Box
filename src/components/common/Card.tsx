import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    glass?: boolean;
    hover?: boolean;
    onClick?: () => void;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
    children,
    className = '',
    glass = false,
    hover = false,
    onClick,
    padding = 'md'
}) => {
    const paddingClasses = {
        none: '',
        sm: 'p-3',
        md: 'p-4 md:p-6',
        lg: 'p-6 md:p-8'
    };

    const baseClasses = glass
        ? 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20 dark:border-gray-700/50'
        : 'bg-white dark:bg-gray-800';

    const Component = onClick ? motion.button : motion.div;

    return (
        <Component
            className={`
        ${baseClasses}
        rounded-2xl shadow-card
        ${hover ? 'hover:shadow-card-hover cursor-pointer' : ''}
        ${paddingClasses[padding]}
        transition-all duration-300
        ${className}
      `}
            onClick={onClick}
            whileHover={hover ? { y: -2 } : undefined}
            whileTap={onClick ? { scale: 0.99 } : undefined}
        >
            {children}
        </Component>
    );
};

export default Card;
