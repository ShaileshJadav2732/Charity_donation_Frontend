"use client";

import { useState } from "react";
import Link from "next/link";
import { useGetCampaignsQuery } from "@/store/api/campaignApi";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function CampaignsPage() {
   const [page, setPage] = useState(1);
   const [search, setSearch] = useState("");
   const [status, setStatus] = useState("all");
   const [tag, setTag] = useState("");

   const { data, isLoading, error } = useGetCampaignsQuery({
      page,
      limit: 10,
      search,
      status,
      tag,
   });

   // Protect route for organizations only
   useRouteGuard("organization");

   if (error) {
      return (
         <div className="container mx-auto px-4 py-8">
            <div className="text-center text-red-500">
               Error loading campaigns. Please try again later.
            </div>
         </div>
      );
   }

   return (
      <div className="container mx-auto px-4 py-8">
         <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Campaigns</h1>
            <Link href="/dashboard/campaigns/create">
               <Button>Create Campaign</Button>
            </Link>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Input
               placeholder="Search campaigns..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={status} onValueChange={setStatus}>
               <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
               </SelectContent>
            </Select>
            <Input
               placeholder="Filter by tag..."
               value={tag}
               onChange={(e) => setTag(e.target.value)}
            />
         </div>

         {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-3">
                     <Skeleton className="h-48 w-full" />
                     <Skeleton className="h-4 w-3/4" />
                     <Skeleton className="h-4 w-1/2" />
                  </div>
               ))}
            </div>
         ) : (
            <>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data?.campaigns.map((campaign) => (
                     <Link
                        key={campaign.id}
                        href={`/dashboard/campaigns/${campaign.id}`}
                        className="block"
                     >
                        <div className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                           <div className="aspect-video relative">
                              <img
                                 src={campaign.imageUrl}
                                 alt={campaign.title}
                                 className="object-cover w-full h-full"
                              />
                              <div className="absolute top-2 right-2">
                                 <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${campaign.status === "active"
                                          ? "bg-green-100 text-green-800"
                                          : campaign.status === "completed"
                                             ? "bg-blue-100 text-blue-800"
                                             : campaign.status === "cancelled"
                                                ? "bg-red-100 text-red-800"
                                                : "bg-gray-100 text-gray-800"
                                       }`}
                                 >
                                    {campaign.status}
                                 </span>
                              </div>
                           </div>
                           <div className="p-4">
                              <h3 className="font-semibold mb-2">{campaign.title}</h3>
                              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                 {campaign.description}
                              </p>
                              <div className="flex justify-between items-center text-sm">
                                 <span>
                                    ${campaign.totalRaisedAmount} / ${campaign.totalTargetAmount}
                                 </span>
                                 <span>{campaign.totalSupporters} supporters</span>
                              </div>
                           </div>
                        </div>
                     </Link>
                  ))}
               </div>

               {data && data.total > 0 && (
                  <div className="flex justify-center mt-8 gap-2">
                     <Button
                        variant="outline"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                     >
                        Previous
                     </Button>
                     <Button
                        variant="outline"
                        onClick={() => setPage(page + 1)}
                        disabled={page * 10 >= data.total}
                     >
                        Next
                     </Button>
                  </div>
               )}

               {data?.campaigns.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                     No campaigns found
                  </div>
               )}
            </>
         )}
      </div>
   );
} 