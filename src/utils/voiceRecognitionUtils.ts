/**
 * Utility functions for voice recognition troubleshooting and setup
 */

export interface VoiceRecognitionStatus {
	isSupported: boolean;
	isHTTPS: boolean;
	hasMicrophonePermission: boolean | null;
	browserName: string;
	errors: string[];
	recommendations: string[];
}

/**
 * Check comprehensive voice recognition status
 */
export const checkVoiceRecognitionStatus = async (): Promise<VoiceRecognitionStatus> => {
	const status: VoiceRecognitionStatus = {
		isSupported: false,
		isHTTPS: false,
		hasMicrophonePermission: null,
		browserName: getBrowserName(),
		errors: [],
		recommendations: [],
	};

	// Check browser support
	status.isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
	if (!status.isSupported) {
		status.errors.push("Speech recognition is not supported in this browser");
		status.recommendations.push("Use Chrome, Edge, or Safari for voice recognition");
	}

	// Check HTTPS
	status.isHTTPS = location.protocol === 'https:' || location.hostname === 'localhost';
	if (!status.isHTTPS) {
		status.errors.push("Voice recognition requires HTTPS connection");
		status.recommendations.push("Access the site using https:// instead of http://");
	}

	// Check microphone permission
	try {
		const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
		status.hasMicrophonePermission = permissionStatus.state === 'granted';
		
		if (permissionStatus.state === 'denied') {
			status.errors.push("Microphone permission is denied");
			status.recommendations.push("Click the microphone icon in the address bar and allow access");
		} else if (permissionStatus.state === 'prompt') {
			status.recommendations.push("You will be prompted for microphone permission when you start voice recognition");
		}
	} catch (error) {
		// Fallback: try to access microphone directly
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			stream.getTracks().forEach(track => track.stop());
			status.hasMicrophonePermission = true;
		} catch (micError) {
			status.hasMicrophonePermission = false;
			status.errors.push("Cannot access microphone");
			status.recommendations.push("Check microphone permissions and hardware connection");
		}
	}

	return status;
};

/**
 * Get browser name for compatibility checking
 */
export const getBrowserName = (): string => {
	const userAgent = navigator.userAgent;
	
	if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
		return 'Chrome';
	} else if (userAgent.includes('Edg')) {
		return 'Edge';
	} else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
		return 'Safari';
	} else if (userAgent.includes('Firefox')) {
		return 'Firefox';
	} else {
		return 'Unknown';
	}
};

/**
 * Get browser compatibility level for voice recognition
 */
export const getBrowserCompatibility = (browserName: string): 'excellent' | 'good' | 'limited' | 'unsupported' => {
	switch (browserName) {
		case 'Chrome':
			return 'excellent';
		case 'Edge':
			return 'excellent';
		case 'Safari':
			return 'limited';
		case 'Firefox':
			return 'unsupported';
		default:
			return 'unsupported';
	}
};

/**
 * Get user-friendly error messages for speech recognition errors
 */
export const getSpeechRecognitionErrorMessage = (error: string): string => {
	const errorMessages: Record<string, string> = {
		'not-allowed': 'Microphone access denied. Please allow microphone permissions and try again.',
		'no-speech': 'No speech detected. Please try speaking again.',
		'audio-capture': 'No microphone found. Please check your microphone connection.',
		'network': 'Network error. Please check your internet connection.',
		'service-not-allowed': 'Speech recognition service not allowed. Please use HTTPS.',
		'aborted': 'Speech recognition was stopped.',
		'language-not-supported': 'Language not supported. Please try English.',
		'bad-grammar': 'Grammar error in speech recognition.',
	};

	return errorMessages[error] || `Speech recognition error: ${error}. Please try again.`;
};

/**
 * Get setup instructions based on current environment
 */
export const getSetupInstructions = async (): Promise<string[]> => {
	const status = await checkVoiceRecognitionStatus();
	const instructions: string[] = [];

	if (!status.isHTTPS) {
		instructions.push("1. Access the site using HTTPS (https://) instead of HTTP");
	}

	if (!status.isSupported) {
		instructions.push("2. Use a supported browser (Chrome or Edge recommended)");
	}

	if (status.hasMicrophonePermission === false) {
		instructions.push("3. Allow microphone access when prompted");
		instructions.push("4. Click the microphone icon in the browser address bar if needed");
	}

	if (instructions.length === 0) {
		instructions.push("✅ Your setup looks good! You should be able to use voice recognition.");
	}

	return instructions;
};

/**
 * Test microphone access
 */
export const testMicrophoneAccess = async (): Promise<{ success: boolean; error?: string }> => {
	try {
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		stream.getTracks().forEach(track => track.stop());
		return { success: true };
	} catch (error: any) {
		return { 
			success: false, 
			error: error.name === 'NotAllowedError' 
				? 'Microphone permission denied' 
				: 'Microphone access failed'
		};
	}
};

/**
 * Format voice recognition status for display
 */
export const formatStatusForDisplay = (status: VoiceRecognitionStatus): {
	overall: 'ready' | 'issues' | 'blocked';
	message: string;
	details: string[];
} => {
	if (status.errors.length === 0) {
		return {
			overall: 'ready',
			message: '✅ Voice recognition is ready to use!',
			details: ['All requirements are met', 'You can start using voice commands'],
		};
	}

	if (status.errors.length > 2 || !status.isSupported) {
		return {
			overall: 'blocked',
			message: '❌ Voice recognition cannot be used',
			details: status.errors,
		};
	}

	return {
		overall: 'issues',
		message: '⚠️ Voice recognition has some issues',
		details: status.errors.concat(status.recommendations),
	};
};
