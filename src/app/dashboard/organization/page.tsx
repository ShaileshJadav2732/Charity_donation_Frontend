"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Users, DollarSign, Package } from "lucide-react";
import { useGetOrganizationProfileQuery } from "@/store/api/profileApi";
import { useGetOrganizationCausesQuery } from "@/store/api/causeApi";
import { useGetOrganizationCampaignsQuery } from "@/store/api/campaignApi";
import { useGetOrganizationDonationsQuery } from "@/store/api/donationApi";
import { DonationType } from "@/types/donation";
import { formatCurrency } from "@/lib/utils";

export default function OrganizationDashboard() {
	const router = useRouter();
	const { user, loading } = useAuth();
	const [activeTab, setActiveTab] = useState("overview");

	// Redirect if not an organization
	useEffect(() => {
		if (!loading && (!user || user.role !== "organization")) {
			router.push("/");
		}
	}, [user, loading, router]);

	// Fetch organization data
	const { data: profile } = useGetOrganizationProfileQuery();
	const { data: causes } = useGetOrganizationCausesQuery();
	const { data: campaigns } = useGetOrganizationCampaignsQuery();
	const { data: donations } = useGetOrganizationDonationsQuery();

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (!user || user.role !== "organization") {
		return null;
	}

	// Calculate statistics
	const totalCauses = causes?.length || 0;
	const totalCampaigns = campaigns?.length || 0;
	const totalDonations = donations?.length || 0;
	const totalRaised =
		donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
	const activeCampaigns =
		campaigns?.filter((c) => c.status === "active").length || 0;
	const recentDonations = donations?.slice(0, 5) || [];

	return (
		<div className="container mx-auto py-8">
			<div className="flex justify-between items-center mb-8">
				<div>
					<h1 className="text-3xl font-bold">Organization Dashboard</h1>
					<p className="text-muted-foreground">
						Welcome back, {profile?.name || "Organization"}
					</p>
				</div>
				<div className="flex gap-4">
					<Button onClick={() => router.push("/dashboard/causes/create")}>
						Create Cause
					</Button>
					<Button onClick={() => router.push("/dashboard/campaigns/create")}>
						Create Campaign
					</Button>
				</div>
			</div>

			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="space-y-4"
			>
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="causes">Causes</TabsTrigger>
					<TabsTrigger value="campaigns">Campaigns</TabsTrigger>
					<TabsTrigger value="donations">Donations</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-4">
					{/* Statistics Cards */}
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Total Causes
								</CardTitle>
								<Heart className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{totalCauses}</div>
								<p className="text-xs text-muted-foreground">
									Active causes in your organization
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Active Campaigns
								</CardTitle>
								<Users className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{activeCampaigns}</div>
								<p className="text-xs text-muted-foreground">
									Out of {totalCampaigns} total campaigns
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Total Raised
								</CardTitle>
								<DollarSign className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{formatCurrency(totalRaised)}
								</div>
								<p className="text-xs text-muted-foreground">
									From {totalDonations} donations
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Donation Types
								</CardTitle>
								<Package className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									{Object.values(DonationType).map((type) => {
										const count =
											donations?.filter((d) => d.type === type).length || 0;
										return (
											<div key={type} className="flex justify-between text-sm">
												<span className="capitalize">{type.toLowerCase()}</span>
												<span className="font-medium">{count}</span>
											</div>
										);
									})}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Recent Activity */}
					<Card>
						<CardHeader>
							<CardTitle>Recent Donations</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{recentDonations.map((donation) => (
									<div
										key={donation.id}
										className="flex items-center justify-between p-4 border rounded-lg"
									>
										<div className="flex items-center space-x-4">
											<div className="p-2 bg-primary/10 rounded-full">
												<DollarSign className="h-4 w-4 text-primary" />
											</div>
											<div>
												<p className="font-medium">
													{formatCurrency(donation.amount || 0)}
												</p>
												<p className="text-sm text-muted-foreground">
													{donation.donor?.firstName} {donation.donor?.lastName}
												</p>
											</div>
										</div>
										<div className="text-right">
											<p className="text-sm font-medium capitalize">
												{donation.type.toLowerCase()}
											</p>
											<p className="text-xs text-muted-foreground">
												{new Date(donation.createdAt).toLocaleDateString()}
											</p>
										</div>
									</div>
								))}
								{recentDonations.length === 0 && (
									<p className="text-center text-muted-foreground py-4">
										No recent donations
									</p>
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="causes">
					<Card>
						<CardHeader>
							<div className="flex justify-between items-center">
								<CardTitle>Your Causes</CardTitle>
								<Button onClick={() => router.push("/dashboard/causes/create")}>
									Create New Cause
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{causes?.map((cause) => (
									<div
										key={cause.id}
										className="flex items-center justify-between p-4 border rounded-lg"
									>
										<div>
											<h3 className="font-medium">{cause.title}</h3>
											<p className="text-sm text-muted-foreground">
												{cause.description}
											</p>
										</div>
										<div className="text-right">
											<p className="font-medium">
												{formatCurrency(cause.raisedAmount)} /{" "}
												{formatCurrency(cause.targetAmount)}
											</p>
											<p className="text-sm text-muted-foreground">
												{cause.acceptedDonationTypes.join(", ")}
											</p>
										</div>
									</div>
								))}
								{(!causes || causes.length === 0) && (
									<p className="text-center text-muted-foreground py-4">
										No causes created yet
									</p>
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="campaigns">
					<Card>
						<CardHeader>
							<div className="flex justify-between items-center">
								<CardTitle>Your Campaigns</CardTitle>
								<Button
									onClick={() => router.push("/dashboard/campaigns/create")}
								>
									Create New Campaign
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{campaigns?.map((campaign) => (
									<div
										key={campaign.id}
										className="flex items-center justify-between p-4 border rounded-lg"
									>
										<div>
											<h3 className="font-medium">{campaign.title}</h3>
											<p className="text-sm text-muted-foreground">
												{campaign.description}
											</p>
										</div>
										<div className="text-right">
											<p className="font-medium capitalize">
												{campaign.status}
											</p>
											<p className="text-sm text-muted-foreground">
												{new Date(campaign.startDate).toLocaleDateString()} -{" "}
												{new Date(campaign.endDate).toLocaleDateString()}
											</p>
										</div>
									</div>
								))}
								{(!campaigns || campaigns.length === 0) && (
									<p className="text-center text-muted-foreground py-4">
										No campaigns created yet
									</p>
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="donations">
					<Card>
						<CardHeader>
							<CardTitle>Donation History</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{donations?.map((donation) => (
									<div
										key={donation.id}
										className="flex items-center justify-between p-4 border rounded-lg"
									>
										<div className="flex items-center space-x-4">
											<div className="p-2 bg-primary/10 rounded-full">
												<DollarSign className="h-4 w-4 text-primary" />
											</div>
											<div>
												<p className="font-medium">
													{formatCurrency(donation.amount || 0)}
												</p>
												<p className="text-sm text-muted-foreground">
													{donation.donor?.firstName} {donation.donor?.lastName}
												</p>
											</div>
										</div>
										<div className="text-right">
											<p className="font-medium capitalize">
												{donation.type.toLowerCase()}
											</p>
											<p className="text-sm text-muted-foreground">
												{new Date(donation.createdAt).toLocaleDateString()}
											</p>
											<p className="text-xs text-muted-foreground capitalize">
												{donation.status.toLowerCase()}
											</p>
										</div>
									</div>
								))}
								{(!donations || donations.length === 0) && (
									<p className="text-center text-muted-foreground py-4">
										No donations received yet
									</p>
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
