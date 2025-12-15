import React from 'react';
import type { ComplaintStatus } from '../../types';

interface StatusBadgeProps {
    status: ComplaintStatus;
    size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
    const configs = {
        'Pending': {
            bg: 'bg-amber-100 dark:bg-amber-900/30',
            text: 'text-amber-700 dark:text-amber-400',
            border: 'border-amber-200 dark:border-amber-800',
            icon: '🟡'
        },
        'In Progress': {
            bg: 'bg-blue-100 dark:bg-blue-900/30',
            text: 'text-blue-700 dark:text-blue-400',
            border: 'border-blue-200 dark:border-blue-800',
            icon: '🔵'
        },
        'Resolved': {
            bg: 'bg-emerald-100 dark:bg-emerald-900/30',
            text: 'text-emerald-700 dark:text-emerald-400',
            border: 'border-emerald-200 dark:border-emerald-800',
            icon: '🟢'
        },
        'Escalated': {
            bg: 'bg-red-100 dark:bg-red-900/30',
            text: 'text-red-700 dark:text-red-400',
            border: 'border-red-200 dark:border-red-800',
            icon: '🔴'
        }
    };

    const config = configs[status];
    const sizeClasses = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5';

    return (
        <span
            className={`
        inline-flex items-center gap-1.5
        ${config.bg} ${config.text}
        border ${config.border}
        rounded-full font-medium
        ${sizeClasses}
      `}
        >
            <span>{config.icon}</span>
            {status}
        </span>
    );
};

export default StatusBadge;
