import React, { useState, useEffect } from 'react';
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
import { useAppointments } from './hooks/useAppointments';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { currentProvider } = useAppointments();

  // Initialize app and handle loading state
  useEffect(() => {
    const initializeApp = async () => {
      // Simulate any necessary initialization
      await new Promise(resolve => setTimeout(resolve, 100));
      setIsLoading(false);
    };

    initializeApp();
  }, []);

  const handleBookingComplete = (appointmentId: string) => {
    console.log('Booking completed:', appointmentId);
    handleViewChange('appointments');
  };

  const handleOnboardingComplete = (data: any) => {
    console.log('Onboarding completed:', data);
    handleViewChange('location-services');
    setUserRole('admin');
  };

  const handleGetStarted = () => {
    handleViewChange('onboarding');
  };

  const handleViewChange = (newView: string) => {
    if (newView === currentView) return;
    
    setIsTransitioning(true);
    
    // Small delay to ensure smooth transition
    setTimeout(() => {
      setCurrentView(newView);
      setIsTransitioning(false);
    }, 150);
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

  // Show loading screen during initial load
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading SlotEase...</p>
        </div>
      </div>
    );
  }

  // Show transition overlay during view changes
  const TransitionOverlay = () => (
    <div className={`fixed inset-0 bg-white z-50 transition-opacity duration-150 ${
      isTransitioning ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}>
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    </div>
  );

  // Show landing page without header
  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {renderCurrentView()}
        </div>
        <TransitionOverlay />
      </div>
    );
  }

  // Show onboarding without header
  if (currentView === 'onboarding') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {renderCurrentView()}
        </div>
        <TransitionOverlay />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentView={currentView} 
        onViewChange={handleViewChange} 
        userRole={userRole}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {renderCurrentView()}
        </div>
      </main>

      {/* Navigation Controls */}
      <div className="fixed bottom-4 right-4 space-y-2">
        <button
          onClick={() => handleViewChange('landing')}
          className="block w-full bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors text-sm font-medium"
        >
          Back to Landing
        </button>
        <button
          onClick={() => handleViewChange('location-services')}
          className="block w-full bg-accent-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-accent-700 transition-colors text-sm font-medium"
        >
          Find Services
        </button>
        <button
          onClick={() => handleViewChange('onboarding')}
          className="block w-full bg-secondary-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-secondary-700 transition-colors text-sm font-medium"
        >
          Reset to Onboarding
        </button>
        <button
          onClick={() => setUserRole(userRole === 'admin' ? 'user' : 'admin')}
          className="block w-full bg-primary-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          Switch to {userRole === 'admin' ? 'User' : 'Admin'} View
        </button>
      </div>

      <TransitionOverlay />
    </div>
  );
}

export default App;