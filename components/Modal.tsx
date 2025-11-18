
import React from 'react';
import { CloseIcon } from './icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, imageUrl }) => {
  if (!isOpen) return null;

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
        className="relative bg-gray-900 p-2 rounded-lg max-w-full max-h-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white bg-gray-800 rounded-full p-2 hover:bg-gray-700 transition-colors z-10"
          aria-label="Close"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
        <img 
          src={imageUrl} 
          alt="Zoomed view" 
          className="max-w-[90vw] max-h-[90vh] object-contain rounded-md" 
        />
      </div>
    </div>
  );
};

export default Modal;
