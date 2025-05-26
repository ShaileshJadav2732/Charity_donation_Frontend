"use client";

import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { keyframes } from "@mui/system";

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  speedX: number;
  speedY: number;
  rotationSpeed: number;
}

const confettiColors = [
  "#287068", // Primary green
  "#4ade80", // Light green
  "#fbbf24", // Yellow
  "#f87171", // Red
  "#a78bfa", // Purple
  "#60a5fa", // Blue
  "#fb7185", // Pink
  "#34d399", // Emerald
];

const ConfettiAnimation: React.FC<{ duration?: number; particleCount?: number }> = ({
  duration = 3000,
  particleCount = 100,
}) => {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    // Generate initial particles
    const initialParticles: ConfettiParticle[] = Array.from(
      { length: particleCount },
      (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -10,
        rotation: Math.random() * 360,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        size: Math.random() * 8 + 4,
        speedX: (Math.random() - 0.5) * 4,
        speedY: Math.random() * 3 + 2,
        rotationSpeed: (Math.random() - 0.5) * 10,
      })
    );

    setParticles(initialParticles);

    // Animation loop
    const animationInterval = setInterval(() => {
      setParticles((prevParticles) =>
        prevParticles
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.speedX,
            y: particle.y + particle.speedY,
            rotation: particle.rotation + particle.rotationSpeed,
            speedY: particle.speedY + 0.1, // Gravity effect
          }))
          .filter((particle) => particle.y < window.innerHeight + 50)
      );
    }, 16); // ~60fps

    // Stop animation after duration
    const stopTimer = setTimeout(() => {
      setIsActive(false);
      clearInterval(animationInterval);
    }, duration);

    return () => {
      clearInterval(animationInterval);
      clearTimeout(stopTimer);
    };
  }, [duration, particleCount]);

  if (!isActive) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9998,
        overflow: "hidden",
      }}
    >
      {particles.map((particle) => (
        <Box
          key={particle.id}
          sx={{
            position: "absolute",
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            borderRadius: "2px",
            opacity: 0.8,
          }}
        />
      ))}
    </Box>
  );
};

export default ConfettiAnimation;
