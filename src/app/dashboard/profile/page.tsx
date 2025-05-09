"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { RootState } from "@/store";
import {
   useGetDonorProfileQuery,
   useGetOrganizationProfileQuery,
   useUpdateDonorProfileMutation,
   useUpdateOrganizationProfileMutation,
} from "@/store/api/profileApi";
import { DonorProfile, OrganizationProfile } from "@/types";

export default function ProfilePage() {
   const router = useRouter();
   const { user } = useSelector((state: RootState) => state.auth);
   const [isEditing, setIsEditing] = useState(false);

   // Donor profile state and API hooks
   const {
      data: donorData,
      isLoading: isDonorLoading,
      error: donorError,
   } = useGetDonorProfileQuery(undefined, {
      skip: user?.role !== "donor",
   });

   const {
      data: orgData,
      isLoading: isOrgLoading,
      error: orgError,
   } = useGetOrganizationProfileQuery(undefined, {
      skip: user?.role !== "organization",
   });

   const [updateDonorProfile] = useUpdateDonorProfileMutation();
   const [updateOrganizationProfile] = useUpdateOrganizationProfileMutation();

   // Separate state for donor and organization profiles
   const [donorFormData, setDonorFormData] = useState<Partial<DonorProfile>>({});
   const [orgFormData, setOrgFormData] = useState<Partial<OrganizationProfile>>({});

   useEffect(() => {
      if (user?.role === "donor" && donorData?.profile) {
         setDonorFormData(donorData.profile);
      } else if (user?.role === "organization" && orgData?.profile) {
         setOrgFormData(orgData.profile);
      }
   }, [user?.role, donorData, orgData]);

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      if (user?.role === "donor") {
         setDonorFormData((prev) => ({ ...prev, [name]: value }));
      } else {
         setOrgFormData((prev) => ({ ...prev, [name]: value }));
      }
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
         if (user?.role === "donor") {
            await updateDonorProfile(donorFormData).unwrap();
         } else if (user?.role === "organization") {
            await updateOrganizationProfile(orgFormData).unwrap();
         }
         toast.success("Profile updated successfully");
         setIsEditing(false);
      } catch (error) {
         toast.error("Failed to update profile");
         console.error("Profile update error:", error);
      }
   };

   if (isDonorLoading || isOrgLoading) {
      return (
         <div className="flex items-center justify-center min-h-screen">
            <div className="text-teal-600">Loading...</div>
         </div>
      );
   }

   if (donorError || orgError) {
      return (
         <div className="flex items-center justify-center min-h-screen">
            <div className="text-red-600">Error loading profile</div>
         </div>
      );
   }

   const formData = user?.role === "donor" ? donorFormData : orgFormData;

   return (
      <div className="max-w-4xl mx-auto p-6">
         <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
               <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
               <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
               >
                  {isEditing ? "Cancel" : "Edit Profile"}
               </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
               {user?.role === "donor" ? (
                  // Donor Profile Form
                  <>
                     <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                           <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                              First Name
                           </label>
                           <input
                              type="text"
                              name="firstName"
                              id="firstName"
                              value={(formData as Partial<DonorProfile>).firstName || ""}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              required
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                           />
                        </div>
                        <div>
                           <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                              Last Name
                           </label>
                           <input
                              type="text"
                              name="lastName"
                              id="lastName"
                              value={(formData as Partial<DonorProfile>).lastName || ""}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              required
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                           />
                        </div>
                     </div>
                     <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                           Phone Number
                        </label>
                        <input
                           type="tel"
                           name="phoneNumber"
                           id="phoneNumber"
                           value={formData.phoneNumber || ""}
                           onChange={handleInputChange}
                           disabled={!isEditing}
                           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        />
                     </div>
                     <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                           Bio
                        </label>
                        <textarea
                           name="bio"
                           id="bio"
                           rows={4}
                           value={(formData as Partial<DonorProfile>).bio || ""}
                           onChange={handleInputChange}
                           disabled={!isEditing}
                           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        />
                     </div>
                  </>
               ) : (
                  // Organization Profile Form
                  <>
                     <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                           Organization Name
                        </label>
                        <input
                           type="text"
                           name="name"
                           id="name"
                           value={(formData as Partial<OrganizationProfile>).name || ""}
                           onChange={handleInputChange}
                           disabled={!isEditing}
                           required
                           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        />
                     </div>
                     <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                           Description
                        </label>
                        <textarea
                           name="description"
                           id="description"
                           rows={4}
                           value={(formData as Partial<OrganizationProfile>).description || ""}
                           onChange={handleInputChange}
                           disabled={!isEditing}
                           required
                           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        />
                     </div>
                     <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                           <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                              Email
                           </label>
                           <input
                              type="email"
                              name="email"
                              id="email"
                              value={(formData as Partial<OrganizationProfile>).email || ""}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              required
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                           />
                        </div>
                        <div>
                           <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                              Phone Number
                           </label>
                           <input
                              type="tel"
                              name="phoneNumber"
                              id="phoneNumber"
                              value={formData.phoneNumber || ""}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                              required
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                           />
                        </div>
                     </div>
                     <div>
                        <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                           Website
                        </label>
                        <input
                           type="url"
                           name="website"
                           id="website"
                           value={(formData as Partial<OrganizationProfile>).website || ""}
                           onChange={handleInputChange}
                           disabled={!isEditing}
                           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        />
                     </div>
                  </>
               )}

               {/* Common Address Fields */}
               <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                     <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        Address
                     </label>
                     <input
                        type="text"
                        name="address"
                        id="address"
                        value={formData.address || ""}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                     />
                  </div>
                  <div>
                     <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        City
                     </label>
                     <input
                        type="text"
                        name="city"
                        id="city"
                        value={formData.city || ""}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                     />
                  </div>
               </div>
               <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                     <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                        State
                     </label>
                     <input
                        type="text"
                        name="state"
                        id="state"
                        value={formData.state || ""}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                     />
                  </div>
                  <div>
                     <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                        Country
                     </label>
                     <input
                        type="text"
                        name="country"
                        id="country"
                        value={formData.country || ""}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                     />
                  </div>
               </div>

               {isEditing && (
                  <div className="flex justify-end">
                     <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                     >
                        Save Changes
                     </button>
                  </div>
               )}
            </form>
         </div>
      </div>
   );
} 