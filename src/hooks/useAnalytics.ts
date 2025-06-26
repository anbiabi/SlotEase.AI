import { useState, useEffect } from 'react';
import { Analytics, AIRecommendation } from '../types';

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalBookings: 0,
    completedBookings: 0,
    noShowRate: 0,
    averageWaitTime: 0,
    peakHours: [],
    popularServices: [],
    bookingChannels: [],
    userSatisfaction: 0,
    revenueGenerated: 0
  });

  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);

  useEffect(() => {
    // Generate mock analytics data
    const mockAnalytics: Analytics = {
      totalBookings: 1247,
      completedBookings: 1089,
      noShowRate: 12.7,
      averageWaitTime: 18,
      peakHours: [
        { hour: 9, bookings: 45 },
        { hour: 10, bookings: 62 },
        { hour: 11, bookings: 38 },
        { hour: 14, bookings: 52 },
        { hour: 15, bookings: 41 },
        { hour: 16, bookings: 29 }
      ],
      popularServices: [
        { serviceId: 'service-1', count: 567 },
        { serviceId: 'service-2', count: 432 },
        { serviceId: 'service-3', count: 248 }
      ],
      bookingChannels: [
        { channel: 'web', count: 823 },
        { channel: 'phone', count: 312 },
        { channel: 'walk-in', count: 112 }
      ],
      userSatisfaction: 4.6,
      revenueGenerated: 156780
    };

    const mockRecommendations: AIRecommendation[] = [
      {
        id: 'rec-1',
        type: 'schedule_optimization',
        title: 'Optimize Morning Schedule',
        description: 'Analysis shows 23% higher demand between 9-11 AM. Consider adding more slots during this period.',
        impact: 'high',
        confidence: 0.87,
        suggestedActions: [
          'Add 2 additional time slots at 9:30 AM',
          'Extend morning hours to 8:00 AM',
          'Reassign staff to cover peak hours'
        ],
        status: 'pending',
        createdAt: new Date()
      },
      {
        id: 'rec-2',
        type: 'peak_prediction',
        title: 'Prepare for Holiday Rush',
        description: 'Predictive model indicates 40% increase in bookings during holiday season (Dec 15-31).',
        impact: 'high',
        confidence: 0.92,
        suggestedActions: [
          'Increase staff availability',
          'Open additional service windows',
          'Send proactive booking reminders'
        ],
        status: 'pending',
        createdAt: new Date()
      },
      {
        id: 'rec-3',
        type: 'service_improvement',
        title: 'Reduce No-Show Rate',
        description: 'Current no-show rate is 12.7%. Implementing SMS reminders could reduce this by 35%.',
        impact: 'medium',
        confidence: 0.74,
        suggestedActions: [
          'Enable automated SMS reminders',
          'Implement confirmation requirements',
          'Add cancellation penalties'
        ],
        status: 'pending',
        createdAt: new Date()
      }
    ];

    setAnalytics(mockAnalytics);
    setRecommendations(mockRecommendations);
  }, []);

  const implementRecommendation = async (recommendationId: string): Promise<void> => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === recommendationId 
          ? { ...rec, status: 'implemented', implementationDate: new Date() }
          : rec
      )
    );
  };

  const dismissRecommendation = async (recommendationId: string): Promise<void> => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === recommendationId 
          ? { ...rec, status: 'dismissed' }
          : rec
      )
    );
  };

  return {
    analytics,
    recommendations,
    implementRecommendation,
    dismissRecommendation
  };
};