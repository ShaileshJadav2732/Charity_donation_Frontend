import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "@/store/store";

const baseQuery = fetchBaseQuery({
	baseUrl: process.env.NEXT_PUBLIC_API_URL,
	credentials: "include",
	prepareHeaders: (headers, { getState }) => {
		const token = (getState() as RootState).auth.token;
		if (token) {
			headers.set("authorization", `Bearer ${token}`);
		}
		return headers;
	},
});

interface UploadResponse {
	success: boolean;
	message: string;
	data: {
		url: string;
		publicId: string;
	};
}

interface DeleteImageRequest {
	publicId: string;
}

interface DeleteImageResponse {
	success: boolean;
	message: string;
}

export const uploadApi = createApi({
	reducerPath: "uploadApi",
	baseQuery,
	tagTypes: ["Upload", "OrganizationProfile"],
	endpoints: (builder) => ({
		// Upload cause image
		uploadCauseImage: builder.mutation<UploadResponse, FormData>({
			query: (formData) => ({
				url: "/upload/cause-image",
				method: "POST",
				body: formData,
			}),
		}),

		// Upload campaign image
		uploadCampaignImage: builder.mutation<UploadResponse, FormData>({
			query: (formData) => ({
				url: "/upload/campaign-image",
				method: "POST",
				body: formData,
			}),
		}),

		// Upload organization logo
		uploadOrganizationLogo: builder.mutation<UploadResponse, FormData>({
			query: (formData) => ({
				url: "/upload/organization-logo",
				method: "POST",
				body: formData,
			}),
			invalidatesTags: ["OrganizationProfile"],
		}),

		// Delete image
		deleteImage: builder.mutation<DeleteImageResponse, DeleteImageRequest>({
			query: (data) => ({
				url: "/upload/image",
				method: "DELETE",
				body: data,
			}),
		}),
	}),
});

export const {
	useUploadCauseImageMutation,
	useUploadCampaignImageMutation,
	useUploadOrganizationLogoMutation,
	useDeleteImageMutation,
} = uploadApi;
