import React, { useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, Filter, Search, ChevronDown } from 'lucide-react';
import { useAppointments } from '../hooks/useAppointments';
import { format, isToday, isTomorrow, addDays } from 'date-fns';

export const AppointmentsList: React.FC = () => {
  const { appointments, currentProvider, cancelAppointment } = useAppointments();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

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
        return 'border-l-error-500';
      case 'high':
        return 'border-l-warning-500';
      case 'medium':
        return 'border-l-primary-500';
      case 'low':
        return 'border-l-gray-400';
      default:
        return 'border-l-gray-400';
    }
  };

  const formatDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d, yyyy');
  };

  const filteredAppointments = appointments
    .filter(apt => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const service = getService(apt.serviceId);
      const matchesSearch = !searchTerm || 
        apt.userId.toLowerCase().includes(searchLower) ||
        service?.name.toLowerCase().includes(searchLower) ||
        apt.notes?.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;

      // Date filter
      let matchesDate = true;
      if (filterDate === 'today') {
        matchesDate = isToday(apt.date);
      } else if (filterDate === 'tomorrow') {
        matchesDate = isTomorrow(apt.date);
      } else if (filterDate === 'week') {
        const weekFromNow = addDays(new Date(), 7);
        matchesDate = apt.date <= weekFromNow;
      }

      return matchesSearch && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return a.date.getTime() - b.date.getTime();
        case 'time':
          return a.time.localeCompare(b.time);
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const upcomingCount = appointments.filter(apt => 
    apt.date >= new Date() && apt.status !== 'cancelled' && apt.status !== 'completed'
  ).length;

  const todayCount = appointments.filter(apt => 
    isToday(apt.date) && apt.status !== 'cancelled'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="mt-2 text-gray-600">
            Manage and track all appointments across your services
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Today</p>
            <p className="text-2xl font-bold text-primary-600">{todayCount}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Upcoming</p>
            <p className="text-2xl font-bold text-accent-600">{upcomingCount}</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>

            <div className="relative">
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="week">This Week</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="date">Sort by Date</option>
                <option value="time">Sort by Time</option>
                <option value="priority">Sort by Priority</option>
                <option value="status">Sort by Status</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Appointments ({filteredAppointments.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredAppointments.map((appointment) => {
            const service = getService(appointment.serviceId);
            return (
              <div 
                key={appointment.id} 
                className={`p-6 hover:bg-gray-50 transition-colors border-l-4 ${getPriorityColor(appointment.priority)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    {/* Date & Time */}
                    <div className="text-center min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(appointment.date)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-600">{appointment.time}</p>
                      </div>
                    </div>

                    {/* Service Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-gray-900 truncate">
                        {service?.name || 'Unknown Service'}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {service?.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          User: {appointment.userId}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {appointment.duration}min
                        </div>
                        <div className="capitalize">
                          {appointment.bookingChannel}
                        </div>
                        <div className="capitalize">
                          {appointment.priority} priority
                        </div>
                      </div>
                      {appointment.notes && (
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Notes:</strong> {appointment.notes}
                        </p>
                      )}
                    </div>

                    {/* Status & Actions */}
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                      
                      {appointment.estimatedWaitTime && (
                        <p className="text-sm text-gray-500 mt-2">
                          Est. wait: {appointment.estimatedWaitTime}m
                        </p>
                      )}

                      <div className="flex space-x-2 mt-3">
                        {appointment.status === 'scheduled' && (
                          <button className="px-3 py-1 text-xs font-medium text-primary-700 bg-primary-100 rounded-md hover:bg-primary-200 transition-colors">
                            Confirm
                          </button>
                        )}
                        
                        {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                          <button 
                            onClick={() => cancelAppointment(appointment.id)}
                            className="px-3 py-1 text-xs font-medium text-error-700 bg-error-100 rounded-md hover:bg-error-200 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                        
                        <button className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAppointments.length === 0 && (
          <div className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== 'all' || filterDate !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'No appointments have been scheduled yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};