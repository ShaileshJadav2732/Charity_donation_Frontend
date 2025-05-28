// Analytics Types

// Chart.js callback function types
export interface ChartTooltipContext {
	chart: any;
	label: string;
	parsed: {
		x: number;
		y: number;
	};
	raw: number;
	dataIndex: number;
	datasetIndex: number;
	dataset: {
		label: string;
		data: number[];
		backgroundColor?: string | string[];
		borderColor?: string | string[];
	};
}

export interface ChartScaleContext {
	chart: any;
	scale: any;
	index: number;
	tick: {
		value: number;
		label: string;
	};
}

export interface ChartCallbackFunction {
	(value: number | string, index?: number, ticks?: any[]): string;
}

export interface ChartLabelCallbackFunction {
	(context: ChartTooltipContext): string;
}

// Enhanced dashboard data interface
export interface DashboardData {
	stats: {
		donations: {
			totalAmount: number;
			totalDonations: number;
			averageDonation: number;
		};
		campaigns: {
			totalCampaigns: number;
			activeCampaigns: number;
		};
		feedback: {
			averageRating: number;
			totalFeedback: number;
		};
	};
	charts: {
		monthlyTrends: MonthlyDonationTrend[];
		donationTypes: DonationTypeDistribution[];
		topCauses: TopCause[];
	};
}

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
