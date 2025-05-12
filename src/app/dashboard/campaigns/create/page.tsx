"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateCampaignMutation } from "@/store/api/campaignApi";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function CreateCampaignPage() {
   const router = useRouter();
   const [createCampaign, { isLoading }] = useCreateCampaignMutation();
   const [tags, setTags] = useState<string[]>([]);
   const [tagInput, setTagInput] = useState("");

   // Protect route for organizations only
   useRouteGuard("organization");

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);

      try {
         const campaignData = {
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            startDate: formData.get("startDate") as string,
            endDate: formData.get("endDate") as string,
            totalTargetAmount: Number(formData.get("totalTargetAmount")),
            imageUrl: formData.get("imageUrl") as string,
            tags,
         };

         await createCampaign(campaignData).unwrap();
         toast.success("Campaign created successfully");
         router.push("/dashboard/campaigns");
      } catch (error) {
         toast.error("Failed to create campaign");
         console.error("Create campaign error:", error);
      }
   };

   const handleAddTag = () => {
      if (tagInput.trim() && !tags.includes(tagInput.trim())) {
         setTags([...tags, tagInput.trim()]);
         setTagInput("");
      }
   };

   const handleRemoveTag = (tagToRemove: string) => {
      setTags(tags.filter((tag) => tag !== tagToRemove));
   };

   return (
      <div className="container mx-auto px-4 py-8">
         <h1 className="text-2xl font-bold mb-6">Create New Campaign</h1>
         <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
            <div className="space-y-2">
               <Label htmlFor="title">Campaign Title</Label>
               <Input
                  id="title"
                  name="title"
                  required
                  placeholder="Enter campaign title"
               />
            </div>

            <div className="space-y-2">
               <Label htmlFor="description">Description</Label>
               <Textarea
                  id="description"
                  name="description"
                  required
                  placeholder="Enter campaign description"
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
                     required
                  />
               </div>

               <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                     id="endDate"
                     name="endDate"
                     type="date"
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
                  required
                  min="0"
                  step="0.01"
                  placeholder="Enter target amount"
               />
            </div>

            <div className="space-y-2">
               <Label htmlFor="imageUrl">Image URL</Label>
               <Input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  required
                  placeholder="Enter image URL"
               />
            </div>

            <div className="space-y-2">
               <Label>Tags</Label>
               <div className="flex gap-2">
                  <Input
                     value={tagInput}
                     onChange={(e) => setTagInput(e.target.value)}
                     placeholder="Add a tag"
                     onKeyPress={(e) => {
                        if (e.key === "Enter") {
                           e.preventDefault();
                           handleAddTag();
                        }
                     }}
                  />
                  <Button type="button" onClick={handleAddTag}>
                     Add
                  </Button>
               </div>
               <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                     <span
                        key={tag}
                        className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-2"
                     >
                        {tag}
                        <button
                           type="button"
                           onClick={() => handleRemoveTag(tag)}
                           className="text-primary hover:text-primary/80"
                        >
                           ×
                        </button>
                     </span>
                  ))}
               </div>
            </div>

            <div className="flex gap-4">
               <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Campaign"}
               </Button>
               <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
               >
                  Cancel
               </Button>
            </div>
         </form>
      </div>
   );
} 