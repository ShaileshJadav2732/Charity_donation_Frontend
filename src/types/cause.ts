export enum CauseCategory {
   EDUCATION = "EDUCATION",
   HEALTH = "HEALTH",
   ENVIRONMENT = "ENVIRONMENT",
   POVERTY = "POVERTY",
   DISASTER_RELIEF = "DISASTER_RELIEF",
   ANIMAL_WELFARE = "ANIMAL_WELFARE",
   HUMAN_RIGHTS = "HUMAN_RIGHTS",
   OTHER = "OTHER"
}

export enum CampaignStatus {
   DRAFT = "DRAFT",
   ACTIVE = "ACTIVE",
   PAUSED = "PAUSED",
   COMPLETED = "COMPLETED",
   CANCELLED = "CANCELLED"
}

export interface Cause {
   id: string;
   name: string;
   description: string;
   category: CauseCategory;
   image?: string;
   organization: {
      id: string;
      name: string;
   };
   createdAt: string;
   updatedAt: string;
}

export interface Campaign {
   id: string;
   title: string;
   description: string;
   cause: Cause;
   organization: {
      id: string;
      name: string;
   };
   status: CampaignStatus;
   startDate: string;
   endDate?: string;
   targetAmount?: number;
   currentAmount: number;
   targetQuantity?: number;
   currentQuantity: number;
   donationType: "MONEY" | "IN_KIND";
   image?: string;
   location?: string;
   requirements?: string[];
   impact?: string;
   updates?: CampaignUpdate[];
   createdAt: string;
   updatedAt: string;
}

export interface CampaignUpdate {
   id: string;
   campaign: string;
   title: string;
   content: string;
   image?: string;
   createdAt: string;
}

export interface CreateCauseData {
   name: string;
   description: string;
   category: CauseCategory;
   image?: File;
}

export interface CreateCampaignData {
   title: string;
   description: string;
   cause: string;
   status: CampaignStatus;
   startDate: string;
   endDate?: string;
   targetAmount?: number;
   targetQuantity?: number;
   donationType: "MONEY" | "IN_KIND";
   image?: File;
   location?: string;
   requirements?: string[];
   impact?: string;
}

export interface UpdateCampaignData extends Partial<CreateCampaignData> {
   id: string;
}

export interface CreateCampaignUpdateData {
   campaign: string;
   title: string;
   content: string;
   image?: File;
}

export interface CausesResponse {
   success: boolean;
   data: {
      causes: Cause[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
   };
   message: string;
}

export interface CampaignsResponse {
   success: boolean;
   data: {
      campaigns: Campaign[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
   };
   message: string;
}

export interface CampaignResponse {
   success: boolean;
   data: Campaign;
   message: string;
}

export interface CauseResponse {
   success: boolean;
   data: Cause;
   message: string;
} 