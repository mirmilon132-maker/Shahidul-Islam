
import React from 'react';

const ZoomInIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
    </svg>
);

const ZoomOutIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
    </svg>
);

const ResetIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l16 16" />
    </svg>
);

interface ZoomToolbarProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

const ZoomToolbar: React.FC<ZoomToolbarProps> = ({ zoomLevel, onZoomIn, onZoomOut, onZoomReset }) => {
  return (
    <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-1.5 rounded-lg shadow-lg border border-white/20">
      <button 
        onClick={onZoomOut} 
        className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 hover:scale-110 active:scale-90"
        aria-label="Zoom out"
      >
        <ZoomOutIcon />
      </button>
      <span 
        className="text-sm font-mono w-16 text-center text-gray-800 dark:text-gray-100 cursor-pointer transition-all duration-200 hover:scale-110 active:scale-90 inline-block select-none"
        onClick={onZoomReset}
        title="Reset zoom"
      >
        {Math.round(zoomLevel * 100)}%
      </span>
      <button 
        onClick={onZoomIn} 
        className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 hover:scale-110 active:scale-90"
        aria-label="Zoom in"
      >
        <ZoomInIcon />
      </button>
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
      <button 
        onClick={onZoomReset} 
        className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 hover:scale-110 active:scale-90"
        aria-label="Reset view"
      >
        <ResetIcon />
      </button>
    </div>
  );
};

export default ZoomToolbar;