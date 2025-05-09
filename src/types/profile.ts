export interface DonorProfile {
   userId: string;
   firstName: string;
   lastName: string;
   phoneNumber?: string;
   address?: string;
   city?: string;
   state?: string;
   country?: string;
   bio?: string;
   createdAt?: string;
   updatedAt?: string;
}

export interface OrganizationProfile {
   userId: string;
   name: string;
   description: string;
   phoneNumber: string;
   email: string;
   website?: string;
   address?: string;
   city?: string;
   state?: string;
   country?: string;
   verified: boolean;
   createdAt?: string;
   updatedAt?: string;
} 