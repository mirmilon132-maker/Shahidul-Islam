
import React, { useState, useRef, useCallback } from 'react';

interface ComparisonSliderProps {
  originalImage: string;
  processedImage: string;
}

const ComparisonSlider: React.FC<ComparisonSliderProps> = ({ originalImage, processedImage }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
      handleMove(e.clientX);
  }, []);
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
      handleMove(e.touches[0].clientX);
  }, []);

  const handleMouseUp = useCallback(() => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);
  
  const handleTouchEnd = useCallback(() => {
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);
  }, [handleTouchMove]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only handle left-click for slider dragging
    if (e.button !== 0) return;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  };
  
  const imageStyle: React.CSSProperties = {
      imageRendering: 'pixelated',
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none"
    >
      <img
        src={originalImage}
        alt="Original"
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        style={imageStyle}
      />
      <div
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={processedImage}
          alt="Processed"
          className="absolute inset-0 w-full h-full object-contain"
          style={imageStyle}
        />
      </div>

      <div
        className="absolute top-0 bottom-0 w-1 bg-white/50 cursor-ew-resize shadow-2xl backdrop-blur-sm group z-10"
        style={{ left: `calc(${sliderPosition}% - 2px)` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 dark:bg-gray-700/80 rounded-full border-2 border-white dark:border-gray-500 flex items-center justify-center shadow-lg backdrop-blur-sm transition-transform group-hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
        </div>
      </div>

       <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={(e) => setSliderPosition(Number(e.target.value))}
        className="comparison-slider-range absolute inset-0 opacity-0 cursor-ew-resize z-10"
      />
    </div>
  );
};

export default ComparisonSlider;
