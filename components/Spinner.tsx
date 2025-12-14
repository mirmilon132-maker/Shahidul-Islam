import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="border-4 border-gray-300 dark:border-gray-600 border-t-brand-primary rounded-full w-12 h-12 animate-spin"></div>
  );
};

export default Spinner;