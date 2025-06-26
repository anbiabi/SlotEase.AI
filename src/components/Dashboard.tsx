import React from 'react';
import { Users, Calendar, Clock, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import { useAppointments } from '../hooks/useAppointments';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const Dashboard: React.FC = () => {
  const { analytics, recommendations } = useAnalytics();
  const { appointments } = useAppointments();

  const todayAppointments = appointments.filter(apt => {
    const today = new Date();
    return apt.date.toDateString() === today.toDateString();
  });

  const upcomingAppointments = appointments.filter(apt => {
    const today = new Date();
    return apt.date > today && apt.status !== 'cancelled';
  });

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'];

  const stats = [
    {
      name: 'Today\'s Appointments',
      value: todayAppointments.length,
      change: '+12%',
      changeType: 'positive',
      icon: Calendar
    },
    {
      name: 'Active Queue',
      value: todayAppointments.filter(apt => apt.status === 'confirmed').length,
      change: '-5%',
      changeType: 'negative',
      icon: Users
    },
    {
      name: 'Avg. Wait Time',
      value: `${analytics.averageWaitTime}m`,
      change: '-8%',
      changeType: 'positive',
      icon: Clock
    },
    {
      name: 'Completion Rate',
      value: `${Math.round((analytics.completedBookings / analytics.totalBookings) * 100)}%`,
      change: '+3%',
      changeType: 'positive',
      icon: TrendingUp
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Here's what's happening with your appointments today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <stat.icon className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-accent-600' : 'text-error-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">vs last week</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Hours</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.peakHours}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Booking Channels */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Channels</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.bookingChannels}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analytics.bookingChannels.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
          <p className="text-sm text-gray-600 mt-1">
            Smart suggestions to optimize your operations
          </p>
        </div>
        <div className="divide-y divide-gray-200">
          {recommendations.slice(0, 3).map((rec) => (
            <div key={rec.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    rec.impact === 'high' ? 'bg-error-100' :
                    rec.impact === 'medium' ? 'bg-warning-100' :
                    'bg-accent-100'
                  }`}>
                    {rec.impact === 'high' ? (
                      <AlertTriangle className={`h-5 w-5 ${
                        rec.impact === 'high' ? 'text-error-600' : 'text-warning-600'
                      }`} />
                    ) : (
                      <TrendingUp className="h-5 w-5 text-accent-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{rec.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                    <div className="mt-2 flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rec.impact === 'high' ? 'bg-error-100 text-error-800' :
                        rec.impact === 'medium' ? 'bg-warning-100 text-warning-800' :
                        'bg-accent-100 text-accent-800'
                      }`}>
                        {rec.impact} impact
                      </span>
                      <span className="text-xs text-gray-500">
                        {Math.round(rec.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-xs font-medium text-primary-700 bg-primary-100 rounded-md hover:bg-primary-200 transition-colors">
                    Implement
                  </button>
                  <button className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {todayAppointments.slice(0, 5).map((appointment) => (
            <div key={appointment.id} className="p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${
                  appointment.status === 'completed' ? 'bg-accent-100' :
                  appointment.status === 'confirmed' ? 'bg-primary-100' :
                  appointment.status === 'cancelled' ? 'bg-error-100' :
                  'bg-warning-100'
                }`}>
                  {appointment.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-accent-600" />
                  ) : (
                    <Calendar className="h-5 w-5 text-primary-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Appointment at {appointment.time}
                  </p>
                  <p className="text-sm text-gray-500">
                    {appointment.bookingChannel} booking • {appointment.status}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {appointment.estimatedWaitTime}m wait
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};