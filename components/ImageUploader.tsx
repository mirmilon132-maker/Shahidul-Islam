
import React, { useState, useCallback } from 'react';

interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
}

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const uploaderClasses = `flex flex-col items-center justify-center w-full p-8 sm:p-12 border-4 border-dashed rounded-xl transition-colors duration-300 cursor-pointer 
    ${isDragging 
      ? 'border-brand-primary bg-brand-primary/10' 
      : 'border-gray-300/50 dark:border-gray-700/50 hover:border-brand-primary/50 dark:hover:border-brand-primary/50'
    }`;
  
  return (
    <div 
      className={uploaderClasses}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <UploadIcon />
      <p className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">
        Drag & drop your image here
      </p>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        or
      </p>
      <label htmlFor="file-upload" className="mt-4 px-6 py-2 bg-brand-primary text-white font-bold rounded-lg cursor-pointer hover:bg-brand-secondary transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg">
        Select File
      </label>
      <input
        id="file-upload"
        type="file"
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
      />
      <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
        Supports: PNG, JPG, WEBP
      </p>
    </div>
  );
};

export default ImageUploader;