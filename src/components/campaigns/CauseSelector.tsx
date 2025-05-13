"use client";

import { useState } from "react";
import { FaPlus, FaSearch, FaTimes } from "react-icons/fa";
import { Cause } from "@/types/campaings";

interface CauseSelectorProps {
   causes: Cause[];
   selectedCauses: string[];
   onCausesChange: (causes: string[]) => void;
   onCreateCause?: () => void;
   isLoading?: boolean;
   error?: any;
}

export default function CauseSelector({
   causes,
   selectedCauses,
   onCausesChange,
   onCreateCause,
   isLoading,
   error
}: CauseSelectorProps) {
   const [searchTerm, setSearchTerm] = useState("");
   const [showSelectedOnly, setShowSelectedOnly] = useState(false);

   const filteredCauses = causes.filter(cause => {
      const matchesSearch = cause.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
         cause.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
         cause.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      if (showSelectedOnly) {
         return matchesSearch && selectedCauses.includes(cause._id);
      }
      return matchesSearch;
   });

   const handleCauseToggle = (causeId: string) => {
      if (selectedCauses.includes(causeId)) {
         onCausesChange(selectedCauses.filter(id => id !== causeId));
      } else {
         onCausesChange([...selectedCauses, causeId]);
      }
   };

   const getProgressPercentage = (raised: number, target: number) => {
      return Math.min((raised / target) * 100, 100);
   };

   if (isLoading) {
      return (
         <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="space-y-3">
               {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
               ))}
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Error loading causes. Please try again.</p>
         </div>
      );
   }

   return (
      <div className="space-y-4">
         <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
               </div>
               <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search causes by title, description, or tags..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
               />
            </div>
            <div className="flex items-center gap-4">
               <label className="flex items-center space-x-2">
                  <input
                     type="checkbox"
                     checked={showSelectedOnly}
                     onChange={(e) => setShowSelectedOnly(e.target.checked)}
                     className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Show selected only</span>
               </label>
               {onCreateCause && (
                  <button
                     type="button"
                     onClick={onCreateCause}
                     className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                     <FaPlus className="h-4 w-4 mr-2" />
                     Create Cause
                  </button>
               )}
            </div>
         </div>

         <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
            {filteredCauses.length === 0 ? (
               <div className="p-4 text-center text-gray-500">
                  {searchTerm ? "No causes found matching your search." : "No causes available."}
               </div>
            ) : (
               filteredCauses.map((cause) => (
                  <div
                     key={cause._id}
                     className={`p-4 hover:bg-gray-50 transition-colors ${selectedCauses.includes(cause._id) ? "bg-teal-50" : ""
                        }`}
                  >
                     <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                           <input
                              type="checkbox"
                              checked={selectedCauses.includes(cause._id)}
                              onChange={() => handleCauseToggle(cause._id)}
                              className="h-5 w-5 text-teal-600 focus:ring-teal-500 border-gray-300 rounded mt-1"
                           />
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center justify-between">
                              <h3 className="text-lg font-medium text-gray-900">{cause.title}</h3>
                              <span className="text-sm text-gray-500">
                                 ${cause.raisedAmount.toLocaleString()} / ${cause.targetAmount.toLocaleString()}
                              </span>
                           </div>
                           <p className="mt-1 text-sm text-gray-600 line-clamp-2">{cause.description}</p>
                           <div className="mt-2">
                              <div className="relative pt-1">
                                 <div className="flex mb-2 items-center justify-between">
                                    <div>
                                       <span className="text-xs font-semibold inline-block text-teal-600">
                                          Progress
                                       </span>
                                    </div>
                                    <div className="text-right">
                                       <span className="text-xs font-semibold inline-block text-teal-600">
                                          {getProgressPercentage(cause.raisedAmount, cause.targetAmount).toFixed(1)}%
                                       </span>
                                    </div>
                                 </div>
                                 <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-teal-200">
                                    <div
                                       style={{ width: `${getProgressPercentage(cause.raisedAmount, cause.targetAmount)}%` }}
                                       className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-teal-500"
                                    ></div>
                                 </div>
                              </div>
                           </div>
                           <div className="mt-2 flex flex-wrap gap-2">
                              {cause.tags.map((tag) => (
                                 <span
                                    key={tag}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                 >
                                    {tag}
                                 </span>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               ))
            )}
         </div>

         {selectedCauses.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
               <p className="text-yellow-700">Please select at least one cause for your campaign.</p>
            </div>
         )}
      </div>
   );
} 