
import React, { useState, useCallback } from 'react';
import type { GeneratedImage } from './types';
import type { GenerativePart } from './services/geminiService';
import { IMAGE_GENERATION_CONFIGS } from './constants';
import { fileToGenerativePart, generateImage } from './services/geminiService';
import UploadArea from './components/UploadArea';
import ImageCard from './components/ImageCard';
import Modal from './components/Modal';
import ComparisonModal from './components/ComparisonModal';
import { SpinnerIcon, UploadIcon, DownloadIcon, ShareIcon } from './components/icons';

declare const JSZip: any;

const addWatermark = (imageUrl: string): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(imageUrl); // fallback
                return;
            }
            
            ctx.drawImage(img, 0, 0);
            
            const fontSize = Math.max(10, Math.min(img.width / 50, img.height / 30));
            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            
            const text = "Past to the Future App";
            const padding = fontSize;
            ctx.fillText(text, canvas.width - padding, canvas.height - padding);

            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => {
            resolve(imageUrl); // If image fails to load, return original
        };
        img.src = imageUrl;
    });
};

const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) throw new Error("Could not parse mime type from data URL");
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<GenerativePart | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const [comparisonImage, setComparisonImage] = useState<GeneratedImage | null>(null);
  const [showDragOverlay, setShowDragOverlay] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const processImageGeneration = useCallback(async (imageData: GenerativePart, configs: typeof IMAGE_GENERATION_CONFIGS) => {
      const generationPromises = configs.map(config =>
        generateImage({ mimeType: imageData.mimeType, data: imageData.data }, config.prompt)
          .then(async (src) => {
            if (!src) throw new Error("Generation returned no image.");
            const watermarkedSrc = await addWatermark(src);
            return { id: config.id, src: watermarkedSrc, error: null };
          })
          .catch((err: any) => {
            console.error(`Failed to generate image for ${config.title}:`, err);
            const message = err?.message || 'An unknown error occurred.';
            return { id: config.id, src: null, error: message };
          })
      );

      for (const promise of generationPromises) {
        promise.then(({ id, src, error }) => {
          setGeneratedImages(prev => prev.map(img => 
            img.id === id ? { ...img, src, isLoading: false, error } : img
          ));
        });
      }
      
      await Promise.allSettled(generationPromises);
  }, []);


  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
        alert("Please select a valid image file.");
        return;
    }
    setIsGenerating(true);
    setError(null);
    setGeneratedImages([]);
    setOriginalImage(null);

    try {
      const imageData = await fileToGenerativePart(file);
      setOriginalImage(imageData);

      const initialImages: GeneratedImage[] = IMAGE_GENERATION_CONFIGS.map(config => ({
        ...config,
        src: null,
        isLoading: true,
        error: null,
      }));
      setGeneratedImages(initialImages);
      
      await processImageGeneration(imageData, IMAGE_GENERATION_CONFIGS);

    } catch (err) {
      console.error("Image processing failed:", err);
      setError("Failed to process image. Please try another one.");
      setGeneratedImages([]);
      setOriginalImage(null);
    } finally {
      setIsGenerating(false);
    }
  }, [processImageGeneration]);

  const handleRetry = useCallback(async (imageId: string) => {
      if (!originalImage) return;

      const configToRetry = IMAGE_GENERATION_CONFIGS.find(c => c.id === imageId);
      if (!configToRetry) return;

      setGeneratedImages(prev => prev.map(img => 
          img.id === imageId ? { ...img, isLoading: true, error: null, src: null } : img
      ));

      await processImageGeneration(originalImage, [configToRetry]);
  }, [originalImage, processImageGeneration]);

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
  
  const handleCompare = (image: GeneratedImage) => {
      setComparisonImage(image);
  };

  const closeComparisonModal = () => {
      setComparisonImage(null);
  };

  const handleGlobalDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDragOverlay(true);
  };

  const handleGlobalDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.relatedTarget && (e.currentTarget as Node).contains(e.relatedTarget as Node)) {
        return;
    }
    setShowDragOverlay(false);
  };

  const handleGlobalDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDragOverlay(true); 
  };

  const handleGlobalDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDragOverlay(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleImageUpload(e.dataTransfer.files[0]);
    }
  };
  
  const handleExportAll = async () => {
    setIsExporting(true);
    try {
        const zip = new JSZip();
        const imagesToExport = generatedImages.filter(img => img.src && !img.isLoading);

        if (imagesToExport.length === 0) {
            alert("No images to export.");
            return;
        }

        const files = imagesToExport.map(img => 
            dataURLtoFile(img.src!, `${img.title.replace(/\s+/g, '-')}.png`)
        );
        
        files.forEach(file => {
            zip.file(file.name, file);
        });

        const content = await zip.generateAsync({ type: "blob" });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'past-to-the-future-export.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

    } catch (error) {
        console.error("Failed to export images:", error);
        setError("Could not export images. Please try again.");
    } finally {
        setIsExporting(false);
    }
  };

  const handleShareAll = async () => {
    const imagesToShare = generatedImages.filter(img => img.src && !img.isLoading);

    if (imagesToShare.length === 0) {
        alert("No images to share.");
        return;
    }
    
    if (!navigator.share || !navigator.canShare) {
      alert("Sharing is not supported on your browser.");
      return;
    }

    try {
        const files = imagesToShare.map(img => 
            dataURLtoFile(img.src!, `${img.title.replace(/\s+/g, '-')}.png`)
        );
        
        if (navigator.canShare({ files })) {
            await navigator.share({
                title: 'Past to the Future AI Images',
                text: 'Check out these images I generated!',
                files: files,
            });
        } else {
            alert("Your browser doesn't support sharing these files.");
        }
    } catch (error) {
        console.error('Error sharing images:', error);
    }
  };
  
  const anyImageLoading = generatedImages.some(i => i.isLoading);

  return (
    <div 
      className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 md:p-8 flex flex-col relative"
      onDragEnter={handleGlobalDragEnter}
      onDragLeave={handleGlobalDragLeave}
      onDragOver={handleGlobalDragOver}
      onDrop={handleGlobalDrop}
    >
      {showDragOverlay && (
        <div className="absolute inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center pointer-events-none">
            <div className="text-center p-8 border-4 border-dashed border-indigo-500 rounded-2xl bg-gray-800/80">
                <UploadIcon className="mx-auto h-16 w-16 text-indigo-400" />
                <h2 className="mt-4 text-2xl font-bold text-white">Drop your image here</h2>
                <p className="text-gray-400">to start a new creation</p>
            </div>
        </div>
      )}

      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-500 to-pink-500">
          Past to the Future AI
        </h1>
        <p className="mt-2 text-lg text-gray-400 max-w-2xl mx-auto">
          Upload a photo and travel through time with the power of AI.
        </p>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto">
        {!originalImage && !isGenerating ? (
          <UploadArea onImageUpload={handleImageUpload} isLoading={isGenerating} />
        ) : (
          <div>
            <div className="mb-12 p-6 bg-gray-800/50 rounded-2xl border border-gray-700 flex flex-col lg:flex-row items-center gap-8">
              <div className="lg:w-1/3 w-full">
                <h2 className="text-2xl font-bold mb-4 text-white">Your Original Image</h2>
                {originalImage ? (
                  <img src={originalImage.dataUrl} alt="Original upload" className="rounded-lg shadow-lg w-full object-cover aspect-square"/>
                ) : (
                  <div className="rounded-lg shadow-lg w-full object-cover aspect-square bg-gray-700 flex items-center justify-center">
                    <SpinnerIcon className="w-12 h-12 text-indigo-500" />
                  </div>
                )}
              </div>
              <div className="lg:w-2/3 w-full flex flex-col items-center text-center lg:text-left lg:items-start">
                  {anyImageLoading && (
                    <div className="flex items-center text-xl text-indigo-400 mb-4">
                        <SpinnerIcon className="w-6 h-6 mr-3" />
                        Generating your timeline... this may take a moment.
                    </div>
                  )}
                <p className="text-gray-300 mb-6">
                    Below are the AI-generated versions of your image. You can zoom, download, or share each creation.
                </p>
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                    <button onClick={handleReset} className="bg-red-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-md disabled:bg-gray-500 disabled:cursor-not-allowed" disabled={anyImageLoading}>
                        Start Over
                    </button>
                    <button 
                        onClick={handleExportAll}
                        disabled={anyImageLoading || isExporting || generatedImages.every(i => !i.src)}
                        className="bg-green-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-md disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center"
                    >
                        {isExporting ? <SpinnerIcon className="w-5 h-5 mr-2" /> : <DownloadIcon className="w-5 h-5 mr-2" />}
                        Export All
                    </button>
                    <button 
                        onClick={handleShareAll}
                        disabled={anyImageLoading || generatedImages.every(i => !i.src) || typeof navigator.share === 'undefined'}
                        className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center"
                    >
                        <ShareIcon className="w-5 h-5 mr-2" />
                        Share All
                    </button>
                </div>
              </div>
            </div>
            
            {error && <p className="text-center text-red-400 mb-4">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {generatedImages.map((image) => (
                <ImageCard 
                  key={image.id}
                  image={image}
                  onZoom={handleZoom}
                  onCompare={() => handleCompare(image)}
                  onRetry={() => handleRetry(image.id)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="text-center text-gray-500 mt-12 py-4 border-t border-gray-800">
        <p>&copy; Noam Gold AI 2025</p>
        <a href="mailto:gold.noam@gmail.com" className="hover:text-indigo-400 transition-colors">Send Feedback</a>
      </footer>
      
      <Modal isOpen={!!modalImageUrl} onClose={closeModal} imageUrl={modalImageUrl || ''} />
      <ComparisonModal
        isOpen={!!comparisonImage}
        onClose={closeComparisonModal}
        originalImageUrl={originalImage?.dataUrl || ''}
        generatedImage={comparisonImage}
      />
    </div>
  );
};

export default App;