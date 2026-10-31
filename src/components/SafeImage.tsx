'use client';

import React, { useState } from 'react';
import { FlaskConical } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackLabel?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fallbackLabel,
  className = '',
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#0F2922] via-[#16382E] to-[#0F172A] text-[#FAF9F6]/80 p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <FlaskConical className="w-8 h-8 text-[#C5A059] mb-2 opacity-80" />
        <span className="text-xs font-medium tracking-wide text-[#FAF9F6]/90 max-w-[200px] truncate">
          {fallbackLabel || alt || 'Flavour & Fragrances Botanical Formulation'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
      {...rest}
    />
  );
};
