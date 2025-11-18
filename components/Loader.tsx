
import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="mt-12 flex flex-col items-center justify-center space-y-4">
      <div className="flex space-x-2">
        <div className="w-8 h-8 bg-black animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-8 h-8 bg-yellow-400 animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-8 h-8 bg-black animate-bounce"></div>
      </div>
      <p className="text-xl font-bold tracking-wider">GENERATING INSIGHTS...</p>
    </div>
  );
};
