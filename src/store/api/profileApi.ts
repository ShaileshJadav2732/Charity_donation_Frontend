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
      query: () => ({
        url: '/profile/donor',
        method: 'GET',
      }),
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
      query: () => ({
        url: '/profile/organization',
        method: 'GET',
      }),
    }),

    // Update donor profile
    updateDonorProfile: builder.mutation<{ message: string; profile: DonorProfile }, Partial<DonorProfile>>({
      query: (data) => ({
        url: '/profile/donor',
        method: 'POST',
        body: data,
      }),
    }),

    // Update organization profile
    updateOrganizationProfile: builder.mutation<
      { message: string; profile: OrganizationProfile },
      Partial<OrganizationProfile>
    >({
      query: (data) => ({
        url: '/profile/organization',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useCompleteDonorProfileMutation,
  useGetDonorProfileQuery,
  useCompleteOrganizationProfileMutation,
  useGetOrganizationProfileQuery,
  useUpdateDonorProfileMutation,
  useUpdateOrganizationProfileMutation,
} = profileApi;
