"use client";

import React, { useState, useRef, useEffect } from "react";
import {
	Box,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Typography,
	CircularProgress,
	Alert,
	Card,
	CardContent,
	Chip,
	IconButton,
	LinearProgress,
} from "@mui/material";
import {
	Mic,
	MicOff,
	VolumeUp,
	Close,
	CheckCircle,
	Error as ErrorIcon,
} from "@mui/icons-material";
import { toast } from "react-hot-toast";
import { useProcessVoiceCommandMutation } from "@/store/api/voiceCommandApi";

interface VoiceCommand {
	type: "MONEY" | "ITEMS";
	amount?: number;
	itemType?: string;
	quantity?: number;
	unit?: string;
	description?: string;
	confidence: number;

	// Contact Information
	contactPhone?: string;
	contactEmail?: string;
	donorName?: string;

	// Address Information
	address?: {
		street?: string;
		city?: string;
		state?: string;
		zipCode?: string;
		country?: string;
	};

	// Delivery/Pickup Information
	isPickup?: boolean;
	scheduledDate?: string;
	scheduledTime?: string;
	deliveryInstructions?: string;
}

interface VoiceToDonateButtonProps {
	onVoiceCommand: (command: VoiceCommand) => void;
	disabled?: boolean;
}

const VoiceToDonateButton: React.FC<VoiceToDonateButtonProps> = ({
	onVoiceCommand,
	disabled = false,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isListening, setIsListening] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [transcript, setTranscript] = useState("");
	const [parsedCommand, setParsedCommand] = useState<VoiceCommand | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [audioLevel, setAudioLevel] = useState(0);

	const [processVoiceCommand] = useProcessVoiceCommandMutation();
	const recognitionRef = useRef<SpeechRecognition | null>(null);
	const audioContextRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
	const animationRef = useRef<number | null>(null);

	// Check if browser supports speech recognition
	const isSpeechRecognitionSupported = () => {
		return "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
	};

	// Check if HTTPS is enabled
	const isHTTPS = () => {
		return location.protocol === "https:" || location.hostname === "localhost";
	};

	// Force start speech recognition (bypass permission check)
	const forceStartListening = () => {
		if (!recognitionRef.current) return;

		setTranscript("");
		setParsedCommand(null);
		setError(null);
		setIsListening(true);

		try {
			recognitionRef.current.start();
		} catch (error: any) {
			setError("Failed to start speech recognition: " + error.message);
			setIsListening(false);
		}
	};

	// Initialize speech recognition
	useEffect(() => {
		if (!isSpeechRecognitionSupported()) {
			setError(
				"Speech recognition is not supported in this browser. Please use Chrome or Edge."
			);
			return;
		}

		if (!isHTTPS()) {
			setError(
				"Speech recognition requires HTTPS connection. Please use https:// or localhost."
			);
			return;
		}

		const SpeechRecognition =
			window.SpeechRecognition || window.webkitSpeechRecognition;
		recognitionRef.current = new SpeechRecognition();

		if (recognitionRef.current) {
			recognitionRef.current.continuous = false;
			recognitionRef.current.interimResults = true;
			recognitionRef.current.lang = "en-US";

			recognitionRef.current.onstart = () => {
				setIsListening(true);
				setError(null);
			};

			recognitionRef.current.onresult = (event) => {
				let finalTranscript = "";
				let interimTranscript = "";

				for (let i = event.resultIndex; i < event.results.length; i++) {
					const transcript = event.results[i][0].transcript;
					if (event.results[i].isFinal) {
						finalTranscript += transcript;
					} else {
						interimTranscript += transcript;
					}
				}

				setTranscript(finalTranscript || interimTranscript);

				if (finalTranscript) {
					processVoiceCommandWithAI(finalTranscript);
				}
			};

			recognitionRef.current.onerror = (event) => {
				let errorMessage = `Speech recognition error: ${event.error}`;

				switch (event.error) {
					case "not-allowed":
						errorMessage =
							"Microphone access was denied. Please click the microphone icon in your browser's address bar and select 'Allow', then try again.";
						break;
					case "no-speech":
						errorMessage =
							"No speech detected. Please speak clearly and try again.";
						break;
					case "audio-capture":
						errorMessage =
							"Cannot access microphone. Please check your microphone connection and permissions.";
						break;
					case "network":
						errorMessage =
							"Network error occurred. Please check your internet connection.";
						break;
					case "service-not-allowed":
						errorMessage =
							"Speech recognition service not allowed. Please ensure you're using HTTPS.";
						break;
					case "aborted":
						errorMessage = "Speech recognition was stopped. You can try again.";
						break;
					default:
						errorMessage = `Speech recognition error: ${event.error}. Please try again.`;
				}

				setError(errorMessage);
				setIsListening(false);
			};

			recognitionRef.current.onend = () => {
				setIsListening(false);
				stopAudioVisualization();
			};
		}

		return () => {
			if (recognitionRef.current) {
				recognitionRef.current.abort();
			}
			stopAudioVisualization();
		};
	}, []);

	// Start audio visualization
	const startAudioVisualization = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			audioContextRef.current = new AudioContext();
			analyserRef.current = audioContextRef.current.createAnalyser();
			microphoneRef.current =
				audioContextRef.current.createMediaStreamSource(stream);

			microphoneRef.current.connect(analyserRef.current);
			analyserRef.current.fftSize = 256;

			const bufferLength = analyserRef.current.frequencyBinCount;
			const dataArray = new Uint8Array(bufferLength);

			const updateAudioLevel = () => {
				if (analyserRef.current) {
					analyserRef.current.getByteFrequencyData(dataArray);
					const average = dataArray.reduce((a, b) => a + b) / bufferLength;
					setAudioLevel(average / 255);
					animationRef.current = requestAnimationFrame(updateAudioLevel);
				}
			};

			updateAudioLevel();
		} catch (error) {
			console.error("Error accessing microphone:", error);
		}
	};

	// Stop audio visualization
	const stopAudioVisualization = () => {
		if (animationRef.current) {
			cancelAnimationFrame(animationRef.current);
		}
		if (audioContextRef.current) {
			audioContextRef.current.close();
		}
		setAudioLevel(0);
	};

	// Process voice command using ONLY AI backend service
	const processVoiceCommandWithAI = async (text: string) => {
		setIsProcessing(true);
		try {
			const response = await processVoiceCommand({ text }).unwrap();
			const command = response.data.command;
			setParsedCommand(command);

			// Auto-apply if enabled and confidence is good (20% threshold)
			if (autoApply && command && command.confidence >= 0.2) {
				setTimeout(() => {
					handleConfirm();
				}, 1000); // Small delay to show the command first
			}
		} catch (error: any) {
			// No fallback - show error to user
			setError(
				`AI processing failed: ${
					error.data?.message ||
					error.message ||
					"Please check your Groq API configuration"
				}`
			);
		} finally {
			setIsProcessing(false);
		}
	};

	const startListening = async () => {
		if (!recognitionRef.current) return;

		setTranscript("");
		setParsedCommand(null);
		setError(null);

		try {
			// Start speech recognition directly - let it handle permissions
			recognitionRef.current.start();
			// Start audio visualization after speech recognition starts
			setTimeout(() => {
				startAudioVisualization();
			}, 100);
		} catch (error: any) {
			if (error.name === "InvalidStateError") {
				setError(
					"Speech recognition is already running. Please wait and try again."
				);
			} else {
				setError("Failed to start speech recognition. Please try again.");
			}
			console.error("Speech recognition start error:", error);
		}
	};

	const stopListening = () => {
		if (recognitionRef.current) {
			recognitionRef.current.stop();
		}
		stopAudioVisualization();
	};

	const handleConfirm = () => {
		if (parsedCommand) {
			onVoiceCommand(parsedCommand);
			setIsOpen(false);
			toast.success("Voice command applied to donation form!");
		}
	};

	const handleClose = () => {
		stopListening();
		setIsOpen(false);
		setTranscript("");
		setParsedCommand(null);
		setError(null);
	};

	if (!isSpeechRecognitionSupported()) {
		return null;
	}

	return (
		<>
			<Button
				variant="outlined"
				startIcon={<Mic />}
				onClick={() => setIsOpen(true)}
				disabled={disabled}
				sx={{
					borderColor: "#287068",
					color: "#287068",
					"&:hover": {
						borderColor: "#2f8077",
						backgroundColor: "rgba(40, 112, 104, 0.04)",
					},
				}}
			>
				Voice Donate
			</Button>

			<Dialog
				open={isOpen}
				onClose={handleClose}
				maxWidth="sm"
				fullWidth
				PaperProps={{
					sx: {
						borderRadius: 3,
						minHeight: 400,
					},
				}}
			>
				<DialogTitle sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					<VolumeUp sx={{ color: "#287068" }} />
					<Typography component="span" variant="h6" sx={{ flex: 1 }}>
						Voice-to-Donate
					</Typography>
					<IconButton onClick={handleClose} size="small">
						<Close />
					</IconButton>
				</DialogTitle>

				<DialogContent>
					<Box sx={{ textAlign: "center", mb: 3 }}>
						<Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
							Speak naturally to make a donation
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Try: "Donate 500 rupees" or "Give 2 kg of clothes"
						</Typography>

						{/* Permission Test Button */}
						<Button
							size="small"
							variant="text"
							onClick={async () => {
								try {
									const stream = await navigator.mediaDevices.getUserMedia({
										audio: true,
									});
									stream.getTracks().forEach((track) => track.stop());
									toast.success("✅ Microphone permission granted!");
								} catch (error: any) {
									let errorMessage = "❌ Microphone permission denied";
									if (error.name === "NotFoundError") {
										errorMessage =
											"❌ No microphone found. Please connect a microphone.";
									}
									toast.error(errorMessage);
								}
							}}
							sx={{ mt: 1, fontSize: "0.75rem", color: "#287068" }}
						>
							🔧 Test Microphone Permission
						</Button>
					</Box>

					{/* Microphone Button */}
					<Box sx={{ textAlign: "center", mb: 3 }}>
						<Button
							variant={isListening ? "contained" : "outlined"}
							onClick={isListening ? stopListening : forceStartListening}
							disabled={isProcessing}
							sx={{
								width: 120,
								height: 120,
								borderRadius: "50%",
								backgroundColor: isListening ? "#287068" : "transparent",
								borderColor: "#287068",
								color: isListening ? "white" : "#287068",
								transform: `scale(${1 + audioLevel * 0.3})`,
								transition: "all 0.1s ease",
								"&:hover": {
									backgroundColor: isListening
										? "#2f8077"
										: "rgba(40, 112, 104, 0.04)",
								},
							}}
						>
							{isListening ? <MicOff size={40} /> : <Mic size={40} />}
						</Button>
					</Box>

					{/* Audio Level Indicator */}
					{isListening && (
						<Box sx={{ mb: 2 }}>
							<LinearProgress
								variant="determinate"
								value={audioLevel * 100}
								sx={{
									height: 8,
									borderRadius: 4,
									backgroundColor: "rgba(40, 112, 104, 0.1)",
									"& .MuiLinearProgress-bar": {
										backgroundColor: "#287068",
									},
								}}
							/>
						</Box>
					)}

					{/* Status */}
					{isListening && (
						<Alert severity="info" sx={{ mb: 2 }}>
							<Typography variant="body2">
								🎤 Listening... Speak your donation request
							</Typography>
						</Alert>
					)}

					{isProcessing && (
						<Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
							<CircularProgress size={20} />
							<Typography variant="body2">
								Processing your voice command...
							</Typography>
						</Box>
					)}

					{/* Transcript */}
					{transcript && (
						<Card sx={{ mb: 2, backgroundColor: "rgba(40, 112, 104, 0.05)" }}>
							<CardContent>
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{ mb: 1 }}
								>
									You said:
								</Typography>
								<Typography variant="body1" sx={{ fontStyle: "italic" }}>
									"{transcript}"
								</Typography>
							</CardContent>
						</Card>
					)}

					{/* Parsed Command */}
					{parsedCommand && (
						<Card sx={{ mb: 2, border: "2px solid #287068" }}>
							<CardContent>
								<Box
									sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
								>
									<CheckCircle sx={{ color: "success.main" }} />
									<Typography variant="h6">Command Understood</Typography>
									<Chip
										label={`${Math.round(
											parsedCommand.confidence * 100
										)}% confident`}
										size="small"
										color="success"
									/>
								</Box>

								<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
									<Chip label={`Type: ${parsedCommand.type}`} />
									{parsedCommand.amount && (
										<Chip label={`Amount: ₹${parsedCommand.amount}`} />
									)}
									{parsedCommand.quantity && (
										<Chip
											label={`Quantity: ${parsedCommand.quantity} ${parsedCommand.unit}`}
										/>
									)}
									{parsedCommand.itemType && (
										<Chip label={`Item: ${parsedCommand.itemType}`} />
									)}
								</Box>
							</CardContent>
						</Card>
					)}

					{/* Error */}
					{error && (
						<Alert severity="error" sx={{ mb: 2 }}>
							<Box
								sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
							>
								<ErrorIcon />
								<Typography variant="body2">{error}</Typography>
							</Box>
							{error.includes("denied") && (
								<Box sx={{ mt: 1 }}>
									<Typography
										variant="body2"
										sx={{ fontSize: "0.8rem", color: "text.secondary" }}
									>
										💡 <strong>How to fix:</strong> Look for the microphone icon
										(🎤) in your browser's address bar and click "Allow"
									</Typography>
									<Button
										size="small"
										variant="outlined"
										onClick={() => {
											setError(null);
											forceStartListening();
										}}
										sx={{ mt: 1, fontSize: "0.75rem" }}
									>
										Try Again
									</Button>
								</Box>
							)}
						</Alert>
					)}
				</DialogContent>

				<DialogActions sx={{ p: 3, gap: 2 }}>
					<Button onClick={handleClose} variant="outlined">
						Cancel
					</Button>
					<Button
						onClick={handleConfirm}
						variant="contained"
						disabled={!parsedCommand || parsedCommand.confidence < 0.6}
						sx={{
							backgroundColor: "#287068",
							"&:hover": { backgroundColor: "#2f8077" },
						}}
					>
						Apply to Form
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default VoiceToDonateButton;
