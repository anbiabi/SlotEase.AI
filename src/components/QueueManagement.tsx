import React, { useState } from 'react';
import { Users, Clock, CheckCircle, AlertCircle, Phone, User } from 'lucide-react';
import { useAppointments } from '../hooks/useAppointments';
import { format } from 'date-fns';

export const QueueManagement: React.FC = () => {
  const { appointments, currentProvider, checkIn } = useAppointments();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'waiting' | 'in-service' | 'completed'>('all');

  const today = new Date();
  const todayAppointments = appointments.filter(apt => 
    apt.date.toDateString() === today.toDateString()
  );

  const queueStats = {
    total: todayAppointments.length,
    waiting: todayAppointments.filter(apt => apt.status === 'scheduled' || apt.status === 'confirmed').length,
    inService: todayAppointments.filter(apt => apt.status === 'in-progress').length,
    completed: todayAppointments.filter(apt => apt.status === 'completed').length,
    avgWaitTime: 18
  };

  const filteredAppointments = todayAppointments.filter(apt => {
    switch (selectedFilter) {
      case 'waiting':
        return apt.status === 'scheduled' || apt.status === 'confirmed';
      case 'in-service':
        return apt.status === 'in-progress';
      case 'completed':
        return apt.status === 'completed';
      default:
        return true;
    }
  }).sort((a, b) => {
    // Sort by priority first, then by time
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.time.localeCompare(b.time);
  });

  const getService = (serviceId: string) => {
    return currentProvider.services.find(s => s.id === serviceId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-warning-100 text-warning-800';
      case 'confirmed':
        return 'bg-primary-100 text-primary-800';
      case 'in-progress':
        return 'bg-secondary-100 text-secondary-800';
      case 'completed':
        return 'bg-accent-100 text-accent-800';
      case 'cancelled':
        return 'bg-error-100 text-error-800';
      case 'no-show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-error-500';
      case 'high':
        return 'bg-warning-500';
      case 'medium':
        return 'bg-primary-500';
      case 'low':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    // This would typically update the appointment status via API
    console.log(`Updating appointment ${appointmentId} to status: ${newStatus}`);
    
    if (newStatus === 'confirmed') {
      await checkIn(appointmentId);
    }
  };

  const callNext = () => {
    const nextWaiting = filteredAppointments.find(apt => 
      apt.status === 'scheduled' || apt.status === 'confirmed'
    );
    
    if (nextWaiting) {
      handleStatusChange(nextWaiting.id, 'in-progress');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Queue Management</h1>
          <p className="mt-2 text-gray-600">
            Manage today's appointments and queue flow
          </p>
        </div>
        <button
          onClick={callNext}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
        >
          <Phone className="h-5 w-5 mr-2" />
          Call Next
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Today</p>
              <p className="text-2xl font-bold text-gray-900">{queueStats.total}</p>
            </div>
            <Users className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Waiting</p>
              <p className="text-2xl font-bold text-warning-600">{queueStats.waiting}</p>
            </div>
            <Clock className="h-8 w-8 text-warning-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Service</p>
              <p className="text-2xl font-bold text-secondary-600">{queueStats.inService}</p>
            </div>
            <User className="h-8 w-8 text-secondary-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-accent-600">{queueStats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-accent-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex space-x-4">
          {[
            { key: 'all', label: 'All Appointments' },
            { key: 'waiting', label: 'Waiting' },
            { key: 'in-service', label: 'In Service' },
            { key: 'completed', label: 'Completed' }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setSelectedFilter(filter.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === filter.key
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Queue List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Queue ({filteredAppointments.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredAppointments.map((appointment, index) => {
            const service = getService(appointment.serviceId);
            return (
              <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Priority Indicator */}
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(appointment.priority)}`} />
                      <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                    </div>

                    {/* Appointment Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">
                            {appointment.time} - {service?.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            User ID: {appointment.userId} • {appointment.duration}min • {appointment.bookingChannel}
                          </p>
                          {appointment.notes && (
                            <p className="text-sm text-gray-500 mt-1">
                              Notes: {appointment.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Wait Time */}
                    {appointment.estimatedWaitTime && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Est. Wait</p>
                        <p className="text-sm font-medium text-gray-900">
                          {appointment.estimatedWaitTime}m
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Status Badge */}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      {appointment.status === 'scheduled' && (
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                          className="px-3 py-1 text-xs font-medium text-primary-700 bg-primary-100 rounded-md hover:bg-primary-200 transition-colors"
                        >
                          Check In
                        </button>
                      )}
                      
                      {appointment.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'in-progress')}
                          className="px-3 py-1 text-xs font-medium text-secondary-700 bg-secondary-100 rounded-md hover:bg-secondary-200 transition-colors"
                        >
                          Start Service
                        </button>
                      )}
                      
                      {appointment.status === 'in-progress' && (
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'completed')}
                          className="px-3 py-1 text-xs font-medium text-accent-700 bg-accent-100 rounded-md hover:bg-accent-200 transition-colors"
                        >
                          Complete
                        </button>
                      )}

                      <button
                        onClick={() => handleStatusChange(appointment.id, 'no-show')}
                        className="px-3 py-1 text-xs font-medium text-error-700 bg-error-100 rounded-md hover:bg-error-200 transition-colors"
                      >
                        No Show
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAppointments.length === 0 && (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600">
              {selectedFilter === 'all' 
                ? 'No appointments scheduled for today.' 
                : `No appointments with status "${selectedFilter}".`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};