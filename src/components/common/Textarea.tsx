import React, { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
    label,
    error,
    className = '',
    ...props
}, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label}
                </label>
            )}
            <textarea
                ref={ref}
                className={`
          w-full px-4 py-3 rounded-xl
          bg-gray-100 dark:bg-gray-700
          border-2 border-transparent
          focus:border-primary-500 focus:bg-white dark:focus:bg-gray-800
          outline-none transition-all duration-200
          placeholder:text-gray-400
          resize-none
          ${error ? 'border-red-500 focus:border-red-500' : ''}
          ${className}
        `}
                {...props}
            />
            {error && (
                <p className="mt-2 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
});

Textarea.displayName = 'Textarea';

export default Textarea;
