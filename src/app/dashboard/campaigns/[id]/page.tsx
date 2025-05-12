"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
   useGetCampaignByIdQuery,
   useUpdateCampaignMutation,
   useDeleteCampaignMutation,
   useAddCauseToCampaignMutation,
   useRemoveCauseFromCampaignMutation,
   useAddOrganizationToCampaignMutation,
   useRemoveOrganizationFromCampaignMutation,
} from "@/store/api/campaignApi";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog";

export default function CampaignPage({ params }: { params: { id: string } }) {
   const router = useRouter();
   const [isEditing, setIsEditing] = useState(false);
   const [newCauseId, setNewCauseId] = useState("");
   const [newOrganizationId, setNewOrganizationId] = useState("");

   const { data: campaignData, isLoading, error } = useGetCampaignByIdQuery(params.id);
   const [updateCampaign] = useUpdateCampaignMutation();
   const [deleteCampaign] = useDeleteCampaignMutation();
   const [addCause] = useAddCauseToCampaignMutation();
   const [removeCause] = useRemoveCauseFromCampaignMutation();
   const [addOrganization] = useAddOrganizationToCampaignMutation();
   const [removeOrganization] = useRemoveOrganizationFromCampaignMutation();

   // Protect route for organizations only
   useRouteGuard("organization");

   if (isLoading) {
      return (
         <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-4">
               <div className="h-8 bg-gray-200 rounded w-1/4"></div>
               <div className="h-64 bg-gray-200 rounded"></div>
               <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
         </div>
      );
   }

   if (error || !campaignData) {
      return (
         <div className="container mx-auto px-4 py-8">
            <div className="text-center text-red-500">
               Error loading campaign. Please try again later.
            </div>
         </div>
      );
   }

   const { campaign } = campaignData;

   const handleUpdateCampaign = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);

      try {
         const updatedData = {
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            startDate: formData.get("startDate") as string,
            endDate: formData.get("endDate") as string,
            totalTargetAmount: Number(formData.get("totalTargetAmount")),
            imageUrl: formData.get("imageUrl") as string,
            status: formData.get("status") as string,
         };

         await updateCampaign({ id: params.id, ...updatedData }).unwrap();
         toast.success("Campaign updated successfully");
         setIsEditing(false);
      } catch (error) {
         toast.error("Failed to update campaign");
         console.error("Update campaign error:", error);
      }
   };

   const handleDeleteCampaign = async () => {
      if (window.confirm("Are you sure you want to delete this campaign?")) {
         try {
            await deleteCampaign(params.id).unwrap();
            toast.success("Campaign deleted successfully");
            router.push("/dashboard/campaigns");
         } catch (error) {
            toast.error("Failed to delete campaign");
            console.error("Delete campaign error:", error);
         }
      }
   };

   const handleAddCause = async () => {
      if (!newCauseId) return;

      try {
         await addCause({ id: params.id, causeId: newCauseId }).unwrap();
         toast.success("Cause added successfully");
         setNewCauseId("");
      } catch (error) {
         toast.error("Failed to add cause");
         console.error("Add cause error:", error);
      }
   };

   const handleRemoveCause = async (causeId: string) => {
      try {
         await removeCause({ id: params.id, causeId }).unwrap();
         toast.success("Cause removed successfully");
      } catch (error) {
         toast.error("Failed to remove cause");
         console.error("Remove cause error:", error);
      }
   };

   const handleAddOrganization = async () => {
      if (!newOrganizationId) return;

      try {
         await addOrganization({ id: params.id, organizationId: newOrganizationId }).unwrap();
         toast.success("Organization added successfully");
         setNewOrganizationId("");
      } catch (error) {
         toast.error("Failed to add organization");
         console.error("Add organization error:", error);
      }
   };

   const handleRemoveOrganization = async (organizationId: string) => {
      try {
         await removeOrganization({ id: params.id, organizationId }).unwrap();
         toast.success("Organization removed successfully");
      } catch (error) {
         toast.error("Failed to remove organization");
         console.error("Remove organization error:", error);
      }
   };

   return (
      <div className="container mx-auto px-4 py-8">
         <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">{campaign.title}</h1>
            <div className="flex gap-2">
               <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
               >
                  {isEditing ? "Cancel Edit" : "Edit Campaign"}
               </Button>
               <Button
                  variant="destructive"
                  onClick={handleDeleteCampaign}
               >
                  Delete Campaign
               </Button>
            </div>
         </div>

         {isEditing ? (
            <form onSubmit={handleUpdateCampaign} className="max-w-2xl space-y-6">
               <div className="space-y-2">
                  <Label htmlFor="title">Campaign Title</Label>
                  <Input
                     id="title"
                     name="title"
                     defaultValue={campaign.title}
                     required
                  />
               </div>

               <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                     id="description"
                     name="description"
                     defaultValue={campaign.description}
                     required
                     rows={4}
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label htmlFor="startDate">Start Date</Label>
                     <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        defaultValue={campaign.startDate}
                        required
                     />
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="endDate">End Date</Label>
                     <Input
                        id="endDate"
                        name="endDate"
                        type="date"
                        defaultValue={campaign.endDate}
                        required
                     />
                  </div>
               </div>

               <div className="space-y-2">
                  <Label htmlFor="totalTargetAmount">Target Amount</Label>
                  <Input
                     id="totalTargetAmount"
                     name="totalTargetAmount"
                     type="number"
                     defaultValue={campaign.totalTargetAmount}
                     required
                     min="0"
                     step="0.01"
                  />
               </div>

               <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                     id="imageUrl"
                     name="imageUrl"
                     type="url"
                     defaultValue={campaign.imageUrl}
                     required
                  />
               </div>

               <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                     id="status"
                     name="status"
                     defaultValue={campaign.status}
                     className="w-full rounded-md border border-input bg-background px-3 py-2"
                     required
                  >
                     <option value="draft">Draft</option>
                     <option value="active">Active</option>
                     <option value="completed">Completed</option>
                     <option value="cancelled">Cancelled</option>
                  </select>
               </div>

               <Button type="submit">Save Changes</Button>
            </form>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-6">
                  <div className="aspect-video relative rounded-lg overflow-hidden">
                     <img
                        src={campaign.imageUrl}
                        alt={campaign.title}
                        className="object-cover w-full h-full"
                     />
                  </div>

                  <div>
                     <h2 className="text-xl font-semibold mb-2">Description</h2>
                     <p className="text-muted-foreground">{campaign.description}</p>
                  </div>

                  <div>
                     <h2 className="text-xl font-semibold mb-2">Campaign Details</h2>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <p className="text-sm text-muted-foreground">Status</p>
                           <p className="font-medium">{campaign.status}</p>
                        </div>
                        <div>
                           <p className="text-sm text-muted-foreground">Start Date</p>
                           <p className="font-medium">
                              {new Date(campaign.startDate).toLocaleDateString()}
                           </p>
                        </div>
                        <div>
                           <p className="text-sm text-muted-foreground">End Date</p>
                           <p className="font-medium">
                              {new Date(campaign.endDate).toLocaleDateString()}
                           </p>
                        </div>
                        <div>
                           <p className="text-sm text-muted-foreground">Target Amount</p>
                           <p className="font-medium">${campaign.totalTargetAmount}</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <div>
                     <h2 className="text-xl font-semibold mb-4">Causes</h2>
                     <div className="space-y-4">
                        {campaign.causes.map((cause: any) => (
                           <div
                              key={cause._id}
                              className="flex justify-between items-center p-4 bg-card rounded-lg"
                           >
                              <div>
                                 <h3 className="font-medium">{cause.title}</h3>
                                 <p className="text-sm text-muted-foreground">
                                    ${cause.raisedAmount} / ${cause.targetAmount}
                                 </p>
                              </div>
                              <Button
                                 variant="destructive"
                                 size="sm"
                                 onClick={() => handleRemoveCause(cause._id)}
                              >
                                 Remove
                              </Button>
                           </div>
                        ))}

                        <Dialog>
                           <DialogTrigger asChild>
                              <Button variant="outline" className="w-full">
                                 Add Cause
                              </Button>
                           </DialogTrigger>
                           <DialogContent>
                              <DialogHeader>
                                 <DialogTitle>Add Cause to Campaign</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                 <div className="space-y-2">
                                    <Label htmlFor="causeId">Cause ID</Label>
                                    <Input
                                       id="causeId"
                                       value={newCauseId}
                                       onChange={(e) => setNewCauseId(e.target.value)}
                                       placeholder="Enter cause ID"
                                    />
                                 </div>
                                 <Button onClick={handleAddCause}>Add Cause</Button>
                              </div>
                           </DialogContent>
                        </Dialog>
                     </div>
                  </div>

                  <div>
                     <h2 className="text-xl font-semibold mb-4">Organizations</h2>
                     <div className="space-y-4">
                        {campaign.organizations.map((org: any) => (
                           <div
                              key={org._id}
                              className="flex justify-between items-center p-4 bg-card rounded-lg"
                           >
                              <div>
                                 <h3 className="font-medium">{org.name}</h3>
                              </div>
                              <Button
                                 variant="destructive"
                                 size="sm"
                                 onClick={() => handleRemoveOrganization(org._id)}
                              >
                                 Remove
                              </Button>
                           </div>
                        ))}

                        <Dialog>
                           <DialogTrigger asChild>
                              <Button variant="outline" className="w-full">
                                 Add Organization
                              </Button>
                           </DialogTrigger>
                           <DialogContent>
                              <DialogHeader>
                                 <DialogTitle>Add Organization to Campaign</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                 <div className="space-y-2">
                                    <Label htmlFor="organizationId">Organization ID</Label>
                                    <Input
                                       id="organizationId"
                                       value={newOrganizationId}
                                       onChange={(e) => setNewOrganizationId(e.target.value)}
                                       placeholder="Enter organization ID"
                                    />
                                 </div>
                                 <Button onClick={handleAddOrganization}>
                                    Add Organization
                                 </Button>
                              </div>
                           </DialogContent>
                        </Dialog>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
} 