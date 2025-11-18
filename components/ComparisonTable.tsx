
import React from 'react';
import type { GeneratedImage } from '../types';
import { DownloadIcon, ZoomInIcon, SpinnerIcon } from './icons';

interface ComparisonTableProps {
  generatedImages: GeneratedImage[];
  originalImageUrl: string;
  onZoom: (url: string) => void;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ generatedImages, originalImageUrl, onZoom }) => {
  
  const handleDownload = (url: string, title: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="overflow-x-auto bg-gray-800/50 rounded-xl border border-gray-700 shadow-xl">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-700 text-gray-400 uppercase text-xs tracking-wider">
            <th className="p-4 font-medium">Timeframe</th>
            <th className="p-4 font-medium">Original</th>
            <th className="p-4 font-medium">Result</th>
            <th className="p-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {generatedImages.map((image) => (
            <tr key={image.id} className="hover:bg-gray-800/80 transition-colors">
              <td className="p-4 font-bold text-white whitespace-nowrap">
                {image.title}
              </td>
              <td className="p-4">
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-md overflow-hidden border border-gray-600">
                  <img src={originalImageUrl} alt="Original" className="w-full h-full object-cover" />
                </div>
              </td>
              <td className="p-4">
                <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-lg overflow-hidden bg-gray-900 border border-gray-600 relative">
                  {image.isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                       <SpinnerIcon className="w-8 h-8 text-indigo-500" />
                    </div>
                  ) : image.src ? (
                    <img 
                        src={image.src} 
                        alt={image.title} 
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => onZoom(image.src!)}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-gray-500">Failed</div>
                  )}
                </div>
              </td>
              <td className="p-4 text-right whitespace-nowrap">
                 <div className="flex items-center justify-end space-x-2">
                    <button 
                        onClick={() => image.src && onZoom(image.src)}
                        disabled={!image.src}
                        className="p-2 text-gray-400 hover:text-indigo-400 disabled:opacity-50"
                        title="Zoom"
                    >
                        <ZoomInIcon className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => image.src && handleDownload(image.src, image.title)}
                        disabled={!image.src}
                        className="p-2 text-gray-400 hover:text-green-400 disabled:opacity-50"
                        title="Download"
                    >
                        <DownloadIcon className="w-5 h-5" />
                    </button>
                 </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;
