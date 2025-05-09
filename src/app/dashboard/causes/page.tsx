"use client";

import { useState } from "react";
import { FaSearch, FaGlobe, FaHeart, FaHandHoldingHeart, FaBookOpen, FaTree, FaHandsHelping } from "react-icons/fa";
import Link from "next/link";

interface Cause {
   id: number;
   title: string;
   description: string;
   category: string;
   targetAmount: number;
   raisedAmount: number;
   supporters: number;
   imageUrl: string;
}

export default function CausesPage() {
   const [searchTerm, setSearchTerm] = useState("");
   const [selectedCategory, setSelectedCategory] = useState("all");

   const categories = [
      { id: "all", name: "All Causes", icon: FaGlobe },
      { id: "education", name: "Education", icon: FaBookOpen },
      { id: "environment", name: "Environment", icon: FaTree },
      { id: "humanitarian", name: "Humanitarian", icon: FaHandsHelping },
   ];

   // Mock data - replace with actual API calls
   const causes: Cause[] = [
      {
         id: 1,
         title: "Education for Rural Children",
         description: "Support education initiatives in rural communities to provide quality learning resources and opportunities.",
         category: "education",
         targetAmount: 50000,
         raisedAmount: 35000,
         supporters: 245,
         imageUrl: "/images/education.jpg",
      },
      {
         id: 2,
         title: "Ocean Cleanup Initiative",
         description: "Help remove plastic waste from our oceans and protect marine life for future generations.",
         category: "environment",
         targetAmount: 75000,
         raisedAmount: 45000,
         supporters: 320,
         imageUrl: "/images/ocean.jpg",
      },
      {
         id: 3,
         title: "Emergency Relief Fund",
         description: "Provide immediate assistance to communities affected by natural disasters and humanitarian crises.",
         category: "humanitarian",
         targetAmount: 100000,
         raisedAmount: 82000,
         supporters: 560,
         imageUrl: "/images/relief.jpg",
      },
   ];

   const filteredCauses = causes.filter((cause) => {
      const matchesSearch = cause.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || cause.category === selectedCategory;
      return matchesSearch && matchesCategory;
   });

   const CauseCard = ({ cause }: { cause: Cause }) => (
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
         <div className="h-48 bg-gray-200">
            {/* Replace with actual image */}
            <div className="w-full h-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
               <FaHandHoldingHeart className="h-16 w-16 text-white opacity-50" />
            </div>
         </div>
         <div className="p-6">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <h3 className="text-lg font-semibold text-gray-900">{cause.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{cause.description}</p>
               </div>
            </div>

            <div className="space-y-3">
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
                  onClick={() => setSelectedCategory(id)}
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
               onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>

         {/* Causes Grid */}
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCauses.map((cause) => (
               <CauseCard key={cause.id} cause={cause} />
            ))}
         </div>
      </div>
   );
} 