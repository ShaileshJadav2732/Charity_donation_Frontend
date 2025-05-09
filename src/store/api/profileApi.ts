import { apiSlice } from './apiSlice';
import { DonorProfile, OrganizationProfile, DonorProfileFormData, OrganizationProfileFormData } from '@/types';

// Define profile API endpoints
export const profileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Complete donor profile
    completeDonorProfile: builder.mutation<
      { message: string; profile: DonorProfile },
      DonorProfileFormData
    >({
      query: (profileData) => ({
        url: '/profile/donor',
        method: 'POST',
        body: profileData,
      }),
      invalidatesTags: ['DonorProfile', 'User'],
    }),

    // Get donor profile
    getDonorProfile: builder.query<{ profile: DonorProfile }, void>({
      query: () => '/profile/donor',
      providesTags: ['DonorProfile'],
    }),

    // Complete organization profile
    completeOrganizationProfile: builder.mutation<
      { message: string; profile: OrganizationProfile },
      OrganizationProfileFormData
    >({
      query: (profileData) => ({
        url: '/profile/organization',
        method: 'POST',
        body: profileData,
      }),
      invalidatesTags: ['OrganizationProfile', 'User'],
    }),

    // Get organization profile
    getOrganizationProfile: builder.query<{ profile: OrganizationProfile }, void>({
      query: () => '/profile/organization',
      providesTags: ['OrganizationProfile'],
    }),
  }),
});

export const {
  useCompleteDonorProfileMutation,
  useGetDonorProfileQuery,
  useCompleteOrganizationProfileMutation,
  useGetOrganizationProfileQuery,
} = profileApi;
