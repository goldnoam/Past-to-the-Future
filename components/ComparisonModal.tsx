
import React, { useState, useRef, useEffect } from 'react';
import type { GeneratedImage } from '../types';
import { CloseIcon } from './icons';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalImageUrl: string;
  generatedImage: GeneratedImage | null;
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({ isOpen, onClose, originalImageUrl, generatedImage }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleSliderMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPos(percent);
  };
  
  const onMouseDown = () => {
    isDragging.current = true;
  };
  
  const onMouseUp = () => {
    isDragging.current = false;
  };
  
  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    handleSliderMove(e.clientX);
  };

  const onTouchStart = () => {
    isDragging.current = true;
  };

  const onTouchEnd = () => {
    isDragging.current = false;
  };
  
  const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      handleSliderMove(e.touches[0].clientX);
  };

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isOpen || !generatedImage) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
      <div 
        className="relative bg-gray-900 p-2 rounded-lg max-w-[90vw] max-h-[90vh] shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-2">
            <h2 className="text-xl font-bold text-white">Comparison: <span className="text-indigo-400">{generatedImage.title}</span></h2>
            <button
              onClick={onClose}
              className="text-white bg-gray-800 rounded-full p-2 hover:bg-gray-700 transition-colors z-10"
              aria-label="Close"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
        </div>
        
        <div 
            ref={containerRef}
            className="relative w-full h-full max-w-[85vw] max-h-[80vh] aspect-square select-none overflow-hidden rounded-md"
            onMouseUp={onMouseUp}
            onTouchEnd={onTouchEnd}
        >
            <img 
                src={originalImageUrl} 
                alt="Original" 
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            />
            <div 
                className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
                <img 
                    src={generatedImage.src || ''} 
                    alt={generatedImage.title} 
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none" 
                />
            </div>
            <div 
                className="absolute top-0 bottom-0 w-1 bg-white/50 cursor-ew-resize"
                style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 border-4 border-gray-900 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                </div>
            </div>
             <div className="absolute top-2 left-2 px-3 py-1 bg-black/60 text-white rounded-full text-sm font-semibold pointer-events-none">Original</div>
             <div className="absolute top-2 right-2 px-3 py-1 bg-black/60 text-white rounded-full text-sm font-semibold pointer-events-none" style={{ opacity: sliderPos > 50 ? 1 : 0, transition: 'opacity 0.2s' }}>Generated</div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;