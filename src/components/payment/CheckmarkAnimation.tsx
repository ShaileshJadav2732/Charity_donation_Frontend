"use client";

import React from "react";
import { Box } from "@mui/material";
import { keyframes } from "@mui/system";

const drawCheckmark = keyframes`
  0% {
    stroke-dashoffset: 100;
  }
  100% {
    stroke-dashoffset: 0;
  }
`;

const scaleIn = keyframes`
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
`;

const CheckmarkAnimation: React.FC<{ size?: number; color?: string }> = ({
  size = 80,
  color = "#287068",
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        animation: `${scaleIn} 0.6s ease-out`,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={{
          filter: "drop-shadow(0 4px 8px rgba(40, 112, 104, 0.3))",
        }}
      >
        {/* Circle background */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill={color}
          stroke="none"
          style={{
            animation: `${scaleIn} 0.5s ease-out`,
          }}
        />
        
        {/* Checkmark */}
        <path
          d="M25 50 L40 65 L75 30"
          fill="none"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="100"
          strokeDashoffset="100"
          style={{
            animation: `${drawCheckmark} 0.8s ease-out 0.3s forwards`,
          }}
        />
      </svg>
    </Box>
  );
};

export default CheckmarkAnimation;
