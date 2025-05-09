"use client";

import { useState } from "react";
import { FaPlus, FaClock, FaCheckCircle, FaHeart } from "react-icons/fa";
import Link from "next/link";

interface Campaign {
   id: number;
   title: string;
   description: string;
   goal: number;
   raised: number;
   daysLeft?: number;
   completedDate?: string;
   donors: number;
}

interface CampaignCardProps {
   campaign: Campaign;
   isActive?: boolean;
}

export default function CampaignsPage() {
   const [activeTab, setActiveTab] = useState("active");

   // Mock data - replace with actual API calls
   const activeCampaigns: Campaign[] = [
      {
         id: 1,
         title: "Clean Water Initiative",
         description: "Providing clean water to rural communities",
         goal: 50000,
         raised: 25000,
         daysLeft: 15,
         donors: 156,
      },
      {
         id: 2,
         title: "Education for All",
         description: "Supporting education in underprivileged areas",
         goal: 30000,
         raised: 28000,
         daysLeft: 5,
         donors: 234,
      },
   ];

   const pastCampaigns: Campaign[] = [
      {
         id: 3,
         title: "Food Security Program",
         description: "Ensuring food security for vulnerable families",
         goal: 25000,
         raised: 25000,
         completedDate: "2024-02-15",
         donors: 189,
      },
   ];

   const CampaignCard = ({ campaign, isActive = true }: CampaignCardProps) => (
      <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
         <div className="flex justify-between items-start mb-4">
            <div>
               <h3 className="text-lg font-semibold text-gray-900">{campaign.title}</h3>
               <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
            </div>
            {isActive ? (
               <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Active
               </span>
            ) : (
               <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Completed
               </span>
            )}
         </div>

         <div className="space-y-3">
            <div>
               <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{Math.round((campaign.raised / campaign.goal) * 100)}%</span>
               </div>
               <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                     className="bg-teal-600 h-2 rounded-full"
                     style={{
                        width: `${Math.min(
                           100,
                           Math.round((campaign.raised / campaign.goal) * 100)
                        )}%`,
                     }}
                  ></div>
               </div>
            </div>

            <div className="flex justify-between text-sm">
               <span className="text-gray-600">
                  Raised: <span className="font-semibold text-gray-900">${campaign.raised.toLocaleString()}</span>
               </span>
               <span className="text-gray-600">
                  Goal: <span className="font-semibold text-gray-900">${campaign.goal.toLocaleString()}</span>
               </span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
               <div className="flex items-center text-sm text-gray-600">
                  <FaHeart className="h-4 w-4 text-teal-600 mr-2" />
                  {campaign.donors} donors
               </div>
               {isActive ? (
                  <div className="flex items-center text-sm text-gray-600">
                     <FaClock className="h-4 w-4 text-teal-600 mr-2" />
                     {campaign.daysLeft} days left
                  </div>
               ) : (
                  <div className="flex items-center text-sm text-gray-600">
                     <FaCheckCircle className="h-4 w-4 text-teal-600 mr-2" />
                     Completed {new Date(campaign.completedDate!).toLocaleDateString()}
                  </div>
               )}
            </div>
         </div>
      </div>
   );

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <div>
               <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
               <p className="text-gray-600">Manage your fundraising campaigns</p>
            </div>
            <Link
               href="/dashboard/campaigns/new"
               className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
               <FaPlus className="mr-2" />
               New Campaign
            </Link>
         </div>

         <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
               <button
                  onClick={() => setActiveTab("active")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "active"
                     ? "border-teal-600 text-teal-600"
                     : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                     }`}
               >
                  Active Campaigns
               </button>
               <button
                  onClick={() => setActiveTab("past")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "past"
                     ? "border-teal-600 text-teal-600"
                     : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                     }`}
               >
                  Past Campaigns
               </button>
            </nav>
         </div>

         <div className="grid gap-6 md:grid-cols-2">
            {activeTab === "active"
               ? activeCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
               ))
               : pastCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} isActive={false} />
               ))}
         </div>
      </div>
   );
} 