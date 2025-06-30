import React, { useState } from 'react';
import { X, Cloud, Server, ExternalLink } from 'lucide-react';
import { CloudSetupWizard } from './CloudSetupWizard';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const [setupType, setSetupType] = useState<'choose' | 'local' | 'cloud'>('choose');

  if (!isOpen) return null;

  const resetAndClose = () => {
    setSetupType('choose');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Supabase Setup</h2>
          <button
            onClick={resetAndClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {setupType === 'choose' && (
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Choose Your Setup Method</h3>
              <p className="text-gray-600 mb-8">Select how you'd like to set up Supabase for your project</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div 
                  onClick={() => setSetupType('local')}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
                >
                  <Server className="h-12 w-12 text-gray-600 group-hover:text-blue-600 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold mb-2">Local Development</h4>
                  <p className="text-gray-600 mb-4">
                    Quick setup using Docker for local development and testing
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-green-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Fast setup (5 minutes)
                    </div>
                    <div className="flex items-center text-green-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      No account required
                    </div>
                    <div className="flex items-center text-green-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Perfect for testing
                    </div>
                  </div>
                </div>

                <div 
                  onClick={() => setSetupType('cloud')}
                  className="p-6 border-2 border-blue-200 bg-blue-50 rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
                >
                  <Cloud className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold mb-2">Cloud Production</h4>
                  <p className="text-gray-600 mb-4">
                    Production-ready cloud database with global availability
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-blue-600">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Production ready
                    </div>
                    <div className="flex items-center text-blue-600">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Global edge network
                    </div>
                    <div className="flex items-center text-blue-600">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Automatic backups
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-blue-600 font-medium">
                    ⭐ Recommended for production
                  </div>
                </div>
              </div>
            </div>
          )}

          {setupType === 'local' && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <Server className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Local Development Setup</h3>
                <p className="text-gray-600">Set up Supabase locally using Docker</p>
              </div>

              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">Prerequisites</h4>
                  <ul className="text-yellow-800 text-sm space-y-1">
                    <li>• Docker Desktop installed and running</li>
                    <li>• Node.js 16+ installed</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium mb-4">Setup Commands</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">1. Start Supabase locally:</p>
                      <code className="block bg-gray-900 text-gray-100 p-3 rounded text-sm">
                        npx supabase start
                      </code>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 mb-2">2. Get your credentials:</p>
                      <code className="block bg-gray-900 text-gray-100 p-3 rounded text-sm">
                        npx supabase status
                      </code>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 mb-2">3. Create .env file with the anon key from step 2:</p>
                      <code className="block bg-gray-900 text-gray-100 p-3 rounded text-sm">
{`VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your-anon-key-from-status-command`}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">✅ That's it!</h4>
                  <p className="text-green-800 text-sm">
                    Your local Supabase instance will be running with all the necessary tables and functions. 
                    The status indicator should show "Connected" when you restart your dev server.
                  </p>
                </div>
              </div>
            </div>
          )}

          {setupType === 'cloud' && <CloudSetupWizard />}
        </div>
      </div>
    </div>
  );
};