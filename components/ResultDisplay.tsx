
import React from 'react';
import Spinner from './Spinner';
import ComparisonSlider from './ComparisonSlider';

interface ResultDisplayProps {
  originalImage: string | null;
  processedImage: string | null;
  isLoading: boolean;
  loadingMessage: string;
  fileName: string;
  aspectRatio: number | null;
}

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const ResultDisplay: React.FC<ResultDisplayProps> = ({ originalImage, processedImage, isLoading, loadingMessage, fileName, aspectRatio }) => {
  if (!originalImage || !processedImage) return null;

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div 
        className="relative w-full flex-1 min-h-0"
      >
        <ComparisonSlider 
          originalImage={originalImage} 
          processedImage={processedImage} 
        />
      </div>

      {processedImage && !isLoading && (
        <a
          href={processedImage}
          download={`shahidul-studio-${fileName}`}
          className="btn-3d btn-3d-download mt-6 flex items-center justify-center px-6 py-3 bg-brand-primary text-white font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-brand-primary"
        >
          <DownloadIcon/>
          Download Result
        </a>
      )}
    </div>
  );
};

export default ResultDisplay;
