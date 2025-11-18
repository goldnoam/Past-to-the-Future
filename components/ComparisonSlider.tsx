import React, { useState, useRef, useEffect, KeyboardEvent, useCallback } from 'react';

interface ComparisonSliderProps {
  originalImage: string;
  generatedImage: string;
  className?: string;
}

const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ originalImage, generatedImage, className = "" }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const position = ((clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(position, 0), 100));
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleMove(e.touches[0].clientX);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setSliderPosition(p => Math.max(0, p - 5));
    } else if (e.key === 'ArrowRight') {
      setSliderPosition(p => Math.min(100, p + 5));
    }
  };

  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      handleMove(clientX);
    };
    const handleGlobalUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMove);
      window.addEventListener('touchmove', handleGlobalMove);
      window.addEventListener('mouseup', handleGlobalUp);
      window.addEventListener('touchend', handleGlobalUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('touchmove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('touchend', handleGlobalUp);
    };
  }, [isDragging, handleMove]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full select-none group focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 ${className}`}
      style={{ touchAction: 'none' }}
      tabIndex={0}
      role="slider"
      aria-label="Before and after comparison. Use left and right arrow keys to adjust."
      aria-valuenow={sliderPosition}
      aria-valuemin={0}
      aria-valuemax={100}
      onKeyDown={onKeyDown}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      {/* Original (Background) - Right Side */}
      <img 
        src={originalImage} 
        alt="Original" 
        className="absolute inset-0 w-full h-full object-cover" 
      />
      
      {/* Generated (Foreground) - Left Side */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
         <img 
            src={generatedImage} 
            alt="Generated" 
            className="absolute inset-0 w-full h-full object-cover"
         />
      </div>

      {/* Labels */}
      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded pointer-events-none select-none z-10 backdrop-blur-sm">
        Original
      </div>
      <div className="absolute top-2 left-2 bg-indigo-600/90 text-white text-xs px-2 py-1 rounded pointer-events-none select-none z-10 shadow-sm">
        Result
      </div>

      {/* Handle Line */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20"
        style={{ left: `${sliderPosition}%` }}
      >
         {/* Handle Button */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-indigo-600">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" transform="rotate(90 12 12)" />
             </svg>
        </div>
      </div>
    </div>
  );
};

export default ComparisonSlider;