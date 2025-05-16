import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
   AnalyticsOverviewResponse,
   CauseAnalyticsResponse,
   DonorAnalyticsResponse
} from '@/types/analytics';

// Define types for analytics data
interface AnalyticsOverview {
   monthlyDonationTrends: Array<{
      year: number;
      month: number;
      count: number;
      total: number;
   }>;
   donationTypeDistribution: Array<{
      _id: string;
      count: number;
      total: number;
   }>;
   topCauses: Array<{
      _id: string;
      title: string;
      targetAmount: number;
      raisedAmount: number;
   }>;
   donorRetention: {
      thisYearDonorCount: number;
      lastYearDonorCount: number;
      retainedDonorCount: number;
      retentionRate: number;
      newDonorCount: number;
   };
   avgDonationTrend: Array<{
      year: number;
      month: number;
      avgAmount: number;
   }>;
   yearComparison: {
      currentYear: number;
      previousYear: number;
      yoyGrowth: number;
   };
   feedbackSentiment: {
      totalFeedback: number;
      averageRating: number;
      sentiment: {
         positive: number;
         neutral: number;
         negative: number;
      };
   };
}

interface CauseAnalytics {
   causeDetails: {
      id: string;
      title: string;
      description: string;
      targetAmount: number;
      raisedAmount: number;
      imageUrl: string;
      tags: string[];
      createdAt: string;
   };
   monthlyDonations: Array<{
      year: number;
      month: number;
      count: number;
      total: number;
   }>;
   donationTypeBreakdown: Array<{
      _id: string;
      count: number;
      total: number;
   }>;
   fundingProgress: {
      target: number;
      raised: number;
      percentage: number;
   };
}

interface DonorAnalytics {
   donorMetrics: {
      totalDonors: number;
      newDonorsThisMonth: number;
      repeatDonors: number;
      repeatDonorPercentage: number;
      averageDonationPerDonor: number;
   };
   topDonors: Array<{
      donorId: string;
      firstName: string;
      lastName: string;
      email: string;
      totalDonated: number;
      donationCount: number;
      lastDonation: string;
   }>;
}

// API slice
export const analyticsApi = createApi({
   reducerPath: 'analyticsApi',
   baseQuery: fetchBaseQuery({
      baseUrl: process.env.NEXT_PUBLIC_API_URL || '',
      prepareHeaders: (headers, { getState }) => {
         // Get the token from state
         const token = (getState() as any).auth.token;
         // If we have a token, set it in the Authorization header
         if (token) {
            headers.set('authorization', `Bearer ${token}`);
         }
         return headers;
      },
   }),
   tagTypes: ['Analytics'],
   endpoints: (builder) => ({
      // Get organization analytics overview
      getAnalyticsOverview: builder.query<AnalyticsOverviewResponse, void>({
         query: () => '/api/analytics/overview',
         providesTags: ['Analytics']
      }),

      // Get detailed analytics for a specific cause
      getCauseAnalytics: builder.query<CauseAnalyticsResponse, string>({
         query: (causeId) => `/api/analytics/causes/${causeId}`,
         providesTags: (result, error, causeId) => [{ type: 'Analytics', id: `cause-${causeId}` }]
      }),

      // Get donor analytics
      getDonorAnalytics: builder.query<DonorAnalyticsResponse, void>({
         query: () => '/api/analytics/donors',
         providesTags: ['Analytics']
      }),
   }),
});

// Export hooks
export const {
   useGetAnalyticsOverviewQuery,
   useGetCauseAnalyticsQuery,
   useGetDonorAnalyticsQuery,
} = analyticsApi; 