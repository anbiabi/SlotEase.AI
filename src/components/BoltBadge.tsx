import React from 'react';
import { ExternalLink } from 'lucide-react';

interface BoltBadgeProps {
  className?: string;
  variant?: 'default' | 'minimal' | 'footer';
}

export const BoltBadge: React.FC<BoltBadgeProps> = ({ 
  className = '', 
  variant = 'default' 
}) => {
  const handleClick = () => {
    window.open('https://bolt.new', '_blank', 'noopener,noreferrer');
  };

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors ${className}`}
        title="Built with Bolt.new"
      >
        <span className="mr-1">⚡</span>
        Built with Bolt.new
        <ExternalLink className="h-3 w-3 ml-1" />
      </button>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <button
          onClick={handleClick}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <span className="mr-2 text-lg">⚡</span>
          Built with Bolt.new
          <ExternalLink className="h-4 w-4 ml-2" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg ${className}`}
    >
      <span className="mr-2 text-lg">⚡</span>
      Built with Bolt.new
      <ExternalLink className="h-4 w-4 ml-2" />
    </button>
  );
};