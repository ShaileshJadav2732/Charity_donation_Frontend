"use client";

import { useGetCauseAnalyticsQuery } from "@/store/api/analyticsApi";
import {
   ArrowBack as ArrowBackIcon
} from "@mui/icons-material";
import {
   Box,
   Button,
   CircularProgress,
   Container,
   Grid,
   Paper,
   Typography,
   useTheme
} from "@mui/material";
import { useRouter } from "next/navigation";
import React from "react";

// Chart components
import {
   Bar,
   BarChart,
   CartesianGrid,
   Cell,
   Legend,
   Pie,
   PieChart,
   ResponsiveContainer,
   Tooltip,
   XAxis,
   YAxis
} from 'recharts';

// Utility function to format currency
const formatCurrency = (amount: number) => {
   return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
   }).format(amount);
};

// Utility function to format month name
const getMonthName = (month: number) => {
   const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
   ];
   return monthNames[month - 1];
};

export default function CauseAnalyticsPage({
   params,
}: {
   params: Promise<{ id: string }>;
}) {
   const { id } = React.use(params);
   const router = useRouter();
   const theme = useTheme();
   const { data, isLoading, error } = useGetCauseAnalyticsQuery(id);

   const handleBack = () => {
      router.push("/dashboard/analytics");
   };

   // Colors for charts
   const COLORS = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      theme.palette.info.main,
   ];

   if (isLoading) {
      return (
         <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
            <CircularProgress />
         </Box>
      );
   }

   if (error) {
      return (
         <Box p={4}>
            <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
               Back to Analytics
            </Button>
            <Typography variant="h5" color="error" gutterBottom>
               Error loading cause analytics
            </Typography>
            <Typography>
               This cause may not exist or you may not have permission to view its analytics.
            </Typography>
         </Box>
      );
   }

   if (!data) {
      return (
         <Box p={4}>
            <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
               Back to Analytics
            </Button>
            <Typography variant="h5" gutterBottom>
               No analytics data available
            </Typography>
            <Typography>
               Start collecting donations for this cause to see analytics.
            </Typography>
         </Box>
      );
   }

   const causeData = data.data;
   const causeDetails = causeData.causeDetails;

   // Prepare data for charts
   const monthlyDonationData = causeData.monthlyDonations.map(item => ({
      name: `${getMonthName(item.month)} ${item.year}`,
      Donations: item.total,
   }));

   const donationTypeData = causeData.donationTypeBreakdown.map(item => ({
      name: item._id,
      value: item.total,
      count: item.count
   }));

   return (
      <Container maxWidth="xl">
         <Box mb={4}>
            <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mb: 2 }}>
               Back to Analytics
            </Button>
            <Typography variant="h4" gutterBottom>
               {causeDetails.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
               Detailed analytics for this cause
            </Typography>
         </Box>

         {/* Funding Progress Card */}
         <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4 }}>
            <Grid container spacing={3}>
               <Grid item xs={12} md={8}>
                  <Typography variant="h6" gutterBottom>
                     Funding Progress
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                     <Box
                        sx={{
                           height: 16,
                           bgcolor: 'grey.200',
                           borderRadius: 8,
                           mb: 1,
                           position: 'relative',
                           overflow: 'hidden',
                        }}
                     >
                        <Box
                           sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              bottom: 0,
                              width: `${Math.min(100, causeData.fundingProgress.percentage)}%`,
                              bgcolor: theme.palette.primary.main,
                              borderRadius: 8,
                           }}
                        />
                     </Box>
                     <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                           {Math.round(causeData.fundingProgress.percentage)}% Complete
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                           Target: {formatCurrency(causeData.fundingProgress.target)}
                        </Typography>
                     </Box>
                  </Box>
                  <Typography variant="body1">
                     <strong>{formatCurrency(causeData.fundingProgress.raised)}</strong> raised of {formatCurrency(causeData.fundingProgress.target)} goal
                  </Typography>
               </Grid>
               <Grid item xs={12} md={4}>
                  <Box display="flex" alignItems="center" height="100%">
                     <Box sx={{ border: 1, borderColor: 'divider', height: '70%', mx: 2 }} />
                     <Box>
                        <Typography variant="h6" gutterBottom>
                           Created On
                        </Typography>
                        <Typography variant="body1">
                           {new Date(causeDetails.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                           })}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                           {causeDetails.tags.map((tag, index) => (
                              <Box
                                 key={index}
                                 component="span"
                                 sx={{
                                    bgcolor: 'action.hover',
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: 10,
                                    mr: 1,
                                    mb: 1,
                                    display: 'inline-block',
                                    fontSize: '0.75rem',
                                 }}
                              >
                                 {tag}
                              </Box>
                           ))}
                        </Box>
                     </Box>
                  </Box>
               </Grid>
            </Grid>
         </Paper>

         {/* Monthly Donation Trend Chart */}
         <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
               Monthly Donation Trends
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
               Track donation amounts for this cause over the past 6 months
            </Typography>
            <Box sx={{ height: 300 }}>
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                     data={monthlyDonationData}
                     margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="name" />
                     <YAxis />
                     <Tooltip formatter={(value) => formatCurrency(value as number)} />
                     <Legend />
                     <Bar dataKey="Donations" fill={theme.palette.primary.main} />
                  </BarChart>
               </ResponsiveContainer>
            </Box>
         </Paper>

         {/* Donation Type Breakdown */}
         <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
               Donation Type Breakdown
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
               Distribution of donation types for this cause
            </Typography>
            <Grid container spacing={3}>
               <Grid item xs={12} md={6}>
                  <Box sx={{ height: 300 }}>
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie
                              data={donationTypeData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                           >
                              {donationTypeData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                           </Pie>
                           <Tooltip formatter={(value) => formatCurrency(value as number)} />
                           <Legend />
                        </PieChart>
                     </ResponsiveContainer>
                  </Box>
               </Grid>
               <Grid item xs={12} md={6}>
                  <Box>
                     <Typography variant="subtitle2" gutterBottom>
                        Donation Type Breakdown
                     </Typography>
                     <Box>
                        {donationTypeData.map((item, index) => (
                           <Box key={index} sx={{ mb: 2 }}>
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                 <Box display="flex" alignItems="center">
                                    <Box
                                       sx={{
                                          width: 12,
                                          height: 12,
                                          borderRadius: '50%',
                                          bgcolor: COLORS[index % COLORS.length],
                                          mr: 1,
                                       }}
                                    />
                                    <Typography variant="body2">{item.name}</Typography>
                                 </Box>
                                 <Typography variant="body2" fontWeight="bold">
                                    {formatCurrency(item.value)}
                                 </Typography>
                              </Box>
                              <Box sx={{ ml: 3, mt: 0.5 }}>
                                 <Typography variant="caption" color="text.secondary">
                                    {item.count} {item.count === 1 ? 'donation' : 'donations'}
                                 </Typography>
                              </Box>
                           </Box>
                        ))}
                     </Box>
                  </Box>
               </Grid>
            </Grid>
         </Paper>

         {/* Cause Description */}
         <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
               About This Cause
            </Typography>
            <Typography variant="body1" paragraph>
               {causeDetails.description}
            </Typography>
         </Paper>
      </Container>
   );
} 