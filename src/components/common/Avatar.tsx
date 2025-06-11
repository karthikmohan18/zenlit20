import React from 'react';

interface Props {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  onClick?: () => void;
}

export const Avatar: React.FC<Props> = ({
  src,
  alt,
  size = 'md',
  showStatus = false,
  onClick
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="relative inline-block">
      <img
        src={src}
        alt={alt}
        className={`
          ${sizeClasses[size]}
          rounded-full
          object-cover
          cursor-pointer
          ring-2
          ring-blue-500
        `}
        onClick={onClick}
      />
      {showStatus && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
      )}
    </div>
  );
};