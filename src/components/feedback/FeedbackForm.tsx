"use client";

import React, { useState } from "react";
import {
   Box,
   Button,
   Card,
   CardContent,
   CardHeader,
   Checkbox,
   CircularProgress,
   Divider,
   FormControlLabel,
   Rating,
   Stack,
   TextField,
   Typography,
   Alert,
} from "@mui/material";
import { useCreateFeedbackMutation } from "@/store/api/feedbackApi";

interface FeedbackFormProps {
   organizationId: string;
   campaignId?: string;
   causeId?: string;
   onSuccess?: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
   organizationId,
   campaignId,
   causeId,
   onSuccess,
}) => {
   // Form state
   const [rating, setRating] = useState<number | null>(0);
   const [comment, setComment] = useState("");
   const [isPublic, setIsPublic] = useState(true);
   const [formErrors, setFormErrors] = useState<{
      rating?: string;
      comment?: string;
   }>({});

   // API mutation
   const [createFeedback, { isLoading, error }] = useCreateFeedbackMutation();

   // Handle form submission
   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate form
      const errors: { rating?: string; comment?: string } = {};
      if (!rating) errors.rating = "Please select a rating";
      if (!comment.trim()) errors.comment = "Please enter a comment";
      else if (comment.length < 10)
         errors.comment = "Comment must be at least 10 characters";
      else if (comment.length > 500)
         errors.comment = "Comment cannot exceed 500 characters";

      setFormErrors(errors);
      if (Object.keys(errors).length > 0) return;

      try {
         await createFeedback({
            organization: organizationId,
            campaign: campaignId,
            cause: causeId,
            rating: rating || 0,
            comment,
            isPublic,
         }).unwrap();

         // Reset form
         setRating(0);
         setComment("");
         setIsPublic(true);

         // Call onSuccess callback
         if (onSuccess) onSuccess();
      } catch (err) {
         console.error("Failed to submit feedback:", err);
      }
   };

   return (
      <Card elevation={2}>
         <CardHeader
            title="Leave Your Feedback"
            subheader="Share your experience with this organization"
         />
         <Divider />
         <CardContent>
            <Box component="form" onSubmit={handleSubmit}>
               <Stack spacing={3}>
                  {/* Display error if any */}
                  {error && (
                     <Alert severity="error">
                        Failed to submit feedback. Please try again.
                     </Alert>
                  )}

                  {/* Rating */}
                  <Box>
                     <Typography component="legend" gutterBottom>
                        Your Rating
                     </Typography>
                     <Rating
                        name="rating"
                        value={rating}
                        onChange={(_, newValue) => {
                           setRating(newValue);
                           if (formErrors.rating) {
                              setFormErrors((prev) => ({ ...prev, rating: undefined }));
                           }
                        }}
                        size="large"
                        precision={1}
                     />
                     {formErrors.rating && (
                        <Typography color="error" variant="caption" display="block">
                           {formErrors.rating}
                        </Typography>
                     )}
                  </Box>

                  {/* Comment */}
                  <TextField
                     label="Your Comment"
                     multiline
                     rows={4}
                     value={comment}
                     onChange={(e) => {
                        setComment(e.target.value);
                        if (formErrors.comment) {
                           setFormErrors((prev) => ({ ...prev, comment: undefined }));
                        }
                     }}
                     fullWidth
                     error={!!formErrors.comment}
                     helperText={
                        formErrors.comment ||
                        `${comment.length}/500 characters (min 10 characters)`
                     }
                  />

                  {/* Public/Private toggle */}
                  <FormControlLabel
                     control={
                        <Checkbox
                           checked={isPublic}
                           onChange={(e) => setIsPublic(e.target.checked)}
                           color="primary"
                        />
                     }
                     label="Make this feedback public"
                  />

                  {/* Submit button */}
                  <Button
                     type="submit"
                     variant="contained"
                     color="primary"
                     disabled={isLoading}
                     startIcon={isLoading ? <CircularProgress size={20} /> : null}
                  >
                     {isLoading ? "Submitting..." : "Submit Feedback"}
                  </Button>
               </Stack>
            </Box>
         </CardContent>
      </Card>
   );
};

export default FeedbackForm; 