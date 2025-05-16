"use client";

import React, { useState } from "react";
import { useGetAnalyticsOverviewQuery } from "@/store/api/analyticsApi";
import {
   Box,
   Container,
   Grid,
   Paper,
   Typography,
   Card,
   CardContent,
   CircularProgress,
   Button,
   Tabs,
   Tab,
   Divider,
   useTheme,
} from "@mui/material";
import {
   TrendingUp as TrendingUpIcon,
   MonetizationOn as MoneyIcon,
   GroupAdd as GroupAddIcon,
   AutoGraph as ChartIcon,
   Category as CategoryIcon,
   Assessment as AssessmentIcon,
   Favorite as HeartIcon,
} from "@mui/icons-material";

// Chart components
import {
   BarChart,
   Bar,
   LineChart,
   Line,
   PieChart,
   Pie,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   Legend,
   ResponsiveContainer,
   Cell
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

export default function AnalyticsDashboard() {
   const theme = useTheme();
   const [activeTab, setActiveTab] = useState("overview");
   const { data, isLoading, error } = useGetAnalyticsOverviewQuery();

   const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
      setActiveTab(newValue);
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

   if (!data?.data) {
      return (
         <Box p={4}>
            <Typography variant="h5" gutterBottom>
               No analytics data available
            </Typography>
            <Typography>
               Start collecting donations to see your analytics here.
            </Typography>
         </Box>
      );
   }

   const analyticsData = data.data;

   // Prepare data for charts
   const monthlyDonationData = analyticsData.monthlyDonationTrends.map(item => ({
      name: `${getMonthName(item.month)} ${item.year}`,
      Donations: item.total,
   }));

   const donationTypeData = analyticsData.donationTypeDistribution.map(item => ({
      name: item._id,
      value: item.total,
      count: item.count
   }));

   return (
      <Container maxWidth="xl">
         <Box mb={4}>
            <Typography variant="h4" gutterBottom>
               Analytics Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
               Track your organization's performance and donation trends
            </Typography>
         </Box>

         <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="analytics tabs">
               <Tab label="Overview" value="overview" icon={<AssessmentIcon />} iconPosition="start" />
               <Tab label="Donations" value="donations" icon={<MoneyIcon />} iconPosition="start" />
               <Tab label="Donors" value="donors" icon={<GroupAddIcon />} iconPosition="start" />
               <Tab label="Causes" value="causes" icon={<HeartIcon />} iconPosition="start" />
            </Tabs>
         </Box>

         {activeTab === "overview" && (
            <>
               {/* Top Stats Cards */}
               <Grid container spacing={3} mb={4}>
                  <Grid item xs={12} sm={6} md={3}>
                     <Card>
                        <CardContent>
                           <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                              <Typography variant="subtitle2" color="text.secondary">
                                 Total Donations (Year)
                              </Typography>
                              <MoneyIcon color="primary" />
                           </Box>
                           <Typography variant="h4" fontWeight="bold">
                              {formatCurrency(analyticsData.yearComparison.currentYear)}
                           </Typography>
                           <Box display="flex" alignItems="center" mt={1}>
                              <TrendingUpIcon
                                 color={analyticsData.yearComparison.yoyGrowth >= 0 ? "success" : "error"}
                                 fontSize="small"
                                 sx={{ mr: 0.5 }}
                              />
                              <Typography
                                 variant="body2"
                                 color={analyticsData.yearComparison.yoyGrowth >= 0 ? "success.main" : "error.main"}
                              >
                                 {analyticsData.yearComparison.yoyGrowth.toFixed(1)}% vs last year
                              </Typography>
                           </Box>
                        </CardContent>
                     </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                     <Card>
                        <CardContent>
                           <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                              <Typography variant="subtitle2" color="text.secondary">
                                 Total Donors
                              </Typography>
                              <GroupAddIcon color="secondary" />
                           </Box>
                           <Typography variant="h4" fontWeight="bold">
                              {analyticsData.donorRetention.thisYearDonorCount}
                           </Typography>
                           <Box display="flex" alignItems="center" mt={1}>
                              <Typography variant="body2" color="text.secondary">
                                 {analyticsData.donorRetention.newDonorCount} new this year
                              </Typography>
                           </Box>
                        </CardContent>
                     </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                     <Card>
                        <CardContent>
                           <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                              <Typography variant="subtitle2" color="text.secondary">
                                 Donor Retention
                              </Typography>
                              <HeartIcon color="error" />
                           </Box>
                           <Typography variant="h4" fontWeight="bold">
                              {analyticsData.donorRetention.retentionRate}%
                           </Typography>
                           <Box display="flex" alignItems="center" mt={1}>
                              <Typography variant="body2" color="text.secondary">
                                 {analyticsData.donorRetention.retainedDonorCount} returning donors
                              </Typography>
                           </Box>
                        </CardContent>
                     </Card>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                     <Card>
                        <CardContent>
                           <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                              <Typography variant="subtitle2" color="text.secondary">
                                 Feedback Score
                              </Typography>
                              <ChartIcon color="info" />
                           </Box>
                           <Typography variant="h4" fontWeight="bold">
                              {analyticsData.feedbackSentiment.averageRating.toFixed(1)}/5
                           </Typography>
                           <Box display="flex" alignItems="center" mt={1}>
                              <Typography variant="body2" color="text.secondary">
                                 From {analyticsData.feedbackSentiment.totalFeedback} reviews
                              </Typography>
                           </Box>
                        </CardContent>
                     </Card>
                  </Grid>
               </Grid>

               {/* Monthly Donation Trend Chart */}
               <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                     Monthly Donation Trends
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                     Track your donation amounts over the past 12 months
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

               {/* Donation Types and Top Causes */}
               <Grid container spacing={3} mb={4}>
                  <Grid item xs={12} md={6}>
                     <Paper elevation={0} variant="outlined" sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                           Donation Type Distribution
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                           Breakdown of donations by type
                        </Typography>
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
                     </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                     <Paper elevation={0} variant="outlined" sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                           Top Performing Causes
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                           Your most successful fundraising causes
                        </Typography>
                        {analyticsData.topCauses.length > 0 ? (
                           <Box>
                              {analyticsData.topCauses.map((cause, index) => (
                                 <Box key={cause._id} mb={2}>
                                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                                       <Typography variant="body2">{cause.title}</Typography>
                                       <Typography variant="body2" fontWeight="bold">
                                          {formatCurrency(cause.raisedAmount)}
                                       </Typography>
                                    </Box>
                                    <Box display="flex" alignItems="center">
                                       <Box
                                          sx={{
                                             flexGrow: 1,
                                             bgcolor: 'grey.200',
                                             borderRadius: 5,
                                             mr: 1,
                                             height: 8,
                                             position: 'relative',
                                             overflow: 'hidden',
                                          }}
                                       >
                                          <Box
                                             sx={{
                                                position: 'absolute',
                                                left: 0,
                                                top: 0,
                                                bottom: 0,
                                                bgcolor: COLORS[index % COLORS.length],
                                                width: `${Math.min(100, (cause.raisedAmount / cause.targetAmount) * 100)}%`,
                                                borderRadius: 5,
                                             }}
                                          />
                                       </Box>
                                       <Typography variant="caption" color="text.secondary">
                                          {Math.min(100, Math.round((cause.raisedAmount / cause.targetAmount) * 100))}%
                                       </Typography>
                                    </Box>
                                 </Box>
                              ))}
                           </Box>
                        ) : (
                           <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                              <Typography variant="body2" color="text.secondary">
                                 No causes data available
                              </Typography>
                           </Box>
                        )}
                     </Paper>
                  </Grid>
               </Grid>
            </>
         )}

         {/* Additional tabs can be implemented here */}
         {activeTab === "donations" && (
            <Box p={4} textAlign="center">
               <Typography variant="h6">Donation Analytics</Typography>
               <Typography variant="body2" color="text.secondary">
                  Detailed donation analytics will be available here in the next update.
               </Typography>
            </Box>
         )}

         {activeTab === "donors" && (
            <Box p={4} textAlign="center">
               <Typography variant="h6">Donor Analytics</Typography>
               <Typography variant="body2" color="text.secondary">
                  Detailed donor analytics will be available here in the next update.
               </Typography>
            </Box>
         )}

         {activeTab === "causes" && (
            <Box p={4} textAlign="center">
               <Typography variant="h6">Cause Analytics</Typography>
               <Typography variant="body2" color="text.secondary">
                  Detailed cause analytics will be available here in the next update.
               </Typography>
            </Box>
         )}
      </Container>
   );
} 