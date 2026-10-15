import React from 'react';

interface ShinyTextProps {
  text: string;
  className?: string;
}

export const ShinyText: React.FC<ShinyTextProps> = ({ text, className = '' }) => {
  return (
    <span
      className={`inline-block bg-gradient-to-r from-slate-900 via-indigo-500 to-slate-900 dark:from-white dark:via-indigo-300 dark:to-white bg-clip-text text-transparent animate-shine font-extrabold ${className}`}
    >
      {text}
    </span>
  );
};