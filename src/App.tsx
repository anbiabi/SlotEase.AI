import React, { useState } from 'react';
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
  const { currentProvider } = useAppointments();

  const handleBookingComplete = (appointmentId: string) => {
    console.log('Booking completed:', appointmentId);
    setCurrentView('appointments');
  };

  const handleOnboardingComplete = (data: any) => {
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
      <div className="min-h-screen bg-gray-50">
        {renderCurrentView()}
      </div>
    );
  }

  // Show onboarding without header
  if (currentView === 'onboarding') {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderCurrentView()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
          Back to Landing
        </button>
        <button
          onClick={() => setCurrentView('location-services')}
          className="block w-full bg-accent-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-accent-700 transition-colors text-sm font-medium"
        >
          Find Services
        </button>
        <button
          onClick={() => setCurrentView('onboarding')}
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
    </div>
  );
}

export default App;