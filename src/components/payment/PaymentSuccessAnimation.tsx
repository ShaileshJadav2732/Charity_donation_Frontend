"use client";

import {
	CheckCircle as CheckCircleIcon,
	Favorite as HeartIcon,
	Home as HomeIcon,
	Receipt as ReceiptIcon,
	Share as ShareIcon,
} from "@mui/icons-material";
import {
	Box,
	Button,
	Card,
	CardContent,
	Fade,
	IconButton,
	Slide,
	Typography,
	Zoom,
} from "@mui/material";
import { keyframes } from "@mui/system";
import React, { useEffect, useState } from "react";

interface PaymentSuccessAnimationProps {
	donationData: {
		amount: number;
		causeName: string;
		organizationName: string;
		donationId: string;
	};
	onClose: () => void;
	onDownloadReceipt?: () => void;
	onViewDonations?: () => void;
	onGoHome?: () => void;
}

// Keyframe animations
const bounceIn = keyframes`
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const heartBeat = keyframes`
  0% {
    transform: scale(1);
  }
  14% {
    transform: scale(1.3);
  }
  28% {
    transform: scale(1);
  }
  42% {
    transform: scale(1.3);
  }
  70% {
    transform: scale(1);
  }
`;

const confettiDrop = keyframes`
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
`;

const slideInUp = keyframes`
  0% {
    transform: translateY(100px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(40, 112, 104, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(40, 112, 104, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(40, 112, 104, 0);
  }
`;

const PaymentSuccessAnimation: React.FC<PaymentSuccessAnimationProps> = ({
	donationData,
	onClose,
	onDownloadReceipt,
	onViewDonations,
	onGoHome,
}) => {
	const [showContent, setShowContent] = useState(false);
	const [showButtons, setShowButtons] = useState(false);
	const [confetti, setConfetti] = useState<
		Array<{ id: number; left: number; delay: number }>
	>([]);

	useEffect(() => {
		// Generate confetti particles
		const confettiArray = Array.from({ length: 50 }, (_, i) => ({
			id: i,
			left: Math.random() * 100,
			delay: Math.random() * 3,
		}));
		setConfetti(confettiArray);

		// Stagger animations
		const timer1 = setTimeout(() => setShowContent(true), 500);
		const timer2 = setTimeout(() => setShowButtons(true), 1500);

		return () => {
			clearTimeout(timer1);
			clearTimeout(timer2);
		};
	}, []);

	return (
		<Box
			sx={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: "rgba(0, 0, 0, 0.8)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				zIndex: 9999,
				overflow: "hidden",
			}}
		>
			{/* Confetti Animation */}
			{confetti.map((particle) => (
				<Box
					key={particle.id}
					sx={{
						position: "absolute",
						left: `${particle.left}%`,
						top: "-10px",
						width: "10px",
						height: "10px",
						backgroundColor: [
							"#287068",
							"#4ade80",
							"#fbbf24",
							"#f87171",
							"#a78bfa",
						][particle.id % 5],
						animation: `${confettiDrop} 3s linear infinite`,
						animationDelay: `${particle.delay}s`,
						borderRadius: "2px",
					}}
				/>
			))}

			<Fade in timeout={1000}>
				<Card
					sx={{
						maxWidth: 500,
						width: "90%",
						textAlign: "center",
						borderRadius: 4,
						overflow: "visible",
						position: "relative",
						background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
						boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
					}}
				>
					<CardContent sx={{ p: 4 }}>
						{/* Success Icon */}
						<Zoom in timeout={800}>
							<Box
								sx={{
									display: "flex",
									justifyContent: "center",
									mb: 3,
									animation: `${bounceIn} 1s ease-out`,
								}}
							>
								<CheckCircleIcon
									sx={{
										fontSize: 80,
										color: "#287068",
										animation: `${pulse} 2s infinite`,
									}}
								/>
							</Box>
						</Zoom>

						{/* Success Message */}
						<Slide direction="up" in={showContent} timeout={600}>
							<Box>
								<Typography
									variant="h4"
									sx={{
										fontWeight: 700,
										color: "#287068",
										mb: 1,
										animation: `${slideInUp} 0.8s ease-out`,
									}}
								>
									Payment Successful!
								</Typography>

								<Typography
									variant="h6"
									sx={{
										color: "text.secondary",
										mb: 3,
										animation: `${slideInUp} 0.8s ease-out 0.2s both`,
									}}
								>
									Thank you for your generous donation!
									<HeartIcon
										sx={{
											color: "#f87171",
											ml: 1,
											animation: `${heartBeat} 1.5s ease-in-out infinite`,
										}}
									/>
								</Typography>

								{/* Donation Details */}
								<Box
									sx={{
										backgroundColor: "#f0fdfa",
										borderRadius: 2,
										p: 3,
										mb: 3,
										border: "2px solid #287068",
										animation: `${slideInUp} 0.8s ease-out 0.4s both`,
									}}
								>
									<Typography
										variant="h5"
										sx={{ fontWeight: 600, color: "#287068", mb: 1 }}
									>
										${donationData.amount.toFixed(2)}
									</Typography>
									<Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
										To: {donationData.causeName}
									</Typography>
									<Typography
										variant="body2"
										color="text.secondary"
										sx={{ mb: 1 }}
									>
										Organization: {donationData.organizationName}
									</Typography>
									<Typography variant="caption" color="text.secondary">
										Donation ID: {donationData.donationId}
									</Typography>
								</Box>

								{/* Impact Message */}
								<Box
									sx={{
										backgroundColor: "#fef3c7",
										borderRadius: 2,
										p: 2,
										mb: 3,
										animation: `${slideInUp} 0.8s ease-out 0.6s both`,
									}}
								>
									<Typography
										variant="body2"
										sx={{ fontStyle: "italic", color: "#92400e" }}
									>
										"Your donation will make a real difference in someone's
										life. Thank you for being a part of positive change!"
									</Typography>
								</Box>
							</Box>
						</Slide>

						{/* Action Buttons */}
						<Fade in={showButtons} timeout={800}>
							<Box
								sx={{
									display: "flex",
									flexDirection: "column",
									gap: 2,
									mt: 3,
								}}
							>
								<Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
									{onDownloadReceipt && (
										<Button
											variant="contained"
											startIcon={<ReceiptIcon />}
											onClick={onDownloadReceipt}
											sx={{
												backgroundColor: "#287068",
												"&:hover": { backgroundColor: "#1f5a52" },
												borderRadius: 2,
												px: 3,
											}}
										>
											Download Receipt
										</Button>
									)}

									<IconButton
										onClick={() => {
											navigator.share?.({
												title: "I just made a donation!",
												text: `I donated $${donationData.amount} to ${donationData.causeName}`,
												url: window.location.href,
											});
										}}
										sx={{
											backgroundColor: "#287068",
											color: "white",
											"&:hover": { backgroundColor: "#1f5a52" },
										}}
									>
										<ShareIcon />
									</IconButton>
								</Box>

								<Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
									{onViewDonations && (
										<Button
											variant="outlined"
											onClick={onViewDonations}
											sx={{
												borderColor: "#287068",
												color: "#287068",
												"&:hover": {
													borderColor: "#1f5a52",
													backgroundColor: "#f0fdfa",
												},
											}}
										>
											View My Donations
										</Button>
									)}

									{onGoHome && (
										<Button
											variant="outlined"
											startIcon={<HomeIcon />}
											onClick={onGoHome}
											sx={{
												borderColor: "#287068",
												color: "#287068",
												"&:hover": {
													borderColor: "#1f5a52",
													backgroundColor: "#f0fdfa",
												},
											}}
										>
											Go Home
										</Button>
									)}
								</Box>

								<Button
									variant="text"
									onClick={onClose}
									sx={{
										color: "text.secondary",
										mt: 1,
										"&:hover": { backgroundColor: "transparent" },
									}}
								>
									Close
								</Button>
							</Box>
						</Fade>
					</CardContent>
				</Card>
			</Fade>
		</Box>
	);
};

export default PaymentSuccessAnimation;
