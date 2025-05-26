"use client";

import React, { useState } from "react";
import { Box, Button, Typography, Card, CardContent } from "@mui/material";
import PaymentSuccessAnimation from "./PaymentSuccessAnimation";
import ConfettiAnimation from "./ConfettiAnimation";
import CheckmarkAnimation from "./CheckmarkAnimation";

const PaymentAnimationDemo: React.FC = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);

  const mockDonationData = {
    amount: 100,
    causeName: "Education for Rural Children",
    organizationName: "Hope Foundation",
    donationId: "DON-2024-001",
  };

  const handleTestSuccess = () => {
    setShowConfetti(true);
    setShowSuccess(true);
  };

  const handleTestCheckmark = () => {
    setShowCheckmark(true);
    setTimeout(() => setShowCheckmark(false), 3000);
  };

  const handleTestConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: "center", mb: 4 }}>
        Payment Success Animations Demo
      </Typography>

      {/* Confetti Animation */}
      {showConfetti && <ConfettiAnimation duration={4000} particleCount={100} />}

      {/* Success Animation Modal */}
      {showSuccess && (
        <PaymentSuccessAnimation
          donationData={mockDonationData}
          onClose={() => {
            setShowSuccess(false);
            setShowConfetti(false);
          }}
          onDownloadReceipt={() => {
            console.log("Download receipt clicked");
          }}
          onViewDonations={() => {
            console.log("View donations clicked");
            setShowSuccess(false);
            setShowConfetti(false);
          }}
          onGoHome={() => {
            console.log("Go home clicked");
            setShowSuccess(false);
            setShowConfetti(false);
          }}
        />
      )}

      {/* Demo Controls */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test Individual Animations
          </Typography>
          
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
            <Button
              variant="contained"
              onClick={handleTestSuccess}
              sx={{ backgroundColor: "#287068" }}
            >
              Full Success Animation
            </Button>
            
            <Button
              variant="outlined"
              onClick={handleTestConfetti}
              sx={{ borderColor: "#287068", color: "#287068" }}
            >
              Confetti Only
            </Button>
            
            <Button
              variant="outlined"
              onClick={handleTestCheckmark}
              sx={{ borderColor: "#287068", color: "#287068" }}
            >
              Checkmark Only
            </Button>
          </Box>

          {/* Checkmark Demo */}
          {showCheckmark && (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <CheckmarkAnimation size={100} color="#287068" />
              <Typography variant="h6" sx={{ mt: 2, color: "#287068" }}>
                Payment Successful!
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Features List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Animation Features
          </Typography>
          
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              🎉 <strong>Confetti Animation:</strong> Colorful particles falling from top
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              ✅ <strong>Success Checkmark:</strong> Animated SVG checkmark with scale effect
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              💖 <strong>Heartbeat Effect:</strong> Pulsing heart icon for emotional connection
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              📱 <strong>Responsive Design:</strong> Works on all screen sizes
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              🎨 <strong>Smooth Transitions:</strong> Fade, slide, and zoom animations
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              🔗 <strong>Action Buttons:</strong> Download receipt, view donations, share
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              🎯 <strong>Donation Details:</strong> Shows amount, cause, and organization
            </Typography>
            <Typography component="li" variant="body2">
              ⚡ <strong>Performance Optimized:</strong> Lightweight and smooth animations
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            How to Use in Your Payment Flow
          </Typography>
          
          <Box component="pre" sx={{ 
            backgroundColor: "#f5f5f5", 
            p: 2, 
            borderRadius: 1, 
            overflow: "auto",
            fontSize: "0.875rem"
          }}>
{`// In your payment success handler:
const handlePaymentSuccess = (donationResult) => {
  setShowConfetti(true);
  setShowSuccessAnimation(true);
  setDonationResult(donationResult);
};

// In your JSX:
{showConfetti && <ConfettiAnimation />}
{showSuccessAnimation && (
  <PaymentSuccessAnimation
    donationData={{
      amount: donationResult.amount,
      causeName: donationResult.causeName,
      organizationName: donationResult.organizationName,
      donationId: donationResult.id,
    }}
    onClose={() => {
      setShowSuccessAnimation(false);
      setShowConfetti(false);
      // Navigate or call parent success handler
    }}
  />
)}`}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentAnimationDemo;
