// Analytics Types

// Monthly donation trend data point
export interface MonthlyDonationTrend {
   year: number;
   month: number;
   count: number;
   total: number;
}

// Donation type distribution data point
export interface DonationTypeDistribution {
   _id: string;
   count: number;
   total: number;
}

// Top cause data
export interface TopCause {
   _id: string;
   title: string;
   targetAmount: number;
   raisedAmount: number;
}

// Donor retention metrics
export interface DonorRetention {
   thisYearDonorCount: number;
   lastYearDonorCount: number;
   retainedDonorCount: number;
   retentionRate: number;
   newDonorCount: number;
}

// Average donation trend data point
export interface AverageDonationTrend {
   year: number;
   month: number;
   avgAmount: number;
}

// Year comparison data
export interface YearComparison {
   currentYear: number;
   previousYear: number;
   yoyGrowth: number;
}

// Feedback sentiment data
export interface FeedbackSentiment {
   totalFeedback: number;
   averageRating: number;
   sentiment: {
      positive: number;
      neutral: number;
      negative: number;
   };
}

// Organization analytics overview
export interface AnalyticsOverview {
   monthlyDonationTrends: MonthlyDonationTrend[];
   donationTypeDistribution: DonationTypeDistribution[];
   topCauses: TopCause[];
   donorRetention: DonorRetention;
   avgDonationTrend: AverageDonationTrend[];
   yearComparison: YearComparison;
   feedbackSentiment: FeedbackSentiment;
}

// Cause details
export interface CauseDetails {
   id: string;
   title: string;
   description: string;
   targetAmount: number;
   raisedAmount: number;
   imageUrl: string;
   tags: string[];
   createdAt: string;
}

// Funding progress
export interface FundingProgress {
   target: number;
   raised: number;
   percentage: number;
}

// Cause analytics
export interface CauseAnalytics {
   causeDetails: CauseDetails;
   monthlyDonations: MonthlyDonationTrend[];
   donationTypeBreakdown: DonationTypeDistribution[];
   fundingProgress: FundingProgress;
}

// Donor metrics
export interface DonorMetrics {
   totalDonors: number;
   newDonorsThisMonth: number;
   repeatDonors: number;
   repeatDonorPercentage: number;
   averageDonationPerDonor: number;
}

// Top donor data
export interface TopDonor {
   donorId: string;
   firstName: string;
   lastName: string;
   email: string;
   totalDonated: number;
   donationCount: number;
   lastDonation: string;
}

// Donor analytics
export interface DonorAnalytics {
   donorMetrics: DonorMetrics;
   topDonors: TopDonor[];
}

// API Response types
export interface AnalyticsOverviewResponse {
   success: boolean;
   data: AnalyticsOverview;
}

export interface CauseAnalyticsResponse {
   success: boolean;
   data: CauseAnalytics;
}

export interface DonorAnalyticsResponse {
   success: boolean;
   data: DonorAnalytics;
} 