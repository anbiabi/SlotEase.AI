import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, AlertCircle, XCircle, Loader, Settings } from 'lucide-react';
import { checkSupabaseStatus, getSetupInstructions, type SupabaseStatus } from '../utils/supabaseStatus';
import { SupabaseSetupModal } from './SupabaseSetupModal';

export const SupabaseStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<SupabaseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      setLoading(true);
      try {
        const result = await checkSupabaseStatus();
        setStatus(result);
      } catch (error) {
        console.error('Failed to check Supabase status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!import.meta.env.DEV) {
    return null; // Only show in development
  }

  const getStatusIcon = () => {
    if (loading) return <Loader className="h-4 w-4 animate-spin" />;
    if (!status) return <XCircle className="h-4 w-4 text-red-500" />;
    if (status.isConnected) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status.isConfigured) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusText = () => {
    if (loading) return 'Checking...';
    if (!status) return 'Error';
    if (status.isConnected) return 'Connected';
    if (status.isConfigured) return 'Configured';
    return 'Not Configured';
  };

  const getStatusColor = () => {
    if (loading) return 'bg-blue-50 border-blue-200';
    if (!status) return 'bg-red-50 border-red-200';
    if (status.isConnected) return 'bg-green-50 border-green-200';
    if (status.isConfigured) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <>
      <div className="fixed top-4 left-4 z-50">
        <div 
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${getStatusColor()}`}
          onClick={() => setShowDetails(!showDetails)}
        >
          <Database className="h-4 w-4 text-gray-600" />
          {getStatusIcon()}
          <span className="text-sm font-medium text-gray-700">
            Supabase: {getStatusText()}
          </span>
        </div>

        {showDetails && status && (
          <div className="absolute top-full left-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Configuration Status</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  status.isConfigured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {status.isConfigured ? 'Configured' : 'Not Configured'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Database Connection</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  status.databaseReady ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {status.databaseReady ? 'Ready' : 'Not Ready'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Authentication</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  status.authEnabled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {status.authEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Edge Functions</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  status.edgeFunctionsReady ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {status.edgeFunctionsReady ? 'Ready' : 'Not Deployed'}
                </span>
              </div>

              {status.missingEnvVars.length > 0 && (
                <div className="border-t pt-3">
                  <span className="font-medium text-red-600">Missing Environment Variables:</span>
                  <ul className="list-disc list-inside text-red-600 mt-1">
                    {status.missingEnvVars.map(varName => (
                      <li key={varName}>{varName}</li>
                    ))}
                  </ul>
                </div>
              )}

              {status.errors.length > 0 && (
                <div className="border-t pt-3">
                  <span className="font-medium text-red-600">Errors:</span>
                  <ul className="list-disc list-inside text-red-600 mt-1">
                    {status.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border-t pt-3 space-y-2">
                <button
                  onClick={() => setShowSetupModal(true)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Setup Supabase
                </button>
                
                <details>
                  <summary className="cursor-pointer font-medium text-blue-600">Quick Setup Instructions</summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded whitespace-pre-wrap">
                    {getSetupInstructions(status)}
                  </pre>
                </details>
              </div>
            </div>
          </div>
        )}
      </div>

      <SupabaseSetupModal 
        isOpen={showSetupModal} 
        onClose={() => setShowSetupModal(false)} 
      />
    </>
  );
};