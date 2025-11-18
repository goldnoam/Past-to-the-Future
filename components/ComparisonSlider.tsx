
import React, { useState, useRef, useEffect } from 'react';

interface ComparisonSliderProps {
  originalImage: string;
  generatedImage: string;
  className?: string;
}

const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ originalImage, generatedImage, className = "" }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (event: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    let clientX;

    if ('touches' in event) {
      clientX = event.touches[0].clientX;
    } else {
      clientX = (event as React.MouseEvent).clientX;
    }

    const position = ((clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(position, 0), 100));
  };

  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent | TouchEvent) => handleMove(e);
    const handleGlobalUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMove);
      window.addEventListener('mouseup', handleGlobalUp);
      window.addEventListener('touchmove', handleGlobalMove);
      window.addEventListener('touchend', handleGlobalUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('touchmove', handleGlobalMove);
      window.removeEventListener('touchend', handleGlobalUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none cursor-col-resize group ${className}`}
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
    >
      {/* Original Image (Right/Background) */}
      <img 
        src={originalImage} 
        alt="Original" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Label for Original */}
      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded pointer-events-none z-10">
        Original
      </div>

      {/* Generated Image (Left/Foreground) - Clipped */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img 
          src={generatedImage} 
          alt="Generated" 
          className="absolute top-0 left-0 max-w-none h-full"
          style={{ width: containerRef.current ? containerRef.current.offsetWidth : '100%' }} 
          // Dynamic width calculation required so image doesn't squish
        />
      </div>

      {/* Label for Generated */}
      <div className="absolute top-2 left-2 bg-indigo-600/80 text-white text-xs px-2 py-1 rounded pointer-events-none z-10">
        Generated
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center transform -translate-x-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-indigo-600">
              <path fillRule="evenodd" d="M13.28 3.97a.75.75 0 010 1.06L6.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0zm6 0a.75.75 0 010 1.06L12.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0z" clipRule="evenodd" />
            </svg>
        </div>
      </div>
    </div>
  );
};

export default ComparisonSlider;
