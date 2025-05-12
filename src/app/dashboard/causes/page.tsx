"use client";

import { useState } from "react";
import { FaSearch, FaGlobe, FaHeart, FaHandHoldingHeart, FaBookOpen, FaTree, FaHandsHelping } from "react-icons/fa";
import Link from "next/link";
import { useGetCausesQuery } from "@/store/api/causesApi";
import { useRouteGuard } from "@/hooks/useRouteGuard";

export default function CausesPage() {
   const [searchTerm, setSearchTerm] = useState("");
   const [selectedCategory, setSelectedCategory] = useState("all");
   const [page, setPage] = useState(1);
   const limit = 9; // 3x3 grid

   // Protect route for donors only
   const { isAuthorized } = useRouteGuard({
      allowedRoles: ["donor"],
      redirectTo: "/dashboard",
   });

   // Fetch causes with filters
   const { data, isLoading, error } = useGetCausesQuery({
      page,
      limit,
      category: selectedCategory === "all" ? undefined : selectedCategory,
      search: searchTerm || undefined,
   });

   const categories = [
      { id: "all", name: "All Causes", icon: FaGlobe },
      { id: "education", name: "Education", icon: FaBookOpen },
      { id: "environment", name: "Environment", icon: FaTree },
      { id: "humanitarian", name: "Humanitarian", icon: FaHandsHelping },
   ];

   // If not authorized, don't render anything
   if (!isAuthorized) {
      return null;
   }

   // Show loading state
   if (isLoading) {
      return (
         <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
         </div>
      );
   }

   // Show error state
   if (error) {
      return (
         <div className="text-center py-12">
            <p className="text-red-600">Failed to load causes. Please try again later.</p>
         </div>
      );
   }

   const CauseCard = ({ cause }: { cause: any }) => (
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
         <div className="h-48 bg-gray-200">
            {cause.imageUrl ? (
               <img
                  src={cause.imageUrl}
                  alt={cause.title}
                  className="w-full h-full object-cover"
               />
            ) : (
               <div className="w-full h-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                  <FaHandHoldingHeart className="h-16 w-16 text-white opacity-50" />
               </div>
            )}
         </div>
         <div className="p-6">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <h3 className="text-lg font-semibold text-gray-900">{cause.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{cause.description}</p>
               </div>
            </div>

            <div className="space-y-4">
               <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                     <span>Progress</span>
                     <span>{Math.round((cause.raisedAmount / cause.targetAmount) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                     <div
                        className="bg-teal-600 h-2 rounded-full"
                        style={{
                           width: `${Math.min(
                              100,
                              Math.round((cause.raisedAmount / cause.targetAmount) * 100)
                           )}%`,
                        }}
                     ></div>
                  </div>
               </div>

               <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                     Raised: <span className="font-semibold text-gray-900">${cause.raisedAmount.toLocaleString()}</span>
                  </span>
                  <span className="text-gray-600">
                     Goal: <span className="font-semibold text-gray-900">${cause.targetAmount.toLocaleString()}</span>
                  </span>
               </div>

               <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center text-sm text-gray-600">
                     <FaHeart className="h-4 w-4 text-teal-600 mr-2" />
                     {cause.supporters} supporters
                  </div>
                  <Link
                     href={`/dashboard/causes/${cause.id}/donate`}
                     className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
                  >
                     Donate Now
                  </Link>
               </div>
            </div>
         </div>
      </div>
   );

   return (
      <div className="space-y-6">
         <div>
            <h1 className="text-2xl font-bold text-gray-900">Causes</h1>
            <p className="text-gray-600">Support causes that matter to you</p>
         </div>

         {/* Categories */}
         <div className="flex flex-wrap gap-4">
            {categories.map(({ id, name, icon: Icon }) => (
               <button
                  key={id}
                  onClick={() => {
                     setSelectedCategory(id);
                     setPage(1); // Reset to first page when changing category
                  }}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === id
                     ? "bg-teal-600 text-white"
                     : "bg-white text-gray-600 hover:bg-gray-50"
                     }`}
               >
                  <Icon className="h-4 w-4 mr-2" />
                  {name}
               </button>
            ))}
         </div>

         {/* Search */}
         <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
               type="text"
               placeholder="Search causes..."
               className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
               value={searchTerm}
               onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1); // Reset to first page when searching
               }}
            />
         </div>

         {/* Causes Grid */}
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data?.causes.map((cause) => (
               <CauseCard key={cause.id} cause={cause} />
            ))}
         </div>

         {/* Pagination */}
         {data && data.total > limit && (
            <div className="flex justify-center space-x-2 mt-6">
               <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  Previous
               </button>
               <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * limit >= data.total}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  Next
               </button>
            </div>
         )}
      </div>
   );
} 