import React, { useState, useEffect, Suspense } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { BookingForm } from './components/BookingForm';
import { AppointmentsList } from './components/AppointmentsList';
import { QueueManagement } from './components/QueueManagement';
import { Analytics } from './components/Analytics';
import { SetupWizard } from './components/SetupWizard';
import { UserOnboarding } from './components/UserOnboarding';
import { LocationServiceFinder } from './components/LocationServiceFinder';
import { LandingPage } from './components/LandingPage';
import { LanguageSelector } from './components/LanguageSelector';
import { SupabaseStatusIndicator } from './components/SupabaseStatusIndicator';
import { useAppointments } from './hooks/useAppointments';
import { useTranslation } from './hooks/useTranslation';
import { supabaseService } from './services/SupabaseService';
import { processBookingWithAI } from './ai/AIBackgroundProcessor';

// Error boundary for robust error handling
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    // Log error to console or external service
    console.error('ErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <pre className="text-xs text-left bg-gray-100 p-2 rounded mb-4 overflow-x-auto">{String(this.state.error)}</pre>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
    <p className="text-gray-600">Loading...</p>
  </div>
);

type ViewType = 'landing' | 'onboarding' | 'dashboard' | 'booking' | 'appointments' | 'my-appointments' | 'analytics' | 'location-services' | 'setup' | 'queue';
type UserRole = 'user' | 'admin';

interface OnboardingData {
  agreedToTerms: boolean;
  selectedService: string;
  fullName: string;
  phoneNumber: string;
  selectedDate: Date | null;
  selectedTime: string;
}

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const [userRole, setUserRole] = useState<UserRole>('user');
  const { currentProvider } = useAppointments();
  const { t, ready } = useTranslation();
  const [supabaseStatus, setSupabaseStatus] = useState<{
    isConfigured: boolean;
    missingEnvVars: string[];
    connectionStatus: 'connected' | 'disconnected' | 'error';
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Supabase service with error handling
    const initializeSupabase = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const status = await supabaseService.checkConfiguration();
        setSupabaseStatus(status);
        if (status.isConfigured && status.connectionStatus === 'connected') {
          console.log('Supabase connection established successfully');
        } else if (!status.isConfigured) {
          console.warn('Supabase not configured. Missing environment variables:', status.missingEnvVars);
          console.log(supabaseService.getEnvironmentSetupInstructions());
        } else {
          console.error('Supabase connection failed:', status.connectionStatus);
        }
      } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        setSupabaseStatus({
          isConfigured: false,
          missingEnvVars: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'],
          connectionStatus: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };
    initializeSupabase();
  }, []);

  // Show loading spinner while translations or supabase are loading
  if (!ready || isLoading) {
    return <LoadingSpinner />;
  }

  const handleBookingComplete = async (appointmentId: string, bookingData?: any) => {
    console.log('Booking completed:', appointmentId);
    setCurrentView('appointments');
    // AI background processing (if bookingData is available)
    if (bookingData) {
      try {
        await processBookingWithAI(bookingData);
      } catch (err) {
        console.error('AI background processing failed:', err);
      }
    }
  };

  const handleOnboardingComplete = (data: OnboardingData) => {
    console.log('Onboarding completed:', data);
    setCurrentView('location-services');
    setUserRole('admin');
  };

  const handleGetStarted = () => {
    setCurrentView('onboarding');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onGetStarted={handleGetStarted} />;
      case 'onboarding':
        return <UserOnboarding onComplete={handleOnboardingComplete} />;
      case 'location-services':
        return <LocationServiceFinder />;
      case 'dashboard':
        return <Dashboard />;
      case 'booking':
        return <BookingForm provider={currentProvider} onBookingComplete={handleBookingComplete} />;
      case 'appointments':
        return <AppointmentsList />;
      case 'my-appointments':
        return <AppointmentsList />;
      case 'queue':
        return <QueueManagement />;
      case 'analytics':
        return <Analytics />;
      case 'setup':
        return <SetupWizard />;
      default:
        return <LandingPage onGetStarted={handleGetStarted} />;
    }
  };

  // Show landing page without header
  if (currentView === 'landing') {
    return (
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <div className="min-h-screen bg-gray-50">
            <SupabaseStatusIndicator />
            {renderCurrentView()}
          </div>
        </Suspense>
      </ErrorBoundary>
    );
  }

  // Show onboarding without header
  if (currentView === 'onboarding') {
    return (
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <div className="min-h-screen bg-gray-50">
            <SupabaseStatusIndicator />
            {renderCurrentView()}
          </div>
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <div className="min-h-screen bg-gray-50">
          <SupabaseStatusIndicator />
          <Header 
            currentView={currentView} 
            onViewChange={setCurrentView} 
            userRole={userRole}
          />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderCurrentView()}
          </main>
          {/* Navigation Controls */}
          <div className="fixed bottom-4 right-4 space-y-2">
            <button
              onClick={() => setCurrentView('landing')}
              className="block w-full bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              {t('navigation.backToLanding')}
            </button>
            <button
              onClick={() => setCurrentView('location-services')}
              className="block w-full bg-accent-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-accent-700 transition-colors text-sm font-medium"
            >
              {t('navigation.findServices')}
            </button>
            <button
              onClick={() => setCurrentView('onboarding')}
              className="block w-full bg-secondary-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-secondary-700 transition-colors text-sm font-medium"
            >
              {t('navigation.resetOnboarding')}
            </button>
            <button
              onClick={() => setUserRole(userRole === 'admin' ? 'user' : 'admin')}
              className="block w-full bg-primary-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              {t('navigation.switchView', { role: userRole === 'admin' ? 'User' : 'Admin' })}
            </button>
            {/* Mobile Language Selector */}
            <div className="sm:hidden">
              <LanguageSelector variant="dropdown" className="w-full" />
            </div>
          </div>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;