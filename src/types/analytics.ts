// Analytics Types

// Chart.js callback function types
export interface ChartTooltipContext {
	chart: unknown;
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
	chart: unknown;
	scale: unknown;
	index: number;
	tick: {
		value: number;
		label: string;
	};
}

export interface ChartCallbackFunction {
	(value: number | string, index?: number, ticks?: unknown[]): string;
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

// Additional analytics types
export interface Trend {
	month: string;
	amount: number;
	count: number;
}

export interface DonationType {
	type: string;
	amount: number;
	count: number;
}

export interface Campaign {
	title: string;
	targetAmount: number;
	raisedAmount: number;
	status?: string;
}

export interface Cause {
	name: string;
	count: number;
	amount: number;
}

export interface Donor {
	email: string;
	count: number;
	amount: number;
}

export interface Activity {
	id: string;
	campaignName: string;
	timestamp: string;
	amount?: number;
	type?: string;
	donorName?: string;
	donorEmail?: string;
	donationType?: string;
	status?: string;
	rating?: number;
	comment?: string;
	targetAmount?: number;
	raisedAmount?: number;
}

export interface AnalyticsData {
	stats: {
		donations: {
			totalAmount: number;
			totalDonations: number;
			averageDonation: number;
		};
		campaigns: {
			activeCampaigns: number;
			totalCampaigns: number;
		};
	};
	charts: {
		monthlyTrends: Trend[];
		donationsByType: DonationType[];
		campaignPerformance?: Campaign[];
		topCauses?: Cause[];
		topDonors?: Donor[];
	};
	recentActivities: {
		donations: Activity[];
		campaigns?: Activity[];
		feedback?: Activity[];
	};
}

export interface ProcessedDonationData {
	type: string;
	amount: number;
	count: number;
}

export interface StatsCard {
	title: string;
	value: number;
	prefix?: string;
	subtitle?: string;
	icon: React.ReactNode;
	color: string;
}

// Specific chart data types for each chart component
export interface LineChartData {
	labels: string[];
	datasets: {
		label: string;
		data: number[];
		borderColor?: string;
		backgroundColor?: string;
		fill?: boolean;
		tension?: number;
		pointHoverRadius?: number;
	}[];
}

export interface DoughnutChartData {
	labels: string[];
	datasets: {
		data: number[];
		backgroundColor: string[];
		borderColor?: string[];
		borderWidth?: number;
		hoverBorderWidth?: number;
		hoverOffset?: number;
		hoverBackgroundColor?: string[];
	}[];
}

export interface BarChartData {
	labels: string[];
	datasets: {
		label: string;
		data: number[];
		backgroundColor?: string | string[];
		borderColor?: string | string[];
		borderWidth?: number;
		borderRadius?: number;
		borderSkipped?: boolean;
	}[];
}
