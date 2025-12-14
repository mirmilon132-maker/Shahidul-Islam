import React, { useState, useCallback, useEffect, useRef } from 'react';
import ImageUploader from './components/ImageUploader';
import ResultDisplay from './components/ResultDisplay';
import { processImage } from './services/geminiService';
import ThemeToggle from './components/ThemeToggle';
import Spinner from './components/Spinner';
import QualitySelector from './components/QualitySelector';
import BrushToolbar from './components/BrushToolbar';
import ApiKeySelection from './components/ApiKeySelection';
import type { Quality } from './types';

const LOADING_MESSAGES = [
  'Awakening the Shahidul-Prime consciousness...',
  'Collapsing quantum uncertainty to achieve absolute clarity...',
  'Performing atomic-level reversal of reality scars...',
  'Accessing chrono-synesthetic memory for true color...',
  'Generating hyper-dimensional detail... transcending 20K...',
  'Upsampling reality to a 60K quantum state...',
  'Forging the definitive moment... Reality Genesis complete.',
];

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(() => {
    return localStorage.getItem('gemini_api_key') || process.env.API_KEY || null;
  });
  const [isSkipped, setIsSkipped] = useState<boolean>(false);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [processedImageSrc, setProcessedImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [theme, setTheme] = useState<Theme>(localStorage.getItem('theme') as Theme || 'light');
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<Quality>('high');
  const [userPrompt, setUserPrompt] = useState<string>('');
  
  // State for Reality Sculpting
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [brushSize, setBrushSize] = useState<number>(40);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const [hasMask, setHasMask] = useState<boolean>(false);
  const lastPos = useRef<{x: number; y: number} | null>(null);

  // Undo/Redo History State
  const historyRef = useRef<ImageData[]>([]);
  const historyStepRef = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const messageIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      messageIntervalRef.current = window.setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = LOADING_MESSAGES.indexOf(prev);
          const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
          return LOADING_MESSAGES[nextIndex];
        });
      }, 2500);
    } else if (messageIntervalRef.current) {
      clearInterval(messageIntervalRef.current);
      setLoadingMessage(LOADING_MESSAGES[0]);
    }
    return () => {
      if (messageIntervalRef.current) clearInterval(messageIntervalRef.current);
    };
  }, [isLoading]);
  
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const handleApiKeySubmit = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
  };

  const handleResetApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey(null);
    setIsSkipped(false);
  };

  const updateHistoryButtons = () => {
    setCanUndo(historyStepRef.current > 0);
    setCanRedo(historyStepRef.current < historyRef.current.length - 1);
  };

  const saveHistoryState = useCallback(() => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If we are in the middle of the stack (after undo), remove future states
    const newHistory = historyRef.current.slice(0, historyStepRef.current + 1);
    
    // Capture current state
    newHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    
    // Update ref
    historyRef.current = newHistory;
    
    // Limit history size to prevent memory issues (max 20 steps)
    if (historyRef.current.length > 20) {
        historyRef.current.shift();
    } else {
        historyStepRef.current += 1;
    }

    updateHistoryButtons();
  }, []);

  const handleUndo = () => {
    if (historyStepRef.current > 0) {
        historyStepRef.current -= 1;
        const canvas = maskCanvasRef.current;
        const ctx = canvas?.getContext('2d');
        const prevState = historyRef.current[historyStepRef.current];
        if (ctx && prevState) {
            ctx.putImageData(prevState, 0, 0);
            setHasMask(historyStepRef.current > 0); // Assuming step 0 is blank
        }
        updateHistoryButtons();
    }
  };

  const handleRedo = () => {
    if (historyStepRef.current < historyRef.current.length - 1) {
        historyStepRef.current += 1;
        const canvas = maskCanvasRef.current;
        const ctx = canvas?.getContext('2d');
        const nextState = historyRef.current[historyStepRef.current];
        if (ctx && nextState) {
            ctx.putImageData(nextState, 0, 0);
            setHasMask(true);
        }
        updateHistoryButtons();
    }
  };

  const drawOnCanvas = (x: number, y: number, isNewLine: boolean = false) => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Refined Brush Rendering for smoother, more natural strokes
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Use a vibrant red with slight transparency for visual feedback
    ctx.strokeStyle = 'rgba(220, 38, 38, 0.8)'; 
    ctx.fillStyle = 'rgba(220, 38, 38, 0.8)';
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Increased shadow blur for anti-aliased, soft edges
    ctx.shadowBlur = 4; 
    ctx.shadowColor = 'rgba(220, 38, 38, 0.4)';
    
    if (isNewLine) {
        // Draw a single dot immediately on click/start
        ctx.beginPath();
        ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
    } else if (lastPos.current) {
        // Continue the stroke
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();
    }
    lastPos.current = {x, y};
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return; // Only allow left-click for drawing
    setIsDrawing(true);
    setHasMask(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = e.currentTarget.width / rect.width;
    const scaleY = e.currentTarget.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    drawOnCanvas(x, y, true);
  };
  
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = e.currentTarget.width / rect.width;
    const scaleY = e.currentTarget.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    drawOnCanvas(x, y);
  };

  const handleCanvasMouseUp = () => {
    if (isDrawing) {
        setIsDrawing(false);
        lastPos.current = null;
        // Save state to history after stroke is complete
        saveHistoryState();
    }
  };

  const clearMask = () => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasMask(false);
    saveHistoryState(); // Save the cleared state
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleFileSelect = (file: File) => {
    setOriginalFile(file);
    setError(null);
    setProcessedImageSrc(null);
    setIsEditing(false);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgSrc = e.target?.result as string;
      setOriginalImageSrc(imgSrc);

      const img = new Image();
      img.onload = () => {
        setAspectRatio(img.naturalWidth / img.naturalHeight);
        
        const imageCanvas = imageCanvasRef.current;
        const maskCanvas = maskCanvasRef.current;

        if (imageCanvas && maskCanvas) {
            imageCanvas.width = img.naturalWidth;
            imageCanvas.height = img.naturalHeight;
            maskCanvas.width = img.naturalWidth;
            maskCanvas.height = img.naturalHeight;
            const ctx = imageCanvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            
            // Initialize mask canvas and history
            const maskCtx = maskCanvas.getContext('2d');
            if (maskCtx) {
                maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
                setHasMask(false);
                
                // Reset history
                historyRef.current = [];
                historyStepRef.current = -1;
                
                // Save initial blank state
                saveHistoryState();
            }
        }
      };
      img.src = imgSrc;
    };
    reader.readAsDataURL(file);
  };
  
  const getMaskData = (): string | undefined => {
      if (!isEditing || !hasMask) return undefined;
      const maskCanvas = maskCanvasRef.current;
      if (!maskCanvas) return undefined;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = maskCanvas.width;
      tempCanvas.height = maskCanvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return undefined;

      const maskCtx = maskCanvas.getContext('2d');
      if (!maskCtx) return undefined;
      
      const imageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
      const data = imageData.data;
      
      const newImageData = tempCtx.createImageData(maskCanvas.width, maskCanvas.height);
      const newData = newImageData.data;

      for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] > 0) { // If pixel is not transparent
              newData[i] = 255;   // R
              newData[i + 1] = 255; // G
              newData[i + 2] = 255; // B
              newData[i + 3] = 255; // A
          }
      }
      tempCtx.putImageData(newImageData, 0, 0);
      return tempCanvas.toDataURL('image/png').split(',')[1];
  };

  const handleSubmit = async () => {
    if (!apiKey) {
        setError('API Key is missing. Please reload.');
        return;
    }
    if (!originalFile || !originalImageSrc) {
      setError('Please upload an image first.');
      return;
    }
    if (isEditing && !hasMask && !userPrompt) {
      setError('Please select an area to sculpt or provide a general directive.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProcessedImageSrc(null);

    try {
      const imageData = originalImageSrc.split(',')[1];
      const maskData = getMaskData();
      
      const resultBase64 = await processImage({
        imageData: imageData,
        mimeType: originalFile.type,
        quality: selectedQuality,
        userPrompt: userPrompt,
        maskData: maskData,
        apiKey: apiKey,
      });

      const resultMimeType = originalFile.type.startsWith('image/') ? originalFile.type : 'image/png';
      setProcessedImageSrc(`data:${resultMimeType};base64,${resultBase64}`);
      setIsEditing(false);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      const lowerCaseMessage = errorMessage.toLowerCase();
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setOriginalFile(null);
    setOriginalImageSrc(null);
    setProcessedImageSrc(null);
    setError(null);
    setAspectRatio(null);
    setSelectedQuality('high');
    setUserPrompt('');
    setIsEditing(false);
    setHasMask(false);
    // Reset History
    historyRef.current = [];
    historyStepRef.current = -1;
    setCanUndo(false);
    setCanRedo(false);
  };
  
  const getButtonText = () => {
    if (isLoading) return 'Processing...';
    if(isEditing) return 'Apply Sculpting ✨';
    return 'Perform Impossible Restoration ✨';
  }

  if (!apiKey && !isSkipped) {
    return (
        <div className="min-h-screen text-gray-800 dark:text-gray-100 flex flex-col items-center">
            <header className="w-full absolute top-0 right-0 p-6 flex justify-end z-10">
                 <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </header>
            <ApiKeySelection onKeySubmit={handleApiKeySubmit} onSkip={() => setIsSkipped(true)} />
        </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-100 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      <header className="w-full max-w-6xl mx-auto text-center mb-10 flex justify-between items-center">
        <div className="flex-1 text-left"></div>
        <div className="flex-1 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
              Shahidul Image Studio
            </h1>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The world's most powerful AI image resurrecter. Transforming the impossible into breathtaking reality.
            </p>
        </div>
        <div className="flex-1 text-right flex items-center justify-end gap-3">
             {apiKey && (
                 <button
                    onClick={handleResetApiKey}
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 focus:outline-none hover:scale-110 active:scale-90"
                    title="Change API Key"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                 </button>
             )}
             <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </header>

      <main className="w-full max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8">
        {!originalImageSrc ? (
            <ImageUploader onFileSelect={handleFileSelect} />
        ) : (
          <div className="flex flex-col items-center w-full">
            <div className="w-full max-w-3xl mb-8 flex flex-col items-center justify-center gap-6">
                
                {isEditing ? (
                   <BrushToolbar 
                      brushSize={brushSize} 
                      onBrushSizeChange={setBrushSize} 
                      onClear={clearMask}
                      onUndo={handleUndo}
                      onRedo={handleRedo}
                      canUndo={canUndo}
                      canRedo={canRedo}
                   />
                ) : (
                   <QualitySelector selectedQuality={selectedQuality} onQualityChange={setSelectedQuality} />
                )}


                <div className="w-full">
                    <label htmlFor="user-prompt" className="block text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 text-center">
                       {isEditing ? 'Describe Your Mandate' : 'Creative Directives (Optional)'}
                    </label>
                    <textarea
                        id="user-prompt"
                        value={userPrompt}
                        onChange={(e) => setUserPrompt(e.target.value)}
                        placeholder={isEditing ? "e.g., 'Remove this person from the photo' or 'Fix the scratch'." : "e.g., 'Enhance the colors of the sunset.'"}
                        className="w-full p-3 bg-gray-100 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-colors"
                        rows={2}
                    />
                </div>

               <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                  {!isLoading && (
                    <button 
                      onClick={() => setIsEditing(!isEditing)}
                      className="btn-3d hover:scale-105 active:scale-100 w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg"
                      style={{'--shadow-color': '#4b5563'} as React.CSSProperties}
                    >
                      {isEditing ? 'Exit Sculpting' : 'Sculpt Reality'}
                    </button>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="btn-3d hover:scale-105 active:scale-100 w-full sm:w-auto bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center text-lg"
                  >
                    {getButtonText()}
                  </button>
               </div>
               <button
                  onClick={resetState}
                  className="mt-2 text-gray-500 dark:text-gray-400 hover:text-brand-primary dark:hover:text-white transition-all duration-200 text-sm font-semibold hover:scale-105 active:scale-95 inline-block"
              >
                  Upload Another Image
              </button>
            </div>

            <div className="w-full">
              {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-4 max-w-4xl mx-auto text-center">{error}</div>}
              
              <div 
                className="relative w-full max-w-4xl mx-auto bg-gray-200 dark:bg-black rounded-xl overflow-hidden shadow-lg"
                style={{
                  aspectRatio: aspectRatio ? `${aspectRatio}` : '16 / 9',
                }}
              >
                  {isLoading && (
                    <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-30 backdrop-blur-sm">
                        <Spinner />
                        <p className="text-white text-lg mt-4 font-semibold text-center px-4">{loadingMessage}</p>
                    </div>
                  )}

                  {!processedImageSrc && (
                      <div className="relative w-full h-full">
                          <canvas ref={imageCanvasRef} className="absolute inset-0 w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} />
                          <canvas 
                              ref={maskCanvasRef} 
                              className={`absolute inset-0 w-full h-full object-contain touch-none`} 
                              style={{ imageRendering: 'auto', cursor: isEditing ? 'crosshair' : 'default' }}
                              onMouseDown={isEditing ? handleCanvasMouseDown : undefined}
                              onMouseMove={isEditing ? handleCanvasMouseMove : undefined}
                              onMouseUp={isEditing ? handleCanvasMouseUp : undefined}
                              onMouseLeave={isEditing ? handleCanvasMouseUp : undefined}
                          />
                      </div>
                  )}
                  {processedImageSrc && originalImageSrc && !isEditing && (
                      <ResultDisplay
                        originalImage={originalImageSrc}
                        processedImage={processedImageSrc}
                        isLoading={isLoading}
                        loadingMessage={loadingMessage}
                        fileName={originalFile?.name || 'restored.png'}
                        aspectRatio={aspectRatio}
                      />
                  )}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Shahidul Image Studio. Powered by Shahidul.</p>
      </footer>
    </div>
  );
};

export default App;