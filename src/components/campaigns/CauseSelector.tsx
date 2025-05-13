import React, { useState, useEffect } from 'react';
import { useGetCausesQuery } from '@/store/api/causesApi';
import { Cause } from '@/types/cause';
import Image from 'next/image';
import { Input } from '@/components/common/Input';
import { Spinner } from '@/components/common/Spinner';
import { Badge } from '@/components/common/Badge';
import { ProgressBar } from '@/components/common/ProgressBar';

interface CauseSelectorProps {
   selectedCauses: string[];
   onCauseSelect: (causeId: string) => void;
   organizationId?: string;
}

export const CauseSelector: React.FC<CauseSelectorProps> = ({
   selectedCauses,
   onCauseSelect,
   organizationId,
}) => {
   const [searchTerm, setSearchTerm] = useState('');
   const [selectedTag, setSelectedTag] = useState<string | null>(null);
   const [filteredCauses, setFilteredCauses] = useState<Cause[]>([]);

   // Fetch causes data with RTK Query
   const { data: causesData, isLoading, error } = useGetCausesQuery({
      organizationId: organizationId || '',
      search: '',
      tags: selectedTag ? [selectedTag] : [],
   });

   // Update filtered causes when data, search term or selected tag changes
   useEffect(() => {
      if (causesData?.causes) {
         const filtered = causesData.causes.filter((cause) => {
            const matchesSearch = cause.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               cause.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesTag = !selectedTag || (cause.tags && cause.tags.includes(selectedTag));
            return matchesSearch && matchesTag;
         });
         setFilteredCauses(filtered);
      }
   }, [causesData, searchTerm, selectedTag]);

   // Extract all unique tags from causes
   const allTags = causesData?.causes
      ? Array.from(new Set(causesData.causes.flatMap((cause) => cause.tags || [])))
      : [];

   const handleTagClick = (tag: string) => {
      setSelectedTag(selectedTag === tag ? null : tag);
   };

   if (isLoading) {
      return <Spinner />;
   }

   if (error) {
      return <div className="p-4 text-red-600">Error loading causes: {JSON.stringify(error)}</div>;
   }

   return (
      <div className="w-full">
         <div className="mb-4">
            <Input
               type="text"
               placeholder="Search causes..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               fullWidth
            />
         </div>

         {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
               {allTags.map((tag) => (
                  <Badge
                     key={tag}
                     label={tag}
                     onClick={() => handleTagClick(tag)}
                     active={selectedTag === tag}
                  />
               ))}
            </div>
         )}

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCauses.length > 0 ? (
               filteredCauses.map((cause) => (
                  <div
                     key={cause.id}
                     className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${selectedCauses.includes(cause.id)
                           ? 'border-blue-500 bg-blue-50'
                           : 'border-gray-200 hover:border-gray-300'
                        }`}
                     onClick={() => onCauseSelect(cause.id)}
                  >
                     {cause.imageUrl && (
                        <div className="relative h-40 w-full">
                           <Image
                              src={cause.imageUrl}
                              alt={cause.title}
                              fill
                              className="object-cover"
                           />
                        </div>
                     )}
                     <div className="p-4">
                        <h3 className="font-semibold text-lg mb-1">{cause.title}</h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{cause.description}</p>

                        <div className="mb-2">
                           <div className="flex justify-between text-sm mb-1">
                              <span>Progress:</span>
                              <span className="font-medium">
                                 {((cause.raisedAmount / cause.targetAmount) * 100).toFixed(0)}%
                              </span>
                           </div>
                           <ProgressBar
                              value={cause.raisedAmount}
                              max={cause.targetAmount}
                              className="h-2"
                           />
                        </div>

                        <div className="flex justify-between text-sm">
                           <span className="text-gray-600">
                              Target: ${cause.targetAmount.toLocaleString()}
                           </span>
                           <span className="text-blue-600 font-medium">
                              Raised: ${cause.raisedAmount.toLocaleString()}
                           </span>
                        </div>
                     </div>
                  </div>
               ))
            ) : (
               <div className="col-span-full text-center py-8 text-gray-500">
                  No causes found matching your criteria
               </div>
            )}
         </div>
      </div>
   );
}; 