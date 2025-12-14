import React from 'react';

interface BrushToolbarProps {
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  onClear: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const BrushIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);

const UndoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
    </svg>
);

const RedoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
    </svg>
);

const BrushToolbar: React.FC<BrushToolbarProps> = ({ 
    brushSize, 
    onBrushSizeChange, 
    onClear,
    onUndo,
    onRedo,
    canUndo,
    canRedo
}) => {
  return (
    <div className="relative z-30 w-full max-w-xl flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-200 dark:bg-gray-900 rounded-xl shadow-inner">
      <div className="flex-1 w-full flex items-center gap-3">
        <BrushIcon />
        <input 
          type="range"
          min="5"
          max="100"
          step="1"
          value={brushSize}
          onChange={(e) => onBrushSizeChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-sm font-mono w-10 text-center text-gray-700 dark:text-gray-200">{brushSize}</span>
      </div>
      
      <div className="flex items-center gap-2">
          {onUndo && (
            <button 
                onClick={onUndo}
                disabled={!canUndo}
                className="p-2 text-gray-700 bg-white/80 dark:bg-gray-700/80 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                title="Undo"
            >
                <UndoIcon />
            </button>
          )}
          {onRedo && (
            <button 
                onClick={onRedo}
                disabled={!canRedo}
                className="p-2 text-gray-700 bg-white/80 dark:bg-gray-700/80 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                title="Redo"
            >
                <RedoIcon />
            </button>
          )}
          <div className="w-px h-6 bg-gray-400 dark:bg-gray-600 mx-1"></div>
          <button 
            onClick={onClear}
            className="px-4 py-1.5 text-xs font-semibold text-gray-700 bg-white/80 dark:bg-gray-700/80 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
          >
            Clear
          </button>
      </div>
    </div>
  );
};

export default BrushToolbar;