import React, { useState } from 'react';
import { Cloud, Database, Key, Shield, CheckCircle, ExternalLink, Copy, AlertCircle } from 'lucide-react';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export const CloudSetupWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [projectUrl, setProjectUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const steps: SetupStep[] = [
    {
      id: 'create-project',
      title: 'Create Supabase Project',
      description: 'Set up your cloud database instance',
      completed: false
    },
    {
      id: 'get-credentials',
      title: 'Get Project Credentials',
      description: 'Copy your project URL and API keys',
      completed: false
    },
    {
      id: 'apply-schema',
      title: 'Apply Database Schema',
      description: 'Run migration files to set up tables',
      completed: false
    },
    {
      id: 'configure-auth',
      title: 'Configure Authentication',
      description: 'Set up user authentication settings',
      completed: false
    },
    {
      id: 'test-connection',
      title: 'Test Connection',
      description: 'Verify everything is working',
      completed: false
    }
  ];

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const generateEnvFile = () => {
    if (!projectUrl || !anonKey) return '';
    
    return `# Supabase Configuration (Production)
VITE_SUPABASE_URL=${projectUrl}
VITE_SUPABASE_ANON_KEY=${anonKey}

# AI Integration (Optional)
MISTRAL_API_KEY=your-mistral-api-key
MISTRAL_API_URL=https://api.mistral.ai/v1/chat/completions`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <Cloud className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Supabase Cloud Setup</h1>
        <p className="text-gray-600">Configure your production database in the cloud</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                index <= currentStep 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {step.completed ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  index + 1
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 mx-2 ${
                  index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          {steps.map((step) => (
            <span key={step.id} className="text-center max-w-24">{step.title}</span>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {currentStep === 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Database className="h-6 w-6 mr-2 text-blue-600" />
              Create Supabase Project
            </h3>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Step 1: Go to Supabase</h4>
                <p className="text-blue-800 mb-3">Visit the Supabase dashboard to create your project</p>
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
              
              <div className="space-y-3">
                <h4 className="font-medium">Instructions:</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Click "New Project" in the dashboard</li>
                  <li>Choose your organization (or create one)</li>
                  <li>Enter project name: <code className="bg-gray-100 px-2 py-1 rounded">SlotEase Production</code></li>
                  <li>Generate a strong database password (save it!)</li>
                  <li>Choose a region closest to your users</li>
                  <li>Select pricing plan (Free tier is fine to start)</li>
                  <li>Click "Create new project"</li>
                </ol>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Important</h4>
                    <p className="text-yellow-800 text-sm">Save your database password securely. You'll need it for advanced operations.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Key className="h-6 w-6 mr-2 text-blue-600" />
              Get Project Credentials
            </h3>
            <div className="space-y-4">
              <p className="text-gray-600">Once your project is created, get your API credentials:</p>
              
              <div className="space-y-3">
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>In your Supabase project, go to <strong>Settings</strong> → <strong>API</strong></li>
                  <li>Copy your <strong>Project URL</strong> and <strong>anon public key</strong></li>
                  <li>Paste them in the fields below:</li>
                </ol>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project URL
                  </label>
                  <input
                    type="text"
                    value={projectUrl}
                    onChange={(e) => setProjectUrl(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anon Key
                  </label>
                  <textarea
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {projectUrl && anonKey && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Environment File</h4>
                  <p className="text-green-800 text-sm mb-3">Create a <code>.env</code> file with these values:</p>
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{generateEnvFile()}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(generateEnvFile(), 'env')}
                      className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
                    >
                      {copied === 'env' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Database className="h-6 w-6 mr-2 text-blue-600" />
              Apply Database Schema
            </h3>
            <div className="space-y-4">
              <p className="text-gray-600">Run the migration files to set up your database tables:</p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">In Supabase Dashboard:</h4>
                <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
                  <li>Go to <strong>SQL Editor</strong></li>
                  <li>Click <strong>New Query</strong></li>
                  <li>Copy and paste each migration file content</li>
                  <li>Click <strong>Run</strong> for each migration</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Migration Files (run in order):</h4>
                {[
                  { name: '20250627104649_jade_ember.sql', description: 'Core database schema' },
                  { name: '20250627104736_floral_haze.sql', description: 'Security policies' },
                  { name: '20250627104756_silent_recipe.sql', description: 'Materialized views' },
                  { name: '20250627104826_throbbing_flame.sql', description: 'Functions & triggers' },
                  { name: '20250627104918_hidden_frost.sql', description: 'Performance optimization' }
                ].map((migration, index) => (
                  <div key={migration.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{index + 1}. {migration.name}</span>
                      <p className="text-sm text-gray-600">{migration.description}</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      supabase/migrations/
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Important</h4>
                    <p className="text-yellow-800 text-sm">Run migrations in the exact order shown. Each migration builds on the previous one.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Shield className="h-6 w-6 mr-2 text-blue-600" />
              Configure Authentication
            </h3>
            <div className="space-y-4">
              <p className="text-gray-600">Set up user authentication for your application:</p>
              
              <div className="space-y-3">
                <h4 className="font-medium">Authentication Settings:</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Go to <strong>Authentication</strong> → <strong>Settings</strong></li>
                  <li>Set <strong>Site URL</strong> to: <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:5173</code></li>
                  <li>Add your production domain to <strong>Redirect URLs</strong> when ready</li>
                  <li>Disable <strong>Email confirmations</strong> for easier testing</li>
                  <li>Enable <strong>Email signup</strong></li>
                </ol>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">✅ Recommended Settings</h4>
                  <ul className="text-green-800 text-sm space-y-1">
                    <li>• Email signup: Enabled</li>
                    <li>• Email confirmations: Disabled</li>
                    <li>• Password requirements: Default</li>
                    <li>• Session timeout: 1 week</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">🔒 Security Features</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Row Level Security: Enabled</li>
                    <li>• JWT validation: Automatic</li>
                    <li>• Rate limiting: Built-in</li>
                    <li>• CORS: Configured</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
              Test Connection
            </h3>
            <div className="space-y-4">
              <p className="text-gray-600">Verify your setup is working correctly:</p>
              
              <div className="space-y-3">
                <h4 className="font-medium">Testing Steps:</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Save your <code>.env</code> file in the project root</li>
                  <li>Restart your development server: <code className="bg-gray-100 px-2 py-1 rounded">npm run dev</code></li>
                  <li>Check the Supabase status indicator (top-left corner)</li>
                  <li>Look for "Connected" status with green indicator</li>
                  <li>Test user registration and login</li>
                  <li>Try creating a test booking</li>
                </ol>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">✅ Success Indicators</h4>
                <ul className="text-green-800 text-sm space-y-1">
                  <li>• Green "Connected" status in development</li>
                  <li>• No console errors related to Supabase</li>
                  <li>• User registration works</li>
                  <li>• Data appears in Supabase dashboard</li>
                  <li>• AI background processing logs appear</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">🎉 You're Ready!</h4>
                <p className="text-blue-800 text-sm">
                  Your Supabase cloud instance is now configured and ready for production use. 
                  You can now deploy your application and start serving real users.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};