"use client";

import { useState } from "react";
import { FaSearch, FaHeart, FaStar, FaChartLine, FaUsers } from "react-icons/fa";

interface Donor {
   id: number;
   name: string;
   email: string;
   totalDonated: number;
   lastDonation: string;
   frequency: string;
   impactScore: number;
   campaigns: number;
}

export default function DonorsPage() {
   const [searchTerm, setSearchTerm] = useState("");

   // Mock data - replace with actual API calls
   const donors: Donor[] = [
      {
         id: 1,
         name: "John Doe",
         email: "john@example.com",
         totalDonated: 2500,
         lastDonation: "2024-03-01",
         frequency: "Monthly",
         impactScore: 85,
         campaigns: 5,
      },
      {
         id: 2,
         name: "Jane Smith",
         email: "jane@example.com",
         totalDonated: 5000,
         lastDonation: "2024-02-28",
         frequency: "Weekly",
         impactScore: 92,
         campaigns: 8,
      },
      {
         id: 3,
         name: "Robert Johnson",
         email: "robert@example.com",
         totalDonated: 1500,
         lastDonation: "2024-02-15",
         frequency: "One-time",
         impactScore: 75,
         campaigns: 3,
      },
   ];

   const filteredDonors = donors.filter((donor) =>
      donor.name.toLowerCase().includes(searchTerm.toLowerCase())
   );

   const DonorCard = ({ donor }: { donor: Donor }) => (
      <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
         <div className="flex justify-between items-start mb-4">
            <div>
               <h3 className="text-lg font-semibold text-gray-900">{donor.name}</h3>
               <p className="text-sm text-gray-600">{donor.email}</p>
            </div>
            <div className="flex items-center">
               <FaStar className="h-5 w-5 text-yellow-400 mr-1" />
               <span className="text-sm font-medium text-gray-900">
                  {donor.impactScore}
               </span>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
               <p className="text-sm text-gray-600">Total Donated</p>
               <p className="text-lg font-semibold text-gray-900">
                  ${donor.totalDonated.toLocaleString()}
               </p>
            </div>
            <div>
               <p className="text-sm text-gray-600">Campaigns Supported</p>
               <p className="text-lg font-semibold text-gray-900">{donor.campaigns}</p>
            </div>
         </div>

         <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center text-sm text-gray-600">
               <FaHeart className="h-4 w-4 text-teal-600 mr-2" />
               {donor.frequency} donor
            </div>
            <div className="text-sm text-gray-600">
               Last donation: {new Date(donor.lastDonation).toLocaleDateString()}
            </div>
         </div>
      </div>
   );

   return (
      <div className="space-y-6">
         <div>
            <h1 className="text-2xl font-bold text-gray-900">Donors</h1>
            <p className="text-gray-600">View and manage your donors</p>
         </div>

         {/* Stats Overview */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-sm font-medium text-gray-600">Total Donors</p>
                     <p className="text-2xl font-bold text-gray-900">{donors.length}</p>
                  </div>
                  <div className="bg-teal-100 p-3 rounded-full">
                     <FaUsers className="h-6 w-6 text-teal-600" />
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-sm font-medium text-gray-600">Total Donations</p>
                     <p className="text-2xl font-bold text-gray-900">
                        ${donors.reduce((sum, donor) => sum + donor.totalDonated, 0).toLocaleString()}
                     </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                     <FaHeart className="h-6 w-6 text-green-600" />
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-sm font-medium text-gray-600">Avg. Impact Score</p>
                     <p className="text-2xl font-bold text-gray-900">
                        {Math.round(
                           donors.reduce((sum, donor) => sum + donor.impactScore, 0) / donors.length
                        )}
                     </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                     <FaChartLine className="h-6 w-6 text-blue-600" />
                  </div>
               </div>
            </div>
         </div>

         {/* Search */}
         <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
               type="text"
               placeholder="Search donors..."
               className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>

         {/* Donor List */}
         <div className="grid gap-6 md:grid-cols-2">
            {filteredDonors.map((donor) => (
               <DonorCard key={donor.id} donor={donor} />
            ))}
         </div>
      </div>
   );
} 