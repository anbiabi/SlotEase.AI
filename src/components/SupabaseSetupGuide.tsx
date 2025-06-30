import React, { useState } from 'react';
import { Database, Server, Cloud, CheckCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';

export const SupabaseSetupGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'local' | 'cloud'>('local');
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const localSetupCommands = [
    { 
      label: 'Install Supabase CLI', 
      command: 'npm install -g supabase' 
    },
    { 
      label: 'Start Supabase locally', 
      command: 'npx supabase start' 
    },
    { 
      label: 'Get your credentials', 
      command: 'npx supabase status' 
    }
  ];

  const envFileContent = `# Supabase Configuration
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=your-anon-key-from-status-command

# Mistral AI Configuration (Optional)
MISTRAL_API_KEY=your-mistral-api-key
MISTRAL_API_URL=https://api.mistral.ai/v1/chat/completions`;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Supabase Setup Guide</h2>
      
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('local')}
          className={`px-4 py-2 rounded-lg flex items-center ${
            activeTab === 'local' 
              ? 'bg-primary-100 text-primary-700 border border-primary-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Server className="h-5 w-5 mr-2" />
          Local Development
        </button>
        <button
          onClick={() => setActiveTab('cloud')}
          className={`px-4 py-2 rounded-lg flex items-center ${
            activeTab === 'cloud' 
              ? 'bg-primary-100 text-primary-700 border border-primary-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Cloud className="h-5 w-5 mr-2" />
          Cloud Production
        </button>
      </div>

      {activeTab === 'local' && (
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">Prerequisites</h4>
                <p className="text-yellow-800 text-sm">Make sure you have Docker Desktop installed and running</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Step 1: Set Up Local Supabase</h3>
            
            <div className="space-y-3">
              {localSetupCommands.map((cmd, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">{cmd.label}:</p>
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm overflow-x-auto">
                      {cmd.command}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(cmd.command, `cmd-${index}`)}
                      className="absolute top-2 right-2 p-1 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
                      title="Copy to clipboard"
                    >
                      {copied === `cmd-${index}` ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mt-6">Step 2: Create .env File</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Create a .env file in your project root with the following content:</p>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm overflow-x-auto">
                  {envFileContent}
                </pre>
                <button
                  onClick={() => copyToClipboard(envFileContent, 'env')}
                  className="absolute top-2 right-2 p-1 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
                  title="Copy to clipboard"
                >
                  {copied === 'env' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mt-6">Step 3: Apply Database Schema</h3>
            <p className="text-gray-600 mb-2">
              The schema will be automatically applied when you start Supabase locally. The migration files are already in the project.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Success Indicators</h4>
                  <p className="text-green-800 text-sm">
                    After completing these steps, you should see a green "Connected" status indicator in the top-left corner of your application.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'cloud' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Step 1: Create Supabase Project</h3>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Create a Supabase Project</h4>
            <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
              <li>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase Dashboard</a></li>
              <li>Click <strong>New Project</strong></li>
              <li>Choose your organization (or create one)</li>
              <li>Enter project name: <code className="bg-blue-100 px-2 py-1 rounded">SlotEase Production</code></li>
              <li>Generate a strong database password (save it!)</li>
              <li>Choose a region closest to your users</li>
              <li>Select pricing plan (Free tier is fine to start)</li>
              <li>Click <strong>Create new project</strong></li>
            </ol>
            <div className="mt-4">
              <a 
                href="https://supabase.com/dashboard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Open Supabase Dashboard
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mt-6">Step 2: Get Project Credentials</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li>In your Supabase project, go to <strong>Settings</strong> → <strong>API</strong></li>
              <li>Copy your <strong>Project URL</strong> and <strong>anon public key</strong></li>
              <li>Update your .env file with these values</li>
            </ol>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mt-6">Step 3: Apply Database Schema</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 mb-3">
              You'll need to apply the database schema to your cloud project:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li>Go to <strong>SQL Editor</strong> in your Supabase dashboard</li>
              <li>Click <strong>New Query</strong></li>
              <li>Copy and paste the content from each migration file in order</li>
              <li>Click <strong>Run</strong> for each migration</li>
            </ol>
            <p className="text-gray-700 mt-3">
              The migration files are located in the <code className="bg-gray-100 px-2 py-1 rounded">supabase/migrations</code> directory of your project.
            </p>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mt-6">Step 4: Update Environment Variables</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 mb-2">Update your .env file with your cloud project credentials:</p>
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm overflow-x-auto">
{`# Supabase Configuration (Production)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# Mistral AI Configuration (Optional)
MISTRAL_API_KEY=your-mistral-api-key
MISTRAL_API_URL=https://api.mistral.ai/v1/chat/completions`}
              </pre>
              <button
                onClick={() => copyToClipboard(`# Supabase Configuration (Production)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# Mistral AI Configuration (Optional)
MISTRAL_API_KEY=your-mistral-api-key
MISTRAL_API_URL=https://api.mistral.ai/v1/chat/completions`, 'prod-env')}
                className="absolute top-2 right-2 p-1 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
                title="Copy to clipboard"
              >
                {copied === 'prod-env' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};