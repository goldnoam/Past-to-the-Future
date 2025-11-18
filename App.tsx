
import React, { useState, useCallback } from 'react';
import type { GeneratedImage } from './types';
import type { GenerativePart } from './services/geminiService';
import { IMAGE_GENERATION_CONFIGS } from './constants';
import { fileToGenerativePart, generateImage } from './services/geminiService';
import UploadArea from './components/UploadArea';
import ImageCard from './components/ImageCard';
import ComparisonTable from './components/ComparisonTable';
import Modal from './components/Modal';
import { SpinnerIcon, GridIcon, TableIcon, ArchiveIcon } from './components/icons';

type ViewMode = 'grid' | 'table';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<GenerativePart | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const handleImageUpload = useCallback(async (file: File) => {
    setIsGenerating(true);
    setError(null);

    try {
      const imageData = await fileToGenerativePart(file);
      setOriginalImage(imageData);

      const initialImages: GeneratedImage[] = IMAGE_GENERATION_CONFIGS.map(config => ({
        ...config,
        src: null,
        isLoading: true,
      }));
      setGeneratedImages(initialImages);

      const generationPromises = IMAGE_GENERATION_CONFIGS.map(config =>
        generateImage({ mimeType: imageData.mimeType, data: imageData.data }, config.prompt)
          .then(src => ({ id: config.id, src }))
      );

      for (const promise of generationPromises) {
        promise.then(({ id, src }) => {
          setGeneratedImages(prev => prev.map(img => 
            img.id === id ? { ...img, src, isLoading: false } : img
          ));
        });
      }
      
      await Promise.allSettled(generationPromises);

    } catch (err) {
      console.error("Image processing failed:", err);
      setError("Failed to process image. Please try another one.");
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleReset = () => {
    setOriginalImage(null);
    setGeneratedImages([]);
    setIsGenerating(false);
    setError(null);
  };
  
  const handleZoom = (url: string) => {
    setModalImageUrl(url);
  };

  const closeModal = () => {
    setModalImageUrl(null);
  };

  const handleDownloadAll = () => {
    generatedImages.forEach((image, index) => {
      if (image.src) {
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = image.src!;
            link.download = `${image.title.replace(/\s+/g, '-')}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }, index * 300); // Stagger downloads to prevent browser blocking
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 md:p-8 flex flex-col">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-500 to-pink-500">
          Past to the Future AI
        </h1>
        <p className="mt-2 text-lg text-gray-400 max-w-2xl mx-auto">
          Upload a photo and travel through time with the power of AI.
        </p>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto">
        {!originalImage ? (
          <UploadArea onImageUpload={handleImageUpload} isLoading={isGenerating} />
        ) : (
          <div>
            <div className="mb-8 p-6 bg-gray-800/50 rounded-2xl border border-gray-700 flex flex-col lg:flex-row items-center gap-8">
              <div className="lg:w-1/4 w-full max-w-xs">
                <h2 className="text-lg font-bold mb-2 text-white">Original</h2>
                <img src={originalImage.dataUrl} alt="Original upload" className="rounded-lg shadow-lg w-full object-cover aspect-square"/>
              </div>
              <div className="lg:w-3/4 w-full flex flex-col items-center text-center lg:text-left lg:items-start">
                  {isGenerating && (
                    <div className="flex items-center text-xl text-indigo-400 mb-4">
                        <SpinnerIcon className="w-6 h-6 mr-3" />
                        Generating your timeline...
                    </div>
                  )}
                <p className="text-gray-300 mb-6">
                   Explore your timeline below. Compare the results, download your favorites, or share them with friends.
                </p>
                
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 w-full">
                    <button onClick={handleReset} className="bg-red-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-md">
                        Start Over
                    </button>
                    
                    <div className="flex-grow"></div>

                    {/* View Controls */}
                    <div className="bg-gray-700 p-1 rounded-lg flex items-center shadow-inner">
                         <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                            title="Grid View"
                         >
                             <GridIcon className="w-5 h-5" />
                         </button>
                         <button 
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-gray-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
                            title="Table View"
                         >
                             <TableIcon className="w-5 h-5" />
                         </button>
                    </div>

                     <button 
                        onClick={handleDownloadAll}
                        className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2"
                        disabled={isGenerating}
                    >
                        <ArchiveIcon className="w-5 h-5" />
                        <span>Download All</span>
                    </button>
                </div>
              </div>
            </div>
            
            {error && <p className="text-center text-red-400 mb-4">{error}</p>}

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {generatedImages.map((image) => (
                    <ImageCard 
                    key={image.id}
                    title={image.title}
                    imageUrl={image.src}
                    originalImageUrl={originalImage.dataUrl}
                    isLoading={image.isLoading}
                    onZoom={handleZoom}
                    />
                ))}
                </div>
            ) : (
                <ComparisonTable 
                    generatedImages={generatedImages} 
                    originalImageUrl={originalImage.dataUrl}
                    onZoom={handleZoom}
                />
            )}
          </div>
        )}
      </main>

      <footer className="text-center text-gray-500 mt-12 py-4 border-t border-gray-800">
        <p>&copy; Noam Gold AI 2025</p>
        <a href="mailto:gold.noam@gmail.com" className="hover:text-indigo-400 transition-colors">Send Feedback</a>
      </footer>
      
      <Modal isOpen={!!modalImageUrl} onClose={closeModal} imageUrl={modalImageUrl || ''} />
    </div>
  );
};

export default App;
