import React from 'react';
import { TrendingUp, Users, Clock, Star, DollarSign, Brain } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export const Analytics: React.FC = () => {
  const { analytics, recommendations, implementRecommendation, dismissRecommendation } = useAnalytics();

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

  const performanceMetrics = [
    {
      name: 'Total Bookings',
      value: analytics.totalBookings.toLocaleString(),
      change: '+12.5%',
      changeType: 'positive',
      icon: Users
    },
    {
      name: 'Completion Rate',
      value: `${Math.round((analytics.completedBookings / analytics.totalBookings) * 100)}%`,
      change: '+3.2%',
      changeType: 'positive',
      icon: TrendingUp
    },
    {
      name: 'Avg Wait Time',
      value: `${analytics.averageWaitTime}m`,
      change: '-8.1%',
      changeType: 'positive',
      icon: Clock
    },
    {
      name: 'User Satisfaction',
      value: `${analytics.userSatisfaction}/5`,
      change: '+0.3',
      changeType: 'positive',
      icon: Star
    },
    {
      name: 'No-Show Rate',
      value: `${analytics.noShowRate}%`,
      change: '-2.1%',
      changeType: 'positive',
      icon: Users
    },
    {
      name: 'Revenue Generated',
      value: `$${analytics.revenueGenerated?.toLocaleString()}`,
      change: '+18.7%',
      changeType: 'positive',
      icon: DollarSign
    }
  ];

  const weeklyData = [
    { name: 'Mon', bookings: 65, revenue: 4500 },
    { name: 'Tue', bookings: 78, revenue: 5200 },
    { name: 'Wed', bookings: 82, revenue: 5800 },
    { name: 'Thu', bookings: 71, revenue: 4900 },
    { name: 'Fri', bookings: 89, revenue: 6200 },
    { name: 'Sat', bookings: 45, revenue: 3100 },
    { name: 'Sun', bookings: 32, revenue: 2200 }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
        <p className="mt-2 text-gray-600">
          Track performance, analyze trends, and optimize your operations with AI-powered insights.
        </p>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {performanceMetrics.map((metric) => (
          <div key={metric.name} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <metric.icon className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${
                metric.changeType === 'positive' ? 'text-accent-600' : 'text-error-600'
              }`}>
                {metric.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trends */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Booking Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="bookings" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trends */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Service Popularity & Booking Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Services */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Services</h3>
          <div className="space-y-4">
            {analytics.popularServices.map((service, index) => (
              <div key={service.serviceId} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Service {service.serviceId}</p>
                    <p className="text-sm text-gray-500">{service.count} bookings</p>
                  </div>
                </div>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full" 
                    style={{ width: `${(service.count / analytics.popularServices[0].count) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Channels */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Channels</h3>
          <ResponsiveContainer width="100%" height={250}>
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
          <div className="flex items-center">
            <Brain className="h-6 w-6 text-secondary-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI-Powered Recommendations</h3>
              <p className="text-sm text-gray-600">
                Smart suggestions to optimize your operations and improve efficiency
              </p>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {recommendations.map((rec) => (
            <div key={rec.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900">{rec.title}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      rec.impact === 'high' ? 'bg-error-100 text-error-800' :
                      rec.impact === 'medium' ? 'bg-warning-100 text-warning-800' :
                      'bg-accent-100 text-accent-800'
                    }`}>
                      {rec.impact} impact
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {Math.round(rec.confidence * 100)}% confidence
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{rec.description}</p>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-900">Suggested Actions:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {rec.suggestedActions.map((action, index) => (
                        <li key={index} className="text-sm text-gray-600">{action}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="flex space-x-3 ml-6">
                  <button
                    onClick={() => implementRecommendation(rec.id)}
                    className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Implement
                  </button>
                  <button
                    onClick={() => dismissRecommendation(rec.id)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Peak Hours Analysis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Hours Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.peakHours}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="hour" 
              tickFormatter={(hour) => `${hour}:00`}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(hour) => `${hour}:00`}
              formatter={(value) => [value, 'Bookings']}
            />
            <Bar 
              dataKey="bookings" 
              fill="#8B5CF6" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};