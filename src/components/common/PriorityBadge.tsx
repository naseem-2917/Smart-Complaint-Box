import React from 'react';
import { motion } from 'framer-motion';
import { Flame, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

interface PriorityBadgeProps {
    score: number;
    reasons?: string[];
    showReasons?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({
    score,
    reasons = [],
    showReasons = false,
    size = 'md'
}) => {
    const getConfig = (score: number) => {
        if (score >= 80) {
            return {
                label: 'Critical',
                bg: 'bg-red-100 dark:bg-red-900/30',
                text: 'text-red-700 dark:text-red-400',
                border: 'border-red-300 dark:border-red-700',
                glow: 'shadow-lg shadow-red-500/30',
                icon: Flame,
                animate: true
            };
        }
        if (score >= 60) {
            return {
                label: 'High',
                bg: 'bg-orange-100 dark:bg-orange-900/30',
                text: 'text-orange-700 dark:text-orange-400',
                border: 'border-orange-300 dark:border-orange-700',
                glow: '',
                icon: AlertTriangle,
                animate: false
            };
        }
        if (score >= 40) {
            return {
                label: 'Medium',
                bg: 'bg-amber-100 dark:bg-amber-900/30',
                text: 'text-amber-700 dark:text-amber-400',
                border: 'border-amber-300 dark:border-amber-700',
                glow: '',
                icon: AlertCircle,
                animate: false
            };
        }
        return {
            label: 'Low',
            bg: 'bg-emerald-100 dark:bg-emerald-900/30',
            text: 'text-emerald-700 dark:text-emerald-400',
            border: 'border-emerald-300 dark:border-emerald-700',
            glow: '',
            icon: CheckCircle,
            animate: false
        };
    };

    const config = getConfig(score);
    const Icon = config.icon;

    const sizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
    };

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    };

    return (
        <div className="inline-block">
            <motion.div
                animate={config.animate ? { scale: [1, 1.02, 1] } : undefined}
                transition={config.animate ? { repeat: Infinity, duration: 2 } : undefined}
                className={`
          inline-flex items-center gap-2 px-3 py-2 rounded-xl
          ${config.bg} ${config.text} ${config.glow}
          border ${config.border}
          ${sizeClasses[size]}
        `}
            >
                <Icon className={iconSizes[size]} />
                <span className="font-semibold">{score}/100</span>
                <span className="font-medium opacity-75">| {config.label}</span>
            </motion.div>

            {showReasons && reasons.length > 0 && (
                <div className={`mt-2 space-y-1 ${sizeClasses[size]}`}>
                    {reasons.map((reason, i) => (
                        <div key={i} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {reason}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PriorityBadge;
