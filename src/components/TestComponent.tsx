import React from 'react';

export const TestComponent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">SlotEase.AI</h1>
        <p className="text-gray-600 mb-6">React is working! 🎉</p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>✅ React Components</p>
          <p>✅ Tailwind CSS</p>
          <p>✅ TypeScript</p>
          <p>✅ Vite Build System</p>
        </div>
      </div>
    </div>
  );
}; 