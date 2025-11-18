
import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons';

interface UploadAreaProps {
  onImageUpload: (file: File) => void;
  isLoading: boolean;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onImageUpload, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (files && files[0] && files[0].type.startsWith('image/')) {
      onImageUpload(files[0]);
    } else {
      alert("Please select a valid image file.");
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onImageUpload]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center p-8">
      <div 
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative w-full h-80 border-4 border-dashed rounded-2xl flex flex-col justify-center items-center transition-all duration-300
          ${isDragging ? 'border-indigo-500 bg-gray-800' : 'border-gray-600 hover:border-gray-500'}`}
      >
        <input 
          type="file"
          id="file-upload"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleInputChange}
          accept="image/jpeg,image/png,image/webp"
          disabled={isLoading}
        />
        <div className="text-center pointer-events-none">
          <UploadIcon className="mx-auto h-16 w-16 text-gray-500" />
          <p className="mt-4 text-xl font-semibold text-gray-400">
            Drag & drop an image here
          </p>
          <p className="mt-1 text-sm text-gray-500">or</p>
          <label 
            htmlFor="file-upload"
            className="mt-2 inline-block px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-md cursor-pointer hover:bg-indigo-700 transition-colors"
          >
            Browse Files
          </label>
           <p className="mt-4 text-xs text-gray-600">Supports JPEG, PNG, WEBP</p>
        </div>
      </div>
    </div>
  );
};

export default UploadArea;
