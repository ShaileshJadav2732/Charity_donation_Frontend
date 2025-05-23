"use client";

import { motion } from "framer-motion";
import { FiCheckCircle } from "react-icons/fi";

interface SuccessAnimationProps {
	title?: string;
	message?: string;
	onComplete?: () => void;
	duration?: number;
}

export default function SuccessAnimation({
	title = "Success!",
	message = "Operation completed successfully",
	onComplete,
	duration = 3000,
}: SuccessAnimationProps) {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.5 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.5 }}
			transition={{ duration: 0.5, ease: "easeOut" }}
			className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
			onAnimationComplete={() => {
				if (onComplete) {
					setTimeout(onComplete, duration);
				}
			}}
		>
			<motion.div
				initial={{ y: 50, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ delay: 0.2, duration: 0.5 }}
				className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4 text-center"
			>
				{/* Success Icon with Animation */}
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ delay: 0.3, duration: 0.6, type: "spring", stiffness: 200 }}
					className="mb-6"
				>
					<div className="relative">
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ delay: 0.5, duration: 0.4 }}
							className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
						>
							<FiCheckCircle className="w-10 h-10 text-green-600" />
						</motion.div>
						
						{/* Ripple Effect */}
						<motion.div
							initial={{ scale: 0, opacity: 0.8 }}
							animate={{ scale: 2, opacity: 0 }}
							transition={{ delay: 0.6, duration: 1 }}
							className="absolute inset-0 bg-green-200 rounded-full"
						/>
					</div>
				</motion.div>

				{/* Title */}
				<motion.h2
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.7, duration: 0.5 }}
					className="text-2xl font-bold text-gray-900 mb-3"
				>
					{title}
				</motion.h2>

				{/* Message */}
				<motion.p
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.8, duration: 0.5 }}
					className="text-gray-600 mb-6"
				>
					{message}
				</motion.p>

				{/* Confetti Animation */}
				<div className="absolute inset-0 pointer-events-none">
					{[...Array(12)].map((_, i) => (
						<motion.div
							key={i}
							initial={{ 
								y: 0, 
								x: 0, 
								opacity: 0,
								rotate: 0 
							}}
							animate={{ 
								y: [-20, -60, 20], 
								x: [0, Math.random() * 40 - 20, Math.random() * 80 - 40],
								opacity: [0, 1, 0],
								rotate: [0, 180, 360]
							}}
							transition={{ 
								delay: 0.9 + i * 0.1, 
								duration: 2,
								ease: "easeOut"
							}}
							className={`absolute w-2 h-2 rounded-full ${
								i % 4 === 0 ? 'bg-green-400' :
								i % 4 === 1 ? 'bg-blue-400' :
								i % 4 === 2 ? 'bg-yellow-400' : 'bg-pink-400'
							}`}
							style={{
								left: `${20 + (i % 4) * 20}%`,
								top: `${30 + (i % 3) * 15}%`,
							}}
						/>
					))}
				</div>

				{/* Progress Bar */}
				<motion.div
					initial={{ width: 0 }}
					animate={{ width: "100%" }}
					transition={{ delay: 1, duration: duration / 1000 }}
					className="h-1 bg-green-500 rounded-full mt-4"
				/>
			</motion.div>
		</motion.div>
	);
}
