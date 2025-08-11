import React from 'react';

const Avatar = ({ 
  src, 
  alt, 
  name, 
  size = 'md', 
  className = '',
  fallbackClassName = ''
}) => {
  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-12 w-12 text-lg',
    lg: 'h-16 w-16 text-xl',
    xl: 'h-20 w-20 text-2xl'
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name}
        className={`${sizeClass} rounded-full object-cover ${className}`}
        onError={(e) => {
          // Hide the image on error and show fallback
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
    );
  }

  // Fallback: show first letter of name
  const firstLetter = name ? name.charAt(0).toUpperCase() : '?';
  const colors = [
    'bg-blue-100 text-blue-600',
    'bg-green-100 text-green-600',
    'bg-purple-100 text-purple-600',
    'bg-pink-100 text-pink-600',
    'bg-indigo-100 text-indigo-600',
    'bg-yellow-100 text-yellow-600',
    'bg-red-100 text-red-600',
    'bg-gray-100 text-gray-600'
  ];
  
  // Generate consistent color based on name
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
  const colorClass = colors[colorIndex];

  return (
    <div 
      className={`${sizeClass} rounded-full flex items-center justify-center font-medium ${colorClass} ${fallbackClassName}`}
      style={{ display: src ? 'none' : 'flex' }}
    >
      {firstLetter}
    </div>
  );
};

export default Avatar;
