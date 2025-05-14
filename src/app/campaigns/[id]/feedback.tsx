"use client";

import React from "react";
import { Grid, Paper, Typography, Box } from "@mui/material";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import FeedbackList from "@/components/feedback/FeedbackList";
import FeedbackStats from "@/components/feedback/FeedbackStats";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface CampaignFeedbackProps {
   campaignId: string;
   organizationId: string;
}

const CampaignFeedback: React.FC<CampaignFeedbackProps> = ({
   campaignId,
   organizationId,
}) => {
   const { user } = useSelector((state: RootState) => state.auth);

   // Check if user is allowed to leave feedback
   // Only donors can leave feedback, and they can't leave feedback for their own organization
   const canLeaveFeedback =
      user &&
      user.role === "donor" &&
      organizationId &&
      organizationId !== user.id;

   return (
      <Box sx={{ mt: 4 }}>
         <Typography variant="h5" gutterBottom>
            Feedback & Reviews
         </Typography>

         {/* Feedback Statistics */}
         <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
               Feedback Overview
            </Typography>
            <FeedbackStats campaignId={campaignId} />
         </Paper>

         <Grid container spacing={4}>
            {/* Leave Feedback Form (for donors only) */}
            {canLeaveFeedback && (
               <Grid item xs={12} md={4}>
                  <FeedbackForm
                     organizationId={organizationId}
                     campaignId={campaignId}
                     onSuccess={() => {
                        // Refresh feedback list after submission
                        window.location.reload();
                     }}
                  />
               </Grid>
            )}

            {/* Feedback List */}
            <Grid item xs={12} md={canLeaveFeedback ? 8 : 12}>
               <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                     User Feedback
                  </Typography>
                  <FeedbackList campaignId={campaignId} />
               </Paper>
            </Grid>
         </Grid>
      </Box>
   );
};

export default CampaignFeedback; 