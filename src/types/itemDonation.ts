import { DonationType } from "./donation";

// Item donation analytics types
export interface ItemDonationTypeStats {
  type: string;
  count: number;
  totalQuantity: number;
}

export interface MonthlyTrend {
  year: number;
  month: number;
  count: number;
  totalQuantity: number;
}

export interface TopCause {
  causeId: string;
  causeName: string;
  count: number;
  totalQuantity: number;
  types: DonationType[];
}

export interface ItemDonationAnalytics {
  donationsByType: ItemDonationTypeStats[];
  monthlyTrend: MonthlyTrend[];
  topCauses: TopCause[];
}

// Type-specific analytics
export interface ItemDonationStats {
  totalDonations: number;
  totalQuantity: number;
  avgQuantity: number;
}

export interface RecentDonation {
  id: string;
  description: string;
  quantity: number;
  unit?: string;
  cause?: {
    id: string;
    title: string;
  };
  organization?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface ItemDonationTypeAnalytics {
  type: DonationType;
  stats: ItemDonationStats;
  recentDonations: RecentDonation[];
  monthlyTrend: MonthlyTrend[];
  topCauses: TopCause[];
}
